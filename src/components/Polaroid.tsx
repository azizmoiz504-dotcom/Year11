import type { ReactNode } from 'react'

export function Polaroid({
  children,
  caption,
  rotate = 0,
  className = '',
}: {
  children: ReactNode
  caption?: string
  rotate?: number
  className?: string
}) {
  return (
    <figure className={`polaroid relative ${className}`} style={{ rotate: `${rotate}deg` }}>
      {children}
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-1.5 text-center font-serif text-sm italic text-[#5a4a3a]">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
