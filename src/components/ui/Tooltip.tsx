import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

type TooltipProps = {
  /** Bo‘sh bo‘lsa — tooltip chiqmaydi, faqat children */
  content?: ReactNode
  side?: TooltipSide
  className?: string
  children: ReactNode
}

const GAP = 8
const EDGE = 8
const ARROW = 6

type Placed = {
  top: number
  left: number
  side: TooltipSide
  /** Strelka offset — trigger markaziga nisbatan */
  arrowTop?: number
  arrowLeft?: number
}

/** Qisqa hover izoh (eski Ant Tooltip — qora bubble + strelka). */
export function Tooltip({
  content,
  side = 'top',
  className,
  children,
}: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLSpanElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Placed>({ top: 0, left: 0, side })

  const place = useCallback(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger) return
    const r = trigger.getBoundingClientRect()
    const width = panel?.offsetWidth ?? 200
    const height = panel?.offsetHeight ?? 36
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2

    let placed: TooltipSide = side
    let top = 0
    let left = 0

    const tryLeft = () => {
      left = r.left - width - GAP
      top = cy - height / 2
      return left >= EDGE
    }
    const tryRight = () => {
      left = r.right + GAP
      top = cy - height / 2
      return left + width <= window.innerWidth - EDGE
    }
    const tryTop = () => {
      top = r.top - height - GAP
      left = cx - width / 2
      return top >= EDGE
    }
    const tryBottom = () => {
      top = r.bottom + GAP
      left = cx - width / 2
      return top + height <= window.innerHeight - EDGE
    }

    if (side === 'left') {
      if (!tryLeft()) {
        if (tryRight()) placed = 'right'
        else if (tryTop()) placed = 'top'
        else {
          tryBottom()
          placed = 'bottom'
        }
      }
    } else if (side === 'right') {
      if (!tryRight()) {
        if (tryLeft()) placed = 'left'
        else if (tryTop()) placed = 'top'
        else {
          tryBottom()
          placed = 'bottom'
        }
      }
    } else if (side === 'top') {
      if (!tryTop()) {
        if (tryBottom()) placed = 'bottom'
        else if (tryLeft()) placed = 'left'
        else {
          tryRight()
          placed = 'right'
        }
      }
    } else {
      if (!tryBottom()) {
        if (tryTop()) placed = 'top'
        else if (tryLeft()) placed = 'left'
        else {
          tryRight()
          placed = 'right'
        }
      }
    }

    top = Math.min(
      Math.max(top, EDGE),
      Math.max(EDGE, window.innerHeight - height - EDGE),
    )
    left = Math.min(
      Math.max(left, EDGE),
      Math.max(EDGE, window.innerWidth - width - EDGE),
    )

    const next: Placed = { top, left, side: placed }
    if (placed === 'left' || placed === 'right') {
      next.arrowTop = Math.min(
        Math.max(cy - top, ARROW + 4),
        height - ARROW - 4,
      )
    } else {
      next.arrowLeft = Math.min(
        Math.max(cx - left, ARROW + 4),
        width - ARROW - 4,
      )
    }
    setPos(next)
  }, [side])

  const show = () => {
    if (content == null || content === false || content === '') return
    window.clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const hide = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 80)
  }

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place, content])

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

  if (content == null || content === false || content === '') {
    return <>{children}</>
  }

  const arrowStyle: CSSProperties =
    pos.side === 'left' || pos.side === 'right'
      ? { top: pos.arrowTop }
      : { left: pos.arrowLeft }

  return (
    <span
      ref={triggerRef}
      className={cn('inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open
        ? createPortal(
            <span
              ref={panelRef}
              role="tooltip"
              style={{ top: pos.top, left: pos.left }}
              className="pointer-events-none fixed z-100 max-w-xs rounded-md bg-[#334155] px-2.5 py-1.5 text-left text-[12px] leading-snug whitespace-normal text-white shadow-[0_8px_20px_rgba(15,36,48,0.28)]"
            >
              {content}
              <span
                aria-hidden
                style={arrowStyle}
                className={cn(
                  'absolute size-0 border-[6px] border-transparent',
                  pos.side === 'left' &&
                    'top-0 right-0 translate-x-full -translate-y-1/2 border-l-[#334155]',
                  pos.side === 'right' &&
                    'top-0 left-0 -translate-x-full -translate-y-1/2 border-r-[#334155]',
                  pos.side === 'top' &&
                    'top-full left-0 -translate-x-1/2 border-t-[#334155]',
                  pos.side === 'bottom' &&
                    'bottom-full left-0 -translate-x-1/2 border-b-[#334155]',
                )}
              />
            </span>,
            document.body,
          )
        : null}
    </span>
  )
}
