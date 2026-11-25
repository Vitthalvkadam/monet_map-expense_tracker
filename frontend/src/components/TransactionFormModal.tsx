import { useState, type FormEvent } from 'react'
import type { Transaction, TxType } from '../types'
import { useFinance } from '../store/FinanceContext'
import { categoriesFor } from '../utils/categories'
import { todayISO } from '../utils/dates'
import { Modal } from './Modal'
import { Field } from './Field'

interface Props {
  /** Pass a transaction to edit it; leave empty to add a new one */
  initial?: Transaction
  defaultType?: TxType
  onClose: () => void
}

export function TransactionFormModal({ initial, defaultType = 'expense', onClose }: Props) {
  const { addTransaction, updateTransaction } = useFinance()
  const [type, setType] = useState<TxType>(initial?.type ?? defaultType)
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category ?? categoriesFor(initial?.type ?? defaultType)[0].name)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const changeType = (t: TxType) => {
    setType(t)
    setCategory(categoriesFor(t)[0].name) // categories differ between income and expense
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    const next: Record<string, string> = {}
    const value = Number(amount)
    if (!amount || !Number.isFinite(value) || value <= 0) next.amount = 'Enter an amount greater than 0.'
    if (!description.trim()) next.description = 'Add a short description.'
    if (!date) next.date = 'Pick a date.'
    setErrors(next)
    if (Object.keys(next).length) return

    const payload = { type, amount: Math.round(value * 100) / 100, category, description: description.trim(), date }
    setSaving(true)
    const ok = initial ? await updateTransaction({ ...payload, id: initial.id }) : await addTransaction(payload)
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal title={initial ? 'Edit transaction' : 'New transaction'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5" noValidate>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Transaction type">
          {(['expense', 'income'] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => changeType(t)}
              className={`btn ${type === t ? (t === 'income' ? 'bg-mint' : 'bg-tangerine') : 'bg-paper !text-fg'}`}
            >
              {t === 'income' ? 'Income' : 'Expense'}
            </button>
          ))}
        </div>
        <Field label="Amount" error={errors.amount}>
          <input className="field" type="number" inputMode="decimal" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </Field>
        <Field label="Category">
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categoriesFor(type).map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Description" error={errors.description}>
          <input className="field" maxLength={60} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Weekly groceries" />
        </Field>
        <Field label="Date" error={errors.date}>
          <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn bg-paper !text-fg" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn bg-mint">
            {initial ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
