import {
  Utensils, Home, Bus, ShoppingBag, Receipt, Clapperboard, HeartPulse, GraduationCap,
  Briefcase, Laptop, TrendingUp, Gift, CircleDollarSign, type LucideIcon,
} from 'lucide-react'
import type { TxType } from '../types'

export interface CategoryInfo { name: string; color: string; icon: LucideIcon }

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { name: 'Food', color: '#FFB36B', icon: Utensils },
  { name: 'Rent', color: '#CDB8F7', icon: Home },
  { name: 'Transport', color: '#FFE580', icon: Bus },
  { name: 'Shopping', color: '#FFB3C7', icon: ShoppingBag },
  { name: 'Bills', color: '#A9E8A4', icon: Receipt },
  { name: 'Entertainment', color: '#9ED8F5', icon: Clapperboard },
  { name: 'Health', color: '#FF9A8B', icon: HeartPulse },
  { name: 'Education', color: '#C6E58A', icon: GraduationCap },
  { name: 'Other', color: '#D8CBBA', icon: CircleDollarSign },
]

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { name: 'Salary', color: '#A9E8A4', icon: Briefcase },
  { name: 'Freelance', color: '#CDB8F7', icon: Laptop },
  { name: 'Investments', color: '#FFE580', icon: TrendingUp },
  { name: 'Gifts', color: '#FFB3C7', icon: Gift },
  { name: 'Other', color: '#D8CBBA', icon: CircleDollarSign },
]

export const categoriesFor = (type: TxType) => (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)

export function categoryInfo(name: string, type: TxType = 'expense'): CategoryInfo {
  const list = categoriesFor(type)
  return list.find((c) => c.name === name) ?? list[list.length - 1]
}
