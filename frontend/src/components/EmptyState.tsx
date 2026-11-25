import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { IconBadge } from './IconBadge'

export function EmptyState({ icon: Icon, title, text, action, color = '#FFE580' }: { icon: LucideIcon; title: string; text: string; action?: ReactNode; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border-[3px] border-dashed border-line px-4 py-8 text-center">
      <IconBadge color={color} size="lg">
        <Icon size={24} />
      </IconBadge>
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      <p className="max-w-xs text-sm font-semibold text-muted">{text}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
