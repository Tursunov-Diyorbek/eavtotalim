import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Lock, Shield } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  Button,
  ConfirmDialog,
  DeleteButton,
  DetailList,
  EditButton,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  FilterTH,
  FilterTR,
  HeaderTR,
  Input,
  ListPageSkeleton,
  Modal,
  notify,
  Pagination,
  Panel,
  Select,
  ShowButton,
  Table,
  TableSearch,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { fetchRegions, fetchUserPassword } from '@/api'
import { StudentAccessModal } from '@/pages/students/StudentAccessModal'
import {
  useRegionRoadSafetyMutations,
  useRegionRoadSafetyQuery,
} from '@/features/region-road-safety'
import { useOpenedOnce, usePageState } from '@/hooks'
import type { RegionRoadSafetyOfficer } from '@/types/region-road-safety'

type FormState = {
  regionId: string
  lastName: string
  firstName: string
  middleName: string
  username: string
  password: string
  status: string
}

const EMPTY_FORM: FormState = {
  regionId: '',
  lastName: '',
  firstName: '',
  middleName: '',
  username: '',
  password: '',
  status: '1',
}

function fullName(row: RegionRoadSafetyOfficer) {
  return [row.lastName, row.firstName, row.middleName].filter(Boolean).join(' ')
}

function downloadXls(filename: string, rows: RegionRoadSafetyOfficer[], active: string, inactive: string) {
  const body = rows
    .map(
      (row, index) =>
        `<tr><td>${index + 1}</td><td>${fullName(row)}</td><td>${row.regionName}</td><td>${row.status === 1 ? active : inactive}</td></tr>`,
    )
    .join('')
  const html = `<table border="1"><tr><th>№</th><th>F.I.Sh</th><th>Viloyat</th><th>Holati</th></tr>${body}</table>`
  const blob = new Blob([`\uFEFF${html}`], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function RegionRoadSafetyPage() {
  const { t } = useTranslation()
  const query = useRegionRoadSafetyQuery()
  const { create, update, remove } = useRegionRoadSafetyMutations()
  const [search, setSearch] = usePageState('q', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RegionRoadSafetyOfficer | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [viewing, setViewing] = useState<RegionRoadSafetyOfficer | null>(null)
  const [accessRow, setAccessRow] = useState<RegionRoadSafetyOfficer | null>(null)
  const [deleteRow, setDeleteRow] = useState<RegionRoadSafetyOfficer | null>(null)
  const [regionsEnabled, openRegions] = useOpenedOnce(false)

  const regions = useQuery({
    queryKey: ['regions', 'region-road-safety'],
    queryFn: fetchRegions,
    enabled: regionsEnabled || formOpen,
  })

  const rows = query.data ?? []
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => fullName(row).toLowerCase().includes(q))
  }, [rows, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
    openRegions()
  }

  async function openEdit(row: RegionRoadSafetyOfficer) {
    setEditing(row)
    setForm({
      regionId: row.regionId ? String(row.regionId) : '',
      lastName: row.lastName,
      firstName: row.firstName,
      middleName: row.middleName,
      username: row.username,
      password: '',
      status: row.status === 1 ? '1' : '',
    })
    setFormOpen(true)
    openRegions()
    if (row.userId) {
      try {
        const creds = await fetchUserPassword(String(row.userId))
        setForm((current) => ({
          ...current,
          username: creds.username || current.username,
          password: creds.password || '',
        }))
      } catch {
        /* parol keyinroq qo'lda yoziladi */
      }
    }
  }

  function submit() {
    if (!form.regionId || !form.lastName.trim() || !form.firstName.trim() || !form.middleName.trim() || !form.username.trim() || !form.password) {
      notify.warning(t('regionRoadPage.fillRequired'))
      return
    }
    const input = {
      region_id: Number(form.regionId),
      last_name: form.lastName.trim(),
      first_name: form.firstName.trim(),
      middle_name: form.middleName.trim(),
      username: form.username.trim(),
      password: form.password,
      status: editing ? (form.status === '1' ? 1 : null) : undefined,
    }
    if (editing) {
      update.mutate(
        { id: editing.id, input },
        { onSuccess: () => setFormOpen(false) },
      )
      return
    }
    create.mutate(input, { onSuccess: () => setFormOpen(false) })
  }

  const regionOptions = (regions.data ?? []).map((region) => ({
    value: String(region.id),
    label: region.name || '—',
  }))

  return (
    <>
      <Header
        title={t('regionRoadPage.title')}
        actions={
          <div className="flex items-end gap-2">
            <ExportButton
              onClick={() =>
                downloadXls(
                  "Viloyat inspeksiya xodimlar ro'yxati.xls",
                  rows,
                  t('dashboard.active'),
                  t('dashboard.inactive'),
                )
              }
            >
              {t('regionRoadPage.export')}
            </ExportButton>
            <AddButton onClick={openCreate} />
          </div>
        }
      />
      <PageMain fill>
        <Panel padding="sm" className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-signal-soft text-signal">
              <Shield className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-deep">
                {t('regionRoadPage.cardTitle')}
              </div>
              <div className="truncate text-[12px] text-muted">{t('regionRoadPage.cardHint')}</div>
            </div>
          </div>
          <div className="font-display text-2xl font-semibold tabular-nums text-deep">
            {rows.length}
          </div>
        </Panel>

        {query.isLoading && !query.data ? (
          <ListPageSkeleton />
        ) : query.isError ? (
          <ErrorMessage />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table>
              <THead>
                <HeaderTR>
                  <TH column="n" className="w-12 text-center">№</TH>
                  <TH column="name">{t('regionRoadPage.name')}</TH>
                  <TH column="region">{t('regionRoadPage.region')}</TH>
                  <TH column="status" className="w-28 text-center">{t('regionRoadPage.status')}</TH>
                  <TH column="actions" className="w-36 text-center">{t('common.actions')}</TH>
                </HeaderTR>
                <FilterTR>
                  <FilterTH />
                  <FilterTH>
                    <TableSearch
                      value={search}
                      debounceMs={0}
                      onChange={(event) => {
                        setSearch(event.target.value)
                        setPage(1)
                      }}
                      aria-label={t('regionRoadPage.name')}
                    />
                  </FilterTH>
                  <FilterTH />
                  <FilterTH />
                  <FilterTH />
                </FilterTR>
              </THead>
              <TBody>
                {pageRows.length === 0 ? (
                  <EmptyTR colSpan={5} />
                ) : (
                  pageRows.map((row, index) => (
                    <TR key={row.id}>
                      <TD className="text-center tabular-nums">
                        {(safePage - 1) * pageSize + index + 1}
                      </TD>
                      <TD>{fullName(row) || '—'}</TD>
                      <TD>{row.regionName || '—'}</TD>
                      <TD className="text-center">
                        <Badge tone={row.status === 1 ? 'teal' : 'rose'}>
                          {row.status === 1 ? t('dashboard.active') : t('dashboard.inactive')}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="soft"
                            size="icon-sm"
                            aria-label={t('students.showPage.autoLoginTitle')}
                            onClick={() => setAccessRow(row)}
                          >
                            <Lock className="size-3.5" />
                          </Button>
                          <EditButton onClick={() => void openEdit(row)} />
                          <ShowButton onClick={() => setViewing(row)} />
                          <DeleteButton onClick={() => setDeleteRow(row)} />
                        </div>
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
          page={safePage}
          pageSize={pageSize}
          total={filtered.length}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t('regionRoadPage.editTitle') : t('regionRoadPage.addTitle')}
        sizeClassName="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button loading={create.isPending || update.isPending} onClick={submit}>
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <Select
            label={t('regionRoadPage.region')}
            value={form.regionId}
            onOpen={openRegions}
            loading={regions.isFetching && regionOptions.length === 0}
            options={regionOptions}
            placeholder={t('regionRoadPage.pickRegion')}
            onChange={(event) => setForm((current) => ({ ...current, regionId: event.target.value }))}
          />
          <Input
            label={t('regionRoadPage.lastName')}
            value={form.lastName}
            onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
          />
          <Input
            label={t('regionRoadPage.firstName')}
            value={form.firstName}
            onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
          />
          <Input
            label={t('regionRoadPage.middleName')}
            value={form.middleName}
            onChange={(event) => setForm((current) => ({ ...current, middleName: event.target.value }))}
          />
          {editing ? (
            <Select
              label={t('regionRoadPage.status')}
              value={form.status}
              options={[
                { value: '1', label: t('dashboard.active') },
                { value: '', label: t('dashboard.inactive') },
              ]}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            />
          ) : null}
          <Input
            label={t('regionRoadPage.login')}
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          />
          <Input
            label={t('regionRoadPage.password')}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={t('regionRoadPage.showTitle')}
        sizeClassName="max-w-md"
      >
        {viewing ? (
          <DetailList
            dense
            items={[
              { label: t('regionRoadPage.lastName'), value: viewing.lastName || '—' },
              { label: t('regionRoadPage.firstName'), value: viewing.firstName || '—' },
              { label: t('regionRoadPage.middleName'), value: viewing.middleName || '—' },
              { label: t('regionRoadPage.region'), value: viewing.regionName || '—' },
              {
                label: t('regionRoadPage.status'),
                value: viewing.status === 1 ? t('dashboard.active') : t('dashboard.inactive'),
              },
              { label: t('regionRoadPage.login'), value: viewing.username || '—' },
            ]}
          />
        ) : null}
      </Modal>

      <StudentAccessModal
        open={accessRow != null}
        onClose={() => setAccessRow(null)}
        student={
          accessRow
            ? {
                id: accessRow.id,
                user_id: accessRow.userId,
                last_name: accessRow.lastName,
                first_name: accessRow.firstName,
                middle_name: accessRow.middleName,
              }
            : null
        }
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        loading={remove.isPending}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => {
          if (!deleteRow) return
          remove.mutate(deleteRow.id, { onSuccess: () => setDeleteRow(null) })
        }}
      />
    </>
  )
}
