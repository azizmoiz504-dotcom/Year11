import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { gallery, type GalleryPhoto } from '../lib/gallery'
import { ArrowLeft, ArrowRight, CloseIcon } from './Icons'

/** Masonry wall of the year's photos. Tap one to open it full screen. */
export function Gallery() {
  const [open, setOpen] = useState<number | null>(null)
  if (gallery.length === 0) return null

  return (
    <section id="gallery" className="mx-auto max-w-7xl scroll-mt-14 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-[11px] font-medium tracking-[0.35em] text-coral uppercase">Camera roll</p>
          <h2 className="font-serif text-5xl leading-none font-light sm:text-6xl">Gallery</h2>
          <p className="mt-3 text-[15px] text-muted">The year, in photos.</p>
        </div>
        <p className="text-sm text-muted tabular-nums">{gallery.length} photos</p>
      </div>

      <ul className="columns-2 gap-2 sm:columns-3 sm:gap-3 lg:columns-4">
        {gallery.map((p, i) => (
          <li key={p.src + i} className="mb-2 break-inside-avoid sm:mb-3">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={p.caption ? `Open photo: ${p.caption}` : `Open photo ${i + 1}`}
              className="group relative block w-full overflow-hidden rounded-lg bg-line"
            >
              <img src={p.src} alt={p.caption ?? ''} loading="lazy" decoding="async" className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]" />
              {p.caption && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pt-8 pb-2.5 text-left text-[13px] text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  {p.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>{open !== null && <Lightbox photos={gallery} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  )
}

function Lightbox({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: GalleryPhoto[]
  index: number
  onChange: (i: number) => void
  onClose: () => void
}) {
  const [dir, setDir] = useState(0)
  const closeBtn = useRef<HTMLButtonElement>(null)
  useLockBodyScroll()
  const p = photos[index]!

  const go = useCallback(
    (d: number) => {
      setDir(d)
      onChange((index + d + photos.length) % photos.length)
    },
    [index, onChange, photos.length],
  )

  useEffect(() => {
    const prev = document.activeElement
    closeBtn.current?.focus()
    return () => (prev instanceof HTMLElement ? prev.focus({ preventScroll: true }) : undefined)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2
    if (swipe < -70) go(1)
    else if (swipe > 70) go(-1)
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[60] flex flex-col bg-black/95 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <span className="text-sm text-white/60 tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full hover:bg-white/10">
          <CloseIcon />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 sm:px-16" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.img
            key={p.src}
            src={p.src}
            alt={p.caption ?? ''}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 60 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -60 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            drag={photos.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            draggable={false}
            className="max-h-full max-w-full rounded-md object-contain select-none"
          />
        </AnimatePresence>
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 hidden size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid">
              <ArrowLeft />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 hidden size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid">
              <ArrowRight />
            </button>
          </>
        )}
      </div>

      <p className="min-h-14 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-[15px] text-white/85">{p.caption}</p>
    </motion.div>
  )
}
