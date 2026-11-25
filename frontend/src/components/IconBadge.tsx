import type { ReactNode } from 'react'

/** Little illustrated icon tile: pastel square, thick outline, slight tilt. */
export function IconBadge({ color, children, size = 'md' }: { color: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  return (
    <span className={`grid shrink-0 -rotate-3 place-items-center rounded-xl border-[3px] border-line text-ink shadow-hard-sm ${dims}`} style={{ backgroundColor: color }}>
      {children}
    </span>
  )
}
