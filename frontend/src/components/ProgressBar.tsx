interface Props {
  value: number // 0-100
  color?: string
  label?: string
}

export function ProgressBar({ value, color = '#A9E8A4', label }: Props) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-5 overflow-hidden rounded-full border-[3px] border-line bg-soft"
    >
      <div
        className={`h-full transition-[width] duration-500 ${v > 0 && v < 100 ? 'border-r-[3px] border-line' : ''}`}
        style={{ width: `${v}%`, backgroundColor: color }}
      />
    </div>
  )
}
