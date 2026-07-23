import { useEffect, useState } from 'react'
import api from '../services/api'
import VideoCard from '../components/VideoCard'
import { EmptyState, ErrorBanner, PageHeader, Panel } from '../components/ui'

export default function History() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/user/history')
        setVideos((response?.data?.data || []).filter(Boolean))
        setError('')
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load watch history')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <PageHeader
        eyebrow="Continue watching"
        title="Watch history"
        description="Videos you recently opened will appear here."
      />
      <ErrorBanner message={error} />
      {loading ? (
        <Panel>Loading history...</Panel>
      ) : videos.length === 0 ? (
        <EmptyState>Your watch history is empty. Open a video to start tracking.</EmptyState>
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
