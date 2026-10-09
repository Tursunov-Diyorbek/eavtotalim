import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
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
import { DIRECTOR_NAV_ITEMS } from '@/config/directorNav'
import { usePageState } from '@/hooks'
import { directorListHasSearch, hasDirectorListApi } from '@/api'
import {
  DIRECTOR_LIST_COLUMNS,
  useDirectorListQuery,
  type DirectorCol,
} from '@/features/director-pages'
import { asFio, asLangName, asText, get, type DirectorRow } from '@/lib/apiPage'
import { formatDate, formatNumber } from '@/lib/format'
import { formatPhoneLocal, parsePhoneDigits } from '@/lib/phone'

function formatPhoneCell(raw: unknown): string {
  if (raw == null || raw === '') return '—'
  const digits = parsePhoneDigits(String(raw))
  if (!digits) return '—'
  return `+998 ${formatPhoneLocal(digits)}`
}

function cellValue(
  col: DirectorCol,
  row: DirectorRow,
  lang: string,
): string {
  if (col.kind === 'fio') return asFio(row)
  const raw = col.path ? get(row, col.path) : row[col.key]
  if (col.kind === 'date') return formatDate(asText(raw) === '—' ? null : String(raw), lang) ?? '—'
  if (col.kind === 'lang') return asLangName(raw ?? row, lang)
  if (col.kind === 'phone') return formatPhoneCell(raw)
  if (col.kind === 'status') return asText(raw)
  if (typeof raw === 'number') return formatNumber(raw)
  return asText(raw)
}

export function DirectorResourcePage() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = usePageState('search', '')

  const item = useMemo(
    () => DIRECTOR_NAV_ITEMS.find((row) => row.to === pathname),
    [pathname],
  )

  const title = item ? t(item.labelKey) : t('common.notFoundTitle')
  const pageKey = item?.page
  const columns = pageKey ? DIRECTOR_LIST_COLUMNS[pageKey] : undefined
  const listEnabled = Boolean(pageKey && hasDirectorListApi(pageKey))

  useEffect(() => {
    setPage(1)
  }, [search, pageSize, pageKey])

  const { data, isLoading, isError } = useDirectorListQuery(
    pageKey ?? 'dashboard',
    { page, showCount: pageSize, search },
    listEnabled,
  )

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  if (!item) {
    return (
      <>
        <Header title={title} />
        <main className="p-3 sm:p-4">
          <EmptyState title={title} />
        </main>
      </>
    )
  }

  return (
    <>
      <Header
        title={title}
        actions={
          pageKey && directorListHasSearch(pageKey) ? (
            <SearchInput
              size="sm"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-w-56 sm:w-72"
            />
          ) : undefined
        }
      />
      <PageMain fill>
        {isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : isError ? (
          <ErrorMessage />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                {(columns ?? [{ key: 'id', headerKey: 'directorList.name' }]).map(
                  (col) => (
                    <TH key={col.key}>{t(col.headerKey)}</TH>
                  ),
                )}
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD
                    className="py-8 text-center"
                    colSpan={(columns?.length ?? 1) + 1}
                  >
                    <EmptyState className="border-0 py-4" description={t('common.empty')} />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => (
                  <TR key={String(row.id ?? `${page}-${index}`)}>
                    <TD className="text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    {(columns ?? []).map((col) => {
                      const value = cellValue(col, row, i18n.language)
                      return (
                        <TD key={col.key}>
                          {col.kind === 'status' ? (
                            <Badge tone="signal">{value}</Badge>
                          ) : (
                            value
                          )}
                        </TD>
                      )
                    })}
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
          onPageSizeChange={setPageSize}
        />
      </PageMain>
    </>
  )
}
