import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../App.css'

function Header({ onSignInClick, onSignUpClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false)
  const discoverMenuRef = useRef(null)

  const handleSignOut = async () => {
    await signOut()
    setShowProfileMenu(false)
  }

  const handleHomeClick = (e) => {
    e.preventDefault()
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  // Close discover menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (discoverMenuRef.current && !discoverMenuRef.current.contains(event.target)) {
        setShowDiscoverMenu(false)
      }
    }

    if (showDiscoverMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
        }
  }, [showDiscoverMenu])

  return (
    <header className="header">
      <div className="container">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-text">Archivum</span>
        </div>
        <nav className="nav">
          <a 
            href="/" 
            className="nav-link" 
            onClick={handleHomeClick}
          >
            Home
          </a>
          <div 
            ref={discoverMenuRef}
            className="nav-link-dropdown"
          >
          <a 
              href="/discover/trending" 
            className="nav-link" 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowDiscoverMenu(!showDiscoverMenu);
              }}
          >
            Discover
          </a>
            {showDiscoverMenu && (
              <div className="nav-dropdown-menu">
                <a 
                  href="/discover/explore" 
                  className="nav-dropdown-item"
                  onClick={(e) => { e.preventDefault(); navigate('/discover/explore'); setShowDiscoverMenu(false); }}
                >
                  Explore
                </a>
                <a 
                  href="/discover/trending" 
                  className="nav-dropdown-item"
                  onClick={(e) => { e.preventDefault(); navigate('/discover/trending'); setShowDiscoverMenu(false); }}
                >
                  Trending Now
                </a>
                <a 
                  href="/discover/recommended" 
                  className="nav-dropdown-item"
                  onClick={(e) => { e.preventDefault(); navigate('/discover/recommended'); setShowDiscoverMenu(false); }}
                >
                  Recommended for You
                </a>
                <a 
                  href="/discover/new-releases" 
                  className="nav-dropdown-item"
                  onClick={(e) => { e.preventDefault(); navigate('/discover/new-releases'); setShowDiscoverMenu(false); }}
                >
                  New Releases
                </a>
                <div className="nav-dropdown-divider"></div>
                <a 
                  href="/discover/movies" 
                  className="nav-dropdown-item"
                  onClick={(e) => { e.preventDefault(); navigate('/discover/movies'); setShowDiscoverMenu(false); }}
                >
                  Movies
                </a>
                <a 
                  href="/discover/tv-shows" 
                  className="nav-dropdown-item"
                  onClick={(e) => { e.preventDefault(); navigate('/discover/tv-shows'); setShowDiscoverMenu(false); }}
                >
                  TV Shows
                </a>
                <a 
                  href="/discover/books" 
                  className="nav-dropdown-item"
                  onClick={(e) => { e.preventDefault(); navigate('/discover/books'); setShowDiscoverMenu(false); }}
                >
                  Books
                </a>
                <a 
                  href="/discover/games" 
                  className="nav-dropdown-item"
                  onClick={(e) => { e.preventDefault(); navigate('/discover/games'); setShowDiscoverMenu(false); }}
                >
                  Video Games
                </a>
              </div>
            )}
          </div>
          <a 
            href="/library" 
            className="nav-link" 
            onClick={(e) => { e.preventDefault(); navigate('/library'); }}
          >
            My Archive
          </a>
          <a 
            href="/friends" 
            className="nav-link" 
            onClick={(e) => { e.preventDefault(); navigate('/friends'); }}
          >
            Friends
          </a>
          {user ? (
            <div className="user-menu">
              <button 
                className="username-btn" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {user.user_metadata?.username || user.email}
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {user.user_metadata?.avatar_url ? (
                        <>
                          <img 
                            src={user.user_metadata.avatar_url} 
                            alt="Profile" 
                            className="profile-avatar-image"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          <div className="profile-avatar-initial">
                            {(user.user_metadata?.username || user.email).charAt(0).toUpperCase()}
                          </div>
                        </>
                      ) : (
                        <div className="profile-avatar-initial">
                          {(user.user_metadata?.username || user.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="profile-info">
                      <div className="profile-username">{user.user_metadata?.username || 'User'}</div>
                      <div className="profile-email">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="profile-divider"></div>
                  
                  <div className="profile-menu">
                    <button 
                      className="profile-menu-item" 
                      onClick={() => {
                        navigate('/profile')
                        setShowProfileMenu(false)
                      }}
                    >
                      <span className="menu-icon">👤</span>
                      View Profile
                    </button>
                    <button 
                      className="profile-menu-item" 
                      onClick={() => {
                        navigate('/account-settings')
                        setShowProfileMenu(false)
                      }}
                    >
                      <span className="menu-icon">⚙️</span>
                      Account Settings
                    </button>
                    <button 
                      className="profile-menu-item" 
                      onClick={handleSignOut}
                    >
                      <span className="menu-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : location.pathname === '/' && onSignInClick && onSignUpClick ? (
            <>
              <button className="btn-secondary" onClick={onSignInClick}>Sign in</button>
              <button className="btn-primary" onClick={onSignUpClick}>Sign up</button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => navigate('/')}>
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header

