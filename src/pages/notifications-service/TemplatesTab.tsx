import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import type { MessageTemplateItem } from '@/api/notifications-service'
import {
  useDeleteMessageTemplateMutation,
  useMessageTemplatesQuery,
} from '@/features/notifications-service'
import { TemplateFormModal } from './TemplateFormModal'

export function TemplatesTab() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editRow, setEditRow] = useState<MessageTemplateItem | null>(null)
  const [deleteRow, setDeleteRow] = useState<MessageTemplateItem | null>(null)
  const { data, isLoading, isError } = useMessageTemplatesQuery(page, pageSize)
  const deleteMutation = useDeleteMessageTemplateMutation()
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  useEffect(() => {
    setPage(1)
  }, [pageSize])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold tracking-wide text-deep">
          {t('notificationsPage.templatesTitle')}
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditRow(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-3.5" aria-hidden />
          {t('notificationsPage.createTemplate')}
        </Button>
      </div>
      {isError ? (
        <ErrorMessage />
      ) : isLoading ? (
        <ListPageSkeleton rows={8} />
      ) : rows.length === 0 ? (
        <EmptyState description={t('common.empty')} />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH className="w-10">№</TH>
              <TH>{t('notificationsPage.colTemplateName')}</TH>
              <TH>{t('notificationsPage.colTemplateBody')}</TH>
              <TH>{t('common.actions')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row, index) => (
              <TR key={row.id}>
                <TD className="text-muted">
                  {(page - 1) * pageSize + index + 1}
                </TD>
                <TD>{row.name || '—'}</TD>
                <TD>
                  <span className="line-clamp-2">{row.body || '—'}</span>
                </TD>
                <TD>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={t('common.edit')}
                      onClick={() => {
                        setEditRow(row)
                        setFormOpen(true)
                      }}
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
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />
      {formOpen ? (
        <TemplateFormModal
          open={formOpen}
          template={editRow}
          onClose={() => {
            setFormOpen(false)
            setEditRow(null)
          }}
        />
      ) : null}
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
        description={t('common.confirmDelete', { name: deleteRow?.name })}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
