import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  Panel,
  SafeImage,
  SearchInput,
  Select,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { PATH_PREFIX_FILE, studentPath } from '@/config'
import { useGroupIncomingStudentsQuery } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'

const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const

function formatDay(date: string) {
  return date.split('-').reverse().join('.')
}

/** Eski `GroupTables/IncomingStudents` — kamera davomati bo‘yicha kelgan o‘quvchilar. */
export function GroupIncomingStudentsTab({ groupId }: { groupId: string }) {
  const { t } = useTranslation()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const [search, setSearch] = useState('')

  const query = useGroupIncomingStudentsQuery(groupId, year, month, search)

  const monthOptions = useMemo(
    () =>
      MONTH_KEYS.map((key, index) => ({
        value: index + 1,
        label: t(`lessonSchedule.${key}`),
      })),
    [t],
  )

  const dates = query.data?.dates ?? []
  const students = query.data?.students ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <SearchInput
          placeholder={t('groupsPage.showPage.searchStudent')}
          defaultValue={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-56"
        />
        <Select
          options={monthOptions}
          value={month}
          onChange={(event) => setMonth(Number(event.target.value))}
          triggerClassName="w-36"
        />
      </div>

      {query.isLoading ? (
        <Panel padding="md">
          <SkeletonLines lines={8} />
        </Panel>
      ) : query.isError ? (
        <ErrorMessage />
      ) : (
        <Table storageKey="group-show:incoming" className="min-w-250">
          <THead>
            <TR>
              <TH className="w-12 text-center">№</TH>
              <TH className="min-w-56">{t('directorList.fio')}</TH>
              {dates.map((date) => (
                <TH key={date} column={date} className="w-28 text-center">
                  {formatDay(date)}
                </TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {students.length === 0 ? (
              <TR>
                <TD className="py-6 text-center" colSpan={dates.length + 2}>
                  <EmptyState
                    className="border-0 py-4 shadow-none"
                    description={t('common.empty')}
                  />
                </TD>
              </TR>
            ) : (
              students.map((student, index) => (
                <TR key={student.id}>
                  <TD className="text-center text-muted">{index + 1}</TD>
                  <TD>
                    <Link
                      to={studentPath(student.id)}
                      className="font-semibold text-signal hover:underline"
                    >
                      {student.full_name || '—'}
                    </Link>
                  </TD>
                  {dates.map((date) => {
                    const items = student.attendances?.[date] ?? []
                    return (
                      <TD key={date} column={date} className="text-center">
                        {items.length === 0 ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <div className="max-h-24 space-y-1 overflow-y-auto">
                            {items.map((item, i) => {
                              const image = resolveFileUrl(
                                item.current_image,
                                PATH_PREFIX_FILE,
                              )
                              const entered = item.type === 'entry'
                              return (
                                <div key={i} className="flex items-center gap-1.5">
                                  <SafeImage
                                    src={image}
                                    size="sm"
                                    className="size-8 shrink-0 rounded-full ring-1 ring-mist/70"
                                  />
                                  <Badge tone={entered ? 'teal' : 'rose'}>
                                    {item.attendance_time}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </TD>
                    )
                  })}
                </TR>
              ))
            )}
          </TBody>
        </Table>
      )}
    </div>
  )
}
