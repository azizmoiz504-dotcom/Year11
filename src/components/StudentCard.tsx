import { useState } from 'react'
import { Link } from 'react-router'
import { useData } from '../context/DataContext'
import { useCanHover } from '../hooks/useCanHover'
import { useImageOk } from '../hooks/useImageOk'
import { thumbUrl } from '../lib/backend'
import type { Student } from '../types'
import { SmartImage } from './SmartImage'

/**
 * One senior, laid out like a printed yearbook page: portrait, name, quote.
 * Tapping opens their page. On computers, hovering the photo swaps to their childhood photo.
 */
export function StudentCard({ student: s }: { student: Student }) {
  const canHover = useCanHover()
  const { live } = useData()
  // With the database we know straight away whether there's a childhood photo. Without it,
  // photos are found by file name, so check the file exists (only needed on hover devices).
  const babyFileOk = useImageOk(!live && canHover ? s.babyPhoto : undefined)
  const hasBaby = canHover && (live ? Boolean(s.babyPhoto) : babyFileOk)
  // Only fetch the childhood photo once someone actually hovers, so the grid loads fast.
  const [wantBaby, setWantBaby] = useState(false)

  return (
    <li className="list-none text-center">
      <Link
        to={`/student/${s.id}`}
        state={{ modal: true }}
        className="group block"
        aria-label={`Open ${s.name}'s page`}
        onPointerEnter={() => hasBaby && setWantBaby(true)}
        onFocus={() => hasBaby && setWantBaby(true)}
      >
        <div className="relative overflow-hidden bg-line shadow-[0_12px_30px_-18px_rgb(29_42_68/0.6)]">
          <SmartImage
            src={thumbUrl(s.photo)}
            fallbackSrc={s.photo}
            alt={`${s.name} now`}
            fallbackName={s.name}
            width={480}
            height={600}
            className="aspect-[4/5] w-full"
          />
          {hasBaby && (
            <>
              {/* Opacity lives on a wrapper: SmartImage manages its own fade-in opacity. */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                {wantBaby && <SmartImage src={thumbUrl(s.babyPhoto)} fallbackSrc={s.babyPhoto} alt={`${s.name} as a kid`} fallbackName={s.name} className="size-full" />}
              </div>
              <span className="absolute top-2 left-2 rounded-full bg-navy/70 px-2 py-0.5 text-[10px] font-medium tracking-[0.18em] text-white uppercase">
                <span className="group-hover:hidden">Now</span>
                <span className="hidden group-hover:inline">Then</span>
              </span>
            </>
          )}
        </div>
        <h3 className="mt-2.5 truncate text-[13px] leading-tight font-semibold whitespace-nowrap sm:text-sm xl:text-[12.5px]" title={s.name}>
          {s.name}
        </h3>
        {s.quote && (
          <p className="mx-auto mt-1.5 line-clamp-2 max-w-[18rem] font-serif text-[15px] leading-snug italic" title={s.quote}>
            “{s.quote}”
          </p>
        )}
        {s.university && <p className="mt-1.5 text-[11px] leading-snug text-accent">{s.university}</p>}
      </Link>
    </li>
  )
}
