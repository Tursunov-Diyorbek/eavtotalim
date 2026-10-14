import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
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
  Panel,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui'
import { formatNumber } from '@/lib'
import { downloadTableXls, escapeHtml, sum, yesterdayLabel } from '@/pages/region-report/xls'
import type { StudentRegionReport, StudentRegionRow } from '@/types/student-region-report'

export function StudentCountReport({
  title,
  onBack,
  query,
  showSchools,
  schoolsMode,
  nameHeader,
  onName,
  exportName,
}: {
  title: string
  onBack?: () => void
  query: UseQueryResult<StudentRegionReport>
  showSchools: boolean
  schoolsMode: 'sum' | 'count'
  nameHeader: string
  onName?: (row: StudentRegionRow) => void
  exportName: string
}) {
  const { t } = useTranslation()
  const report = query.data
  const rows = report?.rows ?? []
  const eduTypes = report?.eduTypes ?? []
  const schools = schoolsMode === 'count' ? rows.length : sum(rows.map((row) => row.schools))
  const groups = sum(rows.map((row) => row.eduGroups))
  const students = sum(rows.map((row) => row.studentsTotal))
  const eduTotals = eduTypes.map((_, index) => sum(rows.map((row) => row.students[index] ?? 0)))
  const colSpan = (showSchools ? 4 : 3) + 1 + eduTypes.length
  const loading = query.isLoading && !report

  function exportXls() {
    const heads = eduTypes.map((type) => `<th>${escapeHtml(type.name)}</th>`).join('')
    const body = rows
      .map((row, index) => {
        const schoolsCell = showSchools ? `<td>${row.schools}</td>` : ''
        const cells = row.students.map((value) => `<td>${value}</td>`).join('')
        return `<tr><td>${index + 1}</td><td>${escapeHtml(row.name)}</td>${schoolsCell}<td>${row.groups}</td><td>${row.studentsTotal}</td>${cells}</tr>`
      })
      .join('')
    const schoolsFoot = showSchools ? `<td>${schools}</td>` : ''
    const foot = eduTotals.map((value) => `<td>${value}</td>`).join('')
    const schoolsHead = showSchools
      ? `<th rowspan="2">${escapeHtml(t('studentRegionPage.schools'))}</th>`
      : ''
    downloadTableXls(
      exportName,
      `<table border="1"><tr><th rowspan="2">№</th><th rowspan="2">${escapeHtml(nameHeader)}</th>${schoolsHead}<th rowspan="2">${escapeHtml(t('studentRegionPage.groups'))}</th><th colspan="${eduTypes.length + 1}">${escapeHtml(t('studentRegionPage.students'))}</th></tr><tr><th>${escapeHtml(t('studentRegionPage.total'))}</th>${heads}</tr>${body}<tr><td>#</td><td>${escapeHtml(t('studentRegionPage.total'))}</td>${schoolsFoot}<td>${groups}</td><td>${students}</td>${foot}</tr></table>`,
    )
  }

  return (
    <>
      <Header
        title={
          <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="uppercase">{title}</span>
            <span className="text-sm font-medium text-amber normal-case">{yesterdayLabel()}</span>
          </span>
        }
        onBack={onBack}
        actions={<ExportButton onClick={exportXls} disabled={!report || rows.length === 0} />}
      />
      <PageMain fill>
        {query.isError && !report ? (
          <ErrorMessage />
        ) : loading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="grid shrink-0 gap-2 sm:grid-cols-3">
              <CountCard
                icon={<School className="size-5" />}
                iconClass="bg-signal-soft text-signal"
                title={t('studentRegionPage.schools')}
                hint={t('studentRegionPage.activeSchools')}
                value={schools}
              />
              <CountCard
                icon={<Flag className="size-5" />}
                iconClass="bg-teal-soft text-teal"
                title={t('studentRegionPage.groups')}
                hint={t('studentRegionPage.activeGroups')}
                value={groups}
              />
              <CountCard
                icon={<Users className="size-5" />}
                iconClass="bg-amber-soft text-amber"
                title={t('studentRegionPage.students')}
                hint={t('studentRegionPage.activeStudents')}
                value={students}
              />
            </div>
            <Table storageKey="student-region-report" fill>
              <THead>
                <HeaderTR>
                  <TH rowSpan={2} column="index" className="w-12 text-center">
                    №
                  </TH>
                  <TH rowSpan={2} column="name" className="min-w-44 text-left">
                    {nameHeader}
                  </TH>
                  {showSchools ? (
                    <TH rowSpan={2} column="schools" className="min-w-28 text-center">
                      {t('studentRegionPage.schools')}
                    </TH>
                  ) : null}
                  <TH rowSpan={2} column="groups" className="min-w-24 text-center">
                    {t('studentRegionPage.groups')}
                  </TH>
                  <TH
                    colSpan={eduTypes.length + 1}
                    registerColumn={false}
                    className="text-center"
                  >
                    {t('studentRegionPage.students')}
                  </TH>
                </HeaderTR>
                <HeaderTR>
                  <TH column="students" className="min-w-16 text-center">
                    {t('studentRegionPage.total')}
                  </TH>
                  {eduTypes.map((type, index) => (
                    <TH key={type.id ?? index} column={`edu-${index}`} className="min-w-14 text-center whitespace-nowrap">
                      {type.name}
                    </TH>
                  ))}
                </HeaderTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={colSpan} />
                ) : (
                  <>
                    {rows.map((row, index) => (
                      <TR key={row.id ?? index}>
                        <TD column="index" className="text-center text-muted">
                          {index + 1}
                        </TD>
                        <TD column="name">
                          <NameCell row={row} onOpen={onName} />
                        </TD>
                        {showSchools ? (
                          <TD column="schools" className="text-center tabular-nums">
                            {row.schools}
                          </TD>
                        ) : null}
                        <TD column="groups" className="text-center tabular-nums">
                          {row.groups}
                        </TD>
                        <TD column="students" className="text-center font-medium tabular-nums">
                          {row.studentsTotal}
                        </TD>
                        {row.students.map((value, eduIndex) => (
                          <TD key={eduIndex} column={`edu-${eduIndex}`} className="text-center tabular-nums">
                            {value}
                          </TD>
                        ))}
                      </TR>
                    ))}
                    <TR className="bg-signal-soft/50 font-semibold hover:bg-signal-soft/50">
                      <TD column="index" className="text-center text-signal">
                        #
                      </TD>
                      <TD column="name" className="text-signal">
                        {t('studentRegionPage.total')}
                      </TD>
                      {showSchools ? (
                        <TD column="schools" className="text-center text-signal tabular-nums">
                          {schools}
                        </TD>
                      ) : null}
                      <TD column="groups" className="text-center text-signal tabular-nums">
                        {groups}
                      </TD>
                      <TD column="students" className="text-center text-signal tabular-nums">
                        {students}
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
          </div>
        )}
      </PageMain>
    </>
  )
}

function NameCell({ row, onOpen }: { row: StudentRegionRow; onOpen?: (row: StudentRegionRow) => void }) {
  if (!onOpen || row.id == null) {
    return <span className="line-clamp-2">{row.name || '—'}</span>
  }
  return (
    <Button
      variant="link"
      size="inline"
      className="!h-auto max-w-full !justify-start !px-0 !text-left !font-medium"
      onClick={() => onOpen(row)}
    >
      <span className="line-clamp-2">{row.name || '—'}</span>
    </Button>
  )
}

function CountCard({
  icon,
  iconClass,
  title,
  hint,
  value,
}: {
  icon: ReactNode
  iconClass: string
  title: string
  hint: string
  value: number
}) {
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
