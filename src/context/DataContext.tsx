import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { backendEnabled, fetchGallery, fetchStudents } from '../lib/backend'
import { gallery as staticGallery, type GalleryPhoto } from '../lib/gallery'
import { students as staticStudents } from '../lib/students'
import type { Student } from '../types'

/**
 * The class's seniors and gallery photos. Without a backend they come from
 * src/data/*.json; with Supabase configured they're loaded live, so classmates'
 * additions appear for everyone.
 */
interface DataState {
  students: Student[]
  gallery: GalleryPhoto[]
  loading: boolean
  failed: boolean
  live: boolean
  reload: () => Promise<void>
}

const DataContext = createContext<DataState | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(backendEnabled ? [] : staticStudents)
  const [gallery, setGallery] = useState<GalleryPhoto[]>(staticGallery)
  const [loading, setLoading] = useState(backendEnabled)
  const [failed, setFailed] = useState(false)

  const reload = useCallback(async () => {
    if (!backendEnabled) return
    try {
      const [s, g] = await Promise.all([fetchStudents(), fetchGallery()])
      setStudents(s)
      setGallery([...staticGallery, ...g])
      setFailed(false)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const value = useMemo(() => ({ students, gallery, loading, failed, live: backendEnabled, reload }), [students, gallery, loading, failed, reload])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
