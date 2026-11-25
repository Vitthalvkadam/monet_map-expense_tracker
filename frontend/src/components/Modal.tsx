import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  maxWidth?: string
}

/** Retro window shown on top of the page. Closes with Esc, the X button or a click outside. */
export function Modal({ title, onClose, children, maxWidth = 'max-w-md' }: ModalProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    bodyRef.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/55 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`pop-in w-full ${maxWidth} overflow-hidden rounded-2xl border-[3px] border-line bg-paper shadow-hard-lg`}>
        <header className="flex items-center gap-2 border-b-[3px] border-line bg-titlebar px-3 py-2 text-ink">
          <h2 className="flex-1 truncate font-display text-lg font-semibold">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-6 w-6 place-items-center rounded-full border-[2.5px] border-ink bg-coral transition-transform hover:scale-110"
          >
            <X size={12} strokeWidth={3.5} />
          </button>
        </header>
        <div ref={bodyRef} className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
