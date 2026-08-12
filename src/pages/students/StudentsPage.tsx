import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Panel,
  Skeleton,
} from '@/components/ui'
import { useStudentsQuery } from '@/features/students'

export function StudentsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch, isFetching } = useStudentsQuery()
  const rows = data?.data ?? []

  return (
    <>
      <Header title={t('students.title')} description={t('students.description')} />
      <main className="space-y-4 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-24" />
            ) : (
              t('common.total', { count: data?.total ?? 0 })
            )}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
            loading={isFetching && !isLoading}
          >
            {t('common.refresh')}
          </Button>
        </div>

        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <Panel>
            <ul className="divide-y divide-mist/80">
              {rows.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-ink">{student.fullName}</p>
                    {student.phone ? (
                      <p className="text-sm text-muted">{student.phone}</p>
                    ) : null}
                  </div>
                  <Badge tone="signal">{student.status}</Badge>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </main>
    </>
  )
}
