import type { ReactNode } from 'react'
import { PiggyBank, Target, TrendingUp, Wallet } from 'lucide-react'
import { Logo } from '../components/Logo'

const PERKS = [
  { icon: Wallet, text: 'Track every rupee in and out', color: '#A9E8A4' },
  { icon: PiggyBank, text: 'Budgets that warn you early', color: '#FFE580' },
  { icon: Target, text: 'Savings goals that fill up', color: '#CDB8F7' },
  { icon: TrendingUp, text: 'Charts from your own data', color: '#FFB36B' },
]

/** Shared retro window shell for the login and signup pages. */
export default function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border-[3px] border-line bg-paper shadow-hard-lg lg:grid-cols-[1fr_1.1fr]">
        <aside className="hidden flex-col justify-between gap-6 border-r-[3px] border-line bg-butter p-7 text-ink lg:flex">
          <Logo />
          <div>
            <h2 className="text-3xl font-bold leading-tight">Your money,<br />on one tidy desktop.</h2>
            <ul className="mt-5 space-y-3">
              {PERKS.map(({ icon: Icon, text, color }) => (
                <li key={text} className="flex items-center gap-3 font-bold">
                  <span className="grid h-10 w-10 shrink-0 -rotate-3 place-items-center rounded-xl border-[3px] border-ink shadow-hard-sm" style={{ backgroundColor: color, boxShadow: '2px 2px 0 0 #1b1b1b' }}>
                    <Icon size={18} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm font-bold opacity-80">Your data is private to your account.</p>
        </aside>

        <section>
          <header className="border-b-[3px] border-line bg-titlebar px-4 py-2.5 font-display text-lg font-semibold text-ink">{title}</header>
          <div className="p-6 sm:p-8">
            <div className="mb-5 lg:hidden"><Logo /></div>
            <p className="mb-5 font-semibold text-muted">{subtitle}</p>
            {children}
            <p className="mt-6 text-center font-bold">{footer}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
