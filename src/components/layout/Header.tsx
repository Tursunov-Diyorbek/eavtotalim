import type { ReactNode } from 'react'

type HeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

/** Compact page header — kam joy, ko‘proq kontent. */
export function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="flex min-h-11 items-center gap-3 border-b border-mist/70 bg-white/70 px-4 py-2 sm:px-5">
      <span
        className="h-4 w-1 shrink-0 rounded-full bg-linear-to-b from-signal to-violet"
        aria-hidden
      />
      <h2 className="font-display shrink-0 text-[15px] font-semibold tracking-tight text-deep sm:text-base">
        {title}
      </h2>
      {description ? (
        <p className="hidden min-w-0 truncate text-xs text-muted sm:block">
          {description}
        </p>
      ) : null}
      {actions ? <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  )
}
