import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { 
  getTrendingMovies, 
  getNowPlayingMovies,
  getPopularMovies,
  getMovieDetails,
  searchMovies
} from '../lib/api'
import Header from '../components/Header'
import CategoryNav from '../components/discover/CategoryNav'
import HeroSection from '../components/discover/HeroSection'
import FilterChips from '../components/discover/FilterChips'
import MediaCard from '../components/discover/MediaCard'
import NewsCard from '../components/discover/NewsCard'
import toast from 'react-hot-toast'
import '../App.css'

function DiscoverMovies() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isInLibrary, addToLibrary } = useLibrary()

  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [trendingMovies, setTrendingMovies] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [displayedMovies, setDisplayedMovies] = useState([])
  
  const [activeFilter, setActiveFilter] = useState('trending')
  const [activeGenres, setActiveGenres] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  
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
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Adventure'
  ]

  // Fetch all movie data
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      try {
        const [trending, newReleases, popular] = await Promise.all([
          getTrendingMovies(),
          getNowPlayingMovies(),
          getPopularMovies(),
        ])
        
        setTrendingMovies(trending)
        setNewReleases(newReleases)
        setPopularMovies(popular)
        
        // Set featured movie (first trending)
        if (trending.length > 0) {
          const featuredId = trending[0].media_id
          try {
            const details = await getMovieDetails(featuredId)
            setFeaturedMovie(details)
          } catch (error) {
            setFeaturedMovie(trending[0])
          }
        }
      } catch (error) {
        console.error('Error fetching movies:', error)
        toast.error('Failed to load movies')
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true)
      setShowSearchDropdown(true)
      try {
        const results = await searchMovies(searchQuery)
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Filter and display movies based on active filter and genres
  useEffect(() => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setDisplayedMovies(searchResults)
      return
    }

    let movies = []
    switch (activeFilter) {
      case 'trending':
        movies = trendingMovies
        break
      case 'new':
        movies = newReleases
        break
      case 'top':
        movies = [...popularMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'coming':
        movies = newReleases
        break
      case 'recommended':
        movies = popularMovies
        break
      default:
        movies = trendingMovies
    }

    setDisplayedMovies(movies)
  }, [activeFilter, activeGenres, trendingMovies, newReleases, popularMovies, searchQuery, searchResults])

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

  // Mock news data (replace with real API later)
  const newsArticles = [
    {
      title: 'Oscar Nominations Announced',
      excerpt: 'The Academy has revealed this year\'s nominees for Best Picture, with several surprise entries making the cut.',
      source: 'Entertainment Weekly',
      date: '2 days ago',
    },
    {
      title: 'New Movie Trailers This Week',
      excerpt: 'Check out the latest trailers for upcoming blockbusters and indie films hitting theaters soon.',
      source: 'Variety',
      date: '3 days ago',
    },
    {
      title: 'Streaming Wars: What\'s New This Month',
      excerpt: 'A comprehensive guide to all the new movies and shows arriving on your favorite streaming platforms.',
      source: 'The Verge',
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
          <span className="discover-page-icon">🎬</span>
          <h1 className="discover-page-title">Movies</h1>
        </div>
        <div className="discover-page-search" style={{ position: 'relative' }}>
          <span className="discover-page-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
          />
          {showSearchDropdown && (
            <div className="discover-search-dropdown">
              {searching ? (
                <div className="discover-search-loading">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.slice(0, 8).map(item => (
                    <div
                      key={`${item.media_type}-${item.media_id}`}
                      className="discover-search-result-item"
                      onClick={() => {
                        navigate(`/media/${item.media_type}/${item.media_id}`)
                        setSearchQuery('')
                        setShowSearchDropdown(false)
                      }}
                    >
                      {item.poster_url && (
                        <img src={item.poster_url} alt={item.title} className="discover-search-result-poster" />
                      )}
                      <div className="discover-search-result-info">
                        <div className="discover-search-result-title">{item.title}</div>
                        {item.year && <div className="discover-search-result-year">{item.year}</div>}
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 8 && (
                    <div className="discover-search-result-more">
                      {searchResults.length - 8} more results...
                    </div>
                  )}
                </>
              ) : searchQuery.trim() ? (
                <div className="discover-search-no-results">No results found</div>
              ) : null}
            </div>
          )}
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
        {featuredMovie && !loading && (
          <HeroSection
            featuredItem={featuredMovie}
            mediaType="movie"
            onAddToLibrary={handleAddToLibrary}
          />
        )}

        {/* Main Content - Filtered Results */}
        {searchQuery.trim() ? (
          <div className="discover-section-modern">
            <div className="discover-section-header-modern">
              <h2 className="discover-section-title-modern">Search Results for "{searchQuery}"</h2>
              <button 
                className="discover-section-see-all" 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear search
              </button>
            </div>
            {searching ? (
              <div className="discover-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="discover-skeleton discover-skeleton-card" />
                ))}
              </div>
            ) : displayedMovies.length > 0 ? (
              <div className="discover-grid">
                {displayedMovies.map(item => (
                  <MediaCard
                    key={`${item.media_type}-${item.media_id}`}
                    item={item}
                    mediaType="movie"
                    onAddToLibrary={handleAddToLibrary}
                  />
                ))}
              </div>
            ) : (
              <div className="discover-empty">
                <div className="discover-empty-icon">🎬</div>
                <p className="discover-empty-text">No movies found</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Trending Now */}
            <div className="discover-section-modern">
              <div className="discover-section-header-modern">
                <h2 className="discover-section-title-modern">
                  {activeFilter === 'trending' ? 'Trending Now' : 
                   activeFilter === 'new' ? 'New Releases' :
                   activeFilter === 'top' ? 'Top Rated' :
                   activeFilter === 'coming' ? 'Coming Soon' :
                   activeFilter === 'recommended' ? 'Recommended for You' : 'Movies'}
                </h2>
                {activeFilter !== 'trending' && (
                  <button 
                    className="discover-section-see-all" 
                    onClick={() => setActiveFilter('trending')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Show all →
                  </button>
                )}
              </div>
              {loading ? (
                <div className="discover-horizontal-scroll">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="discover-skeleton discover-skeleton-card" />
                  ))}
                </div>
              ) : displayedMovies.length > 0 ? (
                <div className="discover-horizontal-scroll">
                  {displayedMovies.slice(0, 10).map(item => (
                    <MediaCard
                      key={`${item.media_type}-${item.media_id}`}
                      item={item}
                      mediaType="movie"
                      onAddToLibrary={handleAddToLibrary}
                    />
                  ))}
                </div>
              ) : (
                <div className="discover-empty">
                  <div className="discover-empty-icon">🎬</div>
                  <p className="discover-empty-text">No movies found</p>
                </div>
              )}
            </div>

            {/* New & Notable (Grid) - Only show if not filtering */}
            {activeFilter === 'trending' && (
              <div className="discover-section-modern">
                <div className="discover-section-header-modern">
                  <h2 className="discover-section-title-modern">New & Notable</h2>
                  <button 
                    className="discover-section-see-all" 
                    onClick={() => setActiveFilter('new')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    See all →
                  </button>
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
                        mediaType="movie"
                        onAddToLibrary={handleAddToLibrary}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

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
        {user && popularMovies.length > 0 && (
          <div className="discover-section-modern">
            <div className="discover-section-header-modern">
              <h2 className="discover-section-title-modern">Because You Liked...</h2>
            </div>
            <div className="discover-horizontal-scroll">
              {popularMovies.slice(0, 8).map(item => (
                <MediaCard
                  key={`${item.media_type}-${item.media_id}`}
                  item={item}
                  mediaType="movie"
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
                  id="want-to-watch-movies"
                  checked={selectedWantToWatch}
                  onChange={(e) => setSelectedWantToWatch(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="want-to-watch-movies" style={{ cursor: 'pointer', fontSize: '1rem', color: 'var(--color-gray-dark)' }}>
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

export default DiscoverMovies
