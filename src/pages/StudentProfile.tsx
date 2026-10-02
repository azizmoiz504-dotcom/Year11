import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, CapIcon, CloseIcon, PinIcon } from '../components/Icons'
import { Polaroid } from '../components/Polaroid'
import { ReelPlayer } from '../components/ReelPlayer'
import { SmartImage } from '../components/SmartImage'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { students } from '../lib/students'
import type { Student } from '../types'

const ease = [0.22, 1, 0.36, 1] as const

export function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const index = students.findIndex((s) => s.id === id)
  const student = students[index]
  const [direction, setDirection] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<Element | null>(document.activeElement)
  useLockBodyScroll()

  const close = useCallback(() => {
    if ((location.state as { modal?: boolean } | null)?.modal) navigate(-1)
    else navigate('/', { replace: true })
  }, [location.state, navigate])

  const go = useCallback(
    (delta: number) => {
      if (students.length < 2 || index < 0) return
      const next = students[(index + delta + students.length) % students.length]!
      setDirection(delta)
      navigate(`/student/${next.id}`, { replace: true, state: location.state })
    },
    [index, navigate, location.state],
  )

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true })
    const el = opener.current
    return () => {
      if (el instanceof HTMLElement) el.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    document.title = student ? `${student.name} · Class Yearbook` : 'Yearbook'
  }, [student])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, go])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2
    if (swipe < -90) go(1)
    else if (swipe > 90) go(-1)
  }

  const prev = index >= 0 ? students[(index - 1 + students.length) % students.length] : undefined
  const next = index >= 0 ? students[(index + 1) % students.length] : undefined

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={student ? `${student.name}'s yearbook page` : 'Student not found'}
      className="fixed inset-0 z-40 bg-paper"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease }}
    >
      <div ref={scroller} className="h-full overflow-x-hidden overflow-y-auto overscroll-contain">
        {/* top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/80 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:px-6">
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            className="flex h-14 items-center gap-2 pr-3 text-sm text-ink-soft hover:text-ink"
          >
            <CloseIcon /> <span>Back to the class</span>
          </button>
          {index >= 0 && (
            <span className="text-xs text-muted tabular-nums">
              {index + 1} / {students.length}
            </span>
          )}
        </div>

        {!student ? (
          <div className="px-6 py-32 text-center">
            <p className="font-serif text-3xl italic">We couldn't find that page.</p>
            <Link to="/" className="mt-6 inline-block text-accent underline underline-offset-4">
              Back to the class
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.article
              key={student.id}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 60 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -60 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease }}
              drag={students.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              dragDirectionLock
              onDragEnd={onDragEnd}
              className="mx-auto max-w-5xl px-5 pt-8 pb-40 sm:px-8 sm:pt-14"
            >
              <ProfileBody student={student} />
            </motion.article>
          </AnimatePresence>
        )}
      </div>

      {/* prev / next */}
      {student && prev && next && students.length > 1 && (
        <nav
          aria-label="Other classmates"
          className="pointer-events-none fixed inset-x-0 bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+4rem))] z-30 flex justify-between px-3 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:px-5"
        >
          <NavButton onClick={() => go(-1)} label={`Previous: ${prev.name}`} name={prev.name}>
            <ArrowLeft />
          </NavButton>
          <NavButton onClick={() => go(1)} label={`Next: ${next.name}`} name={next.name} right>
            <ArrowRight />
          </NavButton>
        </nav>
      )}
    </motion.div>
  )
}

function NavButton({ onClick, label, name, right, children }: { onClick: () => void; label: string; name: string; right?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-paper/85 p-2.5 text-ink shadow-lg backdrop-blur-xl transition hover:bg-ink hover:text-paper ${right ? 'flex-row-reverse' : ''}`}
    >
      {children}
      <span className="hidden max-w-0 overflow-hidden text-sm whitespace-nowrap transition-all duration-500 group-hover:max-w-40 lg:inline">{name}</span>
    </button>
  )
}

function ProfileBody({ student: s }: { student: Student }) {
  const firstName = s.name.split(' ')[0]
  return (
    <>
      {/* then & now */}
      <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:gap-12">
        <motion.figure
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease }}
          className="relative w-full max-w-md sm:w-3/5 sm:max-w-none"
        >
          <SmartImage
            src={s.currentPhoto}
            alt={`${s.name} now`}
            fallbackName={s.name}
            eager
            className="aspect-[4/5] w-full rounded-[3px] shadow-[0_30px_60px_-30px_rgb(40_25_10/0.7)]"
          />
          <figcaption className="mt-3 text-[11px] tracking-[0.3em] text-muted uppercase">now</figcaption>
        </motion.figure>

        {s.babyPhoto && (
          <motion.div
            initial={{ opacity: 0, rotate: 0, y: 30 }}
            animate={{ opacity: 1, rotate: 4, y: 0 }}
            transition={{ duration: 1.2, delay: 0.25, ease }}
            className="-mt-24 w-1/2 max-w-[14rem] self-end sm:mt-0 sm:mb-16 sm:w-2/5 sm:max-w-[18rem] sm:self-auto"
          >
            <Polaroid caption="then">
              <SmartImage src={s.babyPhoto} alt={`${s.name} as a child`} fallbackName={s.name} eager className="aspect-square w-full" />
            </Polaroid>
          </motion.div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease }} className="mt-12">
        <h1 className="font-serif text-5xl leading-[0.95] font-light tracking-tight text-balance sm:text-7xl">{s.name}</h1>
        {s.nickname && <p className="mt-2 font-serif text-xl text-muted italic">“{s.nickname}”</p>}

        {(s.university || s.major || s.city) && (
          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
            {(s.university || s.major) && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Studying</dt>
                <CapIcon width={18} height={18} className="text-accent" />
                <dd>{[s.major, s.university].filter(Boolean).join(' · ')}</dd>
              </div>
            )}
            {s.city && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">City</dt>
                <PinIcon width={18} height={18} className="text-accent" />
                <dd>{s.city}</dd>
              </div>
            )}
          </dl>
        )}
      </motion.div>

      {s.quote && (
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.5 }}
          className="relative my-16 border-y border-line py-12 sm:my-24 sm:py-16"
        >
          <span aria-hidden="true" className="absolute -top-8 left-0 font-serif text-[7rem] leading-none text-accent/30 sm:-top-10 sm:text-[9rem]">
            “
          </span>
          <p className="font-serif text-3xl leading-[1.2] font-light italic text-balance sm:text-5xl">{s.quote}</p>
        </motion.blockquote>
      )}

      {(s.reel || s.tenYearsGoal) && (
        <section aria-labelledby="ten-years" className="my-16 grid items-center gap-10 sm:my-24 sm:grid-cols-[minmax(0,20rem)_1fr] sm:gap-16">
          {s.reel && (
            <ReelPlayer
              src={s.reel}
              poster={s.currentPhoto}
              label={`${s.name}'s reel: in 10 years`}
              className="mx-auto w-full max-w-[18rem] rounded-2xl shadow-[0_30px_60px_-25px_rgb(0_0_0/0.6)] sm:max-w-none"
            />
          )}
          <div className={s.reel ? '' : 'sm:col-span-2'}>
            <h2 id="ten-years" className="text-[11px] tracking-[0.32em] text-accent uppercase">
              In 10 years…
            </h2>
            {s.tenYearsGoal ? (
              <p className="mt-4 font-serif text-2xl leading-snug text-pretty sm:text-3xl">{s.tenYearsGoal}</p>
            ) : (
              <p className="mt-4 font-serif text-2xl text-muted italic">{firstName} is keeping it a surprise.</p>
            )}
            {s.reel && <p className="mt-4 text-sm text-muted">Tap the video to play. The music pauses while {firstName} talks.</p>}
          </div>
        </section>
      )}

      {s.funFacts && s.funFacts.length > 0 && (
        <section aria-labelledby="facts" className="my-16">
          <h2 id="facts" className="mb-6 text-[11px] tracking-[0.32em] text-accent uppercase">
            Things you should know
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {s.funFacts.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08, ease }}
                className="rounded-2xl border border-line bg-paper-2/60 px-5 py-4 text-[15px] text-ink-soft"
              >
                {f}
              </motion.li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
