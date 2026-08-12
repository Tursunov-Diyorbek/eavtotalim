import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckSquare,
  List,
  Phone,
  Play,
  XSquare,
  ClipboardList,
} from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  ErrorMessage,
  Notification,
  Panel,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import {
  parsePercent,
  RANDOM_LIMITS,
  useRandomTestLatestQuery,
} from '@/features/random-tests'
import { formatDateTime, fullNameOf } from '@/lib/format'
import { cn } from '@/lib/cn'
import { StartRandomTestModal } from './StartRandomTestModal'

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string | number
  icon: ReactNode
  tone: 'teal' | 'rose' | 'amber' | 'indigo'
}) {
  const tones = {
    teal: 'border-teal/30 bg-teal-soft/40 text-teal',
    rose: 'border-rose/30 bg-rose-soft/40 text-rose',
    amber: 'border-amber/30 bg-amber-soft/40 text-amber',
    indigo: 'border-indigo/30 bg-indigo-soft/40 text-indigo',
  }
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5',
        tones[tone],
      )}
    >
      <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-semibold">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 text-sm font-bold text-deep">{value}</span>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <SkeletonCard className="space-y-3 p-4 lg:col-span-2">
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </SkeletonCard>
      <SkeletonCard className="space-y-3 p-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-10 w-full" />
      </SkeletonCard>
    </div>
  )
}

export function RandomTestsPage() {
  const { t, i18n } = useTranslation()
  const { me, user } = useAuth()
  const [limit, setLimit] = useState<1 | 2 | 3>(1)
  const [modalOpen, setModalOpen] = useState(false)

  const hasComfort = Boolean(me?.organization_has_comfort_plan)
  const orgPhone = me?.profession?.organization?.phone

  const { data, isLoading, isError } = useRandomTestLatestQuery(hasComfort)

  const userName =
    fullNameOf(me?.profession ?? {}) || user?.username || undefined

  const correct = data?.correct_answers_count ?? 0
  const incorrect = data?.incorrect_answers_count ?? 0
  const totalDone = correct + incorrect
  const questionCount = data?.question_count ?? 0
  const percent = parsePercent(data?.percent)

  if (!hasComfort) {
    return (
      <>
        <Header
          title={t('randomTests.title')}
          description={t('randomTests.description')}
        />
        <main className="flex-1 p-3 sm:p-4">
          <Notification tone="warning" title={t('randomTests.contractTitle')}>
            <p className="m-0">{t('randomTests.contractText')}</p>
            {orgPhone ? (
              <p className="mt-3 mb-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-deep">
                <Phone className="size-3.5 text-signal" aria-hidden />
                {orgPhone}
              </p>
            ) : (
              <p className="mt-3 mb-0 text-[13px] text-muted">
                {t('randomTests.contactOrg')}
              </p>
            )}
          </Notification>
        </main>
      </>
    )
  }

  return (
    <>
      <Header title={t('randomTests.title')} />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        <Notification tone="info">{t('randomTests.hint')}</Notification>

        {isLoading ? (
          <PageSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            <Panel padding="md" className="space-y-3 lg:col-span-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <StatCard
                  tone="teal"
                  label={t('randomTests.correct')}
                  value={correct}
                  icon={<CheckSquare className="size-4 shrink-0" />}
                />
                <StatCard
                  tone="rose"
                  label={t('randomTests.incorrect')}
                  value={incorrect}
                  icon={<XSquare className="size-4 shrink-0" />}
                />
                <StatCard
                  tone="amber"
                  label={t('randomTests.totalDone')}
                  value={totalDone}
                  icon={<ClipboardList className="size-4 shrink-0" />}
                />
                <StatCard
                  tone="indigo"
                  label={t('randomTests.totalQuestions')}
                  value={questionCount}
                  icon={<List className="size-4 shrink-0" />}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-fog/80 px-3 py-2.5">
                  <p className="m-0 text-[11px] text-muted">
                    {t('randomTests.createdAt')}
                  </p>
                  <p className="m-0 mt-0.5 text-[13px] font-medium text-deep">
                    {data?.created_at
                      ? formatDateTime(data.created_at, i18n.language)
                      : t('randomTests.noData')}
                  </p>
                </div>
                <div className="rounded-lg bg-fog/80 px-3 py-2.5">
                  <p className="m-0 text-[11px] text-muted">
                    {t('randomTests.updatedAt')}
                  </p>
                  <p className="m-0 mt-0.5 text-[13px] font-medium text-deep">
                    {data?.updated_at
                      ? formatDateTime(data.updated_at, i18n.language)
                      : t('randomTests.noData')}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel padding="md" className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-1.5">
                {RANDOM_LIMITS.map((item) => (
                  <Button
                    key={item.value}
                    type="button"
                    size="sm"
                    variant={limit === item.value ? 'primary' : 'outline'}
                    className="w-full px-1"
                    onClick={() => setLimit(item.value)}
                  >
                    {t('randomTests.questionsN', { count: item.count })}
                  </Button>
                ))}
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
                  <span>{t('randomTests.result')}</span>
                  <span className="font-semibold text-deep">{percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-mist/80">
                  <div
                    className="h-full rounded-full bg-signal transition-[width]"
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                className="mt-auto w-full"
                onClick={() => setModalOpen(true)}
              >
                <Play className="size-3.5" aria-hidden />
                {t('randomTests.startNew')}
              </Button>
            </Panel>
          </div>
        )}
      </main>

      <StartRandomTestModal
        open={modalOpen}
        limit={limit}
        userName={userName}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
