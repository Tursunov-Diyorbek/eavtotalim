import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type PageMainProps = {
  children: ReactNode
  className?: string
  /** List pages: table fills the canvas under the page header. */
  fill?: boolean
  /** false — sahifa balandligi ekranda qoladi, asosiy scroll yo‘q. */
  scroll?: boolean
}

/** Content area under `Header` — remaining shell height. */
export function PageMain({ children, className, fill = false, scroll = true }: PageMainProps) {
  return (
    <main
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-4',
        fill && scroll && 'page-fill',
        scroll ? 'gap-3 overflow-y-auto' : 'gap-2 overflow-hidden',
        scroll && !fill && '[&>*]:shrink-0',
        className,
      )}
    >
      {children}
    </main>
  )
}
