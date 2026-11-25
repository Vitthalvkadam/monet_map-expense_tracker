export type TxType = 'income' | 'expense'
export type BillingCycle = 'monthly' | 'yearly'
export type Theme = 'light' | 'dark'

export interface Transaction {
  id: string
  type: TxType
  amount: number
  category: string
  description: string
  date: string // YYYY-MM-DD
}

export interface Budget {
  id: string
  category: string
  limit: number // monthly limit
}

export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  deadline: string // YYYY-MM-DD or ''
  color: string
}

export interface Subscription {
  id: string
  name: string
  amount: number
  cycle: BillingCycle
  nextDate: string // YYYY-MM-DD
  active: boolean
}

export interface Settings {
  currency: string
  theme: Theme
  userName: string
}

export interface AppData {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  subscriptions: Subscription[]
  settings: Settings
}

export interface AuthUser {
  id: string
  name: string
  email: string
}
