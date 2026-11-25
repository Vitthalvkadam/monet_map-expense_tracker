export const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  { code: 'USD', label: 'US Dollar ($)', locale: 'en-US' },
  { code: 'EUR', label: 'Euro (€)', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound (£)', locale: 'en-GB' },
  { code: 'JPY', label: 'Japanese Yen (¥)', locale: 'ja-JP' },
]

export interface Money {
  full: (n: number) => string
  whole: (n: number) => string
  compact: (n: number) => string
}

export function makeMoney(code: string): Money {
  const locale = CURRENCIES.find((c) => c.code === code)?.locale ?? 'en-IN'
  const digits = code === 'JPY' ? 0 : 2
  const full = new Intl.NumberFormat(locale, { style: 'currency', currency: code, minimumFractionDigits: 0, maximumFractionDigits: digits })
  const whole = new Intl.NumberFormat(locale, { style: 'currency', currency: code, maximumFractionDigits: 0 })
  const compact = new Intl.NumberFormat(locale, { style: 'currency', currency: code, notation: 'compact', maximumFractionDigits: 1 })
  return { full: (n) => full.format(n), whole: (n) => whole.format(n), compact: (n) => compact.format(n) }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
export const pct = (value: number, total: number) => (total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0)
