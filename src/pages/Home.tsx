import { useDeferredValue, useState } from 'react'
import { Gallery } from '../components/Gallery'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { SearchIcon } from '../components/Icons'
import { StudentCard } from '../components/StudentCard'
import { SignatureVideo, TenYearsVideo } from '../components/VideoSections'
import { config } from '../config'
import { useData } from '../context/DataContext'
import { OpenSpot } from '../components/OpenSpot'
import { universitiesOf } from '../lib/students'

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function Home({ hidden }: { hidden?: boolean }) {
  const { students, loading, failed, live } = useData()
  const universities = universitiesOf(students)
  const [query, setQuery] = useState('')
  const [uni, setUni] = useState('')
  const q = useDeferredValue(normalise(query.trim()))
  const filtering = Boolean(q || uni)
  // Without a backend, show placeholder spots for classmates not in students.json yet.
  const openSpots = filtering || live ? 0 : Math.max(0, config.classSize - students.length)
  const shown = students.filter((s) => (!uni || s.university === uni) && (!q || normalise(s.name).includes(q)))

  return (
    <div inert={hidden || undefined}>
      <Header />
      <main>
        <Hero />

        {/* Seniors */}
        <section id="seniors" className="mx-auto max-w-7xl scroll-mt-14 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-8 flex flex-col gap-5 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-[11px] font-medium tracking-[0.35em] text-accent uppercase">{live ? `${students.length} of us` : `${students.length} of ${config.classSize}`}</p>
              <h2 className="font-serif text-5xl leading-none font-light sm:text-6xl">Seniors</h2>
              <p className="mt-3 text-[15px] text-muted">{live ? 'Tap your card to add your photo and quote.' : 'Tap anyone to see their page.'}</p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row lg:w-[36rem]">
              <label className="relative flex-1">
                <span className="sr-only">Search by name</span>
                <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" width={17} height={17} />
                <input
                  id="search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a name"
                  className="w-full rounded-full border border-line bg-surface py-2.5 pr-4 pl-11 text-base outline-none transition-colors placeholder:text-muted focus:border-ink sm:text-sm"
                />
              </label>
              {universities.length > 1 && (
                <label className="relative sm:w-60">
                  <span className="sr-only">Filter by university</span>
                  <select
                    id="university"
                    value={uni}
                    onChange={(e) => setUni(e.target.value)}
                    className="w-full appearance-none rounded-full border border-line bg-surface py-2.5 pr-10 pl-4 text-base outline-none transition-colors focus:border-ink sm:text-sm"
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
          </div>

          <p className="sr-only" aria-live="polite">
            {shown.length} shown
          </p>

          {failed && (
            <p className="mb-8 rounded-2xl border border-line bg-surface px-5 py-4 text-sm text-muted">Couldn't load the class right now. Check your connection and refresh.</p>
          )}

          <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 xl:gap-x-3">
            {loading
              ? Array.from({ length: config.classSize }, (_, i) => (
                  <li key={i} className="aspect-[4/5] animate-pulse bg-line" aria-hidden="true" />
                ))
              : shown.map((s) => <StudentCard key={s.id} student={s} />)}
            {!loading && Array.from({ length: openSpots }, (_, i) => <OpenSpot key={`open-${i}`} />)}
          </ul>

          {!loading && filtering && shown.length === 0 && (
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
        </section>

        <TenYearsVideo />
        <Gallery />
        <SignatureVideo />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 pt-8 pb-28 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
          <span>
            Class of {config.classYear} · {config.schoolName}
          </span>
          <span>See you around.</span>
        </div>
      </footer>
    </div>
  )
}
