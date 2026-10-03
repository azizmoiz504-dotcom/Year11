import raw from '../data/students.json'
import type { Student } from '../types'
import { asset } from './asset'

const clean = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

/** Loads students.json, skipping incomplete rows and treating blank strings as missing. */
export const students: Student[] = (raw as Partial<Student>[]).flatMap((s) => {
  const id = clean(s.id)
  const name = clean(s.name)
  const photo = clean(s.photo)
  if (!id || !name || !photo) return []
  return [{ id, name, photo: asset(photo), babyPhoto: asset(clean(s.babyPhoto)), university: clean(s.university), quote: clean(s.quote) }]
})

export const universitiesOf = (list: Student[]) =>
  [...new Set(list.map((s) => s.university).filter((u): u is string => !!u))].sort((a, b) => a.localeCompare(b))

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}
