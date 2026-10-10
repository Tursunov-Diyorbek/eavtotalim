import { useMemo, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  EmptyState,
  ErrorMessage,
  Panel,
  Select,
  SkeletonLines,
} from '@/components/ui'
import { teacherEduTopicsPath } from '@/config/routes'
import {
  hasLangContent,
  LessonHtml,
  pickContentField,
  pickTextbookName,
  textbookMediaUrl,
} from '@/features/textbooks'
import { useTeacherEduContentsQuery } from '@/features/teacher-edu'
import { useSmartBack } from '@/hooks'
import type { TextbookContentBlock, TextbookContentLang } from '@/types/textbooks'

const CONTENT_LANGS: TextbookContentLang[] = ['uz', 'kiril', 'qq', 'ru', 'en']

function asContentLang(value: string | null): TextbookContentLang {
  return CONTENT_LANGS.includes(value as TextbookContentLang)
    ? (value as TextbookContentLang)
    : 'uz'
}

function ContentBlocks({
  blocks,
  lang,
}: {
  blocks: TextbookContentBlock[]
  lang: TextbookContentLang
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const typeId = String(block.type_id ?? 1)
        const content = pickContentField(block, lang, 'content')
        const name = pickContentField(block, lang, 'name')
        if (!content) return null
        const key = block.id ?? index

        if (typeId === '2') {
          return (
            <div key={key} className="flex justify-center">
              <video
                controls
                controlsList="nodownload noremoteplayback noplaybackrate"
                disablePictureInPicture
                className="max-h-[420px] w-full max-w-2xl rounded-lg bg-deep/90"
                src={textbookMediaUrl(content)}
              />
            </div>
          )
        }

        if (typeId === '3') {
          return (
            <div key={key} className="flex justify-center">
              <img
                src={textbookMediaUrl(content)}
                alt={name || ''}
                className="max-h-52 max-w-full rounded-xl object-contain"
              />
            </div>
          )
        }

        if (typeId === '4') {
          return (
            <div key={key} className="flex justify-center">
              <audio
                controls
                controlsList="nodownload"
                className="w-full max-w-xl"
                src={textbookMediaUrl(content)}
              />
            </div>
          )
        }

        if (typeId === '5') {
          return (
            <div
              key={key}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <p className="m-0 text-sm font-semibold text-deep">
                {name || t('textbooksPage.fileNameMissing')}
              </p>
              <a
                href={textbookMediaUrl(content)}
                target="_blank"
                rel="noreferrer"
                download
                className="text-sm font-medium text-signal hover:underline"
              >
                {t('textbooksPage.downloadFile')}
              </a>
            </div>
          )
        }

        return <LessonHtml key={key} html={content} />
      })}
    </div>
  )
}

export function TeacherEduContentPage() {
  const { t, i18n } = useTranslation()
  const { eduId, lessonId, topicId } = useParams<{
    eduId: string
    lessonId: string
    topicId: string
  }>()
  const location = useLocation()
  const state = (location.state ?? {}) as { topicName?: string; lessonName?: string }
  const [params, setParams] = useSearchParams()
  const [lang, setLang] = useState<TextbookContentLang>(() =>
    asContentLang(params.get('lang')),
  )
  const goBack = useSmartBack(teacherEduTopicsPath(eduId ?? '', lessonId ?? ''))
  const { data, isLoading, isError } = useTeacherEduContentsQuery(topicId)
  const blocks = data ?? []

  const topicName = useMemo(() => {
    if (state.topicName) return state.topicName
    const first = blocks[0]
    if (!first) return ''
    return pickContentField(first, lang, 'name') || pickTextbookName(first, i18n.language)
  }, [blocks, i18n.language, lang, state.topicName])

  const langOptions = CONTENT_LANGS.map((value) => ({
    value,
    label: t(`textbooksPage.lang.${value}`),
  }))

  return (
    <>
      <Header
        title={topicName || t('textbooksPage.topicFallback')}
        description={state.lessonName}
        onBack={goBack}
        actions={
          <Select
            value={lang}
            options={langOptions}
            onChange={(event) => {
              const next = asContentLang(event.target.value)
              setLang(next)
              const nextParams = new URLSearchParams(params)
              nextParams.set('lang', next)
              setParams(nextParams, { replace: true })
            }}
            className="w-40"
          />
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={12} />
          </Panel>
        ) : blocks.length === 0 ? (
          <EmptyState description={t('textbooksPage.emptyContent')} />
        ) : !hasLangContent(blocks, lang) ? (
          <EmptyState description={t('textbooksPage.emptyLang')} />
        ) : (
          <Panel padding="md" className="min-h-0 flex-1 overflow-y-auto">
            <ContentBlocks blocks={blocks} lang={lang} />
          </Panel>
        )}
      </PageMain>
    </>
  )
}
