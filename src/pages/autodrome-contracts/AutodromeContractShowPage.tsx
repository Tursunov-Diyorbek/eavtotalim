import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Check, FileText, X } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  DetailList,
  ErrorMessage,
  Modal,
  Panel,
  SafeImage,
  SkeletonLines,
  Textarea,
  notify,
} from '@/components/ui'
import { routes } from '@/config'
import { fetchDistricts, fetchRegions, queryKeys } from '@/api'
import {
  useAcceptAgreementMutation,
  useAutodromeAgreementQuery,
  useRejectAgreementMutation,
} from '@/features/autodrome-agreement'
import { useSmartBack } from '@/hooks'
import { formatDate } from '@/lib/format'
import { contractStatusId, contractStatusTone } from './status'

function named(
  list: { id: number; name?: string | null }[] | undefined,
  id: unknown,
) {
  const value = Number(id)
  if (!value) return '—'
  return list?.find((item) => item.id === value)?.name || '—'
}

function dateText(value: string | null | undefined, lang: string) {
  if (!value) return '—'
  const dmy = value.match(/^(\d{2})[-.](\d{2})[-.](\d{4})/)
  if (dmy) return `${dmy[1]}.${dmy[2]}.${dmy[3]}`
  return formatDate(value, lang) ?? '—'
}

function phoneText(value?: string | null) {
  const raw = value?.trim()
  if (!raw) return '—'
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 9) {
    return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    const local = digits.slice(3)
    return `+998 (${local.slice(0, 2)}) ${local.slice(2, 5)}-${local.slice(5, 7)}-${local.slice(7)}`
  }
  return raw
}

export function AutodromeContractShowPage() {
  const { t, i18n } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.agreements)
  const query = useAutodromeAgreementQuery(id)
  const acceptMutation = useAcceptAgreementMutation()
  const rejectMutation = useRejectAgreementMutation()
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const data = query.data
  const director = data?.organization?.director
  const status = data ? contractStatusId(data) : 0
  const pending = status === 1

  const regions = useQuery({
    queryKey: queryKeys.students.regions(),
    queryFn: fetchRegions,
    enabled: Boolean(data),
    staleTime: 10 * 60 * 1000,
  })
  const districts = useQuery({
    queryKey: queryKeys.students.districts(String(director?.region_id ?? '')),
    queryFn: () => fetchDistricts(String(director?.region_id ?? '')),
    enabled: Boolean(director?.region_id),
  })

  const onError = (err: Error) => notify.error(err.message || t('common.loadError'))
  const done = () => {
    notify.success(t('common.saved'))
    navigate(routes.agreements)
  }

  const sendReject = () => {
    if (!data) return
    const text = reason.trim()
    if (!text) {
      notify.error(t('autodromeContractsPage.reasonRequired'))
      return
    }
    rejectMutation.mutate(
      { id: data.id, reason: text },
      {
        onSuccess: () => {
          setRejectOpen(false)
          setReason('')
          done()
        },
        onError,
      },
    )
  }

  return (
    <>
      <Header
        title={t('autodromeContractsPage.showTitle')}
        onBack={goBack}
        actions={
          data ? (
            <>
              {data.file ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(data.file!, '_blank', 'noopener,noreferrer')}
                >
                  <FileText className="size-3.5" aria-hidden />
                  {t('autodromeContractsPage.viewFile')}
                </Button>
              ) : null}
              <Badge tone={contractStatusTone(status)}>
                {data.organization_autodrome_agreement_status?.title || '—'}
              </Badge>
            </>
          ) : null
        }
      />
      <PageMain>
        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <SkeletonLines lines={8} />
        ) : !data ? (
          <ErrorMessage />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel padding="md" className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wide text-deep uppercase">
                {t('autodromeContractsPage.director')}
              </h2>
              <div className="flex gap-4">
                <SafeImage
                  src={director?.image}
                  alt={director?.last_name || ''}
                  size="xl"
                  fit="contain"
                  label={t('common.noImage')}
                  className="size-28 shrink-0 rounded-2xl border border-mist/80"
                />
                <DetailList
                  className="min-w-0 flex-1 sm:grid-cols-2"
                  items={[
                    {
                      label: t('autodromeContractsPage.lastName'),
                      value: director?.last_name,
                    },
                    {
                      label: t('autodromeContractsPage.firstName'),
                      value: director?.first_name,
                    },
                    {
                      label: t('autodromeContractsPage.middleName'),
                      value: director?.middle_name,
                    },
                    {
                      label: t('autodromeContractsPage.birthday'),
                      value: dateText(director?.birthday, i18n.language),
                    },
                    {
                      label: t('autodromeContractsPage.phone'),
                      value: phoneText(director?.phone),
                    },
                  ]}
                />
              </div>
              <DetailList
                items={[
                  {
                    label: t('autodromeContractsPage.region'),
                    value: named(regions.data, director?.region_id),
                  },
                  {
                    label: t('autodromeContractsPage.district'),
                    value: named(districts.data, director?.area_id),
                  },
                  {
                    label: t('autodromeContractsPage.address'),
                    value: director?.address,
                  },
                ]}
              />
            </Panel>

            <Panel padding="md" className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wide text-deep uppercase">
                {t('autodromeContractsPage.organization')}
              </h2>
              <DetailList
                items={[
                  {
                    label: t('autodromeContractsPage.orgName'),
                    value: data.organization?.name,
                  },
                  {
                    label: t('autodromeContractsPage.inn'),
                    value: data.organization?.inn,
                  },
                  {
                    label: t('autodromeContractsPage.address'),
                    value: data.organization?.address,
                  },
                ]}
              />
              {pending ? (
                <div className="space-y-3 border-t border-mist/70 pt-4">
                  <h3 className="text-sm font-semibold tracking-wide text-deep uppercase">
                    {t('autodromeContractsPage.decide')}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="!text-teal"
                      onClick={() => setAcceptOpen(true)}
                    >
                      <Check className="size-4" aria-hidden />
                      {t('autodromeContractsPage.accept')}
                    </Button>
                    <Button variant="outline" className="!text-rose" onClick={() => setRejectOpen(true)}>
                      <X className="size-4" aria-hidden />
                      {t('autodromeContractsPage.cancel')}
                    </Button>
                  </div>
                </div>
              ) : null}
            </Panel>
          </div>
        )}
      </PageMain>

      <ConfirmDialog
        open={acceptOpen}
        loading={acceptMutation.isPending}
        title={t('autodromeContractsPage.accept')}
        question={t('autodromeContractsPage.acceptConfirm')}
        confirmLabel={t('autodromeContractsPage.accept')}
        onClose={() => setAcceptOpen(false)}
        onConfirm={() => {
          if (!data) return
          acceptMutation.mutate(data.id, {
            onSuccess: () => {
              setAcceptOpen(false)
              done()
            },
            onError,
          })
        }}
      />

      <Modal
        open={rejectOpen}
        onClose={() => {
          if (rejectMutation.isPending) return
          setRejectOpen(false)
        }}
        title={t('autodromeContractsPage.rejectTitle')}
        sizeClassName="max-w-lg"
      >
        <Textarea
          id="contract-reject-reason"
          name="contract-reject-reason"
          label={t('autodromeContractsPage.reason')}
          value={reason}
          rows={5}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={rejectMutation.isPending}
            onClick={() => setRejectOpen(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={rejectMutation.isPending}
            onClick={sendReject}
          >
            {t('autodromeContractsPage.send')}
          </Button>
        </div>
      </Modal>
    </>
  )
}
