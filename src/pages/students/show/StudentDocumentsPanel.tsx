import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Printer } from 'lucide-react'
import { Button, EmptyState, ErrorMessage, SkeletonLines } from '@/components/ui'
import { documentPrintPath, type DocumentPrintKind } from '@/config'
import { useAuth } from '@/features/auth'
import { useStudentContractQuery } from '@/features/students'

export function StudentDocumentsPanel({ studentId }: { studentId: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { me } = useAuth()
  const contract = useStudentContractQuery(studentId, true)
  const groupId = contract.data?.group?.id
  const hasAgreement = me?.profession?.organization?.last_agreement?.status === 1

  const openDoc = (kind: DocumentPrintKind) => {
    if (!groupId) return
    navigate(documentPrintPath(kind, groupId))
  }

  if (contract.isLoading) return <SkeletonLines lines={2} />
  if (contract.isError) return <ErrorMessage />
  if (!groupId) return <EmptyState description={t('students.showPage.noGroup')} />

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold tracking-wide text-deep uppercase">
        {t('students.showPage.tabDocs')}
      </p>
      <div className="flex flex-wrap gap-2">
        {hasAgreement ? (
          <Button variant="outline" size="sm" onClick={() => openDoc('application')}>
            <Printer className="size-3.5" aria-hidden />
            {t('students.showPage.printApplication')}
          </Button>
        ) : null}
        <Button variant="outline" size="sm" onClick={() => openDoc('contract')}>
          <Printer className="size-3.5" aria-hidden />
          {t('students.showPage.printContract')}
        </Button>
        {hasAgreement ? (
          <Button variant="outline" size="sm" onClick={() => openDoc('sheet')}>
            <Printer className="size-3.5" aria-hidden />
            {t('students.showPage.printPersonalSheet')}
          </Button>
        ) : null}
        <Button variant="outline" size="sm" onClick={() => openDoc('voucher')}>
          <Printer className="size-3.5" aria-hidden />
          {t('students.showPage.printVoucher')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => openDoc('sheet2')}>
          <Printer className="size-3.5" aria-hidden />
          {t('students.showPage.printDrivingSheet')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => openDoc('practical')}>
          <Printer className="size-3.5" aria-hidden />
          {t('students.showPage.printPracticalSheet')}
        </Button>
      </div>
    </div>
  )
}
