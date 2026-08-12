import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Star } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  EmptyState,
  ErrorMessage,
  Panel,
  Skeleton,
  SkeletonCard,
  SkeletonLines,
} from '@/components/ui'
import {
  pickSavedTopicTitle,
  resolveSavedTopicId,
  useSavedTopicsQuery,
  useStudentContentsQuery,
  useToggleSavedTopicMutation,
} from '@/features/lessons'
import { cn } from '@/lib'
import { routes } from '@/config'
import { LessonContentBlocks } from './LessonContentBlocks'

const ALL_TYPES = new Set(['1', '2', '3', '4', '5', 'all'])

function ListSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 5 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-2 p-3">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export function SavedTopicsPage() {
  const { t, i18n } = useTranslation()
  const { data = [], isLoading, isError } = useSavedTopicsQuery()
  const [topicId, setTopicId] = useState<number | null>(null)
  const toggleSave = useToggleSavedTopicMutation()

  useEffect(() => {
    if (data.length === 0) {
      setTopicId(null)
      return
    }
    setTopicId((prev) => {
      if (prev != null && data.some((item) => resolveSavedTopicId(item) === prev)) {
        return prev
      }
      return resolveSavedTopicId(data[0]!) ?? null
    })
  }, [data])

  const activeItem = useMemo(
    () => data.find((item) => resolveSavedTopicId(item) === topicId) ?? null,
    [data, topicId],
  )

  const {
    data: contents = [],
    isLoading: contentsLoading,
    isError: contentsError,
  } = useStudentContentsQuery(topicId)

  async function handleUnsave(topicIdValue: number, savedId: number) {
    try {
      await toggleSave.mutateAsync({
        topicId: topicIdValue,
        savedId,
        save: false,
      })
    } catch {
      /* onError cache tiklaydi */
    }
  }

  return (
    <>
      <Header
        title={t('lessons.savedTitle')}
        description={t('lessons.savedDescription')}
        actions={
          <Link
            to={routes.lessons}
            className="inline-flex items-center gap-1.5 rounded-lg border border-mist bg-white px-2.5 py-1.5 text-[12px] font-semibold text-deep transition hover:bg-fog"
          >
            <ArrowLeft className="size-3.5" />
            {t('lessons.backToLessons')}
          </Link>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col gap-2.5 p-3 sm:p-4">
        <div className="flex min-h-[calc(100svh-8rem)] flex-1 gap-2.5 overflow-hidden">
          <Panel as="aside" className="flex w-full max-w-[320px] shrink-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoading ? (
                <ListSkeleton />
              ) : isError ? (
                <ErrorMessage className="p-3" />
              ) : data.length === 0 ? (
                <EmptyState
                  className="border-0 py-8"
                  description={t('lessons.savedEmpty')}
                />
              ) : (
                <ul className="space-y-2 p-2.5">
                  {data.map((item, index) => {
                    const id = resolveSavedTopicId(item)
                    if (id == null) return null
                    const selected = id === topicId
                    const title = pickSavedTopicTitle(item, i18n.language)
                    return (
                      <li key={item.id}>
                        <div
                          className={cn(
                            'rounded-xl border px-3 py-2.5 transition',
                            selected
                              ? 'border-signal bg-signal-soft/40'
                              : 'border-mist/70 bg-white',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setTopicId(id)}
                            className="w-full text-left"
                          >
                            <p className="text-[13px] leading-snug font-semibold text-deep">
                              {index + 1}. {title}
                            </p>
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full text-amber"
                            loading={
                              toggleSave.isPending &&
                              toggleSave.variables?.topicId === id
                            }
                            onClick={() => void handleUnsave(id, item.id)}
                          >
                            <Star className="size-3.5 fill-current" />
                            {t('lessons.unsave')}
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </Panel>

          <Panel as="section" className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="border-b border-mist/60 px-4 py-2.5 text-center">
              {isLoading || contentsLoading ? (
                <Skeleton className="mx-auto h-4 w-1/2" />
              ) : (
                <p className="text-[12px] font-semibold tracking-wide text-signal uppercase">
                  {t('lessons.topicLabel')}:{' '}
                  <span className="text-amber normal-case">
                    {activeItem
                      ? pickSavedTopicTitle(activeItem, i18n.language)
                      : '—'}
                  </span>
                </p>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {isLoading || contentsLoading ? (
                <div className="space-y-3">
                  <SkeletonLines lines={12} />
                </div>
              ) : contentsError ? (
                <ErrorMessage />
              ) : topicId == null ? (
                <EmptyState description={t('lessons.savedEmpty')} className="border-0" />
              ) : (
                <LessonContentBlocks
                  items={contents}
                  visibleTypes={ALL_TYPES}
                  fontSize={14}
                />
              )}
            </div>
          </Panel>
        </div>
      </main>
    </>
  )
}
