import raw from '../data/students.json'
import type { Student } from '../types'
import { asset } from './asset'

const clean = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

/** Normalises the JSON so blank strings behave exactly like missing fields. */
export const students: Student[] = (raw as Partial<Student>[])
  .filter((s): s is Student => Boolean(clean(s.id) && clean(s.name) && clean(s.currentPhoto)))
  .map((s) => ({
    id: s.id.trim(),
    name: s.name.trim(),
    currentPhoto: asset(s.currentPhoto.trim()),
    nickname: clean(s.nickname),
    quote: clean(s.quote),
    university: clean(s.university),
    major: clean(s.major),
    city: clean(s.city),
    babyPhoto: asset(clean(s.babyPhoto)),
    reel: asset(clean(s.reel)),
    tenYearsGoal: clean(s.tenYearsGoal),
    funFacts: Array.isArray(s.funFacts) ? s.funFacts.map(clean).filter((f): f is string => !!f) : undefined,
  }))

export const studentById = (id: string | undefined) => students.find((s) => s.id === id)

export const studentsWithReels = students.filter((s) => s.reel)

export const UNDECIDED = 'Still deciding'

export function groupByUniversity(list: Student[]) {
  const map = new Map<string, Student[]>()
  for (const s of list) {
    const key = s.university ?? UNDECIDED
    map.set(key, [...(map.get(key) ?? []), s])
  }
  return [...map.entries()]
    .map(([university, people]) => ({ university, people }))
    .sort((a, b) =>
      a.university === UNDECIDED ? 1 : b.university === UNDECIDED ? -1 : b.people.length - a.people.length || a.university.localeCompare(b.university),
    )
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}
