import { AnimatePresence } from 'framer-motion'
import { useDeferredValue, useMemo, useState } from 'react'
import { SearchIcon } from '../components/Icons'
import { SectionHeading } from '../components/Reveal'
import { StudentCard } from '../components/StudentCard'
import { students, UNDECIDED } from '../lib/students'

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function StudentGrid() {
  const [query, setQuery] = useState('')
  const [uni, setUni] = useState('')
  const q = useDeferredValue(normalise(query.trim()))

  const universities = useMemo(
    () => [...new Set(students.map((s) => s.university ?? UNDECIDED))].sort((a, b) => (a === UNDECIDED ? 1 : b === UNDECIDED ? -1 : a.localeCompare(b))),
    [],
  )

  const shown = students.filter((s) => {
    if (uni && (s.university ?? UNDECIDED) !== uni) return false
    if (!q) return true
    return normalise(`${s.name} ${s.nickname ?? ''}`).includes(q)
  })

  return (
    <section id="class" className="scroll-mt-16 px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow={`${students.length} of us`} title="The faces we grew up with">
        Hover or tap a photo to see who we used to be.
      </SectionHeading>

      <div className="mx-auto mb-10 flex max-w-3xl flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search by name</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" width={18} height={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a name…"
            className="w-full rounded-full border border-line bg-paper-2/60 py-3 pr-4 pl-11 text-base outline-none transition placeholder:text-muted focus:border-accent sm:text-sm"
          />
        </label>
        <label className="relative sm:w-72">
          <span className="sr-only">Filter by university</span>
          <select
            value={uni}
            onChange={(e) => setUni(e.target.value)}
            className="w-full appearance-none rounded-full border border-line bg-paper-2/60 px-5 py-3 pr-10 text-base outline-none transition focus:border-accent sm:text-sm"
          >
            <option value="">All universities</option>
            {universities.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-xs text-muted">
            ▾
          </span>
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'student' : 'students'} shown
      </p>

      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {shown.map((s, i) => (
            <StudentCard key={s.id} student={s} index={i} />
          ))}
        </AnimatePresence>
      </ul>

      {shown.length === 0 && (
        <p className="mt-6 text-center font-serif text-xl text-muted italic">
          Nobody by that name… yet.{' '}
          <button
            type="button"
            className="text-accent underline underline-offset-4"
            onClick={() => {
              setQuery('')
              setUni('')
            }}
          >
            Clear search
          </button>
        </p>
      )}
    </section>
  )
}
