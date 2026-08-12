import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Plus,
  Quote,
  Star,
  Volume2,
} from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  Pagination,
  Panel,
  Skeleton,
  SkeletonCard,
  SkeletonLines,
} from '@/components/ui'
import {
  parsePercent,
  pickLocalized,
  resolveSavedTopicId,
  secondsToHms,
  useSavedTopicsQuery,
  useStudentContentsQuery,
  useStudentTopicsQuery,
  useToggleSavedTopicMutation,
} from '@/features/lessons'
import { cn } from '@/lib'
import { LessonContentBlocks } from './LessonContentBlocks'

const ALL_TYPES = ['1', '2', '3', '4', '5', 'all'] as const
const PAGE_SIZE = 10
const FONT_MIN = 13
const FONT_MAX = 30

type LocationState = {
  lessonName?: string
  lessonId?: number
}

function TopicsSidebarSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-2 p-3">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-8 w-full" rounded="lg" />
        </SkeletonCard>
      ))}
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="mx-auto h-4 w-2/3" />
      <SkeletonLines lines={14} />
    </div>
  )
}

export function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const state = (location.state ?? {}) as LocationState
  const { t, i18n } = useTranslation()

  const [page, setPage] = useState(1)
  const [topicId, setTopicId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [fontSize, setFontSize] = useState(14)
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
    () => new Set(ALL_TYPES),
  )

  const {
    data: topicsPage,
    isLoading: topicsLoading,
    isError: topicsError,
  } = useStudentTopicsQuery(id, page, PAGE_SIZE)

  const topics = useMemo(
    () => (topicsPage?.data ?? []).filter((item) => item.type === 1),
    [topicsPage?.data],
  )

  const totalItems = topicsPage?.total_items ?? 0
  const totalPages = Math.max(
    1,
    topicsPage?.last_page ?? Math.ceil(totalItems / PAGE_SIZE) ?? 1,
  )

  useEffect(() => {
    if (topics.length === 0) {
      setTopicId(null)
      return
    }
    setTopicId((prev) => {
      if (prev != null && topics.some((item) => item.id === prev)) return prev
      return topics[0]?.id ?? null
    })
  }, [topics])

  const activeTopic = topics.find((item) => item.id === topicId) ?? null
  const activeIndex = topics.findIndex((item) => item.id === topicId)

  const {
    data: contents = [],
    isLoading: contentsLoading,
    isError: contentsError,
  } = useStudentContentsQuery(topicId)

  const { data: savedTopics = [] } = useSavedTopicsQuery()
  const toggleSave = useToggleSavedTopicMutation()

  const isSaved = useMemo(() => {
    if (topicId == null) return false
    if (savedTopics.some((item) => resolveSavedTopicId(item) === topicId)) {
      return true
    }
    return contents.some((item) => item.saved_topic != null)
  }, [savedTopics, topicId, contents])

  const savedRecordId = useMemo(() => {
    if (topicId == null) return null
    const found = savedTopics.find(
      (item) => resolveSavedTopicId(item) === topicId,
    )
    return found?.id ?? null
  }, [savedTopics, topicId])

  const lessonTitle = state.lessonName || t('lessons.title')

  async function handleToggleSave() {
    if (topicId == null) return
    try {
      await toggleSave.mutateAsync({
        topicId,
        save: !isSaved,
        savedId: savedRecordId,
      })
    } catch {
      /* cache rollback */
    }
  }

  function changeFont(delta: number) {
    setFontSize((prev) => Math.min(FONT_MAX, Math.max(FONT_MIN, prev + delta)))
  }

  function toggleType(key: string) {
    setVisibleTypes((prev) => {
      const next = new Set(prev)
      if (key === 'all') {
        if (next.has('all')) return new Set()
        return new Set(ALL_TYPES)
      }
      if (next.has(key)) {
        next.delete(key)
        next.delete('all')
      } else {
        next.add(key)
        if (['1', '2', '3', '4', '5'].every((k) => next.has(k))) {
          next.add('all')
        }
      }
      return next
    })
  }

  const filterButtons: Array<{
    key: string
    label: string
    icon?: typeof Play
  }> = [
    { key: '2', label: t('lessons.filterVideos'), icon: Play },
    { key: '1', label: t('lessons.filterTexts'), icon: Quote },
    { key: '4', label: t('lessons.filterAudios'), icon: Volume2 },
    { key: '3', label: t('lessons.filterImages'), icon: ImageIcon },
    { key: '5', label: t('lessons.filterFiles'), icon: FileText },
    { key: 'all', label: t('lessons.filterAll') },
  ]

  const topicCounter =
    activeIndex >= 0
      ? `${(page - 1) * PAGE_SIZE + activeIndex + 1}/${Math.max(topics.length, 1)}`
      : `0/${topics.length}`

  return (
    <div className="flex h-[calc(100svh-2.75rem)] min-h-0 flex-col gap-2.5 overflow-hidden p-3 sm:p-4">
      <Panel className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/lessons"
            aria-label={t('common.back')}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-mist text-deep transition hover:bg-fog"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold tracking-wide text-signal uppercase">
              {t('lessons.subjectName')}
            </p>
            <h1 className="font-display truncate text-sm font-semibold text-deep sm:text-[15px]">
              {lessonTitle}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="signal" className="px-2 py-1 text-[12px]">
            {t('lessons.topicLabel')}: {topicCounter}
          </Badge>
          <div className="inline-flex items-center gap-1 rounded-lg border border-mist bg-fog/60 px-1 py-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7"
              onClick={() => changeFont(-1)}
              aria-label={t('lessons.fontDecrease')}
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="min-w-10 text-center text-[12px] font-medium text-deep">
              {fontSize}px
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7"
              onClick={() => changeFont(1)}
              aria-label={t('lessons.fontIncrease')}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-1.5">
        {filterButtons.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant="soft"
            size="sm"
            active={visibleTypes.has(key)}
            onClick={() => toggleType(key)}
          >
            {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
            {label}
          </Button>
        ))}
        <Button
          variant={isSaved ? 'soft' : 'outline'}
          size="icon-sm"
          className={cn(isSaved && 'text-amber')}
          disabled={topicId == null}
          loading={toggleSave.isPending}
          onClick={() => void handleToggleSave()}
          aria-label={isSaved ? t('lessons.unsave') : t('lessons.save')}
          title={isSaved ? t('lessons.unsave') : t('lessons.save')}
        >
          <Star className={cn('size-4', isSaved && 'fill-current')} />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 gap-2.5">
        <Panel
          as="aside"
          className={cn(
            'flex shrink-0 flex-col transition-all',
            sidebarOpen ? 'w-full max-w-[320px]' : 'w-12',
          )}
        >
          <div className="flex items-center justify-end border-b border-mist/60 px-2 py-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-teal hover:bg-teal-soft hover:text-teal"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={
                sidebarOpen
                  ? t('lessons.collapseSidebar')
                  : t('lessons.expandSidebar')
              }
            >
              {sidebarOpen ? (
                <PanelLeftClose className="size-4" />
              ) : (
                <PanelLeftOpen className="size-4" />
              )}
            </Button>
          </div>

          {sidebarOpen ? (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {topicsLoading ? (
                  <TopicsSidebarSkeleton />
                ) : topicsError ? (
                  <ErrorMessage className="p-3" />
                ) : topics.length === 0 ? (
                  <EmptyState
                    className="border-0 py-8"
                    description={t('lessons.topicsEmpty')}
                  />
                ) : (
                  <ul className="space-y-2 p-2.5">
                    {topics.map((topic, index) => {
                      const selected = topic.id === topicId
                      const percent = parsePercent(
                        topic.exam_topic_test_student_result?.percent,
                      )
                      const hasTest = (topic.exam_topics?.length ?? 0) > 0
                      const readTime = secondsToHms(
                        topic.topic_action_limit?.time_limit,
                      )
                      const title = pickLocalized(topic.name, i18n.language)
                      const order = (page - 1) * PAGE_SIZE + index + 1

                      return (
                        <li key={topic.id}>
                          <button
                            type="button"
                            onClick={() => setTopicId(topic.id)}
                            className={cn(
                              'w-full rounded-xl border px-3 py-2.5 text-left transition',
                              selected
                                ? 'border-signal bg-signal-soft/40 shadow-[0_0_0_1px_rgba(47,126,160,0.15)]'
                                : 'border-mist/70 bg-white hover:border-signal/30',
                            )}
                          >
                            <p
                              className="text-[13px] leading-snug font-semibold text-deep"
                              style={{ fontSize: Math.max(12, fontSize - 1) }}
                            >
                              {order}. {title || '—'}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-medium text-signal">
                                {percent}%
                              </span>
                              <Badge tone="teal">
                                {t('lessons.readTime')}: {readTime}
                              </Badge>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fog">
                              <div
                                className="h-full rounded-full bg-signal"
                                style={{
                                  width: `${Math.min(100, percent)}%`,
                                }}
                              />
                            </div>
                            <span
                              className={cn(
                                'mt-2 block w-full rounded-lg border px-2 py-1.5 text-center text-[11px] font-semibold',
                                hasTest
                                  ? 'border-dashed border-signal/40 text-signal'
                                  : 'border-mist text-muted',
                              )}
                            >
                              {hasTest
                                ? t('lessons.takeTopicTest')
                                : t('lessons.noTest')}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                total={totalItems}
                className="border-t border-mist/60 px-2"
              />
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-2">
              {topics.map((topic, index) => (
                <Button
                  key={topic.id}
                  variant={topic.id === topicId ? 'primary' : 'ghost'}
                  size="icon-sm"
                  title={pickLocalized(topic.name, i18n.language)}
                  onClick={() => setTopicId(topic.id)}
                  className={cn(
                    'text-[11px] font-bold',
                    topic.id !== topicId && 'bg-fog text-muted hover:bg-signal-soft',
                  )}
                >
                  {(page - 1) * PAGE_SIZE + index + 1}
                </Button>
              ))}
            </div>
          )}
        </Panel>

        <Panel as="section" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="border-b border-mist/60 px-4 py-2.5 text-center">
            {topicsLoading || contentsLoading ? (
              <Skeleton className="mx-auto h-4 w-1/2" />
            ) : (
              <p className="text-[12px] font-semibold tracking-wide text-signal uppercase">
                {t('lessons.topicLabel')}:{' '}
                <span className="text-amber normal-case">
                  {pickLocalized(activeTopic?.name, i18n.language) || '—'}
                </span>
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {topicsLoading || contentsLoading ? (
              <ContentSkeleton />
            ) : contentsError ? (
              <ErrorMessage />
            ) : (
              <LessonContentBlocks
                items={contents}
                visibleTypes={visibleTypes}
                fontSize={fontSize}
              />
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}
