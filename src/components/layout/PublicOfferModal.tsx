import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, LottiePlayer, Modal, notify } from '@/components/ui'
import { lottieAnimations } from '@/assets/lottie'
import { useAuth } from '@/features/auth'
import {
  useAcceptPublicOfferMutation,
  useLatestPublicOfferQuery,
} from '@/features/public-offer'
import { cn } from '@/lib'

function sanitizeOfferHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<a\b/gi, '<a target="_blank" rel="noreferrer"')
}

/** Qabul qilinmagan ommaviy oferta — eski ActivePublicOfferModal. */
export function PublicOfferModal() {
  const { t } = useTranslation()
  const { me } = useAuth()
  const query = useLatestPublicOfferQuery()
  const accept = useAcceptPublicOfferMutation()
  const offer = query.data
  const scroller = useRef<HTMLDivElement>(null)
  const [read, setRead] = useState(false)
  const [progress, setProgress] = useState(0)

  const organizationId =
    me?.profession?.organization?.id ??
    me?.profession?.organization_id ??
    me?.organization_id ??
    null

  useEffect(() => {
    setRead(false)
    setProgress(0)
    const el = scroller.current
    if (!offer || !el) return

    const check = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max <= 0 ? 1 : Math.min(1, el.scrollTop / max))
      setRead(max - el.scrollTop <= 12)
    }

    check()
    el.addEventListener('scroll', check)
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', check)
      observer.disconnect()
    }
  }, [offer?.id, offer?.body])

  async function onAccept() {
    if (!offer) return
    try {
      await accept.mutateAsync({ id: offer.id, organizationId })
      notify.success(t('publicOffer.accepted'))
    } catch {
      notify.error(t('publicOffer.error'))
    }
  }

  return (
    <Modal
      open={Boolean(offer)}
      onClose={() => undefined}
      dismissible={false}
      hideHeader
      sizeClassName="max-w-xl"
      maxHeightClassName="max-h-[min(82svh,680px)]"
      bodyClassName="flex flex-col overflow-hidden p-0"
    >
      <div className="flex items-center gap-3 border-b border-mist/70 px-4 py-3">
        <LottiePlayer
          animationData={lottieAnimations.newMessage}
          size={56}
          play={Boolean(offer)}
          className="-my-1"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted">{t('publicOffer.label')}</p>
          <p className="truncate text-[15px] font-semibold text-deep">
            {offer?.title || t('publicOffer.label')}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!read || accept.isPending}
          loading={accept.isPending}
          className="!bg-teal !text-white !shadow-none hover:!bg-teal/90"
          onClick={() => void onAccept()}
        >
          {t('publicOffer.accept')}
        </Button>
      </div>
      <div className="h-0.5 bg-fog" aria-hidden>
        <div
          className="h-full bg-teal transition-[width]"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div
          className={cn(
            'text-[13px] leading-relaxed text-ink',
            '[&_a]:font-medium [&_a]:text-signal [&_a]:underline',
            '[&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
          )}
          dangerouslySetInnerHTML={{
            __html: sanitizeOfferHtml(offer?.body ?? ''),
          }}
        />
      </div>
      {!read ? (
        <p className="border-t border-mist/70 px-4 py-2.5 text-center text-[12px] text-muted">
          {t('publicOffer.scrollHint')}
        </p>
      ) : null}
    </Modal>
  )
}
