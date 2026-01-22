import { useNavigate } from 'react-router-dom'
import { useLibrary } from '../../contexts/LibraryContext'

function MediaCard({ item, mediaType, onAddToLibrary, showQuickAction = true }) {
  const navigate = useNavigate()
  const { isInLibrary } = useLibrary()

  const inLibrary = isInLibrary(item.media_type, item.media_id)

  const handleCardClick = () => {
    navigate(`/media/${item.media_type}/${item.media_id}`)
  }

  const handleAddClick = (e) => {
    e.stopPropagation()
    if (!inLibrary) {
      onAddToLibrary(item)
    }
  }

  return (
    <div className="discover-media-card" onClick={handleCardClick}>
      <div className="discover-media-card-poster">
        {item.poster_url ? (
          <img src={item.poster_url} alt={item.title} />
        ) : (
          <div className="discover-media-card-fallback">
            {mediaType === 'movie' ? '🎬' : mediaType === 'tv_show' ? '📺' : mediaType === 'book' ? '📖' : '🎮'}
          </div>
        )}
        {item.rating && (
          <div className="discover-media-card-rating">
            ⭐ {typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating}
          </div>
        )}
        {showQuickAction && (
          <button
            className={`discover-media-card-action ${inLibrary ? 'in-library' : ''}`}
            onClick={handleAddClick}
            disabled={inLibrary}
            title={inLibrary ? 'Already in archive' : 'Add to archive'}
          >
            {inLibrary ? '✓' : '+'}
          </button>
        )}
      </div>
      <div className="discover-media-card-info">
        <h3 className="discover-media-card-title">{item.title}</h3>
        <div className="discover-media-card-meta">
          {item.year && <span className="discover-media-card-year">{item.year}</span>}
          {item.author && <span className="discover-media-card-author">by {item.author}</span>}
          {item.genres && item.genres.length > 0 && (
            <span className="discover-media-card-genre">
              {typeof item.genres[0] === 'string' ? item.genres[0] : item.genres[0].name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MediaCard

