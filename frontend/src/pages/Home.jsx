import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const stats = [
  { label: 'Videos published', value: '12.4k+' },
  { label: 'Active creators', value: '3.2k' },
  { label: 'Watch hours', value: '98M' },
]

const features = [
  {
    title: 'Smart content hub',
    description: 'Organize videos, playlists, and collaborations in one elegant workspace.',
    icon: Video,
  },
  {
    title: 'Live growth insights',
    description: 'Monitor performance trends with clear analytics built for fast decisions.',
    icon: BarChart3,
  },
  {
    title: 'Secure by default',
    description: 'Protected accounts, polished onboarding, and dependable access controls.',
    icon: ShieldCheck,
  },
  {
    title: 'Built for communities',
    description: 'Create a tailored experience for followers, teams, and passionate creators.',
    icon: Users,
  },
]

const highlights = [
  'Fast onboarding for new teams',
  'Streamlined publishing workflows',
  'Modern dark UI designed for focus',
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0f172a,_#020617_70%)] text-slate-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-2.5">
            <PlayCircle className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">StreamHub</p>
            <p className="text-sm text-slate-400">Creator platform</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#insights" className="transition hover:text-white">
            Insights
          </a>
          <a href="#launch" className="transition hover:text-white">
            Launch
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/videos"
              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <section className="grid gap-8 rounded-[36px] border border-slate-800/80 bg-slate-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Premium media experience
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Build, publish, and grow like a modern media brand.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              A polished platform for creators to manage content, launch playlists, and keep audiences engaged with a premium digital experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={user ? '/videos' : '/register'}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                {user ? 'Browse videos' : 'Create free account'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={user ? '/dashboard' : '/login'}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400"
              >
                {user ? 'Go to dashboard' : 'Sign in'}
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/80 p-6">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-600 to-slate-800 p-4">
              <div className="flex h-full flex-col justify-between rounded-xl border border-white/20 bg-black/20 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <PlayCircle className="h-4 w-4" />
                  Live creator studio
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">StreamHub Studio</p>
                  <p className="mt-1 text-sm text-white/80">Upload, comment, like, subscribe, and grow.</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mt-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">Features</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Everything your backend already supports</h2>
            <p className="mt-3 text-slate-400">
              Videos, comments, likes, playlists, tweets, subscriptions, history, and creator analytics — now in the UI.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <feature.icon className="h-5 w-5 text-cyan-300" />
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="insights" className="mt-16 rounded-[32px] border border-slate-800 bg-slate-900/60 p-8">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">Insights</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Built for focused creators</h2>
          <ul className="mt-6 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="launch" className="mt-16 rounded-[32px] border border-cyan-400/20 bg-cyan-500/10 p-8 text-center">
          <h2 className="text-3xl font-semibold text-white">Ready to launch your next upload?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Sign in and use the full StreamHub workspace: browse, watch, comment, like, subscribe, and publish.
          </p>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {user ? 'Open dashboard' : 'Get started free'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  )
}
