import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Badge, Panel } from '@/components/ui'
import { cn } from '@/lib/cn'
import thumbSrc from '@/assets/images/practical-training-thumb.jpg'

const PREPDRIVE_URL =
  'https://prepdrive.uz?utm_source=eavtotalim&utm_medium=amaliy_imtihon&utm_campaign=videolar'

const VIDEO_UZ =
  'https://back.eavtotalim.uz/storage/practical%20exercise/uz_video.mp4'
const VIDEO_RU =
  'https://back.eavtotalim.uz/storage/practical%20exercise/ru_video.mp4'

type LessonDef = {
  id: number
  titleKey: string
  duration?: string
  locked: boolean
}

const LESSONS: LessonDef[] = [
  { id: 1, titleKey: 'practicalTraining.lesson1', duration: '11:41', locked: false },
  { id: 2, titleKey: 'practicalTraining.lesson2', locked: true },
  { id: 3, titleKey: 'practicalTraining.lesson3', locked: true },
  { id: 4, titleKey: 'practicalTraining.lesson4', locked: true },
  { id: 5, titleKey: 'practicalTraining.lesson5', locked: true },
  { id: 6, titleKey: 'practicalTraining.lesson6', locked: true },
  { id: 7, titleKey: 'practicalTraining.lesson7', locked: true },
  { id: 8, titleKey: 'practicalTraining.lesson8', locked: true },
  { id: 9, titleKey: 'practicalTraining.lesson9', locked: true },
  { id: 10, titleKey: 'practicalTraining.lesson10', locked: true },
  { id: 11, titleKey: 'practicalTraining.lesson11', locked: true },
  { id: 12, titleKey: 'practicalTraining.lesson12', locked: true },
  { id: 13, titleKey: 'practicalTraining.lesson13', locked: true },
]

function padIndex(n: number) {
  return String(n).padStart(2, '0')
}

function openPrepDrive() {
  window.open(PREPDRIVE_URL, '_blank', 'noopener,noreferrer')
}

export function PracticalTrainingPage() {
  const { t, i18n } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)

  const videoSrc = useMemo(() => {
    const lang = (i18n.language || 'uz').toLowerCase()
    return lang.startsWith('ru') ? VIDEO_RU : VIDEO_UZ
  }, [i18n.language])

  const activeLesson = LESSONS[activeIndex]
  const prevLesson = activeIndex > 0 ? LESSONS[activeIndex - 1] : null
  const nextLesson =
    activeIndex < LESSONS.length - 1 ? LESSONS[activeIndex + 1] : null

  const selectLesson = (index: number) => {
    const lesson = LESSONS[index]
    if (!lesson) return
    if (lesson.locked) {
      openPrepDrive()
      return
    }
    setActiveIndex(index)
  }

  return (
    <>
      <Header
        title={t('practicalTraining.title')}
        description={t('practicalTraining.description')}
      />

      <main className="flex-1 space-y-4 p-3 sm:p-4">
        <Panel className="overflow-hidden">
          <div className="bg-deep/95">
            <video
              key={videoSrc}
              src={videoSrc}
              poster={thumbSrc}
              controls
              controlsList="nodownload noremoteplayback noplaybackrate"
              disablePictureInPicture
              className="max-h-[min(52vh,480px)] w-full"
            />
          </div>

          <div className="space-y-3 p-3 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wide text-muted">
                  {padIndex(activeLesson.id)} / {padIndex(LESSONS.length)}
                </p>
                <h2 className="font-display mt-0.5 text-sm font-semibold text-deep sm:text-base">
                  {t(activeLesson.titleKey)}
                </h2>
              </div>
              {!activeLesson.locked ? (
                <Badge tone="signal" className="gap-1">
                  <Check className="size-3" aria-hidden />
                  {t('practicalTraining.free')}
                </Badge>
              ) : null}
            </div>

            <div
              className="flex flex-wrap gap-1.5"
              role="tablist"
              aria-label={t('practicalTraining.allExercises')}
            >
              {LESSONS.map((lesson, index) => (
                <button
                  key={lesson.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`${padIndex(lesson.id)}. ${t(lesson.titleKey)}`}
                  onClick={() => selectLesson(index)}
                  className={cn(
                    'size-2.5 rounded-full transition',
                    index === activeIndex && 'scale-125 bg-signal',
                    index !== activeIndex &&
                      !lesson.locked &&
                      'bg-mist hover:bg-signal/50',
                    lesson.locked && index !== activeIndex && 'bg-mist/60',
                  )}
                />
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-auto justify-start py-2.5 text-left"
                disabled={!prevLesson}
                onClick={() => selectLesson(activeIndex - 1)}
              >
                <ChevronLeft className="size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold text-muted">
                    {t('practicalTraining.prev')}
                  </span>
                  {prevLesson ? (
                    <span className="block truncate text-[12px] text-deep">
                      {t(prevLesson.titleKey)}
                    </span>
                  ) : null}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto justify-end py-2.5 text-right"
                disabled={!nextLesson}
                onClick={() => selectLesson(activeIndex + 1)}
              >
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold text-muted">
                    {t('practicalTraining.next')}
                  </span>
                  {nextLesson ? (
                    <span className="block truncate text-[12px] text-deep">
                      {t(nextLesson.titleKey)}
                    </span>
                  ) : null}
                </span>
                <ChevronRight className="size-4 shrink-0" />
              </Button>
            </div>
          </div>
        </Panel>

        <div className="space-y-2">
          <h3 className="px-0.5 text-[13px] font-semibold text-deep">
            {t('practicalTraining.allExercises')}
          </h3>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LESSONS.map((lesson, index) => {
              const isActive = index === activeIndex && !lesson.locked
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => selectLesson(index)}
                  className={cn(
                    'overflow-hidden rounded-xl border border-mist/70 bg-white text-left transition',
                    'hover:border-signal/40 hover:shadow-sm',
                    isActive && 'border-signal ring-2 ring-signal/20',
                  )}
                >
                  <div className="relative aspect-video bg-deep">
                    <img
                      src={thumbSrc}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 rounded-md bg-deep/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {padIndex(lesson.id)}
                    </span>
                    {!lesson.locked && lesson.duration ? (
                      <span className="absolute right-2 bottom-2 rounded-md bg-deep/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {lesson.duration}
                      </span>
                    ) : null}
                    {lesson.locked ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-deep/45">
                        <span className="flex size-9 items-center justify-center rounded-full bg-white/90 text-deep">
                          <Lock className="size-4" aria-hidden />
                        </span>
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1 p-2.5">
                    <p className="line-clamp-2 text-[12px] font-semibold text-deep">
                      {t(lesson.titleKey)}
                    </p>
                    <p
                      className={cn(
                        'text-[11px] font-medium',
                        lesson.locked ? 'text-amber' : 'text-signal',
                      )}
                    >
                      {lesson.locked
                        ? t('practicalTraining.subscriptionRequired')
                        : t('practicalTraining.free')}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
