import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Polaroid } from '../components/Polaroid'
import { SmartImage } from '../components/SmartImage'
import { config } from '../config'
import { useNow } from '../hooks/useNow'
import { scrollToSection } from '../lib/asset'
import { diffParts, fmt, localDate, pad } from '../lib/dates'
import { students } from '../lib/students'

const ease = [0.22, 1, 0.36, 1] as const

function Counter({ value, label, ticker }: { value: string; label: string; ticker?: string }) {
  return (
    <div className="flex flex-col items-center px-4 sm:px-8">
      <span className="font-serif text-4xl font-light tabular-nums sm:text-6xl">{value}</span>
      <span className="mt-2 text-[11px] tracking-[0.2em] text-muted uppercase">{label}</span>
      {ticker && <span className="mt-1 font-mono text-[11px] text-muted/80 tabular-nums">{ticker}</span>}
    </div>
  )
}

export function Hero() {
  const now = useNow(1000)
  const since = diffParts(localDate(config.firstDay), now)
  const grad = diffParts(now, localDate(config.graduationDay))
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yTitle = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const yPhotos = useTransform(scrollYProgress, [0, 1], ['0%', '-25%'])

  const strip = students.filter((s) => s.babyPhoto).slice(0, 5)
  const rotations = [-7, 4, -2, 6, -4]

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16">
      <motion.div style={{ y: yTitle, opacity: fade }} className="relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.4 }}
          className="mb-4 text-[11px] tracking-[0.4em] text-accent uppercase"
        >
          {config.schoolName} · Yearbook
        </motion.p>
        <h1 className="font-serif leading-[0.85] font-light tracking-tight">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.5, ease }}
            className="block text-[17vw] sm:text-[9rem] lg:text-[11rem]"
          >
            Class of
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.7, ease }}
            className="block text-[17vw] italic sm:text-[9rem] lg:text-[11rem]"
          >
            {config.classYear}
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.2 }}
          className="mt-6 font-serif text-xl text-ink-soft italic sm:text-2xl"
        >
          {config.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1.5, ease }}
          className="mt-12 flex items-start justify-center divide-x divide-line"
          aria-live="off"
        >
          <Counter value={fmt(since.days)} label="days since our first day" />
          <Counter
            value={fmt(grad.days)}
            label={grad.future ? 'days until graduation' : 'days since graduation'}
            ticker={`${pad(grad.hours)}:${pad(grad.minutes)}:${pad(grad.seconds)}`}
          />
        </motion.div>
      </motion.div>

      {/* Scattered baby polaroids drifting behind the title */}
      {strip.length > 0 && (
        <motion.div aria-hidden="true" style={{ y: yPhotos }} className="pointer-events-none absolute inset-0 overflow-hidden">
          {strip.map((s, i) => {
            const positions = [
              'left-[-4%] top-[14%] sm:left-[6%] sm:top-[18%]',
              'right-[-6%] top-[10%] sm:right-[8%] sm:top-[14%]',
              'left-[2%] bottom-[8%] sm:left-[12%] sm:bottom-[12%]',
              'right-[0%] bottom-[12%] sm:right-[14%] sm:bottom-[10%]',
              'hidden lg:block left-[40%] bottom-[-2%]',
            ]
            return (
              <div key={s.id} className={`absolute w-20 opacity-20 sm:w-36 sm:opacity-60 dark:opacity-25 ${positions[i]}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 2, delay: 1 + i * 0.25 }}
                >
                  <Polaroid rotate={rotations[i]}>
                    <SmartImage src={s.babyPhoto} alt="" className="aspect-square w-full" eager />
                  </Polaroid>
                </motion.div>
              </div>
            )
          })}
        </motion.div>
      )}

      <motion.a
        href="#class"
        onClick={(e) => scrollToSection(e, 'class')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-muted uppercase"
      >
        Scroll
        <motion.span
          className="block h-8 w-px bg-current"
          animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.a>
    </section>
  )
}
