import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import {
  Badge,
  Button,
  Checkbox,
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
import type { SendMode } from '@/api'
import { useGroupsQuery } from '@/features/groups'
import {
  formatPhone1,
  notificationErrorMessage,
  useMessageTemplatesQuery,
  useNotificationStudentsQuery,
  useSendScheduledMessageMutation,
} from '@/features/notifications-service'
import { formatNumber, fullNameOf } from '@/lib/format'
import type { GroupEduStatusTab } from '@/types/groups'

const EMPTY_ITEMS: never[] = []

type Props = {
  mode: SendMode
}

function eduStatusFor(mode: SendMode): GroupEduStatusTab {
  if (mode === 'activeDebtors') return '1'
  if (mode === 'endedDebtors') return '2'
  return 'all'
}

export function SendStudentsPanel({ mode }: Props) {
  const { t } = useTranslation()
  const showGroup = mode !== 'birthday'
  const showDebt = mode === 'activeDebtors' || mode === 'endedDebtors'
  const showBirthday = mode === 'birthday'

  const [page, setPage] = useState(1)
  const pageSize = 10
  const [groupId, setGroupId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [selected, setSelected] = useState<number[]>([])

  const groupsQuery = useGroupsQuery({
    page: 1,
    showCount: 200,
    eduStatus: eduStatusFor(mode),
  })
  const templatesQuery = useMessageTemplatesQuery(1, 'all')
  const studentsQuery = useNotificationStudentsQuery({
    mode,
    groupId: groupId ? Number(groupId) : undefined,
    page,
    showCount: pageSize,
  })
  const sendMutation = useSendScheduledMessageMutation()

  const groups = groupsQuery.data?.data ?? EMPTY_ITEMS
  const templates = templatesQuery.data?.data ?? EMPTY_ITEMS
  const studentRows = studentsQuery.data?.data
  const rows = studentRows ?? EMPTY_ITEMS
  const total = studentsQuery.data?.total_items ?? 0
  const totalPages =
    studentsQuery.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  useEffect(() => {
    const firstId = groupsQuery.data?.data?.[0]?.id
    if (!showGroup || groupId || firstId == null) return
    setGroupId(String(firstId))
  }, [groupsQuery.data, groupId, showGroup])

  useEffect(() => {
    setPage(1)
    setSelected((prev) => (prev.length === 0 ? prev : []))
  }, [groupId, mode])

  useEffect(() => {
    setSelected((prev) => (prev.length === 0 ? prev : []))
  }, [page, studentRows])

  const template = templates.find((item) => String(item.id) === templateId)
  const selectableIds = useMemo(
    () =>
      templateId
        ? rows.filter((row) => row.phone1).map((row) => row.id)
        : [],
    [rows, templateId],
  )
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selected.includes(id))

  const send = (ids: number[]) => {
    if (!template || !ids.length) {
      notify.error(t('notificationsPage.selectTemplateAndStudents'))
      return
    }
    sendMutation.mutate(
      {
        students: ids,
        name: template.name || '',
        message_schedule_template_id: template.id,
      },
      {
        onSuccess: (res) => {
          notify.success(res.message || t('notificationsPage.sentOk'))
          setSelected([])
          void studentsQuery.refetch()
        },
        onError: (err) =>
          notify.error(notificationErrorMessage(err, t('common.loadError'))),
      },
    )
  }

  const waiting = showGroup
    ? groupsQuery.isLoading || (!groupId && groupsQuery.isFetching)
    : false

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-end gap-2">
        {showGroup ? (
          <Select
            className="w-56"
            label={t('notificationsPage.toGroup')}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            options={groups.map((item) => ({
              value: String(item.id),
              label: item.name || item.name_uz || String(item.id),
            }))}
            placeholder={t('notificationsPage.pickGroup')}
          />
        ) : null}
        <Select
          className="w-56"
          label={t('notificationsPage.template')}
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          options={templates.map((item) => ({
            value: String(item.id),
            label: item.name || String(item.id),
          }))}
          placeholder={t('notificationsPage.pickTemplate')}
        />
        <Button
          variant="primary"
          size="sm"
          disabled={!templateId || selected.length === 0}
          loading={sendMutation.isPending}
          onClick={() => send(selected)}
        >
          <Send className="size-3.5" aria-hidden />
          {t('notificationsPage.send')}
        </Button>
      </div>

      {(showGroup && groupsQuery.isError) || studentsQuery.isError ? (
        <ErrorMessage />
      ) : waiting || studentsQuery.isLoading ? (
        <ListPageSkeleton rows={8} />
      ) : rows.length === 0 ? (
        <EmptyState description={t('common.empty')} />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH className="w-10" column="select" columnLabel={t('notificationsPage.select')}>
                <Checkbox
                  checked={allSelected}
                  disabled={!selectableIds.length}
                  aria-label={t('notificationsPage.select')}
                  onChange={(checked) => setSelected(checked ? selectableIds : [])}
                />
              </TH>
              <TH>{t('notificationsPage.colFio')}</TH>
              {showDebt ? <TH>{t('directorList.debt')}</TH> : null}
              {showBirthday ? <TH>{t('notificationsPage.colBirthday')}</TH> : null}
              {!showBirthday ? <TH>{t('notificationsPage.colPhone')}</TH> : null}
              <TH>{t('notificationsPage.send')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => {
              const canSend = Boolean(templateId && row.phone1)
              const checked = selected.includes(row.id)
              return (
                <TR key={row.id}>
                  <TD column="select">
                    <Checkbox
                      checked={checked}
                      disabled={!canSend}
                      onChange={(next) =>
                        setSelected((prev) =>
                          next
                            ? [...prev, row.id]
                            : prev.filter((id) => id !== row.id),
                        )
                      }
                    />
                  </TD>
                  <TD>{fullNameOf(row) || '—'}</TD>
                  {showDebt ? (
                    <TD>
                      <Badge tone="rose">
                        {formatNumber(row.debt)} {t('notificationsPage.sum')}
                      </Badge>
                    </TD>
                  ) : null}
                  {showBirthday ? (
                    <TD>
                      <span className="text-amber">{row.birthday || '—'}</span>
                    </TD>
                  ) : null}
                  {!showBirthday ? (
                    <TD>
                      {row.phone1 ? (
                        formatPhone1(row.phone1)
                      ) : (
                        <Badge tone="amber">{t('notificationsPage.noPhone')}</Badge>
                      )}
                    </TD>
                  ) : null}
                  <TD>
                    <Button
                      variant="soft"
                      size="icon-sm"
                      disabled={!canSend || sendMutation.isPending}
                      aria-label={t('notificationsPage.send')}
                      onClick={() => send([row.id])}
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
      />
    </div>
  )
}
