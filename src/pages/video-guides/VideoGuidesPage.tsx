import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Play, Send } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { Button, Tooltip } from '@/components/ui'
import { cn } from '@/lib/cn'
import { GUIDE_MODULES, GUIDE_TELEGRAM } from './catalog'

export function VideoGuidesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Header
        title={t('nav.videoGuides')}
        actions={
          <Tooltip content={t('videoGuidesPage.telegramHint')}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.open(GUIDE_TELEGRAM, '_blank', 'noopener,noreferrer')}
            >
              <Send className="size-3.5" aria-hidden />
              {t('videoGuidesPage.telegram')}
            </Button>
          </Tooltip>
        }
      />
      <PageMain>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {GUIDE_MODULES.map((card) => {
            const open = Boolean(card.to && card.count > 0)
            const body = (
              <>
                <div className="flex items-center gap-1.5">
                  <Play className="size-3.5 shrink-0 fill-current" aria-hidden />
                  <span className="truncate text-[13px] font-semibold" title={t(card.titleKey)}>
                    {t(card.titleKey)}
                  </span>
                </div>
                <span
                  className={cn(
                    'grid size-11 place-items-center rounded-2xl',
                    open ? 'bg-white text-teal shadow-sm' : 'bg-white/70 text-slate',
                  )}
                >
                  <Play className="size-5 fill-current" aria-hidden />
                </span>
                <p className="text-xs font-semibold">
                  {t('videoGuidesPage.count', { count: card.count })}
                </p>
              </>
            )
            const className = cn(
              'flex h-[148px] flex-col items-start justify-between rounded-xl border p-3 text-left transition',
              open
                ? 'border-teal/25 bg-teal-soft/70 text-deep hover:-translate-y-0.5 hover:border-teal hover:shadow-[0_10px_24px_rgba(15,118,110,0.12)]'
                : 'cursor-default border-mist/80 bg-fog/80 text-slate',
            )

            if (!open || !card.to) {
              return (
                <div key={card.id} className={className} aria-disabled>
                  {body}
                </div>
              )
            }

            return (
              <Link key={card.id} to={card.to} className={className}>
                {body}
              </Link>
            )
          })}
        </div>
      </PageMain>
    </>
  )
}
