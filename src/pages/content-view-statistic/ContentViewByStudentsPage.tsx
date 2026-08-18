import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { useContentViewStudentsQuery } from '@/features/director-stats'
import { asFio } from '@/lib/apiPage'

export function ContentViewByStudentsPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useContentViewStudentsQuery(id)
  const rows = data?.data ?? []

  return (
    <>
      <Header title={t('nav.contentViewStatistic')} />
      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>{t('directorList.fio')}</TH>
                <TH>{t('statsPage.mastery')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-muted">{index + 1}</TD>
                  <TD className="font-medium text-ink">{asFio(row)}</TD>
                  <TD>
                    <Badge tone={row.topic_action_report ? 'teal' : 'rose'}>
                      {row.topic_action_report != null
                        ? `${row.topic_action_report}%`
                        : '—'}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </main>
    </>
  )
}
