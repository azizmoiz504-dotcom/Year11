import { useDeferredValue, useState } from 'react'
import { Gallery } from '../components/Gallery'
import { Header } from '../components/Header'
import { SearchIcon } from '../components/Icons'
import { StudentCard } from '../components/StudentCard'
import { config } from '../config'
import { scrollToSection } from '../lib/asset'
import { gallery } from '../lib/gallery'
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

  const stats = [
    { value: students.length, label: 'Seniors' },
    universities.length > 0 && { value: universities.length, label: 'Universities' },
    gallery.length > 0 && { value: gallery.length, label: 'Photos' },
  ].filter(Boolean) as { value: number; label: string }[]

  return (
    <div inert={hidden || undefined}>
      <Header />
      <main id="top" className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Cover */}
        <section className="grid gap-10 pt-14 pb-14 sm:pt-24 sm:pb-20 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-medium tracking-[0.18em] text-muted uppercase">{config.schoolName} · Yearbook</p>
            <h1 className="mt-4 font-serif text-[clamp(4rem,18vw,11rem)] leading-[0.85] tracking-tight">
              Class of
              <br />
              <em>{config.classYear}</em>
            </h1>
          </div>
          <div className="flex flex-col gap-6">
            <dl className="flex gap-8 sm:gap-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs tracking-wide text-muted uppercase">{s.label}</dt>
                  <dd className="mt-1 text-3xl font-medium tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-2">
              <a href="#seniors" onClick={(e) => scrollToSection(e, 'seniors')} className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85">
                See the seniors
              </a>
              {gallery.length > 0 && (
                <a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')} className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:bg-line">
                  Gallery
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Seniors */}
        <section id="seniors" className="scroll-mt-14 border-t border-line py-16 sm:py-24">
          <div className="mb-8 flex flex-col gap-5 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-serif text-5xl leading-none sm:text-6xl">Seniors</h2>
              <p className="mt-3 text-[15px] text-muted">Tap anyone to see their page.</p>
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

          <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {shown.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
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
        </section>

        <Gallery />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 pt-8 pb-24 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
          <span>
            Class of {config.classYear} · {config.schoolName}
          </span>
          <span>See you around.</span>
        </div>
      </footer>
    </div>
  )
}
