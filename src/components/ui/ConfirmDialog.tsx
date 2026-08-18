import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { Modal } from './Modal'

export type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  /** Qo‘shimcha izoh (nom). Asosiy savol doim `common.reallyConfirm`. */
  description?: string
  confirmLabel?: string
  loading?: boolean
}

/** O‘chirish va boshqa xavfli amallar — doim «Haqiqatdan tasdiqlaysizmi?» */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  loading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? t('common.delete')}
      sizeClassName="max-w-md"
      dismissible={!loading}
    >
      <p className="text-sm font-semibold text-deep">
        {t('common.reallyConfirm')}
      </p>
      {description ? (
        <p className="mt-2 text-sm text-muted">{description}</p>
      ) : null}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={loading} onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="danger"
          size="sm"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel ?? t('common.delete')}
        </Button>
      </div>
    </Modal>
  )
}
