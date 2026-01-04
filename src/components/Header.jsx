import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../App.css'

function Header({ onSignInClick, onSignUpClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

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

  const handleDiscoverClick = (e) => {
    e.preventDefault()
    if (location.pathname === '/') {
      // Scroll to discover section on home page
      const discoverSection = document.getElementById('discover')
      if (discoverSection) {
        discoverSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      navigate('/#discover')
      // Wait for navigation then scroll
      setTimeout(() => {
        const discoverSection = document.getElementById('discover')
        if (discoverSection) {
          discoverSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

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
          <a 
            href="#discover" 
            className="nav-link" 
            onClick={handleDiscoverClick}
          >
            Discover
          </a>
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

