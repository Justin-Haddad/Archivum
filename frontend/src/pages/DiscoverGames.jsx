import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { 
  getTrendingGames, 
  getNewReleasesGames,
  getGameDetails
} from '../lib/api'
import Header from '../components/Header'
import CategoryNav from '../components/discover/CategoryNav'
import HeroSection from '../components/discover/HeroSection'
import FilterChips from '../components/discover/FilterChips'
import MediaCard from '../components/discover/MediaCard'
import NewsCard from '../components/discover/NewsCard'
import toast from 'react-hot-toast'
import '../App.css'

function DiscoverGames() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isInLibrary, addToLibrary } = useLibrary()

  const [featuredGame, setFeaturedGame] = useState(null)
  const [trendingGames, setTrendingGames] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [popularGames, setPopularGames] = useState([])
  
  const [activeFilter, setActiveFilter] = useState('trending')
  const [activeGenres, setActiveGenres] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  
  const [loading, setLoading] = useState(true)
  
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedMediaItem, setSelectedMediaItem] = useState(null)
  const [selectedRating, setSelectedRating] = useState(null)
  const [selectedWantToWatch, setSelectedWantToWatch] = useState(false)

  const filters = [
    { value: 'trending', label: 'Trending' },
    { value: 'new', label: 'New Releases' },
    { value: 'top', label: 'Top Rated' },
    { value: 'coming', label: 'Coming Soon' },
    { value: 'recommended', label: 'Recommended' },
  ]

  const genres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Puzzle', 'Indie'
  ]

  // Fetch all game data
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true)
      try {
        const [trending, newReleases] = await Promise.all([
          getTrendingGames(),
          getNewReleasesGames(),
        ])
        
        setTrendingGames(trending)
        setNewReleases(newReleases)
        setPopularGames(trending) // Use trending as popular for now
        
        // Set featured game (first trending)
        if (trending.length > 0) {
          const featuredId = trending[0].media_id
          try {
            const details = await getGameDetails(featuredId)
            setFeaturedGame(details)
          } catch (error) {
            setFeaturedGame(trending[0])
          }
        }
      } catch (error) {
        console.error('Error fetching games:', error)
        toast.error('Failed to load games')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

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

  // Mock news data
  const newsArticles = [
    {
      title: 'Game Awards Winners Announced',
      excerpt: 'The annual Game Awards ceremony revealed this year\'s winners, with several indie titles taking home major awards.',
      source: 'IGN',
      date: '1 day ago',
    },
    {
      title: 'Major Game Updates & Patch Notes',
      excerpt: 'Latest patch notes and updates for popular games, including new features, bug fixes, and balance changes.',
      source: 'GameSpot',
      date: '3 days ago',
    },
    {
      title: 'Upcoming Game Releases This Month',
      excerpt: 'A comprehensive guide to all the highly anticipated games launching this month across all platforms.',
      source: 'Polygon',
      date: '5 days ago',
    },
  ]

  return (
    <div className="page-container">
      <Header />
      <CategoryNav />
      
      {/* Page Header with Search */}
      <div className="discover-page-header">
        <div className="discover-page-header-left">
          <span className="discover-page-icon">🎮</span>
          <h1 className="discover-page-title">Video Games</h1>
        </div>
        <div className="discover-page-search">
          <span className="discover-page-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <FilterChips
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        genres={genres}
        onGenreChange={(genre) => {
          setActiveGenres(prev => 
            prev.includes(genre) 
              ? prev.filter(g => g !== genre)
              : [...prev, genre]
          )
        }}
        activeGenres={activeGenres}
      />

      <div className="discover-content-wrapper">
        {/* Hero Section */}
        {featuredGame && !loading && (
          <HeroSection
            featuredItem={featuredGame}
            mediaType="game"
            onAddToLibrary={handleAddToLibrary}
          />
        )}

        {/* Trending Now */}
        <div className="discover-section-modern">
          <div className="discover-section-header-modern">
            <h2 className="discover-section-title-modern">Trending Now</h2>
            <a href="#" className="discover-section-see-all" onClick={(e) => { e.preventDefault(); setActiveFilter('trending'); }}>
              See all →
            </a>
          </div>
          {loading ? (
            <div className="discover-horizontal-scroll">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="discover-skeleton discover-skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="discover-horizontal-scroll">
              {trendingGames.slice(0, 10).map(item => (
                <MediaCard
                  key={`${item.media_type}-${item.media_id}`}
                  item={item}
                  mediaType="game"
                  onAddToLibrary={handleAddToLibrary}
                />
              ))}
            </div>
          )}
        </div>

        {/* New & Notable (Grid) */}
        <div className="discover-section-modern">
          <div className="discover-section-header-modern">
            <h2 className="discover-section-title-modern">New Releases</h2>
            <a href="#" className="discover-section-see-all" onClick={(e) => { e.preventDefault(); setActiveFilter('new'); }}>
              See all →
            </a>
          </div>
          {loading ? (
            <div className="discover-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="discover-skeleton discover-skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="discover-grid">
              {newReleases.slice(0, 12).map(item => (
                <MediaCard
                  key={`${item.media_type}-${item.media_id}`}
                  item={item}
                  mediaType="game"
                  onAddToLibrary={handleAddToLibrary}
                />
              ))}
            </div>
          )}
        </div>

        {/* News & Updates */}
        <div className="discover-section-modern">
          <div className="discover-section-header-modern">
            <h2 className="discover-section-title-modern">News & Updates</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {newsArticles.map((article, index) => (
              <NewsCard key={index} article={article} />
            ))}
          </div>
        </div>

        {/* Because You Liked... (Personalized) */}
        {user && popularGames.length > 0 && (
          <div className="discover-section-modern">
            <div className="discover-section-header-modern">
              <h2 className="discover-section-title-modern">Because You Liked...</h2>
            </div>
            <div className="discover-horizontal-scroll">
              {popularGames.slice(0, 8).map(item => (
                <MediaCard
                  key={`${item.media_type}-${item.media_id}`}
                  item={item}
                  mediaType="game"
                  onAddToLibrary={handleAddToLibrary}
                />
              ))}
            </div>
          </div>
        )}
      </div>

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
                  id="want-to-watch-games"
                  checked={selectedWantToWatch}
                  onChange={(e) => setSelectedWantToWatch(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="want-to-watch-games" style={{ cursor: 'pointer', fontSize: '1rem', color: 'var(--color-gray-dark)' }}>
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
  )
}

export default DiscoverGames
