import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, PlayCircle, Upload, Video } from 'lucide-react'
import api from '../services/api'
import { EmptyState, ErrorBanner, PageHeader, Panel, SuccessBanner } from '../components/ui'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadForm, setUploadForm] = useState({ title: '', description: '' })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadError, setUploadError] = useState('')

  const fetchDashboard = async () => {
    try {
      const [statsResponse, videosResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/videos'),
      ])

      setStats(statsResponse?.data?.data ?? null)
      setVideos(videosResponse?.data?.data ?? [])
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load dashboard data right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleUpload = async (event) => {
    event.preventDefault()
    setUploadError('')
    setUploadMessage('')

    if (!uploadForm.title.trim() || !uploadForm.description.trim()) {
      setUploadError('Title and description are required.')
      return
    }

    if (!videoFile || !thumbnail) {
      setUploadError('Please select both a video file and a thumbnail image.')
      return
    }

    const formData = new FormData()
    formData.append('title', uploadForm.title.trim())
    formData.append('description', uploadForm.description.trim())
    formData.append('videoFile', videoFile)
    formData.append('thumbnail', thumbnail)

    setUploading(true)

    try {
      await api.post('/videos', formData)
      setUploadMessage('Video uploaded successfully.')
      setUploadForm({ title: '', description: '' })
      setVideoFile(null)
      setThumbnail(null)
      event.target.reset()
      await fetchDashboard()
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Video upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <Panel>Loading your metrics...</Panel>

  return (
    <div>
      <PageHeader
        eyebrow="Creator dashboard"
        title="Channel overview"
        description="Upload videos and track performance for your channel."
      />

      <ErrorBanner message={error} />
      <ErrorBanner message={uploadError} />
      <SuccessBanner message={uploadMessage} />

      {!error ? (
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <Panel>
            <p className="text-sm text-slate-400">Videos</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats?.totalVideos ?? 0}</p>
          </Panel>
          <Panel>
            <p className="text-sm text-slate-400">Views</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats?.totalViews ?? 0}</p>
          </Panel>
          <Panel>
            <p className="text-sm text-slate-400">Subscribers</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats?.totalSubscribers ?? 0}</p>
          </Panel>
          <Panel>
            <p className="text-sm text-slate-400">Likes</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats?.totalLikes ?? 0}</p>
          </Panel>
        </section>
      ) : null}

      <Panel className="mb-8">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">Publish</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Upload a video</h2>
        </div>

        <form onSubmit={handleUpload} className="grid gap-4 lg:grid-cols-2">
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Title</span>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(event) => setUploadForm({ ...uploadForm, title: event.target.value })}
              placeholder="Video title"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Description</span>
            <textarea
              value={uploadForm.description}
              onChange={(event) => setUploadForm({ ...uploadForm, description: event.target.value })}
              placeholder="What is this video about?"
              rows={4}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="flex cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/80 px-4 py-6 text-sm text-slate-300 transition hover:border-cyan-400">
            <span className="font-medium text-white">Video file</span>
            <span className="mt-1 text-slate-400">
              {videoFile ? videoFile.name : 'Choose an mp4 / video file'}
            </span>
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>

          <label className="flex cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/80 px-4 py-6 text-sm text-slate-300 transition hover:border-cyan-400">
            <span className="font-medium text-white">Thumbnail</span>
            <span className="mt-1 text-slate-400">
              {thumbnail ? thumbnail.name : 'Choose a cover image'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setThumbnail(event.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70 lg:col-span-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload video'}
          </button>
        </form>
      </Panel>

      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Your uploads</h2>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
            {videos.length} items
          </span>
        </div>

        {videos.length === 0 ? (
          <EmptyState>No videos yet. Upload your first release above.</EmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {videos.map((video) => (
              <Link
                key={video._id}
                to={`/videos/${video._id}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition hover:border-cyan-400/40"
              >
                <div className="flex items-center gap-3">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-14 w-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-2.5">
                      <Video className="h-5 w-5 text-cyan-300" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{video.title}</p>
                    <p className="text-sm text-slate-400">{video.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-300" />
                    {video.views ?? 0} views
                  </span>
                  <span className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-cyan-300" />
                    {video.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
