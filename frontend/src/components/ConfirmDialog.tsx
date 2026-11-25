import { TriangleAlert } from 'lucide-react'
import { Modal } from './Modal'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-sm">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] border-line bg-butter text-ink">
          <TriangleAlert size={22} />
        </div>
        <p className="font-semibold leading-snug">{message}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="btn bg-paper !text-fg" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn bg-coral" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
