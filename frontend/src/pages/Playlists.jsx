import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { EmptyState, ErrorBanner, PageHeader, Panel, SuccessBanner } from '../components/ui'

export default function Playlists() {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    if (!user?._id) return
    setLoading(true)
    try {
      const response = await api.get(`/playlists/user/${user._id}`)
      setPlaylists(response?.data?.data || [])
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user?._id])

  const createPlaylist = async (event) => {
    event.preventDefault()
    try {
      await api.post('/playlists', form)
      setForm({ name: '', description: '' })
      setMessage('Playlist created')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create playlist')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Collections"
        title="Your playlists"
        description="Create collections and organize videos you care about."
      />

      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Panel>
          <h2 className="text-lg font-semibold text-white">Create playlist</h2>
          <form onSubmit={createPlaylist} className="mt-4 space-y-3">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Playlist name"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            />
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Description"
              rows={4}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </form>
        </Panel>

        <Panel>
          {loading ? (
            <p className="text-slate-300">Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <EmptyState>No playlists yet. Create your first one.</EmptyState>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {playlists.map((playlist) => (
                <Link
                  key={playlist._id}
                  to={`/playlists/${playlist._id}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-cyan-400/40"
                >
                  <h3 className="font-semibold text-white">{playlist.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{playlist.description}</p>
                  <p className="mt-3 text-xs text-slate-500">{playlist.videos?.length || 0} videos</p>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
