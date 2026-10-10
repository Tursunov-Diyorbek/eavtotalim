import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { EmptyState, ErrorMessage, SkeletonLines } from '@/components/ui'
import { teacherEduContentPath, teacherEduLessonsPath } from '@/config/routes'
import { capitalLetter, pickTextbookName, textbookCardTone } from '@/features/textbooks'
import { useTeacherEduTopicsQuery } from '@/features/teacher-edu'
import { useSmartBack } from '@/hooks'
import { cn } from '@/lib/cn'

type TopicsState = {
  eduTitle?: string
  lessonName?: string
}

export function TeacherEduTopicsPage() {
  const { t, i18n } = useTranslation()
  const { eduId, lessonId } = useParams<{ eduId: string; lessonId: string }>()
  const location = useLocation()
  const state = (location.state ?? {}) as TopicsState
  const goBack = useSmartBack(teacherEduLessonsPath(eduId ?? ''))
  const { data, isLoading, isError } = useTeacherEduTopicsQuery(lessonId)
  const items = data ?? []

  return (
    <>
      <Header
        title={state.lessonName || t('teacherEdu.topics')}
        description={state.eduTitle || t('teacherEdu.topics')}
        onBack={goBack}
      />
      <PageMain>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <SkeletonLines lines={8} />
        ) : items.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const name = pickTextbookName(item, i18n.language) || '—'
              return (
                <Link
                  key={item.id}
                  to={teacherEduContentPath(eduId ?? '', lessonId ?? '', item.id)}
                  state={{ ...state, topicName: name }}
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
