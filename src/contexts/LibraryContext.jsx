import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

// Create the context
const LibraryContext = createContext({})

// Custom hook to use library context
export const useLibrary = () => {
  const context = useContext(LibraryContext)
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider')
  }
  return context
}

// Library Provider Component
export const LibraryProvider = ({ children }) => {
  const { user } = useAuth()
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch user's library
  const fetchLibrary = async () => {
    if (!user) {
      setLibrary([])
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_library')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (error) throw error
      setLibrary(data || [])
    } catch (error) {
      console.error('Error fetching library:', error.message)
      setLibrary([])
    } finally {
      setLoading(false)
    }
  }

  // Add media to library
  const addToLibrary = async (mediaItem, rating = null) => {
    if (!user) {
      return { error: 'You must be logged in to add items to your library' }
    }

    if (rating !== null && (rating < 1 || rating > 10)) {
      return { error: 'Rating must be between 1 and 10' }
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_library')
        .insert([
          {
            user_id: user.id,
            media_type: mediaItem.media_type,
            media_id: mediaItem.media_id,
            title: mediaItem.title,
            year: mediaItem.year || null,
            poster_url: mediaItem.poster_url || null,
            rating: rating,
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Update local state
      setLibrary(prev => [data, ...prev])

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Remove media from library
  const removeFromLibrary = async (libraryItemId) => {
    if (!user) {
      return { error: 'You must be logged in' }
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('id', libraryItemId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setLibrary(prev => prev.filter(item => item.id !== libraryItemId))

      return { error: null }
    } catch (error) {
      return { error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Update rating for a library item
  const updateRating = async (libraryItemId, rating) => {
    if (!user) {
      return { error: 'You must be logged in' }
    }

    if (rating < 1 || rating > 10) {
      return { error: 'Rating must be between 1 and 10' }
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_library')
        .update({ 
          rating: rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', libraryItemId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setLibrary(prev => 
        prev.map(item => 
          item.id === libraryItemId ? data : item
        )
      )

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Check if media is in library
  const isInLibrary = (mediaType, mediaId) => {
    return library.some(
      item => item.media_type === mediaType && item.media_id === mediaId
    )
  }

  // Get library item by media type and ID
  const getLibraryItem = (mediaType, mediaId) => {
    return library.find(
      item => item.media_type === mediaType && item.media_id === mediaId
    )
  }

  // Get library items by type
  const getLibraryByType = (mediaType) => {
    return library.filter(item => item.media_type === mediaType)
  }

  // Fetch library when user changes
  useEffect(() => {
    if (user) {
      fetchLibrary()
    } else {
      setLibrary([])
    }
  }, [user])

  const value = {
    library,
    loading,
    fetchLibrary,
    addToLibrary,
    removeFromLibrary,
    updateRating,
    isInLibrary,
    getLibraryItem,
    getLibraryByType,
  }

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  )
}

