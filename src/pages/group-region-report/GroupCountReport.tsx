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

export function GroupCountReport({
  title,
  onBack,
  query,
  showCards,
  showSchools,
  showGroupTotal,
  groupedCategories,
  categoryKey,
  nameHeader,
  onName,
  exportName,
  showDate = true,
  showFooter = true,
}: {
  title: string
  onBack?: () => void
  query: UseQueryResult<StudentRegionReport>
  showCards: boolean
  showSchools: boolean
  showGroupTotal: boolean
  groupedCategories: boolean
  categoryKey: 'name' | 'shortName'
  nameHeader: string
  onName?: (row: StudentRegionRow) => void
  exportName: string
  showDate?: boolean
  showFooter?: boolean
}) {
  const { t } = useTranslation()
  const report = query.data
  const rows = report?.rows ?? []
  const eduTypes = report?.eduTypes ?? []
  const schools = sum(rows.map((row) => row.schools))
  const groups = sum(rows.map((row) => row.groupCount))
  const students = sum(rows.map((row) => row.studentsTotal))
  const eduTotals = eduTypes.map((_, index) => sum(rows.map((row) => row.groupsByEdu[index] ?? 0)))
  const colSpan =
    2 + (showSchools ? 1 : 0) + (showGroupTotal ? 1 : 0) + Math.max(eduTypes.length, groupedCategories ? 0 : 0)
  const loading = query.isLoading && !report

  function exportXls() {
    const heads = eduTypes.map((type) => `<th>${escapeHtml(type[categoryKey])}</th>`).join('')
    const groupWrap = groupedCategories
      ? `<th colspan="${Math.max(eduTypes.length, 1)}">${escapeHtml(t('groupRegionPage.groups'))}</th>`
      : heads
    const body = rows
      .map((row, index) => {
        const schoolsCell = showSchools ? `<td>${row.schools}</td>` : ''
        const groupsCell = showGroupTotal ? `<td>${row.groupCount}</td>` : ''
        const cells = row.groupsByEdu.map((value) => `<td>${value}</td>`).join('')
        return `<tr><td>${index + 1}</td><td>${escapeHtml(row.name)}</td>${schoolsCell}${groupsCell}${cells}</tr>`
      })
      .join('')
    const schoolsFoot = showSchools ? `<td>${schools}</td>` : ''
    const groupsFoot = showGroupTotal ? `<td>${groups}</td>` : ''
    const foot = eduTotals.map((value) => `<td>${value}</td>`).join('')
    const footer = showFooter
      ? `<tr><td>#</td><td>${escapeHtml(t('groupRegionPage.total'))}</td>${schoolsFoot}${groupsFoot}${foot}</tr>`
      : ''
    const categoryRow = groupedCategories ? `<tr>${heads}</tr>` : ''
    const span = groupedCategories ? ' rowspan="2"' : ''
    downloadTableXls(
      exportName,
      `<table border="1"><tr><th${span}>№</th><th${span}>${escapeHtml(nameHeader)}</th>${showSchools ? `<th${span}>${escapeHtml(t('groupRegionPage.schools'))}</th>` : ''}${showGroupTotal ? `<th${span}>${escapeHtml(t('groupRegionPage.groups'))}</th>` : ''}${groupedCategories ? groupWrap : heads}</tr>${categoryRow}${body}${footer}</table>`,
    )
  }

  return (
    <>
      <Header
        title={
          <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="uppercase">{title}</span>
            {showDate ? (
              <span className="text-sm font-medium text-amber normal-case">{yesterdayLabel()}</span>
            ) : null}
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
            {showCards ? (
              <div className="grid shrink-0 gap-2 sm:grid-cols-3">
                <CountCard
                  icon={<School className="size-5" />}
                  iconClass="bg-signal-soft text-signal"
                  title={t('groupRegionPage.schools')}
                  hint={t('groupRegionPage.activeSchools')}
                  value={schools}
                />
                <CountCard
                  icon={<Flag className="size-5" />}
                  iconClass="bg-teal-soft text-teal"
                  title={t('groupRegionPage.groups')}
                  hint={t('groupRegionPage.activeGroups')}
                  value={groups}
                />
                <CountCard
                  icon={<Users className="size-5" />}
                  iconClass="bg-amber-soft text-amber"
                  title={t('groupRegionPage.students')}
                  hint={t('groupRegionPage.activeStudents')}
                  value={students}
                />
              </div>
            ) : null}
            <Table storageKey="group-region-report" fill>
              <THead>
                <HeaderTR>
                  <TH rowSpan={groupedCategories ? 2 : undefined} column="index" className="w-12 text-center">
                    №
                  </TH>
                  <TH
                    rowSpan={groupedCategories ? 2 : undefined}
                    column="name"
                    className="min-w-44 text-left"
                  >
                    {nameHeader}
                  </TH>
                  {showSchools ? (
                    <TH
                      rowSpan={groupedCategories ? 2 : undefined}
                      column="schools"
                      className="min-w-28 text-center"
                    >
                      {t('groupRegionPage.schools')}
                    </TH>
                  ) : null}
                  {showGroupTotal ? (
                    <TH
                      rowSpan={groupedCategories ? 2 : undefined}
                      column="groups"
                      className="min-w-24 text-center"
                    >
                      {t('groupRegionPage.groups')}
                    </TH>
                  ) : null}
                  {groupedCategories && eduTypes.length > 0 ? (
                    <TH colSpan={eduTypes.length} registerColumn={false} className="text-center">
                      {t('groupRegionPage.groups')}
                    </TH>
                  ) : null}
                  {!groupedCategories
                    ? eduTypes.map((type, index) => (
                        <TH
                          key={type.id ?? index}
                          column={`edu-${index}`}
                          className="min-w-14 text-center whitespace-nowrap"
                        >
                          {type[categoryKey]}
                        </TH>
                      ))
                    : null}
                </HeaderTR>
                {groupedCategories && eduTypes.length > 0 ? (
                  <HeaderTR>
                    {eduTypes.map((type, index) => (
                      <TH
                        key={type.id ?? index}
                        column={`edu-${index}`}
                        className="min-w-14 text-center whitespace-nowrap"
                      >
                        {type[categoryKey]}
                      </TH>
                    ))}
                  </HeaderTR>
                ) : null}
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={Math.max(colSpan, 1)} />
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
                        {showGroupTotal ? (
                          <TD column="groups" className="text-center tabular-nums">
                            {row.groupCount}
                          </TD>
                        ) : null}
                        {row.groupsByEdu.map((value, eduIndex) => (
                          <TD key={eduIndex} column={`edu-${eduIndex}`} className="text-center tabular-nums">
                            {value}
                          </TD>
                        ))}
                      </TR>
                    ))}
                    {showFooter ? (
                      <TR className="bg-signal-soft/50 font-semibold hover:bg-signal-soft/50">
                        <TD column="index" className="text-center text-signal">
                          #
                        </TD>
                        <TD column="name" className="text-signal">
                          {t('groupRegionPage.total')}
                        </TD>
                        {showSchools ? (
                          <TD column="schools" className="text-center text-signal tabular-nums">
                            {schools}
                          </TD>
                        ) : null}
                        {showGroupTotal ? (
                          <TD column="groups" className="text-center text-signal tabular-nums">
                            {groups}
                          </TD>
                        ) : null}
                        {eduTotals.map((value, index) => (
                          <TD key={index} column={`edu-${index}`} className="text-center text-signal tabular-nums">
                            {value}
                          </TD>
                        ))}
                      </TR>
                    ) : null}
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
