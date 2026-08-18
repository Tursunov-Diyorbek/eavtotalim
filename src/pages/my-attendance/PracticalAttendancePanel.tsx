import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, EmptyState, ErrorMessage, Skeleton, Table, TBody, TD, TH, THead, TR } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { usePracticalAttendanceQuery } from '@/features/my-attendance'
import type { BadgeTone } from '@/components/ui'

function statusMeta(
  status: string | null | undefined,
  t: (k: string) => string,
): { label: string; tone: BadgeTone } {
  if (status === 'verified') {
    return { label: t('myAttendance.statusVerified'), tone: 'indigo' }
  }
  if (status === 'confirmed') {
    return { label: t('myAttendance.statusConfirmed'), tone: 'signal' }
  }
  return { label: t('myAttendance.statusRejected'), tone: 'rose' }
}

export function PracticalAttendancePanel({ active }: { active: boolean }) {
  const { t, i18n } = useTranslation()
  const { data = [], isLoading, isError } = usePracticalAttendanceQuery(active)

  const rows = useMemo(() => data, [data])

  if (!active) return null

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" rounded="lg" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorMessage />
  if (rows.length === 0) {
    return <EmptyState description={t('myAttendance.emptyPractical')} />
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH>{t('myAttendance.participationDate')}</TH>
          <TH className="w-36">{t('myAttendance.approved')}</TH>
          <TH className="w-44">{t('myAttendance.approvedBy')}</TH>
          <TH className="w-32">{t('myAttendance.status')}</TH>
        </TR>
      </THead>
      <TBody>
        {rows.map((item, index) => {
          const st = statusMeta(item.status, t)
          return (
            <TR key={item.id ?? index}>
              <TD>
                <Badge tone="signal">
                  {[item.attendance_date, item.attendance_time]
                    .filter(Boolean)
                    .join(' — ') || '—'}
                </Badge>
              </TD>
              <TD className="text-[12px] text-muted">
                {formatDateTime(item.confirmed_at, i18n.language) ||
                  item.confirmed_at ||
                  '—'}
              </TD>
              <TD>
                {typeof item.confirmed_by === 'object'
                  ? item.confirmed_by?.name || '—'
                  : item.confirmed_by || '—'}
              </TD>
              <TD>
                <Badge tone={st.tone}>{st.label}</Badge>
              </TD>
            </TR>
          )
        })}
      </TBody>
    </Table>
  )
}
