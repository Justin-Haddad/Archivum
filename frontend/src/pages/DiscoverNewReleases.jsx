import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import '../App.css'

function DiscoverNewReleases() {
  return (
    <div className="page-container">
      <Header />
      
      <div className="discover-header">
        <div className="discover-header-content">
          <h1 className="discover-title">New Releases</h1>
          <p className="discover-subtitle">Discover the latest movies, TV shows, books, and games</p>
        </div>
      </div>

      <div className="discover-content">
        <div className="discover-coming-soon">
          <div className="discover-coming-soon-icon"></div>
          <h2 className="discover-coming-soon-title">New Releases</h2>
          <p className="discover-coming-soon-text">This feature is coming soon!</p>
        </div>
      </div>
    </div>
  )
}

export default DiscoverNewReleases

