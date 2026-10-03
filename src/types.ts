export interface Student {
  id: string
  name: string
  /** Missing until they upload one (live mode). */
  photo?: string
  /** Childhood photo for the then/now flip. */
  babyPhoto?: string
  university?: string
  quote?: string
}
