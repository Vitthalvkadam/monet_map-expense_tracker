const pad = (n: number) => String(n).padStart(2, '0')

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayISO = () => toISO(new Date())
export const monthKey = (iso: string) => iso.slice(0, 7) // YYYY-MM
export const currentMonthKey = () => monthKey(todayISO())

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addMonths(iso: string, n: number): string {
  const d = parseISO(iso)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, last))
  return toISO(d)
}

/** Key (YYYY-MM) of the month `offset` months away from today (negative = past). */
export function shiftMonthKey(offset: number): string {
  return monthKey(addMonths(todayISO(), offset))
}

export function monthLabel(key: string, long = false): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', long ? { month: 'long', year: 'numeric' } : { month: 'short' })
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  return parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function daysUntil(iso: string): number {
  const today = parseISO(todayISO()).getTime()
  return Math.round((parseISO(iso).getTime() - today) / 86400000)
}

export function dueLabel(iso: string): string {
  const n = daysUntil(iso)
  if (n < 0) return `${Math.abs(n)}d overdue`
  if (n === 0) return 'Due today'
  if (n === 1) return 'Tomorrow'
  return `In ${n} days`
}
