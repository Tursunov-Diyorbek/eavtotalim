import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Notification,
  Pagination,
  SearchInput,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { TextbookAgreementError } from '@/api'
import { routes, textbooksLessonsPath, viewSubjectPath } from '@/config'
import {
  capitalizeName,
  isActiveStatus,
  pickTextbookName,
  useTextbookTopicsQuery,
} from '@/features/textbooks'
import { usePageState, useSmartBack } from '@/hooks'
import type { TextbookTopicsState } from '@/types/textbooks'

export function TextbookTopicsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const state = (location.state ?? {}) as TextbookTopicsState
  const fallback = state.subject_id
    ? textbooksLessonsPath(state.subject_id)
    : routes.textbooks
  const goBack = useSmartBack(fallback)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = usePageState('status', 'all')
  const [search, setSearch] = usePageState('search', '')

  useEffect(() => {
    setPage(1)
  }, [search, status, pageSize, id])

  const { data, isLoading, isError, error } = useTextbookTopicsQuery({
    eduTypeLessonId: id ?? '',
    page,
    showCount: pageSize,
    status,
    word: search,
  })

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const title = [
    capitalizeName(state.lesson_name || ''),
    state.edutype_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || t('nav.textbooks')

  const agreement =
    error instanceof TextbookAgreementError ? error.message : null

  return (
    <>
      <Header title={title} onBack={goBack} />
      <PageMain fill>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={status}
            options={[
              { value: 'all', label: t('textbooksPage.statusAll') },
              { value: '1', label: t('textbooksPage.active') },
              { value: '0', label: t('textbooksPage.inactive') },
            ]}
            onChange={(e) => setStatus(e.target.value)}
            className="w-44"
          />
          <SearchInput
            size="sm"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto w-full min-w-56 sm:w-72"
          />
        </div>
        {agreement ? (
          <Notification tone="warning">{agreement}</Notification>
        ) : isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <>
            <Table storageKey="textbooks-topics">
              <THead>
                <TR>
                  <TH>{t('textbooksPage.topicName')}</TH>
                  <TH className="w-32">{t('textbooksPage.status')}</TH>
                </TR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <TR>
                    <TD className="py-8 text-center" colSpan={2}>
                      <EmptyState
                        className="border-0 py-4"
                        description={t('textbooksPage.emptyTopics')}
                      />
                    </TD>
                  </TR>
                ) : (
                  rows.map((row, index) => {
                    const name = pickTextbookName(row, i18n.language)
                    return (
                      <TR key={row.id}>
                        <TD>
                          <button
                            type="button"
                            className="text-left font-medium text-signal hover:underline"
                            onClick={() =>
                              navigate(viewSubjectPath(row.id), {
                                state: {
                                  subject_name: state.subject_name,
                                  subject_id: state.subject_id,
                                  lesson_name: state.lesson_name,
                                  lesson_id: id,
                                  edutype_name: state.edutype_name,
                                  chapter_name: capitalizeName(name),
                                  name_topic: name,
                                },
                              })
                            }
                          >
                            {index + 1 + (page - 1) * pageSize}. {name || '—'}
                          </button>
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
