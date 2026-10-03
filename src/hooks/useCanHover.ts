import { useSyncExternalStore } from 'react'

const QUERY = '(hover: hover) and (pointer: fine)'

/** True on devices with a real hover pointer (mouse or trackpad). */
export function useCanHover() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(QUERY)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
