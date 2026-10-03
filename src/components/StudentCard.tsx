import { Link } from 'react-router'
import type { Student } from '../types'
import { SmartImage } from './SmartImage'

/** One senior, laid out like a printed yearbook page: portrait, name, quote. */
export function StudentCard({ student: s }: { student: Student }) {
  return (
    <li className="list-none">
      <Link to={`/student/${s.id}`} state={{ modal: true }} className="group block text-center">
        <div className="overflow-hidden bg-line shadow-[0_12px_30px_-18px_rgb(29_42_68/0.6)]">
          <SmartImage
            src={s.photo}
            alt={s.name}
            fallbackName={s.name}
            width={800}
            height={1000}
            className="aspect-[4/5] w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </div>
        <h3 className="mt-3 text-[13px] leading-tight font-semibold tracking-[0.06em] uppercase sm:text-sm">{s.name}</h3>
        {s.university && <p className="mt-1 text-[12px] leading-snug text-coral">{s.university}</p>}
        {s.quote && <p className="mx-auto mt-2 max-w-[18rem] font-serif text-[16px] leading-snug italic">“{s.quote}”</p>}
      </Link>
    </li>
  )
}
