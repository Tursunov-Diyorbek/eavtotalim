import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowLeft, History } from 'lucide-react'
import {
  createProblemReport,
  fetchProblemReportHistory,
  fetchProblemTypes,
} from '@/api'
import type { ProblemHistoryItem, ProblemTypeItem } from '@/api/problem-reports'
import {
  Button,
  EmptyState,
  Modal,
  PhoneInput,
  Skeleton,
  notify,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { formatDateTime } from '@/lib/format'
import { isPhoneComplete, toPhoneValue } from '@/lib/phone'

type ReportProblemButtonProps = {
  context: string
  subjectType: string
  subjectId: string
  buttonText: string
}

/** Eski ReportProblemButton: muammo turlari + telefon + tarix. */
export function ReportProblemButton({
  context,
  subjectType,
  subjectId,
  buttonText,
}: ReportProblemButtonProps) {
  const { t, i18n } = useTranslation()
  const { hasPermission, isSuperAdmin } = useAuth()
  const canReport = isSuperAdmin || hasPermission('create-problem-report')

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'list' | 'phone'>('list')
  const [types, setTypes] = useState<ProblemTypeItem[]>([])
  const [typesLoading, setTypesLoading] = useState(false)
  const [selected, setSelected] = useState<ProblemTypeItem | null>(null)
  const [phone, setPhone] = useState('')

  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<ProblemHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const submit = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error(t('students.showPage.problemTypeMissing'))
      if (!isPhoneComplete(phone)) {
        throw new Error(t('students.showPage.invalidPhone'))
      }
      return createProblemReport({
        problem_type_id: selected.id,
        subject_type: subjectType,
        subject_id: subjectId,
        phone: toPhoneValue(phone),
      })
    },
    onSuccess: () => {
      notify.success(t('students.showPage.problemSent'))
      closeModal()
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  if (!canReport) return null

  const closeModal = () => {
    setOpen(false)
    setStep('list')
    setSelected(null)
    setPhone('')
  }

  const openModal = async () => {
    setOpen(true)
    setStep('list')
    setSelected(null)
    setPhone('')
    setTypesLoading(true)
    try {
      setTypes(await fetchProblemTypes(context))
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t('common.loadError'))
    } finally {
      setTypesLoading(false)
    }
  }

  const openHistory = async () => {
    setHistoryOpen(true)
    setHistoryLoading(true)
    try {
      setHistory(
        await fetchProblemReportHistory({
          subject_type: subjectType,
          subject_id: subjectId,
        }),
      )
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t('common.loadError'))
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="min-w-0 flex-1 border-rose text-rose hover:bg-rose-soft"
          onClick={() => void openModal()}
        >
          <AlertTriangle className="size-3.5" aria-hidden />
          {buttonText}
        </Button>
        <Button variant="outline" onClick={() => void openHistory()}>
          <History className="size-3.5" aria-hidden />
          {t('students.showPage.history')}
        </Button>
      </div>

      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title={t('students.showPage.historyTitle')}
        sizeClassName="max-w-lg"
      >
        {historyLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState description={t('students.showPage.historyEmpty')} />
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-mist/80 p-3 text-sm"
              >
                <p className="whitespace-pre-wrap rounded-lg border border-teal/30 bg-teal-soft px-2.5 py-2 text-deep">
                  {item.message || '—'}
                </p>
                {item.students?.length ? (
                  <p className="mt-1.5 text-[12px] text-muted">
                    {item.students.length} {t('students.showPage.historyReports')}:{' '}
                    {item.students
                      .map((s) => s.fio || `#${s.subject_id}`)
                      .join(', ')}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] text-muted">
                  {item.responded_by ? `${item.responded_by} — ` : ''}
                  {formatDateTime(item.created_at, i18n.language) ??
                    item.created_at ??
                    ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={open}
        onClose={closeModal}
        title={
          step === 'phone' ? (
            <span className="inline-flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg p-1 text-muted hover:bg-fog"
                onClick={() => setStep('list')}
                aria-label={t('common.back')}
              >
                <ArrowLeft className="size-4" />
              </button>
              {t('students.showPage.yourPhone')}
            </span>
          ) : (
            t('students.showPage.whatProblem')
          )
        }
        sizeClassName="max-w-lg"
        dismissible={!submit.isPending}
      >
        {step === 'list' ? (
          typesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : types.length === 0 ? (
            <EmptyState description={t('students.showPage.problemTypesEmpty')} />
          ) : (
            <div className="flex flex-col gap-2">
              {types.map((type) => (
                <Button
                  key={type.id}
                  variant="outline"
                  className="h-auto justify-start py-2.5 text-left whitespace-normal"
                  onClick={() => {
                    setSelected(type)
                    setStep('phone')
                  }}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-deep">{selected?.name}</p>
            <p className="text-sm text-muted">{t('students.showPage.phoneForContact')}</p>
            <PhoneInput
              label={t('students.phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep('list')}>
                {t('common.back')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={submit.isPending}
                onClick={() => submit.mutate()}
              >
                {t('students.showPage.sendProblem')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
