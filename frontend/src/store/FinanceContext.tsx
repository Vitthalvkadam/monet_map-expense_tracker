import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AppData, Budget, Goal, Settings, Subscription, Transaction } from '../types'
import { api, errorMessage } from '../utils/api'
import { makeMoney, type Money } from '../utils/format'
import { FullScreenMessage } from '../components/FullScreenMessage'
import { Toast } from '../components/Toast'

interface FinanceContextValue {
  data: AppData
  money: Money
  // Every action talks to the backend and resolves to true on success (false = failed, a toast explains why)
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<boolean>
  updateTransaction: (t: Transaction) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<boolean>
  saveBudget: (b: Omit<Budget, 'id'> & { id?: string }) => Promise<boolean>
  deleteBudget: (id: string) => Promise<boolean>
  saveGoal: (g: Omit<Goal, 'id' | 'saved'> & { id?: string }) => Promise<boolean>
  deleteGoal: (id: string) => Promise<boolean>
  contributeToGoal: (id: string, amount: number) => Promise<boolean>
  saveSubscription: (s: Omit<Subscription, 'id'> & { id?: string }) => Promise<boolean>
  deleteSubscription: (id: string) => Promise<boolean>
  toggleSubscription: (id: string) => Promise<boolean>
  markSubscriptionPaid: (id: string) => Promise<boolean>
  updateSettings: (s: Partial<Settings>) => void
  clearAll: () => Promise<boolean>
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

const emptyData: AppData = {
  transactions: [],
  budgets: [],
  goals: [],
  subscriptions: [],
  settings: { currency: 'INR', theme: 'light', userName: '' },
}

const fixGoal = (g: Goal): Goal => ({ ...g, deadline: g.deadline ?? '' })
const replaceById = <T extends { id: string }>(list: T[], item: T) => list.map((x) => (x.id === item.id ? item : x))
const upsert = <T extends { id: string }>(list: T[], item: T) => (list.some((x) => x.id === item.id) ? replaceById(list, item) : [...list, item])

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const settingsRef = useRef<Settings>(emptyData.settings)
  const settingsTimer = useRef<number | undefined>(undefined)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const d = await api.get<AppData>('/data')
      settingsRef.current = d.settings
      setData({ ...d, goals: d.goals.map(fixGoal) })
      setStatus('ready')
    } catch (e) {
      setLoadError(errorMessage(e))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Apply the theme to <html> so CSS variables switch (back to light when logging out)
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme
    return () => {
      document.documentElement.dataset.theme = 'light'
    }
  }, [data.settings.theme])

  const money = useMemo(() => makeMoney(data.settings.currency), [data.settings.currency])

  /** Runs an API action; shows a toast and returns false if it fails. */
  const run = useCallback(async (action: () => Promise<void>) => {
    try {
      await action()
      return true
    } catch (e) {
      setNotice(errorMessage(e))
      return false
    }
  }, [])

  const addTransaction = useCallback(
    (t: Omit<Transaction, 'id'>) =>
      run(async () => {
        const created = await api.post<Transaction>('/transactions', t)
        setData((d) => ({ ...d, transactions: [created, ...d.transactions] }))
      }),
    [run],
  )
  const updateTransaction = useCallback(
    (t: Transaction) =>
      run(async () => {
        const saved = await api.put<Transaction>(`/transactions/${t.id}`, t)
        setData((d) => ({ ...d, transactions: replaceById(d.transactions, saved) }))
      }),
    [run],
  )
  const deleteTransaction = useCallback(
    (id: string) =>
      run(async () => {
        await api.delete(`/transactions/${id}`)
        setData((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== id) }))
      }),
    [run],
  )

  const saveBudget = useCallback(
    (b: Omit<Budget, 'id'> & { id?: string }) =>
      run(async () => {
        const saved = b.id ? await api.put<Budget>(`/budgets/${b.id}`, b) : await api.post<Budget>('/budgets', b)
        setData((d) => ({ ...d, budgets: upsert(d.budgets, saved) }))
      }),
    [run],
  )
  const deleteBudget = useCallback(
    (id: string) =>
      run(async () => {
        await api.delete(`/budgets/${id}`)
        setData((d) => ({ ...d, budgets: d.budgets.filter((x) => x.id !== id) }))
      }),
    [run],
  )

  const saveGoal = useCallback(
    (g: Omit<Goal, 'id' | 'saved'> & { id?: string }) =>
      run(async () => {
        const body = { name: g.name, target: g.target, deadline: g.deadline || null, color: g.color }
        const saved = fixGoal(g.id ? await api.put<Goal>(`/goals/${g.id}`, body) : await api.post<Goal>('/goals', body))
        setData((d) => ({ ...d, goals: upsert(d.goals, saved) }))
      }),
    [run],
  )
  const deleteGoal = useCallback(
    (id: string) =>
      run(async () => {
        await api.delete(`/goals/${id}`)
        setData((d) => ({ ...d, goals: d.goals.filter((x) => x.id !== id) }))
      }),
    [run],
  )
  const contributeToGoal = useCallback(
    (id: string, amount: number) =>
      run(async () => {
        const saved = fixGoal(await api.post<Goal>(`/goals/${id}/contribute`, { amount }))
        setData((d) => ({ ...d, goals: replaceById(d.goals, saved) }))
      }),
    [run],
  )

  const saveSubscription = useCallback(
    (s: Omit<Subscription, 'id'> & { id?: string }) =>
      run(async () => {
        const saved = s.id ? await api.put<Subscription>(`/subscriptions/${s.id}`, s) : await api.post<Subscription>('/subscriptions', s)
        setData((d) => ({ ...d, subscriptions: upsert(d.subscriptions, saved) }))
      }),
    [run],
  )
  const deleteSubscription = useCallback(
    (id: string) =>
      run(async () => {
        await api.delete(`/subscriptions/${id}`)
        setData((d) => ({ ...d, subscriptions: d.subscriptions.filter((x) => x.id !== id) }))
      }),
    [run],
  )
  const toggleSubscription = useCallback(
    (id: string) =>
      run(async () => {
        const saved = await api.post<Subscription>(`/subscriptions/${id}/toggle`)
        setData((d) => ({ ...d, subscriptions: replaceById(d.subscriptions, saved) }))
      }),
    [run],
  )
  // Paying a subscription logs an expense and moves the next payment date forward (done by the server)
  const markSubscriptionPaid = useCallback(
    (id: string) =>
      run(async () => {
        const res = await api.post<{ subscription: Subscription; transaction: Transaction }>(`/subscriptions/${id}/pay`)
        setData((d) => ({
          ...d,
          subscriptions: replaceById(d.subscriptions, res.subscription),
          transactions: [res.transaction, ...d.transactions],
        }))
      }),
    [run],
  )

  // Settings change instantly on screen; the save to the server is debounced so typing a name isn't one request per letter
  const updateSettings = useCallback(
    (s: Partial<Settings>) => {
      settingsRef.current = { ...settingsRef.current, ...s }
      setData((d) => ({ ...d, settings: settingsRef.current }))
      window.clearTimeout(settingsTimer.current)
      settingsTimer.current = window.setTimeout(() => {
        run(async () => {
          await api.put<Settings>('/settings', settingsRef.current)
        })
      }, 500)
    },
    [run],
  )

  const clearAll = useCallback(
    () =>
      run(async () => {
        await api.delete('/data')
        setData((d) => ({ ...d, transactions: [], budgets: [], goals: [], subscriptions: [] }))
      }),
    [run],
  )

  const value: FinanceContextValue = {
    data, money, addTransaction, updateTransaction, deleteTransaction, saveBudget, deleteBudget, saveGoal, deleteGoal,
    contributeToGoal, saveSubscription, deleteSubscription, toggleSubscription, markSubscriptionPaid, updateSettings, clearAll,
  }

  if (status === 'loading') return <FullScreenMessage title="Loading your money map…" />
  if (status === 'error') return <FullScreenMessage title="Couldn’t load your data" text={loadError} actionLabel="Try again" onAction={load} />

  return (
    <FinanceContext.Provider value={value}>
      {children}
      {notice && <Toast message={notice} onClose={() => setNotice('')} />}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used inside <FinanceProvider>')
  return ctx
}
