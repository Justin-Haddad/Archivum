import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { searchMedia } from '../lib/api'
import Header from '../components/Header'
import toast from 'react-hot-toast'
import '../App.css'

function DiscoverExplore() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isInLibrary, addToLibrary } = useLibrary()

  const [mediaType, setMediaType] = useState('all') // 'all', 'movies', 'tv_shows', 'books', 'games'
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedMediaItem, setSelectedMediaItem] = useState(null)
  const [selectedRating, setSelectedRating] = useState(null)
  const [selectedWantToWatch, setSelectedWantToWatch] = useState(false)

  // Media type configurations
  const mediaTypes = {
    all: { label: 'All Media', type: 'all', icon: '📚' },
    movies: { label: 'Movies', type: 'movie', icon: '🎬' },
    tv_shows: { label: 'TV Shows', type: 'tv_show', icon: '📺' },
    books: { label: 'Books', type: 'book', icon: '📖' },
    games: { label: 'Video Games', type: 'game', icon: '🎮' },
  }

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setSearching(true)
    
    try {
      // If "All" tab is selected, search across all media types
      if (mediaType === 'all') {
        const [movies, tvShows, books, games] = await Promise.all([
          searchMedia(searchQuery, 'movie'),
          searchMedia(searchQuery, 'tv_show'),
          searchMedia(searchQuery, 'book'),
          searchMedia(searchQuery, 'game')
        ])
        
        const allResults = [...movies, ...tvShows, ...books, ...games]
        setSearchResults(allResults)
        
        if (allResults.length === 0) {
          toast.error('No results found. Try a different search term.')
        }
      } else {
        const currentType = mediaTypes[mediaType]?.type
        if (!currentType) return

        const results = await searchMedia(searchQuery, currentType)
        setSearchResults(results)
        if (results.length === 0) {
          toast.error('No results found. Try a different search term.')
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      const errorMessage = error.message || 'Error searching. Please try again.'
      toast.error(errorMessage)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

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

  // Render media card
  const renderMediaCard = (item) => {
    const inLibrary = isInLibrary(item.media_type, item.media_id)
    const typeInfo = mediaTypes[item.media_type === 'movie' ? 'movies' : item.media_type === 'tv_show' ? 'tv_shows' : item.media_type === 'book' ? 'books' : 'games']

    const handleCardClick = () => {
      navigate(`/media/${item.media_type}/${item.media_id}`)
    }

    return (
      <div 
        key={`${item.media_type}-${item.media_id}`} 
        className="media-card"
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="media-poster">
          {item.poster_url ? (
            <img src={item.poster_url} alt={item.title} onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }} />
          ) : null}
          <div className="media-poster-fallback" style={{ display: item.poster_url ? 'none' : 'flex' }}>
            {typeInfo?.icon || '📦'}
          </div>
        </div>
        <div className="media-info">
          <h3 className="media-title">{item.title}</h3>
          {item.year && <p className="media-year">{item.year}</p>}
          {item.rating && (
            <div className="media-rating">
              ⭐ {item.rating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="media-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`action-btn ${inLibrary ? 'in-library' : ''}`}
            onClick={() => inLibrary ? null : handleAddToLibrary(item)}
            disabled={inLibrary}
            title={inLibrary ? 'Already in archive' : 'Add to archive'}
          >
            {inLibrary ? '✓ In Archive' : '+ Add'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Header />
      
      {/* Header Section */}
      <div className="discover-header">
        <div className="discover-header-content">
          <h1 className="discover-title">Explore</h1>
          <p className="discover-subtitle">Search and discover new media to add to your collection</p>
        </div>
      </div>

      <div className="discover-content">
        {/* Search Section */}
        <div className="discover-controls">
          <form className="library-search-form" onSubmit={handleSearch} style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search for movies, TV shows, books, games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="search-btn"
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Media Type Filter */}
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
            <button
              className={`discover-filter-btn ${mediaType === 'books' ? 'active' : ''}`}
              onClick={() => setMediaType('books')}
            >
              Books
            </button>
            <button
              className={`discover-filter-btn ${mediaType === 'games' ? 'active' : ''}`}
              onClick={() => setMediaType('games')}
            >
              Games
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searching && (
          <div className="discover-loading">
            <p>Searching...</p>
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <div className="discover-section">
            <div className="discover-section-header">
              <h2 className="discover-section-title">
                Search Results ({searchResults.length})
              </h2>
            </div>
            <div className="media-grid">
              {searchResults.map(item => renderMediaCard(item))}
            </div>
          </div>
        )}

        {!searching && searchQuery && searchResults.length === 0 && (
          <div className="discover-empty">
            <div className="discover-empty-icon">🔍</div>
            <p className="discover-empty-text">No results found for "{searchQuery}"</p>
            <p className="discover-empty-text" style={{ fontSize: '0.9rem', marginTop: 'var(--space-sm)' }}>
              Try a different search term or select a different media type.
            </p>
          </div>
        )}

        {!searching && !searchQuery && (
          <div className="discover-empty">
            <div className="discover-empty-icon">🔍</div>
            <p className="discover-empty-text">Start searching to discover new media</p>
            <p className="discover-empty-text" style={{ fontSize: '0.9rem', marginTop: 'var(--space-sm)' }}>
              Search for movies, TV shows, books, or games to add to your collection.
            </p>
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
                    id="want-to-watch-explore"
                    checked={selectedWantToWatch}
                    onChange={(e) => setSelectedWantToWatch(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="want-to-watch-explore" style={{ cursor: 'pointer', fontSize: '1rem', color: 'var(--color-gray-dark)' }}>
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

export default DiscoverExplore

