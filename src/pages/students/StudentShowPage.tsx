import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { StudentCamerasPanel } from './show/StudentCamerasPanel'
import { StudentShowSidebar } from './show/StudentShowSidebar'
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
  const navigate = useNavigate()
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
            <Button variant="outline" size="sm" onClick={() => navigate(routes.students)}>
              {t('common.back')}
            </Button>
          </div>
        }
      />
      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isLoading ? (
          <div className="grid gap-3 xl:grid-cols-[minmax(0,10fr)_minmax(0,14fr)]">
            <Panel padding="md">
              <SkeletonLines lines={12} />
            </Panel>
            <Panel padding="md">
              <SkeletonLines lines={12} />
            </Panel>
          </div>
        ) : isError || !student || !id ? (
          <ErrorMessage />
        ) : (
          <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,10fr)_minmax(0,14fr)]">
            <StudentShowSidebar studentId={id} student={student} group={group} />
            <div className="space-y-3">
              <StudentCamerasPanel studentId={id} />
              <StudentShowTabs
                studentId={id}
                stats={student.student_personal_attendance}
                tab={tab}
                onTabChange={(next) => {
                  const nextParams = new URLSearchParams(params)
                  nextParams.set('tab', next)
                  setParams(nextParams, { replace: true })
                }}
              />
            </div>
          </div>
        )}
      </main>
    </>
  )
}
