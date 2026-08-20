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
    <header className="flex min-h-11 shrink-0 items-center gap-3 border-b border-mist/70 bg-white/70 px-4 py-2 sm:px-5">
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
      <h2
        className={
          onBack || actions
            ? 'font-display min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight text-deep sm:text-base'
            : 'font-display shrink-0 text-[15px] font-semibold tracking-tight text-deep sm:text-base'
        }
      >
        {title}
      </h2>
      {description ? (
        <p className="hidden min-w-0 truncate text-xs text-muted sm:block">
          {description}
        </p>
      ) : null}
      {actions ? (
        <div className="ml-auto flex min-w-0 shrink-0 items-end gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
