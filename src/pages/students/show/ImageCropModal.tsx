import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Cropper, { type Area } from 'react-easy-crop'
import { Save, ShieldCheck } from 'lucide-react'
import { Button, Modal, Notification, notify } from '@/components/ui'
import { adaptImageForTurnstile } from '@/api'
import { getCroppedFile } from '@/lib/cropImage'

const ASPECT = 370 / 472
const GATE_REASONS = [
  'RESOLUTION_TOO_LOW',
  'NO_FACE_DETECTED',
  'MULTIPLE_FACES',
  'FACE_TOO_SMALL',
  'TOO_BLURRY',
  'TOO_DARK',
  'TOO_BRIGHT',
  'FACE_NOT_RECOGNIZABLE',
] as const

type ImageCropModalProps = {
  open: boolean
  imageSrc: string | null
  title: string
  onClose: () => void
  onSave: (file: File) => void
  saving?: boolean
  canUseImageGate?: boolean
}

function AcceptableExamples() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-auto w-full max-w-50"
      aria-hidden
    >
      <rect width="200" height="200" fill="#e8f4fb" rx="4" />
      {[
        [6, 6],
        [104, 6],
        [6, 104],
        [104, 104],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect width="90" height="90" fill="#d6ecf7" rx="3" />
          <ellipse cx="45" cy="32" rx="16" ry="18" fill="#6eb3d4" />
          <path
            d="M18 82c2-22 14-34 27-34s25 12 27 34"
            fill="#6eb3d4"
          />
        </g>
      ))}
    </svg>
  )
}

export function ImageCropModal({
  open,
  imageSrc,
  title,
  onClose,
  onSave,
  saving = false,
  canUseImageGate = false,
}: ImageCropModalProps) {
  const { t } = useTranslation()
  const [src, setSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [adaptLoading, setAdaptLoading] = useState(false)
  const [rejection, setRejection] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !imageSrc) return
    setSrc(imageSrc)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setRejection(null)
  }, [open, imageSrc])

  const busy = saving || adaptLoading

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const close = () => {
    if (busy) return
    setSrc(null)
    setRejection(null)
    onClose()
  }

  const reasonLabel = (reason?: string) => {
    if (reason && GATE_REASONS.includes(reason as (typeof GATE_REASONS)[number])) {
      return t(`students.showPage.gateReasons.${reason}`)
    }
    return t('students.showPage.adaptGateRejected')
  }

  const handleAdapt = async () => {
    if (!src || !croppedAreaPixels) {
      notify.warning(t('students.showPage.cropSelectFirst'))
      return
    }
    setAdaptLoading(true)
    setRejection(null)
    try {
      const file = await getCroppedFile(src, croppedAreaPixels)
      const form = new FormData()
      form.append('file', file, 'image.jpg')
      const res = await adaptImageForTurnstile(form)

      if (res.result === 'corrected' && res.image_base64) {
        setSrc(`data:image/jpeg;base64,${res.image_base64}`)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedAreaPixels(null)
        notify.success(t('students.showPage.adaptCroppedOk'))
        return
      }
      if (res.result === 'ok') {
        notify.info(t('students.showPage.adaptGateOk'))
        return
      }
      if (res.result === 'rejected') {
        setRejection(res.message || reasonLabel(res.reason))
        return
      }
      notify.warning(res.message || t('students.showPage.adaptGateUnavailable'))
    } catch {
      notify.warning(t('students.showPage.adaptGateUnavailable'))
    } finally {
      setAdaptLoading(false)
    }
  }

  const handleSave = async () => {
    if (!src || !croppedAreaPixels) {
      notify.warning(t('students.showPage.cropSelectFirst'))
      return
    }
    const file = await getCroppedFile(src, croppedAreaPixels)
    onSave(file)
  }

  return (
    <Modal
      open={open && Boolean(src)}
      onClose={close}
      title={<span className="uppercase">{title}</span>}
      sizeClassName="max-w-[800px]"
      maxHeightClassName="max-h-[min(94svh,920px)]"
      dismissible={!busy}
      closeClassName="text-rose hover:bg-rose-soft hover:text-rose"
      footer={
        <div className="space-y-3">
          {canUseImageGate ? (
            <Button
              variant="primary"
              className="image-gate-btn w-full shadow-none hover:bg-transparent"
              loading={adaptLoading}
              disabled={busy}
              onClick={() => void handleAdapt()}
            >
              {!adaptLoading ? <ShieldCheck className="size-5" aria-hidden /> : null}
              {t('students.showPage.adaptGate')}
            </Button>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="danger"
              className="w-full bg-rose text-white hover:bg-rose/90"
              disabled={busy}
              onClick={close}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              className="w-full"
              loading={saving}
              disabled={busy}
              onClick={() => void handleSave()}
            >
              {!saving ? <Save className="size-4" aria-hidden /> : null}
              {t('common.save')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="relative space-y-3">
        {busy ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/55">
            <span className="size-8 animate-spin rounded-full border-2 border-signal border-r-transparent" />
          </div>
        ) : null}

        {rejection ? (
          <Notification
            tone="error"
            title={t('students.showPage.adaptGateRejected')}
            onClose={() => setRejection(null)}
          >
            {rejection}
          </Notification>
        ) : null}

        {src ? (
          <div className="relative h-100 w-full overflow-hidden rounded-lg bg-[#4a4a4a]">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={ASPECT}
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        ) : null}

        <Notification tone="warning" title={t('students.showPage.cropRulesTitle')}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1 space-y-1 text-[13px] text-deep">
              <p className="m-0">{t('students.showPage.cropRule1')}</p>
              <p className="m-0">{t('students.showPage.cropRule2')}</p>
              <p className="m-0">{t('students.showPage.cropRule3')}</p>
              <p className="m-0">{t('students.showPage.cropRule4')}</p>
              <p className="m-0">{t('students.showPage.cropRule5')}</p>
              <p className="m-0">
                {t('students.showPage.cropRule6')}{' '}
                <span aria-hidden>👍</span>
              </p>
            </div>
            <div className="mx-auto w-50 shrink-0 sm:mx-0">
              <AcceptableExamples />
            </div>
          </div>
        </Notification>
      </div>
    </Modal>
  )
}
