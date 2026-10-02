import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/inter'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router'
import App from './App'
import { MusicProvider } from './context/MusicContext'
import './index.css'

// The hosted preview build can't rewrite deep links to index.html, so it uses hash URLs.
const Router = import.meta.env.MODE === 'artifact' ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <MusicProvider>
        <App />
      </MusicProvider>
    </Router>
  </StrictMode>,
)
