import { useEffect, useState } from 'react'
import { Heart, Pencil, Trash2 } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { EmptyState, ErrorBanner, PageHeader, Panel, SuccessBanner } from '../components/ui'

export default function Tweets() {
  const { user } = useAuth()
  const [tweets, setTweets] = useState([])
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    if (!user?._id) return
    setLoading(true)
    try {
      const response = await api.get(`/tweets/user/${user._id}`)
      setTweets(response?.data?.data || [])
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tweets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user?._id])

  const createTweet = async (event) => {
    event.preventDefault()
    if (!content.trim()) return
    try {
      await api.post('/tweets', { content: content.trim() })
      setContent('')
      setMessage('Tweet posted')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to post tweet')
    }
  }

  const saveTweet = async (tweetId) => {
    try {
      await api.patch(`/tweets/${tweetId}`, { content: editingContent.trim() })
      setEditingId(null)
      setEditingContent('')
      setMessage('Tweet updated')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update tweet')
    }
  }

  const deleteTweet = async (tweetId) => {
    try {
      await api.delete(`/tweets/${tweetId}`)
      setMessage('Tweet deleted')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete tweet')
    }
  }

  const likeTweet = async (tweetId) => {
    try {
      const response = await api.post(`/likes/toggle/t/${tweetId}`)
      setMessage(response?.data?.message || 'Tweet like updated')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to like tweet')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Community"
        title="Your tweets"
        description="Share short updates with your audience."
      />

      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <Panel className="mb-6">
        <form onSubmit={createTweet} className="space-y-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What's happening?"
            rows={3}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none focus:border-cyan-400"
          />
          <button type="submit" className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950">
            Post tweet
          </button>
        </form>
      </Panel>

      {loading ? (
        <Panel>Loading tweets...</Panel>
      ) : tweets.length === 0 ? (
        <EmptyState>No tweets yet.</EmptyState>
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <Panel key={tweet._id}>
              {editingId === tweet._id ? (
                <div className="space-y-3">
                  <textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm"
                  />
                  <button
                    onClick={() => saveTweet(tweet._id)}
                    className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm text-slate-950"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-slate-200">{tweet.content}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => likeTweet(tweet._id)}
                  className="flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-sm"
                >
                  <Heart className="h-4 w-4" />
                  Like
                </button>
                <button
                  onClick={() => {
                    setEditingId(tweet._id)
                    setEditingContent(tweet.content)
                  }}
                  className="flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-sm"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteTweet(tweet._id)}
                  className="flex items-center gap-2 rounded-full border border-rose-500/40 px-3 py-1.5 text-sm text-rose-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}
