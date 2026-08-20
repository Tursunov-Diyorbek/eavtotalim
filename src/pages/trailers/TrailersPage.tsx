import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { routes, trailerEditPath, trailerShowPath } from '@/config'
import { useDeleteTrailerMutation, useTrailersQuery } from '@/features/trailers'
import type { TrailerItem } from '@/api/trailers'

export function TrailersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch, isFetching } = useTrailersQuery()
  const deleteMutation = useDeleteTrailerMutation()
  const [deleteRow, setDeleteRow] = useState<TrailerItem | null>(null)
  const rows = data ?? []

  return (
    <>
      <Header
        title={t('nav.trailers')}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={isFetching && !isLoading}
              onClick={() => void refetch()}
            >
              {t('common.refresh')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(routes.trailersAdd)}
            >
              <Plus className="size-3.5" aria-hidden />
              {t('common.add')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>{t('directorList.number')}</TH>
                <TH>{t('directorList.status')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-muted">{index + 1}</TD>
                  <TD className="font-medium text-ink">{row.number || '—'}</TD>
                  <TD>
                    <Badge tone={Number(row.status) === 1 ? 'teal' : 'rose'}>
                      {Number(row.status) === 1
                        ? t('dashboard.active')
                        : t('dashboard.inactive')}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      <Button
                        variant="soft"
                        size="icon-sm"
                        aria-label={t('common.view')}
                        onClick={() => navigate(trailerShowPath(row.id))}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={t('common.edit')}
                        onClick={() => navigate(trailerEditPath(row.id))}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="danger"
                        size="icon-sm"
                        aria-label={t('common.delete')}
                        onClick={() => setDeleteRow(row)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </PageMain>
      <ConfirmDialog
        open={Boolean(deleteRow)}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => {
          if (!deleteRow) return
          deleteMutation.mutate(deleteRow.id, {
            onSuccess: () => {
              notify.success(t('common.deleted'))
              setDeleteRow(null)
            },
            onError: (err) => notify.error(err.message || t('common.loadError')),
          })
        }}
        description={t('common.confirmDelete', { name: deleteRow?.number })}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
