import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  ListPageSkeleton,
  Modal,
  Pagination,
  SafeImage,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import type { FaceWarningView } from '@/api'
import { useFaceControlWarningListQuery } from '@/features/face-control-warnings'
import { resolveFileUrl } from '@/features/lessons'
import { formatDateTime } from '@/lib/format'
import type { FaceControlWarning } from '@/types'

function imageList(row: FaceControlWarning) {
  const raw = row.images ?? row.image
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
      }
    } catch {
      return [raw]
    }
    return [raw]
  }
  return []
}

export function FaceControlWarningsPage() {
  const { t, i18n } = useTranslation()
  const [view, setView] = useState<FaceWarningView>('unseen')
  const [preview, setPreview] = useState<string | null>(null)
  const { data, isLoading, isError, error } = useFaceControlWarningListQuery(view)
  const rows = data?.data ?? []

  return (
    <>
      <Header title={<span className="uppercase">{t('faceWarningsPage.title')}</span>} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage>
            {error instanceof Error ? error.message : undefined}
          </ErrorMessage>
        ) : isLoading ? (
          <ListPageSkeleton rows={6} />
        ) : (
          <Table storageKey="face-control-warnings">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="photo" className="w-16">
                  {t('faceWarningsPage.photo')}
                </TH>
                <TH column="note">{t('faceWarningsPage.note')}</TH>
                <TH column="dates">
                  <span className="flex items-end justify-between gap-3">
                    <span className="whitespace-normal">
                      {t('faceWarningsPage.dates')}
                    </span>
                    <Select
                      size="sm"
                      searchable={false}
                      className="w-40 shrink-0 font-normal"
                      label={t('faceWarningsPage.view')}
                      value={view}
                      onChange={(e) => setView(e.target.value as FaceWarningView)}
                      options={[
                        { value: 'unseen', label: t('faceWarningsPage.unseen') },
                        { value: 'seen', label: t('faceWarningsPage.seen') },
                        { value: 'all', label: t('faceWarningsPage.all') },
                      ]}
                    />
                  </span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={4} description={t('faceWarningsPage.empty')} />
              ) : (
                rows.map((row, index) => {
                  const photos = imageList(row).map((src) =>
                    resolveFileUrl(src, PATH_PREFIX_FILE),
                  )
                  const created = formatDateTime(row.created_at, i18n.language)
                  const updated = formatDateTime(row.updated_at, i18n.language)
                  return (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {index + 1}
                      </TD>
                      <TD column="photo">
                        {photos[0] ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => setPreview(photos[0])}
                          >
                            <SafeImage
                              src={photos[0]}
                              alt=""
                              size="sm"
                              className="size-9 rounded-lg"
                            />
                          </Button>
                        ) : (
                          <SafeImage src="" alt="" size="sm" className="size-9 rounded-lg" />
                        )}
                      </TD>
                      <TD column="note" className="whitespace-pre-wrap">
                        {row.text?.trim() || '—'}
                      </TD>
                      <TD column="dates" className="text-sm">
                        {created || '—'}
                        {updated && updated !== created ? (
                          <span className="text-muted"> / {updated}</span>
                        ) : null}
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          page={1}
          totalPages={data?.last_page ?? 1}
          onPageChange={() => undefined}
          total={data?.total_items ?? rows.length}
        />
      </PageMain>
      <Modal
        open={preview != null}
        onClose={() => setPreview(null)}
        title={t('faceWarningsPage.photo')}
        sizeClassName="max-w-lg"
        bodyClassName="p-3 sm:p-4"
      >
        <SafeImage
          src={preview}
          alt=""
          size="xl"
          fit="contain"
          className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
        />
      </Modal>
    </>
  )
}
