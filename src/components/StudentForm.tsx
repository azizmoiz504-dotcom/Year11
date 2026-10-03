import { useState, type FormEvent } from 'react'
import { useData } from '../context/DataContext'
import { errorMessage, rememberedPassword, rememberPassword, updateStudent, uploadImage } from '../lib/backend'
import type { Student } from '../types'
import { Field, fieldClass, Modal } from './Modal'
import { PhotoPicker } from './PhotoPicker'

const QUOTE_MAX = 200

/** A senior fills in or edits their own card, using the personal password they were given. */
export function StudentForm({ student, onClose }: { student: Student; onClose: () => void }) {
  const { reload } = useData()
  const [university, setUniversity] = useState(student.university ?? '')
  const [quote, setQuote] = useState(student.quote ?? '')
  const [nowFile, setNowFile] = useState<File | null>(null)
  const [thenFile, setThenFile] = useState<File | null>(null)
  const [thenUrl, setThenUrl] = useState(student.babyPhoto ?? '')
  const [password, setPassword] = useState(rememberedPassword)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const busy = Boolean(status)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!password.trim()) return setError('Enter your password.')
    try {
      setStatus('Uploading photos…')
      const photoUrl = nowFile ? await uploadImage(nowFile) : (student.photo ?? '')
      const babyPhotoUrl = thenFile ? await uploadImage(thenFile) : thenUrl
      setStatus('Saving…')
      await updateStudent(student.id, password.trim(), { university: university.trim(), quote: quote.trim(), photoUrl, babyPhotoUrl })
      rememberPassword(password.trim())
      await reload()
      onClose()
    } catch (err) {
      setError(errorMessage(err))
      setStatus('')
    }
  }

  return (
    <Modal title={student.name} onClose={onClose} busy={busy}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <PhotoPicker id="photo-now" label="Now" file={nowFile} current={student.photo} onPick={setNowFile} />
          <PhotoPicker
            id="photo-then"
            label="Then (as a kid)"
            file={thenFile}
            current={thenUrl || undefined}
            onPick={setThenFile}
            onClear={() => {
              setThenFile(null)
              setThenUrl('')
            }}
          />
        </div>

        <Field label="University">
          <input
            id="f-uni"
            className={fieldClass}
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            maxLength={80}
            placeholder="e.g. University of Sharjah"
          />
        </Field>
        <Field label="Senior quote" hint={`${quote.length}/${QUOTE_MAX}`}>
          <textarea
            id="f-quote"
            className={`${fieldClass} min-h-24 resize-y`}
            value={quote}
            onChange={(e) => setQuote(e.target.value.slice(0, QUOTE_MAX))}
            placeholder="Something we'll remember you by"
          />
        </Field>
        <Field label="Your password" hint="The one you were sent. It's remembered on this phone after the first time.">
          <input
            id="f-password"
            className={fieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="rounded-full bg-blue py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
          {status || 'Save'}
        </button>
      </form>
    </Modal>
  )
}
