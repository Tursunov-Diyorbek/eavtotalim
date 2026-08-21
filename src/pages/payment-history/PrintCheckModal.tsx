import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Banknote,
  CalendarDays,
  CreditCard,
  Phone,
  Printer,
  Receipt,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { formatDate, formatNumber, formatPhoneLocal, parsePhoneDigits, printElement } from '@/lib'
import { cn } from '@/lib/cn'
import { fullNameOf } from '@/lib/format'

export type CheckPayload = {
  id?: number
  org?: string | null
  group?: string | null
  student?: string | null
  paymentDate?: string | null
  payType?: string | null
  amount?: number | string | null
}

function qrSrc(id: number) {
  const url = `${window.location.origin}/payment-history/check/${id}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=2f7ea0&bgcolor=ffffff&data=${encodeURIComponent(url)}`
}

function formatOrgPhone(raw?: string | null) {
  const digits = parsePhoneDigits(raw)
  if (!digits) return null
  return `+998 ${formatPhoneLocal(digits)}`
}

function CheckRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  accent?: boolean
}) {
  return (
    <div className="grid grid-cols-[1.6fr_1.4fr] items-center gap-3 py-2">
      <span className="flex min-w-0 items-center gap-2 text-[13px] text-muted">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-signal-soft text-signal">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </span>
      <span
        className={cn(
          'justify-self-end text-right text-[13px] leading-snug font-semibold wrap-break-word text-deep',
          accent &&
            'inline-flex h-7 items-center rounded-md bg-teal-soft px-2 font-bold text-teal not-italic',
        )}
      >
        {value}
      </span>
    </div>
  )
}

const iconProps = { className: 'size-3.5', strokeWidth: 2, 'aria-hidden': true as const }

export function CheckBody({
  payload,
  phone,
  framed = true,
}: {
  payload: CheckPayload
  phone?: string | null
  framed?: boolean
}) {
  const { t, i18n } = useTranslation()
  const orgPhone = formatOrgPhone(phone)

  return (
    <div
      className={cn(
        'select-none bg-white',
        framed && 'overflow-hidden rounded-xl border border-mist/80',
      )}
    >
      <div className="px-5 pt-4 pb-3 text-center">
        <p className="font-display text-[15px] font-semibold text-deep">
          {payload.org || '—'}
        </p>
        <div className="mt-2.5 flex items-center justify-center gap-2">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-signal text-white">
            <Receipt className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <p className="font-display text-base leading-none font-bold tracking-tight text-signal">
            Eavtota'lim
          </p>
        </div>
      </div>

      <div className="mx-5 border-t border-dashed border-mist/90" />

      <div className="divide-y divide-dashed divide-mist/80 px-5">
        <CheckRow
          icon={<CreditCard {...iconProps} />}
          label={t('paymentHistoryPage.payType')}
          value={payload.payType || '—'}
        />
        <CheckRow
          icon={<Banknote {...iconProps} />}
          label={t('paymentHistoryPage.amount')}
          value={`${formatNumber(payload.amount)} ${t('dashboard.sum')}`}
          accent
        />
        <CheckRow
          icon={<UsersRound {...iconProps} />}
          label={t('paymentHistoryPage.group')}
          value={payload.group || '—'}
        />
        <CheckRow
          icon={<UserRound {...iconProps} />}
          label={t('paymentHistoryPage.student')}
          value={payload.student || '—'}
        />
        <CheckRow
          icon={<CalendarDays {...iconProps} />}
          label={t('paymentHistoryPage.paidAt')}
          value={
            formatDate(payload.paymentDate, i18n.language) ??
            payload.paymentDate ??
            '—'
          }
        />
        <CheckRow
          icon={<Phone {...iconProps} />}
          label={t('paymentHistoryPage.contactPhone')}
          value={orgPhone || t('paymentHistoryPage.noPhone')}
        />
      </div>

      <div className="mx-5 border-t border-dashed border-mist/90" />

      <div className="flex flex-col items-center gap-1.5 px-5 pt-3 pb-4">
        {payload.id ? (
          <img
            src={qrSrc(payload.id)}
            alt=""
            width={100}
            height={100}
            className="size-[100px]"
            draggable={false}
          />
        ) : null}
        <p className="text-[10px] text-muted">Powered by Next Developers Team</p>
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
      sizeClassName="max-w-md"
      maxHeightClassName="max-h-[min(92svh,840px)]"
      className="select-none"
      bodyClassName="overflow-hidden p-0"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="w-full" onClick={onClose}>
            {t('paymentHistoryPage.close')}
          </Button>
          <Button
            className="w-full"
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
        {payload ? <CheckBody payload={payload} phone={phone} framed={false} /> : null}
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
