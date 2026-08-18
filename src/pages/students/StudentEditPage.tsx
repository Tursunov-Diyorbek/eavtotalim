import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { ErrorMessage, Panel, SkeletonLines } from '@/components/ui'
import { asStudentDetail } from '@/api'
import { useStudentQuery } from '@/features/students'
import { StudentForm } from './StudentForm'

export function StudentEditPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { data, isLoading, isError } = useStudentQuery(id)
  const initial = data ? asStudentDetail(data) : null

  if (isLoading) {
    return (
      <>
        <Header title={t('students.edit')} />
        <main className="p-3 sm:p-4">
          <Panel padding="md">
            <SkeletonLines lines={10} />
          </Panel>
        </main>
      </>
    )
  }

  if (isError || !initial || !id) {
    return (
      <>
        <Header title={t('students.edit')} />
        <main className="p-3 sm:p-4">
          <ErrorMessage />
        </main>
      </>
    )
  }

  return <StudentForm studentId={id} initial={initial} />
}
