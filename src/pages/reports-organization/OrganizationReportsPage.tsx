import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Pagination,
  TBody,
  TD,
  TH,
  THead,
  Table,
  TR,
} from '@/components/ui'
import { groupShowPath } from '@/config'
import { useDirectorListQuery } from '@/features/director-pages'
import { asLangName, asText, get } from '@/lib/apiPage'
import { formatDate, formatNumber } from '@/lib/format'

export function OrganizationReportsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const query = useDirectorListQuery(
    'reportsForOrganization',
    { page: 1, showCount: pageSize, search: '' },
    true,
  )

  const rows = query.data?.data ?? []
  const visible = rows.slice((page - 1) * pageSize, page * pageSize)
  const lang = i18n.language

  return (
    <>
      <Header title={t('nav.reportsForOrganization')} />
      <PageMain fill>
        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table fill>
              <THead>
                <HeaderTR>
                  <TH className="w-14 text-center">№</TH>
                  <TH>{t('directorList.group')}</TH>
                  <TH className="text-center">{t('directorList.studentsCount')}</TH>
                  <TH>{t('directorList.eduCategory')}</TH>
                  <TH>{t('directorList.startDate')}</TH>
                  <TH>{t('directorList.endDate')}</TH>
                </HeaderTR>
              </THead>
              <TBody>
                {visible.length === 0 ? (
                  <EmptyTR colSpan={6} description={t('common.empty')} />
                ) : (
                  visible.map((row, index) => {
                    const group = get(row, 'group')
                    const groupId = get(group, 'id')
                    const name = asLangName(group, lang)
                    return (
                      <TR key={String(row.id ?? groupId ?? index)}>
                        <TD className="text-center text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD>
                          {groupId == null || groupId === '' ? (
                            name
                          ) : (
                            <Button
                              variant="link"
                              size="inline"
                              onClick={() => navigate(groupShowPath(String(groupId)))}
                            >
                              {name}
                            </Button>
                          )}
                        </TD>
                        <TD className="text-center">
                          {formatNumber(Number(get(row, 'students_count') ?? 0))}
                        </TD>
                        <TD>{asLangName(get(group, 'edu_type'), lang)}</TD>
                        <TD>
                          {formatDate(asText(get(group, 'edu_starting_date')) === '—'
                            ? null
                            : String(get(group, 'edu_starting_date') ?? ''), lang) || '—'}
                        </TD>
                        <TD>
                          {formatDate(asText(get(group, 'edu_ending_date')) === '—'
                            ? null
                            : String(get(group, 'edu_ending_date') ?? ''), lang) || '—'}
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
          </div>
        )}
        <Pagination
          className="shrink-0"
          page={page}
          pageSize={pageSize}
          total={rows.length}
          totalPages={Math.max(1, Math.ceil(rows.length / pageSize) || 1)}
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
