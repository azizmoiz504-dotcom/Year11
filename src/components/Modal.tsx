import { motion } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { CloseIcon } from './Icons'

/** Centred sheet for forms. Escape or the backdrop closes it (unless `busy`). */
export function Modal({ title, onClose, busy, children }: { title: string; onClose: () => void; busy?: boolean; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  useLockBodyScroll()

  useEffect(() => {
    const prev = document.activeElement
    panel.current?.querySelector<HTMLElement>('input, textarea, button')?.focus({ preventScroll: true })
    return () => (prev instanceof HTMLElement ? prev.focus({ preventScroll: true }) : undefined)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [busy, onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div aria-hidden="true" onClick={() => !busy && onClose()} className="absolute inset-0 bg-navy/60 backdrop-blur-sm" />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        exit={{ y: 30 }}
        transition={{ duration: 0.25 }}
        className="relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-serif text-2xl">{title}</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="grid size-10 place-items-center rounded-full hover:bg-line disabled:opacity-40">
            <CloseIcon />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </motion.div>
    </motion.div>
  )
}

export const fieldClass =
  'w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-base outline-none transition-colors placeholder:text-muted/70 focus:border-accent'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}
