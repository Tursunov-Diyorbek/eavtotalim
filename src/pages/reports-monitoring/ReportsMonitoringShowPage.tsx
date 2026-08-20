import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { routes } from '@/config'
import { pickLocalized } from '@/features/lessons'
import { useMonitoringStudentAbsencesQuery } from '@/features/monitoring-report'
import { useSmartBack } from '@/hooks'
import { downloadXls } from '@/lib/downloadXls'
import { formatDate } from '@/lib/format'
import type { MonitoringAbsenceRow } from '@/types/monitoring-report'

type LocationState = {
  fullName?: string
}

const NAME_STORAGE = 'eavt.monitoring-student-name:'

function topicTitle(row: MonitoringAbsenceRow, lang: string) {
  const topic = row.topic
  const name = topic?.name
  if (typeof name === 'string' && name.trim()) return name.trim()
  if (name && typeof name === 'object') {
    const localized = pickLocalized(name, lang).trim()
    if (localized) return localized
  }
  return (
    topic?.name_uz ||
    topic?.name_kiril ||
    topic?.name_ru ||
    topic?.name_en ||
    topic?.name_qq ||
    '—'
  )
}

export function ReportsMonitoringShowPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const state = (useLocation().state ?? {}) as LocationState
  const goBack = useSmartBack(routes.reportsMonitoringByStudent)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const storedName =
    id && typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(NAME_STORAGE + id)
      : null
  const studentTitle = state.fullName?.trim() || storedName?.trim() || ''

  useEffect(() => {
    if (!id || !state.fullName?.trim()) return
    try {
      sessionStorage.setItem(NAME_STORAGE + id, state.fullName.trim())
    } catch {
      /* ignore quota */
    }
  }, [id, state.fullName])

  useEffect(() => {
    setPage(1)
  }, [id, pageSize])

  const { data, isLoading, isError } = useMonitoringStudentAbsencesQuery({
    studentId: id,
    page,
    showCount: pageSize,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const exportXls = () => {
    downloadXls(
      'davomat',
      ['№', t('missedClasses.subject'), t('directorList.date')],
      rows.map((row, index) => [
        (page - 1) * pageSize + index + 1,
        topicTitle(row, i18n.language),
        formatDate(row.date, i18n.language) ?? row.date ?? '',
      ]),
    )
  }

  return (
    <>
      <Header
        title={studentTitle || t('statsPage.attendanceByStudents')}
        onBack={goBack}
        actions={
          <Button variant="primary" size="sm" onClick={exportXls} disabled={!rows.length}>
            {t('statsPage.exportExcel')}
          </Button>
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="reports-monitoring-student-absences">
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>{t('missedClasses.subject')}</TH>
                <TH className="w-40 text-center">{t('directorList.date')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={3}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => (
                  <TR key={row.id ?? `${topicTitle(row, i18n.language)}-${index}`}>
                    <TD className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD className="text-ink">{topicTitle(row, i18n.language)}</TD>
                    <TD className="text-center">
                      <Badge tone="amber">
                        {formatDate(row.date, i18n.language) ?? row.date ?? '—'}
                      </Badge>
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
