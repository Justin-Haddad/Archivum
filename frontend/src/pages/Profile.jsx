import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLibrary } from '../contexts/LibraryContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import toast from 'react-hot-toast'
import '../App.css'

function Profile() {
  const { user, updateProfile, uploadProfilePicture, loading } = useAuth()
  const { library } = useLibrary()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(user?.user_metadata?.avatar_url || null)
  const [profileData, setProfileData] = useState({
    username: user?.user_metadata?.username || '',
    displayName: user?.user_metadata?.full_name || '',
    bio: user?.user_metadata?.bio || '',
    isPrivate: user?.user_metadata?.is_private || false,
  })

  // Calculate media stats
  const mediaStats = {
    movies: library.filter(item => item.media_type === 'movie').length,
    tvShows: library.filter(item => item.media_type === 'tv_show').length,
    books: library.filter(item => item.media_type === 'book').length,
    games: library.filter(item => item.media_type === 'game').length,
    total: library.length,
  }

  // Sync previewUrl with user state when it updates
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setPreviewUrl(user.user_metadata.avatar_url)
    } else {
      setPreviewUrl(null)
    }
  }, [user?.user_metadata?.avatar_url])

  // Sync profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.user_metadata?.username || '',
        displayName: user.user_metadata?.full_name || '',
        bio: user.user_metadata?.bio || '',
        isPrivate: user.user_metadata?.is_private || false,
      })
    }
  }, [user])

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
    } else {
      toast.success('Profile picture updated!')
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const username = formData.get('username')?.trim()
    const displayName = formData.get('displayName')?.trim()
    const bio = formData.get('bio')?.trim()
    const isPrivate = formData.get('isPrivate') === 'true'

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
      is_private: isPrivate,
    }

    // Update profile
    const result = await updateProfile(updates)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      setProfileData({
        username,
        displayName: displayName || '',
        bio: bio || '',
        isPrivate,
      })
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form data to current user metadata
    setProfileData({
      username: user?.user_metadata?.username || '',
      displayName: user?.user_metadata?.full_name || '',
      bio: user?.user_metadata?.bio || '',
      isPrivate: user?.user_metadata?.is_private || false,
    })
    // Reset preview to current avatar
    if (user?.user_metadata?.avatar_url) {
      setPreviewUrl(user.user_metadata.avatar_url)
    } else {
      setPreviewUrl(null)
    }
  }

  const displayName = profileData.displayName || profileData.username || user?.email?.split('@')[0] || 'User'
  const username = profileData.username || user?.email?.split('@')[0] || 'user'
  const bio = profileData.bio || ''
  const avatarUrl = previewUrl || user?.user_metadata?.avatar_url || null
  const profileInitial = displayName.charAt(0).toUpperCase()

  const statItems = [
    { key: 'movies', label: 'Movies', icon: 'MOV', value: mediaStats.movies },
    { key: 'tvShows', label: 'TV Shows', icon: 'TV', value: mediaStats.tvShows },
    { key: 'books', label: 'Books', icon: 'BKS', value: mediaStats.books },
    { key: 'games', label: 'Games', icon: 'GMS', value: mediaStats.games },
  ]

  const recentMilestones = library.slice(0, 4).map((item) => ({
    id: item.id,
    title: item.title || item.name || 'Untitled',
    mediaType: item.media_type ? item.media_type.replace('_', ' ').toUpperCase() : 'MEDIA',
  }))

  return (
    <div className="page-container profile-page">
      <div className="profile-page-backdrop"></div>
      <div className="profile-page-overlay"></div>
      <Header />
      <div className="page-content profile-page-content">
        {isEditing ? (
          <div className="profile-edit-shell profile-glass-panel">
            <div className="profile-edit-header">
              <div>
                <h1 className="profile-title">Edit Profile</h1>
                <p className="profile-subtitle">Update your identity and privacy settings.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <label className="form-label">Profile Photo</label>
                <div className="avatar-upload profile-avatar-upload">
                  <div className="avatar-preview">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="avatar-image"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="avatar-initial"
                      style={{ display: avatarUrl ? 'none' : 'flex' }}
                    >
                      {profileInitial}
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

              <div className="form-section">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="auth-input"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                  minLength={3}
                />
              </div>

              <div className="form-section">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  className="auth-input"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="form-section">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  className="auth-input bio-input"
                  rows="4"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  maxLength="200"
                />
                <p className="form-hint">Brief description for your profile. Max 200 characters.</p>
              </div>

              <div className="form-section">
                <label className="form-label">Privacy</label>
                <div className="privacy-toggle">
                  <label className="privacy-toggle-label">
                    <input
                      type="radio"
                      name="isPrivate"
                      value="false"
                      checked={!profileData.isPrivate}
                      onChange={() => setProfileData({ ...profileData, isPrivate: false })}
                    />
                    <span className="privacy-option">
                      <strong>Public</strong>
                      <span className="privacy-description">Friends can see your stats and archive</span>
                    </span>
                  </label>
                  <label className="privacy-toggle-label">
                    <input
                      type="radio"
                      name="isPrivate"
                      value="true"
                      checked={profileData.isPrivate}
                      onChange={() => setProfileData({ ...profileData, isPrivate: true })}
                    />
                    <span className="privacy-option">
                      <strong>Private</strong>
                      <span className="privacy-description">Only you can see your stats and archive</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-shell">
            <div className="profile-main-grid">
              <section className="profile-glass-panel profile-identity-card">
                <div className="profile-identity-top">
                  <div className="profile-avatar-large profile-avatar-modern">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="avatar-image-large"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="avatar-initial-large"
                      style={{ display: avatarUrl ? 'none' : 'flex' }}
                    >
                      {profileInitial}
                    </div>
                  </div>
                  <div 
                    className={`profile-status-badge ${profileData.isPrivate ? 'is-private' : 'is-public'}`}
                  >
                    {profileData.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                  </div>
                </div>

                <div className="profile-identity-copy">
                  <h1 className="profile-title">{displayName}</h1>
                  <p className="profile-handle">@{username}</p>
                  <p className="profile-bio">{bio || 'Curating your media universe in Archivum.'}</p>
                </div>

                <div className="profile-stats-grid">
                  {statItems.map((item) => (
                    <div key={item.key} className="profile-stat-card">
                      <span className="profile-stat-icon">{item.icon}</span>
                      <span className="profile-stat-value">{item.value}</span>
                      <span className="profile-stat-label">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="profile-total-row">
                  <span>Total Media</span>
                  <strong>{mediaStats.total}</strong>
                </div>
              </section>

              <section className="profile-right-rail">
                <div className="profile-action-row">
                  <button className="profile-action-btn" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                  <button className="profile-action-btn" onClick={() => navigate('/account-settings')}>
                    Account
                  </button>
                  <button className="profile-action-btn" onClick={() => navigate('/library')}>
                    Archive
                  </button>
                </div>

                <div className="profile-glass-panel profile-milestones">
                  <div className="profile-milestones-header">
                    <h2>Recent Milestones</h2>
                    <button className="profile-link-btn" onClick={() => navigate('/library')}>
                      View all
                    </button>
                  </div>
                  <div className="profile-milestones-list">
                    {recentMilestones.length > 0 ? (
                      recentMilestones.map((milestone) => (
                        <div key={milestone.id} className="profile-milestone-card">
                          <span className="profile-milestone-dot"></span>
                          <div>
                            <p className="profile-milestone-title">{milestone.title}</p>
                            <p className="profile-milestone-meta">{milestone.mediaType}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="profile-empty-milestone">
                        Add media to your archive to start tracking milestones.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
