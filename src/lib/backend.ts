import { config } from '../config'
import type { Student } from '../types'
import type { GalleryPhoto } from './gallery'

/**
 * Talks to Supabase over plain HTTP (no SDK). Reads are public; every write goes
 * through a database function that checks the senior's personal password.
 * See supabase/setup.sql for the rules.
 */
// Values in config.ts win; VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars work too (handy on Vercel/Netlify).
const base = (config.backend.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '')
const key = (config.backend.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const backendEnabled = Boolean(base && key)

const headers = () => ({ apikey: key, Authorization: `Bearer ${key}` })

export class BackendError extends Error {
  constructor(public code: string) {
    super(code)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${base}${path}`, { ...init, headers: { ...headers(), ...init.headers } })
  } catch {
    throw new BackendError('network')
  }
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) throw new BackendError((body && (body.message || body.error)) || `http_${res.status}`)
  return body as T
}

interface StudentRow {
  id: string
  name: string
  university: string | null
  quote: string | null
  photo_url: string | null
  baby_photo_url: string | null
}

export async function fetchStudents(): Promise<Student[]> {
  const rows = await request<StudentRow[]>('/rest/v1/students?select=id,name,university,quote,photo_url,baby_photo_url&order=created_at.asc')
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    university: r.university ?? undefined,
    quote: r.quote ?? undefined,
    photo: r.photo_url ?? undefined,
    babyPhoto: r.baby_photo_url ?? undefined,
  }))
}

export async function fetchGallery(): Promise<GalleryPhoto[]> {
  const rows = await request<{ url: string; caption: string | null }[]>('/rest/v1/gallery?select=url,caption&order=created_at.asc')
  return rows.map((r) => ({ src: r.url, caption: r.caption ?? undefined }))
}

function rpc<T>(fn: string, args: Record<string, unknown>) {
  return request<T>(`/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
}

export interface StudentInput {
  university: string
  quote: string
  photoUrl: string
  babyPhotoUrl: string
}

/** A senior edits their own card with their personal password. */
export const updateStudent = (id: string, password: string, s: StudentInput) =>
  rpc<null>('update_student', {
    p_id: id,
    p_password: password,
    p_university: s.university,
    p_quote: s.quote,
    p_photo_url: s.photoUrl,
    p_baby_photo_url: s.babyPhotoUrl,
  })

/** Any senior's password can add gallery photos. */
export const addGalleryPhoto = (password: string, url: string, caption: string) =>
  rpc<string>('add_gallery_photo', { p_password: password, p_url: url, p_caption: caption })

/** Uploads an image to the public `photos` bucket and returns its public URL. */
export async function uploadPhoto(blob: Blob): Promise<string> {
  const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const path = `${new Date().getFullYear()}/${id}.jpg`
  await request(`/storage/v1/object/photos/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'image/jpeg', 'x-upsert': 'false' },
    body: blob,
  })
  return `${base}/storage/v1/object/public/photos/${path}`
}

/** Shrinks a photo to at most `maxSide` pixels and re-encodes it as JPEG, so uploads stay small on mobile data. */
export async function shrinkImage(file: File, maxSide = 1400, quality = 0.82): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new BackendError('unreadable_image')
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) throw new BackendError('unreadable_image')
  return blob
}

/** Friendly sentence for an error code from the database or the network. */
export function errorMessage(err: unknown): string {
  const code = err instanceof BackendError ? err.code : 'unknown'
  switch (code) {
    case 'wrong_password':
      return "That password isn't right. Check the one you were given."
    case 'unreadable_image':
      return "Couldn't read that photo. Try a JPG or PNG."
    case 'network':
      return "Couldn't reach the yearbook. Check your connection and try again."
    default:
      return 'Something went wrong saving that. Try again in a moment.'
  }
}

const PASSWORD_KEY = 'yb-password'
/** Remembers the visitor's own password on this device, so they only type it once. */
export function rememberedPassword() {
  try {
    return localStorage.getItem(PASSWORD_KEY) ?? ''
  } catch {
    return ''
  }
}
export function rememberPassword(password: string) {
  try {
    localStorage.setItem(PASSWORD_KEY, password)
  } catch {
    /* private mode */
  }
}
