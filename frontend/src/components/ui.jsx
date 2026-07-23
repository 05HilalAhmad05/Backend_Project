export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-semibold text-white">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}

export function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-[28px] border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20 ${className}`}>
      {children}
    </div>
  )
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
      {children}
    </div>
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      {message}
    </div>
  )
}

export function SuccessBanner({ message }) {
  if (!message) return null
  return (
    <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
      {message}
    </div>
  )
}
