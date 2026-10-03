import { useState, type ImgHTMLAttributes } from 'react'
import { initials } from '../lib/students'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string
  alt: string
  /** Name used for the initials fallback when the image is missing or broken. */
  fallbackName?: string
  eager?: boolean
}

/** Lazy image that fades in when loaded and degrades to initials if the file is missing. */
export function SmartImage({ src, alt, fallbackName, eager, className = '', ...rest }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-b from-sky to-navy font-serif text-3xl text-white/90 ${className}`}
      >
        {fallbackName ? initials(fallbackName) : ''}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`bg-line object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      {...rest}
    />
  )
}
