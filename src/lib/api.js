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
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
    )
    const data = await response.json()
    
    return (data.results || []).map(movie => ({
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
    return []
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
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
    )
    const data = await response.json()
    
    return (data.results || []).map(show => ({
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
    return []
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

    const data = await response.json()
    igdbAccessToken = data.access_token
    // Token expires in data.expires_in seconds, set expiry 5 minutes before
    igdbTokenExpiry = Date.now() + (data.expires_in - 300) * 1000
    
    return igdbAccessToken
  } catch (error) {
    console.error('Error getting IGDB access token:', error)
    return null
  }
}

export const searchGames = async (query) => {
  const token = await getIGDBAccessToken()
  if (!token) {
    return []
  }

  try {
    const response = await fetch(`${IGDB_BASE_URL}/games`, {
      method: 'POST',
      headers: {
        'Client-ID': IGDB_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `search "${query}"; fields id,name,first_release_date,cover,summary; limit 20;`,
    })

    const games = await response.json()
    
    return games.map(game => {
      const coverUrl = game.cover 
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null

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

