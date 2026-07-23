import { useEffect, useState } from 'react'
import api from '../services/api'
import VideoCard from '../components/VideoCard'
import { EmptyState, ErrorBanner, PageHeader, Panel } from '../components/ui'

export default function LikedVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/likes/videos')
        setVideos((response?.data?.data || []).filter(Boolean))
        setError('')
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load liked videos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <PageHeader
        eyebrow="Favorites"
        title="Liked videos"
        description="Videos you have liked across StreamHub."
      />
      <ErrorBanner message={error} />
      {loading ? (
        <Panel>Loading liked videos...</Panel>
      ) : videos.length === 0 ? (
        <EmptyState>No liked videos yet.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
