import { useMemo, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  EmptyState,
  ErrorMessage,
  Notification,
  Panel,
  Select,
  SkeletonLines,
} from '@/components/ui'
import { TextbookAgreementError } from '@/api'
import { routes, subjectClassesPath } from '@/config'
import {
  hasLangContent,
  pickContentField,
  pickTextbookName,
  textbookMediaUrl,
  useTextbookContentQuery,
} from '@/features/textbooks'
import { useSmartBack } from '@/hooks'
import type {
  TextbookContentBlock,
  TextbookContentLang,
  TextbookViewState,
} from '@/types/textbooks'

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
                alt=""
                className="max-h-[480px] w-auto max-w-full rounded-lg object-contain"
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
              <p className="m-0 font-display text-sm font-semibold text-deep">
                {name || t('textbooksPage.fileNameMissing')}
              </p>
              <a
                href={textbookMediaUrl(content)}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center text-sm font-medium text-signal hover:underline"
              >
                {t('textbooksPage.downloadFile')}
              </a>
            </div>
          )
        }

        return (
          <div
            key={key}
            className="lesson-html text-justify text-ink"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )
      })}
    </div>
  )
}

export function TextbookViewPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const state = (location.state ?? {}) as TextbookViewState
  const [params, setParams] = useSearchParams()
  const [lang, setLang] = useState<TextbookContentLang>(() =>
    asContentLang(params.get('lang')),
  )
  const fallback = state.lesson_id
    ? subjectClassesPath(state.lesson_id)
    : routes.textbooks
  const goBack = useSmartBack(fallback)
  const { data, isLoading, isError, error } = useTextbookContentQuery(id)
  const blocks = data ?? []
  const agreement =
    error instanceof TextbookAgreementError ? error.message : null

  const topicName = useMemo(() => {
    if (state.name_topic) return state.name_topic
    const first = blocks[0]
    if (!first) return ''
    return (
      pickContentField(first, lang, 'name') ||
      pickTextbookName(first, i18n.language)
    )
  }, [blocks, i18n.language, lang, state.name_topic])

  const title = topicName
    ? t('textbooksPage.topicPrefix', { name: topicName })
    : t('textbooksPage.topicFallback')

  const langOptions = CONTENT_LANGS.map((value) => ({
    value,
    label: t(`textbooksPage.lang.${value}`),
  }))

  const onLangChange = (next: TextbookContentLang) => {
    setLang(next)
    const nextParams = new URLSearchParams(params)
    nextParams.set('lang', next)
    setParams(nextParams, { replace: true })
  }

  return (
    <>
      <Header
        title={title}
        onBack={goBack}
        actions={
          <Select
            value={lang}
            options={langOptions}
            onChange={(e) => onLangChange(asContentLang(e.target.value))}
            className="w-40"
          />
        }
      />
      <PageMain fill>
        {agreement ? (
          <Notification tone="warning">{agreement}</Notification>
        ) : isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={16} />
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
