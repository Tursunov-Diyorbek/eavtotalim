import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  CalendarX2,
  CarFront,
  Gauge,
  GraduationCap,
  MapPin,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react'
import { submitStudentAlternativeStudyReport } from '@/api'
import { Button, Modal, Textarea, notify } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { cn, formatDate, fullNameOf } from '@/lib'
import type { MeStudyAddress } from '@/types/auth'

function ackStorageKey(studentId: number) {
  return `school_notice_ack_${studentId}`
}

function readAck(studentId: number): boolean {
  try {
    return localStorage.getItem(ackStorageKey(studentId)) === '1'
  } catch {
    return false
  }
}

function writeAck(studentId: number) {
  try {
    localStorage.setItem(ackStorageKey(studentId), '1')
  } catch {
    /* ignore */
  }
}

function joinAddress(addr: MeStudyAddress | null | undefined): string | null {
  if (!addr) return null
  const parts = [addr.region, addr.area, addr.details]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
  return parts.length ? parts.join(' ') : null
}

function InfoRow({
  icon,
  label,
  value,
  tone,
  full,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  tone: string
  full?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl border border-mist/70 bg-fog/40 px-2.5 py-2',
        full && 'col-span-full',
      )}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-[10px]',
          tone,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[10.5px] leading-tight text-muted">{label}</p>
        <div className="text-[13px] leading-snug font-semibold break-words text-deep">
          {value ?? '—'}
        </div>
      </div>
    </div>
  )
}

/** Eski StudentSchoolModal — birinchi kirishda ta’lim ma’lumoti; «Tushunarli» → localStorage. */
export function StudentSchoolModal() {
  const { t, i18n } = useTranslation()
  const { me, user } = useAuth()
  const isStudent =
    user?.role === 5 || user?.roles?.includes('student') === true
  const studentId = me?.profession?.id ?? null

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'info' | 'report'>('info')
  const [reportMessage, setReportMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!isStudent || studentId == null) {
      setOpen(false)
      return
    }
    setOpen(!readAck(studentId))
  }, [isStudent, studentId])

  const info = useMemo(() => {
    const student = me?.profession
    const org = student?.organization ?? null
    const study = me?.study_info
    const autodrome = study?.autodrome ?? null
    const cars = Array.isArray(study?.cars) ? study.cars : []

    return {
      fullName: fullNameOf(student ?? null),
      eduStart: formatDate(study?.group?.edu_starting_date, i18n.language) ?? '—',
      eduEnd: formatDate(study?.group?.edu_ending_date, i18n.language) ?? '—',
      schoolName: org?.name_uz || org?.name || study?.organization?.name || null,
      schoolAddress:
        org?.address || joinAddress(study?.organization?.address) || null,
      license: org?.license ?? null,
      autodromeName: autodrome?.name || null,
      autodromeAddress: joinAddress(autodrome?.address),
      carNumbers: cars.map((c) => c?.number).filter(Boolean) as string[],
    }
  }, [me, i18n.language])

  function handleUnderstood() {
    if (studentId != null) writeAck(studentId)
    setOpen(false)
    setView('info')
    setReportMessage('')
  }

  async function handleSendReport() {
    const note = reportMessage.trim()
    if (!note) {
      notify.warning(t('studentSchool.messageRequired'))
      return
    }
    setSending(true)
    try {
      await submitStudentAlternativeStudyReport(note)
      notify.success(t('studentSchool.reportSent'))
      handleUnderstood()
    } catch {
      notify.error(t('studentSchool.reportError'))
    } finally {
      setSending(false)
    }
  }

  if (!isStudent) return null

  return (
    <Modal
      open={open}
      onClose={() => undefined}
      dismissible={false}
      hideHeader
      sizeClassName={view === 'info' ? 'max-w-[800px]' : 'max-w-[460px]'}
      maxHeightClassName="max-h-[min(90svh,860px)]"
      bodyClassName="overflow-y-auto p-0"
      className="rounded-[18px]"
    >
      {view === 'info' ? (
        <div className="flex flex-wrap">
          <div className="flex min-w-[240px] flex-[1_1_260px] flex-col bg-linear-to-b from-indigo-soft/80 to-violet-soft/70 px-[22px] py-[26px]">
            <div className="mb-3.5 flex size-[52px] items-center justify-center rounded-2xl bg-white/80 text-indigo shadow-[0_6px_16px_rgba(107,138,253,0.18)]">
              <GraduationCap className="size-6" aria-hidden />
            </div>
            <h3 className="m-0 text-[19px] font-bold text-deep">
              {t('studentSchool.title')}
            </h3>
            {info.fullName ? (
              <p className="m-0 mt-1 text-[12.5px] text-muted">{info.fullName}</p>
            ) : null}

            <div className="mt-auto pt-5">
              <Button
                variant="primary"
                className="h-11 w-full rounded-xl text-[14px] font-bold shadow-[0_8px_18px_rgba(107,138,253,0.28)]"
                onClick={handleUnderstood}
              >
                {t('studentSchool.understood')}
              </Button>
            </div>
          </div>

          <div className="flex min-w-[300px] flex-[2_1_420px] flex-col gap-3.5 px-5 py-[22px]">
            <div className="flex items-center gap-2.5 rounded-xl border border-amber/25 border-l-[3px] border-l-amber bg-amber-soft/40 px-3.5 py-3 shadow-[0_4px_12px_rgba(240,163,94,0.1)]">
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-amber-soft text-amber">
                <AlertTriangle className="size-4" aria-hidden />
              </span>
              <div className="text-[11.5px] leading-snug">
                <p className="m-0 mb-0.5 font-bold text-amber">
                  {t('studentSchool.warningTitle')}
                </p>
                <p className="m-0 text-muted">{t('studentSchool.warningText')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <InfoRow
                icon={<CalendarCheck className="size-3.5" aria-hidden />}
                label={t('studentSchool.eduStart')}
                value={info.eduStart}
                tone="bg-teal-soft text-teal"
              />
              <InfoRow
                icon={<CalendarX2 className="size-3.5" aria-hidden />}
                label={t('studentSchool.eduEnd')}
                value={info.eduEnd}
                tone="bg-rose-soft text-rose"
              />

              <InfoRow
                full
                icon={<Building2 className="size-3.5" aria-hidden />}
                label={t('studentSchool.school')}
                value={
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    <span>{info.schoolName || '—'}</span>
                    {info.license ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft px-2 py-0.5 text-[10px] font-semibold text-teal">
                        <ShieldCheck className="size-2.5" aria-hidden />
                        {t('studentSchool.licensed')}
                        {info.license.number ? ` · ${info.license.number}` : ''}
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-soft px-2 py-0.5 text-[10px] font-semibold text-rose">
                        {t('studentSchool.noLicense')}
                      </span>
                    )}
                  </span>
                }
                tone="bg-indigo-soft text-indigo"
              />

              <InfoRow
                full
                icon={<MapPin className="size-3.5" aria-hidden />}
                label={t('studentSchool.schoolAddress')}
                value={info.schoolAddress}
                tone="bg-violet-soft text-violet"
              />

              <InfoRow
                full
                icon={<Gauge className="size-3.5" aria-hidden />}
                label={t('studentSchool.autodromeName')}
                value={info.autodromeName}
                tone="bg-amber-soft text-amber"
              />

              <InfoRow
                full
                icon={<MapPin className="size-3.5" aria-hidden />}
                label={t('studentSchool.autodromeAddress')}
                value={info.autodromeAddress}
                tone="bg-teal-soft text-teal"
              />

              <InfoRow
                full
                icon={<CarFront className="size-3.5" aria-hidden />}
                label={t('studentSchool.cars')}
                value={
                  info.carNumbers.length ? (
                    <span className="inline-flex flex-wrap gap-1.5">
                      {info.carNumbers.map((num) => (
                        <span
                          key={num}
                          className="inline-block rounded-md border-[1.5px] border-mist bg-white px-2.5 py-0.5 font-mono text-[12.5px] font-bold tracking-wide text-deep"
                        >
                          {num}
                        </span>
                      ))}
                    </span>
                  ) : (
                    '—'
                  )
                }
                tone="bg-indigo-soft text-indigo"
              />
            </div>

            <div className="mt-auto flex items-center gap-3 rounded-xl border border-rose/20 bg-rose-soft/50 px-3.5 py-3">
              <div className="min-w-0 flex-1">
                <p className="m-0 mb-0.5 text-[12.5px] font-bold text-rose">
                  {t('studentSchool.mismatchTitle')}
                </p>
                <p className="m-0 text-[11.5px] leading-snug text-muted">
                  {t('studentSchool.mismatchText')}
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="h-9 shrink-0 rounded-lg font-semibold shadow-[0_4px_10px_rgba(253,107,107,0.3)]"
                onClick={() => setView('report')}
              >
                <Send className="size-3.5" aria-hidden />
                {t('studentSchool.notify')}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-[22px] pt-5 pb-[22px]">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <h3 className="m-0 text-base font-bold text-deep">
              {t('studentSchool.reportTitle')}
            </h3>
            <button
              type="button"
              aria-label={t('common.back')}
              onClick={() => setView('info')}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-fog hover:text-deep"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <p className="m-0 mb-3.5 text-xs text-muted">
            {t('studentSchool.reportHint')}
          </p>
          <Textarea
            label={t('studentSchool.messageLabel')}
            value={reportMessage}
            onChange={(e) => setReportMessage(e.target.value)}
            placeholder={t('studentSchool.messagePlaceholder')}
            maxLength={1000}
            rows={4}
            disabled={sending}
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full rounded-[10px] font-semibold"
              onClick={() => setView('info')}
              disabled={sending}
            >
              {t('common.back')}
            </Button>
            <Button
              variant="primary"
              className="w-full rounded-[10px] font-semibold"
              loading={sending}
              onClick={() => void handleSendReport()}
            >
              <Send className="size-3.5" aria-hidden />
              {t('studentSchool.send')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
