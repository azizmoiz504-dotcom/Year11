import { AnimatePresence, motion } from 'framer-motion'
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type ReactNode } from 'react'
import { useMusic } from '../context/MusicContext'
import { MuteIcon, PauseIcon, PlayIcon, VolumeIcon } from './Icons'

export interface ReelHandle {
  play: () => void
  pause: () => void
}

interface Props {
  src: string
  poster?: string
  label: string
  loop?: boolean
  /** Controlled mute (the feed shares one mute state across reels). */
  muted?: boolean
  onMutedChange?: (m: boolean) => void
  className?: string
  children?: ReactNode
}

/**
 * Vertical 9:16 reel. Tap to play/pause, with a mute toggle. While a reel is playing
 * with sound, it holds the background music; the song resumes when the reel stops.
 */
export const ReelPlayer = forwardRef<ReelHandle, Props>(function ReelPlayer(
  { src, poster, label, loop = false, muted: mutedProp, onMutedChange, className = '', children },
  handle,
) {
  const video = useRef<HTMLVideoElement>(null)
  const key = useId()
  const { hold, release } = useMusic()
  const [playing, setPlaying] = useState(false)
  const [mutedLocal, setMutedLocal] = useState(false)
  const [failed, setFailed] = useState(false)
  const [flash, setFlash] = useState<'play' | 'pause' | null>(null)
  const muted = mutedProp ?? mutedLocal
  const setMuted = (m: boolean) => (onMutedChange ? onMutedChange(m) : setMutedLocal(m))

  const play = useCallback(() => {
    const v = video.current
    if (!v) return
    v.play().catch((err: DOMException) => {
      // Browsers may refuse sound without a fresh tap. Fall back to muted playback.
      if (err.name === 'NotAllowedError' && !v.muted) {
        v.muted = true
        onMutedChange ? onMutedChange(true) : setMutedLocal(true)
        v.play().catch(() => {})
      }
    })
  }, [onMutedChange])

  const pause = useCallback(() => video.current?.pause(), [])
  useImperativeHandle(handle, () => ({ play, pause }), [play, pause])

  useEffect(() => {
    if (video.current) video.current.muted = muted
  }, [muted])

  // Pause the song only while this reel is actually audible.
  useEffect(() => {
    if (playing && !muted) hold(key)
    else release(key)
  }, [playing, muted, hold, release, key])
  useEffect(() => () => release(key), [release, key])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      play()
      setFlash('play')
    } else {
      v.pause()
      setFlash('pause')
    }
  }

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 600)
    return () => clearTimeout(t)
  }, [flash])

  return (
    <div className={`relative aspect-[9/16] overflow-hidden bg-black ${className}`}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-white/60">This reel couldn't load.</div>
      ) : (
        <video
          ref={video}
          src={src}
          poster={poster}
          playsInline
          loop={loop}
          preload="none"
          aria-label={label}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {children}

      <AnimatePresence>
        {!playing && !failed && !flash && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="pointer-events-none absolute top-1/2 left-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md"
          >
            <PlayIcon width={26} height={26} />
          </motion.span>
        )}
        {flash && (
          <motion.span
            key={flash}
            initial={{ opacity: 0.9, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute top-1/2 left-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md"
          >
            {flash === 'play' ? <PlayIcon width={26} height={26} /> : <PauseIcon width={26} height={26} />}
          </motion.span>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setMuted(!muted)}
        aria-label={muted ? 'Unmute reel' : 'Mute reel'}
        aria-pressed={muted}
        className="absolute top-3 right-3 z-20 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
      >
        {muted ? <MuteIcon width={18} height={18} /> : <VolumeIcon width={18} height={18} />}
      </button>
    </div>
  )
})
