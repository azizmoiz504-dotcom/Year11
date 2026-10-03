import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { config } from '../config'
import { asset } from '../lib/asset'

/**
 * One <audio> element for the whole app, above the router, so the music never restarts.
 * Plays config.music.songs in order and loops back to the first.
 *  - `wantsPlay` is the visitor's choice (play/pause), remembered for the session.
 *  - holds are temporary pauses requested by the videos; the song resumes when the
 *    last hold is released, if the visitor still wants it.
 */
interface MusicState {
  playing: boolean
  track: { title: string; artist: string }
  trackCount: number
  next: () => void
  wantsPlay: boolean
  held: boolean
  volume: number
  muted: boolean
  unavailable: boolean
  /** Call from the Enter click so the browser allows sound. */
  start: () => void
  toggle: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  hold: (key: string) => void
  release: (key: string) => void
}

const MusicContext = createContext<MusicState | null>(null)
const STORAGE_KEY = 'yb-music'
const songs = config.music.enabled ? config.music.songs : []

interface Saved {
  paused?: boolean
  volume?: number
  muted?: boolean
}

function readSaved(): Saved {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function save(patch: Saved) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSaved(), ...patch }))
  } catch {
    /* private mode */
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const saved = useRef(readSaved()).current
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const holds = useRef(new Set<string>())
  const [playing, setPlaying] = useState(false)
  const [wantsPlay, setWantsPlay] = useState(!saved.paused)
  const [held, setHeld] = useState(false)
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  // Always start at the configured volume (full); changes only last until the page is closed.
  const [volume, setVolumeState] = useState(config.music.volume)
  const [muted, setMuted] = useState(false)
  const [unavailable, setUnavailable] = useState(songs.length === 0)
  const wantsRef = useRef(wantsPlay)
  wantsRef.current = wantsPlay
  const failed = useRef(new Set<number>())

  /** Switches to song `i` (wrapping around) and keeps playing if it was playing. */
  function goTo(i: number) {
    const a = audioRef.current
    if (!a || songs.length < 2) return
    const n = ((i % songs.length) + songs.length) % songs.length
    indexRef.current = n
    setIndex(n)
    a.src = asset(songs[n]!.src)
    if (wantsRef.current && holds.current.size === 0) a.play().catch(() => setPlaying(false))
  }

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio(asset(songs[0]!.src))
      a.loop = songs.length === 1
      a.volume = config.music.volume
      a.addEventListener('play', () => setPlaying(true))
      a.addEventListener('pause', () => setPlaying(false))
      a.addEventListener('ended', () => goTo(indexRef.current + 1))
      a.addEventListener('error', () => {
        // Skip a missing or broken file; give up only if every song fails.
        if (songs.length > 1 && !failed.current.has(indexRef.current)) {
          failed.current.add(indexRef.current)
          if (failed.current.size < songs.length) return goTo(indexRef.current + 1)
        }
        setUnavailable(true)
        setPlaying(false)
      })
      audioRef.current = a
    }
    return audioRef.current
  }, [saved])

  const tryPlay = useCallback(() => {
    if (songs.length === 0 || holds.current.size > 0) return
    getAudio()
      .play()
      .catch(() => setPlaying(false))
  }, [getAudio])

  const start = useCallback(() => {
    if (songs.length > 0 && wantsRef.current) tryPlay()
  }, [tryPlay])

  const toggle = useCallback(() => {
    const next = !wantsRef.current
    setWantsPlay(next)
    save({ paused: !next })
    if (next) {
      holds.current.clear()
      setHeld(false)
      tryPlay()
    } else getAudio().pause()
  }, [getAudio, tryPlay])

  const setVolume = useCallback(
    (v: number) => {
      const a = getAudio()
      a.volume = v
      a.muted = false
      setVolumeState(v)
      setMuted(false)
      save({ volume: v, muted: false })
    },
    [getAudio],
  )

  const toggleMute = useCallback(() => {
    const a = getAudio()
    a.muted = !a.muted
    setMuted(a.muted)
    save({ muted: a.muted })
  }, [getAudio])

  const hold = useCallback((key: string) => {
    holds.current.add(key)
    setHeld(true)
    audioRef.current?.pause()
  }, [])

  const release = useCallback(
    (key: string) => {
      if (!holds.current.delete(key) || holds.current.size > 0) return
      setHeld(false)
      if (wantsRef.current && audioRef.current) tryPlay()
    },
    [tryPlay],
  )

  useEffect(() => {
    if (!('mediaSession' in navigator) || !playing) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: songs[index]?.title ?? '',
      artist: songs[index]?.artist ?? '',
      album: `Class of ${config.classYear}`,
    })
  }, [playing, index])

  const next = useCallback(() => {
    getAudio()
    goTo(indexRef.current + 1)
    // goTo only reads refs, so it is safe to leave out of the dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAudio])

  useEffect(() => () => audioRef.current?.pause(), [])

  const value = useMemo(
    () => ({
      playing,
      track: { title: songs[index]?.title ?? '', artist: songs[index]?.artist ?? '' },
      trackCount: songs.length,
      next,
      wantsPlay,
      held,
      volume,
      muted,
      unavailable,
      start,
      toggle,
      setVolume,
      toggleMute,
      hold,
      release,
    }),
    [playing, index, next, wantsPlay, held, volume, muted, unavailable, start, toggle, setVolume, toggleMute, hold, release],
  )
  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>')
  return ctx
}
