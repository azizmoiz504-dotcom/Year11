import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { config } from '../config'
import { asset } from '../lib/asset'

/**
 * One <audio> element for the whole app. It lives above the router, so opening a
 * profile never restarts the song. Volume and mute are remembered for the session.
 */
interface MusicState {
  playing: boolean
  volume: number
  muted: boolean
  unavailable: boolean
  toggle: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
}

const MusicContext = createContext<MusicState | null>(null)
const STORAGE_KEY = 'yb-music'

function readSaved(): { volume?: number; muted?: boolean } {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function save(patch: { volume?: number; muted?: boolean }) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSaved(), ...patch }))
  } catch {
    /* private mode */
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const saved = useRef(readSaved()).current
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolumeState] = useState(saved.volume ?? config.song.volume)
  const [muted, setMuted] = useState(saved.muted ?? false)
  const [unavailable, setUnavailable] = useState(false)

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio(asset(config.song.src))
      a.loop = true
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
  }, [volume, muted])

  const toggle = useCallback(() => {
    const a = getAudio()
    if (a.paused) a.play().catch(() => setPlaying(false))
    else a.pause()
  }, [getAudio])

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

  useEffect(() => {
    if (!('mediaSession' in navigator) || !playing) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: config.song.title,
      artist: config.song.artist,
      album: `Class of ${config.classYear}`,
    })
  }, [playing])

  useEffect(() => () => audioRef.current?.pause(), [])

  const value = useMemo(
    () => ({ playing, volume, muted, unavailable, toggle, setVolume, toggleMute }),
    [playing, volume, muted, unavailable, toggle, setVolume, toggleMute],
  )
  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>')
  return ctx
}
