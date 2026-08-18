import { useTranslation } from 'react-i18next'
import { Check, Phone, Send, X } from 'lucide-react'
import { Badge, Button, Modal, Panel } from '@/components/ui'
import {
  TARIFF_FEATURES,
  TARIFF_INSTAGRAM,
  TARIFF_PHONE,
  TARIFF_PHONE_HREF,
  TARIFF_PLANS,
  TARIFF_TELEGRAM,
  type TariffPlan,
} from '@/config/tariffPlans'
import { cn, formatNumber } from '@/lib'

type Props = {
  open: boolean
  onClose: () => void
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  )
}

const TONE_HEAD: Record<TariffPlan['tone'], string> = {
  signal: 'bg-signal-soft text-signal',
  teal: 'bg-teal-soft text-teal',
  violet: 'bg-violet-soft text-violet',
}

const TONE_PRICE: Record<TariffPlan['tone'], string> = {
  signal: 'text-signal',
  teal: 'text-teal',
  violet: 'text-violet',
}

export function TariffPlansModal({ open, onClose }: Props) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('tariff.title')}
      sizeClassName="max-w-6xl"
      className="max-h-[min(92svh,880px)]"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-deep">
          <a
            href={TARIFF_PHONE_HREF}
            className="inline-flex items-center gap-1.5 hover:text-signal"
          >
            <Phone className="size-3.5 text-teal" aria-hidden />
            {TARIFF_PHONE}
          </a>
          <a
            href={TARIFF_TELEGRAM}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-signal"
          >
            <Send className="size-3.5 text-signal" aria-hidden />
            Eavtotalim
          </a>
          <a
            href={TARIFF_INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-signal"
          >
            <InstagramIcon className="size-3.5 text-violet" />
            Eavtotalim
          </a>
        </div>

        <div className="grid gap-2.5 lg:grid-cols-3">
          {TARIFF_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <a
          href={TARIFF_TELEGRAM}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          <Button variant="primary" className="w-full" size="md">
            {t('tariff.cta')}
          </Button>
        </a>
      </div>
    </Modal>
  )
}

function PlanCard({ plan }: { plan: TariffPlan }) {
  const { t } = useTranslation()

  return (
    <Panel
      className={cn(
        'flex flex-col',
        plan.featured && 'ring-2 ring-teal/35',
      )}
    >
      <div className={cn('px-3 py-2.5', TONE_HEAD[plan.tone])}>
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-display text-sm font-bold">{t(plan.nameKey)}</h4>
          {plan.featured ? (
            <Badge tone="neutral">{t('tariff.recommended')}</Badge>
          ) : null}
        </div>
        <p className="mt-0.5 text-[11px] opacity-80">
          {t('tariff.percentOfBase', { percent: plan.percent })}
        </p>
        <p className={cn('font-display mt-1 text-xl font-semibold', TONE_PRICE[plan.tone])}>
          {formatNumber(plan.price)}{' '}
          <span className="text-[12px] font-medium">{t('dashboard.sum')}</span>
          <span className="text-[11px] font-normal text-muted">
            {' '}
            / {t('tariff.perStudent')}
          </span>
        </p>
      </div>

      <ul className="max-h-[min(48vh,380px)] space-y-1 overflow-y-auto p-2.5">
        {TARIFF_FEATURES.map((feature) => {
          const included = feature.id <= plan.includedUntil
          return (
            <li key={feature.id}>
              <div
                className={cn(
                  'flex gap-1.5 text-[11px] leading-snug',
                  included ? 'text-deep' : 'text-muted/70',
                )}
              >
                {included ? (
                  <Check className="mt-0.5 size-3 shrink-0 text-teal" aria-hidden />
                ) : (
                  <X className="mt-0.5 size-3 shrink-0 text-mist" aria-hidden />
                )}
                <span>
                  {feature.id}. {t(`tariff.${feature.key}`)}
                </span>
              </div>
              {feature.children?.length ? (
                <ul className="mt-0.5 ml-5 space-y-0.5">
                  {feature.children.map((child) => (
                    <li
                      key={child}
                      className={cn(
                        'text-[10px] leading-snug',
                        included ? 'text-muted' : 'text-muted/60',
                      )}
                    >
                      — {t(`tariff.${child}`)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
