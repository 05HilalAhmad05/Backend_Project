import { Home, Play, Users, ShieldCheck } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:px-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                <ShieldCheck size={16} /> Backend ready for frontend integration
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Build your video platform UI with a clean Tailwind starter.
              </h1>
              <p className="mt-4 text-lg text-slate-300">
                This workspace now has a React + Tailwind base so you can start creating pages for auth, videos, playlists, and more.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Next steps</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><Home size={16} /> Create pages for home and login</li>
                <li className="flex items-center gap-2"><Play size={16} /> Connect video APIs</li>
                <li className="flex items-center gap-2"><Users size={16} /> Add user and profile screens</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Auth screens', 'Create login, register, and protected routes.'],
            ['Video pages', 'Show uploads, details, comments, and likes.'],
            ['Dashboard', 'Display user stats and playlists.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-medium text-white">{title}</h2>
              <p className="mt-2 text-sm text-slate-400">{description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
