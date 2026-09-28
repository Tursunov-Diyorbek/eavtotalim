import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Info } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  ListPageSkeleton,
  Modal,
  Notification,
  Pagination,
  Panel,
  SafeImage,
  Select,
  ShowButton,
  Table,
  TableSearch,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { PATH_PREFIX_FILE, studentPath } from '@/config'
import { useCameraPendingBreakdownQuery, useCameraPendingStudentsQuery, useCameraPendingSummaryQuery } from '@/features/camera-attendance'
import { useGroupsQuery } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import { asFio } from '@/lib/apiPage'
import { formatNumber } from '@/lib/format'
import type { CameraPendingStudent } from '@/types/camera-attendance'

const STATUS_SENDING = '1'
const STATUS_SENT = '3'
const STATUS_ERROR = '5'
const STATUS_OLD = '8'

function studentIdOf(row: CameraPendingStudent) {
  return row.student_id ?? row.student?.id ?? null
}

function photoOf(row: CameraPendingStudent) {
  return row.image || row.pending_image || row.student?.image || ''
}

function cameraName(row: CameraPendingStudent) {
  const type = row.face_control_type ?? row.faceControlType
  const name = type?.name?.trim()
  if (name) return name
  const id = Number(type?.id ?? row.face_control_type_id)
  if (id === 2) return 'Bionet'
  if (id === 3) return 'NDT'
  if (id) return `#${id}`
  return '—'
}

function statusMeta(
  row: CameraPendingStudent,
  t: (key: string) => string,
) {
  const named = row.status_name?.trim() || row.status_label?.trim()
  const code = Number(row.status)
  if (code === 1) return { label: t('cameraAttendancePage.sending'), tone: 'signal' as const }
  if (code === 3) return { label: t('cameraAttendancePage.sent'), tone: 'teal' as const }
  if (code === 4 || code === 5) return { label: t('cameraAttendancePage.error'), tone: 'rose' as const }
  if (code === 8) {
    return { label: `${t('cameraAttendancePage.oldRecord')} (#8)`, tone: 'neutral' as const }
  }
  if (named) return { label: named, tone: 'neutral' as const }
  if (Number.isFinite(code) && row.status != null && row.status !== '') {
    return { label: `#${code}`, tone: 'neutral' as const }
  }
  return { label: '—', tone: 'neutral' as const }
}

function statValue(
  primary: number | null | undefined,
  fallback: number | null | undefined,
) {
  if (primary != null) return primary
  if (fallback != null) return fallback
  return 0
}

export function CameraAttendancePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [groupId, setGroupId] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null)

  useEffect(() => {
    setPage(1)
  }, [groupId, status, search, pageSize])

  const groupsQuery = useGroupsQuery({
    page: 1,
    showCount: 2000,
    eduStatus: 'all',
  })
  const summary = useCameraPendingSummaryQuery()
  const breakdown = useCameraPendingBreakdownQuery()
  const searchQuery = search.trim()
  const list = useCameraPendingStudentsQuery({
    page: searchQuery ? 1 : page,
    showCount: searchQuery ? 2000 : pageSize,
    groupId,
    status,
    search,
  })

  const allRows = list.data?.data ?? []
  const needle = searchQuery.toLocaleLowerCase('uz')
  const matched = needle
    ? allRows.filter((row) => asFio(row).toLocaleLowerCase('uz').includes(needle))
    : allRows
  const rows = needle
    ? matched.slice((page - 1) * pageSize, page * pageSize)
    : matched
  const total = needle ? matched.length : (list.data?.total_items ?? 0)
  const totalPages = needle
    ? Math.max(1, Math.ceil(matched.length / pageSize) || 1)
    : (list.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1))
  const summaryStats = summary.data?.stats
  const jami = statValue(summaryStats?.total, summary.data?.total_items)
  const sent = statValue(summaryStats?.sent, breakdown[0]?.data?.total_items)
  const sending = statValue(summaryStats?.sending, breakdown[1]?.data?.total_items)
  const errorCount = statValue(summaryStats?.error, breakdown[2]?.data?.total_items)
  const oldCount = statValue(summaryStats?.old, breakdown[3]?.data?.total_items)
  const refreshing = list.isFetching || summary.isFetching || breakdown.some((q) => q.isFetching)

  const apiGroups = summary.data?.groups?.length
    ? summary.data.groups
    : (list.data?.groups ?? [])
  const groups = groupsQuery.data?.data ?? []
  const groupOptions = apiGroups.length
    ? apiGroups.map((group) => ({ value: group.id, label: group.name }))
    : groups.map((group) => ({
        value: String(group.id),
        label: group.name_uz?.trim() || group.name?.trim() || String(group.id),
      }))
  const apiStatuses = summary.data?.statuses?.length
    ? summary.data.statuses
    : (list.data?.statuses ?? [])
  const statusOptions = [
    { value: '', label: t('cameraAttendancePage.allStatuses') },
    ...(apiStatuses.length
      ? apiStatuses.map((item) => ({
          value: item.id,
          label: item.id === STATUS_OLD ? `${item.name} (#8)` : item.name,
        }))
      : [
          { value: STATUS_SENT, label: t('cameraAttendancePage.sent') },
          { value: STATUS_SENDING, label: t('cameraAttendancePage.sending') },
          { value: STATUS_ERROR, label: t('cameraAttendancePage.error') },
          { value: STATUS_OLD, label: t('cameraAttendancePage.oldRecord') },
        ]),
  ]
  const stats = [
    { key: 'total', label: t('cameraAttendancePage.total'), value: jami, className: 'text-deep' },
    { key: 'sent', label: t('cameraAttendancePage.sent'), value: sent, className: 'text-teal' },
    { key: 'sending', label: t('cameraAttendancePage.sending'), value: sending, className: 'text-signal' },
    { key: 'error', label: t('cameraAttendancePage.error'), value: errorCount, className: 'text-rose' },
    { key: 'old', label: t('cameraAttendancePage.oldRecord'), value: oldCount, className: 'text-deep' },
  ]

  return (
    <>
      <Header
        title={<span className="uppercase">{t('cameraAttendancePage.title')}</span>}
        actions={
          <div className="flex flex-nowrap items-center gap-2">
            <Select
              size="sm"
              className="w-48 shrink-0"
              placeholder={t('cameraAttendancePage.group')}
              searchPlaceholder={t('common.search')}
              clearable
              loading={groupsQuery.isLoading && groupOptions.length === 0}
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              options={groupOptions}
            />
            <Select
              size="sm"
              searchable={false}
              className="w-44 shrink-0"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={t('common.refresh')}
              onClick={() => {
                void list.refetch()
                void summary.refetch()
                for (const query of breakdown) void query.refetch()
              }}
            >
              <RefreshCw className={refreshing ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <Notification tone="warning" className="shrink-0">
          {t('cameraAttendancePage.hint')}
        </Notification>
        <Panel padding="sm" className="shrink-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {stats.map((item) => (
              <div key={item.key} className="min-w-0">
                <p className="text-[12px] text-muted">{item.label}</p>
                <p className={`mt-0.5 text-lg font-semibold tabular-nums ${item.className}`}>
                  {formatNumber(item.value)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
        {list.isError ? (
          <ErrorMessage>
            {list.error instanceof Error ? list.error.message : undefined}
          </ErrorMessage>
        ) : list.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="camera-control-attendance">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="photo" className="w-16">
                  {t('cameraAttendancePage.photo')}
                </TH>
                <TH column="fio">
                  <span className="flex items-center justify-between gap-3">
                    <span>{t('cameraAttendancePage.fio')}</span>
                    <TableSearch
                      className="w-44 font-normal"
                      id="camera-attendance-search"
                      name="camera-attendance-search"
                      label={t('cameraAttendancePage.fio')}
                      placeholder={t('cameraAttendancePage.search')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </span>
                </TH>
                <TH column="camera">{t('cameraAttendancePage.camera')}</TH>
                <TH column="status" className="text-center">
                  {t('cameraAttendancePage.status')}
                </TH>
                <TH column="actions" className="text-center">
                  {t('common.actions')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={6} description={t('common.empty')} />
              ) : (
                rows.map((row, index) => {
                  const id = studentIdOf(row)
                  const statusView = statusMeta(row, t)
                  const src = resolveFileUrl(photoOf(row), PATH_PREFIX_FILE)
                  return (
                    <TR key={String(row.id ?? id ?? `${page}-${index}`)}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="photo">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0"
                          disabled={!src}
                          aria-label={asFio(row)}
                          onClick={() => {
                            if (src) setPreview({ src, name: asFio(row) })
                          }}
                        >
                          <SafeImage
                            src={src}
                            alt={asFio(row)}
                            size="sm"
                            className="size-9 rounded-lg"
                          />
                        </Button>
                      </TD>
                      <TD column="fio">
                        {id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 font-medium !text-signal hover:underline"
                            onClick={() => navigate(studentPath(id))}
                          >
                            {asFio(row)}
                          </Button>
                        ) : (
                          asFio(row)
                        )}
                      </TD>
                      <TD column="camera">{cameraName(row)}</TD>
                      <TD column="status" className="text-center">
                        <span className="inline-flex items-center justify-center gap-1 text-[13px]">
                          <Info className="size-3.5 shrink-0 text-signal" aria-hidden />
                          {statusView.label}
                        </span>
                      </TD>
                      <TD column="actions" className="text-center">
                        {id ? (
                          <ShowButton onClick={() => navigate(studentPath(id))} />
                        ) : (
                          '—'
                        )}
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
          onPageSizeChange={setPageSize}
        />
      </PageMain>
      <Modal
        open={preview != null}
        onClose={() => setPreview(null)}
        title={preview?.name}
        sizeClassName="max-w-lg"
        bodyClassName="p-3 sm:p-4"
      >
        <SafeImage
          src={preview?.src}
          alt={preview?.name}
          size="xl"
          fit="contain"
          className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
        />
      </Modal>
    </>
  )
}
