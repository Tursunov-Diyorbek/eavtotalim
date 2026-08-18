import { isDirectorRole } from '@/config'
import { useAuth } from '@/features/auth'
import { DirectorDashboard } from './DirectorDashboard'
import { StudentDashboard } from './StudentDashboard'

export function DashboardPage() {
  const { user } = useAuth()
  if (isDirectorRole(user)) return <DirectorDashboard />
  return <StudentDashboard />
}
