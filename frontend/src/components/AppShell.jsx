import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Clapperboard,
  Heart,
  History,
  LayoutDashboard,
  ListVideo,
  LogOut,
  MessageSquareText,
  PlayCircle,
  Settings,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/videos', label: 'Videos', icon: Clapperboard },
  { to: '/playlists', label: 'Playlists', icon: ListVideo },
  { to: '/tweets', label: 'Tweets', icon: MessageSquareText },
  { to: '/liked', label: 'Liked', icon: Heart },
  { to: '/history', label: 'History', icon: History },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0f172a,_#020617_70%)] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/videos" className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-2.5">
              <PlayCircle className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">StreamHub</p>
              <p className="text-xs text-slate-400">Creator platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user?.username ? (
              <Link
                to={`/channel/${user.username}`}
                className="hidden items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-cyan-400 sm:flex"
              >
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span>@{user.username}</span>
              </Link>
            ) : (
              <UserRound className="h-5 w-5 text-slate-400" />
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-slate-800 px-4 py-2 lg:hidden">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${
                  isActive ? 'bg-cyan-500/15 text-cyan-300' : 'bg-slate-900 text-slate-300'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
