import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { EmptyState, ErrorMessage, SkeletonLines } from '@/components/ui'
import { routes, teacherEduTopicsPath } from '@/config/routes'
import { capitalLetter, pickTextbookName, textbookCardTone } from '@/features/textbooks'
import { useTeacherEduLessonsQuery } from '@/features/teacher-edu'
import { useSmartBack } from '@/hooks'
import { cn } from '@/lib/cn'

export function TeacherEduLessonsPage() {
  const { t, i18n } = useTranslation()
  const { eduId } = useParams<{ eduId: string }>()
  const location = useLocation()
  const state = (location.state ?? {}) as { title?: string }
  const goBack = useSmartBack(routes.teacherEdu)
  const { data, isLoading, isError } = useTeacherEduLessonsQuery(eduId)
  const items = data ?? []

  return (
    <>
      <Header
        title={state.title || t('teacherEdu.sciences')}
        description={t('teacherEdu.sciences')}
        onBack={goBack}
      />
      <PageMain>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <SkeletonLines lines={6} />
        ) : items.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const name = pickTextbookName(item.lesson, i18n.language) || '—'
              return (
                <Link
                  key={item.id}
                  to={teacherEduTopicsPath(eduId ?? '', item.id)}
                  state={{ eduTitle: state.title, lessonName: name }}
                  className="flex items-center gap-3 rounded-xl border border-mist/70 bg-white px-3 py-2.5 no-underline transition hover:border-signal/30 hover:bg-signal-soft/40"
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white',
                      textbookCardTone(item.id),
                    )}
                  >
                    {capitalLetter(name)}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-deep">
                    {name}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
              )
            })}
          </div>
        )}
      </PageMain>
    </>
  )
}
