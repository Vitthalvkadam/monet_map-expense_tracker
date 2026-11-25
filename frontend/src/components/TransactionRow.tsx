import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '../types'
import { categoryInfo } from '../utils/categories'
import { formatDate } from '../utils/dates'
import { useFinance } from '../store/FinanceContext'
import { IconBadge } from './IconBadge'

interface Props {
  tx: Transaction
  onEdit?: (t: Transaction) => void
  onDelete?: (t: Transaction) => void
}

export function TransactionRow({ tx, onEdit, onDelete }: Props) {
  const { money } = useFinance()
  const cat = categoryInfo(tx.category, tx.type)
  const Icon = cat.icon
  const isIncome = tx.type === 'income'

  return (
    <li className="flex items-center gap-3 py-2.5">
      <IconBadge color={cat.color} size="sm">
        <Icon size={16} />
      </IconBadge>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold leading-tight">{tx.description}</p>
        <p className="truncate text-xs font-semibold text-muted">
          {tx.category} · {formatDate(tx.date)}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-line px-2 py-0.5 font-display text-sm font-bold text-ink ${isIncome ? 'bg-mint' : 'bg-tangerine'}`}
      >
        {isIncome ? <ArrowDownLeft size={14} aria-label="Income" /> : <ArrowUpRight size={14} aria-label="Expense" />}
        {isIncome ? '+' : '−'}
        {money.full(tx.amount)}
      </span>
      {(onEdit || onDelete) && (
        <div className="flex gap-1">
          {onEdit && (
            <button type="button" aria-label={`Edit ${tx.description}`} onClick={() => onEdit(tx)} className="grid h-8 w-8 place-items-center rounded-lg border-2 border-line bg-butter text-ink transition-transform hover:scale-110">
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button type="button" aria-label={`Delete ${tx.description}`} onClick={() => onDelete(tx)} className="grid h-8 w-8 place-items-center rounded-lg border-2 border-line bg-coral text-ink transition-transform hover:scale-110">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </li>
  )
}
