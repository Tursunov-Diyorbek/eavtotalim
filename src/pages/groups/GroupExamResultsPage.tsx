import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eraser, RefreshCw } from 'lucide-react'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  Panel,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { Header, PageMain } from '@/components/layout'
import { studentPath, routes } from '@/config'
import {
  useClearFinalExamHistoryMutation,
  useFinalExamResultsQuery,
  useRetakeFinalExamMutation,
} from '@/features/groups'
import { fullNameOf } from '@/lib/format'
import { downloadXls } from '@/lib/downloadXls'
import { useSmartBack } from '@/hooks'
import type { GroupFinalExamResultRow } from '@/types/groups'

const EMPTY = '---'
const PASS_CORRECT_MIN = 17

function formatExamStamp(value?: string | null) {
  if (!value) return EMPTY
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function rowName(row: GroupFinalExamResultRow) {
  return (fullNameOf(row.student) ?? '').toUpperCase()
}

/** Eski `/info-final-exam-results/:id` — yakuniy imtihon natijalari. */
export function GroupExamResultsPage() {
  const { t } = useTranslation()
  const goBack = useSmartBack(routes.organizationFinalExam)
  const { id } = useParams()
  const query = useFinalExamResultsQuery(id)
  const retakeMutation = useRetakeFinalExamMutation()
  const clearMutation = useClearFinalExamHistoryMutation()
  const [sortDesc, setSortDesc] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [clearId, setClearId] = useState<number | null>(null)

  const rows = useMemo(() => {
    const list = [...(query.data?.results ?? [])]
    list.sort((a, b) => {
      const cmp = rowName(a).localeCompare(rowName(b), 'uz')
      return sortDesc ? -cmp : cmp
    })
    return list
  }, [query.data?.results, sortDesc])

  const stats = useMemo(() => {
    let taken = 0
    let passed = 0
    let failed = 0
    rows.forEach((row) => {
      const attempt = row.attempt
      if (!attempt) return
      taken += 1
      if (Number(attempt.correct_answers_count ?? 0) >= PASS_CORRECT_MIN) passed += 1
      else failed += 1
    })
    return {
      total: rows.length,
      taken,
      passed,
      failed,
      missing: Math.max(0, rows.length - taken),
    }
  }, [rows])

  const onRetake = (studentId: number) => {
    retakeMutation.mutate(studentId, {
      onSuccess: () => notify.success(t('common.saved')),
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const examName = query.data?.name || id || ''
  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <Header
        title={t('groupsPage.showPage.examResultsTitle', { name: examName })}
        onBack={goBack}
        actions={
          <Button
            variant="soft"
            size="sm"
            onClick={() =>
              downloadXls(
                'imtihon-natijalari',
                [
                  '№',
                  t('directorList.fio'),
                  t('groupsPage.showPage.examPercent'),
                  t('groupsPage.showPage.questionsCount'),
                  t('groupsPage.showPage.correctCount'),
                  t('groupsPage.showPage.examSubmittedAt'),
                  t('groupsPage.showPage.examStatus'),
                ],
                rows.map((row, index) => {
                  const attempt = row.attempt
                  const questions = Number(attempt?.questions_count ?? 0)
                  const correct = Number(attempt?.correct_answers_count ?? 0)
                  const percent =
                    attempt && questions > 0
                      ? Math.round((correct * 1000) / questions) / 10
                      : null
                  return [
                    index + 1,
                    rowName(row) || EMPTY,
                    percent == null ? EMPTY : `${percent} %`,
                    attempt ? `${questions} ${t('statsPage.pcs')}` : EMPTY,
                    attempt ? `${correct} ${t('statsPage.pcs')}` : EMPTY,
                    formatExamStamp(attempt?.start_time ?? row.start_time),
                    attempt
                      ? t('groupsPage.showPage.examFinishedAttempt')
                      : t('groupsPage.showPage.examNotTaken'),
                  ]
                }),
              )
            }
          >
            {t('groupsPage.showPage.exportXls')}
          </Button>
        }
      />
      <PageMain fill>
        {query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : query.isError || !id ? (
          <ErrorMessage />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  ['examTotal', stats.total],
                  ['examTaken', stats.taken],
                  ['examPassedCount', stats.passed],
                  ['examFailedCount', stats.failed],
                  ['examMissingCount', stats.missing],
                ] as const
              ).map(([key, value]) => (
                <Panel key={key} padding="sm" className="text-center">
                  <p className="text-[11px] text-muted">{t(`groupsPage.showPage.${key}`)}</p>
                  <p className="font-display text-lg font-semibold text-deep">{value}</p>
                </Panel>
              ))}
            </div>

            <Table storageKey="group-exam-results" className="min-w-240">
              <THead>
                <TR>
                  <TH className="w-12 text-center">№</TH>
                  <TH className="min-w-56">
                    <div className="flex items-center gap-2">
                      {t('directorList.fio')}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => setSortDesc((prev) => !prev)}
                      >
                        {sortDesc
                          ? t('groupsPage.showPage.sortAZ')
                          : t('groupsPage.showPage.sortZA')}
                      </Button>
                    </div>
                  </TH>
                  <TH>{t('groupsPage.showPage.examPercent')}</TH>
                  <TH>{t('groupsPage.showPage.questionsCount')}</TH>
                  <TH>{t('groupsPage.showPage.correctCount')}</TH>
                  <TH>{t('groupsPage.showPage.examSubmittedAt')}</TH>
                  <TH>{t('groupsPage.showPage.examStatus')}</TH>
                  <TH className="w-28 text-center">{t('groupsPage.showPage.retakeExam')}</TH>
                </TR>
              </THead>
              <TBody>
                {pageRows.length === 0 ? (
                  <TR>
                    <TD className="py-6 text-center" colSpan={8}>
                      <EmptyState
                        className="border-0 py-4 shadow-none"
                        description={t('common.empty')}
                      />
                    </TD>
                  </TR>
                ) : (
                  pageRows.map((row, index) => {
                    const student = row.student
                    const attempt = row.attempt
                    const name = rowName(row) || EMPTY
                    const questions = Number(attempt?.questions_count ?? 0)
                    const correct = Number(attempt?.correct_answers_count ?? 0)
                    const percent =
                      attempt && questions > 0
                        ? Math.round((correct * 1000) / questions) / 10
                        : null
                    const canRetake = Boolean(student?.id) && attempt != null && correct <= 16
                    return (
                      <TR key={student?.id ?? index}>
                        <TD className="text-center text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD>
                          {student?.id ? (
                            <Link
                              to={studentPath(student.id)}
                              className="font-semibold uppercase text-signal hover:underline"
                            >
                              {name}
                            </Link>
                          ) : (
                            name
                          )}
                        </TD>
                        <TD>{percent == null ? EMPTY : `${percent} %`}</TD>
                        <TD>
                          {attempt ? `${questions} ${t('statsPage.pcs')}` : EMPTY}
                        </TD>
                        <TD>
                          {attempt ? `${correct} ${t('statsPage.pcs')}` : EMPTY}
                        </TD>
                        <TD className={attempt ? 'font-medium text-amber' : 'text-rose'}>
                          {attempt
                            ? formatExamStamp(attempt.start_time ?? row.start_time)
                            : EMPTY}
                        </TD>
                        <TD>
                          <span className="inline-flex items-center gap-1.5">
                            {attempt ? (
                              <Badge tone="amber">
                                {attempt.status?.name ||
                                  t('groupsPage.showPage.examFinishedAttempt')}
                              </Badge>
                            ) : (
                              <Badge tone="rose">
                                {t('groupsPage.showPage.examNotTaken')}
                              </Badge>
                            )}
                            {student?.id ? (
                              <Button
                                variant="outline"
                                size="icon-sm"
                                loading={
                                  clearMutation.isPending &&
                                  clearMutation.variables === student.id
                                }
                                aria-label={t('groupsPage.showPage.clearExamHistory')}
                                onClick={() => setClearId(Number(student.id))}
                              >
                                <Eraser className="size-3.5" />
                              </Button>
                            ) : null}
                          </span>
                        </TD>
                        <TD className="text-center">
                          {canRetake ? (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              loading={
                                retakeMutation.isPending &&
                                retakeMutation.variables === student?.id
                              }
                              aria-label={t('groupsPage.showPage.retakeExam')}
                              onClick={() => onRetake(Number(student?.id))}
                            >
                              <RefreshCw className="size-3.5" />
                            </Button>
                          ) : (
                            EMPTY
                          )}
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
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
          </div>
        )}
      </PageMain>
      <ConfirmDialog
        open={clearId != null}
        onClose={() => setClearId(null)}
        title={t('groupsPage.showPage.clearExamHistory')}
        description={t('groupsPage.showPage.clearExamHistoryConfirm')}
        loading={clearMutation.isPending}
        onConfirm={() => {
          if (clearId == null) return
          clearMutation.mutate(clearId, {
            onSuccess: () => {
              notify.success(t('common.saved'))
              setClearId(null)
            },
            onError: (err) =>
              notify.error(err.message || t('common.loadError')),
          })
        }}
      />
    </>
  )
}
