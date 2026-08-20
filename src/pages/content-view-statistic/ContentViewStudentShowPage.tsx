import { useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown, BookOpen, Timer } from 'lucide-react'
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
import { contentViewByStudentsPath, routes } from '@/config'
import {
  useContentViewStudentTopicsQuery,
} from '@/features/director-stats'
import { pickLocalized, secondsToHms } from '@/features/lessons'
import { useSmartBack } from '@/hooks'
import type { ContentStudentTopicRow } from '@/types/director-stats'

type LocationState = {
  groupId?: string
}

function topicTitle(row: ContentStudentTopicRow, lang: string) {
  const name = row.topic?.name
  if (name && typeof name === 'object') {
    return pickLocalized(name, lang) || '—'
  }
  if (typeof name === 'string' && name.trim()) return name
  return row.topic?.name_uz || '—'
}

function formatLimit(seconds: number | null | undefined) {
  if (seconds == null) return '--:--:--'
  return secondsToHms(seconds)
}

function indicatorOf(row: ContentStudentTopicRow) {
  const read = Number(row.student_topic_action?.reading_time)
  const limit = Number(row.topic_action_limit?.time_limit)
  if (!row.student_topic_action || !Number.isFinite(read)) return null
  if (!row.topic_action_limit || !Number.isFinite(limit) || limit <= 0) return null
  return Math.round((read / limit) * 1000) / 10
}

export function ContentViewStudentShowPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const state = (useLocation().state ?? {}) as LocationState
  const fallback = state.groupId
    ? contentViewByStudentsPath(state.groupId)
    : routes.contentViewStatistic
  const goBack = useSmartBack(fallback)
  const { data, isLoading, isError } = useContentViewStudentTopicsQuery(id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [timeSort, setTimeSort] = useState<'asc' | 'desc' | null>(null)

  const sorted = useMemo(() => {
    const rows = [...(data ?? [])]
    rows.sort((a, b) => {
      if (timeSort) {
        const ta = Number(a.topic_action_limit?.time_limit ?? -1)
        const tb = Number(b.topic_action_limit?.time_limit ?? -1)
        return timeSort === 'asc' ? ta - tb : tb - ta
      }
      const nameA = topicTitle(a, i18n.language).toLowerCase()
      const nameB = topicTitle(b, i18n.language).toLowerCase()
      return nameA.localeCompare(nameB, 'uz')
    })
    return rows
  }, [data, i18n.language, timeSort])

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <Header title={t('statsPage.topicsByStudent')} onBack={goBack} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="content-view-student-topics">
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>{t('statsPage.topicName')}</TH>
                <TH className="w-44">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto gap-1.5 px-0 py-0 font-semibold text-deep"
                    onClick={() =>
                      setTimeSort((prev) =>
                        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc',
                      )
                    }
                  >
                    <ArrowUpDown className="size-3.5 text-muted" aria-hidden />
                    {t('statsPage.givenTime')}
                    <Timer className="size-3.5 text-amber" aria-hidden />
                  </Button>
                </TH>
                <TH className="w-40">
                  <span className="inline-flex items-center gap-1.5">
                    {t('statsPage.readTime')}
                    <BookOpen className="size-3.5 text-signal" aria-hidden />
                  </span>
                </TH>
                <TH className="w-36">
                  <span className="inline-flex items-center gap-1 text-signal">
                    {t('statsPage.indicator')}
                    <span>(%)</span>
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
                pageRows.map((row, index) => {
                  const given = row.topic_action_limit
                  const read = row.student_topic_action
                  const percent = indicatorOf(row)
                  return (
                    <TR key={row.id ?? `${topicTitle(row, i18n.language)}-${index}`}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD className="font-medium text-ink">
                        {topicTitle(row, i18n.language)}
                      </TD>
                      <TD className="text-center">
                        <Badge tone={given ? 'amber' : 'rose'}>
                          {given
                            ? formatLimit(given.time_limit)
                            : '--:--:--'}
                        </Badge>
                      </TD>
                      <TD className="text-center">
                        <Badge tone={read ? 'amber' : 'rose'}>
                          {read
                            ? formatLimit(read.reading_time)
                            : '--:--:--'}
                        </Badge>
                      </TD>
                      <TD className="text-center">
                        <Badge tone={percent != null ? 'signal' : 'rose'}>
                          {percent != null ? `${percent}%` : '--'}
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
