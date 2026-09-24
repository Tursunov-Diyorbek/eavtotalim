import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import { ErrorMessage, SkeletonLines } from '@/components/ui'
import { routes } from '@/config'
import { useAuth } from '@/features/auth'
import { useGroupShowQuery } from '@/features/groups'
import { asText } from '@/lib/apiPage'
import { useSmartBack } from '@/hooks'
import { GroupJournalTab } from './show/GroupJournalTab'

/** Eski `/group/:id/edit-notebook` — faqat elektron jurnal, guruh amallarisiz. */
export function GroupNotebookPage() {
  const { t } = useTranslation()
  const goBack = useSmartBack(routes.groups)
  const { id } = useParams()
  const { hasRole } = useAuth()
  const { data, isLoading, isError } = useGroupShowQuery(id)
  const name = data?.name_uz || data?.name
  const canMutate = !hasRole('teacher')

  return (
    <>
      <Header
        title={t('groupsPage.showPage.journalPageTitle')}
        description={typeof name === 'string' ? name : asText(name)}
        onBack={goBack}
      />
      <PageMain>
        {isLoading ? (
          <SkeletonLines lines={8} />
        ) : isError || !id ? (
          <ErrorMessage />
        ) : (
          <GroupJournalTab groupId={id} canMutate={canMutate} />
        )}
      </PageMain>
    </>
  )
}
