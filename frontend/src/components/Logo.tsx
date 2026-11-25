export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="42" height="42" viewBox="0 0 64 64" aria-hidden className="-rotate-6 drop-shadow-[2px_2px_0_var(--shadow)]">
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#FF9A3C" stroke="#1B1B1B" strokeWidth="5" />
        <path d="M32 12c-8 0-14 6-14 13 0 9 14 25 14 25s14-16 14-25c0-7-6-13-14-13z" fill="#CDB8F7" stroke="#1B1B1B" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="32" cy="25" r="8" fill="#FFE580" stroke="#1B1B1B" strokeWidth="3.5" />
        <path d="M32 21v8M28.5 25h7" stroke="#1B1B1B" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="font-display text-2xl font-bold leading-none tracking-tight">
        Money<span className="text-[#E36A00]">Map</span>
      </span>
    </div>
  )
}
