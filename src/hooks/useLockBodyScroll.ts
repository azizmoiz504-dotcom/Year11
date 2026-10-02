import { useEffect } from 'react'

let locks = 0

export function useLockBodyScroll(active = true) {
  useEffect(() => {
    if (!active) return
    locks++
    const { body, documentElement } = document
    const scrollbar = window.innerWidth - documentElement.clientWidth
    body.style.overflow = 'hidden'
    body.style.paddingRight = scrollbar ? `${scrollbar}px` : ''
    return () => {
      if (--locks === 0) {
        body.style.overflow = ''
        body.style.paddingRight = ''
      }
    }
  }, [active])
}
