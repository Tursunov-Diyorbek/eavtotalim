import { isAutodromeRole, isDirectorRole, isRepublicGaiRole, isTeacherRole } from '@/config'
import { useAuth } from '@/features/auth'
import { AutodromeDashboard } from './AutodromeDashboard'
import { DirectorDashboard } from './DirectorDashboard'
import { RepublicGaiDashboard } from './RepublicGaiDashboard'
import { StudentDashboard } from './StudentDashboard'
import { TeacherDashboard } from './TeacherDashboard'

export function DashboardPage() {
  const { user } = useAuth()
  if (isAutodromeRole(user)) return <AutodromeDashboard />
  if (isDirectorRole(user)) return <DirectorDashboard />
  if (isTeacherRole(user)) return <TeacherDashboard />
  if (isRepublicGaiRole(user)) return <RepublicGaiDashboard />
  return <StudentDashboard />
}
