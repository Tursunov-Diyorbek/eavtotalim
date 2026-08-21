import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  EmptyState,
  ErrorMessage,
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
  notify,
} from '@/components/ui'
import { carEditPath, carShowPath, EDU_TYPES, routes } from '@/config'
import { useCarCountsQuery, useCarsQuery, useDeleteCarMutation } from '@/features/cars'
import { formatNumber } from '@/lib/format'
import type { CarItem } from '@/types/cars'

export function CarsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [status, setStatus] = useState('')
  const [gaiStatus, setGaiStatus] = useState('')
  const [mspdStatus, setMspdStatus] = useState('')
  const [eduTypeId, setEduTypeId] = useState('')
  const [deleteRow, setDeleteRow] = useState<CarItem | null>(null)

  useEffect(() => {
    setPage(1)
  }, [name, number, status, gaiStatus, mspdStatus, eduTypeId, pageSize])

  const { data: counts } = useCarCountsQuery()
  const { data, isLoading, isError, refetch, isFetching } = useCarsQuery({
    page,
    showCount: pageSize,
    name,
    number,
    status,
    gaiStatus,
    mspdStatus,
    eduTypeId: eduTypeId ? Number(eduTypeId) : null,
  })
  const deleteMutation = useDeleteCarMutation()

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const confirmDelete = () => {
    if (!deleteRow) return
    deleteMutation.mutate(deleteRow.id, {
      onSuccess: () => {
        notify.success(t('common.deleted'))
        setDeleteRow(null)
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  return (
    <>
      <Header
        title={t('carsPage.title')}
        description={`${t('common.all')}: ${formatNumber(counts?.all)} · ${t('dashboard.active')}: ${formatNumber(counts?.active)} · ${t('dashboard.inactive')}: ${formatNumber(counts?.inactive)}`}
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
              onClick={() => navigate(routes.carsAdd)}
            >
              <Plus className="size-3.5" aria-hidden />
              {t('carsPage.add')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label={t('carsPage.eduType')}
            value={eduTypeId}
            onChange={(e) => setEduTypeId(e.target.value)}
            options={[
              { value: '', label: t('groupsPage.allTypes') },
              ...EDU_TYPES.map((item) => ({
                value: item.id,
                label: item.shortName,
              })),
            ]}
          />
          <Select
            label={t('directorList.status')}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: '', label: t('common.all') },
              { value: '1', label: t('dashboard.active') },
              { value: '0', label: t('dashboard.inactive') },
            ]}
          />
          <Select
            label={t('carsPage.gai')}
            value={gaiStatus}
            onChange={(e) => setGaiStatus(e.target.value)}
            options={[
              { value: '', label: t('common.all') },
              { value: '1', label: t('dashboard.active') },
              { value: '0', label: t('dashboard.inactive') },
            ]}
          />
          <Select
            label={t('carsPage.mspd')}
            value={mspdStatus}
            onChange={(e) => setMspdStatus(e.target.value)}
            options={[
              { value: '', label: t('common.all') },
              { value: '0', label: t('teachersPage.mspdPending') },
              { value: '1', label: t('teachersPage.mspdOk') },
              { value: '2', label: t('teachersPage.mspdBad') },
            ]}
          />
        </div>

        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="w-10">№</TH>
                <TH>{t('directorList.name')}</TH>
                <TH>{t('directorList.number')}</TH>
                <TH>{t('directorList.year')}</TH>
                <TH>{t('carsPage.gai')}</TH>
                <TH>{t('directorList.status')}</TH>
                <TH>{t('carsPage.mspd')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
              <TR className="hover:bg-transparent bg-white">
                <FilterTH />
                <FilterTH>
                  <SearchInput
                    size="sm"
                    label={t('directorList.name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    size="sm"
                    label={t('directorList.number')}
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </FilterTH>
                <FilterTH />
                <FilterTH />
                <FilterTH />
                <FilterTH />
                <FilterTH />
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={8}>
                    <EmptyState className="border-0 py-4" description={t('common.empty')} />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-muted">
                    {(page - 1) * pageSize + index + 1}
                  </TD>
                  <TD className="font-medium text-ink">{row.name || '—'}</TD>
                  <TD className="whitespace-nowrap">{row.number || '—'}</TD>
                  <TD>{row.year_of_manufacture ?? '—'}</TD>
                  <TD>
                    <Badge tone={Number(row.gai_status) === 1 ? 'teal' : 'rose'}>
                      {Number(row.gai_status) === 1
                        ? t('dashboard.active')
                        : t('dashboard.inactive')}
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
                    <div className="flex gap-1">
                      <ShowButton onClick={() => navigate(carShowPath(row.id))} />
                      <EditButton onClick={() => navigate(carEditPath(row.id))} />
                      <DeleteButton onClick={() => setDeleteRow(row)} />
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

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onClose={() => setDeleteRow(null)}
        onConfirm={confirmDelete}
        description={t('common.confirmDelete', {
          name: deleteRow?.number || deleteRow?.name,
        })}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
