import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { DashboardProfileSkeleton } from '@/components/ui'
import { useAuth } from '@/features/auth'
import {
  useMyProfileQuery,
  useThisWeekTimetableQuery,
} from '@/features/dashboard'
import {
  StudentDashboardAttendanceCard,
  StudentDashboardAutodromeCard,
  StudentDashboardExamCenterCard,
  StudentDashboardPaymentsCard,
  StudentDashboardProfileCard,
  StudentDashboardQuickNav,
  StudentDashboardStaffStrip,
  StudentDashboardStatusStrip,
  StudentDashboardTimetableCard,
} from './student'

export function StudentDashboard() {
  const { t } = useTranslation()
  const { me, user, loading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useMyProfileQuery()
  const professionId =
    me?.profession?.id != null ? String(me.profession.id) : undefined

  const agreementTypeId =
    me?.profession?.organization?.agreement_type?.id ??
    me?.profession?.organization?.last_agreement?.agreement_type?.id ??
    null
  const isBaseTariff = agreementTypeId === 1
  const hasComfort = Boolean(me?.organization_has_comfort_plan)
  const canFetchTimetable = !isBaseTariff && hasComfort

  const { data: weekTimetable, isLoading: timetableLoading } =
    useThisWeekTimetableQuery(canFetchTimetable)

  const bootLoading = loading && !me
  const showSkeleton = bootLoading || (profileLoading && !profile)

  const attendance = profile?.student_personal_attendance ?? null

  return (
    <>
      <Header
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      {/* Kontent balandligi — stretch/bo‘sh panel yo‘q */}
      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2.5 sm:p-3">
        {showSkeleton ? (
          <DashboardProfileSkeleton />
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid gap-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <StudentDashboardStatusStrip />
              <StudentDashboardQuickNav />
            </div>

            <StudentDashboardProfileCard
              profile={profile}
              me={me}
              user={user}
            />

            <div
              className={
                canFetchTimetable
                  ? 'grid items-stretch gap-2 md:grid-cols-2 xl:grid-cols-4'
                  : 'grid items-stretch gap-2 md:grid-cols-2'
              }
            >
              {canFetchTimetable ? (
                <StudentDashboardTimetableCard
                  items={weekTimetable}
                  isLoading={timetableLoading}
                />
              ) : null}
              <StudentDashboardAttendanceCard stats={attendance} />
              <StudentDashboardAutodromeCard />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <StudentDashboardPaymentsCard />
              <StudentDashboardExamCenterCard professionId={professionId} />
            </div>

            {professionId ? (
              <StudentDashboardStaffStrip studentId={Number(professionId)} />
            ) : null}
          </div>
        )}
      </main>
    </>
  )
}
