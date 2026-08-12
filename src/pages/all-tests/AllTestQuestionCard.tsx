import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  CheckCircle2,
  FileImage,
  ImageOff,
  PlayCircle,
  VideoOff,
} from 'lucide-react'
import { PATH_PREFIX_FILE } from '@/config'
import { Panel, Tabs } from '@/components/ui'
import { resolveFileUrl } from '@/features/lessons'
import { cn } from '@/lib/cn'
import type { AllTestQuestion, ExamContentBlock } from '@/types'

function textFromBody(body: ExamContentBlock[] | null | undefined): string {
  if (!body?.length) return ''
  const text = body.find((b) => Number(b.type) === 1)
  return text?.value ? String(text.value) : ''
}

function imageFromBody(body: ExamContentBlock[] | null | undefined): string {
  if (!body?.length) return ''
  const img = body.find((b) => Number(b.type) === 2)
  const path = img?.webp || img?.value
  return path ? resolveFileUrl(String(path), PATH_PREFIX_FILE) : ''
}

function HighlightedText({
  text,
  highlight,
}: {
  text: string
  highlight: string
}) {
  if (!highlight.trim()) return <>{text}</>
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            className="rounded-sm bg-amber-soft px-0.5 text-deep"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

type Props = {
  item: AllTestQuestion
  num: number
  highlight: string
}

export function AllTestQuestionCard({ item, num, highlight }: Props) {
  const { t } = useTranslation()
  const questionText = textFromBody(item.body)
  const imageUrl = imageFromBody(item.body)
  const videoUrl = item.answer_video
    ? resolveFileUrl(String(item.answer_video), PATH_PREFIX_FILE)
    : ''
  const hasImage = Boolean(imageUrl)
  const hasVideo = Boolean(videoUrl)
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>(
    hasImage ? 'image' : 'video',
  )

  return (
    <Panel padding="md" className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-deep text-[13px] font-bold text-white">
          {num}
        </span>
        <h3 className="m-0 pt-1 text-[15px] leading-snug font-semibold text-deep">
          <HighlightedText text={questionText} highlight={highlight} />
        </h3>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <div className="overflow-hidden rounded-lg border border-mist lg:col-span-2">
          <div className="flex items-center gap-1.5 border-b border-mist bg-fog/60 px-3 py-2 text-[12px] font-semibold text-muted">
            <FileImage className="size-3.5" aria-hidden />
            {t('allTests.visual')}
          </div>
          <div className="space-y-2 p-3">
            {hasImage || hasVideo ? (
              <Tabs
                fullWidth
                size="sm"
                aria-label={t('allTests.visual')}
                value={mediaTab}
                onChange={(v) => setMediaTab(v)}
                items={[
                  {
                    value: 'image' as const,
                    label: t('allTests.image'),
                    icon: <FileImage className="size-3.5" />,
                    disabled: !hasImage,
                  },
                  {
                    value: 'video' as const,
                    label: t('allTests.video'),
                    icon: <PlayCircle className="size-3.5" />,
                    disabled: !hasVideo,
                  },
                ]}
              />
            ) : null}

            <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-md bg-fog/50">
              {mediaTab === 'image' && hasImage ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="max-h-72 w-full object-contain"
                />
              ) : mediaTab === 'video' && hasVideo ? (
                <video
                  key={videoUrl}
                  className="max-h-72 w-full"
                  controls
                  muted
                  loop
                  playsInline
                  controlsList="nodownload noremoteplayback noplaybackrate"
                  disablePictureInPicture
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-[12px] text-muted">
                  {mediaTab === 'image' ? (
                    <>
                      <ImageOff className="size-8" aria-hidden />
                      {t('allTests.noImage')}
                    </>
                  ) : (
                    <>
                      <VideoOff className="size-8" aria-hidden />
                      {t('allTests.noVideo')}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-mist lg:col-span-3">
          <div className="flex items-center gap-1.5 border-b border-mist bg-fog/60 px-3 py-2 text-[12px] font-semibold text-muted">
            <CheckCircle2 className="size-3.5 text-teal" aria-hidden />
            {t('allTests.answers')}
          </div>
          <div className="space-y-1.5 p-3">
            {(item.answers ?? []).map((ans, idx) => {
              const ok = ans.check === 1 || ans.is_correct === 1 || ans.is_correct === true
              return (
                <div
                  key={ans.id ?? idx}
                  className={cn(
                    'flex items-start gap-2 rounded-lg border px-2.5 py-2 text-[13px]',
                    ok
                      ? 'border-teal/40 bg-teal-soft/50 text-deep'
                      : 'border-mist bg-white text-deep',
                  )}
                >
                  <span className="shrink-0 font-bold text-muted">
                    F{idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    {textFromBody(ans.body)}
                  </span>
                  {ok ? (
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-teal"
                      aria-hidden
                    />
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-mist">
        <div className="flex items-center gap-1.5 border-b border-mist bg-fog/60 px-3 py-2 text-[12px] font-semibold text-muted">
          <BookOpen className="size-3.5" aria-hidden />
          {t('allTests.explanation')}
        </div>
        <div className="px-3 py-2.5 text-[13px] leading-relaxed text-deep">
          {item.answer_description ? (
            item.answer_description
          ) : (
            <span className="inline-flex items-center gap-1.5 text-muted">
              <BookOpen className="size-3.5" aria-hidden />
              {t('allTests.noExplanation')}
            </span>
          )}
        </div>
      </div>
    </Panel>
  )
}
