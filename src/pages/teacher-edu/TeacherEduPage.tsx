import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyState,
  ErrorMessage,
  Panel,
  SafeImage,
  Skeleton,
} from '@/components/ui'
import { teacherEduLessonsPath } from '@/config/routes'
import { pickTextbookName, textbookMediaUrl } from '@/features/textbooks'
import { useTeacherEduTypesQuery } from '@/features/teacher-edu'

export function TeacherEduPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useTeacherEduTypesQuery()
  const items = data ?? []

  return (
    <>
      <Header title={t('nav.textbooks')} />
      <PageMain>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-72" rounded="xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => {
              const title = item.name_for_exam?.trim() || '—'
              const description = pickTextbookName(item, i18n.language)
              return (
                <Panel key={item.id} padding="sm" className="flex h-full flex-col">
                  <div className="flex h-36 items-center justify-center rounded-xl bg-signal-soft/80 p-3">
                    <SafeImage
                      src={item.image ? textbookMediaUrl(item.image) : ''}
                      alt={title}
                      fit="contain"
                      className="h-28 w-full"
                    />
                  </div>
                  <h2 className="mt-3 text-sm font-semibold text-deep">{title}</h2>
                  <p className="mt-1 line-clamp-3 flex-1 text-[13px] leading-snug text-muted">
                    {description || '—'}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() =>
                      navigate(teacherEduLessonsPath(item.id), {
                        state: { title, description },
                      })
                    }
                  >
                    {t('common.view')}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Button>
                </Panel>
              )
            })}
          </div>
        )}
      </PageMain>
    </>
  )
}
