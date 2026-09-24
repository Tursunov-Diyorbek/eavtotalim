import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentProps,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'
import { useLocation } from 'react-router-dom'
import { ColumnVisibility, type ColumnVisibilityItem } from './ColumnVisibility'
import { EmptyState } from './EmptyState'
import { Panel } from './Panel'
import { SearchInput } from './SearchInput'

const STORAGE_PREFIX = 'column_visibility:'

type TableColumnsCtx = {
  register: (id: string, label: string) => void
  isHidden: (id: string | undefined) => boolean
}

const TableColumnsContext = createContext<TableColumnsCtx | null>(null)

function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node).trim()
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const text = extractText(child)
      if (text) return text
    }
    return ''
  }
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children)
  }
  return ''
}

function loadVisibility(
  storageKey: string,
  ids: string[],
): Record<string, boolean> {
  const defaults = Object.fromEntries(ids.map((id) => [id, true]))
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Record<string, boolean>
    if (!parsed || typeof parsed !== 'object') return defaults
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

function saveVisibility(storageKey: string, next: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(next))
  } catch {
    // ignore quota
  }
}

type TableProps = HTMLAttributes<HTMLTableElement> & {
  /** Panel ichida (default true) */
  bordered?: boolean
  /** localStorage kaliti; bo‘lmasa ustun id laridan */
  storageKey?: string
  /** default true — har jadvalda «Ustunlar» */
  columnToggle?: boolean
  /**
   * `true` (default) — list sahifa: qolgan balandlikni to‘ldiradi.
   * `false` — kontent balandligi (kam qator / tab ichida).
   */
  fill?: boolean
  /** «Ustunlar» bilan bir qator (o‘ngda) — AddButton va h.k. */
  toolbar?: ReactNode
}

export function Table({
  className,
  bordered = true,
  storageKey,
  columnToggle = true,
  fill = true,
  toolbar,
  children,
  ...props
}: TableProps) {
  const autoId = useId()
  const { pathname } = useLocation()
  const [columns, setColumns] = useState<ColumnVisibilityItem[]>([])
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})

  const resolvedKey =
    storageKey ||
    (columns.length
      ? `${pathname}:${columns.map((c) => c.label).join('|')}`
      : autoId)

  const register = useCallback((id: string, label: string) => {
    setColumns((prev) => {
      const index = prev.findIndex((col) => col.id === id)
      if (index >= 0) {
        if (prev[index].label === label) return prev
        const next = [...prev]
        next[index] = { id, label }
        return next
      }
      return [...prev, { id, label }]
    })
  }, [])

  const columnIds = columns.map((c) => c.id).join('|')

  useLayoutEffect(() => {
    if (!columns.length) return
    const ids = columns.map((c) => c.id)
    const frame = window.requestAnimationFrame(() => {
      setVisibility(loadVisibility(resolvedKey, ids))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [columnIds, resolvedKey, columns])

  const persist = useCallback(
    (next: Record<string, boolean>) => {
      setVisibility(next)
      saveVisibility(resolvedKey, next)
    },
    [resolvedKey],
  )

  const isHidden = useCallback(
    (id: string | undefined) => (id ? visibility[id] === false : false),
    [visibility],
  )

  const ctx = useMemo<TableColumnsCtx>(
    () => ({ register, isHidden }),
    [register, isHidden],
  )

  const table = (
    <div
      className={cn(
        fill ? 'min-h-0 flex-1 overflow-auto' : 'overflow-x-auto',
      )}
    >
      <table
        className={cn('w-full min-w-[480px] border-collapse text-left text-sm', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )

  return (
    <TableColumnsContext.Provider value={ctx}>
      <div
        className={cn(
          'flex min-w-0 flex-col gap-2',
          fill ? 'min-h-0 flex-1' : 'w-full shrink-0',
        )}
      >
        {(columnToggle && columns.length > 0) || toolbar ? (
          <div className="flex shrink-0 flex-wrap items-end justify-between gap-2">
            <div className="min-w-0">
              {columnToggle && columns.length > 0 ? (
                <ColumnVisibility
                  columns={columns}
                  visibility={visibility}
                  onChange={persist}
                  onReset={() => {
                    try {
                      localStorage.removeItem(STORAGE_PREFIX + resolvedKey)
                    } catch {
                      // ignore
                    }
                    persist(
                      Object.fromEntries(columns.map((col) => [col.id, true])),
                    )
                  }}
                />
              ) : null}
            </div>
            {toolbar ? (
              <div className="flex flex-wrap items-end gap-2">{toolbar}</div>
            ) : null}
          </div>
        ) : null}
        {bordered ? (
          <Panel
            className={cn(
              'flex flex-col overflow-hidden',
              fill ? 'min-h-0 flex-1' : 'w-full',
            )}
          >
            {table}
          </Panel>
        ) : (
          table
        )}
      </div>
    </TableColumnsContext.Provider>
  )
}

type TRProps = HTMLAttributes<HTMLTableRowElement> & {
  /** `head` / `filter` — THead o‘zi belgilaydi. */
  variant?: 'body' | 'head' | 'filter'
}

export function THead({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  const rows = Children.toArray(children)
  return (
    <thead
      className={cn(
        'sticky top-0 z-10 border-b border-mist/70 bg-fog/95 text-[12px] text-muted',
        className,
      )}
      {...props}
    >
      {rows.map((child, index) => {
        if (!isValidElement<TRProps>(child)) return child
        return cloneElement(child, {
          key: child.key ?? `thead-${index}`,
          variant: child.props.variant ?? (index === 0 ? 'head' : 'filter'),
        })
      })}
    </thead>
  )
}

export function TBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-mist/60', className)} {...props} />
}

type CellExtra = {
  column?: string
  columnLabel?: string
  /** Filter-row cells: do not overwrite ColumnVisibility labels from controls. */
  registerColumn?: boolean
}

export function TR({
  className,
  children,
  variant = 'body',
  ...props
}: TRProps) {
  const cells = Children.toArray(children)
  return (
    <tr
      className={cn(
        'transition',
        variant === 'body' && 'hover:bg-fog/40',
        (variant === 'head' || variant === 'filter') && 'hover:bg-transparent',
        variant === 'filter' && 'bg-white',
        className,
      )}
      {...props}
    >
      {cells.map((child, index) => {
        if (!isValidElement(child)) return child
        const extra = child.props as CellExtra
        const id = extra.column ?? `col-${index}`
        return cloneElement(child as ReactElement<CellExtra>, { column: id })
      })}
    </tr>
  )
}

/** Sarlavha qatori. THead ichida `<TR>` ham shu. */
export function HeaderTR({ variant: _variant, ...props }: TRProps) {
  return <TR variant="head" {...props} />
}

/** Ustun filter qatori (`FilterTH`). THead 2-qator ham shu. */
export function FilterTR({ variant: _variant, ...props }: TRProps) {
  return <TR variant="filter" {...props} />
}

export function FilterTH({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & CellExtra) {
  return (
    <TH
      registerColumn={false}
      className={cn('align-top font-normal!', className)}
      {...props}
    />
  )
}

/** Jadval filter qidiruvi — doim `SearchInput size="sm"`. */
export function TableSearch({
  size = 'sm',
  ...props
}: ComponentProps<typeof SearchInput>) {
  return <SearchInput size={size} {...props} />
}

/** Bo‘sh jadval — `EmptyState` qayta yozilmasin. */
export function EmptyTR({
  colSpan,
  description,
  compact = false,
  plain = false,
}: {
  colSpan: number
  description?: ReactNode
  compact?: boolean
  /** Jadval ichida faqat matn — ikonkasiz qisqa qator */
  plain?: boolean
}) {
  if (plain) {
    return (
      <tr>
        <td className="px-2 py-2 text-center text-[13px] text-muted" colSpan={colSpan}>
          {description}
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className={compact ? 'px-2 py-1 text-center' : 'px-3 py-6 text-center'} colSpan={colSpan}>
        <EmptyState
          compact={compact}
          className="border-0 bg-transparent bg-none shadow-none ring-0"
          description={description}
        />
      </td>
    </tr>
  )
}

export function TH({
  className,
  column,
  columnLabel,
  registerColumn = true,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & CellExtra) {
  const ctx = useContext(TableColumnsContext)
  const register = ctx?.register
  const label = columnLabel || extractText(children) || column || ''

  useLayoutEffect(() => {
    if (column && register && registerColumn) register(column, label)
  }, [column, label, register, registerColumn])

  return (
    <th
      className={cn(
        'px-3 py-2.5 font-semibold tracking-wide',
        ctx?.isHidden(column) && 'hidden',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TD({
  className,
  column,
  columnLabel: _columnLabel,
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & CellExtra) {
  const ctx = useContext(TableColumnsContext)
  return (
    <td
      className={cn(
        'px-3 py-2.5 text-ink',
        ctx?.isHidden(column) && 'hidden',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  )
}
