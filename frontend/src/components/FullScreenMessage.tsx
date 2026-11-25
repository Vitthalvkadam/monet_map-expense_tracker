import { Logo } from './Logo'

interface Props {
  title: string
  text?: string
  actionLabel?: string
  onAction?: () => void
}

/** Centered retro window for loading and error states. */
export function FullScreenMessage({ title, text, actionLabel, onAction }: Props) {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border-[3px] border-line bg-paper shadow-hard-lg">
        <div className="border-b-[3px] border-line bg-titlebar px-4 py-2 font-display text-lg font-semibold text-ink">MoneyMap</div>
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <Logo />
          <h1 className="text-xl font-semibold">{title}</h1>
          {text && <p className="font-semibold text-muted">{text}</p>}
          {actionLabel && onAction && (
            <button type="button" className="btn bg-mint" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
