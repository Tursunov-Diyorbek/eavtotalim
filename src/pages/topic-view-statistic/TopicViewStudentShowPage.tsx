import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  EmptyTR,
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
import { useTopicTestStudentResultsQuery } from '@/features/director-stats'
import { pickLocalized } from '@/features/lessons'
import { useSmartBack } from '@/hooks'
import { formatNumber } from '@/lib/format'
import type { TopicTestResultRow } from '@/types/director-stats'

type LocationState = {
  fullName?: string
}

function topicTitle(row: TopicTestResultRow, lang: string) {
  const topic = row.topic
  if (!topic) return '—'
  const name = topic.name
  if (typeof name === 'string' && name.trim()) return name.trim()
  if (name && typeof name === 'object') {
    const localized = pickLocalized(name, lang).trim()
    if (localized) return localized
  }
  const direct = pickLocalized(
    { uz: topic.name_uz, ru: topic.name_ru, kiril: topic.name_kiril },
    lang,
  ).trim()
  return direct || '—'
}

function formatPercent(value: number | string | null | undefined) {
  if (value == null || value === '') return '—'
  if (typeof value === 'string' && value.includes('%')) return value
  return `${formatNumber(value)} %`
}

export function TopicViewStudentShowPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const state = (useLocation().state ?? {}) as LocationState
  const goBack = useSmartBack(routes.topicViewStatistic)
  const { data, isLoading, isError } = useTopicTestStudentResultsQuery(id)
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
    : t('statsPage.topicTestReport')

  return (
    <>
      <Header title={title} onBack={goBack} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="topic-view-student">
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>{t('statsPage.topicName')}</TH>
                <TH className="w-36 text-center">{t('statsPage.questionCount')}</TH>
                <TH className="w-36 text-center">{t('statsPage.correctAnswers')}</TH>
                <TH className="w-40 text-center">{t('statsPage.incorrectAnswers')}</TH>
                <TH className="w-48 text-center">{t('statsPage.maxCorrect')}</TH>
                <TH className="w-28 text-center">{t('statsPage.percent')} (%)</TH>
                <TH className="w-36 text-center">{t('statsPage.maxPercent')} (%)</TH>
              </TR>
            </THead>
            <TBody>
              {pageRows.length === 0 ? (
                <EmptyTR colSpan={8} description={t('statsPage.emptyList')} />
              ) : (
                pageRows.map((row, index) => (
                  <TR key={row.id ?? `${topicTitle(row, i18n.language)}-${index}`}>
                    <TD className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD className="font-medium">{topicTitle(row, i18n.language)}</TD>
                    <TD className="text-center">
                      <Badge tone="signal">{formatNumber(row.question_count)}</Badge>
                    </TD>
                    <TD className="text-center">
                      <Badge tone="teal">{formatNumber(row.correct_answers_count)}</Badge>
                    </TD>
                    <TD className="text-center">
                      <Badge tone="rose">{formatNumber(row.incorrect_answers_count)}</Badge>
                    </TD>
                    <TD className="text-center">
                      <Badge tone="teal">{formatNumber(row.max_result_corrects)}</Badge>
                    </TD>
                    <TD className="text-center">
                      <Badge tone="amber">{formatPercent(row.percent)}</Badge>
                    </TD>
                    <TD className="text-center">
                      <Badge tone="amber">
                        {formatPercent(row.max_result_percent ?? row.percent)}
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
