import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Button,
  ErrorMessage,
  Panel,
  SkeletonLines,
} from '@/components/ui'
import { routes } from '@/config'
import { useStudentQuery } from '@/features/students'
import { asFio } from '@/lib/apiPage'
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
  const tab = asTab(params.get('tab'))

  return (
    <>
      <Header
        title={t('students.show')}
        description={student ? asFio(student) : undefined}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-deep">
              {t('students.attendance')}:{' '}
              {attendance != null && attendance !== '' ? `${attendance}%` : '—'}
            </span>
            <Button variant="outline" size="sm" onClick={goBack}>
              {t('common.back')}
            </Button>
          </div>
        }
      />
      <main className="flex-1 space-y-3 p-3 sm:p-4">
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
          <div className="space-y-3">
            <StudentProfileHeader studentId={id} student={student} group={group} />

            <div className="grid items-stretch gap-3 lg:grid-cols-2 xl:grid-cols-3">
              <StudentPassportPanel student={student} group={group} />
              <StudentGroupPanel student={student} group={group} />
              <StudentSchoolInfoPanel student={student} />
            </div>

            <StudentAdditionalPanel student={student} />
            <StudentGroupStaffSection studentId={student.id} />
            <StudentCamerasPanel studentId={id} />
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
        )}
      </main>
    </>
  )
}
