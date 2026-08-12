import { useTranslation } from 'react-i18next'
import { Badge, Skeleton } from '@/components/ui'
import { sanitizePenaltyHtml } from '@/features/penalties'
import type { PenaltyAmountItem, PenaltyDetail } from '@/types'

type Props = {
  data: PenaltyDetail | null | undefined
  loading?: boolean
}

function isRangeType(v: number | null | undefined) {
  return v === 0 || v === 1
}

type AmountSectionProps = {
  amountType?: number | null
  amountFrom?: string | number | null
  amountTo?: string | number | null
  driveType?: number | null
  driveFrom?: string | number | null
  driveTo?: string | number | null
  prisonType?: number | null
  prisonFrom?: string | number | null
  prisonTo?: string | number | null
  area?: number | null
  additional?: string | null
}

function AmountSection({
  amountType,
  amountFrom,
  amountTo,
  driveType,
  driveFrom,
  driveTo,
  prisonType,
  prisonFrom,
  prisonTo,
  area,
  additional,
}: AmountSectionProps) {
  const { t } = useTranslation()
  const lines: string[] = []

  if (isRangeType(amountType)) {
    if (amountType === 0) {
      lines.push(t('penalties.amountFixed', { n: amountFrom ?? '—' }))
    } else {
      lines.push(
        t('penalties.amountRange', {
          from: amountFrom ?? '—',
          to: amountTo ?? '—',
        }),
      )
    }
  }

  if (isRangeType(driveType)) {
    if (driveType === 0) {
      lines.push(t('penalties.driveFixed', { n: driveFrom ?? '—' }))
    } else {
      lines.push(
        t('penalties.driveRange', {
          from: driveFrom ?? '—',
          to: driveTo ?? '—',
        }),
      )
    }
  }

  if (isRangeType(prisonType)) {
    if (prisonType === 0) {
      lines.push(t('penalties.prisonFixed', { n: prisonFrom ?? '—' }))
    } else {
      lines.push(
        t('penalties.prisonRange', {
          from: prisonFrom ?? '—',
          to: prisonTo ?? '—',
        }),
      )
    }
  }

  return (
    <div className="space-y-2">
      {lines.length > 0 ? (
        <ul className="list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-ink">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}
      {area === 1 ? (
        <Badge tone="amber">{t('penalties.penaltyArea')}</Badge>
      ) : null}
      {additional ? (
        <p className="text-[13px] text-muted">
          <span className="font-semibold text-deep">{t('penalties.comment')}: </span>
          {additional}
        </p>
      ) : null}
    </div>
  )
}

function personAmountProps(item: PenaltyAmountItem): AmountSectionProps {
  return {
    amountType: item.ph_per_amount_type,
    amountFrom: item.ph_per_amount_from,
    amountTo: item.ph_per_amount_to,
    driveType: item.ph_per_deprivation_driver_type,
    driveFrom: item.ph_per_deprivation_driver_from,
    driveTo: item.ph_per_deprivation_driver_to,
    prisonType: item.ph_per_imprisonment_type,
    prisonFrom: item.ph_per_imprisonment_from,
    prisonTo: item.ph_per_imprisonment_to,
    area: item.ph_per_penalty_area,
    additional: item.ph_additional,
  }
}

function legalAmountProps(item: PenaltyAmountItem): AmountSectionProps {
  return {
    amountType: item.leg_per_amount_type,
    amountFrom: item.leg_per_amount_from,
    amountTo: item.leg_per_amount_to,
    driveType: item.leg_per_deprivation_driver_type,
    driveFrom: item.leg_per_deprivation_driver_from,
    driveTo: item.leg_per_deprivation_driver_to,
    prisonType: item.leg_per_imprisonment_type,
    prisonFrom: item.leg_per_imprisonment_from,
    prisonTo: item.leg_per_imprisonment_to,
    area: item.leg_per_penalty_area,
    additional: item.leg_additional,
  }
}

/** Modal ichidagi jarima tafsiloti. */
export function PenaltyDetailBody({ data, loading }: Props) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-20 w-full" rounded="lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-center text-sm text-muted">{t('penalties.noDetail')}</p>
    )
  }

  const vehicleTags: Array<{
    key: string
    label: string
    tone: 'signal' | 'indigo' | 'teal' | 'violet'
  }> = []
  if (data.for_cars === 1) {
    vehicleTags.push({
      key: 'cars',
      label: t('penalties.lightVehicles'),
      tone: 'signal',
    })
  }
  if (data.for_truck === 1) {
    vehicleTags.push({
      key: 'truck',
      label: t('penalties.heavyVehicles'),
      tone: 'indigo',
    })
  }
  if (data.for_motorcycle === 1) {
    vehicleTags.push({
      key: 'moto',
      label: t('penalties.motorcycles'),
      tone: 'teal',
    })
  }
  if (data.for_public_transport === 1) {
    vehicleTags.push({
      key: 'public',
      label: t('penalties.publicTransport'),
      tone: 'violet',
    })
  }

  const clauses = data.penalties ?? []

  return (
    <div className="space-y-4">
      {data.article != null && String(data.article) !== '' ? (
        <p className="text-sm font-semibold text-deep">
          {data.article} — {t('penalties.article')}
        </p>
      ) : null}

      {data.body ? (
        <div
          className="lesson-html text-[14px] leading-relaxed text-ink"
          dangerouslySetInnerHTML={{ __html: sanitizePenaltyHtml(data.body) }}
        />
      ) : null}

      {vehicleTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {vehicleTags.map((tag) => (
            <Badge key={tag.key} tone={tag.tone}>
              {tag.label}
            </Badge>
          ))}
        </div>
      ) : null}

      {clauses.length === 0 ? (
        <p className="text-sm text-muted">{t('penalties.noAmounts')}</p>
      ) : (
        <div className="space-y-3">
          {clauses.map((item, index) => (
            <div
              key={item.id ?? index}
              className="rounded-xl border border-mist/80 bg-fog/40 p-3 sm:p-4"
            >
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[12px] font-bold text-signal">
                  {index + 1} — {t('penalties.clause')}
                </span>
                <span className="text-[12px] font-medium text-muted">
                  {item.type_id === 2
                    ? t('penalties.forIndividualsAndLegal')
                    : t('penalties.forIndividuals')}
                </span>
              </div>
              <AmountSection {...personAmountProps(item)} />

              {item.type_id === 1 ? (
                <div className="mt-3 border-t border-mist/70 pt-3">
                  <p className="mb-2 text-[12px] font-semibold text-deep">
                    {index + 1} — {t('penalties.clause')} ({t('penalties.forLegal')})
                  </p>
                  <AmountSection {...legalAmountProps(item)} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
