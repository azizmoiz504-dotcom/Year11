import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  // `vite build --mode artifact` produces a build that works from any sub-path.
  base: mode === 'artifact' ? './' : '/',
  plugins: [react(), tailwindcss()],
}))
