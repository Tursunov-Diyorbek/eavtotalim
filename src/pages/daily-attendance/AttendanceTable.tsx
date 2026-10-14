import type { UseQueryResult } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { schoolReportGroupsPath } from '@/config'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui'
import type {
  DailyAttendanceList,
  DailyAttendanceRow,
  DailyAttendanceTypeRow,
} from '@/types/daily-attendance'
import { percentText } from './export'

function preparing(t: (key: string) => string) {
  return t('dailyAttendance.preparing')
}

export function AttendanceCountTable({
  query,
  kind,
}: {
  query: UseQueryResult<DailyAttendanceList<DailyAttendanceRow>>
  kind: 'region' | 'area' | 'org'
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rows = query.data?.rows ?? []
  const loading = query.isLoading && !query.data
  const org = kind === 'org'
  const colSpan = org ? 9 : 11
  const nameHeader =
    kind === 'region'
      ? t('dailyAttendance.region')
      : kind === 'area'
        ? t('dailyAttendance.district')
        : t('dailyAttendance.school')

  if (query.isError && !query.data) return <ErrorMessage />
  if (loading) return <ListPageSkeleton rows={8} />

  return (
    <Table storageKey={`daily-attendance-${kind}`} fill>
      <THead>
        <HeaderTR>
          <TH rowSpan={2} column="index" className="w-12 text-center">
            №
          </TH>
          <TH rowSpan={2} column="name" className="min-w-44 text-left">
            {nameHeader}
          </TH>
          {org ? null : (
            <TH colSpan={2} registerColumn={false} className="text-center">
              {t('dailyAttendance.schools')}
            </TH>
          )}
          <TH colSpan={2} registerColumn={false} className="text-center">
            {t('dailyAttendance.groups')}
          </TH>
          <TH colSpan={2} registerColumn={false} className="text-center">
            {t('dailyAttendance.students')}
          </TH>
          <TH rowSpan={2} column="absent" className="min-w-36 text-center">
            {t('dailyAttendance.absent')}
          </TH>
          <TH rowSpan={2} column="absentPercent" className="min-w-28 text-center">
            {t('dailyAttendance.absentPercent')}
          </TH>
          <TH rowSpan={2} column="presentPercent" className="min-w-28 text-center">
            {t('dailyAttendance.presentPercent')}
          </TH>
        </HeaderTR>
        <HeaderTR>
          {org ? null : (
            <>
              <TH column="activeSchools" className="min-w-28 text-center">
                {t('dailyAttendance.activeSchools')}
              </TH>
              <TH column="allSchools" className="min-w-28 text-center">
                {t('dailyAttendance.allSchools')}
              </TH>
            </>
          )}
          <TH column="lessonGroups" className="min-w-28 text-center">
            {t('dailyAttendance.lessonGroups')}
          </TH>
          <TH column="activeGroups" className="min-w-32 text-center">
            {t('dailyAttendance.activeGroups')}
          </TH>
          <TH column="lessonStudents" className="min-w-40 text-center">
            {t('dailyAttendance.lessonStudents')}
          </TH>
          <TH column="activeStudents" className="min-w-44 text-center">
            {t('dailyAttendance.activeStudents')}
          </TH>
        </HeaderTR>
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <EmptyTR colSpan={colSpan} description={preparing(t)} />
        ) : (
          rows.map((row, index) => (
            <TR key={`${row.name}-${index}`}>
              <TD column="index" className="text-center text-muted">
                {index + 1}
              </TD>
              <TD column="name">
                {org && row.regionId && row.orgId ? (
                  <Button
                    variant="link"
                    size="inline"
                    className="!h-auto !justify-start text-left"
                    onClick={() => navigate(schoolReportGroupsPath(row.regionId!, row.orgId!))}
                  >
                    {row.name || '—'}
                  </Button>
                ) : (
                  row.name || '—'
                )}
              </TD>
              {org ? null : (
                <>
                  <TD column="activeSchools" className="text-center tabular-nums">
                    {row.activeSchools}
                  </TD>
                  <TD column="allSchools" className="text-center tabular-nums">
                    {row.allSchools}
                  </TD>
                </>
              )}
              <TD column="lessonGroups" className="text-center tabular-nums">
                {row.lessonGroups}
              </TD>
              <TD column="activeGroups" className="text-center tabular-nums">
                {row.activeGroups}
              </TD>
              <TD column="lessonStudents" className="text-center tabular-nums">
                {row.lessonStudents}
              </TD>
              <TD column="activeStudents" className="text-center tabular-nums">
                {row.activeStudents}
              </TD>
              <TD column="absent" className="text-center tabular-nums">
                {row.absent}
              </TD>
              <TD column="absentPercent" className="text-center tabular-nums whitespace-nowrap">
                {percentText(row.absentPercent)}
              </TD>
              <TD column="presentPercent" className="text-center tabular-nums whitespace-nowrap">
                {percentText(row.monitoringPercent)}
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  )
}

export function AttendanceTypeTable({
  query,
}: {
  query: UseQueryResult<DailyAttendanceList<DailyAttendanceTypeRow>>
}) {
  const { t } = useTranslation()
  const rows = query.data?.rows ?? []
  const loading = query.isLoading && !query.data
  if (query.isError && !query.data) return <ErrorMessage />
  if (loading) return <ListPageSkeleton rows={6} />

  return (
    <Table storageKey="daily-attendance-types" fill>
      <THead>
        <HeaderTR>
          <TH rowSpan={2} column="index" className="w-12 text-center">
            №
          </TH>
          <TH rowSpan={2} column="name" className="min-w-44 text-left">
            {t('dailyAttendance.typeName')}
          </TH>
          <TH colSpan={2} registerColumn={false} className="text-center">
            {t('dailyAttendance.orgAnalysis')}
          </TH>
          <TH colSpan={2} registerColumn={false} className="text-center">
            {t('dailyAttendance.groups')}
          </TH>
          <TH colSpan={3} registerColumn={false} className="text-center">
            {t('dailyAttendance.studentAnalysis')}
          </TH>
          <TH colSpan={2} registerColumn={false} className="text-center">
            {t('dailyAttendance.attendanceAnalysis')}
          </TH>
        </HeaderTR>
        <HeaderTR>
          <TH column="organizations" className="min-w-28 text-center">
            {t('dailyAttendance.totalOrgs')}
          </TH>
          <TH column="activeOrganizations" className="min-w-28 text-center">
            {t('dailyAttendance.activeOrgs')}
          </TH>
          <TH column="activeGroups" className="min-w-32 text-center">
            {t('dailyAttendance.activeGroups')}
          </TH>
          <TH column="lessonGroups" className="min-w-28 text-center">
            {t('dailyAttendance.lessonGroups')}
          </TH>
          <TH column="activeStudents" className="min-w-40 text-center">
            {t('dailyAttendance.activeStudents')}
          </TH>
          <TH column="lessonStudents" className="min-w-40 text-center">
            {t('dailyAttendance.lessonStudents')}
          </TH>
          <TH column="absent" className="min-w-32 text-center">
            {t('dailyAttendance.absent')}
          </TH>
          <TH column="presentPercent" className="min-w-28 text-center">
            {t('dailyAttendance.presentPercent')}
          </TH>
          <TH column="absentPercent" className="min-w-28 text-center">
            {t('dailyAttendance.absentPercent')}
          </TH>
        </HeaderTR>
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <EmptyTR colSpan={11} description={preparing(t)} />
        ) : (
          rows.map((row, index) => (
            <TR key={`${row.name}-${index}`}>
              <TD column="index" className="text-center text-muted">
                {index + 1}
              </TD>
              <TD column="name">{row.name || '—'}</TD>
              <TD column="organizations" className="text-center tabular-nums">
                {row.organizations}
              </TD>
              <TD column="activeOrganizations" className="text-center tabular-nums">
                {row.activeOrganizations}
              </TD>
              <TD column="activeGroups" className="text-center tabular-nums">
                {row.activeGroups}
              </TD>
              <TD column="lessonGroups" className="text-center tabular-nums">
                {row.lessonGroups}
              </TD>
              <TD column="activeStudents" className="text-center tabular-nums">
                {row.activeStudents}
              </TD>
              <TD column="lessonStudents" className="text-center tabular-nums">
                {row.lessonStudents}
              </TD>
              <TD column="absent" className="text-center tabular-nums">
                {row.absent}
              </TD>
              <TD column="presentPercent" className="text-center tabular-nums whitespace-nowrap">
                {percentText(row.monitoringPercent)}
              </TD>
              <TD column="absentPercent" className="text-center tabular-nums whitespace-nowrap">
                {percentText(row.absentPercent)}
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  )
}
