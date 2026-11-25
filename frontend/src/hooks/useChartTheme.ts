import { useFinance } from '../store/FinanceContext'

/** Colours for Recharts, which can't read CSS variables reliably. */
export function useChartTheme() {
  const dark = useFinance().data.settings.theme === 'dark'
  return {
    axis: dark ? '#fff1de' : '#1b1b1b',
    grid: dark ? 'rgba(255,233,204,.18)' : 'rgba(27,27,27,.15)',
    stroke: dark ? '#fff1de' : '#1b1b1b',
    tooltip: { backgroundColor: dark ? '#241b30' : '#fff8ec', border: `3px solid ${dark ? '#ffe9cc' : '#1b1b1b'}`, borderRadius: 12, color: dark ? '#fff1de' : '#1b1b1b', fontWeight: 700 },
    income: '#A9E8A4',
    expense: '#FFB36B',
    savings: '#CDB8F7',
  }
}
