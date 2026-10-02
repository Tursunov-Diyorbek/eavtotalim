import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, Eye, FileText, Plus, Trash2, X } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
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
import { ROLE_CODE, autodromeShowAgreementPath, routes } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useAutodromeAgreementsQuery,
  useCancelAutodromeAgreementMutation,
  useChangeAgreementTemporaryStatusMutation,
  useDeleteAutodromeAgreementMutation,
} from '@/features/autodrome-agreement'
import { formatDate } from '@/lib/format'
import type { AutodromeAgreementRow } from '@/types/autodrome-agreement'
import { AgreementCamerasPanel } from './AgreementCamerasPanel'

type ConfirmKind = 'delete' | 'pause' | 'cancel'

const APPROVED_STATUS = 2

function statusId(row: AutodromeAgreementRow) {
  return Number(row.organization_autodrome_agreement_status?.id)
}

function statusTone(id: number): 'amber' | 'teal' | 'rose' {
  if (id === 2 || id === 9) return 'teal'
  if (id === 1 || id === 4) return 'amber'
  if (id === 3 || id === 7 || id === 8) return 'rose'
  return 'amber'
}

function statusLabel(row: AutodromeAgreementRow, confirmed: string) {
  const id = statusId(row)
  if (id === 9) return confirmed
  return row.organization_autodrome_agreement_status?.title || '—'
}

export function AutodromeAgreementPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [confirm, setConfirm] = useState<{
    kind: ConfirmKind
    row: AutodromeAgreementRow
  } | null>(null)

  const query = useAutodromeAgreementsQuery()
  const deleteMutation = useDeleteAutodromeAgreementMutation()
  const pauseMutation = useChangeAgreementTemporaryStatusMutation()
  const cancelMutation = useCancelAutodromeAgreementMutation()
  const rows = query.data ?? []
  const canShow = user?.role !== ROLE_CODE.DIRECTOR

  /** Kamera holati faqat tasdiqlangan (status 2) shartnomalar avtodromlari uchun — eski loyiha kabi. */
  const autodromes = useMemo(() => {
    const map = new Map<number, { id: number; name?: string | null; inn?: string | null }>()
    rows.forEach((row) => {
      if (statusId(row) !== APPROVED_STATUS) return
      const item = row.autodrome
      if (item?.id && !map.has(item.id)) {
        map.set(item.id, { id: item.id, name: item.name, inn: item.inn })
      }
    })
    return Array.from(map.values())
  }, [rows])

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const safePage = Math.min(page, totalPages)
  const pageRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize)

  const confirmBusy =
    deleteMutation.isPending || pauseMutation.isPending || cancelMutation.isPending

  const onConfirmed = () => {
    if (!confirm) return
    const id = confirm.row.id
    const onSuccess = () => {
      notify.success(t('common.saved'))
      setConfirm(null)
    }
    const onError = (err: Error) =>
      notify.error(err.message || t('common.loadError'))

    if (confirm.kind === 'delete') {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          notify.success(t('common.deleted'))
          setConfirm(null)
        },
        onError,
      })
      return
    }
    if (confirm.kind === 'pause') {
      pauseMutation.mutate(id, { onSuccess, onError })
      return
    }
    cancelMutation.mutate(id, { onSuccess, onError })
  }

  return (
    <>
      <Header
        title={t('autodromeAgreementPage.title')}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(routes.autodromeSendAgreement)}
          >
            <Plus className="size-3.5" aria-hidden />
            {t('common.add')}
          </Button>
        }
      />
      <PageMain>
        {query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : query.isError ? (
          <ErrorMessage />
        ) : (
          <div className="flex flex-col gap-3">
            <AgreementCamerasPanel autodromes={autodromes} />
            <Table storageKey="autodrome-agreement" className="min-w-220">
              <THead>
                <TR>
                  <TH className="w-12 text-center">№</TH>
                  <TH>{t('autodromeAgreementPage.autodromeName')}</TH>
                  <TH className="text-center">
                    {t('autodromeAgreementPage.startDate')}
                  </TH>
                  <TH className="text-center">
                    {t('autodromeAgreementPage.endDate')}
                  </TH>
                  <TH className="text-center">
                    {t('autodromeAgreementPage.confirmStatus')}
                  </TH>
                  <TH className="w-28 text-center">
                    {t('autodromeAgreementPage.file')}
                  </TH>
                  <TH className="w-36">{t('common.actions')}</TH>
                </TR>
              </THead>
              <TBody>
                {pageRows.length === 0 ? (
                  <TR>
                    <TD className="py-6 text-center" colSpan={7}>
                      <EmptyState
                        className="border-0 py-4 shadow-none"
                        description={t('autodromeAgreementPage.empty')}
                      />
                    </TD>
                  </TR>
                ) : (
                  pageRows.map((row, index) => {
                    const sid = statusId(row)
                    return (
                      <TR key={row.id}>
                        <TD className="text-center text-muted">
                          {(safePage - 1) * pageSize + index + 1}
                        </TD>
                        <TD className="font-medium">
                          {row.autodrome?.name || '—'}
                        </TD>
                        <TD className="text-center">
                          <Badge tone="teal">
                            {formatDate(row.start_date, i18n.language) || '—'}
                          </Badge>
                        </TD>
                        <TD className="text-center">
                          <Badge tone="amber">
                            {formatDate(row.end_date, i18n.language) || '—'}
                          </Badge>
                        </TD>
                        <TD className="text-center">
                          <Badge tone={statusTone(sid)}>
                            {statusLabel(
                              row,
                              t('autodromeAgreementPage.confirmed'),
                            )}
                          </Badge>
                        </TD>
                        <TD className="text-center">
                          {row.file ? (
                            <a
                              href={row.file}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex text-rose hover:opacity-80"
                              aria-label={t('autodromeAgreementPage.file')}
                            >
                              <FileText className="size-7" />
                            </a>
                          ) : (
                            '—'
                          )}
                        </TD>
                        <TD>
                          <div className="flex flex-wrap items-center gap-1">
                            {canShow ? (
                              <Button
                                variant="outline"
                                size="icon-sm"
                                aria-label={t('common.view')}
                                onClick={() =>
                                  navigate(autodromeShowAgreementPath(row.id))
                                }
                              >
                                <Eye className="size-3.5" />
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label={t('common.delete')}
                              onClick={() => setConfirm({ kind: 'delete', row })}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label={
                                sid === 2
                                  ? t('autodromeAgreementPage.pause')
                                  : t('autodromeAgreementPage.resume')
                              }
                              onClick={() => setConfirm({ kind: 'pause', row })}
                            >
                              <ArrowLeftRight className="size-3.5" />
                            </Button>
                            {sid === 2 ? (
                              <Button
                                variant="outline"
                                size="icon-sm"
                                aria-label={t('autodromeAgreementPage.cancel')}
                                onClick={() =>
                                  setConfirm({ kind: 'cancel', row })
                                }
                              >
                                <X className="size-3.5" />
                              </Button>
                            ) : null}
                          </div>
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </div>
        )}
      </PageMain>
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={
          confirm?.kind === 'delete'
            ? t('common.delete')
            : confirm?.kind === 'cancel'
              ? t('autodromeAgreementPage.cancel')
              : statusId(confirm?.row ?? ({} as AutodromeAgreementRow)) === 2
                ? t('autodromeAgreementPage.pause')
                : t('autodromeAgreementPage.resume')
        }
        description={
          confirm?.kind === 'delete'
            ? t('autodromeAgreementPage.deleteConfirm')
            : confirm?.kind === 'cancel'
              ? t('autodromeAgreementPage.cancelConfirm')
              : statusId(confirm?.row ?? ({} as AutodromeAgreementRow)) === 2
                ? t('autodromeAgreementPage.pauseConfirm')
                : t('autodromeAgreementPage.resumeConfirm')
        }
        loading={confirmBusy}
        confirmLabel={
          confirm?.kind === 'delete'
            ? t('common.delete')
            : confirm?.kind === 'cancel'
              ? t('autodromeAgreementPage.cancel')
              : statusId(confirm?.row ?? ({} as AutodromeAgreementRow)) === 2
                ? t('autodromeAgreementPage.pause')
                : t('autodromeAgreementPage.resume')
        }
        onConfirm={onConfirmed}
      />
    </>
  )
}
