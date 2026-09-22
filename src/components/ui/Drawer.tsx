import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

export type DrawerSide = 'right' | 'left'

type DrawerProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  side?: DrawerSide
  /** Panel kengligi, default max-w-md */
  widthClassName?: string
  className?: string
  bodyClassName?: string
  dismissible?: boolean
  hideHeader?: boolean
}

/** Yon panelli drawer — `document.body` ga portal. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  widthClassName = 'max-w-md',
  className,
  bodyClassName,
  dismissible = true,
  hideHeader = false,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, dismissible, onClose])

  if (!open || typeof document === 'undefined') return null

  const fromRight = side === 'right'

  return createPortal(
    <div className="fixed inset-0 z-100 flex">
      {dismissible ? (
        <button
          type="button"
          className="absolute inset-0 z-0 animate-[fade-in_0.2s_ease] bg-deep/40 backdrop-blur-[3px]"
          aria-label="Close"
          onClick={onClose}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-deep/40 backdrop-blur-[3px]" />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 flex h-full w-full flex-col overflow-hidden bg-white',
          fromRight
            ? 'ml-auto animate-[drawer-in-right_0.3s_cubic-bezier(0.22,1,0.36,1)] border-l border-mist/80 shadow-[-16px_0_48px_rgba(15,36,48,0.2)]'
            : 'mr-auto animate-[drawer-in-left_0.3s_cubic-bezier(0.22,1,0.36,1)] border-r border-mist/80 shadow-[16px_0_48px_rgba(15,36,48,0.2)]',
          widthClassName,
          className,
        )}
      >
        {!hideHeader ? (
          <div className="flex shrink-0 items-center gap-2 border-b border-mist/70 px-4 py-3">
            <div className="font-display min-w-0 flex-1 text-[15px] font-semibold tracking-tight text-deep">
              {title}
            </div>
            {dismissible ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto',
            bodyClassName ?? 'px-4 py-4',
          )}
        >
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-mist/70 bg-fog/50 px-4 py-3">
            {footer}
          </div>
        ) : null}
      </aside>
    </div>,
    document.body,
  )
}
