import { useState } from 'react'
import { Link } from 'react-router'
import { useCanHover } from '../hooks/useCanHover'
import type { Student } from '../types'
import { FlipIcon } from './Icons'
import { SmartImage } from './SmartImage'

/**
 * One senior, laid out like a printed yearbook page: portrait, name, quote.
 * Hover (desktop) or tap the photo (phone) to swap to their childhood photo.
 */
export function StudentCard({ student: s }: { student: Student }) {
  const canHover = useCanHover()
  const [then, setThen] = useState(false)
  const to = `/student/${s.id}`
  const hoverFlip = canHover ? 'group-hover:opacity-100' : ''

  const photo = (
    <div className="relative overflow-hidden bg-line shadow-[0_12px_30px_-18px_rgb(29_42_68/0.6)]">
      <SmartImage src={s.photo} alt={`${s.name} now`} fallbackName={s.name} width={800} height={1000} className="aspect-[4/5] w-full" />
      {s.babyPhoto && (
        <>
          {/* Opacity lives on a wrapper: SmartImage manages its own fade-in opacity. */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${then ? 'opacity-100' : 'opacity-0'} ${hoverFlip}`}>
            <SmartImage src={s.babyPhoto} alt={`${s.name} as a kid`} fallbackName={s.name} className="size-full" />
          </div>
          <span className="absolute top-2 left-2 rounded-full bg-navy/70 px-2 py-0.5 text-[10px] font-medium tracking-[0.18em] text-white uppercase">
            <span className={then ? 'hidden' : canHover ? 'group-hover:hidden' : ''}>Now</span>
            <span className={then ? '' : canHover ? 'hidden group-hover:inline' : 'hidden'}>Then</span>
          </span>
          {!canHover && (
            <span aria-hidden="true" className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-full bg-navy/70 text-white">
              <FlipIcon width={14} height={14} />
            </span>
          )}
        </>
      )}
    </div>
  )

  const caption = (
    <>
      <h3 className="mt-3 text-[13px] leading-tight font-semibold tracking-[0.06em] uppercase sm:text-sm">{s.name}</h3>
      {s.university && <p className="mt-1 text-[12px] leading-snug text-accent">{s.university}</p>}
      {s.quote && <p className="mx-auto mt-2 max-w-[18rem] font-serif text-[16px] leading-snug italic">“{s.quote}”</p>}
    </>
  )

  return (
    <li className="list-none text-center">
      {canHover || !s.babyPhoto ? (
        <Link to={to} state={{ modal: true }} className="group block" aria-label={`Open ${s.name}'s page`}>
          {photo}
          {caption}
        </Link>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setThen((t) => !t)}
            aria-pressed={then}
            aria-label={`Show ${s.name} ${then ? 'now' : 'as a kid'}`}
            className="block w-full"
          >
            {photo}
          </button>
          <Link to={to} state={{ modal: true }} className="block">
            {caption}
          </Link>
        </>
      )}
    </li>
  )
}
