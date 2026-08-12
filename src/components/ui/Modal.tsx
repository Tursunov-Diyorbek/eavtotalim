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
}

/** Oddiy overlay modal — `document.body` ga portal (transform/overflow ichida buzilmasin). */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  sizeClassName = 'max-w-2xl',
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
      <button
        type="button"
        className="absolute inset-0 bg-deep/45 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 flex max-h-[min(90svh,720px)] w-full flex-col overflow-hidden rounded-xl border border-mist/80 bg-white shadow-[0_20px_50px_rgba(15,36,48,0.22)]',
          sizeClassName,
          className,
        )}
      >
        <div className="flex items-center gap-2 border-b border-mist/70 px-3 py-2.5 sm:px-4">
          <div className="font-display min-w-0 flex-1 truncate text-sm font-semibold text-deep">
            {title}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
