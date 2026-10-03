import { useEffect, useId, useRef, useState } from 'react'
import { useMusic } from '../context/MusicContext'
import { asset } from '../lib/asset'
import { MuteIcon, PlayIcon, VolumeIcon } from './Icons'

/** Tap to play/pause, with a mute button. The song pauses while the video plays with sound. */
export function VideoPlayer({
  src,
  poster,
  label,
  className = '',
  buttonClassName = 'bg-coral',
}: {
  src: string
  poster?: string
  label: string
  className?: string
  buttonClassName?: string
}) {
  const video = useRef<HTMLVideoElement>(null)
  const key = useId()
  const { hold, release } = useMusic()
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (playing && !muted) hold(key)
    else release(key)
  }, [playing, muted, hold, release, key])
  useEffect(() => () => release(key), [release, key])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) v.play().catch(() => setPlaying(false))
    else v.pause()
  }

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-white/60">This video couldn't load.</div>
      ) : (
        <video
          ref={video}
          src={asset(src)}
          poster={asset(poster)}
          playsInline
          preload="none"
          muted={muted}
          aria-label={label}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <button type="button" onClick={toggle} aria-label={playing ? `Pause ${label}` : `Play ${label}`} className="absolute inset-0 z-10" />
      {!playing && !failed && (
        <span className={`pointer-events-none absolute top-1/2 left-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-lg ${buttonClassName}`}>
          <PlayIcon width={24} height={24} />
        </span>
      )}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute video' : 'Mute video'}
        aria-pressed={muted}
        className="absolute top-3 right-3 z-20 grid size-9 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
      >
        {muted ? <MuteIcon width={18} height={18} /> : <VolumeIcon width={18} height={18} />}
      </button>
    </div>
  )
}
