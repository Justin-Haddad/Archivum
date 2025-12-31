import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { searchMedia } from '../lib/api'
import toast from 'react-hot-toast'
import '../App.css'

function Library() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { 
    library, 
    loading: libraryLoading,
    addToLibrary, 
    removeFromLibrary, 
    updateRating,
    isInLibrary 
  } = useLibrary()

  const [activeTab, setActiveTab] = useState('movies')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Media type configurations
  const mediaTypes = {
    movies: { label: 'Movies', type: 'movie', icon: '🎬' },
    tv_shows: { label: 'TV Shows', type: 'tv_show', icon: '📺' },
    books: { label: 'Books', type: 'book', icon: '📖' },
    games: { label: 'Video Games', type: 'game', icon: '🎮' },
  }

  // Get library items for current tab
  const getCurrentLibrary = () => {
    const currentType = mediaTypes[activeTab]?.type
    return library.filter(item => item.media_type === currentType)
  }

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    const currentType = mediaTypes[activeTab]?.type
    if (!currentType) return

    setSearching(true)
    setShowSearch(true)
    
    try {
      const results = await searchMedia(searchQuery, currentType)
      setSearchResults(results)
      if (results.length === 0) {
        toast.error('No results found. Try a different search term.')
      }
    } catch (error) {
      toast.error('Error searching. Please try again.')
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  // Handle add to library
  const handleAddToLibrary = async (mediaItem) => {
    if (!user) {
      toast.error('Please sign in to add items to your library')
      navigate('/')
      return
    }

    if (isInLibrary(mediaItem.media_type, mediaItem.media_id)) {
      toast.error('This item is already in your library')
      return
    }

    const result = await addToLibrary(mediaItem)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Added ${mediaItem.title} to your library!`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  // Handle remove from library
  const handleRemoveFromLibrary = async (libraryItemId, title) => {
    const result = await removeFromLibrary(libraryItemId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Removed ${title} from your library`)
    }
  }

  // Handle rating update
  const handleRatingChange = async (libraryItemId, newRating) => {
    const result = await updateRating(libraryItemId, newRating)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Rating updated!')
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
  const renderMediaCard = (item, isLibraryItem = false) => {
    const libraryItem = isLibraryItem ? item : null
    const mediaItem = isLibraryItem ? null : item

    const title = libraryItem?.title || mediaItem?.title
    const year = libraryItem?.year || mediaItem?.year
    const posterUrl = libraryItem?.poster_url || mediaItem?.poster_url
    const rating = libraryItem?.rating || null
    const inLibrary = isLibraryItem || (mediaItem && isInLibrary(mediaItem.media_type, mediaItem.media_id))

    return (
      <div key={isLibraryItem ? libraryItem.id : `search-${mediaItem.media_id}`} className="media-card">
        <div className="media-poster">
          {posterUrl ? (
            <img src={posterUrl} alt={title} onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }} />
          ) : null}
          <div className="media-poster-fallback" style={{ display: posterUrl ? 'none' : 'flex' }}>
            {mediaTypes[activeTab]?.icon || '📦'}
          </div>
        </div>
        <div className="media-info">
          <h3 className="media-title">{title}</h3>
          {year && <div className="media-year">{year}</div>}
          
          {isLibraryItem && (
            <div className="media-rating-section">
              <label className="rating-label">Your Rating:</label>
              <div className="stars-container">
                {renderStars(
                  rating || 0,
                  true,
                  (newRating) => handleRatingChange(libraryItem.id, newRating)
                )}
                {rating && <span className="rating-value">({rating}/10)</span>}
              </div>
            </div>
          )}

          <div className="media-actions">
            {isLibraryItem ? (
              <button
                className="action-btn remove-btn"
                onClick={() => handleRemoveFromLibrary(libraryItem.id, title)}
              >
                Remove from Archive
              </button>
            ) : (
              <button
                className={`action-btn ${inLibrary ? 'in-library' : ''}`}
                onClick={() => inLibrary ? null : handleAddToLibrary(mediaItem)}
                disabled={inLibrary}
              >
                {inLibrary ? '✓ In Archive' : '+ Add to Archive'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const currentLibrary = getCurrentLibrary()

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1 className="page-title">My Archive</h1>
        <p className="page-subtitle">Your personal collection of movies, TV shows, books, and games</p>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div className="library-tabs">
          {Object.entries(mediaTypes).map(([key, config]) => (
            <button
              key={key}
              className={`library-tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(key)
                setShowSearch(false)
                setSearchResults([])
                setSearchQuery('')
              }}
            >
              <span className="tab-icon">{config.icon}</span>
              <span className="tab-label">{config.label}</span>
              {currentLibrary.length > 0 && (
                <span className="tab-count">{currentLibrary.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search Section */}
        <div className="library-search-section">
          <form className="library-search-form" onSubmit={handleSearch}>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder={`Search for ${mediaTypes[activeTab]?.label.toLowerCase()}...`}
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
        </div>

        {/* Search Results */}
        {showSearch && searchResults.length > 0 && (
          <div className="library-section">
            <h2 className="section-title">Search Results</h2>
            <div className="media-grid">
              {searchResults.map(item => renderMediaCard(item, false))}
            </div>
          </div>
        )}

        {/* Library Items */}
        <div className="library-section">
          <h2 className="section-title">
            {currentLibrary.length > 0 
              ? `${mediaTypes[activeTab]?.label} Collection`
              : `Your ${mediaTypes[activeTab]?.label} Collection`
            }
          </h2>
          
          {currentLibrary.length > 0 ? (
            <div className="media-grid">
              {currentLibrary.map(item => renderMediaCard(item, true))}
            </div>
          ) : (
            <div className="empty-library">
              <div className="empty-icon">{mediaTypes[activeTab]?.icon}</div>
              <p className="empty-message">
                Begin building your collection. Search above to add {mediaTypes[activeTab]?.label.toLowerCase()} to your archive.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Library

