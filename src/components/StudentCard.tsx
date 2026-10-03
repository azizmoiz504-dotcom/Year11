import { motion } from 'framer-motion'
import { Link } from 'react-router'
import type { Student } from '../types'
import { SmartImage } from './SmartImage'

export function StudentCard({ student: s }: { student: Student }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="list-none"
    >
      <Link to={`/student/${s.id}`} state={{ modal: true }} className="group block">
        <div className="overflow-hidden rounded-2xl">
          <SmartImage
            src={s.photo}
            alt={s.name}
            fallbackName={s.name}
            className="aspect-[4/5] w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-3 px-0.5">
          <h2 className="text-[15px] leading-tight font-medium sm:text-base">{s.name}</h2>
          {s.university && <p className="mt-0.5 text-[13px] leading-snug text-muted">{s.university}</p>}
          {s.quote && <p className="mt-2 line-clamp-3 font-serif text-[17px] leading-snug italic sm:text-lg">“{s.quote}”</p>}
        </div>
      </Link>
    </motion.li>
  )
}
