import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import '../App.css'

function Profile() {
  const { user, updateProfile, uploadProfilePicture, loading } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(user?.user_metadata?.avatar_url || null)

  // Sync previewUrl with user state when it updates
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setPreviewUrl(user.user_metadata.avatar_url)
    } else {
      setPreviewUrl(null)
    }
  }, [user?.user_metadata?.avatar_url])

  // Handle profile picture upload
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('File must be JPG, PNG, or GIF')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    setUploading(true)
    const result = await uploadProfilePicture(file)
    setUploading(false)

    if (result.error) {
      toast.error(result.error)
      // Reset preview on error - will be handled by useEffect
    } else {
      toast.success('Profile picture updated!')
      // The useEffect will update previewUrl when user state changes
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const username = formData.get('username')?.trim()
    const displayName = formData.get('displayName')?.trim()
    const bio = formData.get('bio')?.trim()

    // Validate username
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }

    // Prepare updates
    const updates = {
      username: username,
      full_name: displayName || null,
      bio: bio || null,
    }

    // Update profile
    const result = await updateProfile(updates)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated successfully!')
      // Optionally navigate back after a short delay
      setTimeout(() => {
        navigate('/')
      }, 1000)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your public profile information</p>
      </div>

      <div className="page-content">
        <form className="profile-form" onSubmit={handleSubmit}>
          {/* Profile Avatar */}
          <div className="form-section">
            <label className="form-label">Profile Photo</label>
            <div className="avatar-upload">
              <div className="avatar-preview">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile" 
                    className="avatar-image"
                    onError={(e) => {
                      // Fallback to initial if image fails to load
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className="avatar-initial" 
                  style={{ display: previewUrl ? 'none' : 'flex' }}
                >
                  {(user?.user_metadata?.username || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="avatar-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </button>
                <p className="form-hint">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="form-section">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              name="username"
              className="auth-input" 
              defaultValue={user?.user_metadata?.username || ''} 
              placeholder="Enter your username"
              required
              minLength={3}
            />
          </div>

          {/* Display Name */}
          <div className="form-section">
            <label className="form-label">Display Name</label>
            <input 
              type="text" 
              name="displayName"
              className="auth-input" 
              defaultValue={user?.user_metadata?.full_name || ''} 
              placeholder="Enter your display name"
            />
          </div>

          {/* Bio */}
          <div className="form-section">
            <label className="form-label">Bio</label>
            <textarea 
              name="bio"
              className="auth-input bio-input" 
              rows="4"
              defaultValue={user?.user_metadata?.bio || ''} 
              placeholder="Tell us about yourself..."
              maxLength="200"
            />
            <p className="form-hint">Brief description for your profile. Max 200 characters.</p>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
