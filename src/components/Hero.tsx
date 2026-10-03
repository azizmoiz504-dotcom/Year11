import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { config } from '../config'
import { useNow } from '../hooks/useNow'
import { daysUntil, fmt, localDate } from '../lib/dates'
import { useData } from '../context/DataContext'

const ease = [0.22, 1, 0.36, 1] as const
const SPOTS = [
  { pos: 'left-[-6%] top-[12%] sm:left-[5%] sm:top-[16%]', rotate: -8 },
  { pos: 'right-[-8%] top-[9%] sm:right-[7%] sm:top-[13%]', rotate: 5 },
  { pos: 'left-[-2%] bottom-[9%] sm:left-[11%] sm:bottom-[11%]', rotate: 4 },
  { pos: 'right-[-4%] bottom-[13%] sm:right-[13%] sm:bottom-[9%]', rotate: -6 },
  { pos: 'hidden lg:block left-[26%] top-[6%]', rotate: 3 },
  { pos: 'hidden lg:block right-[28%] bottom-[2%]', rotate: -3 },
]

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
  const photos = (gallery.length ? gallery.map((g) => g.src) : students.flatMap((s) => (s.photo ? [s.photo] : []))).slice(0, SPOTS.length)

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-20">
      {/* soft colour wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40"
        style={{
          background:
            'radial-gradient(35% 30% at 20% 25%, color-mix(in srgb, var(--sky) 40%, transparent), transparent 70%), radial-gradient(35% 30% at 80% 70%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 70%), radial-gradient(30% 25% at 70% 20%, color-mix(in srgb, var(--sky2) 45%, transparent), transparent 70%)',
        }}
      />

      <motion.div aria-hidden="true" style={{ y: yPhotos }} className="pointer-events-none absolute inset-0">
        {photos.map((src, i) => (
          <div key={src + i} className={`absolute w-20 sm:w-40 ${SPOTS[i]!.pos}`}>
            <motion.figure
              className="polaroid"
              style={{ rotate: SPOTS[i]!.rotate }}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.5 + i * 0.15, ease }}
            >
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </motion.figure>
          </div>
        ))}
      </motion.div>

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

    </section>
  )
}
