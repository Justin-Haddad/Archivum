import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import '../App.css'

function AccountSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handlePasswordChange = (e) => {
    e.preventDefault()
    alert('Password change coming soon!')
  }

  return (
    <div className="page-container">
      <Header />
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage your account security and email</p>
      </div>

      <div className="page-content">
        <div className="settings-sections">
          {/* Email Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">Email Address</h3>
            <div className="settings-section-content">
              <div className="current-value">
                <span className="value-label">Current Email:</span>
                <span className="value-text">{user?.email}</span>
                {user?.email_confirmed_at ? (
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
              <form onSubmit={handlePasswordChange}>
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
      </div>
    </div>
  )
}

export default AccountSettings
