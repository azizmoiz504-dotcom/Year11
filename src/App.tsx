import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { MusicPlayer } from './components/MusicPlayer'
import { PasswordScreen, UNLOCK_KEY } from './components/PasswordScreen'
import { config } from './config'
import { Home } from './pages/Home'
import { StudentProfile } from './pages/StudentProfile'

function isUnlocked() {
  if (!config.password.enabled) return true
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const location = useLocation()
  // The profile opens over the always-mounted grid, so scroll position survives closing it.
  const profileOpen = location.pathname.startsWith('/student/')

  useEffect(() => {
    if (!profileOpen) document.title = `Class of ${config.classYear}`
  }, [profileOpen])

  if (!unlocked) return <PasswordScreen onUnlock={() => setUnlocked(true)} />

  return (
    <MotionConfig reducedMotion="user">
      <Home hidden={profileOpen} />
      <AnimatePresence>
        {profileOpen && (
          <Routes location={location} key="profile">
            <Route path="/student/:id" element={<StudentProfile />} />
          </Routes>
        )}
      </AnimatePresence>
      <div className={profileOpen ? "max-sm:hidden" : undefined}>
        <MusicPlayer />
      </div>
    </MotionConfig>
  )
}
