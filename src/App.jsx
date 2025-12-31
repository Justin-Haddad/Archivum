import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import './App.css'

function App() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [mediaType, setMediaType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const { user, signUp, signIn, signOut, loading } = useAuth()

  const trendingMedia = [
    { 
      id: 1, 
      title: 'Oppenheimer', 
      type: 'movie', 
      year: 2023, 
      rating: 4.8, 
      poster: '🎬',
      watched: false,
      userRating: null
    },
    { 
      id: 2, 
      title: 'Breaking Bad', 
      type: 'show', 
      year: 2008, 
      rating: 4.9, 
      poster: '📺',
      watched: true,
      userRating: 5
    },
    { 
      id: 3, 
      title: 'Dune', 
      type: 'book', 
      year: 1965, 
      rating: 4.7, 
      poster: '📖',
      watched: false,
      userRating: null
    },
    { 
      id: 4, 
      title: 'The Last of Us', 
      type: 'show', 
      year: 2023, 
      rating: 4.6, 
      poster: '📺',
      watched: true,
      userRating: 4.5
    },
    { 
      id: 5, 
      title: 'Atomic Habits', 
      type: 'book', 
      year: 2018, 
      rating: 4.8, 
      poster: '📖',
      watched: false,
      userRating: null
    },
    { 
      id: 6, 
      title: 'Inception', 
      type: 'movie', 
      year: 2010, 
      rating: 4.9, 
      poster: '🎬',
      watched: true,
      userRating: 5
    },
    { 
      id: 7, 
      title: 'Elden Ring', 
      type: 'game', 
      year: 2022, 
      rating: 4.7, 
      poster: '🎮',
      watched: false,
      userRating: null
    },
    { 
      id: 8, 
      title: 'The Legend of Zelda', 
      type: 'game', 
      year: 2023, 
      rating: 4.9, 
      poster: '🎮',
      watched: true,
      userRating: 5
    },
  ]

  const stats = {
    moviesWatched: 127,
    showsWatched: 43,
    booksRead: 56,
    gamesPlayed: 34,
    totalHours: 2847
  }

  const useCases = [
    { 
      title: 'Track Your Watchlist', 
      desc: 'Build a comprehensive watchlist: track movies you want to see, shows you\'re watching, books you\'re reading, and games you\'re playing.',
      tags: ['Movies', 'TV Shows'],
      action: 'See it work'
    },
    { 
      title: 'Rate & Review Everything', 
      desc: 'Rate your favorite media from 1-10 stars and leave personal notes. Build your personal rating system over time.',
      tags: ['All Media'],
      action: 'See it work'
    },
    { 
      title: 'Discover What\'s Next', 
      desc: 'Search millions of titles across movies, TV shows, books, and games. Find your next favorite based on what you love.',
      tags: ['Discover'],
      action: 'See it work'
    },
    { 
      title: 'Build Your Collection', 
      desc: 'Organize your media into custom collections. Create shelves for genres, moods, or any category you want.',
      tags: ['Collections'],
      action: 'See it work'
    },
  ]

  const features = [
    { icon: '🎯', title: 'Track Everything', desc: 'Keep tabs on all your movies, shows, books, and games in one beautiful place' },
    { icon: '⭐', title: 'Rate & Review', desc: 'Rate your favorites and leave personal notes for each item in your collection' },
    { icon: '🔍', title: 'Discover New Media', desc: 'Search millions of titles and find your next favorite watch or read' },
    { icon: '📊', title: 'Visual Insights', desc: 'See your viewing habits and collection stats with beautiful visualizations' },
  ]

  const handleAuth = async (e) => {
    e.preventDefault()
    
    const email = e.target.email.value
    const password = e.target.password.value
    const confirmPassword = e.target.confirmPassword?.value
    const username = e.target.username?.value // Only exists in signup mode
    
    // Validate passwords match in signup mode
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        alert('Passwords do not match!')
        return
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters long')
        return
      }
    }
    
    let result
    if (authMode === 'signup') {
      result = await signUp(email, password, username)
    } else {
      result = await signIn(email, password)
    }
    
    if (result.error) {
      alert(result.error) // Show error to user
    } else {
      setShowAuthModal(false) // Close modal on success
      if (authMode === 'signup') {
        alert('Account created successfully! You are now logged in.')
      }
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const openAuthModal = () => {
    setAuthMode('login') // Always reset to login when opening
    setShowAuthModal(true)
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          ★
        </span>
      )
    }
    return stars
  }

  return (
    <div className="app">
      {/* Header - Top Navigation */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <span className="logo-text">Archivum</span>
          </div>
          <nav className="nav">
            <a href="#home" className="nav-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
            <a href="/library" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/library'); }}>My Archive</a>
            <a href="#friends" className="nav-link">Friends</a>
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
                    </div>
                    
                    <div className="profile-divider"></div>
                    
                    <button 
                      className="profile-menu-item sign-out-item" 
                      onClick={() => {
                        handleSignOut()
                        setShowProfileMenu(false)
                      }}
                    >
                      <span className="menu-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn-secondary" onClick={openAuthModal}>Sign in</button>
                <button className="btn-primary" onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}>Sign up</button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuthModal(false)}>×</button>
            <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '1rem', opacity: 0.8 }}>📚</div>
            <h2 className="modal-title">
              {authMode === 'login' ? 'Welcome Back!' : 'Join Archivum'}
            </h2>
            <p className="modal-subtitle">
              {authMode === 'login' ? 'Sign in to access your collection' : 'Start tracking your media today'}
            </p>
            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === 'signup' && (
                <input type="text" name="username" placeholder="Choose a username" className="auth-input" required />
              )}
              <input type="email" name="email" placeholder="Email address" className="auth-input" required />
              <input type="password" name="password" placeholder="Password" className="auth-input" required />
              {authMode === 'signup' && (
                <input type="password" name="confirmPassword" placeholder="Confirm Password" className="auth-input" required />
              )}
              <button type="submit" className="btn-primary btn-full">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            <p className="auth-switch">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span 
                className="auth-link" 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              >
                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowProfileModal(false)}>×</button>
            <h2 className="modal-title">Profile</h2>
            <p className="modal-subtitle">Manage your public profile information</p>
            
            <form className="profile-form" onSubmit={(e) => { e.preventDefault(); alert('Profile update coming soon!'); }}>
              {/* Profile Avatar */}
              <div className="form-section">
                <label className="form-label">Profile Photo</label>
                <div className="avatar-upload">
                  <div className="avatar-preview">
                    {(user.user_metadata?.username || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="avatar-actions">
                    <button type="button" className="btn-secondary">Change Photo</button>
                    <p className="form-hint">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="form-section">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  defaultValue={user.user_metadata?.username || ''} 
                  placeholder="Enter your username"
                />
              </div>

              {/* Display Name */}
              <div className="form-section">
                <label className="form-label">Display Name</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  defaultValue={user.user_metadata?.full_name || ''} 
                  placeholder="Enter your display name"
                />
              </div>

              {/* Bio */}
              <div className="form-section">
                <label className="form-label">Bio</label>
                <textarea 
                  className="auth-input bio-input" 
                  rows="4"
                  defaultValue={user.user_metadata?.bio || ''} 
                  placeholder="Tell us about yourself..."
                  maxLength="200"
                />
                <p className="form-hint">Brief description for your profile. Max 200 characters.</p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowProfileModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {showAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAccountModal(false)}>×</button>
            <h2 className="modal-title">Account Settings</h2>
            <p className="modal-subtitle">Manage your account security and email</p>
            
            <div className="settings-sections">
              {/* Email Section */}
              <div className="settings-section">
                <h3 className="settings-section-title">Email Address</h3>
                <div className="settings-section-content">
                  <div className="current-value">
                    <span className="value-label">Current Email:</span>
                    <span className="value-text">{user.email}</span>
                    {user.email_confirmed_at ? (
                      <span className="verified-badge">✓ Verified</span>
                    ) : (
                      <span className="unverified-badge">⚠ Not Verified</span>
                    )}
                  </div>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => alert('Change email feature coming soon!')}
                  >
                    Change Email
                  </button>
                </div>
              </div>

              {/* Password Section */}
              <div className="settings-section">
                <h3 className="settings-section-title">Password</h3>
                <div className="settings-section-content">
                  <p className="settings-description">
                    Update your password to keep your account secure.
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); alert('Password change coming soon!'); }}>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input 
                        type="password" 
                        className="auth-input" 
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input 
                        type="password" 
                        className="auth-input" 
                        placeholder="Enter new password"
                        minLength="6"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="auth-input" 
                        placeholder="Confirm new password"
                        minLength="6"
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAccountModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {/* Hero Section - Center-aligned, Editorial */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Track your Media, Build your Archive 
            </h1>
            <p className="hero-subtitle">
              Track your favorite movies, shows, books, and games. Rate what you love and discover what's next.
            </p>
            <div className="hero-video-container">
              <video 
                className="hero-video"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                src="/video.mp4"
                onError={(e) => console.error('Video error:', e)}
                onLoadedData={() => console.log('Video loaded successfully')}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

      {/* Use Cases Section */}
      <section className="use-cases-section" id="features">
        <div className="container">
          <h2 className="section-title">Explore Archivum</h2>
          <div className="use-cases-grid">
            {useCases.map((useCase, index) => (
              <div key={index} className="use-case-card">
                <div className="use-case-header">
                  <h3 className="use-case-title">{useCase.title}</h3>
                  <div className="use-case-tags">
                    {useCase.tags.map((tag, i) => (
                      <span key={i} className="use-case-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <p className="use-case-desc">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Command Center / Your Library Section */}
      <section className="command-center-section">
        <div className="container">
          <h2 className="section-title">Your command center for your media collection</h2>
          <div className="command-center-grid">
            <div className="command-card">
              <div className="command-icon">📚</div>
              <h3 className="command-title">Your Library</h3>
              <p className="command-desc">A central place to view all your movies, shows, books, and games in one organized collection.</p>
            </div>
            <div className="command-card">
              <div className="command-icon">🔔</div>
              <h3 className="command-title">Discover</h3>
              <p className="command-desc">Search and discover new media to add to your collection. Find your next favorite watch or read.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Stats Section - If User Logged In */}
      {user && (
        <section className="stats-section">
          <div className="container">
            <h2 className="section-title">Your Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.moviesWatched}</div>
                <div className="stat-label">Movies</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.showsWatched}</div>
                <div className="stat-label">Shows</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.booksRead}</div>
                <div className="stat-label">Books</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.gamesPlayed}</div>
                <div className="stat-label">Games</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalHours}</div>
                <div className="stat-label">Hours</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="features-container">
          <h2 className="section-title">Why Choose Archivum?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>📚 Archivum</h4>
              <p>Track, rate, and discover your favorite movies, shows, books, and games. Your personal media collection, beautifully organized.</p>
            </div>
            <div className="footer-section">
              <h4>Explore</h4>
              <a href="#movies">Movies</a>
              <a href="#shows">TV Shows</a>
              <a href="#books">Books</a>
              <a href="#games">Games</a>
              <a href="#lists">My Lists</a>
            </div>
            <div className="footer-section">
              <h4>Community</h4>
              <a href="#reviews">Reviews</a>
              <a href="#users">Top Members</a>
              <a href="#discussions">Discussions</a>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <a href="#twitter">Twitter</a>
              <a href="#instagram">Instagram</a>
              <a href="#discord">Discord</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Archivum. Curated with care.</p>
            <p className="tmdb-attribution">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App


