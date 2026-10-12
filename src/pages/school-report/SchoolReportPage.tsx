import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Flag, School, Users } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  HeaderTR,
  ListPageSkeleton,
  Pagination,
  Panel,
  Select,
  SkeletonCard,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui'
import { fetchDistricts, fetchRegions } from '@/api/students'
import { schoolReportGroupsPath } from '@/config'
import { useSchoolReportQuery, useSchoolReportTotalsQuery } from '@/features/school-report'
import { useOpenedOnce, usePageState } from '@/hooks'
import { formatNumber } from '@/lib'
import type { SchoolReportRow } from '@/types/school-report'
import { downloadTableXls, escapeHtml } from '@/pages/region-report/xls'

function yesterdayIso() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function CountCard({
  icon,
  iconClass,
  title,
  hint,
  value,
  loading,
}: {
  icon: ReactNode
  iconClass: string
  title: string
  hint: string
  value: number
  loading: boolean
}) {
  if (loading) return <SkeletonCard />
  return (
    <Panel padding="sm" className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-deep">{title}</p>
          <p className="truncate text-[12px] text-muted">{hint}</p>
        </div>
      </div>
      <p className="font-display text-2xl font-semibold text-deep">{formatNumber(value)}</p>
    </Panel>
  )
}

export function SchoolReportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(regionId))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(areaId))

  const query = useSchoolReportQuery({
    page,
    showCount: pageSize,
    regionId: regionId || undefined,
    areaId: areaId || undefined,
  })
  const totals = useSchoolReportTotalsQuery({
    date: yesterdayIso(),
    regionId: regionId || undefined,
    areaId: areaId || undefined,
  })
  const regions = useQuery({
    queryKey: ['regions', 'school-report'],
    queryFn: fetchRegions,
    enabled: regionsEnabled,
  })
  const districts = useQuery({
    queryKey: ['districts', 'school-report', regionId],
    queryFn: () => fetchDistricts(regionId),
    enabled: Boolean(regionId) && areasEnabled,
  })

  const rows = query.data?.rows ?? []
  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const cards = totals.data ?? { schools: 0, groups: 0, students: 0 }

  function exportXls() {
    const body = rows
      .map(
        (row, index) =>
          `<tr><td>${(page - 1) * pageSize + index + 1}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.inn)}</td><td>${escapeHtml(row.director)}</td><td>${row.teachers} / ${row.cars}</td><td>${row.groups}</td><td>${row.students}</td></tr>`,
      )
      .join('')
    downloadTableXls(
      "Avtomaktablar bo'yicha hisobot.xls",
      `<table border="1"><tr><th>№</th><th>${escapeHtml(t('schoolReportPage.orgName'))}</th><th>INN</th><th>${escapeHtml(t('schoolReportPage.director'))}</th><th>${escapeHtml(t('schoolReportPage.teachersCars'))}</th><th>${escapeHtml(t('schoolReportPage.groups'))}</th><th>${escapeHtml(t('schoolReportPage.students'))}</th></tr>${body}</table>`,
    )
  }

  return (
    <>
      <Header
        title={<span className="uppercase">{t('schoolReportPage.title')}</span>}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 text-[13px] text-muted">
              <span className="whitespace-nowrap">{t('schoolReportPage.byRegion')}</span>
              <Select
                id="school-report-region"
                name="school-report-region"
                size="sm"
                clearable
                className="w-44"
                value={regionId}
                placeholder={t('schoolReportPage.pick')}
                onOpen={openRegions}
                loading={regions.isFetching && (regions.data?.length ?? 0) === 0}
                options={(regions.data ?? []).map((item) => ({
                  value: String(item.id),
                  label: item.name || String(item.id),
                }))}
                onChange={(event) => {
                  setRegionId(event.target.value)
                  setAreaId('')
                  setPage(1)
                }}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-muted">
              <span className="whitespace-nowrap">{t('schoolReportPage.byDistrict')}</span>
              <Select
                id="school-report-area"
                name="school-report-area"
                size="sm"
                clearable
                className="w-44"
                value={areaId}
                placeholder={t('schoolReportPage.pick')}
                disabled={!regionId}
                onOpen={openAreas}
                loading={districts.isFetching && (districts.data?.length ?? 0) === 0}
                options={(districts.data ?? []).map((item) => ({
                  value: String(item.id),
                  label: item.name || String(item.id),
                }))}
                onChange={(event) => {
                  setAreaId(event.target.value)
                  setPage(1)
                }}
              />
            </div>
            <ExportButton onClick={exportXls} disabled={rows.length === 0} />
          </div>
        }
      />
      <PageMain fill>
        <div className="grid shrink-0 gap-2 sm:grid-cols-3">
          <CountCard
            loading={totals.isLoading && !totals.data}
            icon={<School className="size-5" />}
            iconClass="bg-signal-soft text-signal"
            title={t('schoolReportPage.schools')}
            hint={t('schoolReportPage.activeSchools')}
            value={cards.schools}
          />
          <CountCard
            loading={totals.isLoading && !totals.data}
            icon={<Flag className="size-5" />}
            iconClass="bg-indigo-soft text-indigo"
            title={t('schoolReportPage.groups')}
            hint={t('schoolReportPage.activeGroups')}
            value={cards.groups}
          />
          <CountCard
            loading={totals.isLoading && !totals.data}
            icon={<Users className="size-5" />}
            iconClass="bg-teal-soft text-teal"
            title={t('schoolReportPage.students')}
            hint={t('schoolReportPage.activeStudents')}
            value={cards.students}
          />
        </div>
        {query.isError && !query.data ? (
          <ErrorMessage />
        ) : query.isLoading && !query.data ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="school-report" fill>
            <THead>
              <HeaderTR>
                <TH column="index" className="w-12 text-center">
                  №
                </TH>
                <TH column="name" className="min-w-56">
                  {t('schoolReportPage.orgName')}
                </TH>
                <TH column="inn" className="w-32 whitespace-nowrap">
                  INN
                </TH>
                <TH column="director" className="min-w-48">
                  {t('schoolReportPage.director')}
                </TH>
                <TH column="staff" className="w-40 text-center whitespace-nowrap">
                  {t('schoolReportPage.teachersCars')}
                </TH>
                <TH column="groups" className="w-28 text-center whitespace-nowrap">
                  {t('schoolReportPage.groups')}
                </TH>
                <TH column="students" className="w-32 text-center whitespace-nowrap">
                  {t('schoolReportPage.students')}
                </TH>
              </HeaderTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={7} />
              ) : (
                rows.map((row, index) => (
                  <TR key={row.id}>
                    <TD column="index" className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD column="name">
                      <OrgName
                        row={row}
                        onOpen={
                          row.regionId
                            ? () => navigate(schoolReportGroupsPath(row.regionId!, row.id))
                            : undefined
                        }
                      />
                    </TD>
                    <TD column="inn" className="whitespace-nowrap tabular-nums">
                      {row.inn || '—'}
                    </TD>
                    <TD column="director">
                      <span className="line-clamp-2">{row.director || '—'}</span>
                    </TD>
                    <TD column="staff" className="text-center tabular-nums">
                      {row.teachers} / {row.cars}
                    </TD>
                    <TD column="groups" className="text-center tabular-nums">
                      {row.groups}
                    </TD>
                    <TD column="students" className="text-center tabular-nums">
                      {row.students}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          className="shrink-0"
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
    </>
  )
}

function OrgName({ row, onOpen }: { row: SchoolReportRow; onOpen?: () => void }) {
  if (!onOpen) return <span className="line-clamp-2">{row.name || '—'}</span>
  return (
    <Button
      variant="link"
      size="inline"
      className="!h-auto max-w-full !justify-start !px-0 !text-left !font-medium"
      onClick={onOpen}
    >
      <span className="line-clamp-2">{row.name || '—'}</span>
    </Button>
  )
}
