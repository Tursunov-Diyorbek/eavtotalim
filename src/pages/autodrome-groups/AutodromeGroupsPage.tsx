import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Flag, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  DateInput,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  Panel,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tabs,
} from '@/components/ui'
import { EDU_TYPES } from '@/config/eduTypes'
import {
  useAutodromeOrgGroupCountsQuery,
  useAutodromeOrgGroupsQuery,
  useAutodromeOrgSchoolsQuery,
  useGeneralEduTypesQuery,
} from '@/features/autodrome-groups'
import { useOpenedOnce, usePageState } from '@/hooks'
import { formatDate } from '@/lib/format'
import type { AutodromeOrgGroupRow } from '@/types/autodrome-groups'

type TabKey = 'groups' | 'schools'

function orgTitle(row: AutodromeOrgGroupRow) {
  return row.organization?.name?.trim() || row.organization?.name_uz?.trim() || '—'
}

function isConfirmed(row: AutodromeOrgGroupRow) {
  return String(row.group?.mygov_confirmation_status ?? '') === 'confirmed'
}

function isActive(status: AutodromeOrgGroupRow['status']) {
  return String(status ?? '') === '1'
}

export function AutodromeGroupsPage() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = usePageState<TabKey>('tab', 'groups')

  return (
    <>
      <Header title={t('autodromeGroupsPage.title')} />
      <PageMain fill>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <Tabs
            className="shrink-0"
            variant="line"
            aria-label={t('autodromeGroupsPage.title')}
            value={tab}
            onChange={setTab}
            items={[
              { value: 'groups', label: t('autodromeGroupsPage.allGroups') },
              { value: 'schools', label: t('autodromeGroupsPage.bySchools') },
            ]}
          />
          {tab === 'groups' ? (
            <GroupsTab lang={i18n.language} />
          ) : (
            <SchoolsTab />
          )}
        </div>
      </PageMain>
    </>
  )
}

function CountCard({
  icon,
  iconClass,
  label,
  value,
}: {
  icon: ReactNode
  iconClass: string
  label: string
  value: number
}) {
  return (
    <Panel className="flex items-center gap-3 px-3 py-2.5">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] text-muted">{label}</p>
        <p className="font-display text-xl leading-none font-semibold text-deep">{value}</p>
      </div>
    </Panel>
  )
}

function GroupsTab({ lang }: { lang: string }) {
  const { t } = useTranslation()
  const [organization, setOrganization] = usePageState('orgInn', '')
  const [status, setStatus] = usePageState('groupStatus', '1')
  const [eduTypeId, setEduTypeId] = usePageState('edu', '')
  const [startDate, setStartDate] = usePageState('start', '')
  const [endDate, setEndDate] = usePageState('end', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [eduEnabled, openEdu] = useOpenedOnce(Boolean(eduTypeId))
  const filterKey = [organization, status, eduTypeId, startDate, endDate, pageSize].join('|')
  const filterRef = useRef(filterKey)

  useEffect(() => {
    if (filterRef.current === filterKey) return
    filterRef.current = filterKey
    setPage(1)
  }, [filterKey])

  const counts = useAutodromeOrgGroupCountsQuery()
  const eduTypes = useGeneralEduTypesQuery(eduEnabled)
  const query = useAutodromeOrgGroupsQuery({
    page,
    showCount: pageSize,
    organization,
    status,
    eduTypeId,
    startDate,
    endDate,
  })

  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const eduOptions =
    eduTypes.data && eduTypes.data.length > 0
      ? eduTypes.data.map((item) => ({
          value: String(item.id),
          label: item.short_name || item.character_name || item.name || String(item.id),
        }))
      : EDU_TYPES.map((item) => ({ value: String(item.id), label: item.shortName }))

  if (query.isLoading && !query.data) return <ListPageSkeleton rows={8} />

  return (
    <>
      <div className="grid shrink-0 gap-2 sm:grid-cols-2">
        <CountCard
          icon={<Users className="size-4" aria-hidden />}
          iconClass="bg-teal-soft text-teal"
          label={t('autodromeGroupsPage.activeCount')}
          value={counts.data?.active ?? 0}
        />
        <CountCard
          icon={<Flag className="size-4" aria-hidden />}
          iconClass="bg-rose-soft text-rose"
          label={t('autodromeGroupsPage.endedCount')}
          value={counts.data?.ended ?? 0}
        />
      </div>
      {query.isError ? <ErrorMessage /> : null}
      <div className="flex min-h-0 flex-1 flex-col">
        <Table storageKey="autodrome-groups">
          <THead>
            <HeaderTR>
              <TH column="n" className="w-12 text-center">
                №
              </TH>
              <TH column="group" className="min-w-24">
                {t('autodromeGroupsPage.group')}
              </TH>
              <TH column="org" className="min-w-64">
                {t('autodromeGroupsPage.org')}
              </TH>
              <TH column="edu" className="min-w-28">
                {t('autodromeGroupsPage.edu')}
              </TH>
              <TH column="dates" className="text-center">
                <span className="mx-auto block w-[16.5rem] whitespace-normal leading-tight">
                  {t('autodromeGroupsPage.dates')}
                </span>
              </TH>
              <TH column="mygov" className="min-w-32 text-center">
                {t('autodromeGroupsPage.mygov')}
              </TH>
              <TH column="status" className="min-w-28 text-center">
                {t('autodromeGroupsPage.status')}
              </TH>
            </HeaderTR>
            <FilterTR>
              <FilterTH column="n" />
              <FilterTH column="group" />
              <FilterTH column="org">
                <OrganizationSelect
                  size="sm"
                  className="w-full min-w-56"
                  id="adg-org"
                  name="adg-org"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </FilterTH>
              <FilterTH column="edu">
                <Select
                  id="adg-edu"
                  name="adg-edu"
                  size="sm"
                  value={eduTypeId}
                  placeholder={t('autodromeGroupsPage.all')}
                  onOpen={openEdu}
                  loading={eduTypes.isFetching && eduOptions.length === 0}
                  onChange={(e) => setEduTypeId(e.target.value)}
                  options={[{ value: '', label: t('autodromeGroupsPage.all') }, ...eduOptions]}
                />
              </FilterTH>
              <FilterTH column="dates">
                <div className="mx-auto flex w-fit gap-1">
                  <DateInput
                    size="sm"
                    className="w-[7.75rem]"
                    id="adg-start"
                    name="adg-start"
                    placeholder={t('autodromeGroupsPage.start')}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <DateInput
                    size="sm"
                    className="w-[7.75rem]"
                    id="adg-end"
                    name="adg-end"
                    placeholder={t('autodromeGroupsPage.end')}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </FilterTH>
              <FilterTH column="mygov" />
              <FilterTH column="status">
                <Select
                  id="adg-status"
                  name="adg-status"
                  size="sm"
                  value={status}
                  placeholder={t('autodromeGroupsPage.all')}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: '', label: t('autodromeGroupsPage.all') },
                    { value: '1', label: t('autodromeGroupsPage.active') },
                    { value: '2', label: t('autodromeGroupsPage.ended') },
                  ]}
                />
              </FilterTH>
            </FilterTR>
          </THead>
          <TBody>
            {query.isError || rows.length === 0 ? (
              query.isError ? null : (
                <EmptyTR colSpan={7} description={t('autodromeGroupsPage.empty')} />
              )
            ) : (
              rows.map((row, index) => {
                const confirmed = isConfirmed(row)
                const active = isActive(row.status)
                return (
                  <TR key={row.id}>
                    <TD column="n" className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD column="group">{row.group?.name || '—'}</TD>
                    <TD column="org" className="min-w-64">
                      <span className="flex min-w-0 items-baseline gap-1">
                        <span className="shrink-0 font-medium text-rose">
                          {row.organization?.inn || '—'}
                        </span>
                        <span className="text-muted">—</span>
                        <span className="max-w-56 truncate" title={orgTitle(row)}>
                          {orgTitle(row)}
                        </span>
                      </span>
                    </TD>
                    <TD column="edu">
                      {row.edu_type?.character_name || row.edu_type?.short_name || '—'}
                    </TD>
                    <TD column="dates">
                      <span className="inline-flex flex-wrap justify-center gap-1">
                        <Badge tone="neutral">
                          {formatDate(row.group?.edu_starting_date, lang) ?? '—'}
                        </Badge>
                        <Badge tone="neutral">
                          {formatDate(row.group?.edu_ending_date, lang) ?? '—'}
                        </Badge>
                      </span>
                    </TD>
                    <TD column="mygov" className="text-center">
                      <Badge tone={confirmed ? 'teal' : 'rose'}>
                        {confirmed
                          ? t('autodromeGroupsPage.confirmed')
                          : t('autodromeGroupsPage.unconfirmed')}
                      </Badge>
                    </TD>
                    <TD column="status" className="text-center">
                      <Badge tone={active ? 'teal' : 'rose'}>
                        {active
                          ? t('autodromeGroupsPage.active')
                          : t('autodromeGroupsPage.ended')}
                      </Badge>
                    </TD>
                  </TR>
                )
              })
            )}
          </TBody>
        </Table>
      </div>
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
  )
}

function SchoolsTab() {
  const { t } = useTranslation()
  const [inn, setInn] = usePageState('schoolOrg', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const filterKey = [inn, pageSize].join('|')
  const filterRef = useRef(filterKey)

  useEffect(() => {
    if (filterRef.current === filterKey) return
    filterRef.current = filterKey
    setPage(1)
  }, [filterKey])

  const query = useAutodromeOrgSchoolsQuery({ page, showCount: pageSize, inn })
  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  if (query.isError) return <ErrorMessage />
  if (query.isLoading) return <ListPageSkeleton rows={8} />

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <Table storageKey="autodrome-group-schools">
          <THead>
            <HeaderTR>
              <TH column="n" className="w-12 text-center">
                №
              </TH>
              <TH column="org" className="min-w-64">
                {t('autodromeGroupsPage.org')}
              </TH>
              <TH column="total" className="text-center">
                {t('autodromeGroupsPage.allGroupsCount')}
              </TH>
              <TH column="active" className="text-center">
                {t('autodromeGroupsPage.activeGroups')}
              </TH>
              <TH column="ended" className="text-center">
                {t('autodromeGroupsPage.endedGroups')}
              </TH>
            </HeaderTR>
            <FilterTR>
              <FilterTH column="n" />
              <FilterTH column="org">
                <OrganizationSelect
                  size="sm"
                  className="w-full min-w-56"
                  id="adg-school"
                  name="adg-school"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                />
              </FilterTH>
              <FilterTH column="total" />
              <FilterTH column="active" />
              <FilterTH column="ended" />
            </FilterTR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyTR colSpan={5} description={t('autodromeGroupsPage.empty')} />
            ) : (
              rows.map((row, index) => (
                <TR key={row.organization?.id ?? index}>
                  <TD column="n" className="text-center text-muted">
                    {(page - 1) * pageSize + index + 1}
                  </TD>
                  <TD column="org" className="min-w-64">
                    <OrganizationLabel
                      stacked
                      name={row.organization?.name}
                      inn={row.organization?.inn}
                    />
                  </TD>
                  <TD column="total" className="text-center">
                    <Badge tone="amber">{row.total_counts ?? 0}</Badge>
                  </TD>
                  <TD column="active" className="text-center">
                    <Badge tone="teal">{row.active_counts ?? 0}</Badge>
                  </TD>
                  <TD column="ended" className="text-center">
                    <Badge tone="rose">{row.ended_counts ?? 0}</Badge>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
      <Pagination
        className="shrink-0"
        storageKey="schools"
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  )
}
