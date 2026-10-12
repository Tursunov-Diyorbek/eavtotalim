import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, FileSpreadsheet, GraduationCap, Users } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  DateInput,
  EmptyState,
  ErrorMessage,
  Notification,
  Panel,
  Skeleton,
  SkeletonCard,
  Tabs,
} from '@/components/ui'
import {
  useRegionDailyReportQuery,
  useSuperiorOrganizationsQuery,
} from '@/features/republic-dashboard'
import { isoToDisplayDate, printElement } from '@/lib'
import type { RegionDailyRow } from '@/types/republic-dashboard'
import { UzbekistanMap } from './UzbekistanMap'

type Tab = 'map' | 'types'

function yesterdayIso() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function formatCount(value: number) {
  return value.toLocaleString('en-US')
}

function sum(rows: RegionDailyRow[], key: keyof RegionDailyRow) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0)
}

function regionTitle(row: RegionDailyRow, lang: string) {
  const names = row.region.lang
  if (lang === 'ru') return names?.ru || row.region.name || '—'
  if (lang === 'kiril') return names?.kiril || row.region.name || '—'
  return names?.uz || row.region.name || '—'
}

function esc(value: string) {
  return value.replace(/[&<>]/g, (char) =>
    char === '&' ? '&amp;' : char === '<' ? '&lt;' : '&gt;',
  )
}

function downloadXls(filename: string, html: string) {
  const blob = new Blob([`\uFEFF${html}`], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: string
}) {
  return (
    <div className="flex items-baseline gap-2 text-[12px] leading-tight">
      <span className={tone}>{label}</span>
      <span className="min-w-4 flex-1 border-b border-dotted border-mist" />
      <span className="font-semibold tabular-nums text-ink">{value}</span>
    </div>
  )
}

function StatCard({
  icon,
  tone,
  value,
  title,
  children,
}: {
  icon: ReactNode
  tone: string
  value: string
  title: string
  children: ReactNode
}) {
  return (
    <Panel padding="sm" className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-lg leading-none font-semibold tabular-nums text-deep">
            {value}
          </div>
          <div className="mt-1 truncate text-[12px] text-muted">{title}</div>
        </div>
        <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${tone}`}>
          {icon}
        </span>
      </div>
      <div className="space-y-1">{children}</div>
    </Panel>
  )
}

function templateOne(rows: RegionDailyRow[], dateLabel: string) {
  const body = rows
    .map(
      (row, index) => `<tr>
        <td>${index + 1}</td>
        <td>${esc(row.region.name || '')}</td>
        <td>${row.active_organizations_count}</td>
        <td>${row.all_organizations_count}</td>
        <td>${row.today_has_lesson_groups_count}</td>
        <td>${row.active_groups_count}</td>
        <td>${row.today_has_lesson_students_count}</td>
        <td>${row.active_students_count}</td>
        <td>${row.absent_students_count}</td>
        <td>${row.absent_percent == null ? '' : `${row.absent_percent.toFixed(2)} %`}</td>
      </tr>`,
    )
    .join('')
  return `<table border="1"><tr><th colspan="10">${esc(dateLabel)} yil holatida</th></tr>
    <tr><th rowspan="2">№</th><th rowspan="2">Viloyatlar</th><th colspan="2">Maktablar soni</th><th colspan="2">Guruhlar tahlili</th><th colspan="2">O'quvchi soni</th><th rowspan="2">Darsga qatnashmaganlar</th><th rowspan="2">Foiz (%)</th></tr>
    <tr><th>Faol maktablar</th><th>Jami maktablar</th><th>Bugun darsi bor guruhlar</th><th>Jami faol guruhlar</th><th>Bugun darsi bor o'quvchilar</th><th>Jami o'quvchilar</th></tr>
    ${body}</table>`
}

function templateTwoRows(rows: RegionDailyRow[]) {
  const withPercent = rows.filter((row) => row.absent_percent != null)
  const average = withPercent.length
    ? withPercent.reduce((total, row) => total + (row.absent_percent || 0), 0) / withPercent.length
    : null
  return { average }
}

export function RepublicGaiDashboard() {
  const { t, i18n } = useTranslation()
  const yesterday = useMemo(yesterdayIso, [])
  const [date, setDate] = useState(yesterday)
  const [tab, setTab] = useState<Tab>('map')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoverId, setHoverId] = useState<number | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const report = useRegionDailyReportQuery(date)
  const types = useSuperiorOrganizationsQuery(tab === 'types')
  const rows = report.data ?? []
  const focusId = hoverId ?? selectedId
  const focus = rows.find((row) => row.region.id === focusId) ?? null
  const dateLabel = isoToDisplayDate(date)
  const { average } = templateTwoRows(rows)

  const schools = sum(rows, 'all_organizations_count')
  const activeSchools = sum(rows, 'active_organizations_count')
  const groups = sum(rows, 'active_groups_count')
  const groupsToday = sum(rows, 'today_has_lesson_groups_count')
  const students = sum(rows, 'active_students_count')
  const studentsToday = sum(rows, 'today_has_lesson_students_count')
  const absent = sum(rows, 'absent_students_count')

  function exportOne() {
    downloadXls(
      "Viloyatlar bo'yicha kunlik davomat (shablon 1).xls",
      templateOne(rows, dateLabel),
    )
  }

  function exportTwo() {
    const body = rows
      .map(
        (row, index) => `<tr>
          <td>${index + 1}</td>
          <td style="text-align:left">${esc(row.region.lang?.kiril || row.region.name || '')}</td>
          <td>${row.active_organizations_count}</td>
          <td>${row.active_groups_count}</td>
          <td>${row.active_students_count}</td>
          <td>${row.today_has_lesson_groups_count}</td>
          <td>${row.today_has_lesson_students_count}</td>
          <td>${row.absent_students_count}</td>
          <td>${row.absent_percent == null ? '' : `${row.absent_percent.toFixed(2)} %`}</td>
        </tr>`,
      )
      .join('')
    const total = `<tr style="background:#ffffcc"><td colspan="2">Ж А М И</td>
      <td>${activeSchools}</td><td>${groups}</td><td>${students}</td>
      <td>${groupsToday}</td><td>${studentsToday}</td><td>${absent}</td>
      <td>${average == null ? '' : `${average.toFixed(2)} %`}</td></tr>`
    downloadXls(
      "Viloyatlar bo'yicha kunlik davomat (shablon 2).xls",
      `<table border="1">${body}${total}</table>`,
    )
  }

  return (
    <>
      <Header
        title={t('republicDash.title')}
        actions={
          <DateInput
            size="sm"
            value={date}
            max={yesterday}
            onChange={(event) => {
              const next = event.target.value
              if (next && next <= yesterday) setDate(next)
            }}
          />
        }
      />
      <PageMain scroll={false}>
        <Notification tone="warning" className="shrink-0 py-2">
          <span className="text-[12px] leading-snug">
            {t('republicDash.asOf')}. {t('republicDash.onlyPast')}{' '}
            <span className="font-semibold">{dateLabel}</span>
          </span>
        </Notification>

        {report.isLoading ? (
          <div className="grid shrink-0 gap-2 md:grid-cols-3">
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
          </div>
        ) : report.isError ? (
          <ErrorMessage />
        ) : (
          <div className="grid shrink-0 gap-2 md:grid-cols-3">
            <StatCard
              icon={<Building2 className="size-4" />}
              tone="bg-signal-soft text-signal"
              value={formatCount(schools)}
              title={t('republicDash.allSchools')}
            >
              <Metric
                label={t('republicDash.activeSchools')}
                value={formatCount(activeSchools)}
                tone="text-teal"
              />
              <Metric
                label={t('republicDash.inactiveSchools')}
                value={formatCount(schools - activeSchools)}
                tone="text-muted"
              />
            </StatCard>
            <StatCard
              icon={<Users className="size-4" />}
              tone="bg-teal-soft text-teal"
              value={formatCount(groups)}
              title={t('republicDash.activeGroups')}
            >
              <Metric
                label={t('republicDash.groupsActive')}
                value={formatCount(groups)}
                tone="text-teal"
              />
              <Metric
                label={t('republicDash.groupsToday')}
                value={formatCount(groupsToday)}
                tone="text-signal"
              />
            </StatCard>
            <StatCard
              icon={<GraduationCap className="size-4" />}
              tone="bg-indigo-soft text-indigo"
              value={formatCount(students)}
              title={t('republicDash.students')}
            >
              <Metric
                label={t('republicDash.studentsActive')}
                value={formatCount(activeSchools)}
                tone="text-teal"
              />
              <Metric
                label={t('republicDash.studentsInactive')}
                value={formatCount(schools - activeSchools)}
                tone="text-muted"
              />
            </StatCard>
          </div>
        )}

        <Tabs
          className="shrink-0"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'map', label: t('republicDash.mapTab') },
            { value: 'types', label: t('republicDash.typesTab') },
          ]}
        />

        {tab === 'map' ? (
          report.isLoading ? (
            <Skeleton className="min-h-0 w-full flex-1 rounded-xl" />
          ) : report.isError ? null : (
            <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] items-stretch gap-2 overflow-hidden lg:grid-cols-[minmax(0,1fr)_17.5rem]">
              <Panel className="h-full min-h-0">
                <UzbekistanMap
                  rows={rows}
                  selectedId={selectedId}
                  hoverId={hoverId}
                  onHover={setHoverId}
                  onSelect={(id) => setSelectedId((current) => (current === id ? null : id))}
                />
              </Panel>
              <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
                <Panel padding="sm" className="min-h-0 flex-1 overflow-hidden">
                  {focus ? (
                    <div className="space-y-2">
                      <div className="truncate font-display text-sm font-semibold text-deep">
                        {regionTitle(focus, i18n.language)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2 text-[12px]">
                          <span className="text-muted">{t('republicDash.allSchools')}</span>
                          <span className="font-semibold tabular-nums text-deep">
                            {formatCount(focus.all_organizations_count)}
                          </span>
                        </div>
                        <Metric
                          label={t('republicDash.activeSchools')}
                          value={formatCount(focus.active_organizations_count)}
                          tone="text-teal"
                        />
                        <Metric
                          label={t('republicDash.inactiveSchools')}
                          value={formatCount(
                            focus.all_organizations_count - focus.active_organizations_count,
                          )}
                          tone="text-muted"
                        />
                      </div>
                      <div className="space-y-1 border-t border-mist/80 pt-2">
                        <div className="flex items-baseline justify-between gap-2 text-[12px]">
                          <span className="text-muted">{t('republicDash.activeGroups')}</span>
                          <span className="font-semibold tabular-nums text-deep">
                            {formatCount(focus.active_groups_count)}
                          </span>
                        </div>
                        <Metric
                          label={t('republicDash.groupsActive')}
                          value={formatCount(focus.active_groups_count)}
                          tone="text-teal"
                        />
                        <Metric
                          label={t('republicDash.groupsToday')}
                          value={formatCount(focus.today_has_lesson_groups_count)}
                          tone="text-signal"
                        />
                      </div>
                      <div className="space-y-1 border-t border-mist/80 pt-2">
                        <div className="flex items-baseline justify-between gap-2 text-[12px]">
                          <span className="text-muted">{t('republicDash.students')}</span>
                          <span className="font-semibold tabular-nums text-deep">
                            {formatCount(focus.active_students_count)}
                          </span>
                        </div>
                        <Metric
                          label={t('republicDash.studentsActive')}
                          value={formatCount(focus.active_organizations_count)}
                          tone="text-teal"
                        />
                        <Metric
                          label={t('republicDash.studentsInactive')}
                          value={formatCount(
                            focus.all_organizations_count - focus.active_organizations_count,
                          )}
                          tone="text-muted"
                        />
                      </div>
                    </div>
                  ) : (
                    <EmptyState compact title={t('republicDash.pickRegion')} />
                  )}
                </Panel>
                <Panel padding="sm" className="shrink-0 space-y-1.5">
                  <div className="text-[12px] font-medium leading-tight text-deep">
                    {t('republicDash.download')}
                  </div>
                  {rows.length ? (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="soft" size="sm" onClick={exportOne}>
                        <FileSpreadsheet className="size-3.5" />
                        {t('republicDash.xls1')}
                      </Button>
                      <Button variant="soft" size="sm" onClick={exportTwo}>
                        <FileSpreadsheet className="size-3.5" />
                        {t('republicDash.xls2')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          printElement(printRef.current, undefined, {
                            extraCss:
                              '.hidden{display:block !important}table{width:100%;border-collapse:collapse;font-family:Times New Roman,serif;font-size:11px}th,td{border:1px solid #222;padding:3px 4px;text-align:center}th{background:#ddebf7}.total td{background:#ffffcc;font-weight:700}',
                          })
                        }
                      >
                        {t('republicDash.pdf2')}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[13px] text-muted">{t('republicDash.preparing')}</p>
                  )}
                </Panel>
              </div>
            </div>
          )
        ) : types.isLoading ? (
          <div className="grid min-h-0 flex-1 content-start gap-2 overflow-hidden md:grid-cols-2">
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </div>
        ) : types.isError ? (
          <ErrorMessage />
        ) : types.data?.length ? (
          <div className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto md:grid-cols-2">
            {types.data.map((org) => {
              const grand = types.data.reduce((total, item) => total + item.total_count, 0)
              const percent = grand ? ((org.total_count / grand) * 100).toFixed(2) : '0.00'
              return (
                <Panel key={org.superior_organization_id} padding="md" className="space-y-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-medium text-deep">{org.name || '—'}</div>
                    <div className="shrink-0 text-[13px] tabular-nums text-muted">
                      {formatCount(org.total_count)} · {percent}%
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg bg-teal-soft px-2.5 py-2 text-[13px] text-teal">
                      {t('republicDash.activity')} {formatCount(org.active)}
                    </div>
                    <div className="rounded-lg bg-amber-soft px-2.5 py-2 text-[13px] text-amber">
                      {t('republicDash.reformed')} {formatCount(org.reformed)}
                    </div>
                    <div className="rounded-lg bg-rose-soft px-2.5 py-2 text-[13px] text-rose">
                      {t('republicDash.suspended')} {formatCount(org.suspended)}
                    </div>
                  </div>
                </Panel>
              )
            })}
          </div>
        ) : (
          <EmptyState compact title={t('republicDash.preparing')} />
        )}

        <div ref={printRef} className="hidden" aria-hidden>
          <table>
            <thead>
              <tr>
                <th colSpan={9}>
                  Ҳайдовчиларни тайёрлаш ва қайта тайёрлаш билан шуғулланувчи ўқув
                  ташкилотларида таълим олаётган ўқувчилар давомати тўғрисида кунлик
                </th>
              </tr>
              <tr>
                <th colSpan={9}>М А Ъ Л У М О Т</th>
              </tr>
              <tr>
                <th colSpan={9} style={{ textAlign: 'right' }}>
                  {dateLabel} йил ҳолатида
                </th>
              </tr>
              <tr>
                <th>Т/Р</th>
                <th>Ҳудудлар</th>
                <th>Фаолият кўрсатаётган автомактаблар сони</th>
                <th>Жами фаол ўқув гуруҳлари сони</th>
                <th>Жами фаол ўқувчилар сони</th>
                <th>Ҳисобот кунида дарси бор гуруҳлар</th>
                <th>Ҳисобот кунида дарси бор ўқувчилар</th>
                <th>Дарсга қатнашмаган ўқувчилар</th>
                <th>Фоизи</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.region.id}>
                  <td>{index + 1}</td>
                  <td style={{ textAlign: 'left' }}>
                    {row.region.lang?.kiril || row.region.name}
                  </td>
                  <td>{row.active_organizations_count}</td>
                  <td>{row.active_groups_count}</td>
                  <td>{row.active_students_count}</td>
                  <td>{row.today_has_lesson_groups_count}</td>
                  <td>{row.today_has_lesson_students_count}</td>
                  <td>{row.absent_students_count}</td>
                  <td>
                    {row.absent_percent == null ? '' : `${row.absent_percent.toFixed(2)} %`}
                  </td>
                </tr>
              ))}
              <tr className="total">
                <td colSpan={2}>Ж А М И</td>
                <td>{activeSchools}</td>
                <td>{groups}</td>
                <td>{students}</td>
                <td>{groupsToday}</td>
                <td>{studentsToday}</td>
                <td>{absent}</td>
                <td>{average == null ? '' : `${average.toFixed(2)} %`}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PageMain>
    </>
  )
}
