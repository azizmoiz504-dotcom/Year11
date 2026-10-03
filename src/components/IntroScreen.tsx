import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { config } from '../config'

const ease = [0.22, 1, 0.36, 1] as const

/** Full-screen title card. Pressing Enter starts the song (browsers need a click for sound). */
export function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const t = setTimeout(() => btn.current?.focus({ preventScroll: true }), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.main
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden bg-navy px-6 text-cream"
      exit={{ opacity: 0, transition: { duration: 1.1, ease } }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        style={{
          background:
            'radial-gradient(40% 35% at 30% 35%, rgb(111 159 207 / 0.38), transparent 70%), radial-gradient(40% 35% at 72% 62%, rgb(47 98 176 / 0.4), transparent 70%), radial-gradient(30% 25% at 55% 30%, rgb(169 198 232 / 0.22), transparent 70%)',
        }}
      />
      <motion.p
        initial={{ opacity: 0, letterSpacing: '0.6em' }}
        animate={{ opacity: 0.75, letterSpacing: '0.35em' }}
        transition={{ duration: 2, ease }}
        className="relative mb-5 text-[11px] uppercase sm:text-xs"
      >
        {config.schoolName}
      </motion.p>
      <h1 className="relative text-center font-serif leading-[0.9] font-light">
        <motion.span
          className="block text-2xl italic sm:text-4xl"
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 0.85, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, delay: 0.3, ease }}
        >
          Class of
        </motion.span>
        <motion.span
          className="block text-[30vw] tracking-tight sm:text-[14rem]"
          initial={{ opacity: 0, y: 20, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2, delay: 0.6, ease }}
        >
          {config.classYear}
        </motion.span>
      </h1>
      <motion.button
        ref={btn}
        type="button"
        onClick={onEnter}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.7, ease }}
        className="relative mt-12 rounded-full bg-cream px-11 py-3.5 text-sm font-medium tracking-[0.3em] text-navy uppercase shadow-[0_10px_30px_-10px_rgb(111_159_207/0.8)] transition-transform hover:scale-105 active:scale-95"
      >
        Enter
      </motion.button>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.2, delay: 2.4 }}
        className="relative mt-5 text-xs"
      >
        Turn your sound on
      </motion.p>
    </motion.main>
  )
}
