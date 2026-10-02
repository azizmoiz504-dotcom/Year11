import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { SmartImage } from '../components/SmartImage'
import { config } from '../config'
import { students } from '../lib/students'

const ease = [0.22, 1, 0.36, 1] as const

/** Every baby photo slowly dissolves into the person they became. */
export function Ending() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, margin: '0px 0px -25% 0px' })
  const [run, setRun] = useState(0)

  return (
    <section id="ending" className="relative scroll-mt-16 overflow-hidden px-4 pt-24 pb-40 sm:px-6 sm:pt-32">
      <div ref={ref}>
      <div key={run} className="mx-auto grid max-w-6xl grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 lg:grid-cols-6">
        {students.map((s, i) => {
          const delay = 0.6 + ((i * 7) % students.length) * 0.35
          return (
            <div key={s.id} className="relative aspect-square overflow-hidden rounded-[2px] bg-paper-2">
              <SmartImage src={s.currentPhoto} alt={`${s.name} now`} fallbackName={s.name} className="absolute inset-0 size-full" />
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: inView ? 0 : 1 }}
                transition={{ duration: 2.4, delay: inView ? delay : 0, ease }}
              >
                {s.babyPhoto ? (
                  <SmartImage src={s.babyPhoto} alt={`${s.name} as a child`} fallbackName={s.name} className="size-full sepia-[0.35]" />
                ) : (
                  <SmartImage src={s.currentPhoto} alt="" fallbackName={s.name} className="size-full grayscale sepia" />
                )}
              </motion.div>
            </div>
          )
        })}
      </div>
      </div>

      <Reveal className="relative mx-auto mt-20 max-w-2xl text-center sm:mt-28">
        <p className="mb-4 text-[11px] tracking-[0.32em] text-accent uppercase">Class of {config.classYear}</p>
        <h2 className="font-serif text-5xl leading-[1] font-light tracking-tight text-balance italic sm:text-7xl">{config.closing.title}</h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-pretty text-ink-soft sm:text-lg">{config.closing.message}</p>
        <button
          type="button"
          onClick={() => {
            setRun((r) => r + 1)
            ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
          className="mt-10 text-sm text-muted underline underline-offset-4 transition hover:text-ink"
        >
          Watch us grow up again
        </button>
      </Reveal>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.5 }}
        className="mt-32 text-center text-xs text-muted"
      >
        <p className="font-serif text-2xl text-ink italic">’{String(config.classYear).slice(-2)}</p>
        <p className="mt-2">
          {config.schoolName} · made with love, for us
        </p>
      </motion.footer>
    </section>
  )
}
