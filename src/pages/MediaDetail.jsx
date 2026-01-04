import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMovieDetails, getTVShowDetails, getBookDetails, getGameDetails } from '../lib/api'
import { useLibrary } from '../contexts/LibraryContext'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import toast from 'react-hot-toast'
import '../App.css'

// Map provider names to their website URLs
const getProviderUrl = (providerName) => {
  const providerMap = {
    'Netflix': 'https://www.netflix.com',
    'Amazon Prime Video': 'https://www.amazon.com/prime',
    'Hulu': 'https://www.hulu.com',
    'Disney Plus': 'https://www.disneyplus.com',
    'HBO Max': 'https://www.max.com',
    'Apple TV Plus': 'https://tv.apple.com',
    'Paramount Plus': 'https://www.paramountplus.com',
    'Peacock': 'https://www.peacocktv.com',
    'YouTube': 'https://www.youtube.com',
    'YouTube Premium': 'https://www.youtube.com/premium',
    'Vudu': 'https://www.vudu.com',
    'Google Play Movies': 'https://play.google.com/store/movies',
    'iTunes': 'https://www.apple.com/itunes',
    'Microsoft Store': 'https://www.microsoft.com/en-us/store/movies-and-tv',
    'Amazon Video': 'https://www.amazon.com/prime',
    'Amazon': 'https://www.amazon.com/prime',
    'Starz': 'https://www.starz.com',
    'Showtime': 'https://www.sho.com',
    'Crackle': 'https://www.crackle.com',
    'Tubi': 'https://tubitv.com',
    'Pluto TV': 'https://pluto.tv',
    'Crunchyroll': 'https://www.crunchyroll.com',
    'Funimation': 'https://www.funimation.com',
    'fuboTV': 'https://www.fubo.tv',
    'Sling TV': 'https://www.sling.com',
    'DIRECTV': 'https://www.directv.com',
    'AMC Plus': 'https://www.amcplus.com',
    'Epix': 'https://www.epix.com',
    'MGM Plus': 'https://www.mgmplus.com',
  }

  // Try exact match first
  if (providerMap[providerName]) {
    return providerMap[providerName]
  }

  // Try case-insensitive match
  const lowerName = providerName.toLowerCase()
  for (const [key, value] of Object.entries(providerMap)) {
    if (key.toLowerCase() === lowerName) {
      return value
    }
  }

  // Fallback: search Google for the provider
  return `https://www.google.com/search?q=${encodeURIComponent(providerName + ' streaming')}`
}

function MediaDetail() {
  const { mediaType, mediaId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { library, addToLibrary, removeFromLibrary, isInLibrary, updateRating } = useLibrary()
  
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('Fetching details for:', mediaType, mediaId)
        let data
        if (mediaType === 'movie') {
          data = await getMovieDetails(mediaId)
        } else if (mediaType === 'tv_show') {
          data = await getTVShowDetails(mediaId)
        } else if (mediaType === 'book') {
          data = await getBookDetails(mediaId)
        } else if (mediaType === 'game') {
          data = await getGameDetails(mediaId)
        } else {
          throw new Error(`Invalid media type: ${mediaType}`)
        }
        console.log('Details fetched:', data)
        setDetails(data)
      } catch (err) {
        console.error('Error fetching details:', err)
        setError(err.message || 'Failed to load media details')
        toast.error(`Failed to load details: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    if (mediaId && mediaType) {
      fetchDetails()
    } else {
      setError('Missing media ID or type')
      setLoading(false)
    }
  }, [mediaId, mediaType])

  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRating, setSelectedRating] = useState(null)

  const handleAddToLibrary = () => {
    if (!user) {
      toast.error('Please sign in or sign up to add items to your library', {
        duration: 5000,
        icon: '🔒',
      })
      navigate('/')
      return
    }

    // Show rating modal instead of adding directly
    setShowRatingModal(true)
    setSelectedRating(null)
  }

  const handleRatingSubmit = async () => {
    const mediaItem = {
      media_type: details.media_type,
      media_id: details.id.toString(),
      title: details.title || details.name,
      year: details.release_date ? new Date(details.release_date).getFullYear() : 
            details.first_air_date ? new Date(details.first_air_date).getFullYear() :
            details.first_release_date ? new Date(details.first_release_date).getFullYear() :
            details.year || details.publish_date ? new Date(details.publish_date || details.year).getFullYear() : null,
      poster_url: details.poster_url,
      overview: details.overview || details.description,
      rating: details.vote_average || details.rating || details.aggregated_rating,
    }

    const result = await addToLibrary(mediaItem, selectedRating)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Added ${mediaItem.title} to your library!${selectedRating ? ` (Rated ${selectedRating}/10)` : ''}`)
      setShowRatingModal(false)
      setSelectedRating(null)
    }
  }

  const handleSkipRating = async () => {
    const mediaItem = {
      media_type: details.media_type,
      media_id: details.id.toString(),
      title: details.title || details.name,
      year: details.release_date ? new Date(details.release_date).getFullYear() : 
            details.first_air_date ? new Date(details.first_air_date).getFullYear() :
            details.first_release_date ? new Date(details.first_release_date).getFullYear() :
            details.year || details.publish_date ? new Date(details.publish_date || details.year).getFullYear() : null,
      poster_url: details.poster_url,
      overview: details.overview || details.description,
      rating: details.vote_average || details.rating || details.aggregated_rating,
    }

    const result = await addToLibrary(mediaItem, null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Added ${mediaItem.title} to your library!`)
      setShowRatingModal(false)
      setSelectedRating(null)
    }
  }

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = []
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive && onStarClick ? () => onStarClick(i) : undefined}
          style={interactive ? { cursor: 'pointer' } : {}}
        >
          ★
        </span>
      )
    }
    return stars
  }

  const handleRemoveFromLibrary = async () => {
    const libraryItem = library.find(item => 
      item.media_type === details.media_type && 
      item.media_id === details.id.toString()
    )
    
    if (libraryItem) {
      const result = await removeFromLibrary(libraryItem.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Removed ${details.title || details.name} from your library`)
      }
    }
  }

  const inLibrary = details ? isInLibrary(details.media_type, details.id.toString()) : false

  if (loading) {
    return (
      <div className="page-container" style={{ minHeight: '100vh', background: 'var(--color-off-white)' }}>
        <Header />
        <div className="page-header">
        </div>
        <div className="page-content" style={{ textAlign: 'center', padding: 'var(--space-5xl)' }}>
          <div className="loading-spinner" style={{ fontSize: '1.5rem', color: 'var(--color-black)' }}>
            Loading media details...
          </div>
          <p style={{ marginTop: 'var(--space-md)', color: 'var(--color-gray-dark)' }}>
            Fetching information for {mediaType} ID: {mediaId}
          </p>
        </div>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="page-header">
          <h1 className="page-title">Error</h1>
        </div>
        <div className="page-content" style={{ textAlign: 'center', padding: 'var(--space-5xl)' }}>
          <p style={{ color: 'var(--color-gray-dark)', marginBottom: 'var(--space-lg)' }}>
            {error || 'Media not found'}
          </p>
          <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: 'var(--space-xl)' }}>
            Media Type: {mediaType}, ID: {mediaId}
          </p>
          <button className="btn-primary" onClick={() => navigate(-1)} style={{ marginTop: 'var(--space-lg)' }}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!details && !loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="page-header">
          <h1 className="page-title">Not Found</h1>
        </div>
        <div className="page-content" style={{ textAlign: 'center', padding: 'var(--space-5xl)' }}>
          <p style={{ color: 'var(--color-gray-dark)' }}>Media not found</p>
          <button className="btn-primary" onClick={() => navigate(-1)} style={{ marginTop: 'var(--space-lg)' }}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const title = details.title || details.name
  const releaseDate = details.release_date || details.first_air_date || details.first_release_date || details.publish_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : (details.year || null)

  return (
    <div className="media-detail-page">
      <button className="media-detail-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      
      <div className="page-container">
        <div className="media-detail-content">
          <div className="media-detail-main">
            {/* Poster */}
            <div className="media-detail-poster">
              {details.poster_url ? (
                <img src={details.poster_url} alt={title} />
              ) : (
                <div className="media-poster-fallback" style={{ width: '100%', height: '100%' }}>
                  {mediaType === 'movie' ? '🎬' : mediaType === 'tv_show' ? '📺' : mediaType === 'book' ? '📖' : mediaType === 'game' ? '🎮' : '📦'}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="media-detail-info">
              <h1 className="media-detail-title">{title}</h1>
              
              <div className="media-detail-meta">
                {year && <span className="meta-item">{year}</span>}
                {details.author && <span className="meta-item">by {details.author}</span>}
                {details.developers && details.developers.length > 0 && (
                  <span className="meta-item">by {details.developers.join(', ')}</span>
                )}
                {details.runtime && <span className="meta-item">{details.runtime} min</span>}
                {details.number_of_seasons && (
                  <span className="meta-item">{details.number_of_seasons} Season{details.number_of_seasons !== 1 ? 's' : ''}</span>
                )}
                {details.genres && details.genres.length > 0 && (
                  <div className="genres-list">
                    {details.genres.map(genre => (
                      <span key={genre.id || genre} className="genre-tag">
                        {typeof genre === 'string' ? genre : genre.name}
                      </span>
                    ))}
                  </div>
                )}
                {details.subjects && details.subjects.length > 0 && (
                  <div className="genres-list">
                    {details.subjects.slice(0, 8).map((subject, index) => (
                      <span key={index} className="genre-tag">{subject}</span>
                    ))}
                  </div>
                )}
                {details.platforms && details.platforms.length > 0 && (
                  <div className="genres-list">
                    <span className="meta-item" style={{ marginRight: '8px' }}>Platforms:</span>
                    {details.platforms.map(platform => (
                      <span key={platform.id || platform} className="genre-tag">
                        {typeof platform === 'string' ? platform : platform.name}
                      </span>
                    ))}
                  </div>
                )}
                {details.publishers && details.publishers.length > 0 && (
                  <div className="genres-list">
                    <span className="meta-item" style={{ marginRight: '8px' }}>Publisher{details.publishers.length > 1 ? 's' : ''}:</span>
                    {details.publishers.map((publisher, index) => (
                      <span key={index} className="genre-tag">{publisher}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ratings */}
              {(details.vote_average || details.rating || details.aggregated_rating || details.imdb_id || details.key || details.websiteUrls) && (
                <div className="media-detail-ratings">
                  {details.vote_average && (
                    <div className="rating-item">
                      <span className="rating-label">TMDB</span>
                      <span className="rating-value">⭐ {details.vote_average?.toFixed(1)}/10</span>
                    </div>
                  )}
                  {details.rating && mediaType === 'game' && (
                    <div className="rating-item">
                      <span className="rating-label">IGDB Rating</span>
                      <span className="rating-value">⭐ {details.rating}/10</span>
                      {details.rating_count && (
                        <span className="rating-count">({details.rating_count} ratings)</span>
                      )}
                    </div>
                  )}
                  {details.aggregated_rating && mediaType === 'game' && (
                    <div className="rating-item">
                      <span className="rating-label">Critic Rating</span>
                      <span className="rating-value">⭐ {details.aggregated_rating}/10</span>
                      {details.aggregated_rating_count && (
                        <span className="rating-count">({details.aggregated_rating_count} reviews)</span>
                      )}
                    </div>
                  )}
                  {details.imdb_id && (
                    <div className="rating-item">
                      <span className="rating-label">IMDB</span>
                      <a 
                        href={`https://www.imdb.com/title/${details.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rating-link"
                      >
                        View on IMDB →
                      </a>
                    </div>
                  )}
                  {details.key && mediaType === 'book' && (
                    <div className="rating-item">
                      <span className="rating-label">Open Library</span>
                      <a 
                        href={`https://openlibrary.org${details.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rating-link"
                      >
                        View on Open Library →
                      </a>
                    </div>
                  )}
                  {details.websiteUrls?.official && mediaType === 'game' && (
                    <div className="rating-item">
                      <span className="rating-label">Official Site</span>
                      <a 
                        href={details.websiteUrls.official}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rating-link"
                      >
                        Visit Website →
                      </a>
                    </div>
                  )}
                  {details.websiteUrls?.wikipedia && mediaType === 'game' && (
                    <div className="rating-item">
                      <span className="rating-label">Wikipedia</span>
                      <a 
                        href={details.websiteUrls.wikipedia}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rating-link"
                      >
                        View on Wikipedia →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Overview */}
              {(details.overview || details.description) && (
                <div className="media-detail-overview">
                  <h3>{mediaType === 'book' ? 'Description' : mediaType === 'game' ? 'About' : 'Overview'}</h3>
                  <p>{details.overview || details.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="media-detail-actions">
                {inLibrary ? (
                  <button className="btn-secondary" onClick={handleRemoveFromLibrary}>
                    Remove from Archive
                  </button>
                ) : (
                  <button className="btn-primary" onClick={handleAddToLibrary}>
                    + Add to Archive
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rating Modal */}
          {showRatingModal && (
            <div className="modal-overlay" onClick={() => { setShowRatingModal(false); setSelectedRating(null); }}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => { setShowRatingModal(false); setSelectedRating(null); }}>×</button>
                <h2 className="modal-title">Rate This {details.media_type === 'movie' ? 'Movie' : details.media_type === 'tv_show' ? 'TV Show' : details.media_type === 'book' ? 'Book' : 'Game'}</h2>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                    {details.title || details.name}
                  </h3>
                  {details.poster_url && (
                    <img 
                      src={details.poster_url} 
                      alt={details.title || details.name}
                      style={{ width: '150px', height: 'auto', borderRadius: '12px', marginBottom: 'var(--space-lg)' }}
                    />
                  )}
                  <p style={{ marginBottom: 'var(--space-xl)', color: 'var(--color-gray-dark)' }}>
                    How would you rate this? (1-10)
                  </p>
                  <div className="stars-container" style={{ justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
                    {renderStars(selectedRating || 0, true, (rating) => setSelectedRating(rating))}
                    {selectedRating && (
                      <span className="rating-value" style={{ marginLeft: 'var(--space-md)' }}>
                        ({selectedRating}/10)
                      </span>
                    )}
                  </div>
                </div>
                <div className="modal-actions" style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                  <button 
                    className="btn-secondary" 
                    onClick={handleSkipRating}
                  >
                    Skip for Now
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleRatingSubmit}
                  >
                    Add to Archive{selectedRating ? ` (${selectedRating}/10)` : ''}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Watch Providers - Only for movies and TV shows */}
          {mediaType !== 'book' && mediaType !== 'game' && details.watchProviders && (details.watchProviders.flatrate || details.watchProviders.buy || details.watchProviders.rent) && (
            <div className="media-detail-section">
              <h2 className="section-title">Where to Watch</h2>
              <div className="watch-providers">
                {details.watchProviders.flatrate && (
                  <div className="provider-group">
                    <h4>Stream</h4>
                    <div className="providers-list">
                      {details.watchProviders.flatrate.map(provider => (
                        <a
                          key={provider.provider_id}
                          href={getProviderUrl(provider.provider_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="provider-item"
                        >
                          {provider.logo_path && (
                            <img 
                              src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="provider-logo"
                            />
                          )}
                          <span>{provider.provider_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {details.watchProviders.buy && (
                  <div className="provider-group">
                    <h4>Buy</h4>
                    <div className="providers-list">
                      {details.watchProviders.buy.map(provider => (
                        <a
                          key={provider.provider_id}
                          href={getProviderUrl(provider.provider_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="provider-item"
                        >
                          {provider.logo_path && (
                            <img 
                              src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="provider-logo"
                            />
                          )}
                          <span>{provider.provider_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {details.watchProviders.rent && (
                  <div className="provider-group">
                    <h4>Rent</h4>
                    <div className="providers-list">
                      {details.watchProviders.rent.map(provider => (
                        <a
                          key={provider.provider_id}
                          href={getProviderUrl(provider.provider_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="provider-item"
                        >
                          {provider.logo_path && (
                            <img 
                              src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="provider-logo"
                            />
                          )}
                          <span>{provider.provider_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cast - Only for movies and TV shows */}
          {mediaType !== 'book' && mediaType !== 'game' && details.cast && details.cast.length > 0 && (
            <div className="media-detail-section">
              <h2 className="section-title">Cast</h2>
              <div className="cast-grid">
                {details.cast.map(actor => (
                  <div key={actor.id} className="cast-item">
                    {actor.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="cast-photo"
                      />
                    ) : (
                      <div className="cast-photo-fallback">{actor.name.charAt(0)}</div>
                    )}
                    <div className="cast-info">
                      <h4 className="cast-name">{actor.name}</h4>
                      <p className="cast-character">{actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MediaDetail

