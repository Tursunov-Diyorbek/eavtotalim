import { useTranslation } from 'react-i18next'
import { ChartColumn, FlaskConical } from 'lucide-react'
import { Badge, EmptyState, Modal, Skeleton, Tabs } from '@/components/ui'
import { useGaiRatingQuery } from '@/features/dashboard'
import { cn } from '@/lib/cn'
import type { GaiRatingStats } from '@/types'

const DETAIL_KEYS = [
  'graduated',
  'exam_taken',
  'passed',
  'total',
  'oliy_phd_yoki_dsi',
  'oliy',
  'orta',
  'orta_maxsus',
  'fines_count',
  'penalty_score',
  'guilty_accidents',
] as const

const CATEGORY = {
  green: {
    stroke: 'var(--color-teal)',
    text: 'text-teal',
    soft: 'bg-teal-soft',
    border: 'border-teal/30',
    bar: 'bg-teal',
  },
  yellow: {
    stroke: 'var(--color-amber)',
    text: 'text-amber',
    soft: 'bg-amber-soft',
    border: 'border-amber/30',
    bar: 'bg-amber',
  },
  red: {
    stroke: 'var(--color-rose)',
    text: 'text-rose',
    soft: 'bg-rose-soft',
    border: 'border-rose/30',
    bar: 'bg-rose',
  },
} as const

const MONTHS: Record<string, string[]> = {
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  kiril: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентабр', 'Октабр', 'Ноябр', 'Декабр'],
}

function formatScore(value: unknown) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

export function formatBadgeScore(value: unknown) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  const rounded = Math.round(n * 100) / 100
  return String(rounded)
}

function periodLabel(start: string | null | undefined, end: string | null | undefined, lang: string) {
  if (!start || !end) return ''
  const from = new Date(start.replace(' ', 'T'))
  const to = new Date(end.replace(' ', 'T'))
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return ''
  const months = MONTHS[lang] ?? MONTHS.uz
  return `${from.getFullYear()}, ${from.getDate()}-${months[from.getMonth()]} — ${to.getDate()}-${months[to.getMonth()]}`
}

function ScoreRing({ value, color }: { value: number; color: string }) {
  const size = 168
  const stroke = 12
  const radius = (size - stroke) / 2
  const length = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, value / 100))
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-fog)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${length * pct} ${length}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--color-deep)"
        fontSize="30"
        fontWeight="650"
      >
        {formatScore(value)}
      </text>
      <text
        x="50%"
        y="64%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--color-muted)"
        fontSize="13"
      >
        / 100
      </text>
    </svg>
  )
}

type GaiRatingModalProps = {
  open: boolean
  year: number
  period: 1 | 2
  onPeriodChange: (period: 1 | 2) => void
  onClose: () => void
}

export function GaiRatingModal({
  open,
  year,
  period,
  onPeriodChange,
  onClose,
}: GaiRatingModalProps) {
  const { t, i18n } = useTranslation()
  const query = useGaiRatingQuery(year, period, open)
  const data = query.data
  const tone = CATEGORY[data?.category === 'yellow' || data?.category === 'red' ? data.category : 'green']
  const label = periodLabel(data?.period_start_date, data?.period_end_date, i18n.language)

  return (
    <Modal
      open={open}
      onClose={onClose}
      sizeClassName="max-w-6xl"
      title={
        <span className="inline-flex flex-wrap items-center gap-2">
          <ChartColumn className="size-4 text-signal" aria-hidden />
          <span>
            {t('dashboard.ratingTitle')}
            {label ? ` (${label})` : ''}
          </span>
          <Badge tone="amber">{t('dashboard.testMode')}</Badge>
        </span>
      }
    >
      <div className="mb-3 flex gap-2 rounded-xl border border-amber/30 bg-amber-soft px-3 py-2.5">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-deep">{t('dashboard.ratingTestTitle')}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink">{t('dashboard.ratingTestText')}</p>
        </div>
      </div>

      {query.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !data ? (
        <div className="space-y-3">
          <EmptyState description={t('dashboard.noRating')} />
          <PeriodTabs period={period} onPeriodChange={onPeriodChange} />
        </div>
      ) : (
        <RatingBody data={data} tone={tone} period={period} onPeriodChange={onPeriodChange} />
      )}
    </Modal>
  )
}

function PeriodTabs({
  period,
  onPeriodChange,
}: {
  period: 1 | 2
  onPeriodChange: (period: 1 | 2) => void
}) {
  const { t } = useTranslation()
  return (
    <Tabs
      size="sm"
      aria-label={t('dashboard.ratingTitle')}
      value={String(period)}
      onChange={(value) => onPeriodChange(value === '2' ? 2 : 1)}
      items={[
        { value: '1', label: t('dashboard.period1') },
        { value: '2', label: t('dashboard.period2') },
      ]}
    />
  )
}

function RatingBody({
  data,
  tone,
  period,
  onPeriodChange,
}: {
  data: GaiRatingStats
  tone: (typeof CATEGORY)[keyof typeof CATEGORY]
  period: 1 | 2
  onPeriodChange: (period: 1 | 2) => void
}) {
  const { t } = useTranslation()
  const criteria = data.criteria ?? []

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[190px_minmax(0,1fr)]">
      <div className="flex flex-col items-center gap-2">
        <ScoreRing value={Number(data.total_score) || 0} color={tone.stroke} />
        <p className="text-sm font-medium text-deep">{t('dashboard.totalScore')}</p>
        {data.category_label ? (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold',
              tone.text,
              tone.soft,
              tone.border,
            )}
          >
            <span className={cn('size-1.5 rounded-full', tone.bar)} />
            {data.category_label}
          </span>
        ) : null}
        <PeriodTabs period={period} onPeriodChange={onPeriodChange} />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {criteria.map((item, index) => {
          const score = Number(item.score) || 0
          const max = Number(item.max_score) || 0
          const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((score / max) * 100))) : 0
          const details = orderedDetails(item.details)
          return (
            <div key={item.code ?? index} className="rounded-xl border border-mist/70 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-fog text-[11px] font-semibold text-deep">
                    {index + 1}
                  </span>
                  <span className="truncate text-[13px] font-medium text-deep" title={item.title ?? ''}>
                    {item.title || '—'}
                  </span>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-deep">
                  {formatScore(score)}
                  <span className="text-xs font-medium text-muted">/{max || '—'}</span>
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fog">
                <div className={cn('h-full rounded-full', tone.bar)} style={{ width: `${pct}%` }} />
              </div>
              {details.length > 0 ? (
                <div
                  className="mt-2 grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${details.length}, minmax(0, 1fr))` }}
                >
                  {details.map((row) => (
                    <div key={row.key} className="rounded-lg bg-fog/80 px-1.5 py-1.5 text-center">
                      <div className="text-sm font-semibold tabular-nums text-deep">{row.value}</div>
                      <div className="text-[10px] leading-tight text-muted">
                        {t(`dashboard.gai_${row.key}`, { defaultValue: row.key })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function orderedDetails(details: Record<string, number | string | null> | null | undefined) {
  if (!details) return []
  const keys = Object.keys(details).sort((a, b) => {
    const ai = DETAIL_KEYS.indexOf(a as (typeof DETAIL_KEYS)[number])
    const bi = DETAIL_KEYS.indexOf(b as (typeof DETAIL_KEYS)[number])
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  return keys.map((key) => ({ key, value: details[key] ?? '—' }))
}
