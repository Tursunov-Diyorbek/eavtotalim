import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

type HeaderProps = {
  title: ReactNode
  description?: string
  actions?: ReactNode
  onBack?: () => void
}

/** Compact page header — kam joy, ko‘proq kontent. */
export function Header({ title, description, actions, onBack }: HeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-mist/70 bg-white/70 px-4 py-2 sm:px-5">
      <div className="flex min-w-[12rem] flex-1 items-center gap-3">
        {onBack ? (
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            onClick={onBack}
            aria-label={t('common.back')}
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
        ) : (
          <span
            className="h-4 w-1 shrink-0 rounded-full bg-linear-to-b from-signal to-violet"
            aria-hidden
          />
        )}
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="font-display flex min-w-0 items-baseline gap-2 text-[15px] font-semibold tracking-tight text-deep sm:text-base">
            {title}
          </h2>
          {description ? (
            <p className="min-w-0 truncate text-sm text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
