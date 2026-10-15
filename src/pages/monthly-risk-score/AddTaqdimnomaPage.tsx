import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  ConfirmDialog,
  DetailList,
  Input,
  Notification,
  OrganizationSelect,
  Panel,
  Select,
  Textarea,
  notify,
} from '@/components/ui'
import { addTaqdimnomaScore, deleteTaqdimnomaScore } from '@/api'
import { routes } from '@/config'
import { formatDateTime } from '@/lib/format'
import type { TaqdimnomaExisting } from '@/types/risk-indicator'

const now = new Date()
const CURRENT_PERIOD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

function splitPeriod(value: string) {
  const [year = '', month = ''] = value.split('-')
  return { year: Number(year), month: Number(month) }
}

export function AddTaqdimnomaPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [organizationId, setOrganizationId] = useState('')
  const [period, setPeriod] = useState(CURRENT_PERIOD)
  const [type, setType] = useState('qisman')
  const [description, setDescription] = useState('')
  const [existing, setExisting] = useState<TaqdimnomaExisting | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = useMutation({
    mutationFn: addTaqdimnomaScore,
    onSuccess: (res) => {
      const ok = res.status === 1 || res.status === true || res.status === '1'
      if (ok) {
        notify.success(t('addTaqdimnomaPage.saved'))
        navigate(routes.monthlyRiskByOrg)
        return
      }
      if (res.data) setExisting(res.data)
      notify.error(res.message || t('addTaqdimnomaPage.saveError'))
    },
    onError: (error: Error) => notify.error(error.message || t('addTaqdimnomaPage.saveError')),
  })

  const remove = useMutation({
    mutationFn: deleteTaqdimnomaScore,
    onSuccess: () => {
      notify.success(t('monthlyRiskByOrgPage.deleted'))
      setExisting(null)
      setConfirmDelete(false)
    },
    onError: (error: Error) => notify.error(error.message || t('monthlyRiskByOrgPage.deleteError')),
  })

  function submit() {
    const { year, month } = splitPeriod(period)
    const text = description.trim()
    if (!organizationId || !year || !month || !type) {
      notify.warning(t('monthlyRiskByOrgPage.required'))
      return
    }
    if (text.length < 10 || text.length > 255) {
      notify.warning(t('addTaqdimnomaPage.descriptionRule'))
      return
    }
    setExisting(null)
    save.mutate({
      organization_id: organizationId,
      year,
      month,
      type,
      description: text,
    })
  }

  return (
    <>
      <Header
        title={t('addTaqdimnomaPage.title')}
        onBack={() => navigate(routes.monthlyRiskByOrg)}
        actions={
          <Button variant="primary" loading={save.isPending} onClick={submit}>
            {t('common.save')}
          </Button>
        }
      />
      <PageMain fill>
        <div className="flex min-h-0 w-full flex-1 flex-col gap-3">
          <Notification tone="info" className="shrink-0">
            {t('addTaqdimnomaPage.hint')}
          </Notification>
          <Panel className="flex min-h-0 w-full flex-1 flex-col gap-3 p-4">
            <OrganizationSelect
              label={t('common.organization')}
              size="md"
              valueKey="id"
              className="!w-full"
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="month"
                label={t('monthlyRiskByOrgPage.period')}
                required
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              />
              <Select
                label={t('addTaqdimnomaPage.type')}
                value={type}
                options={[
                  { value: 'qisman', label: t('addTaqdimnomaPage.partial') },
                  { value: 'umuman', label: t('addTaqdimnomaPage.full') },
                ]}
                onChange={(event) => setType(event.target.value)}
              />
            </div>
            <Textarea
              label={t('addTaqdimnomaPage.text')}
              required
              rows={8}
              className="min-h-40"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              hint={t('addTaqdimnomaPage.descriptionRule')}
            />
          </Panel>

          {existing ? (
            <Panel className="flex flex-col gap-3 p-4">
              <Notification tone="warning">{t('addTaqdimnomaPage.exists')}</Notification>
              <DetailList
                items={[
                  {
                    label: t('common.organization'),
                    value: existing.organization?.name || '—',
                  },
                  { label: 'INN', value: existing.organization?.inn || '—' },
                  {
                    label: t('addTaqdimnomaPage.address'),
                    value: existing.organization?.address || '—',
                  },
                  {
                    label: t('monthlyRiskScorePage.indicator'),
                    value: existing.risk_indicator?.name || '—',
                  },
                  {
                    label: t('monthlyRiskScorePage.score'),
                    value: existing.score == null ? '—' : String(existing.score),
                  },
                  {
                    label: t('monthlyRiskByOrgPage.period'),
                    value: `${existing.year ?? '—'} / ${existing.month ?? '—'}`,
                  },
                  {
                    label: t('addTaqdimnomaPage.created'),
                    value: formatDateTime(existing.created_at, i18n.language) || '—',
                  },
                ]}
              />
              {existing.risk_indicator?.description ? (
                <p className="m-0 text-sm leading-snug text-deep">
                  {existing.risk_indicator.description}
                </p>
              ) : null}
              <div className="flex justify-end">
                <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                  {t('common.delete')}
                </Button>
              </div>
            </Panel>
          ) : null}
        </div>
      </PageMain>
      <ConfirmDialog
        open={confirmDelete}
        loading={remove.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (existing?.id != null) remove.mutate(existing.id)
        }}
      />
    </>
  )
}
