import { useMemo } from 'react'
import { useFinance } from '../store/FinanceContext'
import { currentMonthKey, daysUntil, monthKey, shiftMonthKey } from '../utils/dates'
import { monthlySeries, spendingByCategory, sum } from '../utils/stats'

/** All dashboard numbers, recalculated only when the data changes. */
export function useStats() {
  const { data } = useFinance()
  const { transactions, goals, subscriptions, budgets } = data

  return useMemo(() => {
    const thisMonth = currentMonthKey()
    const lastMonth = shiftMonthKey(-1)
    const inMonth = (key: string) => transactions.filter((t) => monthKey(t.date) === key)

    const totalIncome = sum(transactions.filter((t) => t.type === 'income'))
    const totalExpense = sum(transactions.filter((t) => t.type === 'expense'))
    const monthIncome = sum(inMonth(thisMonth).filter((t) => t.type === 'income'))
    const monthExpense = sum(inMonth(thisMonth).filter((t) => t.type === 'expense'))
    const lastIncome = sum(inMonth(lastMonth).filter((t) => t.type === 'income'))
    const lastExpense = sum(inMonth(lastMonth).filter((t) => t.type === 'expense'))
    const spentByCat = Object.fromEntries(spendingByCategory(transactions, thisMonth).map((c) => [c.name, c.value]))

    const upcomingBills = subscriptions
      .filter((s) => s.active)
      .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
      .filter((s) => daysUntil(s.nextDate) <= 45)

    const overBudget = budgets.filter((b) => (spentByCat[b.category] ?? 0) > b.limit)

    return {
      balance: totalIncome - totalExpense,
      monthIncome,
      monthExpense,
      lastIncome,
      lastExpense,
      totalSavedInGoals: goals.reduce((total, g) => total + g.saved, 0),
      spentByCat,
      upcomingBills,
      overBudget,
      series6: monthlySeries(transactions, 6),
      recent: [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    }
  }, [transactions, goals, subscriptions, budgets])
}
