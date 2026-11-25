import type { Transaction } from '../types'
import { monthKey, monthLabel, shiftMonthKey } from './dates'

export interface MonthPoint { key: string; label: string; income: number; expense: number; saved: number }

export const sum = (list: Transaction[]) => list.reduce((s, t) => s + t.amount, 0)

/** Income / expense totals for the last `n` months (oldest first, includes empty months). */
export function monthlySeries(transactions: Transaction[], n: number): MonthPoint[] {
  const points: MonthPoint[] = []
  for (let i = n - 1; i >= 0; i--) {
    const key = shiftMonthKey(-i)
    const inMonth = transactions.filter((t) => monthKey(t.date) === key)
    const income = sum(inMonth.filter((t) => t.type === 'income'))
    const expense = sum(inMonth.filter((t) => t.type === 'expense'))
    points.push({ key, label: monthLabel(key), income, expense, saved: income - expense })
  }
  return points
}

/** Expense totals per category for one month, biggest first. */
export function spendingByCategory(transactions: Transaction[], key: string) {
  const totals = new Map<string, number>()
  transactions
    .filter((t) => t.type === 'expense' && monthKey(t.date) === key)
    .forEach((t) => totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount))
  return [...totals.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}
