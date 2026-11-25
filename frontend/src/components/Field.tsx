import type { ReactNode } from 'react'

export function Field({ label, error, children, hint }: { label: string; error?: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-semibold text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-sm font-bold text-danger">
          {error}
        </span>
      )}
    </label>
  )
}
