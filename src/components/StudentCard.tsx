import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router'
import { useCanHover } from '../hooks/useMediaQuery'
import type { Student } from '../types'
import { FlipIcon } from './Icons'
import { SmartImage } from './SmartImage'

/**
 * Shows the current photo; hover (desktop) or tap (touch) crossfades to the baby photo.
 * On touch screens the photo toggles then/now and the name below opens the profile.
 */
export function StudentCard({ student, index }: { student: Student; index: number }) {
  const canHover = useCanHover()
  const [flipped, setFlipped] = useState(false)
  const hasBaby = Boolean(student.babyPhoto)
  const to = `/student/${student.id}`

  const photo = (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-paper-2 shadow-[0_18px_40px_-24px_rgb(40_25_10/0.6)]">
      <SmartImage
        src={student.currentPhoto}
        alt={`${student.name} now`}
        fallbackName={student.name}
        className="absolute inset-0 size-full transition-transform duration-[1.2s] ease-film group-hover:scale-[1.03]"
      />
      {hasBaby && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-film ${
            flipped ? 'opacity-100' : 'opacity-0'
          } ${canHover ? 'group-hover:opacity-100 group-focus-visible:opacity-100' : ''}`}
        >
          <SmartImage
            src={student.babyPhoto}
            alt={`${student.name} as a child`}
            fallbackName={student.name}
            className="size-full sepia-[0.25]"
          />
        </div>
      )}
      {hasBaby && (
        <span className="absolute top-2 left-2 rounded-full bg-black/35 px-2 py-0.5 text-[10px] tracking-[0.2em] text-white uppercase backdrop-blur-sm">
          <span className={`transition-opacity ${flipped ? 'hidden' : canHover ? 'group-hover:hidden' : ''}`}>now</span>
          <span className={`${flipped ? 'inline' : 'hidden'} ${canHover ? 'group-hover:inline' : ''}`}>then</span>
        </span>
      )}
      {hasBaby && !canHover && (
        <span className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm" aria-hidden="true">
          <FlipIcon width={14} height={14} />
        </span>
      )}
    </div>
  )

  const caption = (
    <div className="mt-3 px-0.5">
      <h3 className="font-serif text-lg leading-tight sm:text-xl">{student.name}</h3>
      <p className="mt-0.5 truncate text-[12px] text-muted sm:text-[13px]">{student.university ?? 'Taking the scenic route'}</p>
    </div>
  )

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: '0px 0px -5% 0px' }}
      transition={{ duration: 0.9, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="list-none"
    >
      {canHover ? (
        <Link to={to} state={{ modal: true }} className="group block" aria-label={`Open ${student.name}'s page`}>
          {photo}
          {caption}
        </Link>
      ) : (
        <>
          <button
            type="button"
            onClick={() => hasBaby && setFlipped((f) => !f)}
            aria-pressed={hasBaby ? flipped : undefined}
            aria-label={hasBaby ? `Show ${student.name} ${flipped ? 'now' : 'as a child'}` : `${student.name}`}
            className="group block w-full text-left"
          >
            {photo}
          </button>
          <Link to={to} state={{ modal: true }} className="block">
            {caption}
          </Link>
        </>
      )}
    </motion.li>
  )
}
