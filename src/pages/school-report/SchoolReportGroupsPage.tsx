import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Notification,
  Pagination,
  SearchInput,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui'
import { routes, schoolReportGroupPath } from '@/config'
import { useSchoolReportGroupsQuery } from '@/features/school-report'
import { usePageState, useSmartBack } from '@/hooks'
import { yesterdayLabel } from '@/pages/region-report/xls'

function todayIso() {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function dayKey(value: string) {
  const match = value.trim().match(/(\d{4})[-.\s](\d{2})[-.\s](\d{2})/)
  if (!match) return ''
  return `${match[1]}-${match[2]}-${match[3]}`
}

function graduated(ending: string) {
  const key = dayKey(ending)
  if (!key) return false
  return key <= todayIso()
}

export function SchoolReportGroupsPage() {
  const { id = '', org_id: orgId = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.schoolReport)
  const [word, setWord] = usePageState('group', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const query = useSchoolReportGroupsQuery({
    organizationId: orgId,
    page,
    showCount: pageSize,
    word,
  })
  const rows = query.data?.rows ?? []
  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header
        title={<span className="uppercase">{t('schoolReportPage.groupsTitle')}</span>}
        onBack={goBack}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[13px] whitespace-nowrap text-muted">
              {t('schoolReportPage.searchGroups')}
            </span>
            <SearchInput
              size="sm"
              className="w-44"
              id="school-report-group"
              name="school-report-group"
              label={t('schoolReportPage.searchGroups')}
              placeholder={t('schoolReportPage.groupName')}
              value={word}
              onChange={(event) => {
                setWord(event.target.value)
                setPage(1)
              }}
            />
          </div>
        }
      />
      <PageMain fill>
        <Notification tone="warning" className="shrink-0">
          <span className="font-semibold">{yesterdayLabel()}</span>{' '}
          {t('schoolReportPage.notice')}
        </Notification>
        {query.isError && !query.data ? (
          <ErrorMessage />
        ) : query.isLoading && !query.data ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="school-report-groups" fill>
            <THead>
              <HeaderTR>
                <TH column="index" className="w-12 text-center">
                  №
                </TH>
                <TH column="name" className="min-w-28">
                  {t('schoolReportPage.groupName')}
                </TH>
                <TH column="period" className="min-w-52 text-center whitespace-nowrap">
                  {t('schoolReportPage.period')}
                </TH>
                <TH column="students" className="w-32 text-center whitespace-nowrap">
                  {t('schoolReportPage.students')}
                </TH>
                <TH column="average" className="min-w-40 text-center">
                  {t('schoolReportPage.average')}
                </TH>
                <TH column="last" className="min-w-52 text-center">
                  {t('schoolReportPage.lastLesson')}
                </TH>
                <TH column="status" className="w-28 text-center">
                  {t('schoolReportPage.status')}
                </TH>
              </HeaderTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={7} />
              ) : (
                rows.map((row, index) => {
                  const done = graduated(row.end)
                  const percent =
                    row.lastAbsence != null && row.students > 0
                      ? ((row.students - row.lastAbsence) / row.students) * 100
                      : null
                  return (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="name">
                        <Button
                          variant="link"
                          size="inline"
                          className="!h-auto !justify-start !px-0 !font-medium"
                          onClick={() => navigate(schoolReportGroupPath(id, orgId, row.id))}
                        >
                          {row.name || '—'}
                        </Button>
                      </TD>
                      <TD column="period" className="text-center whitespace-nowrap tabular-nums">
                        {row.start || row.end ? `${row.start} - ${row.end}` : '—'}
                      </TD>
                      <TD column="students" className="text-center tabular-nums">
                        {row.students}
                      </TD>
                      <TD column="average" className="text-center tabular-nums">
                        {row.average == null ? '—' : `${row.average.toFixed(1)}%`}
                      </TD>
                      <TD column="last" className="text-center">
                        {row.lastLessonDate ? (
                          <div>
                            <p>{row.lastLessonDate}</p>
                            <p className="text-[12px]">
                              <span className="text-rose">
                                {t('schoolReportPage.absent')}: {row.lastAbsence ?? 0}
                              </span>
                              {percent != null ? ` (${Number(percent.toFixed(1))}%)` : ''}
                            </p>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD column="status" className="text-center">
                        <Badge tone={done ? 'rose' : 'teal'}>
                          {done ? t('schoolReportPage.graduated') : t('schoolReportPage.active')}
                        </Badge>
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          className="shrink-0"
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
    </>
  )
}
