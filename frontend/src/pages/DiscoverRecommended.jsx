import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import '../App.css'

function DiscoverRecommended() {
  return (
    <div className="page-container">
      <Header />
      
      <div className="discover-header">
        <div className="discover-header-content">
          <h1 className="discover-title">Recommended for You</h1>
          <p className="discover-subtitle">Personalized recommendations based on your preferences</p>
        </div>
      </div>

      <div className="discover-content">
        <div className="discover-coming-soon">
          <div className="discover-coming-soon-icon"></div>
          <h2 className="discover-coming-soon-title">Recommended for You</h2>
          <p className="discover-coming-soon-text">This feature is coming soon!</p>
        </div>
      </div>
    </div>
  )
}

export default DiscoverRecommended

