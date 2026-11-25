import { useMemo, useState, type FormEvent } from 'react'
import { BadgeCheck, Pencil, Plus, Power, Repeat, Trash2 } from 'lucide-react'
import { Window } from '../components/Window'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { Field } from '../components/Field'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { IconBadge } from '../components/IconBadge'
import { useFinance } from '../store/FinanceContext'
import { daysUntil, dueLabel, formatDate, todayISO } from '../utils/dates'
import type { BillingCycle, Subscription } from '../types'

function SubscriptionForm({ initial, onClose }: { initial?: Subscription; onClose: () => void }) {
  const { saveSubscription } = useFinance()
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [cycle, setCycle] = useState<BillingCycle>(initial?.cycle ?? 'monthly')
  const [nextDate, setNextDate] = useState(initial?.nextDate ?? todayISO())
  const [active, setActive] = useState(initial?.active ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    const next: Record<string, string> = {}
    const value = Number(amount)
    if (!name.trim()) next.name = 'Enter the service name.'
    if (!amount || !Number.isFinite(value) || value <= 0) next.amount = 'Enter an amount greater than 0.'
    if (!nextDate) next.nextDate = 'Pick the next payment date.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    const ok = await saveSubscription({ id: initial?.id, name: name.trim(), amount: value, cycle, nextDate, active })
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal title={initial ? 'Edit subscription' : 'New subscription'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5" noValidate>
        <Field label="Name" error={errors.name}>
          <input className="field" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Netflix" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" error={errors.amount}>
            <input className="field" type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Billing">
            <select className="field" value={cycle} onChange={(e) => setCycle(e.target.value as BillingCycle)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </Field>
        </div>
        <Field label="Next payment date" error={errors.nextDate}>
          <input className="field" type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 font-bold">
          <input type="checkbox" className="h-5 w-5 accent-[#FF9A3C]" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active subscription
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn bg-paper !text-fg" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving} className="btn bg-mint">{initial ? 'Save changes' : 'Add subscription'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Subscriptions() {
  const { data, money, deleteSubscription, toggleSubscription, markSubscriptionPaid } = useFinance()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [deleting, setDeleting] = useState<Subscription | null>(null)

  const sorted = useMemo(
    () => [...data.subscriptions].sort((a, b) => Number(b.active) - Number(a.active) || a.nextDate.localeCompare(b.nextDate)),
    [data.subscriptions],
  )
  const active = data.subscriptions.filter((s) => s.active)
  const monthlyCost = active.reduce((sum, s) => sum + (s.cycle === 'monthly' ? s.amount : s.amount / 12), 0)

  return (
    <>
      <PageHeader
        title="Subscriptions"
        subtitle={`${active.length} active · about ${money.whole(monthlyCost)} per month · ${money.whole(monthlyCost * 12)} per year`}
        actions={
          <button type="button" className="btn bg-mint" onClick={() => setAdding(true)}>
            <Plus size={18} /> Add subscription
          </button>
        }
      />

      {sorted.length === 0 ? (
        <Window title="Subscriptions" icon={<Repeat size={18} />} tone="purple">
          <EmptyState icon={Repeat} color="#9ED8F5" title="No subscriptions tracked" text="Add streaming, apps or memberships to see what's due and what they cost." action={<button type="button" className="btn bg-mint" onClick={() => setAdding(true)}>Add subscription</button>} />
        </Window>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((s) => {
            const days = daysUntil(s.nextDate)
            return (
              <Window key={s.id} title={s.name} icon={<Repeat size={18} />} tone={s.active ? 'purple' : 'yellow'} className={s.active ? '' : 'opacity-80'}>
                <div className="flex items-center gap-3">
                  <IconBadge color={s.active ? '#9ED8F5' : '#D8CBBA'}><Repeat size={20} /></IconBadge>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl font-bold leading-tight">{money.full(s.amount)}</p>
                    <p className="text-sm font-bold text-muted">per {s.cycle === 'monthly' ? 'month' : 'year'}</p>
                  </div>
                  <span className={`rounded-full border-2 border-line px-2.5 py-0.5 text-xs font-bold text-ink ${s.active ? 'bg-mint' : 'bg-soft !text-fg'}`}>{s.active ? 'Active' : 'Paused'}</span>
                </div>
                <p className="mt-3 text-sm font-bold">
                  Next payment {formatDate(s.nextDate)}{' '}
                  {s.active && <span className={days <= 3 ? 'text-danger' : 'text-muted'}>({dueLabel(s.nextDate)})</span>}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.active && (
                    <button type="button" className="btn flex-1 !py-1 bg-mint" onClick={() => markSubscriptionPaid(s.id)} title="Logs an expense and moves the next date forward">
                      <BadgeCheck size={15} /> Mark paid
                    </button>
                  )}
                  <button type="button" className="btn !px-3 !py-1 bg-lilac" onClick={() => toggleSubscription(s.id)} aria-label={s.active ? `Pause ${s.name}` : `Resume ${s.name}`} title={s.active ? 'Pause' : 'Resume'}>
                    <Power size={14} />
                  </button>
                  <button type="button" className="btn !px-3 !py-1 bg-butter" onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="btn !px-3 !py-1 bg-coral" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </Window>
            )
          })}
        </div>
      )}

      {adding && <SubscriptionForm onClose={() => setAdding(false)} />}
      {editing && <SubscriptionForm initial={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete subscription?"
          message={`“${deleting.name}” will no longer be tracked.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteSubscription(deleting.id)
            setDeleting(null)
          }}
        />
      )}
    </>
  )
}
