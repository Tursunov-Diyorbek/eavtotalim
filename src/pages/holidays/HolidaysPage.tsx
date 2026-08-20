import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
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
import { routes } from '@/config'
import { useDeleteHolidayMutation, useHolidaysQuery } from '@/features/holidays'
import { formatDate } from '@/lib/format'
import type { HolidayItem } from '@/api/holidays'

export function HolidaysPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch, isFetching } = useHolidaysQuery()
  const deleteMutation = useDeleteHolidayMutation()
  const [deleteRow, setDeleteRow] = useState<HolidayItem | null>(null)
  const rows = data ?? []

  return (
    <>
      <Header
        title={t('nav.holidays')}
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
              onClick={() => navigate(routes.holidaysAdd)}
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
                <TH>{t('directorList.description')}</TH>
                <TH>{t('directorList.startDate')}</TH>
                <TH>{t('directorList.endDate')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-muted">{index + 1}</TD>
                  <TD>{row.comment || '—'}</TD>
                  <TD>{formatDate(row.start_date, i18n.language) ?? '—'}</TD>
                  <TD>{formatDate(row.end_date, i18n.language) ?? '—'}</TD>
                  <TD>
                    <Button
                      variant="danger"
                      size="icon-sm"
                      aria-label={t('common.delete')}
                      onClick={() => setDeleteRow(row)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
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
        description={t('common.confirmDelete', { name: deleteRow?.comment })}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
