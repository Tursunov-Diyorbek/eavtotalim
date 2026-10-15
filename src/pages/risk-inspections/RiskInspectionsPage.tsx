import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Check, Play } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  Button,
  ConfirmDialog,
  DateInput,
  DeleteButton,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Notification,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  RowActions,
  Select,
  Table,
  TBody,
  TD,
  Textarea,
  TH,
  THead,
  TR,
  notify,
  type BadgeTone,
} from '@/components/ui'
import {
  completeRiskInspection,
  createRiskInspection,
  deleteRiskInspection,
  queryKeys,
  startRiskInspection,
} from '@/api'
import { useAuth } from '@/features/auth'
import { useRiskInspectionsQuery } from '@/features/risk-indicator'
import { usePageState } from '@/hooks'
import { formatDate } from '@/lib/format'
import type { RiskInspectionRow } from '@/types/risk-inspection'

const ADD_INSPECTION = 'add-risk-indicator-inspection'

function todayIso() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function statusCode(status: RiskInspectionRow['status']) {
  if (!status || typeof status === 'string') return status || ''
  return status.code || ''
}

function statusView(
  status: RiskInspectionRow['status'],
  t: (key: string) => string,
): { label: string; tone: BadgeTone } {
  const code = statusCode(status)
  const text = status && typeof status === 'object' ? status.text : ''
  if (code === 'completed' || (status && typeof status === 'object' && status.color === 'green')) {
    return { label: text || t('riskInspectionsPage.completed'), tone: 'teal' }
  }
  if (code === 'in_progress' || code === 'in-progress') {
    return { label: text || t('riskInspectionsPage.inProgress'), tone: 'signal' }
  }
  if (code === 'new' || code === 'pending') {
    return { label: text || t('riskInspectionsPage.new'), tone: 'amber' }
  }
  return { label: text || code || '—', tone: 'neutral' }
}

function orgName(row: RiskInspectionRow) {
  return row.organization?.name || row.organization?.name_uz || ''
}

export function RiskInspectionsPage() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const canAdd = hasPermission(ADD_INSPECTION)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [organizationName, setOrganizationName] = usePageState('organization', '')
  const [status, setStatus] = usePageState('status', '')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    setPage(1)
  }, [organizationName, status, pageSize])

  const filters = { organizationName, status }
  const { data, isLoading, isError } = useRiskInspectionsQuery({
    ...filters,
    page,
    showCount: pageSize,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.riskIndicator.all })
  }

  const remove = useMutation({
    mutationFn: deleteRiskInspection,
    onSuccess: (res) => {
      if (!(res.status === 1 || res.status === true || res.status === '1')) {
        notify.error(res.message || t('riskInspectionsPage.deleteError'))
        return
      }
      notify.success(t('riskInspectionsPage.deleted'))
      setDeleteId(null)
      refresh()
    },
    onError: (error: Error) => notify.error(error.message || t('riskInspectionsPage.deleteError')),
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, next }: { id: number; next: 'in_progress' | 'completed' }) =>
      next === 'in_progress' ? startRiskInspection(id) : completeRiskInspection(id),
    onSuccess: (res) => {
      if (!(res.status === 1 || res.status === true || res.status === '1')) {
        notify.error(res.message || t('riskInspectionsPage.statusError'))
        return
      }
      notify.success(t('riskInspectionsPage.statusSaved'))
      refresh()
    },
    onError: (error: Error) => notify.error(error.message || t('riskInspectionsPage.statusError')),
  })

  function resetFilters() {
    setOrganizationName('')
    setStatus('')
    setPage(1)
  }

  const statusOptions = [
    { value: 'new', label: t('riskInspectionsPage.new') },
    { value: 'in_progress', label: t('riskInspectionsPage.inProgress') },
    { value: 'completed', label: t('riskInspectionsPage.completed') },
  ]

  return (
    <>
      <Header
        title={t('riskInspectionsPage.title')}
        actions={
          <div className="flex items-center gap-2">
            {canAdd ? (
              <AddButton onClick={() => setAddOpen(true)}>{t('common.add')}</AddButton>
            ) : null}
            <Button variant="outline" size="sm" onClick={resetFilters}>
              {t('monthlyRiskScorePage.clear')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <Notification tone="warning" className="shrink-0">
            {t('riskInspectionsPage.hint')}
          </Notification>
          {isError ? (
            <ErrorMessage />
          ) : isLoading && !data ? (
            <ListPageSkeleton rows={8} />
          ) : (
            <>
              <Table storageKey="risk-inspections">
                <THead>
                  <HeaderTR>
                    <TH className="w-12">№</TH>
                    <TH className="w-72 min-w-72 max-w-72">{t('common.organization')}</TH>
                    <TH>{t('riskInspectionsPage.period')}</TH>
                    <TH className="min-w-52">{t('riskInspectionsPage.inspectors')}</TH>
                    <TH className="w-36">{t('riskInspectionsPage.status')}</TH>
                    <TH>{t('riskInspectorsPage.createdAt')}</TH>
                    <TH className="w-28">{t('monthlyRiskByOrgPage.actions')}</TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH />
                    <FilterTH>
                      <OrganizationSelect
                        size="sm"
                        valueKey="name"
                        className="!w-full !min-w-64"
                        value={organizationName}
                        onChange={(event) => setOrganizationName(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH />
                    <FilterTH />
                    <FilterTH>
                      <Select
                        size="sm"
                        clearable
                        className="!w-full !min-w-32"
                        value={status}
                        options={statusOptions}
                        placeholder={t('riskInspectionsPage.status')}
                        onChange={(event) => setStatus(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH />
                    <FilterTH />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={7} />
                  ) : (
                    rows.map((row, index) => {
                      const view = statusView(row.status, t)
                      const code = statusCode(row.status)
                      const month = Number(row.month)
                      const period =
                        month >= 1 && month <= 12
                          ? `${t(`autodromeAttendancePage.month${month}`)} ${row.year ?? ''}`
                          : '—'
                      const names = (row.inspectors ?? [])
                        .map((item) => item.full_name?.trim())
                        .filter(Boolean) as string[]
                      return (
                        <TR key={row.id}>
                          <TD className="text-center">{(page - 1) * pageSize + index + 1}</TD>
                          <TD className="w-72 max-w-72 overflow-hidden">
                            <OrganizationLabel
                              stacked
                              className="max-w-full [&>span]:block [&>span]:max-w-full [&>span]:min-w-0"
                              name={orgName(row)}
                              inn={row.organization?.inn}
                            />
                          </TD>
                          <TD className="text-center">{period}</TD>
                          <TD className="max-w-64 overflow-hidden">
                            {names.length === 0 ? (
                              '—'
                            ) : (
                              names.map((name) => (
                                <span key={name} className="block truncate text-[13px]" title={name}>
                                  {name}
                                </span>
                              ))
                            )}
                          </TD>
                          <TD className="text-center">
                            <Badge tone={view.tone}>{view.label}</Badge>
                          </TD>
                          <TD className="text-center">{formatDate(row.created_at) || '—'}</TD>
                          <TD>
                            <RowActions>
                              {code === 'new' ? (
                                <Button
                                  variant="soft"
                                  size="icon-sm"
                                  aria-label={t('riskInspectionsPage.start')}
                                  disabled={changeStatus.isPending}
                                  onClick={() =>
                                    changeStatus.mutate({ id: row.id, next: 'in_progress' })
                                  }
                                >
                                  <Play className="size-3.5" aria-hidden />
                                </Button>
                              ) : null}
                              {code === 'in_progress' ? (
                                <Button
                                  variant="soft"
                                  size="icon-sm"
                                  aria-label={t('riskInspectionsPage.complete')}
                                  disabled={changeStatus.isPending}
                                  onClick={() =>
                                    changeStatus.mutate({ id: row.id, next: 'completed' })
                                  }
                                >
                                  <Check className="size-3.5" aria-hidden />
                                </Button>
                              ) : null}
                              <DeleteButton onClick={() => setDeleteId(row.id)} />
                            </RowActions>
                          </TD>
                        </TR>
                      )
                    })
                  )}
                </TBody>
              </Table>
              <Pagination
                className="shrink-0"
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      </PageMain>

      <AddInspectionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false)
          refresh()
        }}
      />
      <ConfirmDialog
        open={deleteId != null}
        loading={remove.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId != null) remove.mutate(deleteId)
        }}
      />
    </>
  )
}

function AddInspectionModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const yearNow = new Date().getFullYear()
  const [organizationId, setOrganizationId] = useState('')
  const [year, setYear] = useState(String(yearNow))
  const [month, setMonth] = useState('')
  const [inspectionDate, setInspectionDate] = useState('')
  const [description, setDescription] = useState('')

  function close() {
    setOrganizationId('')
    setYear(String(yearNow))
    setMonth('')
    setInspectionDate('')
    setDescription('')
    onClose()
  }

  const save = useMutation({
    mutationFn: createRiskInspection,
    onSuccess: (res) => {
      if (!(res.status === 1 || res.status === true || res.status === '1')) {
        notify.error(res.message || t('riskInspectionsPage.saveError'))
        return
      }
      notify.success(t('riskInspectionsPage.saved'))
      setOrganizationId('')
      setYear(String(yearNow))
      setMonth('')
      setInspectionDate('')
      setDescription('')
      onSaved()
    },
    onError: (error: Error) => notify.error(error.message || t('riskInspectionsPage.saveError')),
  })

  function submit() {
    if (!organizationId || !year || !month || !inspectionDate) {
      notify.warning(t('monthlyRiskByOrgPage.required'))
      return
    }
    save.mutate({
      organization_id: organizationId,
      year: Number(year),
      month: Number(month),
      inspection_date: inspectionDate,
      description: description.trim(),
    })
  }

  const yearOptions = Array.from({ length: Math.max(1, yearNow - 2025 + 1) }, (_, index) => {
    const value = String(2025 + index)
    return { value, label: value }
  })
  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: t(`autodromeAttendancePage.month${index + 1}`),
  }))

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('riskInspectionsPage.addTitle')}
      sizeClassName="max-w-xl"
      headerExtra={
        <Button
          variant="primary"
          size="sm"
          className="shrink-0"
          loading={save.isPending}
          onClick={submit}
        >
          {t('common.save')}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <OrganizationSelect
          label={t('common.organization')}
          size="md"
          valueKey="id"
          className="!w-full"
          value={organizationId}
          onChange={(event) => setOrganizationId(event.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label={t('monthlyRiskScorePage.year')}
            value={year}
            options={yearOptions}
            onChange={(event) => setYear(event.target.value)}
          />
          <Select
            label={t('monthlyRiskScorePage.month')}
            value={month}
            options={monthOptions}
            placeholder={t('monthlyRiskScorePage.month')}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>
        <DateInput
          label={t('riskInspectionsPage.inspectionDate')}
          required
          min={todayIso()}
          value={inspectionDate}
          onChange={(event) => setInspectionDate(event.target.value)}
        />
        <Textarea
          label={t('monthlyRiskByOrgPage.description')}
          rows={4}
          maxLength={500}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          hint={t('riskInspectionsPage.descriptionHint')}
        />
      </div>
    </Modal>
  )
}
