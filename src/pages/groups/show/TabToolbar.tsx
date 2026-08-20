import type { ReactNode } from 'react'

type TabToolbarProps = {
  title: string
  actions?: ReactNode
}

/** Tab ichidagi sarlavha + o‘ng tomondagi amallar (EXPORT, qo‘shish). */
export function TabToolbar({ title, actions }: TabToolbarProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-deep">
        {title}
      </h2>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
