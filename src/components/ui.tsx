import type { ReactNode } from 'react'

export function PageHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-muted">Nooka</p>
        <h1 className="pt-0.5 text-[20px] font-bold leading-7">{title}</h1>
      </div>
      {desc && <p className="text-[12px] leading-[1.6] text-muted">{desc}</p>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white ${className}`}>{children}</div>
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? 'bg-brand' : 'bg-track'
      }`}
    >
      <span
        className={`absolute top-1 size-4 rounded-full bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] transition-all ${
          on ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  )
}
