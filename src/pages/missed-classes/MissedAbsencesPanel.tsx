import { useTranslation } from 'react-i18next'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  Panel,
  Skeleton,
  SkeletonLines,
} from '@/components/ui'
import { pickLocalized, secondsToHms } from '@/features/lessons'
import { useMissedAbsencesQuery } from '@/features/missed-classes'
import { formatDate } from '@/lib/format'

export function MissedAbsencesPanel({ active }: { active: boolean }) {
  const { t, i18n } = useTranslation()
  const { data = [], isLoading, isError } = useMissedAbsencesQuery(active)

  if (!active) return null

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Panel key={i} className="space-y-3 p-3">
            <Skeleton className="h-6 w-28" rounded="md" />
            <SkeletonLines lines={3} />
          </Panel>
        ))}
      </div>
    )
  }

  if (isError) return <ErrorMessage />
  if (data.length === 0) {
    return <EmptyState description={t('missedClasses.emptyAbsences')} />
  }

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_5.5rem_5.5rem_3.5rem] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted sm:grid">
        <span>
          <span className="mr-2 text-muted/80">№</span>
          {t('missedClasses.subject')}
        </span>
        <span>{t('missedClasses.lessons')}</span>
        <span>{t('missedClasses.shortName')}</span>
        <span>{t('missedClasses.timeLimit')}</span>
        <span className="text-right">{t('missedClasses.hours')}</span>
      </div>

      {data.map((item, index) => {
        const handouts = item.handouts ?? []
        return (
          <Panel key={item.id ?? index} className="space-y-3 p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-deep">
                {index + 1}.
              </span>
              <Badge tone="amber">
                {formatDate(item.date_time, i18n.language) ||
                  item.date_time ||
                  '—'}
              </Badge>
            </div>

            {handouts.length === 0 ? (
              <p className="text-sm text-muted">—</p>
            ) : (
              <ul className="space-y-2">
                {handouts.map((handout, hIndex) => {
                  const topic = handout.topic
                  const topicName = pickLocalized(topic?.name, i18n.language)
                  const lessonName = pickLocalized(
                    topic?.lesson?.name,
                    i18n.language,
                  )
                  const shortName = topic?.lesson?.short_name || '—'
                  const limit = topic?.topic_action_limit?.time_limit
                  const hours = handout.hours ?? '—'

                  return (
                    <li
                      key={handout.id ?? hIndex}
                      className="grid gap-1 rounded-lg bg-fog/60 px-2.5 py-2 text-sm sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_5.5rem_5.5rem_3.5rem] sm:items-center sm:gap-2 sm:bg-transparent sm:px-0 sm:py-1"
                    >
                      <div className="min-w-0">
                        <span className="mr-1.5 text-muted">{hIndex + 1}.</span>
                        <span className="text-deep">{topicName || '—'}</span>
                      </div>
                      <div className="min-w-0 text-muted sm:text-deep">
                        <span className="mr-1 text-[10px] font-semibold uppercase text-muted sm:hidden">
                          {t('missedClasses.lessons')}:
                        </span>
                        {lessonName || '—'}
                      </div>
                      <div className="text-muted sm:text-deep">
                        <span className="mr-1 text-[10px] font-semibold uppercase text-muted sm:hidden">
                          {t('missedClasses.shortName')}:
                        </span>
                        {shortName}
                      </div>
                      <div>
                        {limit != null && Number(limit) > 0 ? (
                          <Badge tone="signal" className="w-full justify-center">
                            {secondsToHms(Number(limit))}
                          </Badge>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                      <div className="sm:text-right">
                        <Badge tone="amber" className="min-w-[2.5rem] justify-center">
                          {hours}
                        </Badge>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        )
      })}
    </div>
  )
}
