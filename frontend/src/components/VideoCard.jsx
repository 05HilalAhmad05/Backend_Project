import { Link } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'

export default function VideoCard({ video }) {
  const owner = video?.owner
  const ownerName = owner?.username || owner?.[0]?.username

  return (
    <Link
      to={`/videos/${video._id}`}
      className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 transition hover:border-cyan-400/40"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            <PlayCircle className="h-10 w-10" />
          </div>
        )}
        {video.duration ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white">
            {Math.round(video.duration)}s
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold text-white">{video.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-400">{video.description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{ownerName ? `@${ownerName}` : 'Creator'}</span>
          <span>{video.views ?? 0} views</span>
        </div>
      </div>
    </Link>
  )
}
