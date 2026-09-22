import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Camera,
  CarFront,
  Clock,
  FolderOpen,
  ImageIcon,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import {
  checkStudentBionet,
  enrollStudentCamera,
  replaceAutodromeImage,
  replaceStudentCameraImage,
  resendAutodromeStudent,
} from '@/api'
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  Panel,
  SafeImage,
  StatusCardSkeleton,
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

const SCHOOL_PENDING = 1
const SCHOOL_SENT = 3
const SCHOOL_FAILED = 5

const AOS_SENT = 1
const AOS_FAILED = 2
const AOS_PENDING = 3
const AOS_ENDED = 4

type PrimaryAction = { text: string; disabled: boolean; danger?: boolean }

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

function CameraPhoto({ src }: { src: string; alt?: string }) {
  return (
    <SafeImage
      src={src}
      size="md"
      className="size-14 shrink-0 rounded-lg ring-1 ring-mist/70"
    />
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
  const canBionet =
    Boolean(data?.is_bionet) &&
    (superAdmin || hasPermission('check-bionet-monitoring-camera-student'))

  const [replaceOpen, setReplaceOpen] = useState(false)
  const [bionetOpen, setBionetOpen] = useState(false)
  const [bionet, setBionet] = useState<Record<string, unknown> | null>(null)

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

  const bionetMut = useMutation({
    mutationFn: () => checkStudentBionet(studentId),
    onSuccess: (body) => {
      setBionet(body)
      setBionetOpen(true)
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
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-signal-soft text-signal">
            <Camera className="size-4" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-deep">
            {t('students.showPage.schoolCamera')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('students.showPage.refresh')}
          onClick={onRefresh}
        >
          <RefreshCw className="size-3.5" />
        </Button>
      </div>

      {isLoading ? (
        <StatusCardSkeleton />
      ) : (
        <>
          <div className="flex items-start gap-3">
            <CameraPhoto src={img} alt="camera" />
            <div className="min-w-0 space-y-1">
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
            <div className="space-y-2">
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
              {canBionet ? (
                <Button
                  variant="outline"
                  className="w-full"
                  loading={bionetMut.isPending}
                  onClick={() => bionetMut.mutate()}
                >
                  <ShieldCheck className="size-3.5" aria-hidden />
                  {t('students.showPage.checkFromCamera')}
                </Button>
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

      <Modal
        open={bionetOpen}
        onClose={() => setBionetOpen(false)}
        title={t('students.showPage.bionetResult')}
        sizeClassName="max-w-md"
      >
        {bionet ? (
          <div className="space-y-2 text-sm">
            <Badge tone={bionet.found ? 'teal' : 'rose'}>
              {bionet.found
                ? t('students.showPage.bionetFound')
                : t('students.showPage.bionetMissing')}
            </Badge>
            {bionet.message ? (
              <p className="text-muted">{String(bionet.message)}</p>
            ) : null}
          </div>
        ) : (
          <EmptyState description={t('common.empty')} />
        )}
      </Modal>
    </div>
  )
}

function AutodromeCameraCard({
  studentId,
  data,
  isLoading,
  onRefresh,
}: {
  studentId: string
  data: AutodromeCameraStatus | undefined
  isLoading: boolean
  onRefresh: () => void
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
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-soft text-amber">
            <CarFront className="size-4" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-deep">
            {t('students.showPage.autodromeCamera')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('students.showPage.refresh')}
          onClick={onRefresh}
        >
          <RefreshCw className="size-3.5" />
        </Button>
      </div>

      {isLoading ? (
        <StatusCardSkeleton />
      ) : !autodrome ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <FolderOpen className="size-10 text-muted/70" aria-hidden />
          <p className="text-sm text-muted">
            {data?.reason || t('students.showPage.groupNotLinkedAutodrome')}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <CameraPhoto src={img} alt="autodrome" />
            <div className="min-w-0 space-y-1">
              <Badge tone={visual.tone}>{visual.label}</Badge>
              {data?.warning === 'image_missing' ? (
                <Badge tone="amber">{t('students.showPage.mainImageMissing')}</Badge>
              ) : null}
              {autodrome.name ? (
                <p className="text-[12px] font-semibold text-deep">{autodrome.name}</p>
              ) : null}
              {groupNotSynced && group?.block_reason ? (
                <p className="text-[12px] text-amber">{group.block_reason}</p>
              ) : null}
              {aos?.seans_total ? (
                <p className="text-[12px] text-muted">
                  {t('students.showPage.visits')}: {aos.seans_total}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
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
    </div>
  )
}

export function StudentCamerasPanel({ studentId }: { studentId: string }) {
  const { t } = useTranslation()
  const school = useStudentCameraStatusQuery(studentId)
  const autodrome = useStudentAutodromeStatusQuery(studentId)

  return (
    <Panel padding="sm" className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <SchoolCameraCard
          studentId={studentId}
          data={school.data}
          isLoading={school.isLoading}
          onRefresh={() => {
            void school.refetch()
          }}
        />
        <AutodromeCameraCard
          studentId={studentId}
          data={autodrome.data}
          isLoading={autodrome.isLoading}
          onRefresh={() => {
            void autodrome.refetch()
          }}
        />
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
