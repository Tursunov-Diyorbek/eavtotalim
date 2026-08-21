import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleAlert } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { TARIFF_TELEGRAM } from '@/config/tariffPlans'

/** Eski InfoContactCard — chop etish xatoligi Telegram orqali. */
export function PrintErrorHint() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        title={t('documentsPage.printHintTooltip')}
        aria-label={t('documentsPage.printHintTooltip')}
        onClick={() => setOpen(true)}
      >
        <CircleAlert className="size-4 text-amber" aria-hidden />
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title=" "
        sizeClassName="max-w-md"
        closeClassName="text-rose hover:bg-rose-soft"
        bodyClassName="overflow-y-auto px-4 py-5"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-signal-soft text-signal">
            <CircleAlert className="size-7" aria-hidden />
          </span>
          <p className="text-[15px] text-deep">{t('documentsPage.printHint')}</p>
          <Button
            variant="primary"
            onClick={() =>
              window.open(TARIFF_TELEGRAM, '_blank', 'noopener,noreferrer')
            }
          >
            {t('documentsPage.printHintTelegram')}
          </Button>
        </div>
      </Modal>
    </>
  )
}
