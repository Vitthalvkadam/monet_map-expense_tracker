import { useEffect } from 'react'
import { TriangleAlert, X } from 'lucide-react'

/** Small retro error popup that hides itself after a few seconds. */
export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 6000)
    return () => window.clearTimeout(t)
  }, [message, onClose])

  return (
    <div role="alert" className="pop-in fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border-[3px] border-line bg-coral p-3 font-bold text-ink shadow-hard-lg">
      <TriangleAlert size={20} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button type="button" aria-label="Dismiss" onClick={onClose} className="grid h-6 w-6 place-items-center rounded-full border-[2.5px] border-ink bg-butter">
        <X size={12} strokeWidth={3.5} />
      </button>
    </div>
  )
}
