import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { config } from '../config'

export const UNLOCK_KEY = 'yb-unlocked'

export function PasswordScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim().toLowerCase() === config.password.value.toLowerCase()) {
      try {
        localStorage.setItem(UNLOCK_KEY, '1')
      } catch {
        /* ignore */
      }
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <motion.main
      className="fixed inset-0 z-40 flex items-center justify-center bg-bg px-6"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm text-center"
      >
        <p className="mb-3 text-sm text-muted">Members only</p>
        <h1 className="font-serif text-5xl">For the class of {config.classYear}</h1>
        <p className="mt-3 text-sm text-muted">{config.password.hint}</p>
        <label htmlFor="pw" className="sr-only">
          Password
        </label>
        <input
          id="pw"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          aria-invalid={error}
          aria-describedby={error ? 'pw-error' : undefined}
          className="mt-8 w-full rounded-full border border-line bg-surface px-5 py-3.5 text-center text-base outline-none transition focus:border-ink"
          placeholder="Password"
        />
        <p id="pw-error" role="alert" className="mt-3 h-5 text-sm text-red-600 dark:text-red-400">
          {error ? "That's not it. Try again?" : ''}
        </p>
        <button type="submit" className="mt-2 rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-bg transition hover:opacity-90">
          Open the yearbook
        </button>
      </motion.form>
    </motion.main>
  )
}
