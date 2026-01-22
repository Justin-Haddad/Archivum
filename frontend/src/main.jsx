import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import Profile from './pages/Profile.jsx'
import AccountSettings from './pages/AccountSettings.jsx'
import Library from './pages/Library.jsx'
import MediaDetail from './pages/MediaDetail.jsx'
import Friends from './pages/Friends.jsx'
import DiscoverTrending from './pages/DiscoverTrending.jsx'
import DiscoverRecommended from './pages/DiscoverRecommended.jsx'
import DiscoverNewReleases from './pages/DiscoverNewReleases.jsx'
import DiscoverExplore from './pages/DiscoverExplore.jsx'
import DiscoverMovies from './pages/DiscoverMovies.jsx'
import DiscoverTVShows from './pages/DiscoverTVShows.jsx'
import DiscoverBooks from './pages/DiscoverBooks.jsx'
import DiscoverGames from './pages/DiscoverGames.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { LibraryProvider } from './contexts/LibraryContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LibraryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/library" element={<Library />} />
          <Route path="/discover/trending" element={<DiscoverTrending />} />
          <Route path="/discover/recommended" element={<DiscoverRecommended />} />
          <Route path="/discover/new-releases" element={<DiscoverNewReleases />} />
          <Route path="/discover/explore" element={<DiscoverExplore />} />
          <Route path="/discover/movies" element={<DiscoverMovies />} />
          <Route path="/discover/tv-shows" element={<DiscoverTVShows />} />
          <Route path="/discover/books" element={<DiscoverBooks />} />
          <Route path="/discover/games" element={<DiscoverGames />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/media/:mediaType/:mediaId" element={<MediaDetail />} />
        </Routes>
      </BrowserRouter>
        <Toaster position="top-center" />
      </LibraryProvider>
    </AuthProvider>
  </StrictMode>,
)
