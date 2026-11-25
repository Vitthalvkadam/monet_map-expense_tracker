import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartColumn, PieChart as PieIcon, PiggyBank, Scale } from 'lucide-react'
import { Window } from '../components/Window'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { useFinance } from '../store/FinanceContext'
import { useChartTheme } from '../hooks/useChartTheme'
import { monthlySeries, spendingByCategory } from '../utils/stats'
import { monthLabel, shiftMonthKey } from '../utils/dates'
import { categoryInfo } from '../utils/categories'

type Range = 3 | 6 | 12

export default function Analytics() {
  const { data, money } = useFinance()
  const theme = useChartTheme()
  const [range, setRange] = useState<Range>(6)
  const [show, setShow] = useState({ income: true, expense: true })
  const [month, setMonth] = useState(shiftMonthKey(0))

  const series = useMemo(() => monthlySeries(data.transactions, range), [data.transactions, range])
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => shiftMonthKey(-i)), [])
  const categories = useMemo(() => spendingByCategory(data.transactions, month), [data.transactions, month])
  const prevKey = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }, [month])
  const comparison = useMemo(() => {
    const prev = spendingByCategory(data.transactions, prevKey)
    const names = [...new Set([...categories.map((c) => c.name), ...prev.map((c) => c.name)])]
    return names.map((name) => ({
      name,
      current: categories.find((c) => c.name === name)?.value ?? 0,
      previous: prev.find((c) => c.name === name)?.value ?? 0,
    }))
  }, [categories, data.transactions, prevKey])

  const active = series.filter((p) => p.income > 0 || p.expense > 0)
  const avgSaved = active.length ? active.reduce((s, p) => s + p.saved, 0) / active.length : 0
  const best = active.reduce<(typeof active)[number] | null>((b, p) => (!b || p.saved > b.saved ? p : b), null)
  const totalIncome = active.reduce((s, p) => s + p.income, 0)
  const totalSaved = active.reduce((s, p) => s + p.saved, 0)
  const rate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0
  const monthTotal = categories.reduce((s, c) => s + c.value, 0)

  if (data.transactions.length === 0) {
    return (
      <>
        <PageHeader title="Analytics" subtitle="Charts built from your own transactions." />
        <Window title="Analytics" icon={<ChartColumn size={18} />} tone="purple">
          <EmptyState icon={ChartColumn} title="Nothing to analyse yet" text="Add some transactions and your charts will appear here." />
        </Window>
      </>
    )
  }

  const axisProps = { stroke: theme.axis, tick: { fill: theme.axis, fontWeight: 700 } }

  return (
    <>
      <PageHeader title="Analytics" subtitle="Charts built from your own transactions." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Savings rate" value={`${rate}%`} icon={PiggyBank} color="#A9E8A4" hint={`Over the last ${range} months`} />
        <StatCard label="Average saved / month" value={money.whole(avgSaved)} icon={Scale} color="#FFE580" hint="Income minus expenses" />
        <StatCard label="Best month" value={best ? monthLabel(best.key) : '—'} icon={ChartColumn} color="#CDB8F7" hint={best ? `${money.whole(best.saved)} saved` : undefined} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Window
          title="Income vs expenses"
          icon={<ChartColumn size={18} />}
          className="xl:col-span-2"
          headerExtra={
            <select aria-label="Time range" className="rounded-lg border-2 border-ink bg-paper px-2 py-0.5 text-sm font-bold text-ink" value={range} onChange={(e) => setRange(Number(e.target.value) as Range)}>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          }
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {(['income', 'expense'] as const).map((k) => (
              <button key={k} type="button" aria-pressed={show[k]} onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))} className={`btn !py-1 ${show[k] ? (k === 'income' ? 'bg-mint' : 'bg-tangerine') : 'bg-paper !text-fg'}`}>
                {k === 'income' ? 'Income' : 'Expenses'}
              </button>
            ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={theme.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(v: number) => money.compact(v)} width={62} />
                <Tooltip contentStyle={theme.tooltip} formatter={(v: number) => money.full(v)} />
                {show.income && <Area type="monotone" dataKey="income" name="Income" stroke={theme.stroke} strokeWidth={3} fill={theme.income} fillOpacity={0.85} />}
                {show.expense && <Area type="monotone" dataKey="expense" name="Expenses" stroke={theme.stroke} strokeWidth={3} fill={theme.expense} fillOpacity={0.85} />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Window>

        <Window
          title="Where the money went"
          icon={<PieIcon size={18} />}
          tone="yellow"
          headerExtra={
            <select aria-label="Month" className="rounded-lg border-2 border-ink bg-paper px-2 py-0.5 text-sm font-bold text-ink" value={month} onChange={(e) => setMonth(e.target.value)}>
              {monthOptions.map((m) => (
                <option key={m} value={m}>{monthLabel(m, true)}</option>
              ))}
            </select>
          }
        >
          {categories.length === 0 ? (
            <EmptyState icon={PieIcon} title="No spending this month" text="Pick another month or add an expense." />
          ) : (
            <div className="grid items-center gap-3 sm:grid-cols-2">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="90%" paddingAngle={2} stroke={theme.stroke} strokeWidth={3}>
                      {categories.map((c) => (
                        <Cell key={c.name} fill={categoryInfo(c.name).color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={theme.tooltip} formatter={(v: number) => money.full(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5">
                {categories.map((c) => (
                  <li key={c.name} className="flex items-center gap-2 text-sm font-bold">
                    <span className="h-4 w-4 shrink-0 rounded border-2 border-line" style={{ backgroundColor: categoryInfo(c.name).color }} />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span>{money.whole(c.value)}</span>
                    <span className="w-10 text-right text-muted">{Math.round((c.value / monthTotal) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Window>

        <Window title={`${monthLabel(month)} vs ${monthLabel(prevKey)}`} icon={<Scale size={18} />} tone="green">
          {comparison.length === 0 ? (
            <EmptyState icon={Scale} title="Nothing to compare" text="Neither month has any expenses." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparison} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={theme.grid} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" {...axisProps} interval={0} tick={{ fill: theme.axis, fontWeight: 700, fontSize: 11 }} />
                  <YAxis {...axisProps} tickFormatter={(v: number) => money.compact(v)} width={62} />
                  <Tooltip contentStyle={theme.tooltip} cursor={{ fill: 'rgba(255,154,60,.18)' }} formatter={(v: number) => money.full(v)} />
                  <Legend wrapperStyle={{ fontWeight: 700 }} />
                  <Bar dataKey="previous" name={monthLabel(prevKey)} fill="#CDB8F7" stroke={theme.stroke} strokeWidth={2.5} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="current" name={monthLabel(month)} fill="#FFB36B" stroke={theme.stroke} strokeWidth={2.5} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Window>

        <Window title="Saved each month" icon={<PiggyBank size={18} />} tone="purple" className="xl:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={theme.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(v: number) => money.compact(v)} width={62} />
                <Tooltip contentStyle={theme.tooltip} cursor={{ fill: 'rgba(255,154,60,.18)' }} formatter={(v: number) => money.full(v)} />
                <Bar dataKey="saved" name="Saved" stroke={theme.stroke} strokeWidth={2.5} radius={[6, 6, 0, 0]}>
                  {series.map((p) => (
                    <Cell key={p.key} fill={p.saved >= 0 ? theme.savings : '#FF7B6B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Window>
      </div>
    </>
  )
}
