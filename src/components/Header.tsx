import { config } from '../config'
import { scrollToSection } from '../lib/asset'
import { useData } from '../context/DataContext'
import { ThemeToggle } from './ThemeToggle'

const allLinks = (galleryCount: number) => [
  { id: 'seniors', label: 'Seniors', show: true },
  { id: 'ten-years', label: '10 years', show: Boolean(config.videos.tenYears) },
  { id: 'gallery', label: 'Gallery', show: galleryCount > 0 },
  { id: 'signatures', label: 'Signatures', show: Boolean(config.videos.signature) },
].filter((l) => l.show)

export function Header() {
  const { gallery } = useData()
  const links = allLinks(gallery.length)
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <a href="#top" onClick={(e) => scrollToSection(e, 'top')} className="shrink-0 font-serif text-lg italic">
          ’{String(config.classYear).slice(-2)}
        </a>
        <nav aria-label="Sections" className="flex flex-1 justify-start gap-0.5 overflow-x-auto [scrollbar-width:none] sm:justify-center">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => scrollToSection(e, l.id)}
              className="shrink-0 rounded-full px-2.5 py-1.5 text-[13px] sm:px-3 whitespace-nowrap text-muted transition-colors hover:bg-line hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
