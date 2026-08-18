import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Plus } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
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
import { routes } from '@/config'
import {
  appealStatusMeta,
  isClosedFlag,
  pickAppealTypeName,
  useAppealsQuery,
  useAppealTypesQuery,
} from '@/features/appeals'
import { formatDate } from '@/lib/format'
import { CreateAppealModal } from './CreateAppealModal'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: 'new', labelKey: 'appeal.statusNew' },
  { value: 'in_progress', labelKey: 'appeal.statusInProgress' },
  { value: 'resolved', labelKey: 'appeal.statusResolved' },
  { value: 'rejected', labelKey: 'appeal.statusRejected' },
  { value: 'answered', labelKey: 'appeal.statusAnswered' },
] as const

export function DirectorAppealsPage() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [closedFilter, setClosedFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [lastName, firstName, middleName, typeFilter, closedFilter, statusFilter, pageSize])

  const { data: types = [] } = useAppealTypesQuery()
  const { data, isLoading, isError } = useAppealsQuery({
    page,
    showCount: pageSize,
    lastName,
    firstName,
    middleName,
    appealTypeId: typeFilter || null,
    isClosed:
      closedFilter === '0' || closedFilter === '1'
        ? (Number(closedFilter) as 0 | 1)
        : null,
    status: statusFilter || null,
  })

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header
        title={t('nav.directorAppeals')}
        actions={
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" aria-hidden />
            {t('common.add')}
          </Button>
        }
      />
      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isError ? (
          <ErrorMessage />
        ) : isLoading && rows.length === 0 ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('teachersPage.lastName')}</span>
                    <SearchInput
                      size="md"
                      label={t('teachersPage.lastName')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('teachersPage.firstName')}</span>
                    <SearchInput
                      size="md"
                      label={t('teachersPage.firstName')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('teachersPage.middleName')}</span>
                    <SearchInput
                      size="md"
                      label={t('teachersPage.middleName')}
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('appeal.type')}</span>
                    <Select
                      size="sm"
                      className="w-full min-w-0"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      options={[
                        { value: '', label: t('appeal.all') },
                        ...types.map((item) => ({
                          value: item.id,
                          label: pickAppealTypeName(item.name, i18n.language),
                        })),
                      ]}
                    />
                  </div>
                </TH>
                <TH>{t('appeal.comment')}</TH>
                <TH>{t('appeal.created')}</TH>
                <TH>{t('appeal.updated')}</TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('appeal.openClosed')}</span>
                    <Select
                      size="sm"
                      className="w-full min-w-0"
                      value={closedFilter}
                      onChange={(e) => setClosedFilter(e.target.value)}
                      options={[
                        { value: '', label: t('appeal.all') },
                        { value: '0', label: t('appeal.open') },
                        { value: '1', label: t('appeal.closed') },
                      ]}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('appeal.status')}</span>
                    <Select
                      size="sm"
                      className="w-full min-w-0"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      options={[
                        { value: '', label: t('appeal.all') },
                        ...STATUS_OPTIONS.map((item) => ({
                          value: item.value,
                          label: t(item.labelKey),
                        })),
                      ]}
                    />
                  </div>
                </TH>
                <TH className="w-20">{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD colSpan={11}>
                    <EmptyState description={t('common.empty')} />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const status = appealStatusMeta(row.status, t)
                  const closed = isClosedFlag(row.is_closed)
                  return (
                    <TR key={row.id}>
                      <TD className="text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD>{row.student?.last_name || '—'}</TD>
                      <TD>{row.student?.first_name || '—'}</TD>
                      <TD>{row.student?.middle_name || '—'}</TD>
                      <TD>
                        {pickAppealTypeName(row.appeal_type?.name, i18n.language) ||
                          '—'}
                      </TD>
                      <TD>
                        <p className="line-clamp-2 max-w-xs text-[13px]">
                          {row.message || '—'}
                        </p>
                      </TD>
                      <TD>
                        <Badge tone="teal">
                          {formatDate(row.created_at, i18n.language) || '—'}
                        </Badge>
                      </TD>
                      <TD>
                        <Badge tone="amber">
                          {formatDate(row.updated_at, i18n.language) || '—'}
                        </Badge>
                      </TD>
                      <TD>
                        <Badge tone={closed ? 'rose' : 'signal'}>
                          {closed ? t('appeal.closed') : t('appeal.open')}
                        </Badge>
                      </TD>
                      <TD>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </TD>
                      <TD>
                        <Link to={`${routes.directorAppeals}/${row.id}`}>
                          <Button
                            variant="soft"
                            size="icon-sm"
                            aria-label={t('common.view')}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </Link>
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
          onPageSizeChange={setPageSize}
        />
      </main>
      <CreateAppealModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        fixedTarget="system"
      />
    </>
  )
}
