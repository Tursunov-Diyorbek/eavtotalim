import { isDirectorRole, isTeacherRole } from '@/config'
import { useAuth } from '@/features/auth'
import { DirectorDashboard } from './DirectorDashboard'
import { StudentDashboard } from './StudentDashboard'
import { TeacherDashboard } from './TeacherDashboard'

export function DashboardPage() {
  const { user } = useAuth()
  if (isDirectorRole(user)) return <DirectorDashboard />
  if (isTeacherRole(user)) return <TeacherDashboard />
  return <StudentDashboard />
}
