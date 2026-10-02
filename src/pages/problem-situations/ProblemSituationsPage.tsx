import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Pencil, Plus, Trash2 } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { problemSituationEditPath, routes } from '@/config'
import type { ProblemSituationItem } from '@/api/problem-situations'
import {
  situationFileHref,
  situationLangBody,
  situationStatusTone,
  useDeleteProblemSituationMutation,
  useProblemSituationStatusesQuery,
  useProblemSituationsQuery,
} from '@/features/problem-situations'
import { useOpenedOnce, usePageState } from '@/hooks'
import { asLangName } from '@/lib/apiPage'

function statusLabel(name: unknown, lang: string): string {
  const label = asLangName(name, lang)
  return label === '—' ? '' : label
}

export function ProblemSituationsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusId, setStatusId] = usePageState('statusId', '')
  const [deleteRow, setDeleteRow] = useState<ProblemSituationItem | null>(null)

  useEffect(() => {
    setPage(1)
  }, [statusId, pageSize])

  const [statusesEnabled, openStatuses] = useOpenedOnce(Boolean(statusId))
  const statusesQuery = useProblemSituationStatusesQuery(statusesEnabled)
  const statuses = statusesQuery.data ?? []
  const { data, isLoading, isError, refetch, isFetching } = useProblemSituationsQuery({
    page,
    showCount: pageSize,
    statusId: statusId || undefined,
  })
  const deleteMutation = useDeleteProblemSituationMutation()

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const lang =
    i18n.language === 'ru' ? 'ru' : i18n.language === 'kiril' ? 'kiril' : 'uz'

  const statusOptions = [
    { value: '', label: t('common.all') },
    ...statuses.map((item) => {
      const label = statusLabel(item.name, lang) || String(item.id)
      return { value: String(item.id), label, searchText: label }
    }),
  ]

  return (
    <>
      <Header
        title={t('nav.problemSituations')}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Select
              className="w-[300px] max-w-full"
              menuMinWidth={360}
              placeholder={t('problemSituationsPage.viewByStatus')}
              value={statusId}
              onOpen={openStatuses}
              loading={statusesQuery.isFetching && statuses.length === 0}
              onChange={(e) => setStatusId(e.target.value)}
              options={statusOptions}
              clearable
            />
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
              onClick={() => navigate(routes.problemSituationsCreate)}
            >
              <Plus className="size-3.5" aria-hidden />
              {t('problemSituationsPage.add')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
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
                <TH>{t('problemSituationsPage.colName')}</TH>
                <TH>{t('problemSituationsPage.colText')}</TH>
                <TH>{t('problemSituationsPage.colFiles')}</TH>
                <TH>{t('directorList.status')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-muted">
                    {(page - 1) * pageSize + index + 1}
                  </TD>
                  <TD>{situationLangBody(row.name, lang)}</TD>
                  <TD>
                    <span className="line-clamp-2">
                      {situationLangBody(row.text, lang)}
                    </span>
                  </TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {(row.files ?? []).map((file, i) =>
                        file.url ? (
                          <Button
                            key={file.id ?? i}
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t('problemSituationsPage.openFile')}
                            onClick={() =>
                              window.open(
                                situationFileHref(file.url!),
                                '_blank',
                                'noopener',
                              )
                            }
                          >
                            <Download className="size-3.5" />
                          </Button>
                        ) : null,
                      )}
                    </div>
                  </TD>
                  <TD>
                    <Badge
                      tone={situationStatusTone(row.problematic_situation_status?.id)}
                    >
                      {statusLabel(row.problematic_situation_status?.name, lang) ||
                        '—'}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={t('common.edit')}
                        onClick={() => navigate(problemSituationEditPath(row.id))}
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
        description={t('common.confirmDelete', {
          name: situationLangBody(deleteRow?.name, lang),
        })}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
