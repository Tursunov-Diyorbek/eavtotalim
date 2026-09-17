import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Plus } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  Pagination,
  Select,
  Skeleton,
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

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-mist/70 bg-white p-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" rounded="lg" />
      ))}
    </div>
  )
}

export function AppealsPage() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [closedFilter, setClosedFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: types = [] } = useAppealTypesQuery()
  const { data, isLoading, isError } = useAppealsQuery({
    page,
    showCount: PAGE_SIZE,
    appealTypeId: typeFilter || null,
    isClosed:
      closedFilter === '0' || closedFilter === '1'
        ? (Number(closedFilter) as 0 | 1)
        : null,
    status: statusFilter || null,
  })

  const items = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1)

  return (
    <>
      <Header
        title={t('appeal.title')}
        description={t('appeal.description')}
        actions={
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            {t('appeal.create')}
          </Button>
        }
      />

      <PageMain fill>
        <div className="flex shrink-0 flex-nowrap items-end gap-2">
          <Select
            size="sm"
            label={t('appeal.type')}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: '', label: t('appeal.all') },
              ...types.map((item) => ({
                value: item.id,
                label: pickAppealTypeName(item.name, i18n.language),
              })),
            ]}
            className="w-[12rem] shrink-0"
            searchable={false}
          />
          <Select
            size="sm"
            label={t('appeal.openClosed')}
            value={closedFilter}
            onChange={(e) => {
              setClosedFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: '', label: t('appeal.all') },
              { value: '0', label: t('appeal.open') },
              { value: '1', label: t('appeal.closed') },
            ]}
            className="w-[11rem] shrink-0"
            searchable={false}
          />
          <Select
            size="sm"
            label={t('appeal.status')}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: '', label: t('appeal.all') },
              { value: 'new', label: t('appeal.statusNew') },
              { value: 'in_progress', label: t('appeal.statusInProgress') },
              { value: 'resolved', label: t('appeal.statusResolved') },
              { value: 'rejected', label: t('appeal.statusRejected') },
              { value: 'answered', label: t('appeal.statusAnswered') },
            ]}
            className="w-[11rem] shrink-0"
            searchable={false}
          />
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : items.length === 0 ? (
          <EmptyState description={t('appeal.empty')} />
        ) : (
          <>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <Table>
              <THead>
                <TR>
                  <TH className="w-12 text-center">№</TH>
                  <TH>{t('appeal.type')}</TH>
                  <TH className="w-28">{t('appeal.target')}</TH>
                  <TH>{t('appeal.message')}</TH>
                  <TH className="w-28">{t('appeal.created')}</TH>
                  <TH className="w-28">{t('appeal.openClosed')}</TH>
                  <TH className="w-32">{t('appeal.status')}</TH>
                  <TH className="w-20 text-center">{t('appeal.actions')}</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((item, index) => {
                  const status = appealStatusMeta(item.status, t)
                  const closed = isClosedFlag(item.is_closed)
                  return (
                    <TR key={item.id}>
                      <TD className="text-center text-muted">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </TD>
                      <TD className="font-medium text-deep">
                        {pickAppealTypeName(
                          item.appeal_type?.name,
                          i18n.language,
                        ) || '—'}
                      </TD>
                      <TD>
                        <Badge
                          tone={
                            item.target === 'system' ? 'teal' : 'violet'
                          }
                        >
                          {item.target === 'system'
                            ? t('appeal.targetSystemShort')
                            : t('appeal.targetOrgShort')}
                        </Badge>
                      </TD>
                      <TD>
                        <p className="line-clamp-2 max-w-xs text-[13px]">
                          {item.message || '—'}
                        </p>
                      </TD>
                      <TD className="whitespace-nowrap text-[12px] text-muted">
                        {formatDate(item.created_at, i18n.language) || '—'}
                      </TD>
                      <TD>
                        <Badge tone={closed ? 'rose' : 'signal'}>
                          {closed ? t('appeal.closed') : t('appeal.open')}
                        </Badge>
                      </TD>
                      <TD>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </TD>
                      <TD className="text-center">
                        <Link to={`${routes.appeal}/${item.id}`}>
                          <Button variant="ghost" size="icon-sm" aria-label={t('appeal.view')}>
                            <Eye className="size-4" />
                          </Button>
                        </Link>
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
            />
          </>
        )}
      </PageMain>

      <CreateAppealModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  )
}
