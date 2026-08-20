import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowLeft, BookOpen, Car, FileText, Printer, RefreshCw } from 'lucide-react'
import {
  Badge,
  Button,
  Checkbox,
  DateInput,
  EmptyState,
  ErrorMessage,
  Input,
  Notification,
  Panel,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { Header, PageMain } from '@/components/layout'
import { groupShowPath, routes, studentPath } from '@/config'
import {
  useGenerateCertificateMutation,
  useGroupFinalMarksQuery,
  useStoreFinalMarksMutation,
} from '@/features/groups'
import { asText } from '@/lib/apiPage'
import { formatNumber, fullNameOf } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useSmartBack } from '@/hooks'
import type { GroupFinalMarkStudent } from '@/types/groups'

const EMPTY = '---'
const JULY1 = '2024-07-01'

function hoursOf(minutes?: number | string | null) {
  const n = Number(minutes ?? 0)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round((n / 60) * 10) / 10
}

function endsAfterJuly1(iso?: string | null) {
  if (!iso) return false
  return iso.slice(0, 10) > JULY1
}

function printProtocol(title: string, headers: string[], rows: string[][]) {
  const escape = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const html = `<html><head><meta charset="UTF-8" /><title>${escape(title)}</title>
    <style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%;font-size:12px}
    th,td{border:1px solid #ccc;padding:6px;text-align:left}h1{font-size:18px}</style></head>
    <body><h1>${escape(title)}</h1><table><thead><tr>${headers
      .map((h) => `<th>${escape(h)}</th>`)
      .join('')}</tr></thead><tbody>${rows
      .map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join('')}</tr>`)
      .join('')}</tbody></table></body></html>`
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}

/** Eski `/final-marks/:id` — guvohnomani shakllantirish. */
export function GroupFinalMarksPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const goBack = useSmartBack(id ? groupShowPath(id) : routes.groups)
  const query = useGroupFinalMarksQuery(id)
  const generateMutation = useGenerateCertificateMutation()
  const storeMutation = useStoreFinalMarksMutation(id ?? '')
  const [sortDesc, setSortDesc] = useState(false)
  const [statementDate, setStatementDate] = useState('')
  const [statementNumber, setStatementNumber] = useState('')
  const [practical, setPractical] = useState<Record<number, boolean>>({})

  const data = query.data
  const rawRows = data?.grouped_student ?? []

  useEffect(() => {
    const list = data?.grouped_student ?? []
    const next: Record<number, boolean> = {}
    list.forEach((row) => {
      const studentId = row.student?.id
      if (studentId) next[studentId] = Number(row.final_mark?.practical) === 1
    })
    setPractical(next)
    setStatementDate(data?.final_statement?.statement_date?.slice(0, 10) ?? '')
    setStatementNumber(data?.final_statement?.statement_number ?? '')
  }, [data])

  const rows = useMemo(() => {
    const list = [...rawRows]
    list.sort((a, b) => {
      const an = (fullNameOf(a.student) ?? '').toUpperCase()
      const bn = (fullNameOf(b.student) ?? '').toUpperCase()
      const cmp = an.localeCompare(bn, 'uz')
      return sortDesc ? -cmp : cmp
    })
    return list
  }, [rawRows, sortDesc])

  const requiredPractical = Number(data?.edu_type?.practical_hours ?? 0)
  const requiredAutodrome = Number(data?.edu_type?.autodrome_hours ?? 0)
  const hoursRequired = endsAfterJuly1(data?.edu_ending_date)
  const canStore = Boolean(statementDate && statementNumber.trim())

  const shortfall = (row: GroupFinalMarkStudent) => {
    const practicalHours = hoursOf(row.student_personal_attendance?.practical_attendance_minutes)
    const autodromeCount = Number(row.student_personal_attendance?.autodrome_attendance_count ?? 0)
    const autodromeHours = autodromeCount * 2
    const practicalShort = Math.max(0, requiredPractical - practicalHours)
    const autodromeHoursShort = Math.max(0, requiredAutodrome - autodromeHours)
    const autodromeTimesShort = Math.ceil(autodromeHoursShort / 2)
    return { practicalHours, autodromeCount, practicalShort, autodromeHoursShort, autodromeTimesShort }
  }

  const onGenerate = (studentId: number) => {
    generateMutation.mutate(studentId, {
      onSuccess: () => notify.success(t('common.saved')),
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const onStoreMarks = () => {
    if (!id || !canStore) return
    storeMutation.mutate(
      {
        statement_date: statementDate,
        statement_number: statementNumber.trim(),
        marks: rows
          .map((row) => row.student?.id)
          .filter((studentId): studentId is number => Boolean(studentId))
          .map((studentId) => ({
            student_id: studentId,
            practical: practical[studentId] ? 1 : 0,
          })),
      },
      {
        onSuccess: () => notify.success(t('groupsPage.showPage.formMarksSaved')),
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  const groupName = asText(data?.name)

  return (
    <>
      <Header
        title={t('groupsPage.showPage.certificatesTitle', { name: groupName })}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={goBack}
            >
              <ArrowLeft className="size-3.5" aria-hidden />
            </Button>
            <Badge tone="amber">{t('groupsPage.showPage.testMode')}</Badge>
          </div>
        }
      />
      <PageMain fill>
        {query.isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        ) : query.isError || !id ? (
          <ErrorMessage />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Notification tone="warning">
              {t('groupsPage.showPage.formMarksHint')}
            </Notification>

            <div className="flex flex-wrap items-end gap-2">
              <DateInput
                label={t('groupsPage.showPage.protocolDate')}
                name="statement_date"
                value={statementDate}
                onChange={(event) => setStatementDate(event.target.value)}
              />
              <Input
                label={t('groupsPage.showPage.protocolNumber')}
                name="statement_number"
                value={statementNumber}
                placeholder={t('groupsPage.showPage.protocolNumberPlaceholder')}
                onChange={(event) => setStatementNumber(event.target.value)}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  printProtocol(
                    t('groupsPage.showPage.certificatesTitle', { name: groupName }),
                    [
                      '№',
                      t('directorList.fio'),
                      t('groupsPage.showPage.subject1'),
                      t('groupsPage.showPage.subject2'),
                      t('groupsPage.showPage.practical'),
                      t('groupsPage.colAttendance'),
                      t('groupsPage.showPage.debt'),
                    ],
                    rows.map((row, index) => [
                      String(index + 1),
                      (fullNameOf(row.student) ?? EMPTY).toUpperCase(),
                      asText(row.final_mark?.mark1),
                      asText(row.final_mark?.mark2),
                      practical[row.student?.id ?? 0]
                        ? t('common.saved')
                        : EMPTY,
                      asText(row.student_personal_attendance?.average_attendance_percent),
                      formatNumber(row.debt),
                    ]),
                  )
                }
              >
                <Printer className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.printProtocol')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!canStore}
                loading={storeMutation.isPending}
                onClick={onStoreMarks}
              >
                <RefreshCw className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.formSubjectPractical')}
              </Button>
              <Badge tone="signal" className="h-9 px-3 text-xs">
                <BookOpen className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.practicalHoursChip', { hours: requiredPractical })}
              </Badge>
              <Badge tone="signal" className="h-9 px-3 text-xs">
                <Car className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.autodromeHoursChip', { hours: requiredAutodrome })}
              </Badge>
            </div>

            <Notification tone="info">{t('groupsPage.showPage.hoursAfterJulyHint')}</Notification>

            <Table storageKey="group-final-marks" className="min-w-320">
              <THead>
                <TR>
                  <TH className="w-12 text-center">№</TH>
                  <TH className="min-w-52">
                    <div className="flex items-center gap-2">
                      {t('directorList.fio')}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => setSortDesc((prev) => !prev)}
                      >
                        {sortDesc
                          ? t('groupsPage.showPage.sortAZ')
                          : t('groupsPage.showPage.sortZA')}
                      </Button>
                    </div>
                  </TH>
                  <TH>{t('groupsPage.showPage.subject1')}</TH>
                  <TH>{t('groupsPage.showPage.subject2')}</TH>
                  <TH className="w-20 text-center">{t('groupsPage.showPage.practical')}</TH>
                  <TH>{t('groupsPage.showPage.certSerialNumber')}</TH>
                  <TH>{t('groupsPage.showPage.practicalAttendanceTime')}</TH>
                  <TH>{t('groupsPage.showPage.autodromeAttendanceTime')}</TH>
                  <TH>{t('groupsPage.showPage.attendancePercent')}</TH>
                  <TH>{t('groupsPage.showPage.debt')}</TH>
                  <TH>{t('groupsPage.showPage.certificatePermission')}</TH>
                  <TH className="w-20 text-center">{t('groupsPage.showPage.certificate')}</TH>
                </TR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <TR>
                    <TD className="py-6 text-center" colSpan={12}>
                      <EmptyState
                        className="border-0 py-4 shadow-none"
                        description={t('common.empty')}
                      />
                    </TD>
                  </TR>
                ) : (
                  rows.map((row, index) => {
                    const student = row.student
                    const studentId = student?.id
                    const name = (fullNameOf(student) ?? EMPTY).toUpperCase()
                    const cert = row.student_temp_certificate
                    const hasCert = Boolean(cert?.id)
                    const debt = Number(row.debt ?? 0)
                    const hours = shortfall(row)
                    const blocked =
                      debt > 0 ||
                      (hoursRequired &&
                        (hours.practicalShort > 0 || hours.autodromeHoursShort > 0))
                    const percent = Number(
                      row.student_personal_attendance?.average_attendance_percent,
                    )
                    return (
                      <TR
                        key={studentId ?? index}
                        className={cn(blocked && 'bg-rose-soft/60')}
                      >
                        <TD className="text-center text-muted">{index + 1}</TD>
                        <TD>
                          {studentId ? (
                            <Link
                              to={studentPath(studentId)}
                              className={cn(
                                'font-semibold uppercase hover:underline',
                                blocked ? 'text-rose' : 'text-signal',
                              )}
                            >
                              {name}
                            </Link>
                          ) : (
                            name
                          )}
                        </TD>
                        <TD>{asText(row.final_mark?.mark1)}</TD>
                        <TD>{asText(row.final_mark?.mark2)}</TD>
                        <TD className="text-center">
                          {studentId ? (
                            <Checkbox
                              checked={Boolean(practical[studentId])}
                              onChange={(checked) =>
                                setPractical((prev) => ({ ...prev, [studentId]: checked }))
                              }
                            />
                          ) : (
                            EMPTY
                          )}
                        </TD>
                        <TD>
                          {cert?.certificate_serial || cert?.certificate_number ? (
                            `${cert.certificate_serial ?? ''} ${cert.certificate_number ?? ''}`.trim()
                          ) : (
                            EMPTY
                          )}
                        </TD>
                        <TD>
                          {hoursRequired && hours.practicalShort > 0 ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-rose">
                              <ArrowDown className="size-3.5" aria-hidden />
                              {t('groupsPage.showPage.hoursShort', {
                                hours: hours.practicalShort,
                              })}
                            </span>
                          ) : (
                            EMPTY
                          )}
                        </TD>
                        <TD>
                          {hoursRequired && hours.autodromeTimesShort > 0 ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-rose">
                              <ArrowDown className="size-3.5" aria-hidden />
                              {t('groupsPage.showPage.timesShort', {
                                times: hours.autodromeTimesShort,
                                hours: hours.autodromeHoursShort,
                              })}
                            </span>
                          ) : (
                            EMPTY
                          )}
                        </TD>
                        <TD>
                          {Number.isFinite(percent) ? `${percent}%` : EMPTY}
                        </TD>
                        <TD className={debt > 0 ? 'font-semibold text-rose' : ''}>
                          {formatNumber(row.debt)}
                        </TD>
                        <TD>
                          {cert?.is_show_to_student
                            ? t('groupsPage.showPage.certAllowed')
                            : EMPTY}
                        </TD>
                        <TD className="text-center">
                          {studentId && !hasCert ? (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              loading={
                                generateMutation.isPending &&
                                generateMutation.variables === studentId
                              }
                              aria-label={t('groupsPage.showPage.generateCertificate')}
                              onClick={() => onGenerate(studentId)}
                            >
                              <FileText className="size-3.5" />
                            </Button>
                          ) : hasCert ? (
                            <Badge tone="teal">{t('groupsPage.showPage.certificateReady')}</Badge>
                          ) : (
                            EMPTY
                          )}
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
          </div>
        )}
      </PageMain>
    </>
  )
}
