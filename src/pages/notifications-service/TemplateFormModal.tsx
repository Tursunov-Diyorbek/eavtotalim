import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Modal, Textarea, notify } from '@/components/ui'
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
  const [name, setName] = useState(template?.name ?? '')
  const [body, setBody] = useState(template?.body ?? '')
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const createMutation = useCreateMessageTemplateMutation()
  const updateMutation = useUpdateMessageTemplateMutation()
  const editing = Boolean(template?.id)

  const submit = () => {
    if (!name.trim() || !body.trim()) {
      notify.error(t('notificationsPage.fillRequired'))
      return
    }
    const payload = { name: name.trim(), body: body.trim() }
    const onOk = () => {
      notify.success(
        editing ? t('notificationsPage.templateUpdated') : t('notificationsPage.templateCreated'),
      )
      onClose()
    }
    const onErr = (err: Error) =>
      notify.error(notificationErrorMessage(err, t('common.loadError')))
    if (editing && template) {
      updateMutation.mutate({ id: template.id, payload }, { onSuccess: onOk, onError: onErr })
    } else {
      createMutation.mutate(payload, { onSuccess: onOk, onError: onErr })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('notificationsPage.templateFormTitle')}
      sizeClassName="max-w-3xl"
    >
      <div className="space-y-3">
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
          rows={6}
          placeholder={t('notificationsPage.templateBodyPh')}
        />
        <p className="text-xs text-muted">
          {t('notificationsPage.keywords')}{' '}
          <span className="text-amber">{t('notificationsPage.keywordsHint')}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_KEYWORDS.map((item) => (
            <Button
              key={item.token}
              variant="outline"
              size="sm"
              onClick={() =>
                insertAtCursor(bodyRef.current, body, item.token, setBody)
              }
            >
              + {t(item.labelKey)}
            </Button>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={submit}
          >
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
