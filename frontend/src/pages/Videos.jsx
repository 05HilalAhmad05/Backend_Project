import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import api from '../services/api'
import VideoCard from '../components/VideoCard'
import { EmptyState, ErrorBanner, PageHeader, Panel } from '../components/ui'

export default function Videos() {
  const [videos, setVideos] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      try {
        const response = await api.get('/videos', {
          params: {
            page,
            limit: 12,
            query: query || undefined,
            sortBy: 'createdAt',
            sortType: 'desc',
          },
        })
        const data = response?.data?.data
        setVideos(data?.docs || [])
        setPagination(data)
        setError('')
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load videos')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchVideos, 250)
    return () => clearTimeout(timer)
  }, [page, query])

  return (
    <div>
      <PageHeader
        eyebrow="Browse"
        title="Discover videos"
        description="Search and watch published videos from creators on StreamHub."
        actions={
          <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2 sm:w-80">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setPage(1)
                setQuery(event.target.value)
              }}
              placeholder="Search title or description"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </div>
        }
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Panel>Loading videos...</Panel>
      ) : videos.length === 0 ? (
        <EmptyState>No videos found. Upload one from your dashboard.</EmptyState>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {pagination ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
