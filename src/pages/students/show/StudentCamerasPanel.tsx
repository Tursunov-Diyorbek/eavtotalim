import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import {
  Badge,
  Button,
  Notification,
  Panel,
  StatusCardSkeleton,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import {
  useStudentAutodromeStatusQuery,
  useStudentCameraStatusQuery,
} from '@/features/students'
import { resolveFileUrl } from '@/features/lessons'
import type { StudentCameraStatus } from '@/types/student'

function sendMeta(status: StudentCameraStatus | undefined, t: (k: string) => string) {
  const n = Number(status?.status)
  if (n === 1 || n === 2) {
    return { label: t('students.showPage.waitingSend'), tone: 'amber' as const }
  }
  if (n === 3) {
    return { label: t('students.showPage.sent'), tone: 'teal' as const }
  }
  if (n === 5 || n === 4) {
    return { label: t('students.showPage.sendError'), tone: 'rose' as const }
  }
  return { label: status?.message || t('students.showPage.notSent'), tone: 'neutral' as const }
}

function CameraBlock({
  title,
  data,
  isLoading,
  onRefresh,
}: {
  title: string
  data: StudentCameraStatus | undefined
  isLoading: boolean
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const meta = sendMeta(data, t)
  const img = resolveFileUrl(data?.image || data?.pending_image, PATH_PREFIX_FILE)

  return (
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-deep">{title}</p>
        <Button variant="ghost" size="icon-sm" aria-label={t('students.showPage.refresh')} onClick={onRefresh}>
          <RefreshCw className="size-3.5" />
        </Button>
      </div>
      {isLoading ? (
        <StatusCardSkeleton />
      ) : (
        <div className="flex items-center gap-3">
          {img ? (
            <img src={img} alt="" className="size-14 rounded-lg object-cover" />
          ) : (
            <div className="size-14 rounded-lg bg-fog" />
          )}
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
      )}
    </div>
  )
}

export function StudentCamerasPanel({ studentId }: { studentId: string }) {
  const { t } = useTranslation()
  const school = useStudentCameraStatusQuery(studentId)
  const autodrome = useStudentAutodromeStatusQuery(studentId)

  return (
    <Panel padding="md" className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <CameraBlock
          title={t('students.showPage.schoolCamera')}
          data={school.data}
          isLoading={school.isLoading}
          onRefresh={() => void school.refetch()}
        />
        <CameraBlock
          title={t('students.showPage.autodromeCamera')}
          data={autodrome.data}
          isLoading={autodrome.isLoading}
          onRefresh={() => void autodrome.refetch()}
        />
      </div>
      <Notification tone="warning">{t('students.showPage.cameraProblem')}</Notification>
    </Panel>
  )
}
