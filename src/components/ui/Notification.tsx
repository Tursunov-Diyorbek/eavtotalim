import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/cn'

export type NotificationTone = 'success' | 'error' | 'info' | 'warning'

type ToastItem = {
  id: string
  tone: NotificationTone
  message: ReactNode
  duration: number
}

type NotifyOptions = {
  duration?: number
}

type NotifyApi = {
  success: (message: ReactNode, opts?: NotifyOptions) => string
  error: (message: ReactNode, opts?: NotifyOptions) => string
  info: (message: ReactNode, opts?: NotifyOptions) => string
  warning: (message: ReactNode, opts?: NotifyOptions) => string
  dismiss: (id: string) => void
}

const DEFAULT_DURATION = 3800

const toneStyles: Record<
  NotificationTone,
  { box: string; icon: string; Icon: typeof Info }
> = {
  success: {
    box: 'border-teal/30 bg-teal-soft/50 text-deep',
    icon: 'text-teal',
    Icon: CheckCircle2,
  },
  error: {
    box: 'border-rose/30 bg-rose-soft/50 text-deep',
    icon: 'text-rose',
    Icon: XCircle,
  },
  info: {
    box: 'border-signal/25 bg-signal-soft/40 text-deep',
    icon: 'text-signal',
    Icon: Info,
  },
  warning: {
    box: 'border-amber/30 bg-amber-soft/50 text-deep',
    icon: 'text-amber',
    Icon: AlertTriangle,
  },
}

type InlineProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    tone?: NotificationTone
    title?: ReactNode
    /** Toast ichida yashirin; inline da ixtiyoriy yopish */
    onClose?: () => void
  }
>

/** Sahifa ichidagi banner (hint / ogohlantirish). */
export function Notification({
  tone = 'info',
  title,
  onClose,
  className,
  children,
  ...props
}: InlineProps) {
  const { box, icon, Icon } = toneStyles[tone]

  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={cn(
        'flex gap-2.5 rounded-xl border px-3.5 py-3',
        box,
        className,
      )}
      {...props}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="m-0 font-display text-sm font-semibold text-deep">
            {title}
          </p>
        ) : null}
        {children ? (
          <div
            className={cn(
              'text-[13px] leading-snug text-deep',
              title && 'mt-1 text-muted',
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
      {onClose ? (
        <button
          type="button"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-white/70 hover:text-deep"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}

function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem
  onClose: (id: string) => void
}) {
  const { box, icon, Icon } = toneStyles[item.tone]

  useEffect(() => {
    if (item.duration <= 0) return
    const t = window.setTimeout(() => onClose(item.id), item.duration)
    return () => window.clearTimeout(t)
  }, [item.duration, item.id, onClose])

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-[min(100vw-1.5rem,22rem)] gap-2.5 rounded-xl border px-3.5 py-3 shadow-[0_12px_32px_rgba(15,36,48,0.14)] backdrop-blur-sm',
        box,
      )}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', icon)} aria-hidden />
      <p className="m-0 min-w-0 flex-1 text-[13px] leading-snug font-medium text-deep">
        {item.message}
      </p>
      <button
        type="button"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-white/70 hover:text-deep"
        aria-label="Close"
        onClick={() => onClose(item.id)}
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  )
}

const NotificationContext = createContext<NotifyApi | null>(null)

let notifyBridge: NotifyApi | null = null

function makeId() {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/** Imperative toast — komponentdan tashqarida ham ishlaydi (Provider ichida). */
export const notify: NotifyApi = {
  success: (message, opts) => notifyBridge?.success(message, opts) ?? '',
  error: (message, opts) => notifyBridge?.error(message, opts) ?? '',
  info: (message, opts) => notifyBridge?.info(message, opts) ?? '',
  warning: (message, opts) => notifyBridge?.warning(message, opts) ?? '',
  dismiss: (id) => notifyBridge?.dismiss(id),
}

export function useNotify(): NotifyApi {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotify() NotificationProvider ichida chaqirilishi kerak')
  }
  return ctx
}

export function NotificationProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([])
  const itemsRef = useRef(items)
  itemsRef.current = items

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (tone: NotificationTone, message: ReactNode, opts?: NotifyOptions) => {
      const id = makeId()
      const duration = opts?.duration ?? DEFAULT_DURATION
      setItems((prev) => [...prev, { id, tone, message, duration }].slice(-5))
      return id
    },
    [],
  )

  const api = useMemo<NotifyApi>(
    () => ({
      success: (message, opts) => push('success', message, opts),
      error: (message, opts) => push('error', message, opts),
      info: (message, opts) => push('info', message, opts),
      warning: (message, opts) => push('warning', message, opts),
      dismiss,
    }),
    [dismiss, push],
  )

  useEffect(() => {
    notifyBridge = api
    return () => {
      if (notifyBridge === api) notifyBridge = null
    }
  }, [api])

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-3 z-110 flex flex-col items-center gap-2 px-3 sm:items-end sm:px-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={dismiss} />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
