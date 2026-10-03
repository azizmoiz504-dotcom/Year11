import { useState, type ImgHTMLAttributes } from 'react'
import { healThumb } from '../lib/backend'
import { initials } from '../lib/students'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string
  alt: string
  /** Tried if `src` fails, e.g. the full-size photo when its thumbnail doesn't exist yet. */
  fallbackSrc?: string
  /** Name used for the initials fallback when the image is missing or broken. */
  fallbackName?: string
  eager?: boolean
}

/** Lazy image that fades in when loaded and degrades to initials if the file is missing. */
export function SmartImage(props: Props) {
  // Remount when the source changes so load/error state starts fresh.
  return <SmartImageInner key={`${props.src}|${props.fallbackSrc}`} {...props} />
}

function SmartImageInner({ src, fallbackSrc, alt, fallbackName, eager, className = '', ...rest }: Props) {
  const [current, setCurrent] = useState(src ?? fallbackSrc)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const usingFallback = current === fallbackSrc && src !== fallbackSrc

  if (!current || failed) {
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
      src={current}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => {
        setLoaded(true)
        if (usingFallback && fallbackSrc) void healThumb(fallbackSrc)
      }}
      onError={() => (fallbackSrc && current !== fallbackSrc ? setCurrent(fallbackSrc) : setFailed(true))}
      className={`bg-line object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      {...rest}
    />
  )
}
