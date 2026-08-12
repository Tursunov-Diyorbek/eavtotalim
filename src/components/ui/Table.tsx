import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Panel } from './Panel'

type TableProps = HTMLAttributes<HTMLTableElement> & {
  /** Panel ichida (default true) */
  bordered?: boolean
}

export function Table({ className, bordered = true, ...props }: TableProps) {
  const table = (
    <div className="w-full overflow-x-auto">
      <table
        className={cn('w-full min-w-[480px] border-collapse text-left text-sm', className)}
        {...props}
      />
    </div>
  )

  if (!bordered) return table
  return <Panel>{table}</Panel>
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('border-b border-mist/70 bg-fog/60 text-[12px] text-muted', className)}
      {...props}
    />
  )
}

export function TBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-mist/60', className)} {...props} />
}

export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('transition hover:bg-fog/40', className)} {...props} />
  )
}

export function TH({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('px-3 py-2.5 font-semibold tracking-wide', className)}
      {...props}
    />
  )
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-3 py-2.5 text-ink', className)} {...props} />
}
