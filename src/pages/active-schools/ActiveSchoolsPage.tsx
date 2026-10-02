import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, MapPin } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { usePageState } from '@/hooks'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  Pagination,
  SearchInput,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import {
  buildActiveSchoolsSearchParams,
  useActiveSchoolsQuery,
} from '@/features/active-schools'

function truncate(text: string | null | undefined, max = 40) {
  if (!text) return null
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

export function ActiveSchoolsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = usePageState('search', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const searchParams = buildActiveSchoolsSearchParams(search)

  useEffect(() => {
    setPage(1)
  }, [search, pageSize])

  const { data, isLoading, isError, isFetching } = useActiveSchoolsQuery({
    ...searchParams,
    page,
    show_count: pageSize,
  })

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header
        title={t('activeSchools.title')}
        description={t('activeSchools.description')}
        actions={
          <SearchInput
            label={t('activeSchools.search')}
            placeholder={t('activeSchools.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
            className="w-full min-w-56 sm:w-80"
          />
        }
      />

      <PageMain fill>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-full" rounded="lg" />
            ))}
          </div>
        ) : isError ? (
          <ErrorMessage />
        ) : rows.length === 0 ? (
          <EmptyState description={t('activeSchools.empty')} />
        ) : (
          <>
            <div
              className={
                isFetching
                  ? 'flex min-h-0 min-w-0 flex-1 flex-col opacity-70 transition-opacity'
                  : 'flex min-h-0 min-w-0 flex-1 flex-col'
              }
            >
              <Table>
                <THead>
                  <TR>
                    <TH className="w-14 text-center">№</TH>
                    <TH>{t('activeSchools.schoolName')}</TH>
                    <TH className="w-36 text-center">{t('activeSchools.inn')}</TH>
                    <TH>{t('activeSchools.address')}</TH>
                    <TH className="w-48">{t('activeSchools.eduTypes')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((item, index) => {
                    const regionLine = [
                      item.address?.region,
                      item.address?.area,
                    ]
                      .filter(Boolean)
                      .join(', ')
                    const details = truncate(item.address?.details)
                    const eduTypes = item.edu_types ?? []
                    const rowNo = (page - 1) * pageSize + index + 1

                    return (
                      <TR key={item.id ?? index}>
                        <TD className="text-center">
                          <Badge tone="neutral">{rowNo}</Badge>
                        </TD>
                        <TD>
                          <span className="inline-flex items-start gap-2">
                            <Building2
                              className="mt-0.5 size-3.5 shrink-0 text-signal"
                              aria-hidden
                            />
                            <span
                              className="font-medium text-deep"
                              title={item.name || undefined}
                            >
                              {truncate(item.name, 40) || '—'}
                            </span>
                          </span>
                        </TD>
                        <TD className="text-center">
                          {item.inn ? (
                            <Badge tone="indigo" className="font-mono">
                              {item.inn}
                            </Badge>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </TD>
                        <TD>
                          {regionLine || details ? (
                            <div className="space-y-0.5">
                              {regionLine ? (
                                <p className="m-0 inline-flex items-center gap-1 text-[13px] font-medium text-deep">
                                  <MapPin
                                    className="size-3.5 shrink-0 text-rose"
                                    aria-hidden
                                  />
                                  {regionLine}
                                </p>
                              ) : null}
                              {details ? (
                                <p
                                  className="m-0 text-[12px] text-muted"
                                  title={item.address?.details || undefined}
                                >
                                  {details}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </TD>
                        <TD>
                          {eduTypes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {eduTypes.map((type, tIndex) => (
                                <Badge
                                  key={type.id ?? tIndex}
                                  tone="signal"
                                  title={type.name || undefined}
                                >
                                  {type.code || type.name || '—'}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            </div>

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
