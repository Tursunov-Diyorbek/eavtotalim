import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, Plus, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  ConfirmDialog,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  Panel,
  SearchInput,
  Table,
  Tabs,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import {
  useAttachedScheduleGroupsQuery,
  useAutodromeWeekDaysQuery,
  useAutodromeWeekMutations,
  useScheduleGroupsQuery,
} from '@/features/autodrome-week-schedule'
import { usePageState } from '@/hooks'
import { formatDate } from '@/lib/format'
import type { ScheduleGroup, ScheduleWeekday, WeekDaySlot } from '@/types/autodrome-week-schedule'

type TabKey = 'all' | 'scheduled' | 'unscheduled' | 'today'
type Slot = 0 | 1 | 2

const DAY_NUMBERS = [1, 2, 3, 4, 5, 6]

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

function todayDayNumber() {
  const day = new Date().getDay()
  return day === 0 ? 7 : day
}

function sortWeekdays(days: ScheduleWeekday[] | null | undefined) {
  return [...(days ?? [])].sort((a, b) => {
    const day = Number(a.day) - Number(b.day)
    if (day !== 0) return day
    return Number(a.part) - Number(b.part)
  })
}

function eduLabel(row: ScheduleGroup) {
  return row.edu_type?.character_name || row.edu_type?.short_name || row.edu_type?.name || '—'
}

function dateSpan(row: ScheduleGroup, lang: string) {
  const start = formatDate(row.edu_starting_date, lang) ?? '—'
  const end = formatDate(row.edu_ending_date, lang) ?? '—'
  if (start === '—' && end === '—') return '—'
  return `${start} – ${end}`
}

function dayCards(list: WeekDaySlot[]) {
  return DAY_NUMBERS.map((day) => {
    const found = list.find((item) => Number(item.day) === day)
    return {
      day,
      total: Number(found?.total_groups ?? 0),
      morning: Number(found?.part1?.count ?? 0),
      afternoon: Number(found?.part2?.count ?? 0),
    }
  })
}

export function AutodromeWeekSchedulePage() {
  const { t, i18n } = useTranslation()
  const week = useAutodromeWeekDaysQuery()
  const mutations = useAutodromeWeekMutations()
  const [tab, setTab] = usePageState<TabKey>('weekTab', 'all')
  const [word, setWord] = usePageState('weekWord', '')
  const [inn, setInn] = usePageState('weekInn', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const filterKey = [tab, word, inn, pageSize].join('|')
  const filterRef = useRef(filterKey)

  const [view, setView] = useState<{ day: number; part: number | null } | null>(null)
  const [add, setAdd] = useState<{ day: number; part: number } | null>(null)
  const [schedule, setSchedule] = useState<ScheduleGroup | null>(null)
  const [detachId, setDetachId] = useState<number | null>(null)

  useEffect(() => {
    if (filterRef.current === filterKey) return
    filterRef.current = filterKey
    setPage(1)
  }, [filterKey])

  const isToday = tab === 'today'
  const listFilters = {
    page,
    showCount: pageSize,
    word,
    organizationInn: inn,
    isWeekdays: tab === 'scheduled' ? 'marked' : tab === 'unscheduled' ? 'unmarked' : undefined,
  }
  const groups = useScheduleGroupsQuery(listFilters, !isToday)
  const today = useAttachedScheduleGroupsQuery(
    { day: todayDayNumber(), page, showCount: pageSize, word, organizationInn: inn },
    isToday,
  )
  const query = isToday ? today : groups
  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const cards = useMemo(() => dayCards(week.data ?? []), [week.data])

  return (
    <>
      <Header
        title={t('autodromeWeekPage.title')}
        actions={
          <Button
            variant="outline"
            size="sm"
            loading={week.isFetching || mutations.attach.isPending || mutations.updateSchedule.isPending}
            onClick={() => mutations.invalidate()}
          >
            <RefreshCw className="size-3.5" aria-hidden />
            {t('common.refresh')}
          </Button>
        }
      />
      <PageMain fill>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {week.isError ? <ErrorMessage /> : null}
          <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-6">
            {cards.map((card) => (
              <DayCard
                key={card.day}
                day={card.day}
                name={t(`autodromeWeekPage.${DAY_KEYS[card.day - 1]}`)}
                total={card.total}
                morning={card.morning}
                afternoon={card.afternoon}
                onView={(part) => setView({ day: card.day, part })}
                onAdd={(part) => setAdd({ day: card.day, part })}
              />
            ))}
          </div>
          <Tabs
            className="shrink-0"
            variant="line"
            aria-label={t('autodromeWeekPage.title')}
            value={tab}
            onChange={setTab}
            items={[
              { value: 'all', label: t('autodromeWeekPage.all') },
              { value: 'scheduled', label: t('autodromeWeekPage.scheduled') },
              { value: 'unscheduled', label: t('autodromeWeekPage.unscheduled') },
              { value: 'today', label: t('autodromeWeekPage.today') },
            ]}
          />
          {query.isLoading && !query.data ? (
            <ListPageSkeleton rows={8} />
          ) : (
            <>
              {query.isError ? <ErrorMessage /> : null}
              <div className="flex min-h-0 flex-1 flex-col">
                <GroupsTable
                  rows={query.isError ? [] : rows}
                  page={page}
                  pageSize={pageSize}
                  lang={i18n.language}
                  word={word}
                  inn={inn}
                  onWord={setWord}
                  onInn={setInn}
                  onSchedule={setSchedule}
                />
              </div>
              <Pagination
                className="shrink-0"
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      </PageMain>

      <GroupsModal
        open={view != null}
        title={viewTitle(view, t)}
        mode="view"
        day={view?.day ?? 0}
        part={view?.part}
        onClose={() => {
          setView(null)
          setDetachId(null)
        }}
        onDetach={setDetachId}
      />
      <GroupsModal
        open={add != null}
        title={addTitle(add, t)}
        mode="add"
        day={add?.day ?? 0}
        part={add?.part}
        loading={mutations.attach.isPending}
        onClose={() => setAdd(null)}
        onAttach={(groupId) => {
          if (!add) return
          mutations.attach.mutate(
            { group_id: groupId, day: add.day, part: add.part },
            { onSuccess: () => setAdd(null) },
          )
        }}
      />
      <ScheduleModal
        group={schedule}
        loading={mutations.updateSchedule.isPending}
        onClose={() => setSchedule(null)}
        onSave={(days) => {
          if (!schedule) return
          mutations.updateSchedule.mutate(
            { group_id: schedule.id, days },
            { onSuccess: () => setSchedule(null) },
          )
        }}
      />
      <ConfirmDialog
        open={detachId != null}
        loading={mutations.detach.isPending}
        onClose={() => setDetachId(null)}
        onConfirm={() => {
          if (detachId == null || !view) return
          mutations.detach.mutate(
            { group_id: detachId, day: view.day },
            { onSuccess: () => setDetachId(null) },
          )
        }}
      />
    </>
  )
}

function viewTitle(
  view: { day: number; part: number | null } | null,
  t: (key: string, opts?: Record<string, string>) => string,
) {
  if (!view) return ''
  const day = t(`autodromeWeekPage.${DAY_KEYS[view.day - 1]}`)
  if (view.part === 1) return t('autodromeWeekPage.viewMorning', { day })
  if (view.part === 2) return t('autodromeWeekPage.viewAfternoon', { day })
  return t('autodromeWeekPage.viewDay', { day })
}

function addTitle(
  add: { day: number; part: number } | null,
  t: (key: string, opts?: Record<string, string>) => string,
) {
  if (!add) return ''
  const day = t(`autodromeWeekPage.${DAY_KEYS[add.day - 1]}`)
  const slot = add.part === 1 ? t('autodromeWeekPage.morning') : t('autodromeWeekPage.afternoon')
  return t('autodromeWeekPage.addTitle', { day, slot })
}

function DayCard({
  name,
  total,
  morning,
  afternoon,
  onView,
  onAdd,
}: {
  day: number
  name: string
  total: number
  morning: number
  afternoon: number
  onView: (part: number | null) => void
  onAdd: (part: number) => void
}) {
  const { t } = useTranslation()
  return (
    <Panel className="flex flex-col gap-2 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-deep">{name}</p>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-signal-soft text-[11px] font-semibold text-signal">
          {total}
        </span>
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={() => onView(null)}>
        <Eye className="size-3.5" aria-hidden />
        {t('autodromeWeekPage.viewGroups')}
      </Button>
      <SlotRow
        title={t('autodromeWeekPage.morning')}
        count={morning}
        onView={() => onView(1)}
        onAdd={() => onAdd(1)}
      />
      <SlotRow
        title={t('autodromeWeekPage.afternoon')}
        count={afternoon}
        onView={() => onView(2)}
        onAdd={() => onAdd(2)}
      />
    </Panel>
  )
}

function SlotRow({
  title,
  count,
  onView,
  onAdd,
}: {
  title: string
  count: number
  onView: () => void
  onAdd: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="rounded-lg border border-mist/70 p-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-deep">{title}</span>
        <span className="text-[12px] font-semibold text-muted">{count}</span>
      </div>
      <div className="flex gap-1">
        {count > 0 ? (
          <Button variant="outline" size="sm" className="min-w-0 flex-1 !px-1.5" onClick={onView}>
            <Eye className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{t('autodromeWeekPage.viewGroups')}</span>
          </Button>
        ) : null}
        <Button variant="soft" size="sm" className="min-w-0 flex-1 !px-1.5" onClick={onAdd}>
          <Plus className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{t('autodromeWeekPage.addGroup')}</span>
        </Button>
      </div>
    </div>
  )
}

function DayChips({ days }: { days: ScheduleWeekday[] }) {
  const { t } = useTranslation()
  const sorted = sortWeekdays(days)
  if (!sorted.length) return <span className="text-muted">—</span>
  return (
    <span className="inline-flex flex-wrap justify-center gap-1">
      {sorted.map((item, index) => {
        const key = DAY_KEYS[Number(item.day) - 1]
        const label = key ? t(`autodromeWeekPage.${key}Short`) : String(item.day)
        const morning = Number(item.part) === 1
        return (
          <span
            key={`${item.day}-${item.part}-${index}`}
            className={
              morning
                ? 'rounded border border-mist bg-white px-1.5 py-0.5 text-[11px] font-medium text-deep'
                : 'rounded bg-deep px-1.5 py-0.5 text-[11px] font-medium text-white'
            }
          >
            {label}
          </span>
        )
      })}
    </span>
  )
}

function GroupsTable({
  rows,
  page,
  pageSize,
  lang,
  word,
  inn,
  onWord,
  onInn,
  onSchedule,
}: {
  rows: ScheduleGroup[]
  page: number
  pageSize: number
  lang: string
  word: string
  inn: string
  onWord: (value: string) => void
  onInn: (value: string) => void
  onSchedule: (row: ScheduleGroup) => void
}) {
  const { t } = useTranslation()
  return (
    <Table storageKey="autodrome-week-groups">
      <THead>
        <HeaderTR>
          <TH column="n" className="w-12 text-center">
            №
          </TH>
          <TH column="group" className="min-w-28">
            {t('autodromeWeekPage.group')}
          </TH>
          <TH column="org" className="min-w-64">
            {t('autodromeWeekPage.org')}
          </TH>
          <TH column="days" className="min-w-36 text-center">
            {t('autodromeWeekPage.days')}
          </TH>
          <TH column="edu" className="w-20 text-center">
            {t('autodromeWeekPage.edu')}
          </TH>
          <TH column="dates" className="min-w-40 text-center">
            {t('autodromeWeekPage.dates')}
          </TH>
          <TH column="action" className="min-w-36 text-center">
            {t('common.actions')}
          </TH>
        </HeaderTR>
        <FilterTR>
          <FilterTH column="n" />
          <FilterTH column="group">
            <SearchInput
              size="sm"
              id="week-group"
              name="week-group"
              label={t('autodromeWeekPage.group')}
              placeholder={t('common.search')}
              value={word}
              onChange={(e) => onWord(e.target.value)}
            />
          </FilterTH>
          <FilterTH column="org">
            <OrganizationSelect
              size="sm"
              className="w-full min-w-56"
              id="week-org"
              name="week-org"
              value={inn}
              onChange={(e) => onInn(e.target.value)}
            />
          </FilterTH>
          <FilterTH column="days" />
          <FilterTH column="edu" />
          <FilterTH column="dates" />
          <FilterTH column="action" />
        </FilterTR>
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <EmptyTR colSpan={7} description={t('autodromeWeekPage.empty')} />
        ) : (
          rows.map((row, index) => (
            <TR key={row.id}>
              <TD column="n" className="text-center text-muted">
                {(page - 1) * pageSize + index + 1}
              </TD>
              <TD column="group" className="font-medium">
                {row.name || '—'}
              </TD>
              <TD column="org" className="min-w-64">
                <OrganizationLabel
                  stacked
                  name={row.organization?.name}
                  inn={row.organization?.inn}
                />
              </TD>
              <TD column="days" className="text-center">
                <DayChips days={row.autodrome_weekdays ?? []} />
              </TD>
              <TD column="edu" className="text-center font-medium">
                {eduLabel(row)}
              </TD>
              <TD column="dates" className="text-center text-[13px]">
                {dateSpan(row, lang)}
              </TD>
              <TD column="action" className="text-center">
                <Button variant="link" size="inline" onClick={() => onSchedule(row)}>
                  {t('autodromeWeekPage.setDays')}
                </Button>
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  )
}

function GroupsModal({
  open,
  title,
  mode,
  day,
  part,
  loading,
  onClose,
  onAttach,
  onDetach,
}: {
  open: boolean
  title: string
  mode: 'view' | 'add'
  day: number
  part?: number | null
  loading?: boolean
  onClose: () => void
  onAttach?: (groupId: number) => void
  onDetach?: (groupId: number) => void
}) {
  const { t, i18n } = useTranslation()
  const [word, setWord] = useState('')
  const [inn, setInn] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    if (!open) return
    setWord('')
    setInn('')
    setPage(1)
  }, [open, day, part, mode])

  const attached = useAttachedScheduleGroupsQuery(
    { day, part, page, showCount: pageSize, word, organizationInn: inn },
    open && mode === 'view',
  )
  const available = useScheduleGroupsQuery(
    { page, showCount: pageSize, word, organizationInn: inn, notInDay: day },
    open && mode === 'add',
  )
  const query = mode === 'view' ? attached : available
  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? 1

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      sizeClassName="max-w-4xl"
      bodyClassName="flex min-h-0 flex-col gap-3 overflow-hidden px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="flex shrink-0 flex-wrap items-end gap-2">
        <SearchInput
          size="sm"
          className="min-w-44 flex-1"
          id={`week-modal-word-${mode}`}
          name={`week-modal-word-${mode}`}
          label={t('autodromeWeekPage.group')}
          placeholder={t('common.search')}
          value={word}
          onChange={(e) => {
            setWord(e.target.value)
            setPage(1)
          }}
        />
        <OrganizationSelect
          size="sm"
          className="min-w-56 flex-1"
          id={`week-modal-org-${mode}`}
          name={`week-modal-org-${mode}`}
          value={inn}
          onChange={(e) => {
            setInn(e.target.value)
            setPage(1)
          }}
        />
      </div>
      <div className="min-h-0 max-h-[min(48svh,420px)] overflow-x-hidden overflow-y-auto">
        <Table
          storageKey={`autodrome-week-${mode}`}
          fill={false}
          className="table-fixed !min-w-0"
        >
          <THead>
            <HeaderTR>
              <TH column="group" className="w-[18%]">
                {t('autodromeWeekPage.group')}
              </TH>
              <TH column="org" className="w-[32%]">
                {t('autodromeWeekPage.org')}
              </TH>
              <TH column="edu" className="w-[10%]">
                {t('autodromeWeekPage.edu')}
              </TH>
              <TH column="dates" className="w-[18%]">
                {t('autodromeWeekPage.dates')}
              </TH>
              <TH column="action" className="w-[22%] text-center">
                {t('common.actions')}
              </TH>
            </HeaderTR>
          </THead>
          <TBody>
            {query.isLoading && !query.data ? (
              <EmptyTR colSpan={5} description={t('common.loading')} />
            ) : rows.length === 0 ? (
              <EmptyTR colSpan={5} description={t('autodromeWeekPage.empty')} />
            ) : (
              rows.map((row) => (
                <TR key={row.id}>
                  <TD column="group" className="max-w-0">
                    <span className="block truncate" title={row.name || undefined}>
                      {row.name || '—'}
                    </span>
                  </TD>
                  <TD column="org" className="max-w-0">
                    <OrganizationLabel
                      stacked
                      name={row.organization?.name}
                      inn={row.organization?.inn}
                    />
                  </TD>
                  <TD column="edu" className="whitespace-normal">
                    {eduLabel(row)}
                  </TD>
                  <TD column="dates" className="whitespace-normal text-center leading-tight">
                    {dateSpan(row, i18n.language)}
                  </TD>
                  <TD column="action" className="overflow-hidden text-center">
                    {mode === 'add' ? (
                      <Button
                        variant="soft"
                        size="sm"
                        className="!px-2.5"
                        loading={loading}
                        onClick={() => onAttach?.(row.id)}
                      >
                        {t('autodromeWeekPage.addGroup')}
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        className="!px-2.5"
                        onClick={() => onDetach?.(row.id)}
                      >
                        {t('autodromeWeekPage.detach')}
                      </Button>
                    )}
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
      <Pagination
        className="shrink-0"
        persist={false}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Modal>
  )
}

function ScheduleModal({
  group,
  loading,
  onClose,
  onSave,
}: {
  group: ScheduleGroup | null
  loading: boolean
  onClose: () => void
  onSave: (days: { day: number; part: number }[]) => void
}) {
  const { t } = useTranslation()
  const [slots, setSlots] = useState<Record<number, Slot>>({})

  useEffect(() => {
    if (!group) return
    const next: Record<number, Slot> = {}
    for (const item of group.autodrome_weekdays ?? []) {
      const day = Number(item.day)
      const part = Number(item.part)
      if (day >= 1 && day <= 6 && (part === 1 || part === 2)) next[day] = part
    }
    setSlots(next)
  }, [group])

  const toggle = (day: number, part: Slot) => {
    setSlots((prev) => ({ ...prev, [day]: prev[day] === part ? 0 : part }))
  }

  return (
    <Modal
      open={group != null}
      onClose={onClose}
      title={t('autodromeWeekPage.scheduleTitle', { name: group?.name || '' })}
      sizeClassName="max-w-3xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSlots({})}>
            {t('common.clear')}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            size="sm"
            loading={loading}
            onClick={() =>
              onSave(
                DAY_NUMBERS.flatMap((day) =>
                  slots[day] === 1 || slots[day] === 2 ? [{ day, part: slots[day] }] : [],
                ),
              )
            }
          >
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {DAY_NUMBERS.map((day) => (
          <div key={day} className="rounded-lg border border-mist/80 bg-fog/40 p-3">
            <p className="mb-2 text-sm font-medium text-deep">
              {t(`autodromeWeekPage.${DAY_KEYS[day - 1]}`)}
            </p>
            <div className="flex flex-col gap-1.5">
              <SlotChoice
                active={slots[day] === 1}
                label={t('autodromeWeekPage.morning')}
                morning
                onClick={() => toggle(day, 1)}
              />
              <SlotChoice
                active={slots[day] === 2}
                label={t('autodromeWeekPage.afternoon')}
                onClick={() => toggle(day, 2)}
              />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

function SlotChoice({
  active,
  label,
  morning,
  onClick,
}: {
  active: boolean
  label: string
  morning?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? morning
            ? 'flex h-9 items-center justify-between rounded-lg border border-mist bg-white px-3 text-sm font-medium text-deep'
            : 'flex h-9 items-center justify-between rounded-lg bg-deep px-3 text-sm font-medium text-white'
          : 'flex h-9 items-center justify-between rounded-lg border border-mist/70 bg-fog px-3 text-sm text-muted'
      }
    >
      {label}
    </button>
  )
}
