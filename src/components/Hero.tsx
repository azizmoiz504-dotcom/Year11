import { motion, useScroll, useTransform } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { config } from '../config'
import { useNow } from '../hooks/useNow'
import { daysUntil, fmt, localDate } from '../lib/dates'
import { useData } from '../context/DataContext'
import { SmartImage } from './SmartImage'
import { thumbUrl } from '../lib/backend'
import { students as rosterOrder } from '../lib/students'
import { site } from '../site'
import type { Student } from '../types'

const ease = [0.22, 1, 0.36, 1] as const
// Where the six polaroids sit around the title on tablets and computers.
const SPOTS = [
  { pos: 'left-[5%] top-[16%]', rotate: -8 },
  { pos: 'right-[7%] top-[13%]', rotate: 5 },
  { pos: 'left-[11%] bottom-[11%]', rotate: 4 },
  { pos: 'right-[13%] bottom-[9%]', rotate: -6 },
  { pos: 'hidden lg:block left-[26%] top-[6%]', rotate: 3 },
  { pos: 'hidden lg:block right-[28%] bottom-[2%]', rotate: -3 },
]
// On phones: two tidy rows of three, above and below the title.
const PHONE_ROWS = [
  [
    { rotate: -7, y: 'translate-y-2' },
    { rotate: 3, y: '-translate-y-1' },
    { rotate: -3, y: 'translate-y-3' },
  ],
  [
    { rotate: 4, y: '-translate-y-2' },
    { rotate: -5, y: 'translate-y-2' },
    { rotate: 6, y: '-translate-y-1' },
  ],
]

const shuffle = <T,>(list: T[]) => {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/**
 * Six random classmates for the cover: 3 girls + 3 boys on the mixed site, 6 boys on the boys'
 * site, topped up from the gallery if not enough people have photos yet. New mix on every visit.
 */
function pickCoverPhotos(students: Student[], gallerySrcs: string[]) {
  const girlNames = new Set(rosterOrder.slice(site.boysCount).map((s) => s.name.toLowerCase()))
  const withPhoto = shuffle(students.filter((s) => s.photo))
  const girls = withPhoto.filter((s) => girlNames.has(s.name.toLowerCase()))
  const boys = withPhoto.filter((s) => !girlNames.has(s.name.toLowerCase()))
  const wantGirls = girlNames.size > 0 ? 3 : 0
  const chosenGirls = girls.slice(0, wantGirls)
  const chosenBoys = boys.slice(0, 6 - chosenGirls.length)
  const extra = [...girls.slice(wantGirls), ...boys.slice(chosenBoys.length)]
  const people: Student[] = []
  // Alternate boy / girl so neither group clusters on one side.
  for (let i = 0; people.length < 6 && i < 6; i++) {
    if (chosenBoys[i]) people.push(chosenBoys[i]!)
    if (chosenGirls[i] && people.length < 6) people.push(chosenGirls[i]!)
  }
  while (people.length < 6 && extra.length) people.push(extra.shift()!)
  const photos = people.map((s) => ({ src: thumbUrl(s.photo), full: s.photo }))
  for (const src of shuffle(gallerySrcs)) {
    if (photos.length >= 6) break
    photos.push({ src: thumbUrl(src), full: src })
  }
  return photos
}

function Polaroid({ photo, rotate, delay, className = '' }: { photo?: { src?: string; full?: string }; rotate: number; delay: number; className?: string }) {
  return (
    <motion.figure
      className={`polaroid ${className}`}
      style={{ rotate }}
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.4, delay, ease }}
    >
      {photo?.src ? (
        <SmartImage src={photo.src} fallbackSrc={photo.full} alt="" eager className="aspect-square w-full" />
      ) : (
        // Blank, like an undeveloped photo, until people add photos.
        <div className="aspect-square w-full bg-[#eef0f3] shadow-[inset_0_1px_3px_rgb(0_0_0/0.08)]" />
      )}
    </motion.figure>
  )
}

/** Cover: big class title, days-until-graduation countdown, and polaroids from the gallery scattered around it. */
export function Hero() {
  const { gallery, students } = useData()
  // Re-checks every minute, so the number drops by one at midnight.
  const now = useNow(60_000)
  const days = daysUntil(localDate(config.graduationDay), now)
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yTitle = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const yPhotos = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])
  // Picked once per visit (and again when the class list first arrives).
  const photos = useMemo(() => pickCoverPhotos(students, gallery.map((g) => g.src)), [students, gallery])

  return (
    <section ref={ref} id="top" className="relative flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 py-10 sm:min-h-[100svh] sm:pt-20 sm:pb-20">
      {/* soft colour wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40"
        style={{
          background:
            'radial-gradient(35% 30% at 20% 25%, color-mix(in srgb, var(--sky) 40%, transparent), transparent 70%), radial-gradient(35% 30% at 80% 70%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 70%), radial-gradient(30% 25% at 70% 20%, color-mix(in srgb, var(--sky2) 45%, transparent), transparent 70%)',
        }}
      />

      {/* Tablets and computers: polaroids scattered around the title */}
      <motion.div aria-hidden="true" style={{ y: yPhotos }} className="pointer-events-none absolute inset-0 hidden sm:block">
        {SPOTS.map((spot, i) => (
          <div key={i} className={`absolute w-40 ${spot.pos}`}>
            <Polaroid photo={photos[i]} rotate={spot.rotate} delay={0.5 + i * 0.15} />
          </div>
        ))}
      </motion.div>

      {/* Phones: top row of three */}
      <PhoneRow photos={photos.slice(0, 3)} row={0} />

      <motion.div style={{ y: yTitle, opacity: fade }} className="relative z-10 text-center">
        <h1 className="font-serif leading-[0.85] font-light tracking-tight">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease }}
            className="block text-[18vw] sm:text-[9rem] lg:text-[11rem]"
          >
            Class of
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.6, ease }}
            className="block text-[18vw] text-accent italic sm:text-[9rem] lg:text-[11rem]"
          >
            {config.classYear}
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 1 }}
          className="mt-6 font-serif text-xl italic sm:text-2xl"
        >
          {config.tagline}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3, ease }}
          className="mt-10 flex flex-col items-center"
        >
          <span className="font-serif text-5xl font-light tabular-nums sm:text-6xl">{fmt(Math.abs(days))}</span>
          <span className="mt-2 text-[11px] tracking-[0.2em] text-muted uppercase">
            {days > 0 ? (days === 1 ? 'day until graduation' : 'days until graduation') : days === 0 ? 'graduation is today' : 'days since graduation'}
          </span>
        </motion.div>
      </motion.div>

      {/* Phones: bottom row of three */}
      <PhoneRow photos={photos.slice(3, 6)} row={1} />
    </section>
  )
}

function PhoneRow({ photos, row }: { photos: { src?: string; full?: string }[]; row: 0 | 1 }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none relative z-0 flex w-full max-w-[22rem] justify-center gap-3 sm:hidden ${row === 0 ? 'mb-6' : 'mt-8'}`}>
      {PHONE_ROWS[row]!.map((spot, i) => (
        <div key={i} className={`w-[25%] ${spot.y}`}>
          <Polaroid photo={photos[i]} rotate={spot.rotate} delay={0.4 + (row * 3 + i) * 0.12} />
        </div>
      ))}
    </div>
  )
}
