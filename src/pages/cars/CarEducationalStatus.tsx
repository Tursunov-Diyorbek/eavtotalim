import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, Button, Modal, Notification, Select, SkeletonLines, Textarea, notify } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useCarEducationalHistoryQuery, useSetCarEducationalMutation } from '@/features/cars'
import { formatDateTime, fullNameOf } from '@/lib/format'
import type { CarDetail, CarEducationalHistoryItem } from '@/types/cars'

const SOURCE_KEYS: Record<string, string> = {
  body_type: 'carsPage.eduSourceBody',
  mspd_body_note: 'carsPage.eduSourceBodyNote',
  mspd_note: 'carsPage.eduSourceNote',
  mspd_shassi: 'carsPage.eduSourceShassi',
  mspd_kuzov: 'carsPage.eduSourceKuzov',
  manual: 'carsPage.eduSourceManual',
}

function historyUser(user: CarEducationalHistoryItem['user']) {
  if (!user) return '—'
  if (typeof user === 'string') return user.trim() || '—'
  return fullNameOf(user) ?? '—'
}

function mspdLines(car: CarDetail) {
  return (
    [
      { label: 'body_note', value: car.mspd_body_note },
      { label: 'note', value: car.mspd_note },
      { label: 'shassi', value: car.mspd_shassi },
      { label: 'kuzov', value: car.mspd_kuzov },
    ] as const
  ).filter((item) => {
    const value = item.value?.trim()
    return Boolean(value) && value !== '-' && value !== 'null'
  })
}

/** Eski `CarEducationalStatus` — o‘quv belgisi, MSPD matni va qo‘lda tarix. */
export function CarEducationalStatus({ car }: { car: CarDetail }) {
  const { t, i18n } = useTranslation()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('set-car-educational-manually')
  const historyQuery = useCarEducationalHistoryQuery(String(car.id))
  const saveMutation = useSetCarEducationalMutation(String(car.id))

  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState('auto')
  const [reason, setReason] = useState('')

  const educational = Boolean(car.is_educational)
  const sourceKey = car.educational_source ? SOURCE_KEYS[car.educational_source] : undefined
  const sourceLabel = sourceKey ? t(sourceKey) : t('carsPage.eduSourceAuto')
  const texts = mspdLines(car)
  const history = historyQuery.data ?? []

  const openModal = () => {
    setChoice(Number(car.educational_override) === 1 ? '1' : 'auto')
    setReason('')
    setOpen(true)
  }

  const save = () => {
    const trimmed = reason.trim()
    if (trimmed.length < 5) {
      notify.warning(t('carsPage.eduReasonShort'))
      return
    }
    saveMutation.mutate(
      { override: choice === 'auto' ? null : 1, reason: trimmed },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          setOpen(false)
        },
        onError: (err: Error) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <div className="mt-3 border-t border-mist/70 pt-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          {t('carsPage.eduStatus')}
        </span>
        <Badge tone={educational ? 'teal' : 'rose'}>
          {educational ? t('carsPage.educational') : t('carsPage.notEducational')}
        </Badge>
        <span className={sourceKey ? 'text-xs font-medium text-teal' : 'text-xs text-muted'}>
          {sourceLabel}
        </span>
        {canEdit ? (
          <Button variant="outline" size="sm" onClick={openModal}>
            {t('carsPage.eduChange')}
          </Button>
        ) : null}
      </div>

      {texts.length > 0 ? (
        <p className="mt-1 text-xs leading-snug text-muted">
          {texts.map((item, index) => (
            <span key={item.label}>
              {index > 0 ? <span className="px-1.5 text-mist">·</span> : null}
              {item.label}: <span className="font-medium text-deep">{item.value}</span>
            </span>
          ))}
        </p>
      ) : null}

      <div className="mt-1">
        {historyQuery.isLoading ? (
          <SkeletonLines lines={1} />
        ) : history.length === 0 ? (
          <p className="text-[11px] text-muted">{t('carsPage.eduNoManual')}</p>
        ) : (
          <ul className="space-y-1">
            {history.map((row) => {
              const manual = Number(row.new_override) === 1
              return (
                <li key={row.id} className="text-xs leading-snug">
                  <span className={row.new_is_educational ? 'font-semibold text-teal' : 'font-semibold text-rose'}>
                    {manual ? t('carsPage.eduOverrideOn') : t('carsPage.eduOverrideAuto')}
                  </span>
                  <span className="text-muted">
                    {' '}
                    · {historyUser(row.user)} ·{' '}
                    {formatDateTime(row.created_at, i18n.language) ?? row.created_at ?? '—'}
                  </span>
                  {row.reason ? <span className="text-deep"> — {row.reason}</span> : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('carsPage.eduChangeTitle')}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" loading={saveMutation.isPending} onClick={save}>
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Notification tone="info">{t('carsPage.eduChangeHint')}</Notification>
          <Select
            label={t('carsPage.eduStatus')}
            value={choice}
            options={[
              { value: 'auto', label: t('carsPage.eduOverrideAuto') },
              { value: '1', label: t('carsPage.eduOverrideOn') },
            ]}
            onChange={(event) => setChoice(event.target.value)}
          />
          <Textarea
            label={t('carsPage.eduReason')}
            required
            rows={3}
            maxLength={1000}
            value={reason}
            placeholder={t('carsPage.eduReasonPh')}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
