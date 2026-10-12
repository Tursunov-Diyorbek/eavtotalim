import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  HeaderTR,
  ListPageSkeleton,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  notify,
} from '@/components/ui'
import { regionReportOrgPath, routes } from '@/config'
import { useAreaReportQuery, useRefreshAreaReportMutation } from '@/features/region-report'
import { useSmartBack } from '@/hooks'
import type { AreaReport, RegionReportEduType } from '@/types/region-report'
import { downloadTableXls, escapeHtml, sum } from './xls'

type Tab = 'schools' | 'students'

export function RegionReportAreaPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.regionReport)
  const query = useAreaReportQuery(id)
  const refresh = useRefreshAreaReportMutation(id)
  const [tab, setTab] = useState<Tab>('schools')
  const report = query.data
  const rows = report?.rows ?? []
  const eduTypes = report?.eduTypes ?? []

  function exportSchools() {
    const heads = eduTypes.map((type) => `<th>${escapeHtml(type.shortName)}</th>`).join('')
    const body = rows
      .map((row, index) => {
        const cells = row.schoolByEdu.map((value) => `<td>${value}</td>`).join('')
        return `<tr><td>${index + 1}</td><td>${escapeHtml(row.areaName)}</td><td>${row.schools}</td>${cells}</tr>`
      })
      .join('')
    downloadTableXls(
      "Avtomaktablar bo'yicha.xls",
      `<table border="1"><tr><th>№</th><th>${escapeHtml(t('regionReportPage.district'))}</th><th>${escapeHtml(t('regionReportPage.all'))}</th>${heads}</tr>${body}</table>`,
    )
  }

  function exportStudents() {
    const heads = eduTypes.map((type) => `<th>${escapeHtml(type.shortName)}</th>`).join('')
    const body = rows
      .map((row, index) => {
        const cells = row.studentByEdu.map((value) => `<td>${value}</td>`).join('')
        return `<tr><td>${index + 1}</td><td>${escapeHtml(row.areaName)}</td><td>${row.schools}</td><td>${row.groups}</td><td>${row.students}</td>${cells}</tr>`
      })
      .join('')
    downloadTableXls(
      "O'quvchilar bo'yicha.xls",
      `<table border="1"><tr><th>№</th><th>${escapeHtml(t('regionReportPage.district'))}</th><th>${escapeHtml(t('regionReportPage.schoolsCount'))}</th><th>${escapeHtml(t('regionReportPage.groupsCount'))}</th><th>${escapeHtml(t('regionReportPage.studentsCount'))}</th>${heads}</tr>${body}</table>`,
    )
  }

  return (
    <>
      <Header
        title={`${t('regionReportPage.areaTitle')}${report?.regionName ? ` (${report.regionName})` : ''}`}
        onBack={goBack}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label={t('regionReportPage.refresh')}
              loading={refresh.isPending}
              onClick={() =>
                refresh.mutate(undefined, {
                  onSuccess: () => notify.success(t('regionReportPage.refreshed')),
                  onError: () => notify.error(t('regionReportPage.refreshFailed')),
                })
              }
            >
              <RefreshCw className="size-4" aria-hidden />
            </Button>
            <ExportButton
              onClick={tab === 'schools' ? exportSchools : exportStudents}
              disabled={!report || rows.length === 0}
            >
              {tab === 'schools'
                ? t('regionReportPage.bySchools')
                : t('regionReportPage.byStudents')}
            </ExportButton>
          </div>
        }
      />
      <PageMain fill>
        {query.isError && !report ? (
          <ErrorMessage />
        ) : query.isLoading && !report ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Tabs
              className="shrink-0"
              size="sm"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'schools', label: t('regionReportPage.bySchools') },
                { value: 'students', label: t('regionReportPage.byStudents') },
              ]}
            />
            {tab === 'schools' ? (
              <SchoolsTable
                report={report}
                eduTypes={eduTypes}
                onOpen={(areaId) => navigate(regionReportOrgPath(areaId, id))}
              />
            ) : (
              <StudentsTable
                report={report}
                eduTypes={eduTypes}
                onOpen={(areaId) => navigate(regionReportOrgPath(areaId, id))}
              />
            )}
          </div>
        )}
      </PageMain>
    </>
  )
}

function SchoolsTable({
  report,
  eduTypes,
  onOpen,
}: {
  report: AreaReport | undefined
  eduTypes: RegionReportEduType[]
  onOpen: (areaId: number) => void
}) {
  const { t } = useTranslation()
  const rows = report?.rows ?? []
  const schoolTotal = sum(rows.map((row) => row.schools))
  const eduTotals = eduTypes.map((_, index) => sum(rows.map((row) => row.schoolByEdu[index] ?? 0)))

  return (
    <Table storageKey="region-report-area-schools" fill>
      <THead>
        <HeaderTR>
          <TH column="index" rowSpan={2} className="w-12 text-center">
            №
          </TH>
          <TH column="area" rowSpan={2} className="min-w-48">
            {t('regionReportPage.district')}
          </TH>
          <TH column="schools" rowSpan={2} className="w-20 text-center">
            <span className="text-teal">{t('regionReportPage.all')}</span>
          </TH>
          {eduTypes.length > 0 ? (
            <TH colSpan={eduTypes.length} registerColumn={false} className="text-center">
              <span className="text-[12px] font-semibold tracking-wide text-signal uppercase">
                {t('regionReportPage.categoryTitle')}
              </span>
            </TH>
          ) : null}
        </HeaderTR>
        {eduTypes.length > 0 ? (
          <HeaderTR>
            {eduTypes.map((type, index) => (
              <TH
                key={`${type.id ?? index}`}
                column={`edu-${index}`}
                columnLabel={type.shortName}
                className="min-w-14 text-center whitespace-nowrap"
              >
                {type.shortName}
              </TH>
            ))}
          </HeaderTR>
        ) : null}
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <EmptyTR colSpan={3 + eduTypes.length} />
        ) : (
          <>
            {rows.map((row, index) => (
              <TR key={row.areaId ?? index}>
                <TD column="index" className="text-center text-muted">
                  {index + 1}
                </TD>
                <TD column="area">
                  {row.areaId ? (
                    <Button
                      variant="link"
                      size="inline"
                      className="!h-auto max-w-full !justify-start !px-0 !font-medium"
                      onClick={() => onOpen(row.areaId!)}
                    >
                      <span className="truncate">{row.areaName || '—'}</span>
                    </Button>
                  ) : (
                    row.areaName || '—'
                  )}
                </TD>
                <TD column="schools" className="bg-teal-soft text-center font-semibold text-teal tabular-nums">
                  {row.schools}
                </TD>
                {row.schoolByEdu.map((value, eduIndex) => (
                  <TD key={eduIndex} column={`edu-${eduIndex}`} className="text-center tabular-nums">
                    {value}
                  </TD>
                ))}
              </TR>
            ))}
            <TR className="bg-signal-soft/50 font-semibold hover:bg-signal-soft/50">
              <TD column="index" />
              <TD column="area" className="text-signal">
                {t('regionReportPage.total')}
              </TD>
              <TD column="schools" className="bg-teal-soft text-center text-teal tabular-nums">
                {schoolTotal}
              </TD>
              {eduTotals.map((value, index) => (
                <TD key={index} column={`edu-${index}`} className="text-center text-signal tabular-nums">
                  {value}
                </TD>
              ))}
            </TR>
          </>
        )}
      </TBody>
    </Table>
  )
}

function StudentsTable({
  report,
  eduTypes,
  onOpen,
}: {
  report: AreaReport | undefined
  eduTypes: RegionReportEduType[]
  onOpen: (areaId: number) => void
}) {
  const { t } = useTranslation()
  const rows = report?.rows ?? []
  const schoolTotal = sum(rows.map((row) => row.schools))
  const groupTotal = sum(rows.map((row) => row.groups))
  const studentTotal = sum(rows.map((row) => row.students))
  const eduTotals = eduTypes.map((_, index) => sum(rows.map((row) => row.studentByEdu[index] ?? 0)))

  return (
    <Table storageKey="region-report-area-students" fill>
      <THead>
        <HeaderTR>
          <TH column="index" rowSpan={2} className="w-12 text-center">
            №
          </TH>
          <TH column="area" rowSpan={2} className="min-w-48">
            {t('regionReportPage.district')}
          </TH>
          <TH column="schools" rowSpan={2} className="min-w-28 text-center whitespace-nowrap">
            {t('regionReportPage.schoolsCount')}
          </TH>
          <TH column="groups" rowSpan={2} className="min-w-28 text-center whitespace-nowrap">
            {t('regionReportPage.groupsCount')}
          </TH>
          <TH column="students" rowSpan={2} className="min-w-24 text-center whitespace-nowrap">
            {t('regionReportPage.total')}
          </TH>
          {eduTypes.length > 0 ? (
            <TH colSpan={eduTypes.length} registerColumn={false} className="text-center">
              <span className="text-[12px] font-semibold tracking-wide text-signal uppercase">
                {t('regionReportPage.studentsCount')}
              </span>
            </TH>
          ) : null}
        </HeaderTR>
        {eduTypes.length > 0 ? (
          <HeaderTR>
            {eduTypes.map((type, index) => (
              <TH
                key={`${type.id ?? index}`}
                column={`edu-${index}`}
                columnLabel={type.code}
                className="min-w-14 text-center whitespace-nowrap"
              >
                {type.code}
              </TH>
            ))}
          </HeaderTR>
        ) : null}
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <EmptyTR colSpan={5 + eduTypes.length} />
        ) : (
          <>
            {rows.map((row, index) => (
              <TR key={row.areaId ?? index}>
                <TD column="index" className="text-center text-muted">
                  {index + 1}
                </TD>
                <TD column="area">
                  {row.areaId ? (
                    <Button
                      variant="link"
                      size="inline"
                      className="!h-auto max-w-full !justify-start !px-0 !font-medium"
                      onClick={() => onOpen(row.areaId!)}
                    >
                      <span className="truncate">{row.areaName || '—'}</span>
                    </Button>
                  ) : (
                    row.areaName || '—'
                  )}
                </TD>
                <TD column="schools" className="text-center tabular-nums">
                  {row.schools}
                </TD>
                <TD column="groups" className="text-center tabular-nums">
                  {row.groups}
                </TD>
                <TD column="students" className="text-center font-semibold tabular-nums">
                  {row.students}
                </TD>
                {row.studentByEdu.map((value, eduIndex) => (
                  <TD key={eduIndex} column={`edu-${eduIndex}`} className="text-center tabular-nums">
                    {value}
                  </TD>
                ))}
              </TR>
            ))}
            <TR className="bg-signal-soft/50 font-semibold hover:bg-signal-soft/50">
              <TD column="index" colSpan={2} className="text-signal">
                {t('regionReportPage.all')}
              </TD>
              <TD column="schools" className="text-center tabular-nums">
                {schoolTotal}
              </TD>
              <TD column="groups" className="text-center tabular-nums">
                {groupTotal}
              </TD>
              <TD column="students" className="text-center tabular-nums">
                {studentTotal}
              </TD>
              {eduTotals.map((value, index) => (
                <TD key={index} column={`edu-${index}`} className="text-center text-signal tabular-nums">
                  {value}
                </TD>
              ))}
            </TR>
          </>
        )}
      </TBody>
    </Table>
  )
}
