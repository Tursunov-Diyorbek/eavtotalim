import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Eye, FileSpreadsheet, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { Button } from './Button'

type IconActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

/** Jadval «ko‘rish» — doim shu. */
export function ShowButton({ className, ...props }: IconActionProps) {
  const { t } = useTranslation()
  return (
    <Button
      variant="soft"
      size="icon-sm"
      aria-label={t('common.view')}
      className={className}
      {...props}
    >
      <Eye className="size-3.5" aria-hidden />
    </Button>
  )
}

/** Jadval «tahrirlash» — doim shu. */
export function EditButton({ className, ...props }: IconActionProps) {
  const { t } = useTranslation()
  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={t('common.edit')}
      className={className}
      {...props}
    >
      <Pencil className="size-3.5" aria-hidden />
    </Button>
  )
}

/** Jadval «o‘chirish» — doim shu. O‘chirish `ConfirmDialog` orqali. */
export function DeleteButton({ className, ...props }: IconActionProps) {
  const { t } = useTranslation()
  return (
    <Button
      variant="danger"
      size="icon-sm"
      aria-label={t('common.delete')}
      className={className}
      {...props}
    >
      <Trash2 className="size-3.5" aria-hidden />
    </Button>
  )
}

type ExportButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode
}

/**
 * Header / toolbar EXPORT — `SearchInput` bilan bir xil `h-9` outline.
 * Matn: `EXPORT (.XLS)`.
 */
export function ExportButton({ children, className, ...props }: ExportButtonProps) {
  const { t } = useTranslation()
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        'shrink-0 border-mist/90 shadow-none',
        className,
      )}
      {...props}
    >
      <FileSpreadsheet className="size-3.5" aria-hidden />
      {children ?? t('common.exportXls')}
    </Button>
  )
}

/** Header «+ Qo'shish» — qidiruv bilan bir xil `h-9`, pill. */
export function AddButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <Button
      variant="primary"
      size="sm"
      className={cn('shrink-0 rounded-full px-3.5', className)}
      {...props}
    >
      <Plus className="size-3.5" aria-hidden />
      {children ?? t('common.add')}
    </Button>
  )
}

/** Jadval amallar ustuni — show / edit / delete yonma-yon. */
export function RowActions({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('flex items-center gap-1', className)}>{children}</div>
}
