import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router'
import { config } from '../config'
import { scrollToSection } from '../lib/asset'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { href: '#class', label: 'The class' },
  { href: '#years', label: 'Our years' },
  { href: '#going', label: 'Where we go' },
  { href: '#reels', label: 'Reels' },
  { href: '#ending', label: 'Goodbye' },
]

export function Header() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setSolid(y > 40))

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
      className={`fixed inset-x-0 top-0 z-30 pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-500 ${
        solid ? 'border-b border-line bg-paper/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <a href="#top" onClick={(e) => scrollToSection(e, 'top')} className="font-serif text-lg italic">
          ’{String(config.classYear).slice(-2)}
        </a>
        <nav aria-label="Sections" className="no-scrollbar -mx-1 flex flex-1 justify-start gap-1 overflow-x-auto sm:justify-center">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => scrollToSection(e, l.href.slice(1))}
              className="shrink-0 rounded-full px-3 py-1.5 text-[13px] whitespace-nowrap text-ink-soft transition hover:bg-line hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/reels"
            className="hidden shrink-0 rounded-full px-3 py-1.5 text-[13px] whitespace-nowrap text-ink-soft transition hover:bg-line hover:text-ink sm:inline"
          >
            Reels wall ↗
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </motion.header>
  )
}
