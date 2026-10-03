import { AnimatePresence } from 'framer-motion'
import { useDeferredValue, useState } from 'react'
import { Header } from '../components/Header'
import { SearchIcon } from '../components/Icons'
import { StudentCard } from '../components/StudentCard'
import { config } from '../config'
import { students, universities } from '../lib/students'

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function Home({ hidden }: { hidden?: boolean }) {
  const [query, setQuery] = useState('')
  const [uni, setUni] = useState('')
  const q = useDeferredValue(normalise(query.trim()))

  const shown = students.filter((s) => (!uni || s.university === uni) && (!q || normalise(s.name).includes(q)))

  return (
    <div inert={hidden || undefined}>
      <Header />
      <main id="top" className="mx-auto max-w-6xl px-4 pb-32 sm:px-6">
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16">
          <p className="text-sm text-muted">{config.schoolName}</p>
          <h1 className="mt-2 font-serif text-[clamp(3.75rem,17vw,9rem)] leading-[0.9] tracking-tight">
            Class of <em>{config.classYear}</em>
          </h1>
          <p className="mt-5 text-[15px] text-muted">
            {students.length} graduates
            {universities.length > 0 && ` · ${universities.length} universities`}
          </p>
        </section>

        <div className="mb-8 flex flex-col gap-2.5 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search by name</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" width={17} height={17} />
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a name"
              className="w-full rounded-full border border-line bg-surface py-2.5 pr-4 pl-11 text-base outline-none transition placeholder:text-muted focus:border-ink sm:text-sm"
            />
          </label>
          {universities.length > 1 && (
            <label className="relative sm:w-72">
              <span className="sr-only">Filter by university</span>
              <select
                id="university"
                value={uni}
                onChange={(e) => setUni(e.target.value)}
                className="w-full appearance-none rounded-full border border-line bg-surface py-2.5 pr-10 pl-4 text-base outline-none transition focus:border-ink sm:text-sm"
              >
                <option value="">All universities</option>
                {universities.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-muted">
                ▾
              </span>
            </label>
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {shown.length} shown
        </p>

        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {shown.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </AnimatePresence>
        </ul>

        {shown.length === 0 && (
          <p className="py-16 text-center text-muted">
            No one matches that.{' '}
            <button
              type="button"
              className="text-ink underline underline-offset-4"
              onClick={() => {
                setQuery('')
                setUni('')
              }}
            >
              Clear
            </button>
          </p>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
          <span>
            Class of {config.classYear} · {config.schoolName}
          </span>
          <span>See you around.</span>
        </div>
      </footer>
    </div>
  )
}
