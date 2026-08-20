import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type PageMainProps = {
  children: ReactNode
  className?: string
  /** List pages: table fills the canvas under the page header. */
  fill?: boolean
}

/** Content area under `Header` — remaining shell height. */
export function PageMain({ children, className, fill = false }: PageMainProps) {
  return (
    <main
      className={cn(
        'flex min-h-0 flex-1 flex-col p-3 sm:p-4',
        fill ? 'page-fill gap-3 overflow-hidden' : 'gap-3 overflow-y-auto',
        className,
      )}
    >
      {children}
    </main>
  )
}
