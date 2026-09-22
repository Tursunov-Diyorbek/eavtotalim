import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  Phone,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import {
  Badge,
  Button,
  Drawer,
  LottiePlayer,
  Skeleton,
} from '@/components/ui'
import { lottieAnimations } from '@/assets/lottie'
import { useAuth } from '@/features/auth'
import { isDirectorRole } from '@/config/roles'
import { TARIFF_PHONE, TARIFF_PHONE_HREF } from '@/config/tariffPlans'
import { cn, formatDate, formatNumber } from '@/lib'
import type { MeLastAgreement } from '@/types'

function StatPill({
  label,
  value,
  danger,
}: {
  label: string
  value: ReactNode
  danger?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl px-2.5 py-2 backdrop-blur-sm ring-1',
        danger ? 'bg-rose/25 ring-rose/40' : 'bg-white/15 ring-white/25',
      )}
    >
      <p className="m-0 truncate text-[9px] font-semibold uppercase tracking-wide text-white/75">
        {label}
      </p>
      <p className="m-0 mt-0.5 text-[15px] font-extrabold tracking-tight text-white">
        {value}
      </p>
    </div>
  )
}

function DetailRow({
  label,
  value,
  hint,
  valueClassName,
  stacked,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  valueClassName?: string
  /** Uzun matn (tavsif): label yuqorida, value pastida */
  stacked?: boolean
}) {
  if (stacked) {
    return (
      <div className="border-b border-mist/60 py-3 last:border-0">
        <p className="m-0 text-[12px] leading-snug text-muted">{label}</p>
        <p
          className={cn(
            'm-0 mt-1 text-[13px] font-semibold leading-snug text-deep',
            valueClassName,
          )}
        >
          {value}
        </p>
      </div>
    )
  }

  return (
    <div className="border-b border-mist/60 py-3 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <span className="min-w-0 flex-[1.2] text-[12px] leading-snug text-muted">
          {label}
        </span>
        <div className="min-w-0 flex-1 text-right">
          <span
            className={cn(
              'block text-[13px] font-bold tabular-nums leading-snug text-deep',
              valueClassName,
            )}
          >
            {value}
          </span>
          {hint ? (
            <span className="mt-0.5 block text-[11px] font-medium leading-snug text-muted">
              {hint}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * Direktor topbar: saytga mos chip + eski chiroyli drawer (gradient hero + Lottie).
 */
export function DirectorTariffPlan() {
  const { t, i18n } = useTranslation()
  const { me, user, loading } = useAuth()
  const [open, setOpen] = useState(false)

  const isDirector = isDirectorRole(user)
  const org = me?.profession?.organization
  const agreements = org?.agreements ?? []
  const lastId = org?.last_agreement?.id ?? null

  const [selectedId, setSelectedId] = useState<number | null>(lastId)

  useEffect(() => {
    if (!open) return
    setSelectedId(
      agreements.length > 0
        ? (agreements[agreements.length - 1]?.id ?? lastId)
        : lastId,
    )
  }, [open, agreements, lastId])

  const lastAgreement = org?.last_agreement
  const selectedAgreement: MeLastAgreement | null = useMemo(() => {
    if (selectedId == null) return lastAgreement ?? null
    return agreements.find((a) => a.id === selectedId) ?? lastAgreement ?? null
  }, [selectedId, agreements, lastAgreement])

  if (!isDirector) return null

  const report = org?.report
  const agreementType = lastAgreement?.agreement_type ?? org?.agreement_type
  const tarifName = agreementType?.name_uz || t('tariff.base')

  const studentsLimitCount = Number(org?.sum_students_from_agreements ?? 0)
  const limitStudents = Number(
    report?.limit_students_count ?? studentsLimitCount ?? 0,
  )
  const allStudentsCount = Number(report?.students_count ?? 0)
  const unpaidStudents = Number(report?.unpaid_students_count ?? 0)
  const usedLimit = Number(report?.used_limit_count ?? 0)
  const remainder = Number(report?.students_agreement_limit_remainder ?? 0)
  const limitDisplay = limitStudents || studentsLimitCount

  const isLatest =
    selectedAgreement != null &&
    (agreements.length === 0 ||
      selectedAgreement.id === agreements[agreements.length - 1]?.id ||
      selectedAgreement.id === lastAgreement?.id)

  const amountPerStudent =
    selectedAgreement?.agreement_type?.amount_per_student ??
    agreementType?.amount_per_student ??
    0

  const selectedLimit = Number(
    isLatest ? limitStudents : (selectedAgreement?.students_count ?? 0),
  )
  const showOverLimitArt = isLatest && unpaidStudents > 0

  return (
    <>
      {/* Topbar chip — saytga mos (o‘zgarmagan) */}
      {loading && !me ? (
        <Skeleton className="hidden h-8 w-52 rounded-lg lg:block" />
      ) : (
        <button
          type="button"
          title={t('tariff.clickForDetails')}
          onClick={() => setOpen(true)}
          className={cn(
            'group hidden h-8 max-w-[min(400px,44vw)] items-center gap-1.5 rounded-md border border-transparent bg-transparent px-1.5 text-left transition',
            'hover:border-mist/70 hover:bg-fog/70',
            'lg:inline-flex',
          )}
        >
          <Badge tone="amber" className="shrink-0">
            {tarifName}
          </Badge>
          <span className="min-w-0 truncate text-[11px] text-muted">
            <span className="font-medium text-deep">{limitDisplay}</span>
            <span className="mx-1 text-mist">/</span>
            <span className="font-medium text-deep">{allStudentsCount}</span>
            <span className="mx-1 text-mist">/</span>
            <span
              className={cn(
                'font-medium',
                remainder < 0 ? 'text-rose' : 'text-deep',
              )}
            >
              {remainder}
            </span>
            <span className="ml-0.5">{t('tariff.pcs')}</span>
          </span>
          <ChevronRight
            className="ml-auto size-3.5 shrink-0 text-muted/80 transition group-hover:text-signal"
            aria-hidden
          />
        </button>
      )}

      <button
        type="button"
        title={t('tariff.yourPlan')}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-transparent bg-transparent px-1.5 hover:bg-fog/70 lg:hidden"
      >
        <Badge tone="amber">{tarifName}</Badge>
        <span
          className={cn(
            'text-[11px] font-semibold',
            remainder < 0 ? 'text-rose' : 'text-deep',
          )}
        >
          {remainder}
        </span>
        <ChevronRight className="size-3 text-muted" aria-hidden />
      </button>

      {/* Drawer — eski chiroyli dizayn */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        hideHeader
        side="right"
        widthClassName="max-w-[420px]"
        bodyClassName="overflow-y-auto p-0"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {agreements.map((item, index) => {
              const active = selectedId === item.id
              const isLast = index === agreements.length - 1
              return (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={active ? 'soft' : 'ghost'}
                  className={cn(
                    active && 'ring-1 ring-signal/25',
                    isLast && !active && 'text-teal hover:bg-teal-soft',
                    isLast && active && 'bg-teal-soft text-teal ring-teal/30',
                  )}
                  onClick={() => setSelectedId(item.id)}
                >
                  {index + 1} — {t('tariff.contract')}
                </Button>
              )
            })}
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => setOpen(false)}
            >
              {t('common.close')}
            </Button>
          </div>
        }
      >
        <div className="relative overflow-hidden bg-linear-to-b from-signal via-signal to-deep px-5 pb-5 pt-4 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 left-0 size-32 rounded-full bg-teal/30 blur-2xl" />

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div>
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                {t('tariff.yourPlan')}
              </p>
              <h2 className="font-display m-0 mt-1 text-2xl font-extrabold tracking-tight">
                {isLatest
                  ? tarifName
                  : selectedAgreement?.agreement_type?.name_uz || tarifName}
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-white hover:bg-white/15"
              onClick={() => setOpen(false)}
              aria-label={t('common.close')}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="relative z-10 -mx-2 flex justify-center">
            <LottiePlayer
              animationData={
                showOverLimitArt
                  ? lottieAnimations.outOfLimit
                  : lottieAnimations.tariff
              }
              size={280}
              play={open}
              className="max-w-full"
            />
          </div>

          {isLatest ? (
            <div className="relative z-10 mt-1 grid grid-cols-3 gap-2">
              <StatPill
                label={t('tariff.studentLimit')}
                value={selectedLimit}
              />
              <StatPill
                label={t('tariff.remainder')}
                value={remainder}
                danger={remainder < 0}
              />
              <StatPill
                label={t('tariff.exceeded')}
                value={unpaidStudents}
                danger={unpaidStudents > 0}
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-signal">
              {t('tariff.fullInfo')}
            </h3>

            <div className="mt-3 rounded-2xl border border-mist/80 bg-white px-4 py-1 shadow-sm">
              {isLatest ? (
                <>
                  <DetailRow
                    label={t('tariff.name')}
                    value={tarifName}
                    valueClassName="text-signal"
                  />
                  {agreementType?.description ? (
                    <DetailRow
                      stacked
                      label={t('tariff.description')}
                      value={agreementType.description}
                    />
                  ) : null}
                  <DetailRow
                    label={t('tariff.studentLimit')}
                    value={`${selectedLimit} ${t('tariff.pcs')}`}
                    valueClassName="text-signal"
                  />
                  <DetailRow
                    label={t('tariff.usedLimit')}
                    value={`${usedLimit} ${t('tariff.pcs')}`}
                    valueClassName="text-signal"
                  />
                  <DetailRow
                    label={t('tariff.remainder')}
                    value={`${remainder} ${t('tariff.pcs')}`}
                    valueClassName={remainder < 0 ? 'text-rose' : 'text-signal'}
                  />
                  <DetailRow
                    label={t('tariff.allStudents')}
                    value={`${allStudentsCount} ${t('tariff.pcs')}`}
                    valueClassName="text-signal"
                  />
                  <DetailRow
                    label={t('tariff.exceeded')}
                    value={`${unpaidStudents} ${t('tariff.pcs')}`}
                    valueClassName="text-rose"
                  />
                  <DetailRow
                    label={t('tariff.paymentAmount')}
                    value={formatNumber(amountPerStudent)}
                    hint={t('tariff.soumsPerStudent')}
                    valueClassName="text-amber"
                  />
                </>
              ) : selectedAgreement ? (
                <>
                  <DetailRow
                    label={t('tariff.name')}
                    value={selectedAgreement.agreement_type?.name_uz || '—'}
                    valueClassName="text-signal"
                  />
                  <DetailRow
                    label={t('tariff.studentLimit')}
                    value={`${selectedLimit} ${t('tariff.pcs')}`}
                    valueClassName="text-signal"
                  />
                  <DetailRow
                    label={t('tariff.paymentAmount')}
                    value={formatNumber(
                      selectedAgreement.amount ?? amountPerStudent,
                    )}
                    hint={t('tariff.soumsPerStudent')}
                    valueClassName="text-amber"
                  />
                  {selectedAgreement.date ? (
                    <DetailRow
                      label={t('common.date')}
                      value={
                        formatDate(selectedAgreement.date, i18n.language) ?? '—'
                      }
                    />
                  ) : null}
                </>
              ) : (
                <p className="m-0 py-3 text-sm text-muted">{t('common.noData')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5 rounded-2xl border border-mist/80 bg-fog/60 px-3 py-2.5">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-signal-soft text-signal">
                <Users className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[10px] font-medium leading-tight text-muted">
                  {t('tariff.allStudents')}
                </p>
                <p className="m-0 mt-0.5 text-[15px] font-bold tabular-nums leading-none text-deep">
                  {isLatest ? allStudentsCount : selectedLimit}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-mist/80 bg-fog/60 px-3 py-2.5">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-soft text-amber">
                <Wallet className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[10px] font-medium leading-tight text-muted">
                  {t('tariff.paymentAmount')}
                </p>
                <p className="m-0 mt-0.5 truncate text-[15px] font-bold tabular-nums leading-none text-deep">
                  {formatNumber(
                    isLatest
                      ? amountPerStudent
                      : (selectedAgreement?.amount ?? amountPerStudent),
                  )}
                </p>
              </div>
            </div>
          </div>

          <a
            href={TARIFF_PHONE_HREF}
            className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-fog to-signal-soft/50 px-3.5 py-3 text-[12px] text-deep ring-1 ring-mist/80 transition hover:ring-signal/30"
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-signal text-white shadow-sm">
              <Phone className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block leading-snug text-muted">
                {t('tariff.contactHint')}
              </span>
              <span className="mt-0.5 block font-bold tabular-nums text-signal">
                {TARIFF_PHONE}
              </span>
            </span>
          </a>
        </div>
      </Drawer>
    </>
  )
}
