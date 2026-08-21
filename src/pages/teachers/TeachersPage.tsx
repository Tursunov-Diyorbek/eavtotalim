import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  EditButton,
  FilterTH,
  ListPageSkeleton,
  Pagination,
  SearchInput,
  Select,
  ShowButton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { routes, teacherEditPath, teacherPath } from '@/config'
import { useTeachersQuery } from '@/features/teachers'

const SORT_OPTIONS = [
  { id: '1', key: 'last_name', order: 'ASC' as const, labelKey: 'teachersPage.sortLastAsc' },
  { id: '2', key: 'last_name', order: 'DESC' as const, labelKey: 'teachersPage.sortLastDesc' },
  { id: '3', key: 'id', order: 'ASC' as const, labelKey: 'teachersPage.sortIdAsc' },
  { id: '4', key: 'id', order: 'DESC' as const, labelKey: 'teachersPage.sortIdDesc' },
  { id: '5', key: 'status', order: 'DESC' as const, labelKey: 'teachersPage.sortStatus' },
]

export function TeachersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [passport, setPassport] = useState('')
  const [jshir, setJshir] = useState('')
  const [status, setStatus] = useState('')
  const [mspdStatus, setMspdStatus] = useState('')
  const [sortId, setSortId] = useState('5')

  useEffect(() => {
    setPage(1)
  }, [lastName, firstName, middleName, passport, jshir, status, mspdStatus, sortId, pageSize])

  const seria = passport.slice(0, 2).replace(/[^A-Za-z]/g, '').toUpperCase()
  const number = passport.slice(2).replace(/\D/g, '').slice(0, 7)
  const sort = SORT_OPTIONS.find((item) => item.id === sortId) ?? SORT_OPTIONS[4]

  const { data, isLoading, isError, refetch, isFetching } = useTeachersQuery({
    page,
    showCount: pageSize,
    lastName,
    firstName,
    middleName,
    passportSeria: seria,
    passportNumber: number,
    passportJshir: jshir,
    status,
    mspdStatus,
    sortKey: sort.key,
    sortOrder: sort.order,
  })

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header
        title={t('teachersPage.title')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={isFetching && !isLoading}
              onClick={() => void refetch()}
            >
              {t('common.refresh')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(routes.teacherCreate)}
            >
              <Plus className="size-3.5" aria-hidden />
              {t('common.add')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="w-10">№</TH>
                <TH>{t('teachersPage.lastName')}</TH>
                <TH>{t('teachersPage.firstName')}</TH>
                <TH>{t('teachersPage.middleName')}</TH>
                <TH>{t('teachersPage.passport')}</TH>
                <TH>{t('teachersPage.jshir')}</TH>
                <TH>{t('teachersPage.mspd')}</TH>
                <TH>{t('directorList.status')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
              <TR className="hover:bg-transparent bg-white">
                <FilterTH />
                <FilterTH>
                  <SearchInput
                    size="sm"
                    label={t('teachersPage.lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    size="sm"
                    label={t('teachersPage.firstName')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    size="sm"
                    label={t('teachersPage.middleName')}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    size="sm"
                    label={t('teachersPage.passport')}
                    placeholder="AA1234567"
                    value={passport}
                    onChange={(e) =>
                      setPassport(e.target.value.toUpperCase().slice(0, 9))
                    }
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    size="sm"
                    label={t('teachersPage.jshir')}
                    value={jshir}
                    onChange={(e) =>
                      setJshir(e.target.value.replace(/\D/g, '').slice(0, 14))
                    }
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    value={mspdStatus}
                    onChange={(e) => setMspdStatus(e.target.value)}
                    options={[
                      { value: '', label: t('common.all') },
                      { value: '0', label: t('teachersPage.mspdPending') },
                      { value: '1', label: t('teachersPage.mspdOk') },
                      { value: '2', label: t('teachersPage.mspdBad') },
                    ]}
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: '', label: t('common.all') },
                      { value: '1', label: t('dashboard.active') },
                      { value: '0', label: t('dashboard.inactive') },
                    ]}
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    value={sortId}
                    onChange={(e) => setSortId(e.target.value)}
                    options={SORT_OPTIONS.map((item) => ({
                      value: item.id,
                      label: t(item.labelKey),
                    }))}
                  />
                </FilterTH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={9}>
                    <EmptyState className="border-0 py-4" description={t('common.empty')} />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-muted">
                    {(page - 1) * pageSize + index + 1}
                  </TD>
                  <TD className="font-medium text-ink">{row.last_name || '—'}</TD>
                  <TD>{row.first_name || '—'}</TD>
                  <TD>{row.middle_name || '—'}</TD>
                  <TD className="whitespace-nowrap">
                    {[row.passport_seria, row.passport_number]
                      .filter(Boolean)
                      .join(' ') || '—'}
                  </TD>
                  <TD>{row.passport_jshir || '—'}</TD>
                  <TD>
                    <Badge
                      tone={
                        Number(row.mspd_status) === 1
                          ? 'teal'
                          : Number(row.mspd_status) === 2
                            ? 'rose'
                            : 'neutral'
                      }
                    >
                      {Number(row.mspd_status) === 1
                        ? t('teachersPage.mspdOk')
                        : Number(row.mspd_status) === 2
                          ? t('teachersPage.mspdBad')
                          : t('teachersPage.mspdPending')}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge tone={Number(row.status) === 1 ? 'teal' : 'rose'}>
                      {Number(row.status) === 1
                        ? t('dashboard.active')
                        : t('dashboard.inactive')}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      <ShowButton onClick={() => navigate(teacherPath(row.id))} />
                      <EditButton onClick={() => navigate(teacherEditPath(row.id))} />
                    </div>
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
          onPageSizeChange={setPageSize}
        />
      </PageMain>
    </>
  )
}
