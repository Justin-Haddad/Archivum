import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { 
  getTrendingMovies, 
  getTrendingTVShows
} from '../lib/api'
import Header from '../components/Header'
import toast from 'react-hot-toast'
import '../App.css'

function DiscoverTrending() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isInLibrary, addToLibrary } = useLibrary()

  const [mediaType, setMediaType] = useState('all') // 'all', 'movies', 'tv_shows'
  
  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingTVShows, setTrendingTVShows] = useState([])
  
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [loadingTVShows, setLoadingTVShows] = useState(false)
  
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedMediaItem, setSelectedMediaItem] = useState(null)
  const [selectedRating, setSelectedRating] = useState(null)
  const [selectedWantToWatch, setSelectedWantToWatch] = useState(false)

  // Fetch trending content
  useEffect(() => {
    const fetchTrending = async () => {
      if (mediaType === 'all' || mediaType === 'movies') {
        setLoadingMovies(true)
        try {
          const movies = await getTrendingMovies()
          setTrendingMovies(movies)
        } catch (error) {
          console.error('Error fetching trending movies:', error)
          toast.error('Failed to load trending movies')
        } finally {
          setLoadingMovies(false)
        }
      }

      if (mediaType === 'all' || mediaType === 'tv_shows') {
        setLoadingTVShows(true)
        try {
          const shows = await getTrendingTVShows()
          setTrendingTVShows(shows)
        } catch (error) {
          console.error('Error fetching trending TV shows:', error)
          toast.error('Failed to load trending TV shows')
        } finally {
          setLoadingTVShows(false)
        }
      }
    }

    fetchTrending()
  }, [mediaType])

  // Handle add to library
  const handleAddToLibrary = (mediaItem) => {
    if (!user) {
      toast.error('Please sign in or sign up to add items to your library', {
        duration: 5000,
        icon: '🔒',
      })
      navigate('/')
      return
    }

    if (isInLibrary(mediaItem.media_type, mediaItem.media_id)) {
      toast.error('This item is already in your library')
      return
    }

    setSelectedMediaItem(mediaItem)
    setSelectedRating(null)
    setSelectedWantToWatch(false)
    setShowRatingModal(true)
  }

  // Handle rating modal submit
  const handleRatingSubmit = async () => {
    if (!selectedMediaItem) return

    const result = await addToLibrary(selectedMediaItem, selectedRating, selectedWantToWatch)
    if (result.error) {
      toast.error(result.error)
    } else {
      const messages = []
      if (selectedRating) messages.push(`Rated ${selectedRating}/10`)
      if (selectedWantToWatch) messages.push('Added to Backlog')
      toast.success(`Added ${selectedMediaItem.title} to your library!${messages.length > 0 ? ` (${messages.join(', ')})` : ''}`)
      setShowRatingModal(false)
      setSelectedMediaItem(null)
      setSelectedRating(null)
      setSelectedWantToWatch(false)
    }
  }

  // Render stars for rating (1-10)
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

  // Render media card (for horizontal scroll)
  const renderMediaCard = (item) => {
    const inLibrary = isInLibrary(item.media_type, item.media_id)

    const handleCardClick = () => {
      navigate(`/media/${item.media_type}/${item.media_id}`)
    }

    return (
      <div 
        key={`${item.media_type}-${item.media_id}`} 
        className="discover-card"
        onClick={handleCardClick}
      >
        <div className="discover-card-poster">
          {item.poster_url ? (
            <img src={item.poster_url} alt={item.title} onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }} />
          ) : null}
          <div className="discover-card-fallback" style={{ display: item.poster_url ? 'none' : 'flex' }}>
            {item.media_type === 'movie' ? '🎬' : item.media_type === 'tv_show' ? '📺' : '📦'}
          </div>
          {item.rating && (
            <div className="discover-card-rating">
              ⭐ {item.rating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="discover-card-info">
          <h3 className="discover-card-title">{item.title}</h3>
          {item.year && <p className="discover-card-year">{item.year}</p>}
        </div>
        <div className="discover-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`discover-card-btn ${inLibrary ? 'in-library' : ''}`}
            onClick={() => inLibrary ? null : handleAddToLibrary(item)}
            disabled={inLibrary}
            title={inLibrary ? 'Already in archive' : 'Add to archive'}
          >
            {inLibrary ? '✓' : '+'}
          </button>
        </div>
      </div>
    )
  }

  const loading = loadingMovies || loadingTVShows
  const movies = trendingMovies
  const tvShows = trendingTVShows

  return (
    <div className="page-container">
      <Header />
      
      {/* Header Section */}
      <div className="discover-header">
        <div className="discover-header-content">
          <h1 className="discover-title">Trending Now</h1>
          <p className="discover-subtitle">Discover what's trending right now</p>
        </div>
      </div>

      <div className="discover-content">
        {/* Media Type Filter */}
        <div className="discover-controls">
          <div className="discover-filter-group">
            <button
              className={`discover-filter-btn ${mediaType === 'all' ? 'active' : ''}`}
              onClick={() => setMediaType('all')}
            >
              All
            </button>
            <button
              className={`discover-filter-btn ${mediaType === 'movies' ? 'active' : ''}`}
              onClick={() => setMediaType('movies')}
            >
              Movies
            </button>
            <button
              className={`discover-filter-btn ${mediaType === 'tv_shows' ? 'active' : ''}`}
              onClick={() => setMediaType('tv_shows')}
            >
              TV Shows
            </button>
          </div>
        </div>

        {/* Content Sections */}
        {(mediaType === 'all' || mediaType === 'movies') && (
          <div className="discover-section">
            <div className="discover-section-header">
                  <h2 className="discover-section-title">
                    Trending Movies
                  </h2>
            </div>
            {loading ? (
              <div className="discover-loading">
                <p>Loading movies...</p>
              </div>
            ) : movies.length === 0 ? (
              <div className="discover-empty">
                <div className="discover-empty-icon">🎬</div>
                <p className="discover-empty-text">No movies available</p>
              </div>
            ) : (
              <div className="discover-scroll-container">
                <div className="discover-scroll-content">
                  {movies.map(item => renderMediaCard(item))}
                </div>
              </div>
            )}
          </div>
        )}

        {(mediaType === 'all' || mediaType === 'tv_shows') && (
          <div className="discover-section">
            <div className="discover-section-header">
                  <h2 className="discover-section-title">
                    Trending TV Shows
                  </h2>
            </div>
            {loading ? (
              <div className="discover-loading">
                <p>Loading TV shows...</p>
              </div>
            ) : tvShows.length === 0 ? (
              <div className="discover-empty">
                <div className="discover-empty-icon">📺</div>
                <p className="discover-empty-text">No TV shows available</p>
              </div>
            ) : (
              <div className="discover-scroll-container">
                <div className="discover-scroll-content">
                  {tvShows.map(item => renderMediaCard(item))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedMediaItem && (
          <div className="modal-overlay" onClick={() => { setShowRatingModal(false); setSelectedMediaItem(null); setSelectedRating(null); setSelectedWantToWatch(false); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => { setShowRatingModal(false); setSelectedMediaItem(null); setSelectedRating(null); setSelectedWantToWatch(false); }}>×</button>
              <h2 className="modal-title">Add to Archive</h2>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                  {selectedMediaItem.title}
                </h3>
                {selectedMediaItem.poster_url && (
                  <img 
                    src={selectedMediaItem.poster_url} 
                    alt={selectedMediaItem.title}
                    style={{ width: '150px', height: 'auto', borderRadius: '12px', marginBottom: 'var(--space-lg)' }}
                  />
                )}
                <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-gray-dark)' }}>
                  How would you rate this? (Optional)
                </p>
                <div className="stars-container" style={{ justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
                  {renderStars(selectedRating || 0, true, (rating) => setSelectedRating(rating))}
                  {selectedRating && (
                    <span className="rating-value" style={{ marginLeft: 'var(--space-md)' }}>
                      ({selectedRating}/10)
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}>
                  <input
                    type="checkbox"
                    id="want-to-watch-trending"
                    checked={selectedWantToWatch}
                    onChange={(e) => setSelectedWantToWatch(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="want-to-watch-trending" style={{ cursor: 'pointer', fontSize: '1rem', color: 'var(--color-gray-dark)' }}>
                    Add to Backlog
                  </label>
                </div>
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
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
      </div>
    </div>
  )
}

export default DiscoverTrending

