import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  SearchInput,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { textbooksLessonsPath } from '@/config'
import { useDirectorListQuery } from '@/features/director-pages'
import {
  capitalLetter,
  capitalizeName,
  isActiveStatus,
  pickTextbookName,
  textbookCardTone,
} from '@/features/textbooks'
import { usePageState } from '@/hooks'
import { formatDateTime, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { TextbookLessonItem } from '@/types/textbooks'

export function TextbooksPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = usePageState('search', '')

  useEffect(() => {
    setPage(1)
  }, [search, pageSize])

  const { data, isLoading, isError } = useDirectorListQuery(
    'textbooks',
    { page, showCount: pageSize, search },
    true,
  )

  const rows = (data?.data ?? []) as TextbookLessonItem[]
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header
        title={t('nav.textbooks')}
        actions={
          <SearchInput
            size="sm"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-w-56 sm:w-72"
          />
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <>
            <Table storageKey="textbooks-list">
              <THead>
                <TR>
                  <TH className="w-10">№</TH>
                  <TH>{t('textbooksPage.subjectName')}</TH>
                  <TH className="w-36">{t('textbooksPage.eduTypesCount')}</TH>
                  <TH className="w-28">{t('directorList.status')}</TH>
                  <TH className="w-48">{t('textbooksPage.updated')}</TH>
                </TR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <TR>
                    <TD className="py-8 text-center" colSpan={5}>
                      <EmptyState
                        className="border-0 py-4"
                        description={t('common.empty')}
                      />
                    </TD>
                  </TR>
                ) : (
                  rows.map((row, index) => {
                    const name = pickTextbookName(row, i18n.language)
                    return (
                      <TR key={row.id}>
                        <TD className="text-center text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD>
                          <button
                            type="button"
                            className="flex items-center gap-2.5 text-left"
                            onClick={() =>
                              navigate(textbooksLessonsPath(row.id), {
                                state: { name },
                              })
                            }
                          >
                            <span
                              className={cn(
                                'flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white',
                                textbookCardTone(row.id),
                              )}
                            >
                              {capitalLetter(name)}
                            </span>
                            <span className="font-medium text-signal hover:underline">
                              {capitalizeName(name) || '—'}
                            </span>
                          </button>
                        </TD>
                        <TD>
                          <Badge tone="signal">
                            {formatNumber(Number(row.edu_types_count ?? 0))}
                          </Badge>
                        </TD>
                        <TD>
                          <Badge
                            tone={isActiveStatus(row.status) ? 'teal' : 'rose'}
                          >
                            {isActiveStatus(row.status)
                              ? t('textbooksPage.active')
                              : t('textbooksPage.inactive')}
                          </Badge>
                        </TD>
                        <TD className="text-sm text-muted">
                          {formatDateTime(row.updated_at, i18n.language) ?? '—'}
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
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </PageMain>
    </>
  )
}
