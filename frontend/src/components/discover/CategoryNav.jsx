import { useNavigate, useLocation } from 'react-router-dom'

function CategoryNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const categories = [
    { path: '/discover/movies', label: 'Movies', icon: '🎬' },
    { path: '/discover/tv-shows', label: 'TV Shows', icon: '📺' },
    { path: '/discover/books', label: 'Books', icon: '📖' },
    { path: '/discover/games', label: 'Games', icon: '🎮' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="discover-category-nav">
      <div className="discover-category-nav-content">
        {categories.map(category => (
          <button
            key={category.path}
            className={`discover-category-nav-item ${isActive(category.path) ? 'active' : ''}`}
            onClick={() => navigate(category.path)}
          >
            <span className="discover-category-nav-icon">{category.icon}</span>
            <span className="discover-category-nav-label">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryNav

