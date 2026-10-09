import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BarChart3, Car, Eraser, LayoutGrid, List, RefreshCw } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  Button,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  EmptyState,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  SafeImage,
  SearchInput,
  Select,
  ShowButton,
  TBody,
  TD,
  TH,
  THead,
  Table,
  Tabs,
  Tooltip,
  TR,
  fieldLabelClassName,
  notify,
} from '@/components/ui'
import { PATH_PREFIX_FILE, carEditPath, carRoadCostPath, carShowPath, EDU_TYPES, groupShowPath, routes } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useCarCountsQuery,
  useCarStatisticsQuery,
  useCarsQuery,
  useDeleteCarMutation,
  useEducationalShareQuery,
  useExportCarsMutation,
  useMspdReferencesQuery,
} from '@/features/cars'
import { resolveFileUrl } from '@/features/lessons'
import { useOpenedOnce, usePageState } from '@/hooks'
import { formatNumber } from '@/lib/format'
import type { CarItem, CarStatGroup } from '@/types/cars'

const STATUS_OPTIONS = [
  { value: '', labelKey: 'common.all' },
  { value: '1', labelKey: 'dashboard.active' },
  { value: '0', labelKey: 'dashboard.inactive' },
] as const

function photoOf(row: CarItem) {
  return resolveFileUrl(row.photo || row.image, PATH_PREFIX_FILE)
}

function activeGroups(row: CarItem) {
  return (row.group_cars ?? []).filter((item) => Number(item.group?.edu_status) === 1)
}

function shareLevel(percent: number) {
  if (percent < 30) return { label: 'Kam', className: 'text-rose' }
  if (percent < 60) return { label: "O'rtacha", className: 'text-amber' }
  return { label: 'Yaxshi', className: 'text-teal' }
}

export function CarsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission, isSuperAdmin } = useAuth()
  const canStats = hasPermission('index-car-statistics')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [name, setName] = usePageState('name', '')
  const [number, setNumber] = usePageState('number', '')
  const [status, setStatus] = usePageState('status', '')
  const [gaiStatus, setGaiStatus] = usePageState('gaiStatus', '')
  const [mspdStatus, setMspdStatus] = usePageState('mspdStatus', '')
  const [eduTypeId, setEduTypeId] = usePageState('eduTypeId', '')
  const [mspdTypeId, setMspdTypeId] = usePageState('mspdTypeId', '')
  const [mspdBodyId, setMspdBodyId] = usePageState('mspdBodyId', '')
  const [organizationId, setOrganizationId] = usePageState('organizationId', '')
  const [educational, setEducational] = usePageState<'' | '0' | '1'>('educational', '')
  const [view, setView] = usePageState<'table' | 'card'>('view', 'table')
  const [exportOpen, setExportOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [deleteRow, setDeleteRow] = useState<CarItem | null>(null)
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null)
  const [refsOn, openRefs] = useOpenedOnce(Boolean(mspdTypeId || mspdBodyId))

  useEffect(() => {
    setPage(1)
  }, [name, number, status, gaiStatus, mspdStatus, eduTypeId, mspdTypeId, mspdBodyId, organizationId, educational, pageSize])

  const filters = {
    page,
    showCount: pageSize,
    name,
    number,
    status,
    gaiStatus,
    mspdStatus,
    eduTypeId: eduTypeId ? Number(eduTypeId) : null,
    mspdTypeId: mspdTypeId ? Number(mspdTypeId) : null,
    mspdBodyTypeId: mspdBodyId ? Number(mspdBodyId) : null,
    organizationId: isSuperAdmin ? organizationId : '',
    educational,
  }
  const { data: counts } = useCarCountsQuery()
  const share = useEducationalShareQuery({ status, mspdStatus })
  const refs = useMspdReferencesQuery(refsOn)
  const { data, isLoading, isError, refetch, isFetching } = useCarsQuery(filters)
  const deleteMutation = useDeleteCarMutation()
  const exportMutation = useExportCarsMutation()

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const shareData = share.data
  const eduPercent = Number(shareData?.educational_percent ?? 0)
  const otherPercent = Number(shareData?.non_educational_percent ?? 0)
  const level = shareLevel(eduPercent)

  const statusOptions = STATUS_OPTIONS.map((item) => ({
    value: item.value,
    label: t(item.labelKey),
  }))
  const mspdOptions = [
    { value: '', label: t('common.all') },
    { value: '1', label: t('carsPage.correct') },
    { value: '2', label: t('carsPage.wrong') },
    { value: '0', label: t('carsPage.checking') },
  ]
  const typeOptions = [
    { value: '', label: t('common.all') },
    ...(refs.data?.types ?? []).map((item) => ({
      value: String(item.id),
      label: item.name || String(item.id),
    })),
  ]
  const bodyOptions = [
    { value: '', label: t('common.all') },
    ...(refs.data?.bodyTypes ?? []).map((item) => ({
      value: String(item.id),
      label: item.name || String(item.id),
    })),
  ]

  function clearFilters() {
    setName('')
    setNumber('')
    setStatus('')
    setGaiStatus('')
    setMspdStatus('')
    setEduTypeId('')
    setMspdTypeId('')
    setMspdBodyId('')
    setOrganizationId('')
    setEducational('')
  }

  function exportAs(format: 'csv' | 'xlsx') {
    setExportOpen(false)
    exportMutation.mutate(
      { filters, format },
      { onError: () => notify.error(t('carsPage.exportFail')) },
    )
  }

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
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CountChip
              label={t('carsPage.allCount')}
              value={counts?.all}
              active={status === ''}
              onClick={() => setStatus('')}
            />
            <CountChip
              label={t('dashboard.active')}
              value={counts?.active}
              active={status === '1'}
              tone="teal"
              onClick={() => setStatus('1')}
            />
            <CountChip
              label={t('dashboard.inactive')}
              value={counts?.inactive}
              active={status === '0'}
              tone="rose"
              onClick={() => setStatus('0')}
            />
            <AddButton onClick={() => navigate(routes.carsAdd)}>{t('carsPage.add')}</AddButton>
          </div>
        }
      />
      <PageMain fill>
        <section className="flex shrink-0 flex-col gap-3 rounded-xl border border-mist/70 bg-white p-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={`min-w-28 rounded-xl px-3 py-2 text-left ${educational === '' ? 'bg-signal-soft' : 'bg-fog'}`}
              onClick={() => setEducational('')}
            >
              <p className="font-display text-2xl font-semibold text-deep">
                {formatNumber(shareData?.total)}
              </p>
              <p className="text-[12px] text-muted">{t('carsPage.shareAll')}</p>
            </button>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-deep">{t('carsPage.shareTitle')}</p>
                <span className={`text-[12px] font-semibold ${level.className}`}>{level.label}</span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-rose/25">
                <div className="h-full bg-teal" style={{ width: `${Math.min(100, eduPercent)}%` }} />
              </div>
              <div className="mt-1 flex justify-between gap-2 text-[12px]">
                <button
                  type="button"
                  className={educational === '1' ? 'font-semibold text-teal' : 'text-teal'}
                  onClick={() => setEducational('1')}
                >
                  {t('carsPage.educational')} {eduPercent}% ({formatNumber(shareData?.educational)})
                </button>
                <button
                  type="button"
                  className={educational === '0' ? 'font-semibold text-rose' : 'text-rose'}
                  onClick={() => setEducational('0')}
                >
                  {t('carsPage.notEducational')} {otherPercent}% ({formatNumber(shareData?.non_educational)})
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Labeled>
              <span className={fieldLabelClassName}>{t('directorList.name')}</span>
              <SearchInput
                size="sm"
                label={t('directorList.name')}
                placeholder={t('carsPage.searchName')}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Labeled>
            <Labeled>
              <span className={fieldLabelClassName}>{t('carsPage.plate')}</span>
              <SearchInput
                size="sm"
                label={t('carsPage.plate')}
                placeholder={t('carsPage.searchNumber')}
                value={number}
                onChange={(event) => setNumber(event.target.value)}
              />
            </Labeled>
            {isSuperAdmin ? (
              <Labeled>
                <span className={fieldLabelClassName}>{t('carsPage.organization')}</span>
                <OrganizationSelect
                  size="sm"
                  valueKey="id"
                  value={organizationId}
                  onChange={(event) => setOrganizationId(event.target.value)}
                />
              </Labeled>
            ) : null}
            <Select size="sm" label={t('carsPage.gai')} value={gaiStatus} onChange={(e) => setGaiStatus(e.target.value)} options={statusOptions} />
            <Select size="sm" label={t('directorList.status')} value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} />
            <Select size="sm" label={t('carsPage.mspd')} value={mspdStatus} onChange={(e) => setMspdStatus(e.target.value)} options={mspdOptions} />
            <Select
              size="sm"
              label={t('carsPage.eduType')}
              value={eduTypeId}
              onChange={(e) => setEduTypeId(e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...EDU_TYPES.map((item) => ({ value: String(item.id), label: item.shortName })),
              ]}
            />
            <Select
              size="sm"
              label={t('carsPage.mspdType')}
              value={mspdTypeId}
              onOpen={openRefs}
              loading={refs.isFetching && typeOptions.length <= 1}
              onChange={(e) => setMspdTypeId(e.target.value)}
              options={typeOptions}
            />
            <Select
              size="sm"
              label={t('carsPage.mspdBody')}
              value={mspdBodyId}
              onOpen={openRefs}
              loading={refs.isFetching && bodyOptions.length <= 1}
              onChange={(e) => setMspdBodyId(e.target.value)}
              options={bodyOptions}
            />
            <Select
              size="sm"
              label={t('carsPage.educationalCar')}
              value={educational}
              onChange={(e) => setEducational(e.target.value as '' | '0' | '1')}
              options={[
                { value: '', label: t('common.all') },
                { value: '1', label: t('carsPage.educational') },
                { value: '0', label: t('carsPage.notEducational') },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={clearFilters}>
                <Eraser className="size-3.5" aria-hidden />
                {t('carsPage.clear')}
              </Button>
              <div className="relative">
                <ExportButton loading={exportMutation.isPending} onClick={() => setExportOpen((v) => !v)}>
                  {t('carsPage.export')}
                </ExportButton>
                {exportOpen ? (
                  <div className="absolute z-20 mt-1 w-64 rounded-xl border border-mist bg-white p-1 shadow-lg">
                    <p className="px-3 py-1.5 text-[12px] text-muted">{t('carsPage.exportHint')}</p>
                    <Button variant="ghost" className="h-9 w-full justify-start" onClick={() => exportAs('csv')}>
                      {t('carsPage.exportCsv')}
                    </Button>
                    <Button variant="ghost" className="h-9 w-full justify-start" onClick={() => exportAs('xlsx')}>
                      {t('carsPage.exportXlsx')}
                    </Button>
                  </div>
                ) : null}
              </div>
              {canStats ? (
                <Button variant="outline" onClick={() => setStatsOpen(true)}>
                  <BarChart3 className="size-3.5" aria-hidden />
                  {t('carsPage.statistics')}
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label={t('common.refresh')} loading={isFetching && !isLoading} onClick={() => void refetch()}>
                <RefreshCw className="size-4" aria-hidden />
              </Button>
              <Button variant="outline" size="icon" active={view === 'table'} aria-label={t('carsPage.tableView')} onClick={() => setView('table')}>
                <List className="size-4" aria-hidden />
              </Button>
              <Button variant="outline" size="icon" active={view === 'card'} aria-label={t('carsPage.cardView')} onClick={() => setView('card')}>
                <LayoutGrid className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </section>

        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : view === 'card' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {rows.length === 0 ? (
              <EmptyState className="col-span-full" description={t('common.empty')} />
            ) : (
              rows.map((row) => (
                <CarCard
                  key={row.id}
                  row={row}
                  onDelete={() => setDeleteRow(row)}
                  onOpenPhoto={setPreview}
                />
              ))
            )}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table fill>
              <THead>
                <HeaderTR>
                  <TH className="w-12 text-center">№</TH>
                  <TH className="w-16">{t('carsPage.photo')}</TH>
                  <TH>{t('directorList.name')}</TH>
                  {isSuperAdmin ? <TH>{t('carsPage.organization')}</TH> : null}
                  <TH>{t('carsPage.plate')}</TH>
                  <TH className="text-center">{t('carsPage.gai')}</TH>
                  <TH className="text-center">{t('directorList.status')}</TH>
                  <TH className="text-center">{t('carsPage.mspd')}</TH>
                  <TH>{t('carsPage.activeGroup')}</TH>
                  <TH>{t('carsPage.eduType')}</TH>
                  <TH>{t('carsPage.typeBody')}</TH>
                  <TH className="text-center">{t('carsPage.educational')}</TH>
                  <TH className="text-center">{t('common.actions')}</TH>
                </HeaderTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={isSuperAdmin ? 13 : 12} description={t('common.empty')} />
                ) : (
                  rows.map((row, index) => (
                    <TR key={row.id}>
                      <TD className="text-center text-muted">{(page - 1) * pageSize + index + 1}</TD>
                      <TD>
                        <CarPhoto
                          src={photoOf(row)}
                          title={[row.name, row.number].filter(Boolean).join(' · ')}
                          className="size-10 rounded-full"
                          onOpen={setPreview}
                        />
                      </TD>
                      <TD className="font-semibold text-deep">{row.name || '—'}</TD>
                      {isSuperAdmin ? (
                        <TD>
                          <OrganizationLabel
                            stacked
                            name={row.organization?.name}
                            inn={row.organization?.inn}
                          />
                        </TD>
                      ) : null}
                      <TD className="whitespace-nowrap">{row.number || '—'}</TD>
                      <TD className="text-center"><StatusBadge on={Number(row.gai_status) === 1} /></TD>
                      <TD className="text-center"><StatusBadge on={Number(row.status) === 1} /></TD>
                      <TD className="text-center"><MspdBadge status={row.mspd_status} checkedAt={row.mspd_check_date} /></TD>
                      <TD><GroupLinks row={row} /></TD>
                      <TD>{row.car_category?.name || '—'}</TD>
                      <TD>
                        <div className="flex flex-col gap-1">
                          <Badge tone={row.mspd_type_name ? 'neutral' : 'amber'}>
                            {row.mspd_type_name || t('carsPage.noType')}
                          </Badge>
                          <Badge tone={row.mspd_body_type_name ? 'neutral' : 'amber'}>
                            {row.mspd_body_type_name || t('carsPage.noBody')}
                          </Badge>
                        </div>
                      </TD>
                      <TD className="text-center">
                        <Badge tone={row.is_educational ? 'teal' : 'rose'}>
                          {row.is_educational ? t('carsPage.educational') : t('carsPage.notEducational')}
                        </Badge>
                      </TD>
                      <TD>
                        <CarActions row={row} onDelete={() => setDeleteRow(row)} />
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </div>
        )}

        <Pagination
          className="shrink-0"
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </PageMain>

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onClose={() => setDeleteRow(null)}
        onConfirm={confirmDelete}
        description={t('common.confirmDelete', { name: deleteRow?.number || deleteRow?.name })}
        loading={deleteMutation.isPending}
      />
      <CarStatisticsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
      <Modal
        open={preview != null}
        onClose={() => setPreview(null)}
        title={preview?.title || t('carsPage.photo')}
        sizeClassName="max-w-3xl"
        bodyClassName="p-3 sm:p-4"
      >
        <SafeImage
          src={preview?.src}
          alt={preview?.title || ''}
          icon={Car}
          size="xl"
          fit="contain"
          className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
        />
      </Modal>
    </>
  )
}

function Labeled({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-1">{children}</div>
}

function CountChip({
  label,
  value,
  active,
  tone = 'signal',
  onClick,
}: {
  label: string
  value?: number
  active: boolean
  tone?: 'signal' | 'teal' | 'rose'
  onClick: () => void
}) {
  const toneClass =
    tone === 'teal' ? 'text-teal' : tone === 'rose' ? 'text-rose' : 'text-signal'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] ${
        active ? 'border-signal bg-signal-soft' : 'border-mist bg-white'
      }`}
    >
      <span className="text-muted">{label}</span>
      <span className={`font-semibold ${toneClass}`}>{formatNumber(value)}</span>
    </button>
  )
}

function StatusBadge({ on }: { on: boolean }) {
  const { t } = useTranslation()
  return (
    <Badge tone={on ? 'teal' : 'rose'}>
      {on ? t('dashboard.active') : t('dashboard.inactive')}
    </Badge>
  )
}

function MspdBadge({
  status,
  checkedAt,
}: {
  status?: number | string | null
  checkedAt?: string | null
}) {
  const { t } = useTranslation()
  const value = Number(status)
  const label =
    value === 1 ? t('carsPage.correct') : value === 2 ? t('carsPage.wrong') : t('carsPage.checking')
  const tone = value === 1 ? 'teal' : value === 2 ? 'rose' : 'amber'
  const badge = <Badge tone={tone}>{label}</Badge>
  if (value !== 2) return badge
  return (
    <Tooltip content={checkedAt ? `${t('carsPage.checkedAt')}: ${checkedAt}` : t('carsPage.checkedAt')}>
      {badge}
    </Tooltip>
  )
}

function GroupLinks({ row }: { row: CarItem }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const groups = activeGroups(row)
  if (groups.length === 0) {
    return <Badge tone="teal">{t('carsPage.freeToUse')}</Badge>
  }
  return (
    <div className="flex flex-col gap-1">
      {groups.map((item) =>
        item.group?.id == null ? null : (
          <Button
            key={item.group.id}
            variant="link"
            size="inline"
            onClick={() => navigate(groupShowPath(item.group!.id!))}
          >
            {item.group.name || '—'}
          </Button>
        ),
      )}
    </div>
  )
}

function CarActions({ row, onDelete }: { row: CarItem; onDelete: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-center gap-1">
      <Tooltip content={t('carsPage.printRoad')}>
        <Button
          variant="soft"
          size="icon-sm"
          aria-label={t('carsPage.printRoad')}
          onClick={() => navigate(carRoadCostPath(row.id))}
        >
          <Car className="size-3.5" aria-hidden />
        </Button>
      </Tooltip>
      <ShowButton onClick={() => navigate(carShowPath(row.id))} />
      <EditButton onClick={() => navigate(carEditPath(row.id))} />
      <DeleteButton onClick={onDelete} />
    </div>
  )
}

function CarPhoto({
  src,
  title,
  className,
  buttonClassName = '!size-10 !rounded-full !p-0',
  onOpen,
}: {
  src: string
  title: string
  className: string
  buttonClassName?: string
  onOpen: (photo: { src: string; title: string }) => void
}) {
  const { t } = useTranslation()
  const label = title || t('carsPage.photo')
  if (!src) {
    return <SafeImage src="" alt={label} icon={Car} size="sm" fit="cover" className={className} />
  }
  return (
    <Button
      variant="ghost"
      size="inline"
      className={buttonClassName}
      aria-label={label}
      onClick={() => onOpen({ src, title: label })}
    >
      <SafeImage src={src} alt={label} icon={Car} size="sm" fit="cover" className={className} />
    </Button>
  )
}

function CarCard({
  row,
  onDelete,
  onOpenPhoto,
}: {
  row: CarItem
  onDelete: () => void
  onOpenPhoto: (photo: { src: string; title: string }) => void
}) {
  const { t } = useTranslation()
  const teacher = [row.teacher?.last_name, row.teacher?.first_name?.[0], row.teacher?.middle_name?.[0]]
    .filter(Boolean)
    .join(' ')
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-mist/80 bg-white p-3">
      <CarPhoto
        src={photoOf(row)}
        title={[row.name, row.number].filter(Boolean).join(' · ')}
        className="h-28 w-full rounded-lg"
        buttonClassName="!h-28 !w-full !rounded-lg !p-0"
        onOpen={onOpenPhoto}
      />
      <p className="text-[13px]"><span className="text-muted">{t('carsPage.plate')}: </span>{row.number || '—'}</p>
      <p className="text-[13px]"><span className="text-muted">{t('carsPage.eduType')}: </span>{row.car_category?.name || '—'}</p>
      <p className="text-[13px]"><span className="text-muted">{t('carsPage.year')}: </span>{row.year_of_manufacture ?? '—'}</p>
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="text-muted">{t('carsPage.gai')}</span>
        <StatusBadge on={Number(row.gai_status) === 1} />
      </div>
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="text-muted">{t('directorList.status')}</span>
        <StatusBadge on={Number(row.status) === 1} />
      </div>
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="text-muted">{t('carsPage.mspd')}</span>
        <MspdBadge status={row.mspd_status} checkedAt={row.mspd_check_date} />
      </div>
      <p className="text-[13px]">
        <span className="text-muted">{t('carsPage.teacher')}: </span>
        {teacher || t('carsPage.unassigned')}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted">{t('common.actions')}</span>
        <CarActions row={row} onDelete={onDelete} />
      </div>
    </article>
  )
}

function CarStatisticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState('')
  const [mspdStatus, setMspdStatus] = useState('')
  const [tab, setTab] = useState<'body' | 'transport'>('body')
  const query = useCarStatisticsQuery({ status, mspdStatus }, open)
  const groups = tab === 'body' ? query.data?.body_types ?? [] : query.data?.transport_types ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('carsPage.statisticsTitle')}
      sizeClassName="max-w-3xl"
      maxHeightClassName="h-[min(90svh,720px)]"
      bodyClassName="flex flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="mb-3 flex shrink-0 flex-wrap gap-2">
        <Select
          size="sm"
          label={t('directorList.status')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS.map((item) => ({ value: item.value, label: t(item.labelKey) }))}
        />
        <Select
          size="sm"
          label={t('carsPage.mspd')}
          value={mspdStatus}
          onChange={(e) => setMspdStatus(e.target.value)}
          options={[
            { value: '', label: t('common.all') },
            { value: '1', label: t('carsPage.correct') },
            { value: '2', label: t('carsPage.wrong') },
            { value: '0', label: t('carsPage.checking') },
          ]}
        />
      </div>
      <Tabs
        size="sm"
        className="mt-1 mb-3 shrink-0"
        items={[
          { value: 'body', label: t('carsPage.bodyTab') },
          { value: 'transport', label: t('carsPage.transportTab') },
        ]}
        value={tab}
        onChange={(value) => setTab(value as 'body' | 'transport')}
      />
      {query.isLoading ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <ListPageSkeleton rows={4} />
        </div>
      ) : query.isError ? (
        <ErrorMessage />
      ) : (
        <Table fill>
          <THead>
            <HeaderTR>
              <TH>{tab === 'body' ? t('carsPage.mspdBody') : t('carsPage.mspdType')}</TH>
              <TH className="text-center">{t('carsPage.count')}</TH>
              <TH>{t('carsPage.byCategory')}</TH>
            </HeaderTR>
          </THead>
          <TBody>
            {groups.length === 0 ? (
              <EmptyTR colSpan={3} description={t('common.empty')} />
            ) : (
              groups.map((row: CarStatGroup, index) => (
                <TR key={String(row.id ?? index)}>
                  <TD className="font-semibold">{row.name || '—'}</TD>
                  <TD className="text-center">{formatNumber(row.count)}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {(row.categories ?? []).map((item, i) => (
                        <Badge key={i} tone="neutral">
                          {item.car_category_name}: {formatNumber(item.count)}
                        </Badge>
                      ))}
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      )}
    </Modal>
  )
}
