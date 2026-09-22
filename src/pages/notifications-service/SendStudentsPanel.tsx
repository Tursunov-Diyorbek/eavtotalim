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
  studentPhoneOf,
  useMessageTemplatesQuery,
  useNotificationStudentsQuery,
  useSendScheduledMessageMutation,
} from '@/features/notifications-service'
import { formatDate, formatNumber, fullNameOf } from '@/lib/format'
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
  const rowIdsKey = rows.map((row) => row.id).join(',')

  useEffect(() => {
    const firstId = groupsQuery.data?.data?.[0]?.id
    if (!showGroup || groupId || firstId == null) return
    setGroupId(String(firstId))
  }, [groupsQuery.data, groupId, showGroup])

  useEffect(() => {
    setPage(1)
    setSelected([])
  }, [groupId, mode])

  useEffect(() => {
    setSelected([])
  }, [page, rowIdsKey])

  const template = templates.find((item) => String(item.id) === templateId)
  const selectableIds = useMemo(
    () =>
      templateId
        ? rows
            .filter((row) => studentPhoneOf(row))
            .map((row) => Number(row.id))
            .filter((id) => Number.isFinite(id))
        : [],
    [rows, templateId],
  )
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selected.includes(id))

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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        {showGroup ? (
          <Select
            size="sm"
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
          size="sm"
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
          className="ml-auto"
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
        <>
          <Table fill={false} storageKey={`notifications-send-${mode}`}>
            <THead>
              <TR>
                <TH
                  column="select"
                  columnLabel={t('notificationsPage.select')}
                  registerColumn={false}
                  className="w-10 text-center"
                >
                  <Checkbox
                    checked={allSelected}
                    disabled={!selectableIds.length}
                    aria-label={t('notificationsPage.select')}
                    onChange={(checked) =>
                      setSelected(checked ? selectableIds : [])
                    }
                  />
                </TH>
                <TH column="fio">{t('notificationsPage.colFio')}</TH>
                {showDebt ? (
                  <TH column="debt" className="w-36">
                    {t('directorList.debt')}
                  </TH>
                ) : null}
                {showBirthday ? (
                  <TH column="birthday" className="w-36">
                    {t('notificationsPage.colBirthday')}
                  </TH>
                ) : null}
                {!showBirthday ? (
                  <TH column="phone" className="w-44">
                    {t('notificationsPage.colPhone')}
                  </TH>
                ) : null}
                <TH column="send" className="w-16 text-center">
                  {t('notificationsPage.send')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => {
                const phoneRaw = studentPhoneOf(row)
                const canSend = Boolean(templateId && phoneRaw)
                const rowId = Number(row.id)
                const checked = selected.includes(rowId)
                const phoneLabel = formatPhone1(phoneRaw)
                return (
                  <TR key={row.id}>
                    <TD column="select" className="text-center">
                      <Checkbox
                        checked={checked}
                        disabled={!canSend}
                        onChange={(next) =>
                          setSelected((prev) =>
                            next
                              ? [...prev, rowId]
                              : prev.filter((id) => id !== rowId),
                          )
                        }
                      />
                    </TD>
                    <TD column="fio">
                      <span className="font-medium text-deep">
                        {fullNameOf(row) || '—'}
                      </span>
                    </TD>
                    {showDebt ? (
                      <TD column="debt">
                        <Badge tone="rose">
                          {formatNumber(row.debt)} {t('notificationsPage.sum')}
                        </Badge>
                      </TD>
                    ) : null}
                    {showBirthday ? (
                      <TD column="birthday" className="tabular-nums">
                        {formatDate(row.birthday) || '—'}
                      </TD>
                    ) : null}
                    {!showBirthday ? (
                      <TD
                        column="phone"
                        className="whitespace-nowrap tabular-nums"
                      >
                        {phoneLabel ? (
                          phoneLabel
                        ) : (
                          <Badge tone="amber">
                            {t('notificationsPage.noPhone')}
                          </Badge>
                        )}
                      </TD>
                    ) : null}
                    <TD column="send" className="text-center">
                      <Button
                        variant="soft"
                        size="icon-sm"
                        disabled={!canSend || sendMutation.isPending}
                        aria-label={t('notificationsPage.send')}
                        onClick={() => send([rowId])}
                      >
                        <Send className="size-3.5" />
                      </Button>
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
          />
        </>
      )}
    </div>
  )
}
