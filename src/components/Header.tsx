import { config } from '../config'
import { scrollToSection } from '../lib/asset'
import { gallery } from '../lib/gallery'
import { ThemeToggle } from './ThemeToggle'

const link = 'rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-ink'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <a href="#top" onClick={(e) => scrollToSection(e, 'top')} className="mr-auto text-[15px] font-semibold tracking-tight">
          Class of {config.classYear}
        </a>
        <nav aria-label="Sections" className="flex items-center">
          <a href="#seniors" onClick={(e) => scrollToSection(e, 'seniors')} className={link}>
            Seniors
          </a>
          {gallery.length > 0 && (
            <a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')} className={link}>
              Gallery
            </a>
          )}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
