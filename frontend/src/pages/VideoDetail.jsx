import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart, MessageCircle, Plus, Trash2 } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { EmptyState, ErrorBanner, PageHeader, Panel, SuccessBanner } from '../components/ui'

export default function VideoDetail() {
  const { videoId } = useParams()
  const { user } = useAuth()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [selectedPlaylist, setSelectedPlaylist] = useState('')
  const [commentText, setCommentText] = useState('')
  const [liked, setLiked] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingContent, setEditingContent] = useState('')

  const ownerId = video?.owner?._id
  const isOwner = ownerId && String(user?._id) === String(ownerId)

  const load = async () => {
    setLoading(true)
    try {
      const [videoRes, commentsRes, likedRes, playlistsRes] = await Promise.all([
        api.get(`/videos/${videoId}`),
        api.get(`/comment/videos/${videoId}`, { params: { page: 1, limit: 50 } }),
        api.get('/likes/videos'),
        user?._id ? api.get(`/playlists/user/${user._id}`) : Promise.resolve({ data: { data: [] } }),
      ])

      const videoData = videoRes?.data?.data
      setVideo(videoData)
      setComments(commentsRes?.data?.data?.docs || [])
      setPlaylists(playlistsRes?.data?.data || [])

      const likedVideos = likedRes?.data?.data || []
      setLiked(likedVideos.some((item) => item?._id === videoId))

      if (videoData?.owner?.username) {
        const channelRes = await api.get(`/user/c/${videoData.owner.username}`)
        setSubscribed(Boolean(channelRes?.data?.data?.IsSubscribed))
      }

      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load video')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [videoId, user?._id])

  const toggleLike = async () => {
    try {
      const response = await api.post(`/likes/toggle/v/${videoId}`)
      setLiked(Boolean(response?.data?.data?.liked))
      setMessage(response?.data?.message || 'Like updated')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to toggle like')
    }
  }

  const toggleSubscribe = async () => {
    if (!ownerId || isOwner) return
    try {
      const response = await api.post(`/subscriptions/c/${ownerId}`)
      setMessage(response?.data?.message || 'Subscription updated')
      if (video?.owner?.username) {
        const channelRes = await api.get(`/user/c/${video.owner.username}`)
        setSubscribed(Boolean(channelRes?.data?.data?.IsSubscribed))
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update subscription')
    }
  }

  const addComment = async (event) => {
    event.preventDefault()
    if (!commentText.trim()) return
    try {
      await api.post(`/comment/videos/${videoId}`, { content: commentText.trim() })
      setCommentText('')
      setMessage('Comment added')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add comment')
    }
  }

  const saveComment = async (commentId) => {
    try {
      await api.patch(`/comment/${commentId}`, { content: editingContent.trim() })
      setEditingCommentId(null)
      setEditingContent('')
      setMessage('Comment updated')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update comment')
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/comment/${commentId}`)
      setMessage('Comment deleted')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete comment')
    }
  }

  const toggleCommentLike = async (commentId) => {
    try {
      const response = await api.post(`/likes/toggle/c/${commentId}`)
      setMessage(response?.data?.message || 'Comment like updated')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to like comment')
    }
  }

  const addToPlaylist = async () => {
    if (!selectedPlaylist) {
      setError('Select a playlist first')
      return
    }
    try {
      await api.patch(`/playlists/add/${videoId}/${selectedPlaylist}`)
      setMessage('Video added to playlist')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add to playlist')
    }
  }

  const removeVideo = async () => {
    if (!window.confirm('Delete this video?')) return
    try {
      await api.delete(`/videos/${videoId}`)
      setMessage('Video deleted')
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete video')
    }
  }

  const togglePublish = async () => {
    try {
      const response = await api.patch(`/videos/toggle/publish/${videoId}`)
      setVideo((current) =>
        current
          ? { ...current, isPublished: response?.data?.data?.isPublished ?? !current.isPublished }
          : current,
      )
      setMessage(response?.data?.message || 'Publish status updated')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to toggle publish')
    }
  }

  if (loading) return <Panel>Loading video...</Panel>
  if (!video) return <EmptyState>{error || 'Video not found'}</EmptyState>

  return (
    <div>
      <PageHeader
        eyebrow="Watch"
        title={video.title}
        description={video.description}
      />

      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel className="overflow-hidden p-0">
            <video
              key={video._id}
              src={video.videoFile}
              poster={video.thumbnail}
              controls
              className="aspect-video w-full bg-black"
            />
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={video.owner?.avatar}
                    alt={video.owner?.fullName}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/channel/${video.owner?.username}`}
                      className="font-medium text-white hover:text-cyan-300"
                    >
                      {video.owner?.fullName}
                    </Link>
                    <p className="text-sm text-slate-400">@{video.owner?.username}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={toggleLike}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                      liked ? 'bg-rose-500/20 text-rose-200' : 'border border-slate-700 text-slate-200'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                    {liked ? 'Liked' : 'Like'}
                  </button>

                  {!isOwner ? (
                    <button
                      onClick={toggleSubscribe}
                      className={`rounded-full px-4 py-2 text-sm ${
                        subscribed
                          ? 'border border-slate-700 text-slate-200'
                          : 'bg-cyan-500 text-slate-950'
                      }`}
                    >
                      {subscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  ) : null}

                  {isOwner ? (
                    <>
                      <button
                        onClick={togglePublish}
                        className="rounded-full border border-slate-700 px-4 py-2 text-sm"
                      >
                        {video.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={removeVideo}
                        className="rounded-full border border-rose-500/40 px-4 py-2 text-sm text-rose-200"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              <p className="text-sm text-slate-400">{video.views ?? 0} views</p>
            </div>
          </Panel>

          <Panel>
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-semibold text-white">Comments</h2>
            </div>

            <form onSubmit={addComment} className="mb-5 flex gap-3">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment"
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950"
              >
                Post
              </button>
            </form>

            {comments.length === 0 ? (
              <EmptyState>No comments yet. Be the first.</EmptyState>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const commentOwner = comment.owner
                  const canEdit = String(commentOwner?._id) === String(user?._id)
                  return (
                    <div key={comment._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {commentOwner?.fullName || commentOwner?.username || 'User'}
                          </p>
                          {editingCommentId === comment._id ? (
                            <div className="mt-2 flex gap-2">
                              <input
                                value={editingContent}
                                onChange={(event) => setEditingContent(event.target.value)}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                              />
                              <button
                                onClick={() => saveComment(comment._id)}
                                className="rounded-xl bg-cyan-500 px-3 py-2 text-xs text-slate-950"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-slate-300">{comment.content}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleCommentLike(comment._id)}
                            className="rounded-full border border-slate-700 p-2 text-slate-300"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          {canEdit ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment._id)
                                  setEditingContent(comment.content)
                                }}
                                className="rounded-full border border-slate-700 px-3 py-1 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteComment(comment._id)}
                                className="rounded-full border border-rose-500/40 p-2 text-rose-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <h2 className="text-lg font-semibold text-white">Add to playlist</h2>
            <p className="mt-1 text-sm text-slate-400">Save this video into one of your playlists.</p>
            <div className="mt-4 space-y-3">
              <select
                value={selectedPlaylist}
                onChange={(event) => setSelectedPlaylist(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none"
              >
                <option value="">Select playlist</option>
                {playlists.map((playlist) => (
                  <option key={playlist._id} value={playlist._id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addToPlaylist}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950"
              >
                <Plus className="h-4 w-4" />
                Add to playlist
              </button>
              <Link to="/playlists" className="block text-center text-sm text-cyan-300 hover:text-cyan-200">
                Manage playlists
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
