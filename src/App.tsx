import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { Atmosphere } from './components/Atmosphere'
import { IntroScreen } from './components/IntroScreen'
import { MusicPlayer } from './components/MusicPlayer'
import { PasswordScreen, UNLOCK_KEY } from './components/PasswordScreen'
import { config } from './config'
import { useMusic } from './context/MusicContext'
import { Home } from './pages/Home'
import { ReelsFeed } from './pages/ReelsFeed'
import { StudentProfile } from './pages/StudentProfile'

type Phase = 'password' | 'intro' | 'site'

function isUnlocked() {
  if (!config.password.enabled) return true
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>(() => (isUnlocked() ? 'intro' : 'password'))
  const { start } = useMusic()
  const location = useLocation()

  // Overlays (profile, reels) sit on top of the always-mounted home page, so the
  // scroll position and music survive opening and closing them.
  const overlay = location.pathname.split('/')[1] || ''
  const overlayOpen = overlay === 'student' || overlay === 'reels'

  useEffect(() => {
    if (!overlayOpen) document.title = `Class of ${config.classYear} · Yearbook`
  }, [overlayOpen])

  return (
    <MotionConfig reducedMotion="user">
      <Atmosphere />

      <AnimatePresence mode="wait">
        {phase === 'password' && <PasswordScreen key="pw" onUnlock={() => setPhase('intro')} />}
        {phase === 'intro' && (
          <IntroScreen
            key="intro"
            onEnter={() => {
              start()
              setPhase('site')
            }}
          />
        )}
      </AnimatePresence>

      {phase === 'site' && (
        <>
          <Home hidden={overlayOpen} />
          <AnimatePresence>
            {overlayOpen && (
              <Routes location={location} key={overlay}>
                <Route path="/student/:id" element={<StudentProfile />} />
                <Route path="/reels" element={<ReelsFeed />} />
              </Routes>
            )}
          </AnimatePresence>
          <MusicPlayer />
        </>
      )}
    </MotionConfig>
  )
}
