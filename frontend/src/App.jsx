import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import './App.css'

function App() {
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 })
  const { user, signUp, signIn, loading } = useAuth()

  const socialProof = ['TMDB Powered', 'Open Library', 'IGDB Integration', 'Supabase Auth', 'React + Vite']

  const featureBlocks = [
    {
      eyebrow: 'Unified Archive',
      title: 'Track every movie, show, book, and game in one command center.',
      description: 'No more split tools. Archivum keeps your full media life in one clean archive with ratings, watch status, and custom notes.',
      points: ['One library across all media types', 'Fast filtering and sort controls', 'Quick add flows from discovery'],
      cta: 'Open My Archive',
      route: '/library',
      visual: '📚',
    },
    {
      eyebrow: 'Smarter Discovery',
      title: 'Find what is worth your time with curated trends and deep browsing.',
      description: 'Explore trending, new releases, and category hubs tailored to movies, TV, books, and games.',
      points: ['Dedicated discovery pages by media type', 'Rich detail pages with metadata', 'Designed for quick decision making'],
      cta: 'Explore Discover',
      route: '/discover/trending',
      visual: '✨',
      reverse: true,
    },
    {
      eyebrow: 'Profile & Community',
      title: 'Build your profile, share your taste, and connect with friends.',
      description: 'Turn your archive into identity. Keep it private or public, upload an avatar, and compare journeys with friends.',
      points: ['Custom profile with media stats', 'Account settings and personalization', 'Friends flow built for social discovery'],
      cta: 'View Profile',
      route: '/profile',
      visual: '👥',
    },
  ]

  const showcase = [
    { title: 'Movie Discovery', subtitle: 'Trending picks', emoji: '🎬' },
    { title: 'Book Hub', subtitle: 'Top reads', emoji: '📖' },
    { title: 'Game Explorer', subtitle: 'What to play', emoji: '🎮' },
    { title: 'TV Watchlist', subtitle: 'Series tracker', emoji: '📺' },
    { title: 'Media Detail', subtitle: 'Deep metadata', emoji: '🧠' },
    { title: 'Your Archive', subtitle: 'Everything saved', emoji: '🗂️' },
  ]

  const values = [
    { icon: '⚡', title: 'Fast workflow', text: 'Add and rate items in seconds with a lightweight, keyboard-friendly flow.' },
    { icon: '🧩', title: 'All-in-one stack', text: 'Movies, TV, books, and games live together in a single structured library.' },
    { icon: '🔒', title: 'Privacy controls', text: 'Keep your profile private or share your stats with your friends.' },
    { icon: '📈', title: 'Insightful stats', text: 'See your taste patterns and progress over time with clear totals.' },
    { icon: '🎨', title: 'Clean design', text: 'A premium editorial UI built for focus, not clutter.' },
    { icon: '🛠️', title: 'Built to scale', text: 'Supabase-powered auth and data foundation for future features.' },
  ]

  const faqs = [
    {
      question: 'Is Archivum free to start?',
      answer: 'Yes. You can create an account and start building your archive right away with no credit card required.',
    },
    {
      question: 'What can I track right now?',
      answer: 'Movies, TV shows, books, and video games. You can rate items, organize your archive, and discover new picks.',
    },
    {
      question: 'Can I keep my profile private?',
      answer: 'Yes. Profile privacy is built-in, and you can switch between public and private in your profile settings.',
    },
    {
      question: 'Where does discovery data come from?',
      answer: 'Archivum uses trusted external APIs like TMDB, Open Library, and IGDB for broad discovery coverage.',
    },
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


  const openAuthModal = () => {
    setAuthMode('login') // Always reset to login when opening
    setShowAuthModal(true)
  }

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 14
    setHeroTilt({ x, y })
  }

  const resetHeroTilt = () => setHeroTilt({ x: 0, y: 0 })

  return (
    <div className="app home-redesign">
      {/* Header - Top Navigation */}
      <Header onSignInClick={openAuthModal} onSignUpClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} />

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

      <main className="main-content home-main-modern">
        <section className="home-hero-modern">
          <div className="container home-hero-grid">
            <div className="home-hero-copy">
              <span className="hero-eyebrow">Built for modern media tracking</span>
              <h1 className="home-hero-title-modern">Your entire media life, perfectly organized.</h1>
              <p className="home-hero-subtitle-modern">
                Archivum helps you track, rate, and discover movies, TV, books, and games in one premium command center.
              </p>
              <div className="home-hero-cta-row">
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (user) navigate('/discover/trending')
                    else {
                      setAuthMode('signup')
                      setShowAuthModal(true)
                    }
                  }}
                >
                  {user ? 'Start Discovering' : 'Start Free'}
                </button>
                <button className="btn-secondary" onClick={() => navigate('/library')}>
                  View Demo Archive
                </button>
              </div>
            </div>

            <div
              className="home-hero-visual"
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={resetHeroTilt}
            >
              <div className="home-hero-fluid-bg">
                <span className="fluid-orb orb-one"></span>
                <span className="fluid-orb orb-two"></span>
                <span className="fluid-orb orb-three"></span>
              </div>

              <div
                className="home-hero-video-shell"
                style={{
                  transform: `perspective(1200px) rotateX(${-heroTilt.y}deg) rotateY(${heroTilt.x}deg) translateZ(0)`,
                }}
              >
                <video className="hero-video" autoPlay loop muted playsInline preload="auto" src="/video.mp4">
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="hero-float-card card-one">Live Discovery</div>
              <div className="hero-float-card card-two">4 Media Types</div>
            </div>
          </div>
        </section>

        <section className="home-social-proof">
          <div className="container social-proof-row">
            <span className="social-proof-label">Trusted stack</span>
            {socialProof.map((item) => (
              <span key={item} className="social-proof-item">{item}</span>
            ))}
          </div>
        </section>

        {featureBlocks.map((feature) => (
          <section key={feature.title} className="home-feature-section">
            <div className={`container home-feature-grid ${feature.reverse ? 'reverse' : ''}`}>
              <div className="home-feature-copy">
                <span className="feature-eyebrow">{feature.eyebrow}</span>
                <h2 className="home-feature-title">{feature.title}</h2>
                <p className="home-feature-text">{feature.description}</p>
                <ul className="home-feature-bullets">
                  {feature.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <button className="feature-link-btn" onClick={() => navigate(feature.route)}>
                  {feature.cta} →
                </button>
              </div>
              <div className="home-feature-visual">
                <div className="home-feature-mockup">{feature.visual}</div>
              </div>
            </div>
          </section>
        ))}

        <section className="home-showcase-section">
          <div className="container">
            <div className="showcase-header">
              <span className="feature-eyebrow">Template-style previews</span>
              <h2 className="home-feature-title">A premium interface across every workflow.</h2>
            </div>
            <div className="showcase-grid">
              {showcase.map((item) => (
                <div key={item.title} className="showcase-card">
                  <div className="showcase-emoji">{item.emoji}</div>
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="home-values-section">
          <div className="container">
            <div className="showcase-header">
              <span className="feature-eyebrow">Why Archivum</span>
              <h2 className="home-feature-title">Everything you need to stay consistent.</h2>
            </div>
            <div className="values-grid">
              {values.map((value) => (
                <div key={value.title} className="value-card">
                  <span className="value-icon">{value.icon}</span>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="home-faq-section">
          <div className="container faq-shell">
            <div className="showcase-header">
              <span className="feature-eyebrow">FAQ</span>
              <h2 className="home-feature-title">Questions before you start?</h2>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={faq.question} className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                  >
                    <span>{faq.question}</span>
                    <span>{openFaqIndex === index ? '−' : '+'}</span>
                  </button>
                  {openFaqIndex === index && <p className="faq-answer">{faq.answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="home-final-cta">
          <div className="container final-cta-shell">
            <h2>Build your archive in minutes.</h2>
            <p>Start your free Archivum account and turn your media habits into a clean system you will actually keep updated.</p>
            <button
              className="btn-primary"
              onClick={() => {
                if (user) navigate('/library')
                else {
                  setAuthMode('signup')
                  setShowAuthModal(true)
                }
              }}
            >
              {user ? 'Go to My Archive' : 'Get Started Free'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App


