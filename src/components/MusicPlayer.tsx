import { useMusic } from '../context/MusicContext'
import { MuteIcon, NextIcon, PauseIcon, PlayIcon, VolumeIcon } from './Icons'

/** Small player pinned bottom-right. The song starts on the intro's Enter click. */
export function MusicPlayer() {
  const { playing, track, trackCount, next, wantsPlay, held, volume, muted, unavailable, toggle, setVolume, toggleMute } = useMusic()
  if (unavailable) return null
  const shown = muted ? 0 : volume

  return (
    <div
      role="region"
      aria-label="Music player"
      className="fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex items-center gap-2 rounded-full border border-line bg-surface/90 p-1.5 pr-3 sm:gap-2.5 sm:pr-4 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.3)] backdrop-blur-xl sm:right-5 sm:bottom-5"
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={wantsPlay ? 'Pause music' : 'Play music'}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-white transition active:scale-95"
      >
        {wantsPlay ? <PauseIcon width={15} height={15} /> : <PlayIcon width={15} height={15} />}
      </button>

      <span aria-hidden="true" className={`flex h-3.5 items-end gap-[2px] ${playing && !muted ? '' : 'eq-paused'}`}>
        {[0.9, 0.6, 1.1].map((d, i) => (
          <span key={i} className="eq-bar block h-full w-[2.5px] rounded-full bg-accent" style={{ animationDuration: `${d}s` }} />
        ))}
      </span>

      <span className="hidden min-w-0 flex-col leading-tight sm:flex">
        <span className="max-w-[8rem] truncate text-[13px] font-medium">{track.title}</span>
        <span className="max-w-[8rem] truncate text-[11px] text-muted">{held && wantsPlay ? 'Paused for the video' : track.artist}</span>
      </span>

      {trackCount > 1 && (
        <button type="button" onClick={next} aria-label="Next song" className="grid size-7 shrink-0 place-items-center rounded-full text-muted hover:text-ink">
          <NextIcon width={16} height={16} />
        </button>
      )}

      <span className="hidden items-center gap-1.5 pl-1 sm:flex">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute music' : 'Mute music'}
          className="grid size-7 place-items-center rounded-full text-muted hover:text-ink"
        >
          {muted || volume === 0 ? <MuteIcon width={16} height={16} /> : <VolumeIcon width={16} height={16} />}
        </button>
        <input
          id="music-volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={shown}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Music volume"
          className="volume w-20 cursor-pointer"
          style={{ ['--val' as string]: `${shown * 100}%` }}
        />
      </span>
    </div>
  )
}
