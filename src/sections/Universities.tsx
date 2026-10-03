import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { PinIcon } from '../components/Icons'
import { Reveal, SectionHeading } from '../components/Reveal'
import { SmartImage } from '../components/SmartImage'
import { universityLogos } from '../config'
import { asset } from '../lib/asset'
import { groupByUniversity, students, UNDECIDED } from '../lib/students'
import type { Student } from '../types'

const ease = [0.22, 1, 0.36, 1] as const
const SMALL_WORDS = new Set(['of', 'the', 'and', 'at', 'for', 'de', 'la'])

function monogram(name: string) {
  const words = name.split(/\s+/).filter((w) => !SMALL_WORDS.has(w.toLowerCase()))
  const acronym = words.find((w) => w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w))
  if (acronym) return acronym.slice(0, 4)
  return words
    .map((w) => w[0]!.toUpperCase())
    .join('')
    .slice(0, 3)
}

function Avatars({ people, max = 6 }: { people: Student[]; max?: number }) {
  const shown = people.slice(0, max)
  return (
    <ul className="flex flex-wrap items-center pl-2">
      {shown.map((p) => (
        <li key={p.id} className="-ml-2">
          <Link
            to={`/student/${p.id}`}
            state={{ modal: true }}
            title={p.name}
            className="block size-10 overflow-hidden rounded-full ring-2 ring-paper-2 transition hover:z-10 hover:scale-110 sm:size-11"
          >
            <SmartImage src={p.currentPhoto} alt={p.name} fallbackName={p.name} className="size-full text-xs" />
          </Link>
        </li>
      ))}
      {people.length > max && <li className="-ml-2 grid size-10 place-items-center rounded-full bg-ink text-xs text-paper ring-2 ring-paper-2">+{people.length - max}</li>}
    </ul>
  )
}

export function Universities() {
  const groups = groupByUniversity(students)
  const total = students.length
  const named = groups.filter((g) => g.university !== UNDECIDED)

  const cities = [...students.reduce((m, s) => (s.city ? m.set(s.city, [...(m.get(s.city) ?? []), s]) : m), new Map<string, Student[]>())].sort(
    (a, b) => b[1].length - a[1].length,
  )

  return (
    <section id="going" className="scroll-mt-16 bg-paper-2/50 px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow="Where we're all going" title="Same hallway, different horizons">
        {total} of us, {named.length} {named.length === 1 ? 'university' : 'universities'}
        {cities.length > 0 && `, ${cities.length} ${cities.length === 1 ? 'city' : 'cities'}`}. Tap a face to visit.
      </SectionHeading>

      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => {
          const logo = asset(universityLogos[g.university])
          const big = i === 0 && g.people.length > 1
          const share = Math.round((g.people.length / total) * 100)
          return (
            <motion.li
              key={g.university}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.9, delay: (i % 3) * 0.1, ease }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-paper p-6 sm:p-7 ${
                big ? 'sm:col-span-2' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-paper-2 font-serif text-sm tracking-wider text-ink-soft">
                  {logo ? <img src={logo} alt="" className="size-full object-contain p-2" loading="lazy" /> : monogram(g.university)}
                </div>
                <div className="text-right">
                  <span className={`block font-serif leading-none font-light tabular-nums ${big ? 'text-7xl sm:text-8xl' : 'text-6xl'}`}>
                    {g.people.length}
                  </span>
                  <span className="text-[11px] tracking-[0.2em] text-muted uppercase">{g.people.length === 1 ? 'classmate' : 'classmates'}</span>
                </div>
              </div>

              <div className={big ? 'mt-12' : 'mt-10'}>
                <h3 className={`font-serif leading-tight text-balance ${big ? 'text-3xl sm:text-4xl' : 'text-2xl'} ${g.university === UNDECIDED ? 'italic text-muted' : ''}`}>
                  {g.university}
                </h3>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${share}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, delay: 0.3, ease }}
                  />
                </div>
                <p className="sr-only">
                  {share}% of the class: {g.people.map((p) => p.name).join(', ')}
                </p>
                <div className="mt-5">
                  <Avatars people={g.people} max={big ? 10 : 6} />
                </div>
              </div>
            </motion.li>
          )
        })}
      </ul>

      {cities.length > 0 && (
        <Reveal className="mx-auto mt-14 max-w-6xl">
          <h3 className="mb-4 text-center text-[11px] tracking-[0.32em] text-muted uppercase">Pins on the map</h3>
          <ul className="flex flex-wrap justify-center gap-2">
            {cities.map(([city, people]) => (
              <li key={city} className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm">
                <PinIcon width={16} height={16} className="text-accent" />
                {city}
                <span className="text-muted tabular-nums">{people.length}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </section>
  )
}
