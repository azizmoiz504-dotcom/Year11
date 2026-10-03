import { useEffect, useMemo } from 'react'

/** Square-ish tap target that shows the chosen (or current) photo. */
export function PhotoPicker({
  id,
  label,
  file,
  current,
  onPick,
  onClear,
  aspect = 'aspect-[4/5]',
}: {
  id: string
  label: string
  file: File | null
  current?: string
  onPick: (f: File | null) => void
  onClear?: () => void
  aspect?: string
}) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : current), [file, current])
  useEffect(() => () => (file && preview ? URL.revokeObjectURL(preview) : undefined), [file, preview])

  return (
    <div className="min-w-0">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <label
        htmlFor={id}
        className={`relative flex ${aspect} w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-line bg-bg text-sm text-muted transition-colors hover:border-accent`}
      >
        {preview ? <img src={preview} alt="" className="absolute inset-0 size-full object-cover" /> : <span className="px-2 text-center">Tap to choose</span>}
        <input id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
      </label>
      {preview && onClear && (
        <button type="button" onClick={onClear} className="mt-1 text-xs text-muted underline underline-offset-2">
          Remove
        </button>
      )}
    </div>
  )
}
