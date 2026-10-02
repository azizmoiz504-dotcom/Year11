import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { CloseIcon } from '../components/Icons'
import { ReelPlayer, type ReelHandle } from '../components/ReelPlayer'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { studentsWithReels } from '../lib/students'

/** TikTok-style vertical feed: one reel per screen, snap scrolling, the visible one plays. */
export function ReelsFeed() {
  const navigate = useNavigate()
  const location = useLocation()
  const scroller = useRef<HTMLDivElement>(null)
  const players = useRef<(ReelHandle | null)[]>([])
  const [active, setActive] = useState(-1)
  const [muted, setMuted] = useState(false)
  useLockBodyScroll()

  const close = useCallback(() => {
    if (location.key !== 'default') navigate(-1)
    else navigate('/', { replace: true })
  }, [location.key, navigate])

  // Jump to the reel named in the URL hash (from the teaser row).
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    const el = id ? document.getElementById(`reel-${id}`) : null
    el?.scrollIntoView({ behavior: 'instant' as ScrollBehavior })
    // Only when the feed first opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index))
        }
      },
      { root, threshold: 0.6 },
    )
    root.querySelectorAll('[data-index]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    players.current.forEach((p, i) => (i === active ? p?.play() : p?.pause()))
  }, [active])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      const root = scroller.current
      if (!root) return
      if (e.key === 'ArrowDown' || e.key === 'j') root.scrollBy({ top: root.clientHeight, behavior: 'smooth' })
      if (e.key === 'ArrowUp' || e.key === 'k') root.scrollBy({ top: -root.clientHeight, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Reels wall"
      className="fixed inset-0 z-40 bg-[#0b0908] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        type="button"
        onClick={close}
        autoFocus
        aria-label="Close reels"
        className="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 z-50 grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur-md transition hover:bg-black/60"
      >
        <CloseIcon />
      </button>
      <p className="pointer-events-none fixed top-[max(1.6rem,calc(env(safe-area-inset-top)+0.6rem))] left-1/2 z-50 -translate-x-1/2 text-[11px] tracking-[0.3em] text-white/70 uppercase">
        In 10 years
      </p>

      <div ref={scroller} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain">
        {studentsWithReels.length === 0 && <p className="grid h-full place-items-center font-serif text-2xl italic text-white/60">No reels yet.</p>}
        {studentsWithReels.map((s, i) => (
          <section
            key={s.id}
            id={`reel-${s.id}`}
            data-index={i}
            aria-label={`${s.name}, ${i + 1} of ${studentsWithReels.length}`}
            className="flex h-[100svh] snap-start snap-always items-center justify-center sm:py-6"
          >
            <ReelPlayer
              ref={(h) => {
                players.current[i] = h
              }}
              src={s.reel!}
              poster={s.currentPhoto}
              label={`${s.name}'s reel`}
              loop
              muted={muted}
              onMutedChange={setMuted}
              className="h-full max-w-full sm:rounded-2xl"
            >
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pt-24 pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+5rem))] sm:pb-8">
                <Link
                  to={`/student/${s.id}`}
                  state={{ modal: true }}
                  className="pointer-events-auto font-serif text-2xl leading-tight underline-offset-4 hover:underline"
                >
                  {s.name}
                </Link>
                {s.university && <p className="mt-0.5 text-xs text-white/65">{s.university}</p>}
                {s.tenYearsGoal && <p className="mt-3 max-w-sm font-serif text-lg leading-snug text-white/95 italic">“{s.tenYearsGoal}”</p>}
              </div>
            </ReelPlayer>
          </section>
        ))}
      </div>

      {studentsWithReels.length > 1 && (
        <div aria-hidden="true" className="pointer-events-none fixed top-1/2 right-2 z-50 flex -translate-y-1/2 flex-col gap-1.5 sm:right-5">
          {studentsWithReels.map((s, i) => (
            <span key={s.id} className={`block w-1 rounded-full transition-all duration-500 ${i === active ? 'h-6 bg-white' : 'h-1.5 bg-white/35'}`} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
