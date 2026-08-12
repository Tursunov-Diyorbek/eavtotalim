import type { HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

type ErrorMessageProps = HTMLAttributes<HTMLParagraphElement> & {
  /** true bo‘lsa common.loadError */
  fallback?: boolean
}

export function ErrorMessage({
  children,
  fallback = true,
  className,
  ...props
}: ErrorMessageProps) {
  const { t } = useTranslation()
  const text = children ?? (fallback ? t('common.loadError') : null)
  if (!text) return null

  return (
    <p className={cn('text-sm text-rose', className)} {...props}>
      {text}
    </p>
  )
}
