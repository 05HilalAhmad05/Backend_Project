import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Videos from './pages/Videos'
import VideoDetail from './pages/VideoDetail'
import Playlists from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'
import Tweets from './pages/Tweets'
import LikedVideos from './pages/LikedVideos'
import History from './pages/History'
import Channel from './pages/Channel'
import Settings from './pages/Settings'

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/videos" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/videos" element={<Videos />} />
        <Route path="/videos/:videoId" element={<VideoDetail />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
        <Route path="/tweets" element={<Tweets />} />
        <Route path="/liked" element={<LikedVideos />} />
        <Route path="/history" element={<History />} />
        <Route path="/channel/:username" element={<Channel />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
