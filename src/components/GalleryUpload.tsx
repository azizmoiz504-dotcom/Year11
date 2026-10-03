import { useState, type FormEvent } from 'react'
import { useData } from '../context/DataContext'
import { addGalleryPhoto, errorMessage, rememberClassCode, rememberedClassCode, shrinkImage, uploadPhoto } from '../lib/backend'
import { Field, fieldClass, Modal } from './Modal'

const MAX_FILES = 20

/** Anyone with the class code can add photos to the gallery. */
export function GalleryUpload({ onClose }: { onClose: () => void }) {
  const { reload } = useData()
  const [files, setFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [classCode, setClassCode] = useState(rememberedClassCode)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (files.length === 0) return setError('Choose at least one photo.')
    if (!classCode.trim()) return setError('Enter the class code.')
    try {
      for (let i = 0; i < files.length; i++) {
        setStatus(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : 'Uploading…')
        const url = await uploadPhoto(await shrinkImage(files[i]!, 1800))
        await addGalleryPhoto(classCode.trim(), url, caption.trim())
      }
      rememberClassCode(classCode.trim())
      await reload()
      onClose()
    } catch (err) {
      setError(errorMessage(err))
      setStatus('')
      await reload()
    }
  }

  return (
    <Modal title="Add photos" onClose={onClose} busy={Boolean(status)}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label
          htmlFor="g-files"
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line bg-bg p-4 text-center text-sm text-muted transition-colors hover:border-accent"
        >
          {files.length ? (
            <>
              <span className="text-base font-medium text-ink">
                {files.length} photo{files.length === 1 ? '' : 's'} selected
              </span>
              <span>Tap to choose different ones</span>
            </>
          ) : (
            <>
              <span className="text-base font-medium text-ink">Choose photos</span>
              <span>Up to {MAX_FILES} at a time</span>
            </>
          )}
          <input
            id="g-files"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => setFiles([...(e.target.files ?? [])].slice(0, MAX_FILES))}
          />
        </label>
        {files.length > 0 && (
          <ul className="grid grid-cols-5 gap-1.5">
            {files.slice(0, 10).map((f, i) => (
              <li key={i} className="aspect-square overflow-hidden rounded-md bg-line">
                <img src={URL.createObjectURL(f)} alt="" className="size-full object-cover" onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)} />
              </li>
            ))}
          </ul>
        )}
        <Field label="Caption" hint="Optional. Used for every photo in this batch.">
          <input id="g-caption" className={fieldClass} value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={120} placeholder="e.g. Sports day" />
        </Field>
        <Field label="Class code *" hint="Ask in the group chat.">
          <input id="g-code" className={fieldClass} value={classCode} onChange={(e) => setClassCode(e.target.value)} autoComplete="off" />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <button type="submit" disabled={Boolean(status)} className="rounded-full bg-blue py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
          {status || 'Add to gallery'}
        </button>
      </form>
    </Modal>
  )
}
