import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AddButton,
  ConfirmDialog,
  DeleteButton,
  EditButton,
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
  const { data, isLoading, isError, error } = useMessageTemplatesQuery(page, pageSize)
  const deleteMutation = useDeleteMessageTemplateMutation()
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  useEffect(() => {
    setPage(1)
  }, [pageSize])

  const openCreate = () => {
    setEditRow(null)
    setFormOpen(true)
  }

  const createButton = (
    <AddButton onClick={openCreate}>
      {t('notificationsPage.createTemplate')}
    </AddButton>
  )

  return (
    <div className="flex flex-col gap-3">
      {isError ? (
        <ErrorMessage>
          {error instanceof Error ? error.message : undefined}
        </ErrorMessage>
      ) : isLoading ? (
        <ListPageSkeleton rows={8} />
      ) : rows.length === 0 ? (
        <>
          <div className="flex justify-end">{createButton}</div>
          <EmptyState description={t('common.empty')} />
        </>
      ) : (
        <>
          <Table
            fill={false}
            storageKey="notifications-templates"
            toolbar={createButton}
          >
            <THead>
              <TR>
                <TH column="nr" className="w-12 text-center">
                  №
                </TH>
                <TH column="name" className="w-44">
                  {t('notificationsPage.colTemplateName')}
                </TH>
                <TH column="body">{t('notificationsPage.colTemplateBody')}</TH>
                <TH column="actions" className="w-24 text-center">
                  {t('common.actions')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => {
                const body = row.body?.trim() || '—'
                return (
                  <TR key={row.id}>
                    <TD column="nr" className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD column="name">
                      <span
                        className="line-clamp-2 font-medium text-deep"
                        title={row.name || undefined}
                      >
                        {row.name || '—'}
                      </span>
                    </TD>
                    <TD column="body">
                      <p
                        className="m-0 max-w-xl line-clamp-2 text-[13px] leading-snug text-ink"
                        title={body === '—' ? undefined : body}
                      >
                        {body}
                      </p>
                    </TD>
                    <TD column="actions" className="text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <EditButton
                          onClick={() => {
                            setEditRow(row)
                            setFormOpen(true)
                          }}
                        />
                        <DeleteButton onClick={() => setDeleteRow(row)} />
                      </div>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
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
