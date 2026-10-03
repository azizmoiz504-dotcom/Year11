import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, CloseIcon } from '../components/Icons'
import { SmartImage } from '../components/SmartImage'
import { config } from '../config'
import { useImageOk } from '../hooks/useImageOk'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useData } from '../context/DataContext'
import { backendEnabled } from '../lib/backend'
import { StudentForm } from '../components/StudentForm'

const ease = [0.22, 1, 0.36, 1] as const

/** A student's page, shown over the grid. Arrow keys or swiping move between classmates. */
export function StudentProfile() {
  const { id } = useParams()
  const { students, loading } = useData()
  const [editing, setEditing] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const index = students.findIndex((s) => s.id === id)
  const s = students[index]
  const hasBaby = useImageOk(s?.babyPhoto)
  const [direction, setDirection] = useState(0)
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
    document.title = s ? `${s.name} · Class of ${config.classYear}` : `Class of ${config.classYear}`
  }, [s])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing) return
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, go, editing])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2
    if (swipe < -80) go(1)
    else if (swipe > 80) go(-1)
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={s ? s.name : 'Not found'}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.35, ease }}
        className="relative flex h-[100svh] w-full flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[90svh] sm:max-w-4xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-5 sm:pt-4">
          <span className="text-sm text-muted tabular-nums">{index >= 0 && `${index + 1} / ${students.length}`}</span>
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full transition hover:bg-line"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!s ? (
            <p className="px-6 py-24 text-center text-muted">{loading ? 'Loading…' : "We couldn't find that person."}</p>
          ) : (
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.article
                key={s.id}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d * -40 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease }}
                drag={students.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                dragDirectionLock
                onDragEnd={onDragEnd}
                className="grid gap-6 px-4 pb-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:items-center sm:gap-10 sm:px-8 sm:pb-8"
              >
                <div className="relative">
                  <SmartImage
                    src={s.photo}
                    alt={`${s.name} now`}
                    fallbackName={s.name}
                    eager
                    draggable={false}
                    className="aspect-[4/5] w-full rounded-2xl"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-navy/70 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-white uppercase">
                    Now
                  </span>
                  {hasBaby && (
                    <figure className="polaroid absolute -right-1 -bottom-5 w-[42%] rotate-[5deg] sm:-right-6">
                      <SmartImage src={s.babyPhoto} alt={`${s.name} as a kid`} fallbackName={s.name} eager draggable={false} className="aspect-square w-full" />
                      <figcaption className="absolute inset-x-0 bottom-1 text-center font-serif text-sm text-navy italic">then</figcaption>
                    </figure>
                  )}
                </div>
                <div className="min-w-0 pb-4">
                  <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{s.name}</h1>
                  {s.university && <p className="mt-1.5 text-base text-accent">{s.university}</p>}
                  {s.quote && (
                    <blockquote className="mt-8 border-t border-line pt-8 font-serif text-3xl leading-[1.15] text-balance italic sm:text-[2.6rem]">
                      “{s.quote}”
                    </blockquote>
                  )}
                  {backendEnabled && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="mt-8 rounded-full border border-line px-4 py-2 text-sm transition-colors hover:bg-line"
                    >
                      {s.photo ? 'This is me · edit my card' : 'This is me · add my photo & quote'}
                    </button>
                  )}
                </div>
              </motion.article>
            </AnimatePresence>
          )}
        </div>

        {s && students.length > 1 && (
          <nav
            aria-label="Other classmates"
            className="flex items-center justify-between gap-3 border-t border-line px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5"
          >
            <button type="button" onClick={() => go(-1)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition hover:bg-line">
              <ArrowLeft width={18} height={18} /> Previous
            </button>
            <button type="button" onClick={() => go(1)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition hover:bg-line">
              Next <ArrowRight width={18} height={18} />
            </button>
          </nav>
        )}
      </motion.div>
      <AnimatePresence>
        {editing && s && <StudentForm key="edit" student={s} onClose={() => setEditing(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
