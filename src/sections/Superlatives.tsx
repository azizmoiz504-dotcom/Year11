import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { SectionHeading } from '../components/Reveal'
import { SmartImage } from '../components/SmartImage'
import { students } from '../lib/students'

const ease = [0.22, 1, 0.36, 1] as const

/** Pulls every "Most likely to…" line out of the fun facts and gives it a card. */
export function Superlatives() {
  const items = students.flatMap((s) =>
    (s.funFacts ?? [])
      .filter((f) => /^most likely to\b/i.test(f))
      .slice(0, 1)
      .map((f) => ({ student: s, text: f.replace(/^most likely to\s*/i, '') })),
  )
  if (items.length === 0) return null

  return (
    <section id="superlatives" className="scroll-mt-16 px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow="The official verdicts" title="Most likely to…" />
      <ul className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ student: s, text }, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease }}
          >
            <Link
              to={`/student/${s.id}`}
              state={{ modal: true }}
              className="group flex h-full flex-col justify-between gap-8 rounded-3xl border border-line p-6 transition-colors duration-500 hover:bg-ink hover:text-paper sm:p-7"
            >
              <p className="font-serif text-2xl leading-snug font-light text-balance sm:text-[1.7rem]">
                <span className="text-muted italic transition-colors group-hover:text-paper/60">…</span>
                {text}
              </p>
              <span className="flex items-center gap-3">
                <SmartImage src={s.currentPhoto} alt="" fallbackName={s.name} className="size-10 rounded-full text-xs" />
                <span className="text-sm">{s.name}</span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
