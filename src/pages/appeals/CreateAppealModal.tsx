import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Paperclip, ShieldCheck, X } from 'lucide-react'
import { Button, ErrorMessage, Modal, Select, Tabs } from '@/components/ui'
import {
  pickAppealTypeName,
  useAppealTypesQuery,
  useStoreAppealMutation,
} from '@/features/appeals'

const ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.zip,.rar,.mp4,.mov'

type Props = {
  open: boolean
  onClose: () => void
}

export function CreateAppealModal({ open, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const { data: types = [] } = useAppealTypesQuery(open)
  const storeMutation = useStoreAppealMutation()
  const fileRef = useRef<HTMLInputElement>(null)

  const [target, setTarget] = useState<'organization' | 'system'>('organization')
  const [typeId, setTypeId] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [formError, setFormError] = useState('')

  const reset = () => {
    setTarget('organization')
    setTypeId('')
    setMessage('')
    setFiles([])
    setFormError('')
    storeMutation.reset()
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!typeId) {
      setFormError(t('appeal.typeRequired'))
      return
    }
    if (message.trim().length < 10) {
      setFormError(t('appeal.messageMin'))
      return
    }

    try {
      await storeMutation.mutateAsync({
        appealTypeId: typeId,
        message,
        target,
        files,
      })
      handleClose()
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('appeal.sendError'),
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('appeal.createTitle')}
      sizeClassName="max-w-lg"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <p className="text-[13px] text-muted">{t('appeal.createHint')}</p>

        <fieldset className="space-y-1.5">
          <legend className="text-[12px] font-semibold text-muted">
            {t('appeal.target')}
          </legend>
          <Tabs
            fullWidth
            size="md"
            aria-label={t('appeal.target')}
            value={target}
            onChange={setTarget}
            items={[
              {
                value: 'organization',
                label: t('appeal.targetOrg'),
                icon: <Building2 className="size-3.5" aria-hidden />,
              },
              {
                value: 'system',
                label: t('appeal.targetSystem'),
                icon: <ShieldCheck className="size-3.5" aria-hidden />,
              },
            ]}
          />
        </fieldset>

        <Select
          label={t('appeal.type')}
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          options={[
            { value: '', label: t('appeal.typePlaceholder') },
            ...types.map((item) => ({
              value: item.id,
              label: pickAppealTypeName(item.name, i18n.language),
            })),
          ]}
          className="min-w-full"
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-muted">
            {t('appeal.message')}
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={2000}
            className="rounded-lg border border-mist bg-white px-3 py-2 text-[13px] text-ink outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            placeholder={t('appeal.messagePlaceholder')}
          />
          <span className="text-right text-[11px] text-muted">
            {message.length}/2000
          </span>
        </label>

        <div className="space-y-2">
          <span className="text-[12px] font-semibold text-muted">
            {t('appeal.files')}
          </span>
          <p className="text-[11px] text-muted">{t('appeal.filesHint')}</p>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const list = Array.from(e.target.files ?? [])
              setFiles((prev) => [...prev, ...list])
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="size-3.5" />
            {t('appeal.attachFiles')}
          </Button>
          {files.length > 0 ? (
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-fog/70 px-2.5 py-1.5 text-[12px] text-deep"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted hover:bg-white hover:text-rose"
                    aria-label={t('appeal.removeFile')}
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {formError || storeMutation.isError ? (
          <ErrorMessage fallback={false}>
            {formError ||
              (storeMutation.error instanceof Error
                ? storeMutation.error.message
                : t('appeal.sendError'))}
          </ErrorMessage>
        ) : null}

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClose}
          >
            {t('appeal.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={storeMutation.isPending}
          >
            {t('appeal.send')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
