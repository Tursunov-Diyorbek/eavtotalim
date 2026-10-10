import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  ErrorMessage,
  Panel,
  SkeletonLines,
} from '@/components/ui'
import { routes } from '@/config'
import { useStudentQuery } from '@/features/students'
import { useSmartBack } from '@/hooks'
import { StudentCamerasPanel } from './show/StudentCamerasPanel'
import { StudentProfileHeader } from './show/StudentProfileHeader'
import { StudentSchoolInfoPanel } from './show/StudentSchoolInfoPanel'
import {
  StudentAdditionalPanel,
  StudentGroupPanel,
  StudentGroupStaffSection,
  StudentPassportPanel,
} from './show/StudentShowSidebar'
import { StudentShowTabs, type StudentShowTab } from './show/StudentShowTabs'

const TABS: StudentShowTab[] = [
  'school',
  'autodrome',
  'examCenter',
  'exam',
  'docs',
  'extra',
  'practical',
]

function asTab(value: string | null): StudentShowTab {
  return TABS.includes(value as StudentShowTab) ? (value as StudentShowTab) : 'school'
}

export function StudentShowPage() {
  const { t } = useTranslation()
  const goBack = useSmartBack(routes.students)
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { data, isLoading, isError } = useStudentQuery(id)
  const student = data?.student
  const group = data?.group ?? student?.group ?? null
  const attendance = student?.student_personal_attendance?.average_attendance_percent
  const attendancePercent =
    attendance != null && attendance !== '' && !Number.isNaN(Number(attendance))
      ? Number(attendance)
      : null
  const attendanceTone =
    attendancePercent == null ? 'rose' : attendancePercent < 70 ? 'rose' : attendancePercent < 90 ? 'amber' : 'teal'
  const tab = asTab(params.get('tab'))

  return (
    <>
      <Header
        title={t('students.show')}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-deep">
              {t('students.attendance')}:
              <Badge tone={attendanceTone}>
                {attendancePercent != null
                  ? `${attendance}%`
                  : t('students.attendanceMissing')}
              </Badge>
            </span>
            <Button variant="outline" size="sm" onClick={goBack}>
              {t('common.back')}
            </Button>
          </div>
        }
      />
      <main className="flex-1 overflow-y-auto p-2 sm:p-3">
        {isLoading ? (
          <div className="space-y-3">
            <Panel padding="md">
              <SkeletonLines lines={6} />
            </Panel>
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              <Panel padding="md">
                <SkeletonLines lines={6} />
              </Panel>
              <Panel padding="md">
                <SkeletonLines lines={6} />
              </Panel>
              <Panel padding="md">
                <SkeletonLines lines={4} />
              </Panel>
            </div>
            <Panel padding="md">
              <SkeletonLines lines={8} />
            </Panel>
          </div>
        ) : isError || !student || !id ? (
          <ErrorMessage />
        ) : (
          <div className="grid items-start gap-2 xl:grid-cols-12">
            <div className="flex flex-col gap-2 xl:col-span-5">
              <StudentProfileHeader studentId={id} student={student} group={group} />
              <StudentPassportPanel student={student} group={group} />
              <StudentGroupPanel student={student} group={group} />
            </div>
            <div className="flex flex-col gap-2 xl:col-span-7">
              <StudentCamerasPanel studentId={id} eduStatus={student.edu_status} />
              <StudentSchoolInfoPanel student={student} />
              <StudentGroupStaffSection studentId={student.id} />
            </div>
            <div className="xl:col-span-12">
              <StudentShowTabs
                studentId={id}
                student={student}
                group={group}
                stats={student.student_personal_attendance}
                tab={tab}
                onTabChange={(next) => {
                  const nextParams = new URLSearchParams(params)
                  nextParams.set('tab', next)
                  setParams(nextParams, { replace: true })
                }}
              />
            </div>
            <StudentAdditionalPanel student={student} />
          </div>
        )}
      </main>
    </>
  )
}
