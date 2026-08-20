import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
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
import { contentViewStudentShowPath, routes } from '@/config'
import { useContentViewStudentsQuery } from '@/features/director-stats'
import { useSmartBack } from '@/hooks'
import { asFio } from '@/lib/apiPage'

export function ContentViewByStudentsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.contentViewStatistic)
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useContentViewStudentsQuery(id)
  const rows = data?.data ?? []

  return (
    <>
      <Header title={t('statsPage.topicsByStudent')} onBack={goBack} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <Table storageKey="content-view-students">
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
                  <TD>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                      onClick={() =>
                        navigate(contentViewStudentShowPath(row.id), {
                          state: { groupId: id },
                        })
                      }
                    >
                      {asFio(row)}
                    </Button>
                  </TD>
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
      </PageMain>
    </>
  )
}
