import { useEffect, useState, type FormEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, Target, Repeat, ChartColumn, Settings as SettingsIcon,
  LogOut, Menu, Search, Sun, Moon, X, type LucideIcon,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { ProgressBar } from '../components/ProgressBar'
import { useFinance } from '../store/FinanceContext'
import { useAuth } from '../store/AuthContext'
import { useStats } from '../hooks/useStats'
import { pct } from '../utils/format'

const NAV: { to: string; label: string; icon: LucideIcon; color: string }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, color: '#FFB36B' },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, color: '#A9E8A4' },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank, color: '#FFE580' },
  { to: '/goals', label: 'Savings Goals', icon: Target, color: '#CDB8F7' },
  { to: '/subscriptions', label: 'Subscriptions', icon: Repeat, color: '#9ED8F5' },
  { to: '/analytics', label: 'Analytics', icon: ChartColumn, color: '#FFB3C7' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, color: '#D8CBBA' },
]

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data, money } = useFinance()
  const { monthExpense } = useStats()
  const totalBudget = data.budgets.reduce((s, b) => s + b.limit, 0)
  const used = pct(monthExpense, totalBudget)

  return (
    <div className="flex h-full flex-col gap-5 p-4">
      <Logo />
      <nav aria-label="Main" className="flex flex-col gap-1.5">
        {NAV.map(({ to, label, icon: Icon, color }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl border-[3px] px-2.5 py-2 font-display font-semibold transition-all ${
                isActive ? 'border-line bg-butter text-ink shadow-hard-sm' : 'border-transparent hover:border-line hover:bg-soft'
              }`
            }
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border-[2.5px] border-line text-ink transition-transform group-hover:-rotate-6" style={{ backgroundColor: color }}>
              <Icon size={17} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
      {totalBudget > 0 && (
        <div className="mt-auto rounded-xl border-[3px] border-line bg-soft p-3">
          <p className="font-display text-sm font-semibold">Budget used this month</p>
          <div className="my-2">
            <ProgressBar value={used} color={used >= 100 ? '#FF7B6B' : '#A9E8A4'} label="Budget used this month" />
          </div>
          <p className="text-xs font-bold text-muted">
            {money.whole(monthExpense)} spent · {money.whole(totalBudget)} planned
          </p>
        </div>
      )}
    </div>
  )
}

function Header({ onMenu }: { onMenu: () => void }) {
  const { data, updateSettings } = useFinance()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')

  // Keep the box in sync with the Transactions page search
  useEffect(() => {
    setQuery(location.pathname === '/transactions' ? params.get('q') ?? '' : '')
  }, [location.pathname, params])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/transactions?q=${encodeURIComponent(q)}` : '/transactions')
  }
  const dark = data.settings.theme === 'dark'
  const name = data.settings.userName || 'You'

  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-line bg-paper/95 px-3 py-2.5 backdrop-blur sm:px-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" aria-label="Open menu" onClick={onMenu} className="btn !p-2 bg-butter lg:hidden">
          <Menu size={20} />
        </button>
        <form onSubmit={submit} role="search" className="relative min-w-0 flex-1 sm:max-w-md">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="field !pl-10" type="search" aria-label="Search transactions" placeholder="Search transactions…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
        <div className="flex-1" />
        <button
          type="button"
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={() => updateSettings({ theme: dark ? 'light' : 'dark' })}
          className="btn !p-2 bg-lilac"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button type="button" onClick={() => navigate('/settings')} aria-label="Open profile settings" className="flex items-center gap-2 rounded-xl border-[3px] border-line bg-soft py-1 pl-1 pr-3 transition-all hover:-translate-y-0.5 hover:shadow-hard-sm">
          <span className="grid h-8 w-8 place-items-center rounded-lg border-[2.5px] border-line bg-tangerine font-display font-bold text-ink">{name.charAt(0).toUpperCase()}</span>
          <span className="hidden max-w-[7rem] truncate font-display font-semibold sm:block">{name}</span>
        </button>
        <button type="button" aria-label="Log out" title="Log out" onClick={logout} className="btn !p-2 bg-coral">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r-[3px] border-line bg-paper lg:block">
        <Sidebar />
      </aside>

      {/* Mobile / tablet drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
          <aside className="pop-in absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto border-r-[3px] border-line bg-paper">
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-full border-[2.5px] border-ink bg-coral text-ink">
              <X size={14} strokeWidth={3.5} />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Header onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-[1280px] p-3 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
