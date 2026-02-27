import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Create the context
const AuthContext = createContext({})

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Always merge metadata against freshest auth user to avoid stale overwrites.
  const getLatestUserMetadata = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return {
      latestUser: data?.user ?? null,
      metadata: data?.user?.user_metadata || {},
    }
  }

  // Sign up new user
  const signUp = async (email, password, username) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: undefined, // Disable email confirmation redirect
        }
      })
      if (error) throw error
      
      // Automatically set the user after signup (no email confirmation needed)
      if (data.user) {
        setUser(data.user)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign in existing user
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Update user profile (display name, bio)
  const updateProfile = async (updates) => {
    try {
      setLoading(true)
      const { latestUser, metadata } = await getLatestUserMetadata()
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...metadata,
          ...updates,
        }
      })
      if (error) throw error
      
      // Update local user state
      if (data.user) {
        setUser(data.user)
      } else if (latestUser) {
        setUser(latestUser)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Upload profile picture to Supabase Storage
  const uploadProfilePicture = async (file) => {
    try {
      if (!user) {
        throw new Error('User must be logged in to upload a picture')
      }

      // Validate file
      if (!file) {
        throw new Error('No file provided')
      }

      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB')
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!validTypes.includes(file.type)) {
        throw new Error('File must be JPG, PNG, or GIF')
      }

      // Use a user-scoped path so common Supabase RLS policies can authorize inserts.
      const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        return {
          data: null,
          error: `Storage upload failed: ${uploadError.message}`,
        }
      }

      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user metadata with the new avatar URL
      const { latestUser, metadata } = await getLatestUserMetadata()
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: {
          ...metadata,
          avatar_url: urlData.publicUrl,
        }
      })

      if (updateError) {
        return {
          data: null,
          error: `Profile metadata update failed: ${updateError.message}`,
        }
      }

      // Update local user state
      if (updateData.user) {
        setUser(updateData.user)
      } else if (latestUser) {
        setUser(latestUser)
      }

      return { 
        data: { url: urlData.publicUrl }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error: `Avatar upload failed: ${error.message}` }
    }
  }

  // Check if user is logged in on mount
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error.message)
      } finally {
        setLoading(false)
      }
    }
    
    getInitialSession()
  }, [])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadProfilePicture,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}