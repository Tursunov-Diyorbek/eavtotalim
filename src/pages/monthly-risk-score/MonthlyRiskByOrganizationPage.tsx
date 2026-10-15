import { Fragment, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Minus, Plus } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  Button,
  ConfirmDialog,
  DeleteButton,
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
  Notification,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  RegionDistrict,
  RowActions,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Textarea,
  notify,
} from '@/components/ui'
import {
  createOrgRiskScore,
  deleteTaqdimnomaScore,
  fetchDistricts,
  fetchOrgRiskScores,
  fetchRegions,
  queryKeys,
  updateOrgRiskScore,
} from '@/api'
import { PATH_PREFIX_FILE, routes } from '@/config'
import { useAuth } from '@/features/auth'
import { useOrgRiskScoresQuery, useRiskIndicatorsQuery } from '@/features/risk-indicator'
import { resolveFileUrl } from '@/features/lessons'
import { useOpenedOnce, usePageState } from '@/hooks'
import { asLangName } from '@/lib/apiPage'
import { downloadTableXls, escapeHtml } from '@/pages/region-report/xls'
import type { OrgRiskScoreItem, OrgRiskScoreRow } from '@/types/risk-indicator'

const ADD_TAQDIMNOMA = 'add-risk-indicator-taqdimnoma'
const now = new Date()
const CURRENT_PERIOD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

function splitPeriod(value: string) {
  const [year = '', month = ''] = value.split('-')
  const monthNumber = Number(month)
  return {
    year,
    month: monthNumber >= 1 && monthNumber <= 12 ? String(monthNumber) : '',
  }
}

function placeName(value: unknown, lang: string) {
  const text = asLangName(value, lang)
  return text === '—' ? '' : text
}

function orgName(row: OrgRiskScoreRow) {
  return row.organization?.name || row.organization?.name_uz || ''
}

function stamp() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`
}

export function MonthlyRiskByOrganizationPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const canAddTaqdimnoma = hasPermission(ADD_TAQDIMNOMA)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expanded, setExpanded] = useState<number[]>([])
  const [exporting, setExporting] = useState(false)
  const [period, setPeriod] = usePageState('period', CURRENT_PERIOD)
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [organizationInn, setOrganizationInn] = usePageState('organizationInn', '')
  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(regionId))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(areaId))
  const { year, month } = splitPeriod(period)

  const [createOrg, setCreateOrg] = useState<OrgRiskScoreRow | null>(null)
  const [createRiskId, setCreateRiskId] = useState('')
  const [createScore, setCreateScore] = useState('')
  const [createNote, setCreateNote] = useState('')
  const [createFile, setCreateFile] = useState<File | null>(null)
  const [createKey, setCreateKey] = useState(0)

  const [updateItem, setUpdateItem] = useState<OrgRiskScoreItem | null>(null)
  const [updateScore, setUpdateScore] = useState('')
  const [updateNote, setUpdateNote] = useState('')
  const [updateFile, setUpdateFile] = useState<File | null>(null)
  const [updateKey, setUpdateKey] = useState(0)

  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    setPage(1)
    setExpanded([])
  }, [period, regionId, areaId, organizationInn, pageSize])

  const filters = { inn: organizationInn, regionId, areaId, month, year }
  const { data, isLoading, isError } = useOrgRiskScoresQuery({
    ...filters,
    page,
    showCount: pageSize,
  })
  const regionsQuery = useQuery({
    queryKey: ['risk-by-organization', 'region-options'],
    queryFn: fetchRegions,
    enabled: regionsEnabled,
  })
  const areasQuery = useQuery({
    queryKey: ['risk-by-organization', 'area-options', regionId],
    queryFn: () => fetchDistricts(regionId),
    enabled: areasEnabled && Boolean(regionId),
  })
  const indicators = useRiskIndicatorsQuery(Boolean(createOrg))

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const regionOptions = (regionsQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const areaOptions = (areasQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const indicatorOptions = (indicators.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || '—',
  }))

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.riskIndicator.all })
  }

  const createMutation = useMutation({
    mutationFn: createOrgRiskScore,
    onSuccess: () => {
      notify.success(t('monthlyRiskByOrgPage.saved'))
      setCreateOrg(null)
      refresh()
    },
    onError: (error: Error) => notify.error(error.message || t('monthlyRiskByOrgPage.saveError')),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: number; form: FormData }) => updateOrgRiskScore(id, form),
    onSuccess: () => {
      notify.success(t('monthlyRiskByOrgPage.saved'))
      setUpdateItem(null)
      refresh()
    },
    onError: (error: Error) => notify.error(error.message || t('monthlyRiskByOrgPage.saveError')),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteTaqdimnomaScore,
    onSuccess: () => {
      notify.success(t('monthlyRiskByOrgPage.deleted'))
      setDeleteId(null)
      refresh()
    },
    onError: (error: Error) => notify.error(error.message || t('monthlyRiskByOrgPage.deleteError')),
  })

  function resetFilters() {
    setPeriod(CURRENT_PERIOD)
    setRegionId('')
    setAreaId('')
    setOrganizationInn('')
    setPage(1)
  }

  function openCreate(row: OrgRiskScoreRow, riskId = '') {
    setCreateOrg(row)
    setCreateRiskId(riskId)
    setCreateScore('')
    setCreateNote('')
    setCreateFile(null)
    setCreateKey((value) => value + 1)
  }

  function openUpdate(item: OrgRiskScoreItem) {
    setUpdateItem(item)
    setUpdateScore(
      item.monthly_risk_indicator_score?.score == null
        ? ''
        : String(item.monthly_risk_indicator_score.score),
    )
    setUpdateNote(item.monthly_risk_indicator_score?.description || '')
    setUpdateFile(null)
    setUpdateKey((value) => value + 1)
  }

  function submitCreate() {
    const organizationId = createOrg?.organization?.id
    if (!organizationId || !createRiskId || createScore === '' || !month || !year) {
      notify.warning(t('monthlyRiskByOrgPage.required'))
      return
    }
    const form = new FormData()
    form.append('organization_id', String(organizationId))
    form.append('risk_indicator_id', createRiskId)
    form.append('year', year)
    form.append('month', month)
    form.append('score', createScore)
    form.append('description', createNote)
    if (createFile) form.append('file', createFile)
    createMutation.mutate(form)
  }

  function submitUpdate() {
    const id = updateItem?.monthly_risk_indicator_score?.id
    if (!id) return
    const form = new FormData()
    form.append('risk_indicator_id', String(id))
    form.append('score', updateScore || String(updateItem.monthly_risk_indicator_score?.score ?? ''))
    form.append(
      'description',
      updateNote || updateItem.monthly_risk_indicator_score?.description || '',
    )
    if (updateFile) form.append('file', updateFile)
    updateMutation.mutate({ id, form })
  }

  async function exportXls() {
    if (!month || !year) {
      notify.warning(t('monthlyRiskScorePage.needPeriod'))
      return
    }
    setExporting(true)
    try {
      const result = await fetchOrgRiskScores({ ...filters, page: 1, showCount: 100000 })
      const names: string[] = []
      for (const row of result.data) {
        for (const item of row.risk_indicators ?? []) {
          const name = item.risk_indicator?.name?.trim()
          if (name && !names.includes(name)) names.push(name)
        }
      }
      const head = [
        '№',
        t('common.organization'),
        t('monthlyRiskByOrgPage.total'),
        t('common.regionDistrict'),
        ...names,
      ]
      const body = result.data
        .map((row, index) => {
          const region = placeName(row.organization?.region, i18n.language)
          const area = placeName(row.organization?.area, i18n.language)
          const scores = new Map(
            (row.risk_indicators ?? []).map((item) => [
              item.risk_indicator?.name?.trim() || '',
              item.monthly_risk_indicator_score?.score ?? 0,
            ]),
          )
          const cells = [
            index + 1,
            `${escapeHtml(orgName(row))}${row.organization?.inn ? `<br>${escapeHtml(row.organization.inn)}` : ''}`,
            row.sum_score ?? 0,
            escapeHtml([region, area].filter(Boolean).join(' / ')),
            ...names.map((name) => escapeHtml(String(scores.get(name) ?? 0))),
          ]
          return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
        })
        .join('')
      downloadTableXls(
        `risk-tashkilot_${stamp()}.xls`,
        `<table border="1"><tr>${head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr>${body}</table>`,
      )
      notify.success(t('monthlyRiskScorePage.exported'))
    } catch {
      notify.error(t('monthlyRiskScorePage.exportError'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Header
        title={t('monthlyRiskByOrgPage.title')}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="w-40 shrink-0">
              <Input
                type="month"
                size="sm"
                label=""
                id="org-risk-period"
                name="org-risk-period"
                aria-label={t('monthlyRiskByOrgPage.period')}
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              />
            </div>
            <Select
              size="sm"
              clearable
              className="!w-44 !min-w-44"
              value={regionId}
              onOpen={openRegions}
              loading={regionsQuery.isFetching && regionOptions.length === 0}
              options={regionOptions}
              placeholder={t('monthlyRiskByOrgPage.pickRegion')}
              onChange={(event) => {
                setRegionId(event.target.value)
                setAreaId('')
              }}
            />
            <Select
              size="sm"
              clearable
              className="!w-44 !min-w-44"
              value={areaId}
              disabled={!regionId}
              onOpen={openAreas}
              loading={areasQuery.isFetching && areaOptions.length === 0}
              options={areaOptions}
              placeholder={t('monthlyRiskByOrgPage.pickArea')}
              onChange={(event) => setAreaId(event.target.value)}
            />
            {canAddTaqdimnoma ? (
              <AddButton onClick={() => navigate(routes.addTaqdimnoma)}>
                {t('monthlyRiskByOrgPage.addTaqdimnoma')}
              </AddButton>
            ) : null}
            <ExportButton loading={exporting} onClick={() => void exportXls()}>
              Excel
            </ExportButton>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              {t('monthlyRiskScorePage.clear')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <Notification tone="warning" className="shrink-0">
            {t('monthlyRiskByOrgPage.hint')}
          </Notification>
          {isError ? (
            <ErrorMessage />
          ) : isLoading && !data ? (
            <ListPageSkeleton rows={8} />
          ) : (
            <>
              <Table storageKey="monthly-risk-by-organization">
                <THead>
                  <HeaderTR>
                    <TH className="w-16">№</TH>
                    <TH className="w-72 min-w-72 max-w-72">{t('common.organization')}</TH>
                    <TH className="w-48 min-w-48">{t('common.regionDistrict')}</TH>
                    <TH className="w-28">{t('monthlyRiskByOrgPage.total')}</TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH />
                    <FilterTH>
                      <OrganizationSelect
                        size="sm"
                        className="!w-full !min-w-64"
                        value={organizationInn}
                        onChange={(event) => setOrganizationInn(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH />
                    <FilterTH />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={4} />
                  ) : (
                    rows.map((row, index) => {
                      const id = row.organization?.id
                      const isOpen = id != null && expanded.includes(id)
                      const name = orgName(row)
                      return (
                        <Fragment key={id ?? index}>
                          <TR>
                            <TD className="text-center">
                              <span className="inline-flex items-center justify-center gap-1">
                                {id != null ? (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-expanded={isOpen}
                                    aria-label={t('monthlyRiskByOrgPage.toggle')}
                                    onClick={() =>
                                      setExpanded((prev) =>
                                        prev.includes(id)
                                          ? prev.filter((item) => item !== id)
                                          : [...prev, id],
                                      )
                                    }
                                  >
                                    {isOpen ? (
                                      <Minus className="size-3.5" aria-hidden />
                                    ) : (
                                      <Plus className="size-3.5" aria-hidden />
                                    )}
                                  </Button>
                                ) : null}
                                <span className="text-muted">
                                  {(page - 1) * pageSize + index + 1}
                                </span>
                              </span>
                            </TD>
                            <TD className="w-72 max-w-72 overflow-hidden">
                              <OrganizationLabel
                                stacked
                                className="max-w-full [&>span]:block [&>span]:max-w-full [&>span]:min-w-0"
                                name={name}
                                inn={row.organization?.inn}
                              />
                            </TD>
                            <TD className="w-48 max-w-48 overflow-hidden">
                              <RegionDistrict
                                region={placeName(row.organization?.region, i18n.language)}
                                district={placeName(row.organization?.area, i18n.language)}
                              />
                            </TD>
                            <TD className="text-center">
                              <Badge tone="signal">{row.sum_score ?? 0}</Badge>
                            </TD>
                          </TR>
                          {isOpen ? (
                            <TR>
                              <TD className="bg-fog/40 p-3" colSpan={4}>
                                <IndicatorTable
                                  items={row.risk_indicators ?? []}
                                  onEdit={(item) => {
                                    if (item.monthly_risk_indicator_score?.id) openUpdate(item)
                                    else openCreate(row, String(item.risk_indicator?.id ?? ''))
                                  }}
                                  onDelete={(scoreId) => setDeleteId(scoreId)}
                                />
                                <div className="mt-2 flex justify-end">
                                  <AddButton onClick={() => openCreate(row)}>
                                    {t('monthlyRiskByOrgPage.addScore')}
                                  </AddButton>
                                </div>
                              </TD>
                            </TR>
                          ) : null}
                        </Fragment>
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

      <Modal
        open={Boolean(createOrg)}
        onClose={() => setCreateOrg(null)}
        title={orgName(createOrg ?? {}) || t('monthlyRiskByOrgPage.addScore')}
        sizeClassName="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateOrg(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createMutation.isPending}
              onClick={submitCreate}
            >
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <Select
            label={t('monthlyRiskScorePage.indicator')}
            value={createRiskId}
            options={indicatorOptions}
            loading={indicators.isFetching && indicatorOptions.length === 0}
            onChange={(event) => setCreateRiskId(event.target.value)}
          />
          <Input
            label={t('monthlyRiskScorePage.score')}
            type="number"
            required
            value={createScore}
            onChange={(event) => setCreateScore(event.target.value)}
          />
          <Input
            key={createKey}
            label={t('monthlyRiskByOrgPage.file')}
            type="file"
            onChange={(event) => setCreateFile(event.target.files?.[0] ?? null)}
          />
          <Textarea
            label={t('monthlyRiskByOrgPage.note')}
            rows={3}
            value={createNote}
            onChange={(event) => setCreateNote(event.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(updateItem)}
        onClose={() => setUpdateItem(null)}
        title={`${updateItem?.risk_indicator?.name || ''} (${t('common.edit')})`}
        sizeClassName="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setUpdateItem(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={updateMutation.isPending}
              onClick={submitUpdate}
            >
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <Input
            label={t('monthlyRiskScorePage.score')}
            type="number"
            value={updateScore}
            onChange={(event) => setUpdateScore(event.target.value)}
          />
          <Input
            key={updateKey}
            label={t('monthlyRiskByOrgPage.replaceFile')}
            type="file"
            onChange={(event) => setUpdateFile(event.target.files?.[0] ?? null)}
          />
          <Textarea
            label={t('monthlyRiskByOrgPage.note')}
            rows={3}
            value={updateNote}
            onChange={(event) => setUpdateNote(event.target.value)}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId != null}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId != null) deleteMutation.mutate(deleteId)
        }}
      />
    </>
  )
}

function IndicatorTable({
  items,
  onEdit,
  onDelete,
}: {
  items: OrgRiskScoreItem[]
  onEdit: (item: OrgRiskScoreItem) => void
  onDelete: (id: number) => void
}) {
  const { t } = useTranslation()
  return (
    <Table storageKey="org-risk-indicators" columnToggle={false} bordered={false}>
      <THead>
        <HeaderTR>
          <TH className="min-w-48">{t('monthlyRiskScorePage.indicator')}</TH>
          <TH className="min-w-64">{t('monthlyRiskByOrgPage.description')}</TH>
          <TH className="w-16">{t('monthlyRiskScorePage.score')}</TH>
          <TH className="min-w-40">{t('monthlyRiskByOrgPage.note')}</TH>
          <TH className="w-14">{t('monthlyRiskByOrgPage.file')}</TH>
          <TH className="w-24">{t('monthlyRiskByOrgPage.actions')}</TH>
        </HeaderTR>
      </THead>
      <TBody>
        {items.length === 0 ? (
          <EmptyTR colSpan={6} />
        ) : (
          items.map((item, index) => {
            const score = item.monthly_risk_indicator_score
            const fileUrl = score?.file_path
              ? resolveFileUrl(score.file_path, PATH_PREFIX_FILE)
              : ''
            const canDelete = item.risk_indicator?.code === 'taqdimnoma' && score?.id != null
            return (
              <TR key={item.risk_indicator?.id ?? index}>
                <TD className="max-w-xs whitespace-pre-wrap">{item.risk_indicator?.name || '—'}</TD>
                <TD className="max-w-md whitespace-pre-wrap text-[13px] leading-snug">
                  {item.risk_indicator?.description || '—'}
                </TD>
                <TD className="text-center">{score?.score ?? '—'}</TD>
                <TD className="max-w-xs whitespace-pre-wrap text-[13px]">
                  {score?.description || '—'}
                </TD>
                <TD className="text-center">
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-signal"
                      aria-label={t('monthlyRiskByOrgPage.file')}
                    >
                      <FileText className="size-4" aria-hidden />
                    </a>
                  ) : (
                    '—'
                  )}
                </TD>
                <TD>
                  <RowActions>
                    <EditButton onClick={() => onEdit(item)} />
                    {canDelete && score?.id != null ? (
                      <DeleteButton onClick={() => onDelete(score.id!)} />
                    ) : null}
                  </RowActions>
                </TD>
              </TR>
            )
          })
        )}
      </TBody>
    </Table>
  )
}
