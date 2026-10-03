import { motion } from 'framer-motion'
import { SectionHeading } from '../components/Reveal'
import { SmartImage } from '../components/SmartImage'
import { config } from '../config'
import { asset } from '../lib/asset'

const ease = [0.22, 1, 0.36, 1] as const

/** "Our years": a vertical thread of milestones from config.timeline. */
export function Timeline() {
  const items = config.timeline
  if (!items.length) return null

  return (
    <section id="years" className="scroll-mt-16 px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow={`${items[0]!.year} – ${items[items.length - 1]!.year}`} title="The years in between">
        Every chapter that got us here.
      </SectionHeading>

      <ol className="relative mx-auto max-w-3xl">
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-[4.25rem] w-px bg-line sm:left-1/2" />
        {items.map((t, i) => {
          const left = i % 2 === 0
          return (
            <motion.li
              key={t.year + t.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.9, ease }}
              className="relative grid grid-cols-[4.25rem_1fr] gap-x-6 pb-12 last:pb-0 sm:grid-cols-2 sm:gap-x-16"
            >
              <span
                aria-hidden="true"
                className="absolute top-3 left-[4.25rem] size-2.5 -translate-x-1/2 rounded-full bg-accent ring-4 ring-paper sm:left-1/2"
              />
              <p
                className={`font-serif text-2xl font-light tabular-nums text-accent sm:text-5xl ${
                  left ? 'sm:text-right' : 'sm:order-2'
                }`}
              >
                {t.year}
              </p>
              <div className={`min-w-0 ${left ? '' : 'sm:order-1 sm:text-right'}`}>
                <h3 className="font-serif text-2xl leading-tight">{t.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-pretty text-ink-soft">{t.text}</p>
                {t.photo && (
                  <SmartImage src={asset(t.photo)} alt={t.title} className="mt-4 aspect-[3/2] w-full max-w-xs rounded-[3px] sm:inline-block" />
                )}
              </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}
