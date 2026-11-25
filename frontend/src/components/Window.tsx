import { useState, type ReactNode } from 'react'
import { Minus, Square, X, RotateCcw } from 'lucide-react'

type Tone = 'orange' | 'green' | 'purple' | 'yellow'

const TONES: Record<Tone, string> = {
  orange: 'bg-titlebar',
  green: 'bg-mint',
  purple: 'bg-lilac',
  yellow: 'bg-butter',
}

interface WindowProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  tone?: Tone
  className?: string
  bodyClassName?: string
  /** Extra content on the right side of the title bar (before the controls) */
  headerExtra?: ReactNode
}

/** Round retro window control button */
function Control({ color, label, onClick, children }: { color: string; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-6 w-6 place-items-center rounded-full border-[2.5px] border-ink text-ink transition-transform hover:scale-110 active:scale-95 ${color}`}
    >
      {children}
    </button>
  )
}

/**
 * The retro desktop window used for every card and panel.
 * Minimize folds the body, maximize fills the screen, close hides it (with a "reopen" chip).
 */
export function Window({ title, icon, children, tone = 'orange', className = '', bodyClassName = 'p-4', headerExtra }: WindowProps) {
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [closed, setClosed] = useState(false)

  if (closed) {
    return (
      <button type="button" onClick={() => setClosed(false)} className="btn w-full justify-start border-dashed bg-soft text-fg">
        <RotateCcw size={16} /> Reopen “{title}”
      </button>
    )
  }

  return (
    <>
      {maximized && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMaximized(false)} aria-hidden />}
      <section
        className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border-[3px] border-line bg-paper shadow-hard transition-all ${
          maximized ? 'fixed inset-3 z-50 shadow-hard-lg sm:inset-8' : 'hover:-translate-y-0.5 hover:shadow-hard-lg'
        } ${className}`}
      >
        <header className={`flex items-center gap-2 border-b-[3px] border-line px-3 py-2 text-ink ${TONES[tone]}`}>
          {icon}
          <h2 className="min-w-0 flex-1 truncate font-display text-base font-semibold sm:text-lg">{title}</h2>
          {headerExtra}
          <div className="flex items-center gap-1.5">
            <Control color="bg-butter" label={minimized ? 'Expand' : 'Minimize'} onClick={() => setMinimized((m) => !m)}>
              <Minus size={12} strokeWidth={3.5} />
            </Control>
            <Control color="bg-mint" label={maximized ? 'Restore size' : 'Maximize'} onClick={() => setMaximized((m) => !m)}>
              <Square size={9} strokeWidth={3.5} />
            </Control>
            <Control color="bg-coral" label="Close" onClick={() => setClosed(true)}>
              <X size={12} strokeWidth={3.5} />
            </Control>
          </div>
        </header>
        <div className={`${minimized ? 'hidden' : ''} ${maximized ? 'flex-1 overflow-auto' : ''} ${bodyClassName}`}>{children}</div>
      </section>
    </>
  )
}
