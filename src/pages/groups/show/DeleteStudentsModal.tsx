import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Paperclip, Trash2, UserMinus, X } from 'lucide-react'
import { Button, EmptyState, Modal, Notification, notify } from '@/components/ui'
import { useRemoveStudentsFromGroupMutation } from '@/features/groups'
import { fullNameOf } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { GroupStudentRow } from '@/types/groups'

const MAX_FILE_MB = 10
const ACCEPT =
  '.jpg,.jpeg,.png,.gif,.webp,.bmp,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar'

type DeleteStudentsModalProps = {
  open: boolean
  onClose: () => void
  groupId: string
  students: GroupStudentRow[]
  onRemoveFromSelection: (id: number) => void
  onDeleted: () => void
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/** Eski `deleteStudentModal` — guruhdan chiqarish + ixtiyoriy fayl. */
export function DeleteStudentsModal({
  open,
  onClose,
  groupId,
  students,
  onRemoveFromSelection,
  onDeleted,
}: DeleteStudentsModalProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const mutation = useRemoveStudentsFromGroupMutation()

  const resetAndClose = () => {
    setFile(null)
    setDragging(false)
    onClose()
  }

  const pickFile = (next: File | null) => {
    if (!next) {
      setFile(null)
      return
    }
    if (isPdf(next)) {
      notify.error(t('groupsPage.showPage.deleteStudentsPdfDenied'))
      return
    }
    if (next.size > MAX_FILE_MB * 1024 * 1024) {
      notify.error(t('groupsPage.showPage.deleteStudentsFileTooBig'))
      return
    }
    setFile(next)
  }

  const onDelete = () => {
    if (students.length === 0) {
      notify.error(t('groupsPage.showPage.deleteStudentsNeedOne'))
      return
    }
    mutation.mutate(
      {
        groupId,
        studentIds: students.map((row) => row.id),
        file,
      },
      {
        onSuccess: (res) => {
          notify.success(res.message || t('common.deleted'))
          setFile(null)
          onDeleted()
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      sizeClassName="max-w-3xl"
      title={
        <div>
          <p className="m-0">{t('groupsPage.showPage.deleteStudentsTitle')}</p>
          <p className="mt-0.5 text-xs font-medium text-muted">
            {t('groupsPage.showPage.deleteStudentsCount', { count: students.length })}
          </p>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={resetAndClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={students.length === 0}
            loading={mutation.isPending}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" aria-hidden />
            {t('common.delete')}
          </Button>
        </div>
      }
    >
      <Notification tone="warning" className="mb-3">
        {t('groupsPage.showPage.deleteStudentsWarn')}
      </Notification>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-h-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-deep">
              <UserMinus className="size-3.5 text-rose" aria-hidden />
              {t('groupsPage.showPage.deleteStudentsList')}
            </p>
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-rose px-1.5 text-[11px] font-semibold text-white">
              {students.length}
            </span>
          </div>
          {students.length === 0 ? (
            <EmptyState description={t('groupsPage.showPage.deleteStudentsEmpty')} />
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {students.map((row, index) => (
                <li
                  key={row.id}
                  className="flex items-center gap-2 rounded-lg border border-mist/70 px-2 py-1.5"
                >
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-rose text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold uppercase text-deep">
                    {fullNameOf(row) ?? '—'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-rose"
                    aria-label={t('common.delete')}
                    onClick={() => {
                      onRemoveFromSelection(row.id)
                      if (students.length <= 1) resetAndClose()
                    }}
                  >
                    <X className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-deep">
            <Paperclip className="size-3.5 text-rose" aria-hidden />
            {t('groupsPage.showPage.deleteStudentsFile')}
          </p>
          {file ? (
            <div className="flex items-center gap-2 rounded-xl border border-mist/70 px-3 py-2.5">
              <FileText className="size-5 shrink-0 text-rose" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-deep">{file.name}</p>
                <p className="text-[11px] text-muted">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7 text-rose"
                onClick={() => {
                  setFile(null)
                  if (inputRef.current) inputRef.current.value = ''
                }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <label
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-3 py-8 text-center transition',
                dragging ? 'border-rose bg-rose-soft' : 'border-mist/80 bg-fog/40 hover:border-rose/50',
              )}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                pickFile(event.dataTransfer.files?.[0] ?? null)
              }}
            >
              <FileText className="size-8 text-rose" aria-hidden />
              <span className="text-xs font-semibold text-deep">
                {t('groupsPage.showPage.deleteStudentsDrop')}
              </span>
              <span className="text-[11px] text-muted">
                {t('groupsPage.showPage.deleteStudentsFileHint')}
              </span>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      </div>
    </Modal>
  )
}
