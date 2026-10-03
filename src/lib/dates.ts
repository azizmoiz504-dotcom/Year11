const DAY = 86_400_000

/** Parses YYYY-MM-DD as local midnight, so counts roll over at the visitor's midnight. */
export function localDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

/** Whole calendar days from today to `target` (negative once it has passed, 0 on the day). */
export function daysUntil(target: Date, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / DAY)
}

export const fmt = (n: number) => n.toLocaleString('en-US')
