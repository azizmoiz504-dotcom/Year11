import { motion, type HTMLMotionProps } from 'framer-motion'

/** Gentle fade-and-rise when scrolled into view. Respects reduced motion via <MotionConfig>. */
export function Reveal({ delay = 0, y = 24, ...rest }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    />
  )
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.32em] text-accent">{eyebrow}</p>
      <h2 className="font-serif text-4xl leading-[1.05] font-light tracking-tight text-balance sm:text-6xl">{title}</h2>
      {children && <p className="mt-4 text-base text-pretty text-muted sm:text-lg">{children}</p>}
    </Reveal>
  )
}
