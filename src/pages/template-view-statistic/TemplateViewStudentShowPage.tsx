import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Percent, XCircle } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
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
import { useTemplateTestStudentResultsQuery } from '@/features/director-stats'
import { pickLocalized } from '@/features/lessons'
import { useSmartBack } from '@/hooks'
import { formatNumber } from '@/lib/format'
import type { TemplateTestResultRow } from '@/types/director-stats'

type LocationState = {
  fullName?: string
}

function templateTitle(row: TemplateTestResultRow, lang: string) {
  const name = row.template?.name
  if (typeof name === 'string' && name.trim()) return name.trim()
  if (typeof name === 'number') return String(name)
  if (name && typeof name === 'object') {
    const localized = pickLocalized(name, lang).trim()
    if (localized) return localized
  }
  const fallback = row.template?.name_uz?.trim()
  if (fallback) return fallback
  if (row.template_id != null) return String(row.template_id)
  return '—'
}

function formatPercent(value: number | string | null | undefined) {
  if (value == null || value === '') return '—'
  if (typeof value === 'string' && value.includes('%')) return value
  return `${formatNumber(value)}%`
}

export function TemplateViewStudentShowPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const state = (useLocation().state ?? {}) as LocationState
  const goBack = useSmartBack(routes.templateViewStatistic)
  const { data, isLoading, isError } = useTemplateTestStudentResultsQuery(id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setPage(1)
  }, [id, pageSize])

  const rows = data ?? []
  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize, rows],
  )

  const title = state.fullName?.trim()
    ? state.fullName.trim().toUpperCase()
    : t('statsPage.templateTestReport')

  return (
    <>
      <Header title={title} onBack={goBack} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="template-view-student-results">
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>{t('statsPage.templateName')}</TH>
                <TH className="w-52">
                  <span className="inline-flex items-center justify-center gap-1.5">
                    {t('statsPage.correctCount')}
                    <CheckCircle2 className="size-4 text-teal" aria-hidden />
                  </span>
                </TH>
                <TH className="w-52">
                  <span className="inline-flex items-center justify-center gap-1.5">
                    {t('statsPage.incorrectCount')}
                    <XCircle className="size-4 text-rose" aria-hidden />
                  </span>
                </TH>
                <TH className="w-40">
                  <span className="inline-flex items-center justify-center gap-1.5">
                    {t('statsPage.percent')} (%)
                    <Percent className="size-4 text-signal" aria-hidden />
                  </span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {pageRows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={5}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                pageRows.map((row, index) => (
                  <TR key={row.id ?? `${templateTitle(row, i18n.language)}-${index}`}>
                    <TD className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD className="font-medium text-ink">
                      {templateTitle(row, i18n.language)}
                    </TD>
                    <TD className="text-center font-semibold text-teal">
                      {formatNumber(row.correct_answers_count)}
                    </TD>
                    <TD className="text-center font-semibold text-rose">
                      {formatNumber(row.incorrect_answers_count)}
                    </TD>
                    <TD className="text-center font-semibold text-ink">
                      {formatPercent(row.percent)}
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
