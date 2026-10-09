import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import { routes } from '@/config'
import { useStudentAbsenceQuery } from '@/features/attendance-statistics'
import { useSmartBack } from '@/hooks'
import { AbsentStudentsBody } from './AttendanceStatisticsPage'
import { todayIso } from './attendanceUi'

/** Eski `/students-groups-attendance-statistics/:id`. */
export function AbsenceStudentsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const goBack = useSmartBack(`${routes.groupsAttendanceStatistics}?tab=incomplete`)
  const date = params.get('date') || todayIso()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const query = useStudentAbsenceQuery({
    date,
    page,
    pageSize,
    groupId: id,
  })

  return (
    <>
      <Header title={t('attendanceStatsPage.studentsTitle')} onBack={goBack} />
      <PageMain fill>
        <AbsentStudentsBody
          titleKey="attendanceStatsPage.studentsTitle"
          date={date}
          onDateChange={(next) => {
            const nextParams = new URLSearchParams(params)
            nextParams.set('date', next)
            setParams(nextParams, { replace: true })
            setPage(1)
          }}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          storageKey="attendance-group-students"
          loading={query.isLoading}
          error={query.isError}
          rows={query.data?.data ?? []}
          total={query.data?.total_items ?? 0}
          totalPages={query.data?.last_page ?? 1}
        />
      </PageMain>
    </>
  )
}
