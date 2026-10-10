import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CarFront,
  Clock,
  FolderOpen,
  ImageIcon,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import {
  enrollStudentCamera,
  grantAutodromeCameraDays,
  replaceAutodromeImage,
  returnAutodromeRealImage,
  replaceStudentCameraImage,
  resendAutodromeStudent,
} from '@/api'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Modal,
  Panel,
  SafeImage,
  StatusCardSkeleton,
  Tooltip,
  notify,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useStudentAutodromeStatusQuery,
  useStudentCameraStatusQuery,
} from '@/features/students'
import { resolveFileUrl } from '@/features/lessons'
import type {
  AutodromeCameraStatus,
  SchoolCameraPending,
  SchoolCameraStatus,
} from '@/types/student'
import { ReportProblemButton } from './ReportProblemButton'
import { StudentBionetCheckModal } from './StudentBionetCheckModal'
import { StudentCameraCheckModal } from './StudentCameraCheckModal'

const SCHOOL_PENDING = 1
const SCHOOL_SENT = 3
const SCHOOL_FAILED = 5

const AOS_SENT = 1
const AOS_FAILED = 2
const AOS_PENDING = 3
const AOS_ENDED = 4

type PrimaryAction = { text: string; disabled: boolean; danger?: boolean }

const miniIconStyle: CSSProperties = {
  width: 22,
  height: 22,
  minWidth: 22,
  boxShadow: 'none',
}

function poll(refetch: () => void) {
  window.setTimeout(() => refetch(), 2000)
  window.setTimeout(() => refetch(), 6000)
  window.setTimeout(() => refetch(), 15000)
}

function cameraTypeLabel(id: number | null | undefined) {
  if (id === 2) return 'Bionet'
  if (id === 3) return 'NDT'
  if (id) return `#${id}`
  return null
}

function schoolVisual(
  pending: SchoolCameraPending | null | undefined,
  t: (k: string) => string,
) {
  const n = Number(pending?.status)
  if (n === SCHOOL_PENDING) {
    return { label: t('students.showPage.waitingSend'), tone: 'signal' as const }
  }
  if (n === SCHOOL_SENT) {
    return { label: t('students.showPage.sent'), tone: 'teal' as const }
  }
  if (n === SCHOOL_FAILED || n === 4) {
    return { label: t('students.showPage.sendError'), tone: 'rose' as const }
  }
  if (n === 8) {
    return { label: `${t('students.showPage.oldCameraRecord')} (#8)`, tone: 'neutral' as const }
  }
  return { label: t('students.showPage.notSent'), tone: 'neutral' as const }
}

function aosVisual(status: number | null | undefined, t: (k: string) => string) {
  const n = Number(status)
  if (n === AOS_SENT) return { label: t('students.showPage.sent'), tone: 'teal' as const }
  if (n === AOS_FAILED) return { label: t('students.showPage.sendError'), tone: 'rose' as const }
  if (n === AOS_PENDING) {
    return { label: t('students.showPage.sending'), tone: 'signal' as const }
  }
  if (n === AOS_ENDED) return { label: t('students.showPage.ended'), tone: 'neutral' as const }
  return { label: t('students.showPage.notSent'), tone: 'neutral' as const }
}

function CameraPhoto({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        disabled={!src}
        aria-label={src ? alt : undefined}
        onClick={() => {
          if (src) setOpen(true)
        }}
        className={
          src
            ? 'cursor-pointer rounded-lg outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-signal/40'
            : 'cursor-default'
        }
      >
        <SafeImage
          src={src}
          alt={alt}
          size="md"
          className="size-11 shrink-0 rounded-lg ring-1 ring-mist/70"
        />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={alt}
        sizeClassName="max-w-lg"
        bodyClassName="p-3 sm:p-4"
      >
        <SafeImage
          src={src}
          alt={alt}
          size="xl"
          fit="contain"
          className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
        />
      </Modal>
    </>
  )
}

function ReplaceImageModal({
  open,
  onClose,
  title,
  hint,
  currentSrc,
  loading,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  title: string
  hint: string
  currentSrc: string
  loading: boolean
  onSubmit: (file: File) => void
}) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const reset = () => {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title={title}
      sizeClassName="max-w-md"
      dismissible={!loading}
    >
      <p className="text-sm text-muted">{hint}</p>
      <div className="mt-3">
        <p className="text-sm font-semibold text-deep">
          {t('students.showPage.currentCameraImage')}
        </p>
        <div className="mt-2">
          <SafeImage
            src={currentSrc}
            size="lg"
            label={t('common.noImage')}
            className="h-40 w-40 rounded-lg ring-1 ring-mist/70"
          />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-deep">{t('students.showPage.newImage')}</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="mt-2 block w-full text-sm"
          onChange={(e) => {
            const next = e.target.files?.[0] ?? null
            setFile(next)
            setPreview(next ? URL.createObjectURL(next) : null)
          }}
        />
        {preview ? (
          <SafeImage
            src={preview}
            size="lg"
            fit="contain"
            className="mt-2 h-40 w-40 rounded-lg"
          />
        ) : null}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => {
            reset()
            onClose()
          }}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!file}
          loading={loading}
          onClick={() => file && onSubmit(file)}
        >
          {t('students.showPage.uploadAndSend')}
        </Button>
      </div>
    </Modal>
  )
}

function SchoolCameraCard({
  studentId,
  data,
  isLoading,
  onRefresh,
}: {
  studentId: string
  data: SchoolCameraStatus | undefined
  isLoading: boolean
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const { hasPermission, isSuperAdmin } = useAuth()
  const pending = data?.pending
  const visual = schoolVisual(pending, t)
  const img = resolveFileUrl(
    pending?.image || data?.image || data?.pending_image,
    PATH_PREFIX_FILE,
  )
  const orgHasCamera = Boolean(data?.organization_has_camera)
  const hasImage = Boolean(data?.has_image)
  const canReplace = data?.can_replace_image !== false
  const typeLabel = cameraTypeLabel(pending?.face_control_type_id)
  const superAdmin = Boolean(data?.is_superadmin) || isSuperAdmin
  const canEnroll =
    superAdmin || hasPermission('resend-student-monitoring-camera-pending-student')
  const canReplacePerm =
    superAdmin || hasPermission('change-image-manual-monitoring-camera-student')

  const [replaceOpen, setReplaceOpen] = useState(false)
  const [bionetOpen, setBionetOpen] = useState(false)

  const enroll = useMutation({
    mutationFn: () => enrollStudentCamera(studentId),
    onSuccess: (res) => {
      notify.success(res.message || t('students.showPage.queued'))
      onRefresh()
      poll(onRefresh)
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const replace = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('new_image', file, file.name || 'image.jpg')
      return replaceStudentCameraImage(studentId, form)
    },
    onSuccess: (res) => {
      notify.success(res.message || t('students.showPage.imageQueued'))
      setReplaceOpen(false)
      onRefresh()
      poll(onRefresh)
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const primary: PrimaryAction = (() => {
    if (!orgHasCamera) {
      return { text: t('students.showPage.orgNoCamera'), disabled: true }
    }
    if (!hasImage) {
      return { text: t('students.showPage.uploadMainFirst'), disabled: true }
    }
    if (!pending) {
      return { text: t('students.showPage.sendToCamera'), disabled: false }
    }
    if (Number(pending.status) === SCHOOL_PENDING) {
      return { text: t('students.showPage.sending'), disabled: true }
    }
    if (Number(pending.status) === SCHOOL_SENT) {
      return { text: t('students.showPage.resend'), disabled: false }
    }
    return { text: t('students.showPage.retry'), disabled: false, danger: true }
  })()

  const lastErrorMessage =
    typeof pending?.last_error === 'string'
      ? pending.last_error
      : pending?.last_error && typeof pending.last_error === 'object'
        ? pending.last_error.message
        : null

  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-signal-soft text-signal">
            <Camera className="size-3.5" aria-hidden />
          </span>
          <p className="truncate text-[13px] font-semibold text-deep">
            {t('students.showPage.schoolCamera')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          style={miniIconStyle}
          aria-label={t('students.showPage.refresh')}
          onClick={onRefresh}
        >
          <RefreshCw className="size-3" />
        </Button>
      </div>

      {isLoading ? (
        <StatusCardSkeleton />
      ) : (
        <>
          <div className="flex items-start gap-2">
            <CameraPhoto src={img} alt={t('students.showPage.schoolCamera')} />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <Badge tone={visual.tone}>
                <Clock className="size-3" aria-hidden />
                {visual.label}
              </Badge>
              {data?.warning === 'image_missing' ? (
                <Badge tone="amber">{t('students.showPage.mainImageMissing')}</Badge>
              ) : null}
              {pending?.image_changed ? (
                <Badge tone="violet">{t('students.showPage.cameraImageSeparate')}</Badge>
              ) : null}
              {typeLabel ? (
                <p className="text-[12px] text-muted">
                  {t('students.showPage.cameraType')}: {typeLabel}
                </p>
              ) : null}
            </div>
          </div>

          {!orgHasCamera ? (
            <EmptyState
              className="py-6"
              description={t('students.showPage.orgCameraNotInstalled')}
            />
          ) : (
            <div className="mt-auto space-y-1.5">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setBionetOpen(true)}
              >
                <ShieldCheck className="size-3.5" aria-hidden />
                {t('students.showPage.checkFromCamera')}
              </Button>
              {canEnroll ? (
                <Button
                  variant={primary.danger ? 'danger' : 'secondary'}
                  className="w-full"
                  disabled={primary.disabled}
                  loading={enroll.isPending}
                  onClick={() => enroll.mutate()}
                >
                  <Camera className="size-3.5" aria-hidden />
                  {primary.text}
                </Button>
              ) : null}
              {hasImage && canReplace && canReplacePerm ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-signal hover:underline"
                  onClick={() => setReplaceOpen(true)}
                >
                  <ImageIcon className="size-3.5" aria-hidden />
                  {t('students.showPage.changeImageResend')}
                </button>
              ) : null}
              {hasImage && !canReplace && canReplacePerm ? (
                <p className="text-[12px] text-muted">
                  {t('students.showPage.replaceUsed')}
                </p>
              ) : null}
              {lastErrorMessage ? (
                <p className="text-[12px] text-rose">{lastErrorMessage}</p>
              ) : null}
            </div>
          )}
        </>
      )}

      <ReplaceImageModal
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        title={t('students.showPage.replaceCameraTitle')}
        hint={t('students.showPage.replaceCameraHint')}
        currentSrc={img}
        loading={replace.isPending}
        onSubmit={(file) => replace.mutate(file)}
      />
      <StudentBionetCheckModal
        open={bionetOpen}
        onClose={() => setBionetOpen(false)}
        studentId={studentId}
      />

    </div>
  )
}

function AutodromeCameraCard({
  studentId,
  data,
  isLoading,
  onRefresh,
  eduStatus,
}: {
  studentId: string
  data: AutodromeCameraStatus | undefined
  isLoading: boolean
  onRefresh: () => void
  /** 2 — Tamomlagan. Eski kartada 6 kun shu holatda chiqadi. */
  eduStatus?: number | string | null
}) {
  const { t } = useTranslation()
  const { hasPermission, isSuperAdmin } = useAuth()
  const autodrome = data?.autodrome
  const aos = data?.aos
  const group = data?.group
  const groupNotSynced = Boolean(group) && group?.synced === false
  const visual =
    groupNotSynced && Number(aos?.status) === AOS_PENDING
      ? { label: t('students.showPage.groupWaiting'), tone: 'amber' as const }
      : aosVisual(aos?.status, t)
  const img = resolveFileUrl(aos?.image, PATH_PREFIX_FILE)
  const hasImage = Boolean(data?.has_image)
  const canReplace = data?.can_replace_image !== false
  const superAdmin = Boolean(data?.is_superadmin) || isSuperAdmin
  const canResend = superAdmin || hasPermission('resend-autodrome-organization-student')
  const canUpdateImage =
    superAdmin || hasPermission('update-image-autodrome-organization-student')
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [checkOpen, setCheckOpen] = useState(false)
  const [expiryOpen, setExpiryOpen] = useState(false)
  const [grantAsk, setGrantAsk] = useState(false)
  const [returnAsk, setReturnAsk] = useState(false)
  const grantBtnRef = useRef<HTMLDivElement>(null)
  const [grantPos, setGrantPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!grantAsk || !grantBtnRef.current) return
    const place = () => {
      const rect = grantBtnRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = 300
      const left = Math.min(
        Math.max(8, rect.right - width),
        window.innerWidth - width - 8,
      )
      setGrantPos({ top: rect.top - 8, left })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [grantAsk])
  const graduated = Number(eduStatus) === 2
  const canGrant =
    Boolean(autodrome) && (data?.can_extend_camera === true || graduated)

  const resend = useMutation({
    mutationFn: () => {
      if (!aos?.id) throw new Error(t('students.showPage.aosMissing'))
      return resendAutodromeStudent(studentId, aos.id)
    },
    onSuccess: (res) => {
      notify.success(res.message || t('students.showPage.queued'))
      onRefresh()
      poll(onRefresh)
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const grantDays = useMutation({
    mutationFn: () => grantAutodromeCameraDays(studentId),
    onSuccess: (res) => {
      notify.success(res.message || t('students.showPage.queued'), { duration: 0 })
      onRefresh()
      poll(onRefresh)
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError'), { duration: 0 }),
  })

  const returnReal = useMutation({
    mutationFn: () => {
      if (!aos?.id) throw new Error(t('students.showPage.aosMissing'))
      return returnAutodromeRealImage(studentId, aos.id)
    },
    onSuccess: (res) => {
      notify.success(res.message || t('students.showPage.queued'))
      onRefresh()
      poll(onRefresh)
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const replace = useMutation({
    mutationFn: (file: File) => {
      if (!aos?.id) throw new Error(t('students.showPage.aosMissing'))
      const form = new FormData()
      form.append('new_image', file, file.name || 'image.jpg')
      return replaceAutodromeImage(studentId, aos.id, form)
    },
    onSuccess: (res) => {
      notify.success(res.message || t('students.showPage.imageQueued'))
      setReplaceOpen(false)
      onRefresh()
      poll(onRefresh)
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const primary: PrimaryAction = (() => {
    if (!autodrome) {
      return { text: t('students.showPage.autodromeUnlinked'), disabled: true }
    }
    if (!autodrome.is_face_control) {
      return { text: t('students.showPage.autodromeNoCamera'), disabled: true }
    }
    if (!hasImage) {
      return { text: t('students.showPage.uploadMainFirst'), disabled: true }
    }
    if (!aos) {
      return { text: t('students.showPage.sendQueued'), disabled: true }
    }
    if (Number(aos.status) === AOS_PENDING && groupNotSynced) {
      return { text: t('students.showPage.resendGroupSync'), disabled: false }
    }
    if (Number(aos.status) === AOS_PENDING) {
      return { text: t('students.showPage.sending'), disabled: true }
    }
    if (Number(aos.status) === AOS_FAILED) {
      return { text: t('students.showPage.retry'), disabled: false, danger: true }
    }
    return { text: t('students.showPage.resend'), disabled: false }
  })()

  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-soft text-amber">
            <CarFront className="size-3.5" aria-hidden />
          </span>
          <p className="truncate text-[13px] font-semibold text-deep">
            {t('students.showPage.autodromeCamera')}
          </p>
          {autodrome?.is_face_control && superAdmin ? (
            <a
              href={`https://admin-attendance.nextdevteam.uz/attendance-admin-panelll/login/?next=${encodeURIComponent(`/attendance-admin-panelll/information/user/?q=${studentId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-6 shrink-0 items-center justify-center rounded-md bg-signal-soft text-signal"
              aria-label={t('students.showPage.autodromeHasCamera')}
            >
              <Camera className="size-3.5" aria-hidden />
            </a>
          ) : null}
          {canGrant ? (
            <Tooltip
              content={
                <span className="block max-w-56">
                  <b className="mb-0.5 block">{t('students.showPage.grantCameraDays')}</b>
                  {t('students.showPage.grantCameraDaysTip')}
                </span>
              }
            >
              <button
                type="button"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber"
                aria-label={t('students.showPage.photoExpiryTitle')}
                onClick={() => setExpiryOpen(true)}
              >
                <AlertCircle className="size-3.5" aria-hidden />
              </button>
            </Tooltip>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          style={miniIconStyle}
          aria-label={t('students.showPage.refresh')}
          onClick={onRefresh}
        >
          <RefreshCw className="size-3" />
        </Button>
      </div>

      {isLoading ? (
        <StatusCardSkeleton />
      ) : !autodrome ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setCheckOpen(true)}
          >
            <ShieldCheck className="size-3.5" aria-hidden />
            {t('students.showPage.checkFromCamera')}
          </Button>
          <FolderOpen className="size-10 text-muted/70" aria-hidden />
          <p className="text-sm text-muted">
            {data?.reason || t('students.showPage.groupNotLinkedAutodrome')}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2">
            <CameraPhoto src={img} alt={t('students.showPage.autodromeCamera')} />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <Badge tone={visual.tone}>{visual.label}</Badge>
              {aos?.image_changed ? (
                <Badge tone="violet">{t('students.showPage.specialImage')}</Badge>
              ) : null}
              {data?.warning === 'image_missing' ? (
                <Badge tone="amber">{t('students.showPage.mainImageMissing')}</Badge>
              ) : null}
              {autodrome.name ? (
                <p className="text-[12px] font-semibold text-deep">{autodrome.name}</p>
              ) : null}
              {groupNotSynced && group?.block_reason ? (
                <p className="text-[12px] text-amber">{group.block_reason}</p>
              ) : null}
              {Number(aos?.seans_total) > 0 ? (
                <p className="text-[12px] text-muted">
                  {t('students.showPage.visitLine', {
                    count: aos?.seans_total,
                    hours: Number(aos?.seans_total) * 2,
                  })}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-1.5">
            <div className="flex flex-col gap-1.5">
              <Button
                variant="outline"
                className="h-auto! min-h-9 w-full whitespace-normal px-2 py-1.5 text-[12px] leading-tight"
                onClick={() => setCheckOpen(true)}
              >
                <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
                {t('students.showPage.checkFromCamera')}
              </Button>
              {canGrant ? (
                <div ref={grantBtnRef} className="w-full">
                  <Button
                    variant="outline"
                    className={
                      grantAsk
                        ? 'h-auto! min-h-9 w-full border-signal! border-dashed whitespace-normal px-2 py-1.5 text-[12px] leading-tight text-signal!'
                        : 'h-auto! min-h-9 w-full whitespace-normal px-2 py-1.5 text-[12px] leading-tight'
                    }
                    loading={grantDays.isPending}
                    onClick={() => setGrantAsk((open) => !open)}
                  >
                    <Clock className="size-3.5 shrink-0" aria-hidden />
                    {t('students.showPage.grantCameraDays')}
                  </Button>
                  {grantAsk
                    ? createPortal(
                        <div
                          className="fixed z-[200] w-[300px] -translate-y-full rounded-lg border border-mist/80 bg-white p-3 shadow-[0_12px_32px_rgba(15,36,48,0.16)]"
                          style={{ top: grantPos.top, left: grantPos.left }}
                        >
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
                            <p className="text-sm font-medium text-deep">
                              {t('students.showPage.grantCameraDays')}
                            </p>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGrantAsk(false)}
                            >
                              {t('students.showPage.grantPopCancel')}
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              loading={grantDays.isPending}
                              onClick={() => {
                                setGrantAsk(false)
                                grantDays.mutate()
                              }}
                            >
                              {t('dashboard.yes')}
                            </Button>
                          </div>
                        </div>,
                        document.body,
                      )
                    : null}
                </div>
              ) : null}
            </div>
            {canResend ? (
              <Button
                variant={primary.danger ? 'danger' : 'secondary'}
                className="w-full"
                disabled={primary.disabled}
                loading={resend.isPending}
                onClick={() => resend.mutate()}
              >
                <CarFront className="size-3.5" aria-hidden />
                {primary.text}
              </Button>
            ) : null}
            {hasImage && canReplace && canUpdateImage && aos && Number(aos.status) !== AOS_ENDED ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-signal hover:underline"
                onClick={() => setReplaceOpen(true)}
              >
                <ImageIcon className="size-3.5" aria-hidden />
                {t('students.showPage.changeImageResend')}
              </button>
            ) : null}
            {aos?.image_changed && aos.id ? (
              <Button
                variant="link"
                size="inline"
                className="inline-flex items-center gap-1.5"
                onClick={() => setReturnAsk(true)}
              >
                <RotateCcw className="size-3.5" aria-hidden />
                {t('students.showPage.returnRealImage')}
              </Button>
            ) : null}
          </div>
        </>
      )}

      <ReplaceImageModal
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        title={t('students.showPage.replaceAutodromeTitle')}
        hint={t('students.showPage.replaceAutodromeHint')}
        currentSrc={img}
        loading={replace.isPending}
        onSubmit={(file) => replace.mutate(file)}
      />
      <StudentCameraCheckModal
        open={checkOpen}
        onClose={() => setCheckOpen(false)}
        studentId={studentId}
        autodromeId={autodrome?.id}
        autodromeName={autodrome?.name}
      />
      <ConfirmDialog
        open={returnAsk}
        onClose={() => setReturnAsk(false)}
        title={t('students.showPage.returnRealImage')}
        loading={returnReal.isPending}
        onConfirm={() => {
          setReturnAsk(false)
          returnReal.mutate()
        }}
      />
      <Modal
        open={expiryOpen}
        onClose={() => setExpiryOpen(false)}
        title={
          <span className="inline-flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-signal-soft text-signal">
              <AlertCircle className="size-3.5" aria-hidden />
            </span>
            {t('students.showPage.photoExpiryTitle')}
          </span>
        }
        sizeClassName="max-w-lg"
        closeClassName="text-rose"
      >
        <div className="space-y-3 text-sm leading-relaxed text-deep/80">
          <p>{t('students.showPage.photoExpiry1')}</p>
          <p>{t('students.showPage.photoExpiry2')}</p>
          <p>{t('students.showPage.photoExpiry3')}</p>
          <p>{t('students.showPage.photoExpiry4')}</p>
        </div>
      </Modal>
    </div>
  )
}

export function StudentCamerasPanel({
  studentId,
  eduStatus,
}: {
  studentId: string
  eduStatus?: number | string | null
}) {
  const { t } = useTranslation()
  const school = useStudentCameraStatusQuery(studentId)
  const autodrome = useStudentAutodromeStatusQuery(studentId)

  return (
    <Panel padding="sm" className="space-y-2.5">
      <div className="grid items-stretch gap-3 sm:grid-cols-2 sm:gap-0">
        <div className="flex h-full min-w-0 sm:pr-3">
          <SchoolCameraCard
            studentId={studentId}
            data={school.data}
            isLoading={school.isLoading}
            onRefresh={() => {
              void school.refetch()
            }}
          />
        </div>
        <div className="flex h-full min-w-0 border-t border-mist/60 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3">
          <AutodromeCameraCard
            studentId={studentId}
            data={autodrome.data}
            isLoading={autodrome.isLoading}
            eduStatus={eduStatus}
            onRefresh={() => {
              void autodrome.refetch()
            }}
          />
        </div>
      </div>
      <ReportProblemButton
        context="student_camera"
        subjectType="student"
        subjectId={studentId}
        buttonText={t('students.showPage.cameraProblem')}
      />
    </Panel>
  )
}
