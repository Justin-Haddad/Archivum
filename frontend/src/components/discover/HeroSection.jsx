import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLibrary } from '../../contexts/LibraryContext'
import toast from 'react-hot-toast'

function HeroSection({ featuredItem, mediaType, onAddToLibrary }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isInLibrary } = useLibrary()

  if (!featuredItem) return null

  const inLibrary = isInLibrary(featuredItem.media_type, featuredItem.media_id)
  const handleViewDetails = () => {
    navigate(`/media/${featuredItem.media_type}/${featuredItem.media_id}`)
  }

  const handleAdd = () => {
    if (!user) {
      toast.error('Please sign in to add items to your library')
      return
    }
    onAddToLibrary(featuredItem)
  }

  return (
    <div className="discover-hero">
      <div 
        className="discover-hero-backdrop"
        style={{
          backgroundImage: featuredItem.poster_url 
            ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url(${featuredItem.poster_url})`
            : 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <div className="discover-hero-content">
        <div className="discover-hero-poster">
          {featuredItem.poster_url ? (
            <img src={featuredItem.poster_url} alt={featuredItem.title} />
          ) : (
            <div className="discover-hero-poster-fallback">
              {mediaType === 'movie' ? '🎬' : mediaType === 'tv_show' ? '📺' : mediaType === 'book' ? '📖' : '🎮'}
            </div>
          )}
        </div>
        <div className="discover-hero-info">
          <h1 className="discover-hero-title">{featuredItem.title}</h1>
          <div className="discover-hero-meta">
            {featuredItem.year && <span className="discover-hero-meta-item">{featuredItem.year}</span>}
            {featuredItem.rating && (
              <span className="discover-hero-meta-item">
                ⭐ {featuredItem.rating}
              </span>
            )}
            {featuredItem.runtime && (
              <span className="discover-hero-meta-item">{featuredItem.runtime} min</span>
            )}
            {featuredItem.author && (
              <span className="discover-hero-meta-item">by {featuredItem.author}</span>
            )}
            {featuredItem.genres && featuredItem.genres.length > 0 && (
              <span className="discover-hero-meta-item">
                {featuredItem.genres.slice(0, 2).map(g => typeof g === 'string' ? g : g.name).join(', ')}
              </span>
            )}
          </div>
          {featuredItem.overview && (
            <p className="discover-hero-description">
              {featuredItem.overview.length > 200 
                ? featuredItem.overview.substring(0, 200) + '...'
                : featuredItem.overview}
            </p>
          )}
          <div className="discover-hero-actions">
            <button 
              className="discover-hero-btn discover-hero-btn-primary"
              onClick={handleViewDetails}
            >
              View Details
            </button>
            {mediaType === 'movie' || mediaType === 'tv_show' ? (
              <button className="discover-hero-btn discover-hero-btn-secondary">
                Watch Trailer
              </button>
            ) : mediaType === 'book' ? (
              <button className="discover-hero-btn discover-hero-btn-secondary">
                Sample
              </button>
            ) : (
              <button className="discover-hero-btn discover-hero-btn-secondary">
                Wishlist
              </button>
            )}
            <button 
              className={`discover-hero-btn discover-hero-btn-icon ${inLibrary ? 'in-library' : ''}`}
              onClick={handleAdd}
              disabled={inLibrary}
              title={inLibrary ? 'Already in archive' : 'Add to archive'}
            >
              {inLibrary ? '✓' : '+'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection

