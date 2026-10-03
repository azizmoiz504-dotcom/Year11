import { useEffect, useState } from 'react'

/** True once `src` has loaded. False while loading or if the file is missing. */
export function useImageOk(src: string | undefined) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    setOk(false)
    if (!src) return
    const img = new Image()
    img.onload = () => setOk(true)
    img.src = src
    return () => {
      img.onload = null
    }
  }, [src])
  return ok
}
