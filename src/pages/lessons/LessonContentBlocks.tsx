import { useTranslation } from 'react-i18next'
import { PATH_PREFIX_FILE } from '@/config'
import { EmptyState } from '@/components/ui'
import { pickLocalized, resolveFileUrl } from '@/features/lessons'
import type { StudentContentItem } from '@/types'

type Props = {
  items: StudentContentItem[]
  visibleTypes: Set<string>
  fontSize: number
}

function mediaSrc(
  content: StudentContentItem['content'],
  lang: string,
): string {
  const raw = pickLocalized(content, lang)
  return resolveFileUrl(raw, PATH_PREFIX_FILE)
}

export function LessonContentBlocks({ items, visibleTypes, fontSize }: Props) {
  const { i18n, t } = useTranslation()
  const lang = i18n.language

  if (items.length === 0) {
    return (
      <EmptyState
        description={t('lessons.contentEmpty')}
        className="border-0"
      />
    )
  }

  return (
    <div className="space-y-5" style={{ fontSize }}>
      {items.map((item, index) => {
        const typeId = String(item.type_id ?? 1)
        if (!visibleTypes.has(typeId)) return null

        const key = item.id ?? index

        if (item.type_id === 2) {
          return (
            <div key={key} className="flex justify-center">
              <video
                controls
                controlsList="nodownload noremoteplayback noplaybackrate"
                disablePictureInPicture
                className="max-h-[420px] w-full max-w-2xl rounded-lg bg-deep/90"
                src={mediaSrc(item.content, lang)}
              />
            </div>
          )
        }

        if (item.type_id === 3) {
          return (
            <div key={key} className="flex justify-center">
              <img
                src={mediaSrc(item.content, lang)}
                alt=""
                className="max-h-[480px] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          )
        }

        if (item.type_id === 4) {
          return (
            <div key={key} className="flex justify-center">
              <audio
                controls
                className="w-full max-w-xl"
                src={mediaSrc(item.content, lang)}
              />
            </div>
          )
        }

        if (item.type_id === 5) {
          const href = mediaSrc(item.content, lang)
          return (
            <div key={key} className="text-center">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline"
              >
                {t('lessons.viewFile')}
              </a>
            </div>
          )
        }

        const html = pickLocalized(item.content, lang)
        if (!html) return null

        return (
          <div
            key={key}
            className="lesson-html text-justify text-ink"
            style={{ fontSize }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      })}
    </div>
  )
}
