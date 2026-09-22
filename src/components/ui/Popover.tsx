import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export type PopoverAlign = 'start' | 'center' | 'end'

type PopoverProps = {
  /** Sarlavha — kichik uppercase qator */
  title?: ReactNode
  content: ReactNode
  align?: PopoverAlign
  /** Yuqoriga ochilsin (default: pastga) */
  side?: 'top' | 'bottom'
  widthClassName?: string
  className?: string
  children: ReactNode
}

const GAP = 8
const EDGE = 8

/** Hover / fokusda ochiladigan ma’lumot oynasi (eski Ant Popover o‘rnida). */
export function Popover({
  title,
  content,
  align = 'start',
  side = 'bottom',
  widthClassName = 'w-60',
  className,
  children,
}: PopoverProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const place = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const r = trigger.getBoundingClientRect()
    const width = panelRef.current?.offsetWidth ?? 240
    const height = panelRef.current?.offsetHeight ?? 0

    let left = r.left
    if (align === 'center') left = r.left + r.width / 2 - width / 2
    if (align === 'end') left = r.right - width
    left = Math.min(
      Math.max(left, EDGE),
      Math.max(EDGE, window.innerWidth - width - EDGE),
    )

    let top = side === 'bottom' ? r.bottom + GAP : r.top - height - GAP
    if (top < EDGE) top = r.bottom + GAP
    if (top + height > window.innerHeight - EDGE && side === 'bottom') {
      top = Math.max(EDGE, r.top - height - GAP)
    }

    setPos({ top, left })
  }, [align, side])

  const show = () => {
    window.clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const hide = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const handle = () => place()
    window.addEventListener('scroll', handle, true)
    window.addEventListener('resize', handle)
    return () => {
      window.removeEventListener('scroll', handle, true)
      window.removeEventListener('resize', handle)
    }
  }, [open, place])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  return (
    <div
      ref={triggerRef}
      className={cn('inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <div tabIndex={0} className="inline-flex w-full min-w-0 cursor-pointer outline-none">
        {children}
      </div>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              role="tooltip"
              onMouseEnter={show}
              onMouseLeave={hide}
              style={{ top: pos.top, left: pos.left }}
              className={cn(
                'fixed z-100 rounded-xl border border-mist/80 bg-white p-3 text-left shadow-[0_16px_40px_rgba(15,36,48,0.16)]',
                widthClassName,
              )}
            >
              {title ? (
                <p className="mb-2 border-b border-mist/60 pb-1.5 text-[11px] font-bold tracking-wide text-deep uppercase">
                  {title}
                </p>
              ) : null}
              <div className="space-y-1.5 text-[12px] text-deep">{content}</div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

/** Popover ichidagi bitta qator: «Nomi: Bionet». */
export function PopoverRow({
  label,
  children,
}: {
  label: ReactNode
  children: ReactNode
}) {
  return (
    <p>
      <span className="mr-1 text-muted">{label}:</span>
      {children}
    </p>
  )
}
