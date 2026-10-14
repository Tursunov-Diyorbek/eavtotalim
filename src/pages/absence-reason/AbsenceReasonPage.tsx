import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  RotateCcw,
  Undo2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  RegionDistrict,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
  type BadgeTone,
} from '@/components/ui'
import { PATH_PREFIX_FILE, studentPath, ABSENCE_REASON_ORGANIZATION_ACCESS, ABSENCE_REASON_REGION_ACCESS } from '@/config'
import { fetchDistricts, fetchRegions } from '@/api'
import { useAuth } from '@/features/auth'
import {
  useAbsenceReasonIndexQuery,
  useRollbackAbsenceReasonMutation,
} from '@/features/absence-reason'
import { useGroupsQuery } from '@/features/groups'
import { useOpenedOnce, usePageState } from '@/hooks'
import { resolveFileUrl } from '@/features/lessons'
import { asFio, asLangName } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import type { AbsenceReasonStatus } from '@/types/absence-reason'
import { AbsenceReasonCreateModal } from './AbsenceReasonCreateModal'

function statusMeta(
  status: AbsenceReasonStatus | null | undefined,
  t: (key: string) => string,
): { label: string; tone: BadgeTone; Icon: LucideIcon } {
  if (status === 'approved') {
    return {
      label: t('absenceReasonPage.statusApproved'),
      tone: 'teal',
      Icon: CheckCircle2,
    }
  }
  if (status === 'pending') {
    return {
      label: t('absenceReasonPage.statusPending'),
      tone: 'signal',
      Icon: RefreshCw,
    }
  }
  if (status === 'pending_rollback') {
    return {
      label: t('absenceReasonPage.statusPendingRollback'),
      tone: 'signal',
      Icon: Clock,
    }
  }
  if (status === 'rolled_back') {
    return {
      label: t('absenceReasonPage.statusRolledBack'),
      tone: 'amber',
      Icon: Undo2,
    }
  }
  return {
    label: t('absenceReasonPage.statusRejected'),
    tone: 'rose',
    Icon: XCircle,
  }
}

export function AbsenceReasonPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canRegion = hasPermission(ABSENCE_REASON_REGION_ACCESS)
  const canOrg = hasPermission(ABSENCE_REASON_ORGANIZATION_ACCESS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [groupId, setGroupId] = usePageState('groupId', '')
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [organizationId, setOrganizationId] = usePageState('organization', '')
  const [createOpen, setCreateOpen] = useState(false)
  const [rollbackId, setRollbackId] = useState<number | null>(null)
  const appliedRegion = canRegion ? regionId : ''
  const appliedArea = canRegion ? areaId : ''
  const appliedOrg = canOrg ? organizationId : ''

  useEffect(() => {
    setPage(1)
  }, [groupId, pageSize, appliedRegion, appliedArea, appliedOrg])

  const [groupsEnabled, openGroups] = useOpenedOnce(Boolean(groupId))
  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(appliedRegion))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(appliedArea))
  const groupsQuery = useGroupsQuery(
    {
      page: 1,
      showCount: 3000,
      eduStatus: 'all',
    },
    groupsEnabled,
  )
  const regionsQuery = useQuery({
    queryKey: ['absence-reason', 'region-options'],
    queryFn: fetchRegions,
    enabled: regionsEnabled,
  })
  const areasQuery = useQuery({
    queryKey: ['absence-reason', 'area-options', appliedRegion],
    queryFn: () => fetchDistricts(appliedRegion),
    enabled: areasEnabled && Boolean(appliedRegion),
  })
  const { data, isLoading, isError } = useAbsenceReasonIndexQuery({
    page,
    showCount: pageSize,
    groupId,
    regionId: appliedRegion,
    areaId: appliedArea,
    organizationId: appliedOrg,
  })
  const rollbackMutation = useRollbackAbsenceReasonMutation()
  const groups = groupsQuery.data?.data ?? []
  const regionOptions = (regionsQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const areaOptions = (areasQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const colSpan = 8 + (canRegion ? 1 : 0) + (canOrg ? 1 : 0)

  const confirmRollback = () => {
    if (rollbackId == null) return
    rollbackMutation.mutate(rollbackId, {
      onSuccess: () => {
        notify.success(t('absenceReasonPage.rollbackOk'))
        setRollbackId(null)
      },
      onError: (err) =>
        notify.error(err.message || t('absenceReasonPage.rollbackError')),
    })
  }

  return (
    <>
      <Header
        title={t('nav.absenceReasonIndex')}
        actions={
          <div className="flex flex-wrap items-end gap-2">
            {canRegion ? (
              <>
                <Select
                  size="sm"
                  className="w-44"
                  clearable
                  value={regionId}
                  placeholder={t('common.region')}
                  onOpen={openRegions}
                  loading={regionsQuery.isFetching && regionOptions.length === 0}
                  options={regionOptions}
                  onChange={(event) => {
                    setRegionId(event.target.value)
                    setAreaId('')
                  }}
                />
                <Select
                  size="sm"
                  className="w-44"
                  clearable
                  disabled={!regionId}
                  value={areaId}
                  placeholder={t('common.district')}
                  onOpen={openAreas}
                  loading={areasQuery.isFetching && areaOptions.length === 0}
                  options={areaOptions}
                  onChange={(event) => setAreaId(event.target.value)}
                />
              </>
            ) : null}
            {canOrg ? (
              <OrganizationSelect
                size="sm"
                className="!w-72 !min-w-72"
                valueKey="id"
                value={organizationId}
                onChange={(event) => setOrganizationId(event.target.value)}
              />
            ) : null}
            <Select
              size="sm"
              value={groupId}
              className="w-44"
              onOpen={openGroups}
              loading={groupsQuery.isFetching && groups.length === 0}
              onChange={(e) => setGroupId(e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...groups.map((group) => ({
                  value: String(group.id),
                  label: group.name || group.name_uz || String(group.id),
                })),
              ]}
            />
            <Button
              variant="primary"
              size="sm"
              className="h-9"
              onClick={() => setCreateOpen(true)}
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
          <Table storageKey="absence-reason-index">
            <THead>
              <TR>
                <TH column="index" className="w-10">
                  №
                </TH>
                {canRegion ? (
                  <TH column="region">{t('common.regionDistrict')}</TH>
                ) : null}
                {canOrg ? (
                  <TH column="org" className="w-64 min-w-64 max-w-64">
                    {t('common.organization')}
                  </TH>
                ) : null}
                <TH column="group" className="w-28 min-w-28 whitespace-nowrap">
                  {t('directorList.group')}
                </TH>
                <TH column="fio">{t('statsPage.fish')}</TH>
                <TH column="reason">{t('absenceReasonPage.reasonText')}</TH>
                <TH column="file" className="w-28">
                  {t('absenceReasonPage.baseFile')}
                </TH>
                <TH column="dates" className="w-48 text-center">
                  {t('missedClasses.fromDate')} / {t('missedClasses.toDate')}
                </TH>
                <TH column="status" className="w-40">
                  {t('directorList.status')}
                </TH>
                <TH column="actions" className="w-36">
                  {t('common.actions')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={colSpan}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const st = statusMeta(row.status, t)
                  const Icon = st.Icon
                  const docUrl = resolveFileUrl(row.document_url, PATH_PREFIX_FILE)
                  return (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      {canRegion ? (
                        <TD column="region">
                          <RegionDistrict
                            region={row.organization?.region?.name}
                            district={row.organization?.area?.name}
                          />
                        </TD>
                      ) : null}
                      {canOrg ? (
                        <TD column="org" className="w-64 max-w-64 overflow-hidden">
                          <OrganizationLabel
                            stacked
                            className="max-w-full [&>span]:block [&>span]:max-w-full [&>span]:min-w-0"
                            name={row.organization?.name}
                            inn={row.organization?.inn}
                          />
                        </TD>
                      ) : null}
                      <TD column="group" className="whitespace-nowrap">
                        {asLangName(row.group, i18n.language)}
                      </TD>
                      <TD column="fio">
                        {row.student?.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                            onClick={() => navigate(studentPath(row.student!.id!))}
                          >
                            {asFio(row.student)}
                          </Button>
                        ) : (
                          asFio(row.student)
                        )}
                      </TD>
                      <TD column="reason">{row.reason || '—'}</TD>
                      <TD column="file">
                        {docUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                            onClick={() =>
                              window.open(docUrl, '_blank', 'noopener,noreferrer')
                            }
                          >
                            {t('common.view')}
                          </Button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </TD>
                      <TD column="dates" className="text-center">
                        <span className="inline-flex flex-wrap items-center justify-center gap-1">
                          <Badge tone="teal">
                            {formatDate(row.from_date, i18n.language) ?? '—'}
                          </Badge>
                          <Badge tone="rose">
                            {formatDate(row.to_date, i18n.language) ?? '—'}
                          </Badge>
                        </span>
                      </TD>
                      <TD column="status">
                        <Badge tone={st.tone}>
                          <Icon
                            className={
                              row.status === 'pending'
                                ? 'size-3.5 animate-spin'
                                : 'size-3.5'
                            }
                            aria-hidden
                          />
                          {st.label}
                        </Badge>
                      </TD>
                      <TD column="actions">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setRollbackId(row.id)}
                        >
                          <RotateCcw className="size-3.5" aria-hidden />
                          {t('absenceReasonPage.rollback')}
                        </Button>
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
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
      <AbsenceReasonCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <ConfirmDialog
        open={rollbackId != null}
        onClose={() => setRollbackId(null)}
        onConfirm={confirmRollback}
        title={t('absenceReasonPage.rollback')}
        confirmLabel={t('absenceReasonPage.rollback')}
        loading={rollbackMutation.isPending}
      />
    </>
  )
}
