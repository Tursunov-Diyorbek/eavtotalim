import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Paperclip, Save } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  DateInput,
  DetailList,
  EmptyState,
  ErrorMessage,
  Panel,
  Select,
  SkeletonLines,
  fieldLabelClassName,
  notify,
} from '@/components/ui'
import { routes } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useAgreementAutodromesQuery,
  useSendAutodromeAgreementMutation,
} from '@/features/autodrome-agreement'
import { asText } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import { useSmartBack } from '@/hooks'
import type { AutodromePickItem } from '@/types/autodrome-agreement'

function parseCoords(item: AutodromePickItem) {
  const a = Number(item.latitude)
  const b = Number(item.longitude)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  if (a > 50 && b < 50) return { lat: b, lng: a }
  return { lat: a, lng: b }
}

function splitFio(fio?: string | null) {
  const parts = (fio ?? '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean)
  return {
    last: parts[0] || '—',
    first: parts[1] || '—',
    middle: parts.slice(2).join(' ') || '—',
  }
}

function osmEmbed(lat: number, lng: number) {
  const d = 0.01
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`
}

export function AutodromeAgreementSendPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.autodromeAgreement)
  const { isSuperAdmin } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const autodromesQuery = useAgreementAutodromesQuery()
  const sendMutation = useSendAutodromeAgreementMutation()

  const [autodromeId, setAutodromeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const autodromes = useMemo(() => {
    const list = autodromesQuery.data ?? []
    if (isSuperAdmin) return list
    return list.filter((item) => Number(item.autodrome_status?.id) === 1)
  }, [autodromesQuery.data, isSuperAdmin])

  const selected = autodromes.find((item) => String(item.id) === autodromeId) ?? null
  const coords = selected ? parseCoords(selected) : null
  const director = splitFio(selected?.director?.fio)
  const required = t('autodromeAgreementPage.required')

  const submit = () => {
    const next: Record<string, string> = {}
    if (!autodromeId) next.autodromeId = required
    if (!file) next.file = required
    if (!startDate) next.startDate = required
    if (!endDate) next.endDate = required
    setErrors(next)
    if (Object.keys(next).length) return

    const form = new FormData()
    form.append('autodrome_id', autodromeId)
    form.append('file', file!)
    form.append('start_date', startDate)
    form.append('end_date', endDate)
    sendMutation.mutate(form, {
      onSuccess: (res) => {
        notify.success(res.message || t('common.saved'))
        navigate(routes.autodromeAgreement)
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  return (
    <>
      <Header
        title={t('autodromeAgreementPage.sendTitle')}
        onBack={goBack}
        actions={
          <Button
            variant="primary"
            size="sm"
            loading={sendMutation.isPending}
            onClick={submit}
          >
            <Save className="size-3.5" aria-hidden />
            {t('autodromeAgreementPage.submit')}
          </Button>
        }
      />
      <PageMain>
        {autodromesQuery.isError ? (
          <ErrorMessage />
        ) : (
          <div className="flex flex-col gap-3">
            <Panel padding="sm">
              {autodromesQuery.isLoading ? (
                <SkeletonLines lines={4} />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Select
                      label={t('autodromeAgreementPage.autodromeName')}
                      required
                      value={autodromeId}
                      placeholder={t('common.selectPlaceholder')}
                      options={autodromes.map((item) => ({
                        value: String(item.id),
                        label: item.name || String(item.id),
                      }))}
                      onChange={(e) => {
                        setAutodromeId(e.target.value)
                        setErrors((prev) => ({ ...prev, autodromeId: '' }))
                      }}
                    />
                    {errors.autodromeId ? (
                      <p className="mt-1 text-xs text-rose">{errors.autodromeId}</p>
                    ) : null}
                  </div>
                  <div>
                    <p className={fieldLabelClassName}>
                      <span className="text-rose" aria-hidden>
                        *{' '}
                      </span>
                      {t('autodromeAgreementPage.file')}
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const next = e.target.files?.[0] ?? null
                        setFile(next)
                        setErrors((prev) => ({ ...prev, file: '' }))
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-1.5 w-full justify-start"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Paperclip className="size-3.5" />
                      {file?.name || t('autodromeAgreementPage.uploadFile')}
                    </Button>
                    {errors.file ? (
                      <p className="mt-1 text-xs text-rose">{errors.file}</p>
                    ) : null}
                  </div>
                  <DateInput
                    label={t('autodromeAgreementPage.startDate')}
                    required
                    value={startDate}
                    error={errors.startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setErrors((prev) => ({ ...prev, startDate: '' }))
                    }}
                  />
                  <DateInput
                    label={t('autodromeAgreementPage.endDate')}
                    required
                    value={endDate}
                    error={errors.endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setErrors((prev) => ({ ...prev, endDate: '' }))
                    }}
                  />
                </div>
              )}
            </Panel>

            {selected ? (
              <div className="grid gap-3 lg:grid-cols-2">
                <Panel padding="sm">
                  <p className="font-display mb-3 text-sm font-semibold text-deep">
                    {t('autodromeAgreementPage.autodromeInfo')}
                  </p>
                  <DetailList
                    items={[
                      {
                        label: t('autodromeAgreementPage.autodromeName'),
                        value: selected.name,
                      },
                      {
                        label: t('autodromeAgreementPage.contact'),
                        value: selected.contact_phone
                          ? `+998 ${selected.contact_phone}`
                          : '—',
                      },
                      { label: 'INN', value: selected.inn },
                      {
                        label: t('autodromeAgreementPage.region'),
                        value: asText(selected.region?.name),
                      },
                      {
                        label: t('autodromeAgreementPage.district'),
                        value: asText(selected.area?.name),
                      },
                      {
                        label: t('autodromeAgreementPage.fieldSize'),
                        value: selected.field_size,
                      },
                      {
                        label: t('autodromeAgreementPage.address'),
                        value: selected.address,
                      },
                      {
                        label: t('autodromeAgreementPage.landmark'),
                        value:
                          selected.landmark ||
                          t('autodromeAgreementPage.notEntered'),
                      },
                      {
                        label: t('autodromeAgreementPage.createdAt'),
                        value: formatDate(selected.created_at, i18n.language),
                      },
                    ]}
                  />
                </Panel>
                <Panel padding="sm">
                  <p className="font-display mb-3 text-sm font-semibold text-deep">
                    {t('autodromeAgreementPage.directorInfo')}
                  </p>
                  <DetailList
                    className="sm:grid-cols-3"
                    items={[
                      {
                        label: t('autodromeAgreementPage.lastName'),
                        value: director.last,
                      },
                      {
                        label: t('autodromeAgreementPage.firstName'),
                        value: director.first,
                      },
                      {
                        label: t('autodromeAgreementPage.middleName'),
                        value: director.middle,
                      },
                      {
                        label: t('autodromeAgreementPage.directorPhone'),
                        value: selected.director_phone
                          ? `+998 ${selected.director_phone}`
                          : '—',
                      },
                    ]}
                  />
                  <p className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {t('autodromeAgreementPage.location')}
                  </p>
                  {coords ? (
                    <iframe
                      title={t('autodromeAgreementPage.location')}
                      src={osmEmbed(coords.lat, coords.lng)}
                      className="h-80 w-full rounded-lg border border-mist/70"
                    />
                  ) : (
                    <p className="text-sm text-muted">—</p>
                  )}
                </Panel>
              </div>
            ) : (
              <EmptyState
                description={t('autodromeAgreementPage.selectAutodrome')}
              />
            )}
          </div>
        )}
      </PageMain>
    </>
  )
}
