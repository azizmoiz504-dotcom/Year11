import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { config } from '../config'

const ease = [0.22, 1, 0.36, 1] as const

export function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const btn = useRef<HTMLButtonElement>(null)

  // Focus the button once it has faded in, so keyboard users can press Enter straight away.
  useEffect(() => {
    const t = setTimeout(() => btn.current?.focus({ preventScroll: true }), 2600)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.main
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-[#0f0c0a] px-6 text-[#efe6d8]"
      exit={{ opacity: 0, transition: { duration: 1.4, ease } }}
    >
      {/* warm projector glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 4 }}
        style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 45%, rgb(196 128 82 / 0.22), transparent 70%)' }}
      />

      <motion.p
        initial={{ opacity: 0, letterSpacing: '0.6em' }}
        animate={{ opacity: 0.7, letterSpacing: '0.35em' }}
        transition={{ duration: 2.4, ease }}
        className="relative mb-6 text-[11px] uppercase sm:text-xs"
      >
        {config.schoolName}
      </motion.p>

      <h1 className="relative text-center font-serif leading-[0.9] font-light">
        <motion.span
          className="block text-2xl italic opacity-80 sm:text-4xl"
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 0.8, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2, delay: 0.5, ease }}
        >
          Class of
        </motion.span>
        <motion.span
          className="block text-[30vw] tracking-tight sm:text-[14rem]"
          initial={{ opacity: 0, y: 20, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2.6, delay: 0.9, ease }}
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
        transition={{ duration: 1.4, delay: 2.2, ease }}
        className="group relative mt-12 rounded-full border border-[#efe6d8]/30 px-10 py-3.5 text-sm tracking-[0.3em] uppercase transition-colors hover:bg-[#efe6d8] hover:text-[#0f0c0a] focus-visible:bg-[#efe6d8] focus-visible:text-[#0f0c0a]"
      >
        Enter
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ duration: 1.5, delay: 3 }}
        className="relative mt-6 text-xs"
      >
        Sound on, if you can.
      </motion.p>
    </motion.main>
  )
}
