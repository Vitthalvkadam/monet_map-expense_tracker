import { useState } from 'react'
import { Database, Download, Moon, Settings as SettingsIcon, Sun, Trash2, User } from 'lucide-react'
import { Window } from '../components/Window'
import { PageHeader } from '../components/PageHeader'
import { Field } from '../components/Field'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useFinance } from '../store/FinanceContext'
import { useAuth } from '../store/AuthContext'
import { CURRENCIES } from '../utils/format'

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Settings() {
  const { data, updateSettings, clearAll } = useFinance()
  const { user } = useAuth()
  const { settings } = data
  const [confirm, setConfirm] = useState(false)

  const exportJson = () => download(`moneymap-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json')
  const exportCsv = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const rows = [['Date', 'Type', 'Category', 'Description', 'Amount'], ...data.transactions.map((t) => [t.date, t.type, t.category, t.description, t.amount])]
    download(`moneymap-transactions-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => r.map(esc).join(',')).join('\n'), 'text/csv')
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Make MoneyMap yours. Everything is saved to your account." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Window title="Profile & display" icon={<User size={18} />} tone="orange" bodyClassName="space-y-4 p-4">
          <Field label="Email">
            <input className="field opacity-70" value={user?.email ?? ''} readOnly aria-readonly />
          </Field>
          <Field label="Your name">
            <input className="field" maxLength={24} value={settings.userName} onChange={(e) => updateSettings({ userName: e.target.value })} placeholder="What should we call you?" />
          </Field>
          <Field label="Currency">
            <select className="field" value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </Field>
          <div>
            <span className="mb-1 block font-display text-sm font-semibold">Theme</span>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" aria-pressed={settings.theme === 'light'} className={`btn ${settings.theme === 'light' ? 'bg-butter' : 'bg-paper !text-fg'}`} onClick={() => updateSettings({ theme: 'light' })}>
                <Sun size={16} /> Light
              </button>
              <button type="button" aria-pressed={settings.theme === 'dark'} className={`btn ${settings.theme === 'dark' ? 'bg-lilac' : 'bg-paper !text-fg'}`} onClick={() => updateSettings({ theme: 'dark' })}>
                <Moon size={16} /> Dark
              </button>
            </div>
          </div>
        </Window>

        <Window title="Your data" icon={<Database size={18} />} tone="green" bodyClassName="space-y-3 p-4">
          <p className="font-semibold text-muted">
            {data.transactions.length} transactions, {data.budgets.length} budgets, {data.goals.length} goals and {data.subscriptions.length} subscriptions are saved in your account.
          </p>
          <button type="button" className="btn w-full bg-mint" onClick={exportJson}>
            <Download size={16} /> Export everything (JSON)
          </button>
          <button type="button" className="btn w-full bg-butter" onClick={exportCsv} disabled={data.transactions.length === 0}>
            <Download size={16} /> Export transactions (CSV)
          </button>
          <hr className="border-t-[3px] border-dashed border-line/50" />
          <button type="button" className="btn w-full bg-coral" onClick={() => setConfirm(true)}>
            <Trash2 size={16} /> Delete all data
          </button>
        </Window>

        <Window title="About MoneyMap" icon={<SettingsIcon size={18} />} tone="yellow" className="lg:col-span-2">
          <p className="font-semibold">Your data is saved to your MoneyMap account, so it's there whenever you log in. Export a backup now and then if you like.</p>
        </Window>
      </div>

      {confirm && (
        <ConfirmDialog title="Delete all data?" confirmLabel="Delete everything" message="This removes every transaction, budget, goal and subscription from your account. It can't be undone." onCancel={() => setConfirm(false)} onConfirm={async () => { await clearAll(); setConfirm(false) }} />
      )}
    </>
  )
}
