import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import api from '../services/api'
import VideoCard from '../components/VideoCard'
import { EmptyState, ErrorBanner, PageHeader, Panel, SuccessBanner } from '../components/ui'

export default function PlaylistDetail() {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/playlists/${playlistId}`)
      const data = response?.data?.data
      setPlaylist(data)
      setForm({ name: data?.name || '', description: data?.description || '' })
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [playlistId])

  const updatePlaylist = async (event) => {
    event.preventDefault()
    try {
      await api.patch(`/playlists/${playlistId}`, form)
      setMessage('Playlist updated')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update playlist')
    }
  }

  const deletePlaylist = async () => {
    if (!window.confirm('Delete this playlist?')) return
    try {
      await api.delete(`/playlists/${playlistId}`)
      navigate('/playlists')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete playlist')
    }
  }

  const removeVideo = async (videoId) => {
    try {
      await api.patch(`/playlists/remove/${videoId}/${playlistId}`)
      setMessage('Video removed from playlist')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove video')
    }
  }

  if (loading) return <Panel>Loading playlist...</Panel>
  if (!playlist) return <EmptyState>{error || 'Playlist not found'}</EmptyState>

  return (
    <div>
      <PageHeader
        eyebrow="Playlist"
        title={playlist.name}
        description={playlist.description}
        actions={
          <button
            onClick={deletePlaylist}
            className="flex items-center gap-2 rounded-full border border-rose-500/40 px-4 py-2 text-sm text-rose-200"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        }
      />

      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel>
          <h2 className="text-lg font-semibold text-white">Edit playlist</h2>
          <form onSubmit={updatePlaylist} className="mt-4 space-y-3">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none"
            />
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={4}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none"
            />
            <button type="submit" className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950">
              Save changes
            </button>
          </form>
          <p className="mt-4 text-sm text-slate-400">
            Owner:{' '}
            <Link to={`/channel/${playlist.owner?.username}`} className="text-cyan-300">
              @{playlist.owner?.username}
            </Link>
          </p>
        </Panel>

        <Panel>
          {!playlist.videos?.length ? (
            <EmptyState>No videos in this playlist yet.</EmptyState>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {playlist.videos.map((video) => (
                <div key={video._id} className="space-y-2">
                  <VideoCard video={video} />
                  <button
                    onClick={() => removeVideo(video._id)}
                    className="w-full rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-300"
                  >
                    Remove from playlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
