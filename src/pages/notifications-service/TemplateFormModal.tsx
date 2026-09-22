import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import {
  Button,
  Input,
  Modal,
  Textarea,
  notify,
} from '@/components/ui'
import {
  TEMPLATE_KEYWORDS,
  notificationErrorMessage,
  useCreateMessageTemplateMutation,
  useUpdateMessageTemplateMutation,
} from '@/features/notifications-service'
import type { MessageTemplateItem } from '@/api/notifications-service'

type Props = {
  open: boolean
  template?: MessageTemplateItem | null
  onClose: () => void
}

function insertAtCursor(
  el: HTMLTextAreaElement | null,
  value: string,
  token: string,
  setValue: (next: string) => void,
) {
  if (!el) {
    setValue(value + token)
    return
  }
  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  const next = value.slice(0, start) + token + value.slice(end)
  setValue(next)
  requestAnimationFrame(() => {
    const pos = start + token.length
    el.focus()
    el.setSelectionRange(pos, pos)
  })
}

export function TemplateFormModal({ open, template, onClose }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const createMutation = useCreateMessageTemplateMutation()
  const updateMutation = useUpdateMessageTemplateMutation()
  const editing = Boolean(template?.id)
  const pending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (!open) return
    setName(template?.name ?? '')
    setBody(template?.body ?? '')
  }, [open, template])

  const submit = () => {
    if (!name.trim() || !body.trim()) {
      notify.error(t('notificationsPage.fillRequired'))
      return
    }
    const payload = { name: name.trim(), body: body.trim() }
    const onOk = () => {
      notify.success(
        editing
          ? t('notificationsPage.templateUpdated')
          : t('notificationsPage.templateCreated'),
      )
      onClose()
    }
    const onErr = (err: Error) =>
      notify.error(notificationErrorMessage(err, t('common.loadError')))
    if (editing && template) {
      updateMutation.mutate(
        { id: template.id, payload },
        { onSuccess: onOk, onError: onErr },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: onOk, onError: onErr })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editing
          ? t('notificationsPage.templateEditTitle')
          : t('notificationsPage.templateFormTitle')
      }
      sizeClassName="max-w-2xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={pending}
            onClick={submit}
          >
            <Save className="size-3.5" aria-hidden />
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          required
          label={t('notificationsPage.templateName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('notificationsPage.templateNamePh')}
        />
        <Textarea
          ref={bodyRef}
          required
          label={t('notificationsPage.templateBody')}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={7}
          placeholder={t('notificationsPage.templateBodyPh')}
        />
        <div className="rounded-lg border border-mist/70 bg-fog/35 p-2.5">
          <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[12px] font-semibold text-deep">
              {t('notificationsPage.keywords')}
            </span>
            <span className="text-[11px] text-muted">
              {t('notificationsPage.keywordsHint')}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {TEMPLATE_KEYWORDS.map((item) => (
              <Button
                key={item.token}
                type="button"
                variant="soft"
                size="sm"
                className="h-7 min-w-0 rounded-md px-1.5 text-[11px] font-medium leading-tight shadow-none"
                title={item.token}
                onClick={() =>
                  insertAtCursor(bodyRef.current, body, item.token, setBody)
                }
              >
                <span className="truncate">{t(item.labelKey)}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
