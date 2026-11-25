import { useState, type FormEvent } from 'react'
import { CircleCheck, Coins, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { Window } from '../components/Window'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { Field } from '../components/Field'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { ProgressBar } from '../components/ProgressBar'
import { useFinance } from '../store/FinanceContext'
import { formatDate, todayISO } from '../utils/dates'
import { pct } from '../utils/format'
import type { Goal } from '../types'

const COLORS = ['#A9E8A4', '#CDB8F7', '#FFE580', '#FFB36B', '#9ED8F5', '#FFB3C7']

function GoalForm({ initial, onClose }: { initial?: Goal; onClose: () => void }) {
  const { saveGoal } = useFinance()
  const [name, setName] = useState(initial?.name ?? '')
  const [target, setTarget] = useState(initial ? String(initial.target) : '')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    const next: Record<string, string> = {}
    const value = Number(target)
    if (!name.trim()) next.name = 'Give your goal a name.'
    if (!target || !Number.isFinite(value) || value <= 0) next.target = 'Enter a target greater than 0.'
    if (deadline && deadline < todayISO() && !initial) next.deadline = 'Pick a date in the future.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    const ok = await saveGoal({ id: initial?.id, name: name.trim(), target: value, deadline, color })
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal title={initial ? 'Edit goal' : 'New savings goal'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5" noValidate>
        <Field label="Goal name" error={errors.name}>
          <input className="field" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New phone" />
        </Field>
        <Field label="Target amount" error={errors.target}>
          <input className="field" type="number" min="0" step="1" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
        </Field>
        <Field label="Target date (optional)" error={errors.deadline}>
          <input className="field" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
        <div>
          <span className="mb-1 block font-display text-sm font-semibold">Colour</span>
          <div className="flex gap-2" role="radiogroup" aria-label="Goal colour">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={c}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-lg border-[3px] border-line transition-transform hover:scale-110 ${color === c ? 'scale-110 shadow-hard-sm' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn bg-paper !text-fg" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving} className="btn bg-mint">{initial ? 'Save changes' : 'Create goal'}</button>
        </div>
      </form>
    </Modal>
  )
}

function ContributeForm({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const { contributeToGoal, money } = useFinance()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    const value = Number(amount)
    if (!amount || !Number.isFinite(value) || value <= 0) return setError('Enter an amount greater than 0.')
    setSaving(true)
    const ok = await contributeToGoal(goal.id, value)
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal title={`Add to “${goal.name}”`} onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={submit} className="space-y-3.5" noValidate>
        <p className="font-semibold text-muted">
          {money.whole(goal.saved)} saved, {money.whole(Math.max(goal.target - goal.saved, 0))} to go.
        </p>
        <Field label="Contribution" error={error}>
          <input className="field" type="number" min="0" step="1" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn bg-paper !text-fg" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving} className="btn bg-mint">Add contribution</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Goals() {
  const { data, money, deleteGoal } = useFinance()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [contributing, setContributing] = useState<Goal | null>(null)
  const [deleting, setDeleting] = useState<Goal | null>(null)

  return (
    <>
      <PageHeader
        title="Savings goals"
        subtitle="Small deposits, big plans."
        actions={
          <button type="button" className="btn bg-mint" onClick={() => setAdding(true)}>
            <Plus size={18} /> New goal
          </button>
        }
      />

      {data.goals.length === 0 ? (
        <Window title="Savings goals" icon={<Target size={18} />} tone="purple">
          <EmptyState icon={Target} color="#CDB8F7" title="No goals yet" text="Pick something to save for, set a target and add money whenever you can." action={<button type="button" className="btn bg-mint" onClick={() => setAdding(true)}>Create a goal</button>} />
        </Window>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.goals.map((g) => {
            const p = pct(g.saved, g.target)
            const done = g.saved >= g.target
            return (
              <Window key={g.id} title={g.name} icon={done ? <CircleCheck size={18} /> : <Target size={18} />} tone={done ? 'green' : 'purple'}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-2xl font-bold">{money.whole(g.saved)}</p>
                  <p className="text-sm font-bold text-muted">of {money.whole(g.target)}</p>
                </div>
                <div className="my-2">
                  <ProgressBar value={p} color={g.color} label={`${g.name} progress`} />
                </div>
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>{done ? 'Goal reached!' : `${p}% complete`}</span>
                  <span className="text-muted">{g.deadline ? `By ${formatDate(g.deadline)}` : 'No deadline'}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="btn flex-1 !py-1 bg-mint" onClick={() => setContributing(g)}>
                    <Coins size={15} /> Add money
                  </button>
                  <button type="button" aria-label={`Edit ${g.name}`} className="btn !px-3 !py-1 bg-butter" onClick={() => setEditing(g)}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" aria-label={`Delete ${g.name}`} className="btn !px-3 !py-1 bg-coral" onClick={() => setDeleting(g)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </Window>
            )
          })}
        </div>
      )}

      {adding && <GoalForm onClose={() => setAdding(false)} />}
      {editing && <GoalForm initial={editing} onClose={() => setEditing(null)} />}
      {contributing && <ContributeForm goal={contributing} onClose={() => setContributing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete goal?"
          message={`“${deleting.name}” and its ${money.whole(deleting.saved)} of progress will be removed.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteGoal(deleting.id)
            setDeleting(null)
          }}
        />
      )}
    </>
  )
}
