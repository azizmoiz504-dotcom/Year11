import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { PlayIcon } from '../components/Icons'
import { SectionHeading } from '../components/Reveal'
import { SmartImage } from '../components/SmartImage'
import { studentsWithReels } from '../lib/students'

const ease = [0.22, 1, 0.36, 1] as const

export function ReelsTeaser() {
  if (studentsWithReels.length === 0) return null

  return (
    <section id="reels" className="scroll-mt-16 overflow-hidden py-24 sm:py-32">
      <div className="px-4 sm:px-6">
        <SectionHeading eyebrow="In 10 years I want to be…" title="Messages to our future selves">
          One reel each. Watch them one by one, like you used to scroll at 2am.
        </SectionHeading>
      </div>

      <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 sm:justify-center sm:px-6">
        {studentsWithReels.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.07, ease }}
            className="w-40 shrink-0 snap-center sm:w-44"
          >
            <Link
              to={`/reels#${s.id}`}
              className="group relative block aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)]"
              aria-label={`Watch ${s.name}'s reel`}
            >
              <SmartImage
                src={s.currentPhoto}
                alt=""
                fallbackName={s.name}
                className="absolute inset-0 size-full opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md">
                <PlayIcon width={14} height={14} />
              </span>
              <span className="absolute inset-x-3 bottom-3 text-left text-white">
                <span className="block font-serif text-lg leading-tight">{s.name}</span>
                {s.tenYearsGoal && <span className="mt-1 line-clamp-2 block text-[11px] leading-snug text-white/75">{s.tenYearsGoal}</span>}
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        <Link
          to="/reels"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm tracking-wide text-paper transition hover:opacity-90"
        >
          <PlayIcon width={14} height={14} /> Open the reels wall
        </Link>
      </div>
    </section>
  )
}
