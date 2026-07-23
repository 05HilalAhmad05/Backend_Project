import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'
import { EmptyState, ErrorBanner, PageHeader, Panel, SuccessBanner } from '../components/ui'

export default function Channel() {
  const { username } = useParams()
  const { user } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [tweets, setTweets] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [subscribedChannels, setSubscribedChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const channelRes = await api.get(`/user/c/${username}`)
      const channelData = channelRes?.data?.data
      setChannel(channelData)

      const [videosRes, tweetsRes, subsRes, channelsRes] = await Promise.all([
        api.get('/videos', { params: { userId: channelData._id, limit: 24 } }),
        api.get(`/tweets/user/${channelData._id}`),
        api.get(`/subscriptions/c/${channelData._id}`),
        api.get(`/subscriptions/u/${channelData._id}`),
      ])

      setVideos(videosRes?.data?.data?.docs || [])
      setTweets(tweetsRes?.data?.data || [])
      setSubscribers(subsRes?.data?.data || [])
      setSubscribedChannels(channelsRes?.data?.data || [])
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load channel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [username])

  const toggleSubscribe = async () => {
    if (!channel?._id || channel._id === user?._id) return
    try {
      const response = await api.post(`/subscriptions/c/${channel._id}`)
      setMessage(response?.data?.message || 'Subscription updated')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update subscription')
    }
  }

  if (loading) return <Panel>Loading channel...</Panel>
  if (!channel) return <EmptyState>{error || 'Channel not found'}</EmptyState>

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/70">
        <div
          className="h-40 bg-cover bg-center"
          style={{
            backgroundImage: channel.coverImage
              ? `url(${channel.coverImage})`
              : 'linear-gradient(135deg,#0ea5e9,#1e293b)',
          }}
        />
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={channel.avatar}
              alt={channel.fullName}
              className="-mt-12 h-20 w-20 rounded-full border-4 border-slate-950 object-cover"
            />
            <div>
              <h1 className="text-2xl font-semibold text-white">{channel.fullName}</h1>
              <p className="text-sm text-slate-400">@{channel.username}</p>
              <p className="mt-1 text-sm text-slate-400">
                {channel.subscribersCount ?? subscribers.length} subscribers ·{' '}
                {channel.channelSubscribedToCount ?? subscribedChannels.length} subscribed
              </p>
            </div>
          </div>

          {channel._id !== user?._id ? (
            <button
              onClick={toggleSubscribe}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                channel.IsSubscribed
                  ? 'border border-slate-700 text-slate-200'
                  : 'bg-cyan-500 text-slate-950'
              }`}
            >
              {channel.IsSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          ) : (
            <Link
              to="/settings"
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <PageHeader eyebrow="Channel" title="Videos" />
      {videos.length === 0 ? (
        <EmptyState>No published videos on this channel.</EmptyState>
      ) : (
        <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}

      <PageHeader eyebrow="Updates" title="Tweets" />
      {tweets.length === 0 ? (
        <EmptyState>No tweets from this channel.</EmptyState>
      ) : (
        <div className="mb-10 space-y-3">
          {tweets.map((tweet) => (
            <Panel key={tweet._id}>
              <p className="text-slate-200">{tweet.content}</p>
            </Panel>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-3 text-lg font-semibold text-white">Subscribers</h2>
          {subscribers.length === 0 ? (
            <p className="text-sm text-slate-400">No subscribers yet.</p>
          ) : (
            <div className="space-y-2">
              {subscribers.map((sub) => (
                <Link
                  key={sub._id}
                  to={`/channel/${sub.username}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800 px-3 py-2 hover:border-cyan-400/40"
                >
                  <img src={sub.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="text-sm text-white">{sub.fullName}</p>
                    <p className="text-xs text-slate-400">@{sub.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-3 text-lg font-semibold text-white">Subscribed channels</h2>
          {subscribedChannels.length === 0 ? (
            <p className="text-sm text-slate-400">Not subscribed to anyone yet.</p>
          ) : (
            <div className="space-y-2">
              {subscribedChannels.map((channelItem) => (
                <Link
                  key={channelItem._id}
                  to={`/channel/${channelItem.username}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800 px-3 py-2 hover:border-cyan-400/40"
                >
                  <img src={channelItem.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="text-sm text-white">{channelItem.fullName}</p>
                    <p className="text-xs text-slate-400">@{channelItem.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
