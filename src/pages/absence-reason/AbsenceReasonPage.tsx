import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  RotateCcw,
  Undo2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  RegionDistrict,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
  type BadgeTone,
} from '@/components/ui'
import { PATH_PREFIX_FILE, studentPath } from '@/config'
import {
  useAbsenceReasonIndexQuery,
  useRollbackAbsenceReasonMutation,
} from '@/features/absence-reason'
import { useGroupsQuery } from '@/features/groups'
import { useOpenedOnce, usePageState } from '@/hooks'
import { resolveFileUrl } from '@/features/lessons'
import { asFio, asLangName } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import type { AbsenceReasonStatus } from '@/types/absence-reason'
import { AbsenceReasonCreateModal } from './AbsenceReasonCreateModal'

function statusMeta(
  status: AbsenceReasonStatus | null | undefined,
  t: (key: string) => string,
): { label: string; tone: BadgeTone; Icon: LucideIcon } {
  if (status === 'approved') {
    return {
      label: t('absenceReasonPage.statusApproved'),
      tone: 'teal',
      Icon: CheckCircle2,
    }
  }
  if (status === 'pending') {
    return {
      label: t('absenceReasonPage.statusPending'),
      tone: 'signal',
      Icon: RefreshCw,
    }
  }
  if (status === 'pending_rollback') {
    return {
      label: t('absenceReasonPage.statusPendingRollback'),
      tone: 'signal',
      Icon: Clock,
    }
  }
  if (status === 'rolled_back') {
    return {
      label: t('absenceReasonPage.statusRolledBack'),
      tone: 'amber',
      Icon: Undo2,
    }
  }
  return {
    label: t('absenceReasonPage.statusRejected'),
    tone: 'rose',
    Icon: XCircle,
  }
}

export function AbsenceReasonPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [groupId, setGroupId] = usePageState('groupId', '')
  const [createOpen, setCreateOpen] = useState(false)
  const [rollbackId, setRollbackId] = useState<number | null>(null)

  useEffect(() => {
    setPage(1)
  }, [groupId, pageSize])

  const [groupsEnabled, openGroups] = useOpenedOnce(Boolean(groupId))
  const groupsQuery = useGroupsQuery(
    {
      page: 1,
      showCount: 3000,
      eduStatus: 'all',
    },
    groupsEnabled,
  )
  const { data, isLoading, isError } = useAbsenceReasonIndexQuery({
    page,
    showCount: pageSize,
    groupId,
  })
  const rollbackMutation = useRollbackAbsenceReasonMutation()
  const groups = groupsQuery.data?.data ?? []
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const confirmRollback = () => {
    if (rollbackId == null) return
    rollbackMutation.mutate(rollbackId, {
      onSuccess: () => {
        notify.success(t('absenceReasonPage.rollbackOk'))
        setRollbackId(null)
      },
      onError: (err) =>
        notify.error(err.message || t('absenceReasonPage.rollbackError')),
    })
  }

  return (
    <>
      <Header
        title={t('nav.absenceReasonIndex')}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium whitespace-nowrap text-muted">
              {t('directorList.group')}:
            </span>
            <Select
              size="sm"
              value={groupId}
              className="w-44"
              onOpen={openGroups}
              loading={groupsQuery.isFetching && groups.length === 0}
              onChange={(e) => setGroupId(e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...groups.map((group) => ({
                  value: String(group.id),
                  label: group.name || group.name_uz || String(group.id),
                })),
              ]}
            />
            <Button
              variant="primary"
              size="sm"
              className="h-9"
              onClick={() => setCreateOpen(true)}
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
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="absence-reason-index">
            <THead>
              <TR>
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="region">{t('common.regionDistrict')}</TH>
                <TH column="group">{t('directorList.group')}</TH>
                <TH column="fio">{t('statsPage.fish')}</TH>
                <TH column="reason">{t('absenceReasonPage.reasonText')}</TH>
                <TH column="file" className="w-28">
                  {t('absenceReasonPage.baseFile')}
                </TH>
                <TH column="dates" className="w-48 text-center">
                  {t('missedClasses.fromDate')} / {t('missedClasses.toDate')}
                </TH>
                <TH column="status" className="w-40">
                  {t('directorList.status')}
                </TH>
                <TH column="actions" className="w-36">
                  {t('common.actions')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={9}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const st = statusMeta(row.status, t)
                  const Icon = st.Icon
                  const docUrl = resolveFileUrl(row.document_url, PATH_PREFIX_FILE)
                  return (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="region">
                        <RegionDistrict
                          region={row.organization?.region?.name}
                          district={row.organization?.area?.name}
                        />
                      </TD>
                      <TD column="group">{asLangName(row.group, i18n.language)}</TD>
                      <TD column="fio">
                        {row.student?.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                            onClick={() => navigate(studentPath(row.student!.id!))}
                          >
                            {asFio(row.student)}
                          </Button>
                        ) : (
                          asFio(row.student)
                        )}
                      </TD>
                      <TD column="reason">{row.reason || '—'}</TD>
                      <TD column="file">
                        {docUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                            onClick={() =>
                              window.open(docUrl, '_blank', 'noopener,noreferrer')
                            }
                          >
                            {t('common.view')}
                          </Button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </TD>
                      <TD column="dates" className="text-center">
                        <span className="inline-flex flex-wrap items-center justify-center gap-1">
                          <Badge tone="teal">
                            {formatDate(row.from_date, i18n.language) ?? '—'}
                          </Badge>
                          <Badge tone="rose">
                            {formatDate(row.to_date, i18n.language) ?? '—'}
                          </Badge>
                        </span>
                      </TD>
                      <TD column="status">
                        <Badge tone={st.tone}>
                          <Icon
                            className={
                              row.status === 'pending'
                                ? 'size-3.5 animate-spin'
                                : 'size-3.5'
                            }
                            aria-hidden
                          />
                          {st.label}
                        </Badge>
                      </TD>
                      <TD column="actions">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setRollbackId(row.id)}
                        >
                          <RotateCcw className="size-3.5" aria-hidden />
                          {t('absenceReasonPage.rollback')}
                        </Button>
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
      <AbsenceReasonCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <ConfirmDialog
        open={rollbackId != null}
        onClose={() => setRollbackId(null)}
        onConfirm={confirmRollback}
        title={t('absenceReasonPage.rollback')}
        confirmLabel={t('absenceReasonPage.rollback')}
        loading={rollbackMutation.isPending}
      />
    </>
  )
}
