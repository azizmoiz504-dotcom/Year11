import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { useMusic } from '../context/MusicContext'
import { MuteIcon, PauseIcon, PlayIcon, VolumeIcon } from './Icons'

function Equalizer({ active }: { active: boolean }) {
  return (
    <span aria-hidden="true" className={`flex h-4 items-end gap-[3px] ${active ? '' : 'eq-paused'}`}>
      {[0.9, 0.55, 1.15, 0.7].map((d, i) => (
        <span
          key={i}
          className="eq-bar block h-full w-[3px] rounded-full bg-accent"
          style={{ animationDuration: `${d}s`, animationDelay: `${i * -0.21}s` }}
        />
      ))}
    </span>
  )
}

/** Small floating player pinned bottom-right. Collapsed pill on phones; tap the title to expand. */
export function MusicPlayer() {
  const { playing, wantsPlay, volume, muted, unavailable, toggle, setVolume, toggleMute } = useMusic()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const held = wantsPlay && !playing && !unavailable
  const status = unavailable ? 'Add song.mp3 to play music' : held ? 'Paused while a reel plays' : config.song.artist

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 sm:right-5 sm:bottom-5"
      role="region"
      aria-label="Music player"
    >
      <div className="flex items-center gap-2 rounded-full border border-line bg-paper/85 p-1.5 pr-3 shadow-[0_10px_40px_-12px_rgb(0_0_0/0.35)] backdrop-blur-xl">
        <button
          type="button"
          onClick={toggle}
          disabled={unavailable}
          aria-label={wantsPlay ? 'Pause music' : 'Play music'}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-paper transition hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          {wantsPlay ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="music-volume"
          className="flex min-w-0 items-center gap-2.5 text-left"
        >
          <Equalizer active={playing && !muted} />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="max-w-[7.5rem] truncate font-serif text-[13px] italic sm:max-w-[10rem]">{config.song.title}</span>
            <span className="max-w-[7.5rem] truncate text-[10px] tracking-wide text-muted sm:max-w-[10rem]">{status}</span>
          </span>
        </button>

        <div className="hidden items-center gap-1.5 pl-1 sm:flex">
          <VolumeControls volume={volume} muted={muted} setVolume={setVolume} toggleMute={toggleMute} />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="music-volume"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 bottom-full mb-2 flex items-center gap-2 rounded-2xl border border-line bg-paper/90 px-3 py-2.5 shadow-lg backdrop-blur-xl sm:hidden"
          >
            <VolumeControls volume={volume} muted={muted} setVolume={setVolume} toggleMute={toggleMute} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function VolumeControls({
  volume,
  muted,
  setVolume,
  toggleMute,
}: {
  volume: number
  muted: boolean
  setVolume: (v: number) => void
  toggleMute: () => void
}) {
  const shown = muted ? 0 : volume
  return (
    <>
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute music' : 'Mute music'}
        className="grid size-7 place-items-center rounded-full text-ink-soft hover:bg-line"
      >
        {muted || volume === 0 ? <MuteIcon width={16} height={16} /> : <VolumeIcon width={16} height={16} />}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={shown}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Music volume"
        className="volume w-24 cursor-pointer"
        style={{ ['--val' as string]: `${shown * 100}%` }}
      />
    </>
  )
}
