import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, Plus, Search, SearchX } from 'lucide-react'
import { Window } from '../components/Window'
import { PageHeader } from '../components/PageHeader'
import { TransactionRow } from '../components/TransactionRow'
import { TransactionFormModal } from '../components/TransactionFormModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { useFinance } from '../store/FinanceContext'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories'
import { monthKey, monthLabel } from '../utils/dates'
import type { Transaction, TxType } from '../types'

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

export default function Transactions() {
  const { data, money, deleteTransaction } = useFinance()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [typeFilter, setTypeFilter] = useState<'all' | TxType>('all')
  const [category, setCategory] = useState('all')
  const [month, setMonth] = useState('all')
  const [sort, setSort] = useState<SortKey>('date-desc')
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  const allCategories = useMemo(() => [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => c.name))], [])
  const months = useMemo(() => [...new Set(data.transactions.map((t) => monthKey(t.date)))].sort().reverse(), [data.transactions])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = data.transactions.filter(
      (t) =>
        (typeFilter === 'all' || t.type === typeFilter) &&
        (category === 'all' || t.category === category) &&
        (month === 'all' || monthKey(t.date) === month) &&
        (!q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || String(t.amount).includes(q)),
    )
    const [field, dir] = sort.split('-')
    return list.sort((a, b) => {
      const diff = field === 'date' ? a.date.localeCompare(b.date) : a.amount - b.amount
      return dir === 'asc' ? diff : -diff
    })
  }, [data.transactions, query, typeFilter, category, month, sort])

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const filtersActive = query || typeFilter !== 'all' || category !== 'all' || month !== 'all'

  const setQuery = (q: string) => setParams(q ? { q } : {}, { replace: true })
  const clearFilters = () => {
    setTypeFilter('all')
    setCategory('all')
    setMonth('all')
    setQuery('')
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle={`${data.transactions.length} entries in your ledger`}
        actions={
          <button type="button" className="btn bg-mint" onClick={() => setAdding(true)}>
            <Plus size={18} /> Add transaction
          </button>
        }
      />

      <Window title="Ledger" icon={<ArrowLeftRight size={18} />} tone="green" bodyClassName="p-4">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="field !pl-9" aria-label="Search" placeholder="Search description, category…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="field" aria-label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | TxType)}>
            <option value="all">Income & expenses</option>
            <option value="income">Income only</option>
            <option value="expense">Expenses only</option>
          </select>
          <select className="field" aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {allCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select className="field" aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="all">All time</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m, true)}
              </option>
            ))}
          </select>
          <select className="field sm:col-span-2 lg:col-span-2" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
          </select>
          {filtersActive && (
            <button type="button" className="btn bg-butter sm:col-span-2 lg:col-span-3" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {data.transactions.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="Your ledger is empty" text="Add your first transaction to start tracking." action={<button type="button" className="btn bg-mint" onClick={() => setAdding(true)}>Add transaction</button>} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="No matches" text="Nothing fits those filters. Try loosening them." action={<button type="button" className="btn bg-butter" onClick={clearFilters}>Clear filters</button>} />
        ) : (
          <>
            <div className="mb-2 flex flex-wrap gap-2 text-sm font-bold">
              <span className="rounded-full border-2 border-line bg-mint px-3 py-0.5 text-ink">Income {money.full(income)}</span>
              <span className="rounded-full border-2 border-line bg-tangerine px-3 py-0.5 text-ink">Expenses {money.full(expense)}</span>
              <span className="rounded-full border-2 border-line bg-soft px-3 py-0.5">{filtered.length} shown</span>
            </div>
            <ul className="divide-y-2 divide-dashed divide-line/40">
              {filtered.map((t) => (
                <TransactionRow key={t.id} tx={t} onEdit={setEditing} onDelete={setDeleting} />
              ))}
            </ul>
          </>
        )}
      </Window>

      {adding && <TransactionFormModal onClose={() => setAdding(false)} />}
      {editing && <TransactionFormModal initial={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete transaction?"
          message={`“${deleting.description}” (${money.full(deleting.amount)}) will be removed for good.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteTransaction(deleting.id)
            setDeleting(null)
          }}
        />
      )}
    </>
  )
}
