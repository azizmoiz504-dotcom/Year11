import raw from '../data/gallery.json'
import { asset } from './asset'

export interface GalleryPhoto {
  src: string
  caption?: string
}

export const gallery: GalleryPhoto[] = (raw as Partial<GalleryPhoto>[]).flatMap((p) =>
  typeof p.src === 'string' && p.src.trim()
    ? [{ src: asset(p.src.trim()), caption: typeof p.caption === 'string' && p.caption.trim() ? p.caption.trim() : undefined }]
    : [],
)
