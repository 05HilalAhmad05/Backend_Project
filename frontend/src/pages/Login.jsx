import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, authError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAttempted(true)

    if (!form.email.trim() || !form.password.trim()) {
      return
    }

    setSubmitting(true)

    try {
      await login({ email: form.email, password: form.password })
      navigate('/videos')
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0f172a,_#020617_70%)] px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-800/80 bg-slate-900/70 shadow-2xl shadow-black/40 backdrop-blur-xl lg:flex-row">
        <div className="flex flex-1 flex-col justify-center bg-slate-950/60 px-8 py-12 sm:px-12 lg:px-16">
          <div className="inline-flex w-fit items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
            Welcome back
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Welcome back to your creative workspace.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-8 text-slate-300">
            Continue exploring videos, playlists, and your personalized content feed with a faster, clearer experience.
          </p>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
            <ShieldCheck className="h-5 w-5 text-cyan-300" />
            Protected sign-in with secure access controls.
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-900/80 px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-lg shadow-black/30">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Sign in</h2>
              <p className="mt-2 text-sm text-slate-400">Access your dashboard and content library.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {authError ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {authError}
                </div>
              ) : null}

              <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 transition focus-within:border-cyan-400">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 transition focus-within:border-cyan-400">
                <Lock size={18} className="text-slate-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                />
              </label>

              {attempted && (!form.email.trim() || !form.password.trim()) ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  Please enter both your email and password.
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              New here?{' '}
              <Link to="/register" className="font-medium text-cyan-400 transition hover:text-cyan-300">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
