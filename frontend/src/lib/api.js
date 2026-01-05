// API integration for searching media

// TMDB API for Movies and TV Shows
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || ''
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

// Open Library API for Books (no key needed)
const OPEN_LIBRARY_BASE = 'https://openlibrary.org'

// IGDB API for Games (requires Twitch OAuth)
const IGDB_CLIENT_ID = import.meta.env.VITE_IGDB_CLIENT_ID || ''
const IGDB_CLIENT_SECRET = import.meta.env.VITE_IGDB_CLIENT_SECRET || ''
const IGDB_BASE_URL = 'https://api.igdb.com/v4'
// CORS proxy for development (optional - remove in production or use your own backend)
const CORS_PROXY = import.meta.env.VITE_CORS_PROXY || ''

// Helper to get TMDB image URL
export const getTMDBImageUrl = (path) => {
  if (!path) return null
  return path.startsWith('http') ? path : `${TMDB_IMAGE_BASE}${path}`
}

// Search Movies
export const searchMovies = async (query) => {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not set. Please add VITE_TMDB_API_KEY to your .env file')
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=1`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('TMDB API Error:', response.status, errorData)
      throw new Error(`API Error: ${response.status} - ${errorData.status_message || 'Unknown error'}`)
    }
    
    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      console.log('No results found for query:', query)
      return []
    }
    
    return data.results.map(movie => ({
      media_type: 'movie',
      media_id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster_url: getTMDBImageUrl(movie.poster_path),
      overview: movie.overview,
      rating: movie.vote_average,
    }))
  } catch (error) {
    console.error('Error searching movies:', error)
    throw error // Re-throw to let the caller handle it
  }
}

// Search TV Shows
export const searchTVShows = async (query) => {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not set. Please add VITE_TMDB_API_KEY to your .env file')
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=1`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('TMDB API Error:', response.status, errorData)
      throw new Error(`API Error: ${response.status} - ${errorData.status_message || 'Unknown error'}`)
    }
    
    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      console.log('No results found for query:', query)
      return []
    }
    
    return data.results.map(show => ({
      media_type: 'tv_show',
      media_id: show.id.toString(),
      title: show.name,
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      poster_url: getTMDBImageUrl(show.poster_path),
      overview: show.overview,
      rating: show.vote_average,
    }))
  } catch (error) {
    console.error('Error searching TV shows:', error)
    throw error // Re-throw to let the caller handle it
  }
}

// Search Books (Open Library)
export const searchBooks = async (query) => {
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&limit=20`
    )
    const data = await response.json()
    
    return (data.docs || []).map(book => {
      const coverId = book.cover_i
      const posterUrl = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : null
      
      return {
        media_type: 'book',
        media_id: book.key?.replace('/works/', '') || book.key || Math.random().toString(),
        title: book.title,
        year: book.first_publish_year || null,
        poster_url: posterUrl,
        overview: book.first_sentence?.[0] || null,
        author: book.author_name?.[0] || 'Unknown Author',
      }
    })
  } catch (error) {
    console.error('Error searching books:', error)
    return []
  }
}

// Search Games (IGDB) - Note: Requires OAuth token
let igdbAccessToken = null
let igdbTokenExpiry = null

const getIGDBAccessToken = async () => {
  // Check if we have a valid token
  if (igdbAccessToken && igdbTokenExpiry && Date.now() < igdbTokenExpiry) {
    return igdbAccessToken
  }

  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
    console.warn('IGDB credentials not set. Please add VITE_IGDB_CLIENT_ID and VITE_IGDB_CLIENT_SECRET to your .env file')
    return null
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: IGDB_CLIENT_ID,
        client_secret: IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Twitch OAuth Error:', response.status, errorData)
      throw new Error(`Failed to get access token: ${response.status} - ${errorData.message || 'Invalid credentials'}`)
    }

    const data = await response.json()
    
    if (!data.access_token) {
      console.error('No access token in response:', data)
      throw new Error('No access token received from Twitch')
    }
    
    igdbAccessToken = data.access_token
    // Token expires in data.expires_in seconds, set expiry 5 minutes before
    igdbTokenExpiry = Date.now() + (data.expires_in - 300) * 1000
    
    return igdbAccessToken
  } catch (error) {
    console.error('Error getting IGDB access token:', error)
    throw error // Re-throw to show the actual error
  }
}

export const searchGames = async (query) => {
  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
    console.warn('IGDB credentials not set. Please add VITE_IGDB_CLIENT_ID and VITE_IGDB_CLIENT_SECRET to your .env file')
    return []
  }

  let token
  try {
    token = await getIGDBAccessToken()
    if (!token) {
      console.error('Failed to get IGDB access token. Check your credentials.')
      return []
    }
  } catch (error) {
    console.error('Error getting IGDB token:', error)
    throw error // Re-throw to show the actual error
  }

  try {
    // Check if CORS proxy is configured
    const useProxy = CORS_PROXY && CORS_PROXY.trim() !== ''
    const targetUrl = `${IGDB_BASE_URL}/games`
    
    let apiUrl, fetchOptions
    
    if (useProxy) {
      // Use local proxy server - send request details in body
      apiUrl = CORS_PROXY
      console.log('Using CORS proxy:', apiUrl, 'for target:', targetUrl)
      
      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          method: 'POST',
          headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain',
          },
          body: `search "${query}"; fields id,name,first_release_date,cover.image_id,summary; limit 20;`,
        }),
      }
    } else {
      // Direct request (will fail due to CORS, but we'll catch it)
      apiUrl = targetUrl
      fetchOptions = {
        method: 'POST',
        headers: {
          'Client-ID': IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
          'Accept': 'application/json',
        },
        body: `search "${query}"; fields id,name,first_release_date,cover.image_id,summary; limit 20;`,
      }
    }
    
    const response = await fetch(apiUrl, fetchOptions)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('IGDB API Error:', response.status, errorText)
      throw new Error(`IGDB API Error: ${response.status} - ${errorText}`)
    }

    // Handle response - proxy returns JSON with the data, direct returns array
    let games
    if (useProxy) {
      const proxyResponse = await response.json()
      // Proxy might return data in different formats
      if (Array.isArray(proxyResponse)) {
        games = proxyResponse
      } else if (proxyResponse.data && Array.isArray(proxyResponse.data)) {
        games = proxyResponse.data
      } else if (proxyResponse.contents) {
        // Some proxies return contents as string
        games = typeof proxyResponse.contents === 'string' 
          ? JSON.parse(proxyResponse.contents) 
          : proxyResponse.contents
      } else {
        games = proxyResponse
      }
    } else {
      games = await response.json()
    }
    
    // Ensure games is an array
    if (!Array.isArray(games)) {
      console.error('Unexpected response format:', games)
      games = []
    }
    
    if (!games || games.length === 0) {
      console.log('No games found for query:', query)
      return []
    }
    
    return games.map(game => {
      // Handle cover - it can be a number (cover ID) or an object with image_id
      let coverUrl = null
      if (game.cover) {
        if (typeof game.cover === 'number') {
          coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover}.jpg`
        } else if (game.cover.image_id) {
          coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        }
      }

      return {
        media_type: 'game',
        media_id: game.id.toString(),
        title: game.name,
        year: game.first_release_date 
          ? new Date(game.first_release_date * 1000).getFullYear() 
          : null,
        poster_url: coverUrl,
        overview: game.summary || null,
      }
    })
  } catch (error) {
    console.error('Error searching games:', error)
    // Check if it's a network/CORS error
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError')) {
      if (useProxy) {
        throw new Error(`Failed to connect to proxy server at ${CORS_PROXY}. Make sure the proxy server is running (node proxy-server.js) and the URL is correct.`)
      } else {
        throw new Error('IGDB API is not accessible from the browser due to CORS restrictions. Please set up a backend proxy or use a CORS proxy service.')
      }
    }
    throw error // Re-throw to let the caller handle it
  }
}

// Get Trending Movies
export const getTrendingMovies = async () => {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not set')
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/day`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }
    )
    
    if (!response.ok) {
      console.error('TMDB API Error:', response.status)
      return []
    }
    
    const data = await response.json()
    return (data.results || []).slice(0, 20).map(movie => ({
      media_type: 'movie',
      media_id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster_url: getTMDBImageUrl(movie.poster_path),
      overview: movie.overview,
      rating: movie.vote_average,
    }))
  } catch (error) {
    console.error('Error fetching trending movies:', error)
    return []
  }
}

// Get Trending TV Shows
export const getTrendingTVShows = async () => {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not set')
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/day`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }
    )
    
    if (!response.ok) {
      console.error('TMDB API Error:', response.status)
      return []
    }
    
    const data = await response.json()
    return (data.results || []).slice(0, 20).map(show => ({
      media_type: 'tv_show',
      media_id: show.id.toString(),
      title: show.name,
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      poster_url: getTMDBImageUrl(show.poster_path),
      overview: show.overview,
      rating: show.vote_average,
    }))
  } catch (error) {
    console.error('Error fetching trending TV shows:', error)
    return []
  }
}

// Get Popular TV Shows
export const getPopularTVShows = async () => {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not set')
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }
    )
    
    if (!response.ok) {
      console.error('TMDB API Error:', response.status)
      return []
    }
    
    const data = await response.json()
    return (data.results || []).slice(0, 20).map(show => ({
      media_type: 'tv_show',
      media_id: show.id.toString(),
      title: show.name,
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      poster_url: getTMDBImageUrl(show.poster_path),
      overview: show.overview,
      rating: show.vote_average,
    }))
  } catch (error) {
    console.error('Error fetching popular TV shows:', error)
    return []
  }
}

// Get Popular Movies
export const getPopularMovies = async () => {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not set')
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }
    )
    
    if (!response.ok) {
      console.error('TMDB API Error:', response.status)
      return []
    }
    
    const data = await response.json()
    return (data.results || []).slice(0, 20).map(movie => ({
      media_type: 'movie',
      media_id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster_url: getTMDBImageUrl(movie.poster_path),
      overview: movie.overview,
      rating: movie.vote_average,
    }))
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    return []
  }
}

// Universal search function
export const searchMedia = async (query, mediaType) => {
  switch (mediaType) {
    case 'movie':
      return await searchMovies(query)
    case 'tv_show':
      return await searchTVShows(query)
    case 'book':
      return await searchBooks(query)
    case 'game':
      return await searchGames(query)
    default:
      return []
  }
}

// Get recommendations based on media type
export const getRecommendations = async (mediaType) => {
  switch (mediaType) {
    case 'movie':
      return await getTrendingMovies()
    case 'tv_show':
      return await getPopularTVShows()
    case 'book':
    case 'game':
      return [] // Books and games don't have TMDB recommendations
    default:
      return []
  }
}

// Get detailed movie information
export const getMovieDetails = async (movieId) => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key not set')
  }

  try {
    const [detailsResponse, creditsResponse, watchProvidersResponse, externalIdsResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/external_ids`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      })
    ])

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text()
      throw new Error(`Failed to fetch movie details: ${detailsResponse.status} - ${errorText}`)
    }

    const details = await detailsResponse.json()
    const credits = creditsResponse.ok ? await creditsResponse.json() : { cast: [], crew: [] }
    const watchProviders = watchProvidersResponse.ok ? await watchProvidersResponse.json() : { results: {} }
    const externalIds = externalIdsResponse.ok ? await externalIdsResponse.json() : { imdb_id: null }

    return {
      ...details,
      poster_url: getTMDBImageUrl(details.poster_path),
      backdrop_url: getTMDBImageUrl(details.backdrop_path),
      cast: credits.cast?.slice(0, 10) || [],
      crew: credits.crew?.slice(0, 5) || [],
      watchProviders: watchProviders.results?.US || {},
      imdb_id: externalIds.imdb_id,
      media_type: 'movie'
    }
  } catch (error) {
    console.error('Error fetching movie details:', error)
    throw error
  }
}

// Get detailed book information (Open Library)
export const getBookDetails = async (workId) => {
  try {
    // Open Library uses work keys in format /works/OL123456W
    // If the ID doesn't start with /works/, add it
    const workKey = workId.startsWith('/works/') ? workId : `/works/${workId}`
    
    const response = await fetch(`${OPEN_LIBRARY_BASE}${workKey}.json`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book details: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Fetch author information - try multiple methods, starting with most reliable
    let authors = []
    
    // Helper function to fetch author name from author key
    const fetchAuthorName = async (authorKey) => {
      if (!authorKey) return null
      try {
        // Handle different key formats: /authors/OL123A, authors/OL123A, OL123A
        let key = authorKey
        if (!key.startsWith('/')) {
          // If it starts with 'authors/', add leading slash, otherwise add /authors/
          key = key.startsWith('authors/') ? `/${key}` : `/authors/${key}`
        }
        const authorResponse = await fetch(`${OPEN_LIBRARY_BASE}${key}.json`)
        if (authorResponse.ok) {
          const authorData = await authorResponse.json()
          return authorData.name || null
        }
      } catch (err) {
        console.warn('Error fetching author:', err, authorKey)
      }
      return null
    }
    
    // Method 1: Try editions endpoint first (most reliable for author info)
    if (data.key) {
      try {
        const editionsResponse = await fetch(`${OPEN_LIBRARY_BASE}${data.key}/editions.json?limit=5`)
        if (editionsResponse.ok) {
          const editionsData = await editionsResponse.json()
          if (editionsData.entries && editionsData.entries.length > 0) {
            // Try each edition until we get author info
            for (const edition of editionsData.entries) {
              if (edition.authors && edition.authors.length > 0) {
                const authorPromises = edition.authors.slice(0, 5).map(async (author) => {
                  let authorKey = null
                  if (typeof author === 'string') {
                    authorKey = author
                  } else if (author.key) {
                    authorKey = author.key
                  } else if (author.author && author.author.key) {
                    authorKey = author.author.key
                  }
                  return authorKey ? await fetchAuthorName(authorKey) : null
                })
                const fetchedAuthors = (await Promise.all(authorPromises)).filter(Boolean)
                if (fetchedAuthors.length > 0) {
                  authors = fetchedAuthors
                  break // Stop once we get authors
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching editions:', err)
      }
    }
    
    // Method 2: Try work's authors array
    if (authors.length === 0 && data.authors && data.authors.length > 0) {
      try {
        const authorPromises = data.authors.slice(0, 5).map(async (author) => {
          let authorKey = null
          if (typeof author === 'string') {
            authorKey = author
          } else if (author.key) {
            authorKey = author.key
          } else if (author.author && author.author.key) {
            authorKey = author.author.key
          }
          return authorKey ? await fetchAuthorName(authorKey) : null
        })
        authors = (await Promise.all(authorPromises)).filter(Boolean)
      } catch (err) {
        console.warn('Error processing work authors:', err)
      }
    }
    
    // Method 3: Check if author_name exists directly in work data
    if (authors.length === 0) {
      if (data.author_name) {
        if (Array.isArray(data.author_name)) {
          authors = data.author_name.slice(0, 5)
        } else if (typeof data.author_name === 'string') {
          authors = [data.author_name]
        }
      }
    }
    
    // Get cover image
    let coverUrl = null
    if (data.covers && data.covers.length > 0) {
      coverUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
    } else if (data.cover_id) {
      coverUrl = `https://covers.openlibrary.org/b/id/${data.cover_id}-L.jpg`
    }
    
    // Get description - try different fields
    let description = null
    if (data.description) {
      if (typeof data.description === 'string') {
        description = data.description
      } else if (data.description.value) {
        description = data.description.value
      }
    }
    
    // Format author string
    let authorString = 'Unknown Author'
    if (authors.length > 0) {
      authorString = authors.join(', ')
    } else if (data.authors && data.authors.length > 0) {
      // Last resort: try to extract from author keys
      const authorKeys = data.authors.map(a => {
        const key = typeof a === 'string' ? a : a.key
        if (key) {
          // Extract readable name from key like /authors/OL123456A -> OL123456A
          const match = key.match(/\/([^\/]+)$/)
          return match ? match[1] : key.replace(/\/authors\//, '')
        }
        return null
      }).filter(Boolean)
      
      if (authorKeys.length > 0) {
        authorString = authorKeys.join(', ')
      }
    }
    
    return {
      id: workId,
      title: data.title || 'Unknown Title',
      author: authorString,
      authors: authors,
      year: data.first_publish_date ? new Date(data.first_publish_date).getFullYear() : 
            data.publish_date ? new Date(data.publish_date).getFullYear() : null,
      publish_date: data.first_publish_date || data.publish_date || null,
      description: description || data.first_sentence || null,
      poster_url: coverUrl,
      subjects: data.subjects?.slice(0, 10) || [],
      subject_places: data.subject_places || [],
      subject_times: data.subject_times || [],
      key: workKey,
      media_type: 'book'
    }
  } catch (error) {
    console.error('Error fetching book details:', error)
    throw error
  }
}

// Get detailed TV show information
export const getTVShowDetails = async (tvId) => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key not set')
  }

  try {
    const [detailsResponse, creditsResponse, watchProvidersResponse, externalIdsResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/tv/${tvId}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }),
      fetch(`${TMDB_BASE_URL}/tv/${tvId}/credits`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }),
      fetch(`${TMDB_BASE_URL}/tv/${tvId}/watch/providers`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      }),
      fetch(`${TMDB_BASE_URL}/tv/${tvId}/external_ids`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'accept': 'application/json',
        }
      })
    ])

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text()
      throw new Error(`Failed to fetch TV show details: ${detailsResponse.status} - ${errorText}`)
    }

    const details = await detailsResponse.json()
    const credits = creditsResponse.ok ? await creditsResponse.json() : { cast: [], crew: [] }
    const watchProviders = watchProvidersResponse.ok ? await watchProvidersResponse.json() : { results: {} }
    const externalIds = externalIdsResponse.ok ? await externalIdsResponse.json() : { imdb_id: null }

    return {
      ...details,
      poster_url: getTMDBImageUrl(details.poster_path),
      backdrop_url: getTMDBImageUrl(details.backdrop_path),
      cast: credits.cast?.slice(0, 10) || [],
      crew: credits.crew?.slice(0, 5) || [],
      watchProviders: watchProviders.results?.US || {},
      imdb_id: externalIds.imdb_id,
      media_type: 'tv_show'
    }
  } catch (error) {
    console.error('Error fetching TV show details:', error)
    throw error
  }
}

// Get detailed game information (IGDB)
export const getGameDetails = async (gameId) => {
  const token = await getIGDBAccessToken()
  if (!token) {
    throw new Error('IGDB credentials not set. Please add VITE_IGDB_CLIENT_ID and VITE_IGDB_CLIENT_SECRET to your .env file')
  }

  try {
    // Fetch game details with multiple related data
    const gameQuery = `fields id,name,summary,first_release_date,cover,genres,platforms,rating,rating_count,aggregated_rating,aggregated_rating_count,storyline,websites,developers,publishers; where id = ${gameId};`
    
    const response = await fetch(`${IGDB_BASE_URL}/games`, {
      method: 'POST',
      headers: {
        'Client-ID': IGDB_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: gameQuery,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch game details: ${response.status}`)
    }

    const games = await response.json()
    
    if (!games || games.length === 0) {
      throw new Error('Game not found')
    }

    const game = games[0]

    // Get cover image URL
    const coverUrl = game.cover 
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : null

    // Fetch genre names if genres exist
    let genreNames = []
    if (game.genres && game.genres.length > 0) {
      try {
        const genreIds = game.genres.join(',')
        const genreQuery = `fields name; where id = (${genreIds});`
        const genreResponse = await fetch(`${IGDB_BASE_URL}/genres`, {
          method: 'POST',
          headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain',
          },
          body: genreQuery,
        })
        if (genreResponse.ok) {
          const genres = await genreResponse.json()
          genreNames = genres.map(g => ({ id: g.id, name: g.name }))
        }
      } catch (err) {
        console.warn('Error fetching genres:', err)
      }
    }

    // Fetch platform names if platforms exist
    let platformNames = []
    if (game.platforms && game.platforms.length > 0) {
      try {
        const platformIds = game.platforms.join(',')
        const platformQuery = `fields name,abbreviation; where id = (${platformIds});`
        const platformResponse = await fetch(`${IGDB_BASE_URL}/platforms`, {
          method: 'POST',
          headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain',
          },
          body: platformQuery,
        })
        if (platformResponse.ok) {
          const platforms = await platformResponse.json()
          platformNames = platforms.map(p => ({ id: p.id, name: p.name, abbreviation: p.abbreviation }))
        }
      } catch (err) {
        console.warn('Error fetching platforms:', err)
      }
    }

    // Fetch developer names if developers exist
    let developerNames = []
    if (game.developers && game.developers.length > 0) {
      try {
        const developerIds = game.developers.join(',')
        const developerQuery = `fields name; where id = (${developerIds});`
        const developerResponse = await fetch(`${IGDB_BASE_URL}/companies`, {
          method: 'POST',
          headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain',
          },
          body: developerQuery,
        })
        if (developerResponse.ok) {
          const developers = await developerResponse.json()
          developerNames = developers.map(d => d.name)
        }
      } catch (err) {
        console.warn('Error fetching developers:', err)
      }
    }

    // Fetch publisher names if publishers exist
    let publisherNames = []
    if (game.publishers && game.publishers.length > 0) {
      try {
        const publisherIds = game.publishers.join(',')
        const publisherQuery = `fields name; where id = (${publisherIds});`
        const publisherResponse = await fetch(`${IGDB_BASE_URL}/companies`, {
          method: 'POST',
          headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain',
          },
          body: publisherQuery,
        })
        if (publisherResponse.ok) {
          const publishers = await publisherResponse.json()
          publisherNames = publishers.map(p => p.name)
        }
      } catch (err) {
        console.warn('Error fetching publishers:', err)
      }
    }

    // Get website URLs
    let websiteUrls = {}
    if (game.websites && game.websites.length > 0) {
      try {
        const websiteIds = game.websites.join(',')
        const websiteQuery = `fields category,url; where id = (${websiteIds});`
        const websiteResponse = await fetch(`${IGDB_BASE_URL}/websites`, {
          method: 'POST',
          headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain',
          },
          body: websiteQuery,
        })
        if (websiteResponse.ok) {
          const websites = await websiteResponse.json()
          websites.forEach(ws => {
            // Category 1 = official, 2 = wikia, 3 = wikipedia, 4 = facebook, etc.
            if (ws.category === 1) {
              websiteUrls.official = ws.url
            } else if (ws.category === 3) {
              websiteUrls.wikipedia = ws.url
            }
          })
        }
      } catch (err) {
        console.warn('Error fetching websites:', err)
      }
    }

    return {
      id: game.id,
      title: game.name,
      year: game.first_release_date 
        ? new Date(game.first_release_date * 1000).getFullYear() 
        : null,
      first_release_date: game.first_release_date 
        ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
        : null,
      poster_url: coverUrl,
      overview: game.summary || game.storyline || null,
      description: game.summary || game.storyline || null,
      genres: genreNames,
      platforms: platformNames,
      developers: developerNames,
      publishers: publisherNames,
      rating: game.rating ? (game.rating / 10).toFixed(1) : null, // IGDB rating is 0-100, convert to 0-10
      rating_count: game.rating_count || null,
      aggregated_rating: game.aggregated_rating ? (game.aggregated_rating / 10).toFixed(1) : null,
      aggregated_rating_count: game.aggregated_rating_count || null,
      websiteUrls: websiteUrls,
      media_type: 'game'
    }
  } catch (error) {
    console.error('Error fetching game details:', error)
    throw error
  }
}

