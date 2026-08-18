import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { ErrorMessage, Panel, SkeletonLines } from '@/components/ui'
import { useTeacherEditQuery } from '@/features/teachers'
import { TeacherForm } from './TeacherForm'

export function TeacherEditPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { data, isLoading, isError } = useTeacherEditQuery(id)

  if (isLoading) {
    return (
      <>
        <Header title={t('teachersPage.edit')} />
        <main className="p-3 sm:p-4">
          <Panel padding="md">
            <SkeletonLines lines={10} />
          </Panel>
        </main>
      </>
    )
  }

  if (isError || !data) {
    return (
      <>
        <Header title={t('teachersPage.edit')} />
        <main className="p-3 sm:p-4">
          <ErrorMessage />
        </main>
      </>
    )
  }

  return <TeacherForm mode="edit" teacherId={id} initial={data} />
}
