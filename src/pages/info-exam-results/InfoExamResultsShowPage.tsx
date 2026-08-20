import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Notification,
  Pagination,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { InfoExamAgreementError } from '@/api'
import { routes } from '@/config'
import { useInfoExamResultShowQuery } from '@/features/info-exam-results'
import { useSmartBack } from '@/hooks'
import { asFio, asText } from '@/lib/apiPage'

export function InfoExamResultsShowPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const goBack = useSmartBack(routes.infoExamResults)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setPage(1)
  }, [id, pageSize])

  const { data, isLoading, isError, error } = useInfoExamResultShowQuery(id)
  const agreement =
    error instanceof InfoExamAgreementError ? error.message : null
  const rows = data ?? []
  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <Header title={t('infoExamResultsPage.results')} onBack={goBack} />
      <PageMain fill>
        {agreement ? (
          <Notification tone="warning">{agreement}</Notification>
        ) : isError ? (
          <ErrorMessage>
            {error instanceof Error ? error.message : undefined}
          </ErrorMessage>
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="info-exam-results-show">
            <THead>
              <TR>
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="fio">{t('statsPage.fish')}</TH>
                <TH column="percent" className="w-28 text-center">
                  {t('infoExamResultsPage.result')}
                </TH>
                <TH column="correct" className="w-40 text-center">
                  {t('infoExamResultsPage.correctCount')}
                </TH>
                <TH column="questions" className="w-36 text-center">
                  {t('infoExamResultsPage.questionCount')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {pageRows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={5}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('infoExamResultsPage.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                pageRows.map((row, index) => (
                  <TR key={String(row.id ?? `${page}-${index}`)}>
                    <TD column="index" className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD column="fio">{asFio(row.student ?? row)}</TD>
                    <TD column="percent" className="text-center">
                      {asText(row.percent) === '—'
                        ? '—'
                        : `${asText(row.percent).replace(/%$/, '')}%`}
                    </TD>
                    <TD column="correct" className="text-center">
                      {asText(row.correct_answers_count)}
                    </TD>
                    <TD column="questions" className="text-center">
                      {asText(row.question_count)}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
    </>
  )
}
