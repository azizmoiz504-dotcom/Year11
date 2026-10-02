import type { MouseEvent } from 'react'

/**
 * Resolves a "/media/..." path from students.json or config. Normal builds serve from the
 * site root; the "artifact" build is hosted under a sub-path, so it uses relative URLs.
 */
export function asset(path: string): string
export function asset(path: string | undefined): string | undefined
export function asset(path: string | undefined) {
  if (!path || import.meta.env.MODE !== 'artifact' || !path.startsWith('/')) return path
  return `.${path}`
}

/** Smooth-scrolls to a section without touching the URL (works with any router). */
export function scrollToSection(e: MouseEvent, id: string) {
  const el = document.getElementById(id)
  if (!el) return
  e.preventDefault()
  el.scrollIntoView({ behavior: 'smooth' })
}
