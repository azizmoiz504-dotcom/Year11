import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { config } from '../config'

/**
 * One <audio> element for the whole app, owned by this provider. It lives above
 * the router, so navigating between pages never restarts the song.
 *
 * Two separate ideas of "playing":
 *  - `wantsPlay` is the visitor's choice (play/pause button). Remembered for the session.
 *  - holds are temporary pauses requested by reels. When the last hold is
 *    released, the song resumes only if the visitor still wants it.
 */
interface MusicState {
  playing: boolean
  wantsPlay: boolean
  volume: number
  muted: boolean
  unavailable: boolean
  started: boolean
  /** Call from a click handler (the Enter button) so the browser allows audio. */
  start: () => void
  toggle: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  hold: (key: string) => void
  release: (key: string) => void
}

const MusicContext = createContext<MusicState | null>(null)
const STORAGE_KEY = 'yb-music'

interface Saved {
  paused?: boolean
  volume?: number
  muted?: boolean
}

function readSaved(): Saved {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}') as Saved
  } catch {
    return {}
  }
}

function writeSaved(patch: Saved) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSaved(), ...patch }))
  } catch {
    /* private mode: nothing to remember */
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const saved = useRef(readSaved()).current
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const holds = useRef(new Set<string>())

  const [playing, setPlaying] = useState(false)
  const [wantsPlay, setWantsPlay] = useState(!saved.paused)
  const [volume, setVolumeState] = useState(saved.volume ?? config.song.volume)
  const [muted, setMuted] = useState(saved.muted ?? false)
  const [unavailable, setUnavailable] = useState(false)
  const [started, setStarted] = useState(false)

  const wantsPlayRef = useRef(wantsPlay)
  wantsPlayRef.current = wantsPlay

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio()
      a.src = config.song.src
      a.loop = true
      a.preload = 'auto'
      a.volume = volume
      a.muted = muted
      a.addEventListener('play', () => setPlaying(true))
      a.addEventListener('pause', () => setPlaying(false))
      a.addEventListener('error', () => {
        setUnavailable(true)
        setPlaying(false)
      })
      audioRef.current = a
    }
    return audioRef.current
  }, [])

  const tryPlay = useCallback(() => {
    if (holds.current.size > 0) return
    getAudio()
      .play()
      .catch(() => setPlaying(false))
  }, [getAudio])

  const start = useCallback(() => {
    setStarted(true)
    const a = getAudio()
    if (wantsPlayRef.current) tryPlay()
    else a.load()
  }, [getAudio, tryPlay])

  const toggle = useCallback(() => {
    const next = !wantsPlayRef.current
    setWantsPlay(next)
    writeSaved({ paused: !next })
    if (next) {
      // An explicit press wins over any reel that's holding the music.
      holds.current.clear()
      tryPlay()
    } else getAudio().pause()
  }, [getAudio, tryPlay])

  const setVolume = useCallback(
    (v: number) => {
      const a = getAudio()
      a.volume = v
      setVolumeState(v)
      if (v > 0 && a.muted) {
        a.muted = false
        setMuted(false)
      }
      writeSaved({ volume: v, muted: v > 0 ? false : undefined })
    },
    [getAudio],
  )

  const toggleMute = useCallback(() => {
    const a = getAudio()
    a.muted = !a.muted
    setMuted(a.muted)
    writeSaved({ muted: a.muted })
  }, [getAudio])

  const hold = useCallback(
    (key: string) => {
      holds.current.add(key)
      audioRef.current?.pause()
    },
    [],
  )

  const release = useCallback(
    (key: string) => {
      if (!holds.current.delete(key)) return
      if (holds.current.size === 0 && wantsPlayRef.current && audioRef.current) tryPlay()
    },
    [tryPlay],
  )

  // Lock screen / notification controls on phones.
  useEffect(() => {
    if (!('mediaSession' in navigator) || !started) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: config.song.title,
      artist: config.song.artist,
      album: `Class of ${config.classYear}`,
    })
    navigator.mediaSession.setActionHandler('play', () => !wantsPlayRef.current && toggle())
    navigator.mediaSession.setActionHandler('pause', () => wantsPlayRef.current && toggle())
  }, [started, toggle])

  useEffect(() => () => audioRef.current?.pause(), [])

  const value = useMemo(
    () => ({ playing, wantsPlay, volume, muted, unavailable, started, start, toggle, setVolume, toggleMute, hold, release }),
    [playing, wantsPlay, volume, muted, unavailable, started, start, toggle, setVolume, toggleMute, hold, release],
  )

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>')
  return ctx
}
