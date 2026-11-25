import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownLeft, ArrowUpRight, ChartColumn, Landmark, Plus, Receipt, Repeat, Sparkles, Target, TriangleAlert, Wallet } from 'lucide-react'
import { Window } from '../components/Window'
import { StatCard } from '../components/StatCard'
import { PageHeader } from '../components/PageHeader'
import { TransactionRow } from '../components/TransactionRow'
import { TransactionFormModal } from '../components/TransactionFormModal'
import { ProgressBar } from '../components/ProgressBar'
import { EmptyState } from '../components/EmptyState'
import { IconBadge } from '../components/IconBadge'
import { useFinance } from '../store/FinanceContext'
import { useStats } from '../hooks/useStats'
import { useChartTheme } from '../hooks/useChartTheme'
import { dueLabel, daysUntil, formatDate } from '../utils/dates'
import { pct } from '../utils/format'

export default function Dashboard() {
  const { data, money } = useFinance()
  const stats = useStats()
  const theme = useChartTheme()
  const [adding, setAdding] = useState(false)
  const hasData = data.transactions.length > 0
  const name = data.settings.userName

  return (
    <>
      <PageHeader
        title={name ? `Hi ${name}, here's your money map` : "Here's your money map"}
        subtitle="Everything you earned, spent and saved, at a glance."
        actions={
          <button type="button" className="btn bg-mint" onClick={() => setAdding(true)}>
            <Plus size={18} /> Add transaction
          </button>
        }
      />

      {stats.overBudget.length > 0 && (
        <Link to="/budgets" className="mb-5 flex items-center gap-3 rounded-2xl border-[3px] border-line bg-coral p-3 font-bold text-ink shadow-hard transition-all hover:-translate-y-0.5">
          <TriangleAlert size={22} />
          <span>
            Over budget this month: {stats.overBudget.map((b) => b.category).join(', ')}. Tap to review.
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total balance" value={money.full(stats.balance)} icon={Wallet} color="#A9E8A4" hint="All income minus all expenses" />
        <StatCard label="Income this month" value={money.full(stats.monthIncome)} icon={ArrowDownLeft} color="#FFE580" hint={`Last month ${money.whole(stats.lastIncome)}`} />
        <StatCard label="Expenses this month" value={money.full(stats.monthExpense)} icon={ArrowUpRight} color="#FFB36B" hint={`Last month ${money.whole(stats.lastExpense)}`} />
        <StatCard label="Savings in goals" value={money.full(stats.totalSavedInGoals)} icon={Landmark} color="#CDB8F7" hint={`${data.goals.length} goal${data.goals.length === 1 ? '' : 's'} running`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Window title="Income vs expenses" icon={<ChartColumn size={18} />} className="xl:col-span-2">
          {hasData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.series6} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={theme.grid} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" stroke={theme.axis} tick={{ fill: theme.axis, fontWeight: 700 }} />
                  <YAxis stroke={theme.axis} tick={{ fill: theme.axis, fontWeight: 700 }} tickFormatter={(v: number) => money.compact(v)} width={62} />
                  <Tooltip contentStyle={theme.tooltip} cursor={{ fill: 'rgba(255,154,60,.18)' }} formatter={(v: number) => money.full(v)} />
                  <Legend wrapperStyle={{ fontWeight: 700 }} />
                  <Bar dataKey="income" name="Income" fill={theme.income} stroke={theme.stroke} strokeWidth={2.5} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill={theme.expense} stroke={theme.stroke} strokeWidth={2.5} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={ChartColumn} title="No data to chart yet" text="Add your first income or expense and the chart will fill in." action={<button type="button" className="btn bg-mint" onClick={() => setAdding(true)}>Add transaction</button>} />
          )}
        </Window>

        <Window title="Upcoming bills" icon={<Receipt size={18} />} tone="purple">
          {stats.upcomingBills.length === 0 ? (
            <EmptyState icon={Repeat} color="#CDB8F7" title="No bills coming up" text="Active subscriptions due in the next 45 days show up here." action={<Link to="/subscriptions" className="btn bg-lilac">Manage subscriptions</Link>} />
          ) : (
            <ul className="divide-y-2 divide-dashed divide-line/40">
              {stats.upcomingBills.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2.5">
                  <IconBadge color="#9ED8F5" size="sm"><Repeat size={16} /></IconBadge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold leading-tight">{s.name}</p>
                    <p className="text-xs font-semibold text-muted">{formatDate(s.nextDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold">{money.full(s.amount)}</p>
                    <p className={`text-xs font-bold ${daysUntil(s.nextDate) <= 3 ? 'text-danger' : 'text-muted'}`}>{dueLabel(s.nextDate)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Window>

        <Window title="Recent transactions" icon={<Receipt size={18} />} tone="green" className="xl:col-span-2">
          {stats.recent.length === 0 ? (
            <EmptyState icon={Sparkles} title="Nothing here yet" text="Your latest income and expenses will appear here." />
          ) : (
            <>
              <ul className="divide-y-2 divide-dashed divide-line/40">
                {stats.recent.map((t) => (
                  <TransactionRow key={t.id} tx={t} />
                ))}
              </ul>
              <Link to="/transactions" className="btn mt-3 w-full bg-butter">View all transactions</Link>
            </>
          )}
        </Window>

        <Window title="Savings goals" icon={<Target size={18} />} tone="yellow">
          {data.goals.length === 0 ? (
            <EmptyState icon={Target} title="No goals yet" text="Set a target and watch it fill up." action={<Link to="/goals" className="btn bg-lilac">Create a goal</Link>} />
          ) : (
            <div className="space-y-4">
              {data.goals.slice(0, 4).map((g) => (
                <div key={g.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="truncate font-bold">{g.name}</span>
                    <span className="font-display font-bold">{pct(g.saved, g.target)}%</span>
                  </div>
                  <ProgressBar value={pct(g.saved, g.target)} color={g.color} label={`${g.name} progress`} />
                  <p className="mt-1 text-xs font-semibold text-muted">{money.whole(g.saved)} of {money.whole(g.target)}</p>
                </div>
              ))}
            </div>
          )}
        </Window>
      </div>

      {adding && <TransactionFormModal onClose={() => setAdding(false)} />}
    </>
  )
}
