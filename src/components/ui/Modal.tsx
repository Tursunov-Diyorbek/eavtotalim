import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  className?: string
  /** max width class, default max-w-2xl */
  sizeClassName?: string
  /** max height class, default max-h-[min(90svh,720px)] */
  maxHeightClassName?: string
  /** false — fon va X yopilmaydi (majburiy harakat) */
  dismissible?: boolean
  closeClassName?: string
  footer?: ReactNode
  /** Sarlavha va yopish tugmasi orasida (masalan, tashqi link). */
  headerExtra?: ReactNode
  /** Kontent padding o‘rniga; iframe/full-bleed uchun `overflow-hidden p-0`. */
  bodyClassName?: string
}

/** Oddiy overlay modal — `document.body` ga portal (transform/overflow ichida buzilmasin). */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  sizeClassName = 'max-w-2xl',
  maxHeightClassName = 'max-h-[min(90svh,720px)]',
  dismissible = true,
  closeClassName,
  footer,
  headerExtra,
  bodyClassName,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6">
      {dismissible ? (
        <button
          type="button"
          className="absolute inset-0 z-0 bg-deep/45 backdrop-blur-[2px]"
          aria-label="Close"
          onClick={onClose}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-deep/45 backdrop-blur-[2px]" />
      )}
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          'relative z-10 flex w-full flex-col overflow-hidden rounded-xl border border-mist/80 bg-white shadow-[0_20px_50px_rgba(15,36,48,0.22)]',
          maxHeightClassName,
          sizeClassName,
          className,
        )}
      >
        <div className="flex items-center gap-2 border-b border-mist/70 px-3 py-2.5 sm:px-4">
          <div className="font-display min-w-0 flex-1 truncate text-sm font-semibold text-deep">
            {title}
          </div>
          {headerExtra}
          {dismissible ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className={closeClassName}
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
        <div
          className={cn(
            'min-h-0 flex-1',
            bodyClassName ?? 'overflow-y-auto px-3 py-3 sm:px-4 sm:py-4',
          )}
        >
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-mist/70 px-3 py-3 sm:px-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
