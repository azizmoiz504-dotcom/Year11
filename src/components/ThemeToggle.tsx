import { useTheme } from '../hooks/useTheme'
import { MoonIcon, SunIcon } from './Icons'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid size-10 place-items-center rounded-full text-ink-soft transition hover:bg-line"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
