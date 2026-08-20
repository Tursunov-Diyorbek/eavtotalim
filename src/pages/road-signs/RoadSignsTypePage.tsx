import { useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Button,
  EmptyState,
  ErrorMessage,
  Modal,
  Pagination,
  Panel,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { PATH_PREFIX_FILE, routes } from '@/config'
import {
  pickRoadSignContent,
  pickRoadSignFallbackText,
  pickRoadSignName,
  roadSignImageUrl,
  useRoadSignDetailQuery,
  useRoadSignsByTypeQuery,
} from '@/features/road-signs'
import { useSmartBack } from '@/hooks'
import type { RoadSignContentBlock, RoadSignItem } from '@/types'

const PAGE_SIZE = 12

type LocationState = {
  typeName?: string
}

function GridSkeleton() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-3 p-4">
          <Skeleton className="mx-auto size-20" rounded="lg" />
          <Skeleton className="mx-auto h-4 w-3/5" />
          <Skeleton className="h-8 w-full" rounded="lg" />
        </SkeletonCard>
      ))}
    </div>
  )
}

function formatContentHtml(raw: string) {
  let sanitized = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&amp;nbsp;/g, '&nbsp;')

  for (const tag of ['p', 'br', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li']) {
    sanitized = sanitized.replace(
      new RegExp(`&lt;(/?${tag})&gt;`, 'g'),
      '<$1>',
    )
  }

  sanitized = sanitized
    .replace(/(\r\n|\n|\r){2,}/g, '</p><p>')
    .replace(/(\r\n|\n|\r)/g, '<br />')

  if (!sanitized.startsWith('<p>')) sanitized = `<p>${sanitized}</p>`
  return sanitized
}

function ContentBlocks({ blocks }: { blocks: RoadSignContentBlock[] }) {
  if (blocks.length === 0) return null

  return (
    <div className="mt-2 space-y-3">
      {blocks.map((block, index) => {
        const type = String(block.type ?? '1')
        const value = block.value ?? ''
        if (!value && (type === '1' || type === 'text')) return null
        const media = roadSignImageUrl(value, PATH_PREFIX_FILE)

        if (type === '2' || type === 'video') {
          return (
            <div key={index} className="flex justify-center">
              <video
                controls
                controlsList="nodownload noremoteplayback noplaybackrate"
                disablePictureInPicture
                className="max-h-72 w-full max-w-lg rounded-lg bg-deep/90"
                src={media}
              />
            </div>
          )
        }

        if (type === '3' || type === 'image') {
          return (
            <div key={index} className="flex justify-center">
              <img
                src={media}
                alt=""
                className="max-h-80 max-w-full rounded-lg object-contain"
              />
            </div>
          )
        }

        if (type === '4' || type === 'audio') {
          return (
            <div key={index} className="flex justify-center">
              <audio controls className="w-full max-w-md" src={media} />
            </div>
          )
        }

        return (
          <div
            key={index}
            className="lesson-html text-[14px] leading-relaxed text-ink"
            dangerouslySetInnerHTML={{ __html: formatContentHtml(value) }}
          />
        )
      })}
    </div>
  )
}

export function RoadSignsTypePage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const goBack = useSmartBack(routes.roadSigns)
  const state = (location.state ?? {}) as LocationState
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<RoadSignItem | null>(null)

  const { data, isLoading, isError } = useRoadSignsByTypeQuery(id, page)
  const items = data?.data ?? []
  const totalItems = data?.total_items ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE) || 1)

  const title = state.typeName || t('roadSigns.title')

  const listBlocks = useMemo(
    () => pickRoadSignContent(selected?.content, i18n.language),
    [selected, i18n.language],
  )

  const needsDetail =
    selected != null &&
    listBlocks.length === 0 &&
    !pickRoadSignFallbackText(selected, i18n.language)

  const { data: detail, isLoading: detailLoading } = useRoadSignDetailQuery(
    selected?.id,
    needsDetail,
  )

  const activeSign = detail ?? selected

  const modalBlocks = useMemo(
    () => pickRoadSignContent(activeSign?.content, i18n.language),
    [activeSign, i18n.language],
  )

  const fallbackText = useMemo(
    () => pickRoadSignFallbackText(activeSign, i18n.language),
    [activeSign, i18n.language],
  )

  return (
    <>
      <Header
        title={title}
        description={t('roadSigns.typeDescription')}
        actions={
          <Button variant="outline" size="sm" onClick={goBack}>
            {t('roadSigns.back')}
          </Button>
        }
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isLoading ? (
          <GridSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : items.length === 0 ? (
          <EmptyState description={t('roadSigns.emptySigns')} />
        ) : (
          <>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const name = pickRoadSignName(item.name, i18n.language)
                const img = roadSignImageUrl(item.image, PATH_PREFIX_FILE)
                return (
                  <Panel
                    key={item.id}
                    className="flex flex-col items-center gap-3 p-4 text-center"
                  >
                    <div className="flex h-24 w-full items-center justify-center">
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          className="max-h-20 max-w-[90px] object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-[13px] font-semibold text-deep">
                      {name}
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-auto w-full"
                      onClick={() => setSelected(item)}
                    >
                      {t('roadSigns.fullView')}
                    </Button>
                  </Panel>
                )
              })}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={totalItems}
              className="justify-end"
            />
          </>
        )}
      </main>

      <Modal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={
          selected
            ? pickRoadSignName(selected.name, i18n.language)
            : t('roadSigns.fullView')
        }
      >
        {selected ? (
          <div className="space-y-4">
            {(activeSign?.image || selected.image) ? (
              <div className="flex justify-center rounded-xl bg-fog/60 p-4">
                <img
                  src={roadSignImageUrl(
                    activeSign?.image || selected.image,
                    PATH_PREFIX_FILE,
                  )}
                  alt=""
                  className="max-h-48 max-w-full object-contain"
                />
              </div>
            ) : null}
            {detailLoading && needsDetail ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : modalBlocks.length > 0 ? (
              <ContentBlocks blocks={modalBlocks} />
            ) : fallbackText ? (
              <div
                className="lesson-html text-[14px] leading-relaxed text-ink"
                dangerouslySetInnerHTML={{
                  __html: formatContentHtml(fallbackText),
                }}
              />
            ) : (
              <p className="text-center text-sm text-muted">
                {t('roadSigns.noContent')}
              </p>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  )
}
