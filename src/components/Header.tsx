import { config } from '../config'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="text-[15px] font-medium tracking-tight">
          Class of {config.classYear}
        </a>
        <ThemeToggle />
      </div>
    </header>
  )
}
