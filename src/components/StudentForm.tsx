import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useData } from '../context/DataContext'
import {
  addStudent,
  deleteStudent,
  errorMessage,
  rememberClassCode,
  rememberedClassCode,
  shrinkImage,
  updateStudent,
  uploadPhoto,
} from '../lib/backend'
import type { Student } from '../types'
import { Field, fieldClass, Modal } from './Modal'
import { PhotoPicker } from './PhotoPicker'

const QUOTE_MAX = 200

/** Add yourself (no `student`) or edit your own card (with `student`, PIN required). */
export function StudentForm({ student, onClose, onDeleted }: { student?: Student; onClose: () => void; onDeleted?: () => void }) {
  const editing = Boolean(student)
  const { reload } = useData()
  const navigate = useNavigate()
  const [name, setName] = useState(student?.name ?? '')
  const [university, setUniversity] = useState(student?.university ?? '')
  const [quote, setQuote] = useState(student?.quote ?? '')
  const [nowFile, setNowFile] = useState<File | null>(null)
  const [thenFile, setThenFile] = useState<File | null>(null)
  const [thenUrl, setThenUrl] = useState(student?.babyPhoto ?? '')
  const [pin, setPin] = useState('')
  const [classCode, setClassCode] = useState(rememberedClassCode)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const busy = Boolean(status)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Add your name.')
    if (!editing && !nowFile) return setError('Add a photo of you now.')
    if (!/^\d{4,8}$/.test(pin)) return setError(editing ? 'Enter your PIN.' : 'Pick a PIN of 4 to 8 digits.')
    if (!editing && !classCode.trim()) return setError('Enter the class code.')
    try {
      setStatus('Uploading photos…')
      const photoUrl = nowFile ? await uploadPhoto(await shrinkImage(nowFile)) : student!.photo
      const babyPhotoUrl = thenFile ? await uploadPhoto(await shrinkImage(thenFile)) : thenUrl
      setStatus('Saving…')
      const input = { name: name.trim(), university: university.trim(), quote: quote.trim(), photoUrl, babyPhotoUrl }
      if (editing) {
        await updateStudent(student!.id, pin, input)
        await reload()
        onClose()
      } else {
        const id = await addStudent(classCode.trim(), pin, input)
        rememberClassCode(classCode.trim())
        await reload()
        onClose()
        navigate(`/student/${id}`, { state: { modal: true } })
      }
    } catch (err) {
      setError(errorMessage(err))
      setStatus('')
    }
  }

  const remove = async () => {
    setError('')
    if (!/^\d{4,8}$/.test(pin)) return setError('Enter your PIN to remove your card.')
    try {
      setStatus('Removing…')
      await deleteStudent(student!.id, pin)
      await reload()
      onClose()
      onDeleted?.()
    } catch (err) {
      setError(errorMessage(err))
      setStatus('')
      setConfirmDelete(false)
    }
  }

  return (
    <Modal title={editing ? 'Edit your card' : 'Add yourself'} onClose={onClose} busy={busy}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <PhotoPicker id="photo-now" label={editing ? 'Now (tap to change)' : 'Now *'} file={nowFile} current={student?.photo} onPick={setNowFile} />
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

        <Field label="Name *">
          <input id="f-name" className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" />
        </Field>
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

        <div className={`grid gap-3 ${editing ? '' : 'sm:grid-cols-2'}`}>
          <Field label={editing ? 'Your PIN *' : 'Make a PIN *'} hint={editing ? undefined : "4–8 digits. You'll need it to edit your card later."}>
            <input
              id="f-pin"
              className={fieldClass}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
              inputMode="numeric"
              autoComplete={editing ? 'current-password' : 'new-password'}
              type="password"
            />
          </Field>
          {!editing && (
            <Field label="Class code *" hint="Ask in the group chat.">
              <input id="f-code" className={fieldClass} value={classCode} onChange={(e) => setClassCode(e.target.value)} autoComplete="off" />
            </Field>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="rounded-full bg-blue py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
          {status || (editing ? 'Save changes' : 'Add my card')}
        </button>

        {editing &&
          (confirmDelete ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-sm">
              <span>Remove your card for good?</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => setConfirmDelete(false)} disabled={busy} className="rounded-full px-3 py-1.5 hover:bg-line">
                  Cancel
                </button>
                <button type="button" onClick={remove} disabled={busy} className="rounded-full bg-red-600 px-3 py-1.5 text-white">
                  Remove
                </button>
              </span>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy} className="text-sm text-muted underline underline-offset-4">
              Remove my card
            </button>
          ))}
      </form>
    </Modal>
  )
}
