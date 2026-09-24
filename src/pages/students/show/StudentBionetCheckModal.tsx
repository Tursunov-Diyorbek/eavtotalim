import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle } from 'lucide-react'
import { checkStudentBionet, queryKeys } from '@/api'
import { Badge, Modal, SkeletonLines } from '@/components/ui'

function studentIsMissing(body: Record<string, unknown> | undefined) {
  if (!body) return true
  if (body.found === false || body.found === 0 || body.found === '0') return true
  const status = String(body.status ?? '').toLowerCase()
  return status === 'not_found' || status === 'missing' || status === 'notfound' || status === '0'
}

export function StudentBionetCheckModal({
  open,
  onClose,
  studentId,
}: {
  open: boolean
  onClose: () => void
  studentId: string
}) {
  const { t } = useTranslation()

  const studentCheck = useQuery({
    queryKey: [...queryKeys.students.camera(studentId), 'check-bionet'],
    queryFn: () => checkStudentBionet(studentId),
    enabled: open,
    retry: false,
  })

  const missing = studentCheck.isError || studentIsMissing(studentCheck.data)
  const message =
    (typeof studentCheck.data?.message === 'string' && studentCheck.data.message) ||
    (studentCheck.error instanceof Error ? studentCheck.error.message : '')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('students.showPage.bionetResult')}
      sizeClassName="max-w-lg"
      closeClassName="text-rose"
    >
      {studentCheck.isLoading ? (
        <SkeletonLines lines={2} />
      ) : (
        <div className="space-y-2">
          <Badge tone={missing ? 'neutral' : 'teal'} className="px-2 py-1 text-xs">
            {missing ? (
              <XCircle className="size-3.5" aria-hidden />
            ) : (
              <CheckCircle2 className="size-3.5" aria-hidden />
            )}
            {missing
              ? t('students.showPage.bionetMissing')
              : t('students.showPage.bionetFound')}
          </Badge>
          {message ? <p className="text-sm text-muted">{message}</p> : null}
        </div>
      )}
    </Modal>
  )
}
