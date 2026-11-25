import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  icon: LucideIcon
  color: string
  hint?: string
}

/** Pastel stat tile used at the top of the dashboard. */
export function StatCard({ label, value, icon: Icon, color, hint }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-[3px] border-line p-3.5 text-ink shadow-hard transition-all hover:-translate-y-0.5 hover:shadow-hard-lg" style={{ backgroundColor: color }}>
      <span className="grid h-12 w-12 shrink-0 rotate-3 place-items-center rounded-xl border-[3px] border-ink bg-white/70">
        <Icon size={24} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold">{label}</p>
        <p className="truncate font-display text-2xl font-bold leading-tight" title={value}>
          {value}
        </p>
        {hint && <p className="truncate text-xs font-bold opacity-80">{hint}</p>}
      </div>
    </div>
  )
}
