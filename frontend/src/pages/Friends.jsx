import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import toast from 'react-hot-toast'
import '../App.css'

function Friends() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('friends') // 'friends', 'requests', 'search'
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  // Helper to get user display info from ID (simplified - stores minimal info)
  const getUserInfo = async (userId) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (data) {
        return {
          username: data.username || 'user',
          displayName: data.display_name || data.username || 'User',
          avatarUrl: data.avatar_url,
          email: data.email || 'user@example.com',
        }
      }
    } catch (e) {
      // Table doesn't exist or no data
    }
    
    return {
      username: 'user',
      displayName: 'User',
      avatarUrl: null,
      email: 'user@example.com',
    }
  }

  // Fetch friends list
  const fetchFriends = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (error) throw error

      const formattedFriends = await Promise.all(
        (data || []).map(async (friendship) => {
          const friendId = friendship.friend_id === user.id 
            ? friendship.user_id 
            : friendship.friend_id
          
          const friendInfo = await getUserInfo(friendId)
          
          return {
            id: friendship.id,
            friendId: friendId,
            ...friendInfo,
          }
        })
      )

      setFriends(formattedFriends)
    } catch (error) {
      console.error('Error fetching friends:', error)
      toast.error('Failed to load friends')
    }
  }

  // Fetch friend requests (received)
  const fetchFriendRequests = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending')

      if (error) throw error

      const formattedRequests = await Promise.all(
        (data || []).map(async (request) => {
          const userInfo = await getUserInfo(request.user_id)
          return {
            id: request.id,
            userId: request.user_id,
            ...userInfo,
            createdAt: request.created_at,
          }
        })
      )

      setFriendRequests(formattedRequests)
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  // Fetch sent requests
  const fetchSentRequests = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')

      if (error) throw error

      const formattedSent = await Promise.all(
        (data || []).map(async (request) => {
          const friendInfo = await getUserInfo(request.friend_id)
          return {
            id: request.id,
            friendId: request.friend_id,
            ...friendInfo,
            createdAt: request.created_at,
          }
        })
      )

      setSentRequests(formattedSent)
    } catch (error) {
      console.error('Error fetching sent requests:', error)
    }
  }

  // Search users
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const isEmail = searchQuery.includes('@')
      
      if (isEmail) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .ilike('email', `%${searchQuery}%`)
          .limit(10)
        
        if (data && data.length > 0) {
          setSearchResults(data.map(u => ({
            id: u.user_id,
            friendId: u.user_id,
            email: u.email,
            username: u.username || u.email?.split('@')[0],
            displayName: u.display_name || u.username || u.email?.split('@')[0],
            avatarUrl: u.avatar_url,
          })))
        } else {
          setSearchResults([])
          toast.info('User not found. Make sure they have a profile set up.')
        }
      } else {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .ilike('username', `%${searchQuery}%`)
          .limit(10)
        
        if (data && data.length > 0) {
          setSearchResults(data.map(u => ({
            id: u.user_id,
            friendId: u.user_id,
            email: u.email,
            username: u.username || u.email?.split('@')[0],
            displayName: u.display_name || u.username || u.email?.split('@')[0],
            avatarUrl: u.avatar_url,
          })))
        } else {
          setSearchResults([])
        }
      }
    } catch (error) {
      console.error('Error searching users:', error)
      if (error.message?.includes('does not exist')) {
        toast.error('User search requires a user_profiles table. See FRIENDS_SETUP.md for setup instructions.')
      } else {
        toast.error('Failed to search users')
      }
    } finally {
      setSearching(false)
    }
  }

  // Send friend request
  const sendFriendRequest = async (friendId) => {
    if (!user) {
      toast.error('Please sign in to send friend requests')
      return
    }

    if (friendId === user.id) {
      toast.error('You cannot add yourself as a friend')
      return
    }

    try {
      const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .maybeSingle()

      if (existing) {
        if (existing.status === 'accepted') {
          toast.error('You are already friends with this user')
        } else if (existing.status === 'pending') {
          toast.error('Friend request already sent')
        }
        return
      }

      const { error } = await supabase
        .from('friends')
        .insert([
          {
            user_id: user.id,
            friend_id: friendId,
            status: 'pending',
          }
        ])

      if (error) throw error

      toast.success('Friend request sent!')
      fetchSentRequests()
      handleSearch({ preventDefault: () => {} })
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast.error('Failed to send friend request')
    }
  }

  // Accept friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      if (error) throw error

      toast.success('Friend request accepted!')
      fetchFriendRequests()
      fetchFriends()
    } catch (error) {
      console.error('Error accepting friend request:', error)
      toast.error('Failed to accept friend request')
    }
  }

  // Reject friend request
  const rejectFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId)

      if (error) throw error

      toast.success('Friend request rejected')
      fetchFriendRequests()
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      toast.error('Failed to reject friend request')
    }
  }

  // Remove friend
  const removeFriend = async (friendshipId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error

      toast.success('Friend removed')
      fetchFriends()
    } catch (error) {
      console.error('Error removing friend:', error)
      toast.error('Failed to remove friend')
    }
  }

  // Check if user is already a friend or has pending request
  const getUserStatus = (userId) => {
    const isFriend = friends.some(f => f.friendId === userId)
    const hasPendingReceived = friendRequests.some(r => r.userId === userId)
    const hasPendingSent = sentRequests.some(r => r.friendId === userId)
    
    if (isFriend) return 'friend'
    if (hasPendingReceived) return 'pending_received'
    if (hasPendingSent) return 'pending_sent'
    return 'none'
  }

  useEffect(() => {
    if (user) {
      setLoading(true)
      Promise.all([
        fetchFriends(),
        fetchFriendRequests(),
        fetchSentRequests(),
      ]).finally(() => setLoading(false))
    }
  }, [user])

  if (!user) {
    return (
      <div className="page-container">
        <Header />
        <div className="page-header">
          <h1 className="page-title">Friends</h1>
        </div>
        <div className="page-content" style={{ textAlign: 'center', padding: 'var(--space-5xl)' }}>
          <div className="auth-prompt">
            <div className="auth-prompt-icon">🔒</div>
            <h2 className="auth-prompt-title">Sign In Required</h2>
            <p className="auth-prompt-message">
              Please sign in or sign up to view and manage your friends
            </p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: 'friends', icon: '👥', label: 'Friends', count: friends.length },
    { key: 'requests', icon: '📨', label: 'Requests', count: friendRequests.length },
    { key: 'search', icon: '🔍', label: 'Find Friends', count: null },
  ]

  return (
    <div className="page-container">
      <Header />
      <div className="page-header">
        <h1 className="page-title">Friends</h1>
        <p className="page-subtitle">Connect with others and build your network</p>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div className="library-tabs friends-page-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`library-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.key)
                setSearchQuery('')
                setSearchResults([])
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className="tab-count">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search Section - Only show on search tab */}
        {activeTab === 'search' && (
          <div className="library-search-section">
            <form className="library-search-form" onSubmit={handleSearch}>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="search-btn"
                  disabled={searching}
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Friends List */}
        {activeTab === 'friends' && (
          <div className="library-section">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-4xl)' }}>
                <p>Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="empty-library">
                <div className="empty-icon">👥</div>
                <p className="empty-message">No friends yet</p>
                <p className="empty-submessage">Search for friends to start building your network</p>
              </div>
            ) : (
              <div className="friends-grid">
                {friends.map(friend => (
                  <div key={friend.id} className="friend-card-new">
                    <div className="friend-avatar-new">
                      {friend.avatarUrl ? (
                        <img src={friend.avatarUrl} alt={friend.displayName} />
                      ) : (
                        <div className="friend-avatar-initial-new">
                          {friend.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="friend-info-new">
                      <h3 className="friend-name-new">{friend.displayName}</h3>
                      <p className="friend-username-new">@{friend.username}</p>
                    </div>
                    <div className="friend-actions-new">
                      <button
                        className="btn-secondary"
                        onClick={() => removeFriend(friend.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friend Requests */}
        {activeTab === 'requests' && (
          <div className="library-section">
            {friendRequests.length === 0 ? (
              <div className="empty-library">
                <div className="empty-icon">📨</div>
                <p className="empty-message">No pending friend requests</p>
              </div>
            ) : (
              <div className="friends-grid">
                {friendRequests.map(request => (
                  <div key={request.id} className="friend-card-new">
                    <div className="friend-avatar-new">
                      {request.avatarUrl ? (
                        <img src={request.avatarUrl} alt={request.displayName} />
                      ) : (
                        <div className="friend-avatar-initial-new">
                          {request.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="friend-info-new">
                      <h3 className="friend-name-new">{request.displayName}</h3>
                      <p className="friend-username-new">@{request.username}</p>
                    </div>
                    <div className="friend-actions-new">
                      <button
                        className="btn-primary"
                        onClick={() => acceptFriendRequest(request.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => rejectFriendRequest(request.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 className="section-title" style={{ marginTop: 'var(--space-4xl)' }}>
              Sent Requests
            </h2>
            {sentRequests.length === 0 ? (
              <div className="empty-library">
                <div className="empty-icon">📤</div>
                <p className="empty-message">No pending sent requests</p>
              </div>
            ) : (
              <div className="friends-grid">
                {sentRequests.map(request => (
                  <div key={request.id} className="friend-card-new">
                    <div className="friend-avatar-new">
                      {request.avatarUrl ? (
                        <img src={request.avatarUrl} alt={request.displayName} />
                      ) : (
                        <div className="friend-avatar-initial-new">
                          {request.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="friend-info-new">
                      <h3 className="friend-name-new">{request.displayName}</h3>
                      <p className="friend-username-new">@{request.username}</p>
                    </div>
                    <div className="friend-actions-new">
                      <span className="pending-badge-new">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {activeTab === 'search' && searchResults.length > 0 && (
          <div className="library-section">
            <h2 className="section-title">Search Results</h2>
            <div className="friends-grid">
              {searchResults.map(user => {
                const status = getUserStatus(user.id || user.friendId)
                return (
                  <div key={user.id || user.friendId} className="friend-card-new">
                    <div className="friend-avatar-new">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName} />
                      ) : (
                        <div className="friend-avatar-initial-new">
                          {user.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="friend-info-new">
                      <h3 className="friend-name-new">{user.displayName}</h3>
                      <p className="friend-username-new">@{user.username}</p>
                    </div>
                    <div className="friend-actions-new">
                      {status === 'none' && (
                        <button
                          className="btn-primary"
                          onClick={() => sendFriendRequest(user.id || user.friendId)}
                        >
                          Add Friend
                        </button>
                      )}
                      {status === 'friend' && (
                        <span className="friend-badge-new">Friends</span>
                      )}
                      {status === 'pending_sent' && (
                        <span className="pending-badge-new">Request Sent</span>
                      )}
                      {status === 'pending_received' && (
                        <button
                          className="btn-primary"
                          onClick={() => {
                            const request = friendRequests.find(r => r.userId === (user.id || user.friendId))
                            if (request) acceptFriendRequest(request.id)
                          }}
                        >
                          Accept Request
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'search' && searchQuery && !searching && searchResults.length === 0 && (
          <div className="library-section">
            <div className="empty-library">
              <div className="empty-icon">🔍</div>
              <p className="empty-message">No users found</p>
              <p className="empty-submessage">Try searching by username or email</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Friends
