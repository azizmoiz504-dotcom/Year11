const DAY = 86_400_000

/** Parses YYYY-MM-DD as local midnight, so counters roll over at the visitor's midnight. */
export function localDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

export function diffParts(from: Date, to: Date) {
  const ms = Math.abs(to.getTime() - from.getTime())
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
    future: to.getTime() > from.getTime(),
  }
}

export const pad = (n: number) => String(n).padStart(2, '0')
export const fmt = (n: number) => n.toLocaleString('en-US')
