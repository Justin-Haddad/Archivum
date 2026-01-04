import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { searchMedia, getRecommendations } from '../lib/api'
import Header from '../components/Header'
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

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedMediaItem, setSelectedMediaItem] = useState(null)
  const [selectedRating, setSelectedRating] = useState(null)
  const [selectedWantToWatch, setSelectedWantToWatch] = useState(false)
  const [sortBy, setSortBy] = useState('date_added_desc')
  const [filterRating, setFilterRating] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')
  const [filterWantToWatch, setFilterWantToWatch] = useState('all') // 'all', 'want', 'not_want'
  const [viewMode, setViewMode] = useState('list') // 'grid' or 'list'

  // Media type configurations
  const mediaTypes = {
    all: { label: 'All Media', type: 'all', icon: '📚' },
    movies: { label: 'Movies', type: 'movie', icon: '🎬' },
    tv_shows: { label: 'TV Shows', type: 'tv_show', icon: '📺' },
    books: { label: 'Books', type: 'book', icon: '📖' },
    games: { label: 'Video Games', type: 'game', icon: '🎮' },
  }

  // Get filter options based on media type
  const getFilterOptions = () => {
    const baseOptions = {
      sort: [
        { value: 'date_added_desc', label: 'Newest First' },
        { value: 'date_added_asc', label: 'Oldest First' },
        { value: 'title_asc', label: 'Title A-Z' },
        { value: 'title_desc', label: 'Title Z-A' },
        { value: 'rating_desc', label: 'Highest Rated' },
        { value: 'rating_asc', label: 'Lowest Rated' },
        { value: 'year_desc', label: 'Newest Year' },
        { value: 'year_asc', label: 'Oldest Year' },
      ],
      rating: [
        { value: 'all', label: 'All Ratings' },
        { value: 'rated', label: 'Rated Only' },
        { value: 'unrated', label: 'Unrated Only' },
        { value: '9-10', label: '9-10 Stars' },
        { value: '7-8', label: '7-8 Stars' },
        { value: '5-6', label: '5-6 Stars' },
        { value: '1-4', label: '1-4 Stars' },
      ],
      year: [
        { value: 'all', label: 'All Years' },
        { value: '2020s', label: '2020s' },
        { value: '2010s', label: '2010s' },
        { value: '2000s', label: '2000s' },
        { value: '1990s', label: '1990s' },
        { value: 'older', label: 'Before 1990' },
      ],
      date: [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
      ],
    }

    // Customize labels based on media type
    if (activeTab === 'movies') {
      return {
        ...baseOptions,
        sort: [
          { value: 'date_added_desc', label: 'Recently Added' },
          { value: 'rating_desc', label: 'Highest Rated' },
          { value: 'year_desc', label: 'Newest Releases' },
          { value: 'year_asc', label: 'Oldest Releases' },
          { value: 'title_asc', label: 'Title A-Z' },
          { value: 'title_desc', label: 'Title Z-A' },
          { value: 'date_added_asc', label: 'Oldest Added' },
          { value: 'rating_asc', label: 'Lowest Rated' },
        ],
        year: [
          { value: 'all', label: 'All Years' },
          { value: '2020s', label: '2020s' },
          { value: '2010s', label: '2010s' },
          { value: '2000s', label: '2000s' },
          { value: '1990s', label: '1990s' },
          { value: '1980s', label: '1980s' },
          { value: 'older', label: 'Before 1980' },
        ],
      }
    } else if (activeTab === 'tv_shows') {
      return {
        ...baseOptions,
        sort: [
          { value: 'date_added_desc', label: 'Recently Added' },
          { value: 'rating_desc', label: 'Highest Rated' },
          { value: 'year_desc', label: 'Newest Shows' },
          { value: 'year_asc', label: 'Oldest Shows' },
          { value: 'title_asc', label: 'Title A-Z' },
          { value: 'title_desc', label: 'Title Z-A' },
          { value: 'date_added_asc', label: 'Oldest Added' },
          { value: 'rating_asc', label: 'Lowest Rated' },
        ],
      }
    } else if (activeTab === 'books') {
      return {
        ...baseOptions,
        sort: [
          { value: 'date_added_desc', label: 'Recently Added' },
          { value: 'rating_desc', label: 'Highest Rated' },
          { value: 'year_desc', label: 'Newest Published' },
          { value: 'year_asc', label: 'Oldest Published' },
          { value: 'title_asc', label: 'Title A-Z' },
          { value: 'title_desc', label: 'Title Z-A' },
          { value: 'date_added_asc', label: 'Oldest Added' },
          { value: 'rating_asc', label: 'Lowest Rated' },
        ],
      }
    } else if (activeTab === 'games') {
      return {
        ...baseOptions,
        sort: [
          { value: 'date_added_desc', label: 'Recently Added' },
          { value: 'rating_desc', label: 'Highest Rated' },
          { value: 'year_desc', label: 'Newest Releases' },
          { value: 'year_asc', label: 'Oldest Releases' },
          { value: 'title_asc', label: 'Title A-Z' },
          { value: 'title_desc', label: 'Title Z-A' },
          { value: 'date_added_asc', label: 'Oldest Added' },
          { value: 'rating_asc', label: 'Lowest Rated' },
        ],
      }
    }

    return baseOptions
  }

  // Get library items for current tab with filtering and sorting
  const getCurrentLibrary = () => {
    let filtered = library

    // Filter by media type
    if (activeTab !== 'all') {
      const currentType = mediaTypes[activeTab]?.type
      filtered = filtered.filter(item => item.media_type === currentType)
    }

    // Filter by rating
    if (filterRating === 'rated') {
      filtered = filtered.filter(item => item.rating !== null && item.rating !== undefined)
    } else if (filterRating === 'unrated') {
      filtered = filtered.filter(item => item.rating === null || item.rating === undefined)
    } else if (filterRating !== 'all') {
      const ratingRange = filterRating.split('-')
      const minRating = parseInt(ratingRange[0])
      const maxRating = ratingRange[1] ? parseInt(ratingRange[1]) : 10
      filtered = filtered.filter(item => 
        item.rating !== null && 
        item.rating !== undefined && 
        item.rating >= minRating && 
        item.rating <= maxRating
      )
    }

    // Filter by year
    if (filterYear !== 'all') {
      if (filterYear === '2020s') {
        filtered = filtered.filter(item => item.year && item.year >= 2020)
      } else if (filterYear === '2010s') {
        filtered = filtered.filter(item => item.year && item.year >= 2010 && item.year < 2020)
      } else if (filterYear === '2000s') {
        filtered = filtered.filter(item => item.year && item.year >= 2000 && item.year < 2010)
      } else if (filterYear === '1990s') {
        filtered = filtered.filter(item => item.year && item.year >= 1990 && item.year < 2000)
      } else if (filterYear === '1980s') {
        filtered = filtered.filter(item => item.year && item.year >= 1980 && item.year < 1990)
      } else if (filterYear === 'older') {
        // For movies, older means before 1980, for others it means before 1990
        const cutoffYear = activeTab === 'movies' ? 1980 : 1990
        filtered = filtered.filter(item => item.year && item.year < cutoffYear)
      }
    }

    // Filter by date added
    if (filterDateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      if (filterDateRange === 'today') {
        filtered = filtered.filter(item => {
          if (!item.added_at) return false
          const addedDate = new Date(item.added_at)
          return addedDate >= today
        })
      } else if (filterDateRange === 'week') {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = filtered.filter(item => {
          if (!item.added_at) return false
          const addedDate = new Date(item.added_at)
          return addedDate >= weekAgo
        })
      } else if (filterDateRange === 'month') {
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        filtered = filtered.filter(item => {
          if (!item.added_at) return false
          const addedDate = new Date(item.added_at)
          return addedDate >= monthAgo
        })
      }
    }

    // Filter by want to watch
    if (filterWantToWatch === 'want') {
      filtered = filtered.filter(item => item.want_to_watch === true)
    } else if (filterWantToWatch === 'not_want') {
      filtered = filtered.filter(item => !item.want_to_watch || item.want_to_watch === false)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '')
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '')
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0)
        case 'rating_asc':
          return (a.rating || 0) - (b.rating || 0)
        case 'year_desc':
          return (b.year || 0) - (a.year || 0)
        case 'year_asc':
          return (a.year || 0) - (b.year || 0)
        case 'date_added_desc':
          return new Date(b.added_at || 0) - new Date(a.added_at || 0)
        case 'date_added_asc':
          return new Date(a.added_at || 0) - new Date(b.added_at || 0)
        default:
          return 0
      }
    })

    return sorted
  }

  // Fetch recommendations when tab changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      const currentType = mediaTypes[activeTab]?.type
      if (currentType === 'movie' || currentType === 'tv_show') {
        setLoadingRecommendations(true)
        try {
          const recs = await getRecommendations(currentType)
          setRecommendations(recs)
        } catch (error) {
          console.error('Error fetching recommendations:', error)
          setRecommendations([])
        } finally {
          setLoadingRecommendations(false)
        }
      } else {
        setRecommendations([])
      }
    }

    // Always fetch recommendations for movies/tv shows, regardless of search state
    fetchRecommendations()
  }, [activeTab])

  // Handle recommendation click
  const handleRecommendationClick = (recommendation) => {
    // Navigate directly to the movie/show detail page
    navigate(`/media/${recommendation.media_type}/${recommendation.media_id}`)
  }

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    // If "All" tab is selected, search across all media types
    if (activeTab === 'all') {
      setSearching(true)
      setShowSearch(true)
      setShowRecommendations(false)
      
      try {
        // Search all media types and combine results
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
      } catch (error) {
        console.error('Search error:', error)
        const errorMessage = error.message || 'Error searching. Please try again.'
        toast.error(errorMessage)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
      return
    }

    const currentType = mediaTypes[activeTab]?.type
    if (!currentType) return

    setSearching(true)
    setShowSearch(true)
    setShowRecommendations(false)
    
    try {
      const results = await searchMedia(searchQuery, currentType)
      setSearchResults(results)
      if (results.length === 0) {
        toast.error('No results found. Try a different search term.')
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

  // Handle add to library - show rating modal first
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

    // Show rating modal
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
      setShowSearch(false)
      setSearchQuery('')
      setShowRatingModal(false)
      setSelectedMediaItem(null)
      setSelectedRating(null)
      setSelectedWantToWatch(false)
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

  // Render media list item (for list view)
  const renderMediaListItem = (item, isLibraryItem = false) => {
    const libraryItem = isLibraryItem ? item : null
    const mediaItem = isLibraryItem ? null : item

    const title = libraryItem?.title || mediaItem?.title
    const year = libraryItem?.year || mediaItem?.year
    const posterUrl = libraryItem?.poster_url || mediaItem?.poster_url
    const rating = libraryItem?.rating || null
    const mediaType = libraryItem?.media_type || mediaItem?.media_type
    const inLibrary = isLibraryItem || (mediaItem && isInLibrary(mediaItem.media_type, mediaItem.media_id))
    
    // Get media type label and icon
    const getMediaTypeInfo = (type) => {
      const typeMap = {
        'movie': { label: 'Movie', icon: '🎬' },
        'tv_show': { label: 'TV Show', icon: '📺' },
        'book': { label: 'Book', icon: '📖' },
        'game': { label: 'Game', icon: '🎮' }
      }
      return typeMap[type] || { label: type, icon: '📦' }
    }
    const typeInfo = getMediaTypeInfo(mediaType)

    const handleItemClick = () => {
      const id = isLibraryItem ? libraryItem.media_id : mediaItem.media_id
      const type = isLibraryItem ? libraryItem.media_type : mediaItem.media_type
      navigate(`/media/${type}/${id}`)
    }

    return (
      <div 
        key={isLibraryItem ? libraryItem.id : `search-${mediaItem.media_id}`} 
        className="media-list-item"
        onClick={handleItemClick}
      >
        <div className="media-list-poster">
          {posterUrl ? (
            <img src={posterUrl} alt={title} onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }} />
          ) : null}
          <div className="media-list-poster-fallback" style={{ display: posterUrl ? 'none' : 'flex' }}>
            {mediaTypes[activeTab]?.icon || '📦'}
          </div>
        </div>
        <div className="media-list-info">
          <div className="media-list-main">
            <h3 className="media-list-title">
              <span>{title}</span>
              {activeTab === 'all' && (
                <span className="media-type-badge" title={typeInfo.label}>
                  {typeInfo.icon} {typeInfo.label}
                </span>
              )}
            </h3>
            {year && <span className="media-list-year">{year}</span>}
            {isLibraryItem && rating && (
              <span className="media-list-rating-badge">
                {rating}/10
              </span>
            )}
          </div>
          {isLibraryItem && (
            <div className="media-list-rating">
              <label className="rating-label">Your Rating:</label>
              <div className="stars-container" onClick={(e) => e.stopPropagation()}>
                {renderStars(
                  rating || 0,
                  true,
                  (newRating) => handleRatingChange(libraryItem.id, newRating)
                )}
                {rating && <span className="rating-value">({rating}/10)</span>}
              </div>
            </div>
          )}
        </div>
        <div className="media-list-actions" onClick={(e) => e.stopPropagation()}>
          {isLibraryItem ? (
            <button
              className="action-btn remove-btn"
              onClick={() => handleRemoveFromLibrary(libraryItem.id, title)}
            >
              Remove
            </button>
          ) : (
            <button
              className={`action-btn ${inLibrary ? 'in-library' : ''}`}
              onClick={() => inLibrary ? null : handleAddToLibrary(mediaItem)}
              disabled={inLibrary}
            >
              {inLibrary ? '✓ In Archive' : '+ Add'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Render media card (for grid view)
  const renderMediaCard = (item, isLibraryItem = false) => {
    const libraryItem = isLibraryItem ? item : null
    const mediaItem = isLibraryItem ? null : item

    const title = libraryItem?.title || mediaItem?.title
    const year = libraryItem?.year || mediaItem?.year
    const posterUrl = libraryItem?.poster_url || mediaItem?.poster_url
    const rating = libraryItem?.rating || null
    const mediaType = libraryItem?.media_type || mediaItem?.media_type
    const inLibrary = isLibraryItem || (mediaItem && isInLibrary(mediaItem.media_type, mediaItem.media_id))
    
    // Get media type label and icon
    const getMediaTypeInfo = (type) => {
      const typeMap = {
        'movie': { label: 'Movie', icon: '🎬' },
        'tv_show': { label: 'TV Show', icon: '📺' },
        'book': { label: 'Book', icon: '📖' },
        'game': { label: 'Game', icon: '🎮' }
      }
      return typeMap[type] || { label: type, icon: '📦' }
    }
    const typeInfo = getMediaTypeInfo(mediaType)

    const handleCardClick = () => {
      const id = isLibraryItem ? libraryItem.media_id : mediaItem.media_id
      const type = isLibraryItem ? libraryItem.media_type : mediaItem.media_type
      navigate(`/media/${type}/${id}`)
    }

    return (
      <div 
        key={isLibraryItem ? libraryItem.id : `search-${mediaItem.media_id}`} 
        className="media-card"
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
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
          <h3 className="media-title">
            <span>{title}</span>
            {activeTab === 'all' && (
              <span className="media-type-badge" title={typeInfo.label}>
                {typeInfo.icon} {typeInfo.label}
              </span>
            )}
          </h3>
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

          <div className="media-actions" onClick={(e) => e.stopPropagation()}>
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
                  id="want-to-watch"
                  checked={selectedWantToWatch}
                  onChange={(e) => setSelectedWantToWatch(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="want-to-watch" style={{ cursor: 'pointer', fontSize: '1rem', color: 'var(--color-gray-dark)' }}>
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

      {!user ? (
        <div className="page-container">
          <Header />
          <div className="page-header">
            <h1 className="page-title">My Archive</h1>
          </div>
          <div className="page-content" style={{ textAlign: 'center', padding: 'var(--space-5xl)' }}>
            <div className="auth-prompt">
              <div className="auth-prompt-icon">🔒</div>
              <h2 className="auth-prompt-title">Sign In Required</h2>
              <p className="auth-prompt-message">
                Please sign in or sign up to view and manage your media archive
              </p>
              <button className="btn-primary" onClick={() => navigate('/')}>
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Header />
          <div className="page-header">
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
                setShowRecommendations(true)
              }}
            >
              <span className="tab-icon">{config.icon}</span>
              <span className="tab-label">{config.label}</span>
              {(() => {
                const tabLibrary = key === 'all' 
                  ? library 
                  : library.filter(item => item.media_type === mediaTypes[key]?.type)
                return tabLibrary.length > 0 && (
                  <span className="tab-count">{tabLibrary.length}</span>
                )
              })()}
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
                placeholder={activeTab === 'all' ? 'Search all media...' : `Search for ${mediaTypes[activeTab]?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value === '') {
                    setShowSearch(false)
                    setShowRecommendations(true)
                  }
                }}
                onFocus={() => {
                  if (searchQuery === '') {
                    setShowRecommendations(true)
                  }
                }}
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
            {viewMode === 'grid' ? (
              <div className="media-grid">
                {searchResults.map(item => renderMediaCard(item, false))}
              </div>
            ) : (
              <div className="media-list">
                {searchResults.map(item => renderMediaListItem(item, false))}
              </div>
            )}
          </div>
        )}

        {/* Library Items - First thing after search bar */}
        {!showSearch && (
          <div className="library-section">
            <div className="library-header-controls">
              <h2 className="section-title">
                {activeTab === 'all' 
                  ? 'My Archive'
                  : `My ${mediaTypes[activeTab]?.label} Collection`
                }
              </h2>
              
              {/* Filters and Sort Controls */}
              {(() => {
                const tabLibrary = activeTab === 'all' 
                  ? library 
                  : library.filter(item => item.media_type === mediaTypes[activeTab]?.type)
                return tabLibrary.length > 0 && (
                  <div className="library-controls">
                  <div className="library-filters">
                    {/* Filter Group Labels */}
                    <div className="filter-group">
                      <label className="filter-group-label">Sort By</label>
                      <select 
                        className="filter-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        {getFilterOptions().sort.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-group-label">
                        {activeTab === 'movies' ? 'Movie Rating' : 
                         activeTab === 'tv_shows' ? 'Show Rating' :
                         activeTab === 'books' ? 'Book Rating' :
                         activeTab === 'games' ? 'Game Rating' : 'Rating'}
                      </label>
                      <select 
                        className="filter-select"
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                      >
                        {getFilterOptions().rating.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-group-label">
                        {activeTab === 'movies' ? 'Release Year' : 
                         activeTab === 'tv_shows' ? 'First Aired' :
                         activeTab === 'books' ? 'Published Year' :
                         activeTab === 'games' ? 'Release Year' : 'Year'}
                      </label>
                      <select 
                        className="filter-select"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                      >
                        {getFilterOptions().year.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-group-label">Date Added</label>
                      <select 
                        className="filter-select"
                        value={filterDateRange}
                        onChange={(e) => setFilterDateRange(e.target.value)}
                      >
                        {getFilterOptions().date.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-group-label">Backlog:</label>
                      <select 
                        className="filter-select"
                        value={filterWantToWatch}
                        onChange={(e) => setFilterWantToWatch(e.target.value)}
                      >
                        <option value="all">All Items</option>
                        <option value="want">Backlog</option>
                        <option value="not_want">Not in Backlog</option>
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    {(filterRating !== 'all' || filterYear !== 'all' || filterDateRange !== 'all' || filterWantToWatch !== 'all') && (
                      <button 
                        className="clear-filters-btn"
                        onClick={() => {
                          setFilterRating('all')
                          setFilterYear('all')
                          setFilterDateRange('all')
                          setFilterWantToWatch('all')
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  
                  <div className="library-view-controls">
                    <div className="view-toggle">
                      <button
                        className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                      >
                        ☰
                      </button>
                      <button
                        className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                      >
                        ⊞
                      </button>
                    </div>
                    <div className="library-count">
                      {currentLibrary.length} {currentLibrary.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>
                )
              })()}
            </div>
            
            {(() => {
              // Get the unfiltered library for the current tab
              const tabLibrary = activeTab === 'all' 
                ? library 
                : library.filter(item => item.media_type === mediaTypes[activeTab]?.type)
              
              // Check if there are any items in this tab (before filtering)
              const hasItemsInTab = tabLibrary.length > 0
              
              // Check if filters are active
              const hasActiveFilters = filterRating !== 'all' || filterYear !== 'all' || filterDateRange !== 'all' || filterWantToWatch !== 'all'
              
              if (currentLibrary.length > 0) {
                // Show items
                return viewMode === 'grid' ? (
                  <div className="media-grid">
                    {currentLibrary.map(item => renderMediaCard(item, true))}
                  </div>
                ) : (
                  <div className="media-list">
                    {currentLibrary.map(item => renderMediaListItem(item, true))}
                  </div>
                )
              } else if (hasItemsInTab && hasActiveFilters) {
                // Has items in tab but filters are hiding them
                return (
                  <div className="empty-library">
                    <div className="empty-icon">{activeTab === 'all' ? '📚' : mediaTypes[activeTab]?.icon}</div>
                    <p className="empty-message">
                      No items match your current filters. Try adjusting your filters.
                    </p>
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        setFilterRating('all')
                        setFilterYear('all')
                        setFilterDateRange('all')
                      }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                )
              } else {
                // No items in this specific tab
                return (
                  <div className="empty-library">
                    <div className="empty-icon">{activeTab === 'all' ? '📚' : mediaTypes[activeTab]?.icon}</div>
                    <p className="empty-message">
                      {activeTab === 'all' 
                        ? 'Begin building your collection. Search above to add movies, shows, books, and games to your archive.'
                        : `You have nothing added here. Search above to add ${mediaTypes[activeTab]?.label.toLowerCase()} to your archive.`
                      }
                    </p>
                    {activeTab !== 'all' && (
                      <p className="empty-submessage">
                        Use the search bar above to discover and add {mediaTypes[activeTab]?.label.toLowerCase()} to your collection.
                      </p>
                    )}
                  </div>
                )
              }
            })()}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  )
}

export default Library

