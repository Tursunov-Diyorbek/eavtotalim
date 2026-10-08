import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { ArrowDown, BookOpen, Car, CircleAlert, FileText, Printer, RefreshCw, X } from 'lucide-react'
import {
  Badge,
  Button,
  Checkbox,
  DateInput,
  EmptyState,
  ErrorMessage,
  Input,
  Modal,
  Notification,
  Tooltip,
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
import { routes, studentPath } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useGenerateCertificateMutation,
  useGroupFinalMarksQuery,
  useStoreFinalMarksMutation,
} from '@/features/groups'
import { asText } from '@/lib/apiPage'
import { formatNumber, fullNameOf, printElement } from '@/lib'
import { cn } from '@/lib/cn'
import { useSmartBack } from '@/hooks'
import type { GroupFinalMarkStudent } from '@/types/groups'
import './bayonnoma.css'

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

const PROTOCOL_PRINT_CSS = `
  @page { size: A4 portrait !important; margin: 0 !important; }
  html, body { padding: 8mm 8mm !important; }
  .bn-doc { font-size: 12px !important; line-height: 1.3 !important; }
  .bn-table { width: 100% !important; table-layout: auto !important; }
  .bn-table th, .bn-table td {
    font-size: 11px !important;
    line-height: 1.15 !important;
    padding: 1px 2px !important;
  }
  .bn-v {
    height: auto !important;
    width: auto !important;
    max-width: none !important;
    writing-mode: vertical-lr !important;
    transform: rotate(180deg) !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    padding: 4px 1px !important;
  }
  .bn-table thead { display: table-header-group !important; }
  .bn-signs { break-inside: avoid !important; page-break-inside: avoid !important; }
`

function overallMark(mark1?: number | string | null, mark2?: number | string | null) {
  if (mark1 == null || mark1 === '' || mark2 == null || mark2 === '') return ''
  const left = Number(mark1)
  const right = parseInt(String(mark2), 10)
  if (!Number.isFinite(left) || !Number.isFinite(right)) return ''
  return String(Math.round(left + right / 2))
}

function shownDate(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function cellValue(value?: number | string | null) {
  if (value == null || value === '') return ''
  return String(value)
}

/** Eski `/final-marks/:id` — guvohnomani shakllantirish. */
export function GroupFinalMarksPage() {
  const { t } = useTranslation()
  const { me } = useAuth()
  const { id } = useParams()
  const goBack = useSmartBack(routes.finalMarkGroups)
  const protocolRef = useRef<HTMLDivElement>(null)
  const [protocolOpen, setProtocolOpen] = useState(false)
  const [formStudentId, setFormStudentId] = useState<number | null>(null)
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
  const storeHint = !statementDate && !statementNumber.trim()
    ? t('groupsPage.showPage.needProtocolBoth')
    : !statementDate
      ? t('groupsPage.showPage.needProtocolDate')
      : !statementNumber.trim()
        ? t('groupsPage.showPage.needProtocolNumber')
        : ''

  const shortfall = (row: GroupFinalMarkStudent) => {
    const practicalHours = hoursOf(row.student_personal_attendance?.practical_attendance_minutes)
    const autodromeCount = Number(row.student_personal_attendance?.autodrome_attendance_count ?? 0)
    const autodromeHours = autodromeCount * 2
    const practicalShort = Math.max(0, requiredPractical - practicalHours)
    const autodromeHoursShort = Math.max(0, requiredAutodrome - autodromeHours)
    const autodromeTimesShort = Math.ceil(autodromeHoursShort / 2)
    return { practicalHours, autodromeCount, practicalShort, autodromeHoursShort, autodromeTimesShort }
  }

  const closeFormCertificate = () => {
    if (generateMutation.isPending) return
    setFormStudentId(null)
  }

  const onGenerate = () => {
    if (formStudentId == null) return
    generateMutation.mutate(formStudentId, {
      onSuccess: () => {
        notify.success(t('common.saved'))
        setFormStudentId(null)
      },
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
  const orgName =
    me?.profession?.organization?.name_uz || me?.profession?.organization?.name || ''
  const examType = data?.edu_type?.name_for_exam || ''

  return (
    <>
      <Header
        title={t('groupsPage.showPage.certificatesTitle', { name: groupName })}
        onBack={goBack}
        actions={<Badge tone="amber">{t('groupsPage.showPage.testMode')}</Badge>}
      />
      <PageMain fill>
        {query.isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        ) : query.isError || !id ? (
          <ErrorMessage />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <Notification tone="warning" className="py-2">
              {t('groupsPage.showPage.formMarksHint')}
            </Notification>

            <div className="flex flex-wrap items-end gap-2">
              <DateInput
                className="w-40 shrink-0"
                size="sm"
                label={t('groupsPage.showPage.protocolDate')}
                name="statement_date"
                value={statementDate}
                onChange={(event) => setStatementDate(event.target.value)}
              />
              <div className="w-56 shrink-0">
                <Input
                  size="sm"
                  label={t('groupsPage.showPage.protocolNumber')}
                  name="statement_number"
                  value={statementNumber}
                  placeholder={t('groupsPage.showPage.protocolNumberPlaceholder')}
                  onChange={(event) => setStatementNumber(event.target.value)}
                />
              </div>
              <Button variant="primary" size="sm" onClick={() => setProtocolOpen(true)}>
                <Printer className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.printProtocol')}
              </Button>
              <Tooltip content={storeHint}>
                <Button
                  variant="outline"
                  size="sm"
                  className={!canStore ? 'pointer-events-none' : undefined}
                  disabled={!canStore}
                  loading={storeMutation.isPending}
                  onClick={onStoreMarks}
                >
                  <RefreshCw className="size-3.5" aria-hidden />
                  {t('groupsPage.showPage.formSubjectPractical')}
                </Button>
              </Tooltip>
              <Badge tone="signal" className="h-9 px-3 text-xs">
                <BookOpen className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.practicalHoursChip', { hours: requiredPractical })}
              </Badge>
              <Badge tone="signal" className="h-9 px-3 text-xs">
                <Car className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.autodromeHoursChip', { hours: requiredAutodrome })}
              </Badge>
            </div>

            <Notification tone="info" className="py-2">
              <Trans
                i18nKey="groupsPage.showPage.hoursAfterJulyHint"
                components={{
                  date: <strong className="font-semibold text-ink" />,
                  warn: <strong className="font-semibold text-rose" />,
                }}
              />
            </Notification>

            <Table storageKey="group-final-marks">
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
                              checked
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
                              onClick={() => setFormStudentId(studentId)}
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

      <Modal
        open={formStudentId != null}
        onClose={closeFormCertificate}
        hideHeader
        dismissible={!generateMutation.isPending}
        sizeClassName="max-w-[550px]"
        bodyClassName="px-6 py-6 sm:px-7"
      >
        <div className="flex items-start gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-soft text-amber">
            <CircleAlert className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-[17px] leading-snug font-semibold text-deep">
              {t('groupsPage.showPage.formCertTitle')}
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              {t('groupsPage.showPage.formCertSubtitle')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={generateMutation.isPending}
            aria-label={t('common.cancel')}
            onClick={closeFormCertificate}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink/80">
          <p>{t('groupsPage.showPage.formCertBody')}</p>
          <p className="rounded-[10px] border-l-[3px] border-amber bg-fog px-3.5 py-3 text-ink">
            {t('groupsPage.showPage.formCertNote')}
          </p>
        </div>
        <p className="mt-4 text-sm font-semibold text-deep">
          {t('groupsPage.showPage.formCertQuestion')}
        </p>
        <div className="mt-5 flex gap-3 border-t border-mist/70 pt-5">
          <div className="min-w-0 flex-1">
            <Button
              variant="outline"
              className="w-full !border-dashed !border-rose !text-rose"
              disabled={generateMutation.isPending}
              onClick={closeFormCertificate}
            >
              {t('common.cancel')}
            </Button>
          </div>
          <div className="min-w-0 flex-1">
            <Button
              variant="primary"
              className="w-full"
              loading={generateMutation.isPending}
              onClick={onGenerate}
            >
              {t('groupsPage.showPage.formCertConfirm')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={protocolOpen}
        onClose={() => setProtocolOpen(false)}
        title={t('groupsPage.showPage.protocolTitle')}
        sizeClassName="max-w-6xl"
        maxHeightClassName="max-h-[min(92svh,900px)]"
        bodyClassName="overflow-auto px-3 py-3 sm:px-4 sm:py-4"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setProtocolOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => printElement(protocolRef.current, undefined, { extraCss: PROTOCOL_PRINT_CSS })}
            >
              <Printer className="size-3.5" aria-hidden />
              {t('documentsPage.print')}
            </Button>
          </div>
        }
      >
        <div ref={protocolRef} className="bn-doc">
          <p>
            «<b>{orgName}</b>» o‘qishni bitirgan bo‘yicha imtihon hay’ati qarori «
            <b>{examType}</b>» toifasi bo‘yicha o‘qishni bitirgan «<b>{groupName}</b>» — guruhida
            imtihon o‘tkazildi
          </p>
          <div className="bn-pair">
            <div>Imtihon hay’ati raisi</div>
            <div>____________________________</div>
          </div>
          <div className="bn-pair">
            <div>Imtihon hay’ati a’zolari</div>
            <div>____________________________</div>
          </div>
          <div className="bn-dates">
            Mashg‘ulot boshlanishi <b>{shownDate(data?.edu_starting_date)}</b> mashg‘ulot tugashi{' '}
            <b>{shownDate(data?.edu_ending_date)}</b>
          </div>
          <div className="bn-dates">
            Guvohnoma berilgan sanasi <b>{shownDate(statementDate)}</b>
          </div>
          <table className="bn-table">
            <thead>
              <tr>
                <th rowSpan={2}>T/r</th>
                <th rowSpan={2} className="bn-fio">
                  FIO
                </th>
                <th colSpan={3}>Fanlar bo'yicha</th>
                <th rowSpan={2} className="bn-v">
                  Umumiy baho
                </th>
                <th rowSpan={2}>Guvohnoma raqami</th>
                <th rowSpan={2} className="bn-sign">
                  Imzo
                </th>
              </tr>
              <tr>
                <th className="bn-v">Avtomobil tuzilishi</th>
                <th className="bn-v">Yo'l harakati qoidalari</th>
                <th className="bn-v">Avtomobil boshqarish</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const cert = row.student_temp_certificate
                return (
                  <tr key={row.student?.id ?? index}>
                    <td>{index + 1}</td>
                    <td className="bn-name">{(fullNameOf(row.student) ?? '').toUpperCase()}</td>
                    <td>{cellValue(row.final_mark?.mark1)}</td>
                    <td>{cellValue(row.final_mark?.mark2)}</td>
                    <td>{cellValue(row.final_mark?.practical)}</td>
                    <td>{overallMark(row.final_mark?.mark1, row.final_mark?.mark2)}</td>
                    <td>
                      {cert?.certificate_serial || '--'} {cert?.certificate_number || '--'}
                    </td>
                    <td />
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="bn-signs">
            <div>Imtihon hay’ati raisi</div>
            <div>____________________________</div>
            <div>____________________________</div>
            <div>Imtihon hay’ati a’zolari</div>
            <div>____________________________</div>
            <div>____________________________</div>
            <div>&quot;Tashkilot nomi&quot; direktori:</div>
            <div>____________________________</div>
            <div>____________________________</div>
          </div>
        </div>
      </Modal>
    </>
  )
}
