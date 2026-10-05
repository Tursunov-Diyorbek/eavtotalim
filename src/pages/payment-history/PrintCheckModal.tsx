import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Banknote, Printer, Receipt } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { formatDate, formatNumber, parsePhoneDigits, printElement } from '@/lib'
import { fullNameOf } from '@/lib/format'

export type CheckPayload = {
  id?: number
  org?: string | null
  group?: string | null
  student?: string | null
  paymentDate?: string | null
  payType?: string | null
  amount?: number | string | null
  cashier?: string | null
}

function qrSrc(id: number) {
  const url = `${window.location.origin}/payment-history/check/${id}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=0f2430&bgcolor=ffffff&data=${encodeURIComponent(url)}`
}

function formatOrgPhone(raw?: string | null) {
  const digits = parsePhoneDigits(raw)
  if (digits.length !== 9) return null
  return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
}

function formatClock(value?: string | null) {
  if (!value || !/[T ]\d{2}:\d{2}/.test(value)) return '—'
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-[11px] leading-none text-muted">{label}</p>
      <p className="m-0 mt-1 text-[13px] leading-snug font-bold wrap-break-word text-deep">
        {value || '—'}
      </p>
    </div>
  )
}

export function CheckBody({
  payload,
  phone,
}: {
  payload: CheckPayload
  phone?: string | null
  framed?: boolean
}) {
  const { t, i18n } = useTranslation()
  const orgPhone = formatOrgPhone(phone)
  const dateLabel =
    formatDate(payload.paymentDate, i18n.language) ?? payload.paymentDate ?? '—'

  return (
    <div className="bg-white p-3 sm:p-4">
      <div className="overflow-hidden rounded-xl border border-mist bg-white">
        <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              {t('paymentHistoryPage.checkHeading')}
            </p>
            <p className="font-display m-0 mt-1 text-[18px] leading-tight font-bold tracking-tight text-deep uppercase sm:text-[20px]">
              {payload.org || '—'}
            </p>
          </div>
          {payload.id ? (
            <span className="shrink-0 rounded-lg bg-fog px-2.5 py-1 text-[12px] font-semibold text-muted">
              № {payload.id}
            </span>
          ) : null}
        </div>

        <div className="mx-4 mt-3 border-t border-dashed border-mist sm:mx-5" />

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_132px]">
          <div className="px-4 py-3 sm:px-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Field label={t('paymentHistoryPage.psDate')} value={dateLabel} />
              <Field
                label={t('paymentHistoryPage.checkTime')}
                value={formatClock(payload.paymentDate)}
              />
              <Field
                label={t('paymentHistoryPage.student')}
                value={payload.student || '—'}
              />
              <Field
                label={t('paymentHistoryPage.group')}
                value={payload.group || '—'}
              />
              <Field
                label={t('paymentHistoryPage.payType')}
                value={payload.payType || '—'}
              />
              <Field
                label={t('paymentHistoryPage.cashier')}
                value={payload.cashier || '—'}
              />
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-teal-soft px-3 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-teal">
                <Banknote className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="m-0 text-[10px] font-semibold tracking-[0.12em] text-teal uppercase">
                  {t('paymentHistoryPage.checkAmount')}
                </p>
                <p className="font-display m-0 mt-0.5 text-[18px] leading-none font-bold text-teal sm:text-[20px]">
                  {formatNumber(payload.amount)} {t('dashboard.sum')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5 border-t border-dashed border-mist px-3 py-4 sm:border-t-0 sm:border-l">
            {payload.id ? (
              <img
                src={qrSrc(payload.id)}
                alt=""
                width={108}
                height={108}
                className="size-[108px]"
                draggable={false}
              />
            ) : null}
            <p className="m-0 text-center text-[10px] leading-tight text-muted">
              {t('paymentHistoryPage.checkVerify')}
            </p>
          </div>
        </div>

        <div className="mx-4 border-t border-dashed border-mist sm:mx-5" />

        <div className="grid gap-1 px-4 py-3 text-[11px] text-muted sm:grid-cols-3 sm:items-center sm:gap-3 sm:px-5">
          <p className="m-0">
            {t('paymentHistoryPage.checkContact')}: {orgPhone || '—'}
          </p>
          <p className="m-0 font-semibold text-deep sm:text-center">
            {t('paymentHistoryPage.checkThanks')}
          </p>
          <p className="m-0 sm:text-right">Powered by Next Developers Team</p>
        </div>
      </div>
    </div>
  )
}

export function PrintCheckModal({
  open,
  onClose,
  payload,
}: {
  open: boolean
  onClose: () => void
  payload: CheckPayload | null
}) {
  const { t } = useTranslation()
  const { me } = useAuth()
  const phone = me?.profession?.organization?.phone

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('paymentHistoryPage.checkTitle')}
      sizeClassName="max-w-3xl"
      maxHeightClassName="max-h-[min(92svh,840px)]"
      className="select-none"
      closeClassName="text-rose hover:bg-rose-soft"
      bodyClassName="overflow-y-auto p-0"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="danger"
            className="!bg-rose !text-white hover:!bg-rose/90"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() =>
              printElement(
                document.getElementById('payment-check-sheet'),
                t('paymentHistoryPage.checkTitle'),
              )
            }
          >
            <Printer className="size-3.5" aria-hidden />
            {t('paymentHistoryPage.printCheck')}
          </Button>
        </div>
      }
    >
      <div id="payment-check-sheet">
        {payload ? <CheckBody payload={payload} phone={phone} /> : null}
      </div>
    </Modal>
  )
}

export function CheckOpenButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={t('paymentHistoryPage.check')}
      onClick={onClick}
    >
      <Receipt className="size-4 text-signal" />
    </Button>
  )
}

export function studentFio(row: {
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
} | null | undefined) {
  return fullNameOf(row) ?? '—'
}
