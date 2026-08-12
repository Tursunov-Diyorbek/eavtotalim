import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Car,
  ExternalLink,
  FileText,
  ImageIcon,
  PlayCircle,
  Volume2,
} from 'lucide-react'
import { Header } from '@/components/layout'
import {
  EmptyState,
  ErrorMessage,
  Panel,
  Skeleton,
  SkeletonCard,
  Tabs,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import {
  pickAutodromeGuideTitle,
  sanitizeGuideHtml,
  useAutodromeGuideDetailQuery,
  useAutodromeGuidesQuery,
} from '@/features/circuit-diagram'
import { resolveFileUrl } from '@/features/lessons'
import type { AutodromeGuideContentItem } from '@/types'

const PREPDRIVE_URL = 'https://prepdrive.uz'

function PageSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-28" rounded="lg" />
        ))}
      </div>
      <Skeleton className="h-16 w-full" rounded="xl" />
      <SkeletonCard className="space-y-3 p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" rounded="lg" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </SkeletonCard>
    </div>
  )
}

function GuideItemBlock({ item }: { item: AutodromeGuideContentItem }) {
  const { t } = useTranslation()
  const type = String(item.type || 'text')
  const media = resolveFileUrl(item.file_path, PATH_PREFIX_FILE)
  const caption = item.content?.trim() || ''

  if (type === 'image') {
    return (
      <Panel className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-muted">
          <ImageIcon className="size-3.5 text-signal" aria-hidden />
          {caption || t('circuitDiagram.imageLabel')}
        </div>
        {media ? (
          <div className="flex justify-center rounded-xl bg-fog/50 p-3">
            <img
              src={media}
              alt={caption || t('circuitDiagram.imageLabel')}
              className="max-h-[480px] w-auto max-w-full rounded-lg object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <p className="text-sm text-muted">{t('circuitDiagram.mediaMissing')}</p>
        )}
      </Panel>
    )
  }

  if (type === 'video') {
    return (
      <Panel className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-muted">
          <PlayCircle className="size-3.5 text-signal" aria-hidden />
          {caption || t('circuitDiagram.videoLabel')}
        </div>
        {media ? (
          <div className="overflow-hidden rounded-xl bg-deep/90">
            <video
              controls
              controlsList="nodownload noremoteplayback noplaybackrate"
              disablePictureInPicture
              preload="metadata"
              className="max-h-[420px] w-full"
              src={media}
            />
          </div>
        ) : (
          <p className="text-sm text-muted">{t('circuitDiagram.mediaMissing')}</p>
        )}
      </Panel>
    )
  }

  if (type === 'audio') {
    return (
      <Panel className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-signal-soft text-signal">
          <Volume2 className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[13px] font-semibold text-deep">
            {caption || t('circuitDiagram.audioLabel')}
          </p>
          {media ? (
            <audio controls className="w-full max-w-xl" src={media} />
          ) : (
            <p className="text-sm text-muted">{t('circuitDiagram.mediaMissing')}</p>
          )}
        </div>
      </Panel>
    )
  }

  if (!caption) return null

  return (
    <Panel className="p-4">
      <div
        className="lesson-html text-[14px] leading-relaxed text-ink"
        dangerouslySetInnerHTML={{ __html: sanitizeGuideHtml(caption) }}
      />
    </Panel>
  )
}

export function CircuitDiagramPage() {
  const { t, i18n } = useTranslation()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const {
    data: guides = [],
    isLoading: guidesLoading,
    isError: guidesError,
  } = useAutodromeGuidesQuery(i18n.language)

  useEffect(() => {
    if (guides.length === 0) {
      setSelectedId(null)
      return
    }
    setSelectedId((prev) => {
      if (prev != null && guides.some((g) => g.id === prev)) return prev
      return guides[0].id
    })
  }, [guides])

  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
  } = useAutodromeGuideDetailQuery(selectedId)

  const sortedItems = useMemo(() => {
    const items = detail?.items ?? []
    return [...items].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    )
  }, [detail?.items])

  const isLoading = guidesLoading || (selectedId != null && detailLoading)

  return (
    <>
      <Header
        title={t('circuitDiagram.title')}
        description={t('circuitDiagram.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {guidesLoading && !guides.length ? (
          <PageSkeleton />
        ) : guidesError ? (
          <ErrorMessage />
        ) : guides.length === 0 ? (
          <EmptyState description={t('circuitDiagram.empty')} />
        ) : (
          <>
            {guides.length > 1 ? (
              <Tabs
                aria-label={t('circuitDiagram.title')}
                value={selectedId ?? guides[0]?.id}
                onChange={setSelectedId}
                items={guides.map((guide) => ({
                  value: guide.id,
                  label:
                    pickAutodromeGuideTitle(guide) ||
                    t('circuitDiagram.untitled'),
                  icon: <Car className="size-3.5" aria-hidden />,
                }))}
              />
            ) : null}

            <Panel className="border-signal/20 bg-signal-soft/40 p-3 sm:p-4">
              <p className="text-[13px] leading-relaxed text-deep">
                {t('circuitDiagram.prepdriveText')}{' '}
                <a
                  href={PREPDRIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-signal hover:underline"
                >
                  Prepdrive.uz
                  <ExternalLink className="size-3" aria-hidden />
                </a>{' '}
                {t('circuitDiagram.prepdriveVia')}{' '}
                <a
                  href={PREPDRIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-signal hover:underline"
                >
                  {t('circuitDiagram.prepdriveGo')}
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              </p>
            </Panel>

            {detailError ? (
              <ErrorMessage />
            ) : isLoading ? (
              <SkeletonCard className="space-y-3 p-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-40 w-full" rounded="lg" />
                <Skeleton className="h-4 w-full" />
              </SkeletonCard>
            ) : (
              <>
                {detail?.name || pickAutodromeGuideTitle(detail) ? (
                  <div className="flex items-center gap-2 px-0.5">
                    <FileText className="size-4 text-signal" aria-hidden />
                    <h2 className="font-display text-sm font-semibold text-deep">
                      {detail?.name || pickAutodromeGuideTitle(detail)}
                    </h2>
                  </div>
                ) : null}

                {sortedItems.length === 0 ? (
                  <EmptyState description={t('circuitDiagram.emptyContent')} />
                ) : (
                  <div className="space-y-3">
                    {sortedItems.map((item, index) => (
                      <GuideItemBlock
                        key={item.id ?? index}
                        item={item}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </>
  )
}
