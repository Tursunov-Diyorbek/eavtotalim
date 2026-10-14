import { Fragment, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Minus, Plus } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  FilterTH,
  ListPageSkeleton,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  RegionDistrict,
  SearchInput,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import {
  ABSENCE_REASON_ORGANIZATION_ACCESS,
  ABSENCE_REASON_REGION_ACCESS,
  PATH_PREFIX_FILE,
  studentPath,
} from '@/config'
import { fetchDistricts, fetchRegions } from '@/api'
import { useAuth } from '@/features/auth'
import { useAbsenceReasonByStudentQuery } from '@/features/absence-reason'
import { useGroupsQuery } from '@/features/groups'
import { useOpenedOnce, usePageState } from '@/hooks'
import { resolveFileUrl } from '@/features/lessons'
import { asFio, asLangName, asText } from '@/lib/apiPage'
import { formatDate, formatNumber } from '@/lib/format'
import type {
  AbsenceReasonRow,
  AbsenceReasonStatus,
  StudentAbsenceByStudentRow,
} from '@/types/absence-reason'

function studentIdOf(row: StudentAbsenceByStudentRow) {
  return row.student_id ?? row.student?.id ?? null
}

function statusTone(status: AbsenceReasonStatus | null | undefined) {
  if (status === 'approved') return 'teal' as const
  if (status === 'pending' || status === 'pending_rollback') return 'signal' as const
  if (status === 'rolled_back') return 'amber' as const
  return 'rose' as const
}

function statusLabel(
  status: AbsenceReasonStatus | null | undefined,
  t: (key: string) => string,
) {
  if (status === 'approved') return t('absenceReasonPage.statusApproved')
  if (status === 'pending') return t('absenceReasonPage.statusPending')
  if (status === 'pending_rollback') return t('absenceReasonPage.statusPendingRollback')
  if (status === 'rolled_back') return t('absenceReasonPage.statusRolledBack')
  return t('absenceReasonPage.statusRejected')
}

function NameLink({
  id,
  children,
}: {
  id: number | null
  children: string
}) {
  const navigate = useNavigate()
  if (!id || children === '—') return <>{children || '—'}</>
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto px-0 py-0 font-medium text-signal hover:underline"
      onClick={() => navigate(studentPath(id))}
    >
      {children}
    </Button>
  )
}

function ApplicationsTable({
  rows,
  canRegion,
  canOrg,
}: {
  rows: AbsenceReasonRow[]
  canRegion: boolean
  canOrg: boolean
}) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const colSpan = 8 + (canOrg ? 1 : 0) + (canRegion ? 1 : 0)

  return (
    <Table storageKey="reason-student-absence-apps" columnToggle={false} bordered={false}>
      <THead>
        <TR>
          <TH className="w-10">№</TH>
          <TH>{t('directorList.fio')}</TH>
          <TH>{t('directorList.group')}</TH>
          <TH>{t('directorList.eduType')}</TH>
          <TH>{t('missedClasses.fromDate')}</TH>
          <TH>{t('missedClasses.toDate')}</TH>
          {canOrg ? (
            <TH className="w-64 max-w-64">{t('common.organization')}</TH>
          ) : null}
          {canRegion ? <TH>{t('common.regionDistrict')}</TH> : null}
          <TH>{t('absenceReasonPage.baseFile')}</TH>
          <TH>{t('directorList.status')}</TH>
        </TR>
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <TR>
            <TD className="py-6 text-center" colSpan={colSpan}>
              <EmptyState className="border-0 py-3" description={t('common.empty')} />
            </TD>
          </TR>
        ) : (
          rows.map((row, index) => {
            const id = row.student?.id ?? row.student_id ?? null
            const docUrl = resolveFileUrl(row.document_url, PATH_PREFIX_FILE)
            return (
              <TR key={row.id}>
                <TD className="text-center text-muted">{index + 1}</TD>
                <TD>
                  {id ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                      onClick={() => navigate(studentPath(id))}
                    >
                      {asFio(row.student ?? row)}
                    </Button>
                  ) : (
                    asFio(row.student ?? row)
                  )}
                </TD>
                <TD className="whitespace-nowrap">{asLangName(row.group, i18n.language)}</TD>
                <TD>{asText(row.group?.edu_type?.short_name)}</TD>
                <TD>{formatDate(row.from_date, i18n.language) ?? '—'}</TD>
                <TD>{formatDate(row.to_date, i18n.language) ?? '—'}</TD>
                {canOrg ? (
                  <TD className="w-64 max-w-64 overflow-hidden">
                    <OrganizationLabel
                      stacked
                      className="max-w-full [&>span]:block [&>span]:max-w-full [&>span]:min-w-0"
                      name={row.organization?.name}
                      inn={row.organization?.inn}
                    />
                  </TD>
                ) : null}
                {canRegion ? (
                  <TD>
                    <RegionDistrict
                      region={row.organization?.region?.name}
                      district={row.organization?.area?.name}
                    />
                  </TD>
                ) : null}
                <TD>
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
                <TD>
                  <Badge tone={statusTone(row.status)}>
                    {statusLabel(row.status, t)}
                  </Badge>
                </TD>
              </TR>
            )
          })
        )}
      </TBody>
    </Table>
  )
}

export function ReasonStudentAbsencePage() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const canRegion = hasPermission(ABSENCE_REASON_REGION_ACCESS)
  const canOrg = hasPermission(ABSENCE_REASON_ORGANIZATION_ACCESS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [groupId, setGroupId] = usePageState('groupId', '')
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [organizationId, setOrganizationId] = usePageState('organization', '')
  const [lastName, setLastName] = usePageState('lastName', '')
  const [firstName, setFirstName] = usePageState('firstName', '')
  const [middleName, setMiddleName] = usePageState('middleName', '')
  const [expanded, setExpanded] = useState<number[]>([])
  const appliedRegion = canRegion ? regionId : ''
  const appliedArea = canRegion ? areaId : ''
  const appliedOrg = canOrg ? organizationId : ''

  useEffect(() => {
    setPage(1)
    setExpanded([])
  }, [groupId, lastName, firstName, middleName, pageSize, appliedRegion, appliedArea, appliedOrg])

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
    queryKey: ['reason-student-absence', 'region-options'],
    queryFn: fetchRegions,
    enabled: regionsEnabled,
  })
  const areasQuery = useQuery({
    queryKey: ['reason-student-absence', 'area-options', appliedRegion],
    queryFn: () => fetchDistricts(appliedRegion),
    enabled: areasEnabled && Boolean(appliedRegion),
  })
  const { data, isLoading, isError } = useAbsenceReasonByStudentQuery({
    page,
    showCount: pageSize,
    groupId,
    lastName,
    firstName,
    middleName,
    regionId: appliedRegion,
    areaId: appliedArea,
    organizationId: appliedOrg,
  })
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

  const toggleExpand = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  return (
    <>
      <Header
        title={t('nav.reasonStudentAbsence')}
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
          </div>
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="reason-student-absence">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" className="w-14">
                  №
                </TH>
                <TH column="lastName">{t('students.lastName')}</TH>
                <TH column="firstName">{t('students.firstName')}</TH>
                <TH column="middleName">{t('reasonStudentAbsencePage.fatherName')}</TH>
                <TH column="lessons" className="w-40 text-center">
                  {t('reasonStudentAbsencePage.lessonsCount')}
                </TH>
                <TH column="excused" className="w-48 text-center">
                  {t('reasonStudentAbsencePage.excusedCount')}
                </TH>
                <TH column="nb" className="w-28 text-center">
                  {t('reasonStudentAbsencePage.nbCount')}
                </TH>
                <TH column="untilNow" className="w-52 text-center">
                  {t('reasonStudentAbsencePage.untilNow')}
                </TH>
              </TR>
              <TR className="bg-white hover:bg-transparent">
                <FilterTH column="index" />
                <FilterTH column="lastName">
                  <SearchInput
                    size="sm"
                    id="rsa-last-name"
                    name="rsa-last-name"
                    label={t('students.lastName')}
                    placeholder={t('reasonStudentAbsencePage.search')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="firstName">
                  <SearchInput
                    size="sm"
                    id="rsa-first-name"
                    name="rsa-first-name"
                    label={t('students.firstName')}
                    placeholder={t('reasonStudentAbsencePage.search')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="middleName">
                  <SearchInput
                    size="sm"
                    id="rsa-middle-name"
                    name="rsa-middle-name"
                    label={t('reasonStudentAbsencePage.fatherName')}
                    placeholder={t('reasonStudentAbsencePage.search')}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="lessons" />
                <FilterTH column="excused" />
                <FilterTH column="nb" />
                <FilterTH column="untilNow" />
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={8}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const id = studentIdOf(row)
                  const key = id ?? index
                  const apps = row.applications ?? []
                  const canExpand = apps.length > 0
                  const isOpen = id != null && expanded.includes(id)
                  return (
                    <Fragment key={String(key)}>
                      <TR>
                        <TD column="index" className="text-center">
                          <span className="inline-flex items-center justify-center gap-1">
                            {canExpand && id != null ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-expanded={isOpen}
                                aria-label={t('reasonStudentAbsencePage.toggleApps')}
                                onClick={() => toggleExpand(id)}
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
                        <TD column="lastName">
                          <NameLink id={id}>
                            {row.student?.last_name?.trim() || '—'}
                          </NameLink>
                        </TD>
                        <TD column="firstName">
                          <NameLink id={id}>
                            {row.student?.first_name?.trim() || '—'}
                          </NameLink>
                        </TD>
                        <TD column="middleName">
                          <NameLink id={id}>
                            {row.student?.middle_name?.trim() || '—'}
                          </NameLink>
                        </TD>
                        <TD column="lessons" className="text-center">
                          {formatNumber(row.lessons_count)}
                        </TD>
                        <TD column="excused" className="text-center">
                          {formatNumber(row.sum_reason_lesson)}
                        </TD>
                        <TD column="nb" className="text-center">
                          {formatNumber(row.all_absences_count)}
                        </TD>
                        <TD column="untilNow" className="text-center">
                          {formatNumber(row.lessons_until_now)}
                        </TD>
                      </TR>
                      {isOpen ? (
                        <TR>
                          <TD className="bg-fog/50 p-3" colSpan={8}>
                            <ApplicationsTable rows={apps} canRegion={canRegion} canOrg={canOrg} />
                          </TD>
                        </TR>
                      ) : null}
                    </Fragment>
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
    </>
  )
}
