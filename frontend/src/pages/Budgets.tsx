import { useState, type FormEvent } from 'react'
import { PiggyBank, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { Window } from '../components/Window'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { Field } from '../components/Field'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { ProgressBar } from '../components/ProgressBar'
import { useFinance } from '../store/FinanceContext'
import { useStats } from '../hooks/useStats'
import { EXPENSE_CATEGORIES, categoryInfo } from '../utils/categories'
import { monthLabel, currentMonthKey } from '../utils/dates'
import { pct } from '../utils/format'
import type { Budget } from '../types'

function BudgetForm({ initial, onClose }: { initial?: Budget; onClose: () => void }) {
  const { data, saveBudget } = useFinance()
  const used = new Set(data.budgets.map((b) => b.category))
  const available = EXPENSE_CATEGORIES.filter((c) => !used.has(c.name) || c.name === initial?.category)
  const [category, setCategory] = useState(initial?.category ?? available[0]?.name ?? '')
  const [limit, setLimit] = useState(initial ? String(initial.limit) : '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    const value = Number(limit)
    if (!category) return setError('Every category already has a budget.')
    if (!limit || !Number.isFinite(value) || value <= 0) return setError('Enter a monthly limit greater than 0.')
    setSaving(true)
    const ok = await saveBudget({ id: initial?.id, category, limit: value })
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal title={initial ? 'Edit budget' : 'New budget'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5" noValidate>
        <Field label="Category">
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} disabled={!!initial}>
            {available.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Monthly limit" error={error}>
          <input className="field" type="number" min="0" step="1" inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="e.g. 5000" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn bg-paper !text-fg" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving} className="btn bg-mint">{initial ? 'Save changes' : 'Create budget'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Budgets() {
  const { data, money, deleteBudget } = useFinance()
  const { spentByCat } = useStats()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)

  const totalLimit = data.budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = data.budgets.reduce((s, b) => s + (spentByCat[b.category] ?? 0), 0)
  const allCovered = data.budgets.length >= EXPENSE_CATEGORIES.length

  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle={`Monthly limits for ${monthLabel(currentMonthKey(), true)}`}
        actions={
          <button type="button" className="btn bg-mint" onClick={() => setAdding(true)} disabled={allCovered}>
            <Plus size={18} /> New budget
          </button>
        }
      />

      {data.budgets.length === 0 ? (
        <Window title="Budgets" icon={<PiggyBank size={18} />} tone="yellow">
          <EmptyState icon={PiggyBank} title="No budgets yet" text="Set a monthly limit for a category like Food or Shopping and MoneyMap will warn you before you overspend." action={<button type="button" className="btn bg-mint" onClick={() => setAdding(true)}>Create a budget</button>} />
        </Window>
      ) : (
        <>
          <Window title="This month overall" icon={<PiggyBank size={18} />} tone="yellow" className="mb-5">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 font-bold">
              <span>{money.full(totalSpent)} spent of {money.full(totalLimit)}</span>
              <span className="font-display text-lg">{pct(totalSpent, totalLimit)}%</span>
            </div>
            <ProgressBar value={pct(totalSpent, totalLimit)} color={totalSpent > totalLimit ? '#FF7B6B' : '#A9E8A4'} label="Overall budget used" />
          </Window>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.budgets.map((b) => {
              const spent = spentByCat[b.category] ?? 0
              const info = categoryInfo(b.category)
              const Icon = info.icon
              const over = spent > b.limit
              const near = !over && spent >= b.limit * 0.8
              return (
                <Window key={b.id} title={b.category} icon={<Icon size={18} />} tone={over ? 'orange' : 'green'}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-display text-2xl font-bold">{money.whole(spent)}</p>
                    <p className="text-sm font-bold text-muted">of {money.whole(b.limit)}</p>
                  </div>
                  <div className="my-2">
                    <ProgressBar value={pct(spent, b.limit)} color={over ? '#FF7B6B' : near ? '#FFE580' : info.color} label={`${b.category} budget used`} />
                  </div>
                  {over ? (
                    <p className="flex items-center gap-1.5 rounded-lg border-2 border-line bg-coral px-2 py-1 text-sm font-bold text-ink">
                      <TriangleAlert size={16} /> Over by {money.whole(spent - b.limit)}
                    </p>
                  ) : near ? (
                    <p className="flex items-center gap-1.5 rounded-lg border-2 border-line bg-butter px-2 py-1 text-sm font-bold text-ink">
                      <TriangleAlert size={16} /> Almost there, {money.whole(b.limit - spent)} left
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-muted">{money.whole(b.limit - spent)} left this month</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="btn flex-1 !py-1 bg-butter" onClick={() => setEditing(b)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button type="button" aria-label={`Delete ${b.category} budget`} className="btn !px-3 !py-1 bg-coral" onClick={() => setDeleting(b)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Window>
              )
            })}
          </div>
        </>
      )}

      {adding && <BudgetForm onClose={() => setAdding(false)} />}
      {editing && <BudgetForm initial={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete budget?"
          message={`The ${deleting.category} budget will be removed. Your transactions stay untouched.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteBudget(deleting.id)
            setDeleting(null)
          }}
        />
      )}
    </>
  )
}

