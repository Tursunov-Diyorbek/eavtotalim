import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  Check,
  ImageIcon,
  Lock,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  Badge,
  Button,
  Input,
  Modal,
  Panel,
  PhoneInput,
  SafeImage,
  notify,
} from '@/components/ui'
import {
  adaptCurrentStudentImage,
  changeExamImageManual,
  changeStudentImageManual,
  queryKeys,
  syncStudentImage,
} from '@/api'
import { StudentAccessModal } from '../StudentAccessModal'
import { PATH_PREFIX_FILE, studentEditPath } from '@/config'
import { useAuth } from '@/features/auth'
import { resolveFileUrl } from '@/features/lessons'
import { studentEduStatusTone, useUpdateStudentAdditionalInfoMutation } from '@/features/students'
import { asFio, asLangName } from '@/lib/apiPage'
import { isPhoneComplete, parsePhoneDigits } from '@/lib/phone'
import type { StudentGroup, StudentItem } from '@/types/student'
import { ImageCropModal } from './ImageCropModal'

type ImageField = 'image' | 'exam_image'
type InlineField = 'phone' | 'address' | 'medical' | null

const miniIconStyle: CSSProperties = {
  width: 22,
  height: 22,
  minWidth: 22,
  boxShadow: 'none',
}

const compactBtnStyle: CSSProperties = {
  height: 28,
  paddingInline: 8,
  fontSize: 12,
  boxShadow: 'none',
}

function toAdditionalPhone(raw: string) {
  const digits = parsePhoneDigits(raw)
  if (digits.length !== 9) return ''
  return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
}

function MissingValue({
  value,
  fallback,
}: {
  value?: string | null
  fallback: string
}) {
  if (value && value.trim() && value !== 'null') {
    return <span className="font-medium text-deep">{value}</span>
  }
  return <Badge tone="rose">{fallback}</Badge>
}

function eduStatusLabel(status: number, t: (k: string) => string) {
  if (status === 1) return t('students.showPage.studying')
  if (status === 2) return t('students.graduated')
  return t('students.showPage.notInGroup')
}

function cameraPendingLabel(status: number | null | undefined, t: (k: string) => string) {
  if (status === 1 || status === 2) return { label: t('students.showPage.cameraJoining'), tone: 'amber' as const }
  if (status === 3) return { label: t('students.showPage.cameraOk'), tone: 'teal' as const }
  if (status === 4 || status === 5) return { label: t('students.showPage.cameraError'), tone: 'rose' as const }
  if (status === 6) return { label: t('students.showPage.cameraQueuedDelete'), tone: 'amber' as const }
  if (status === 7) return { label: t('students.showPage.cameraDeleted'), tone: 'rose' as const }
  return { label: t('students.showPage.cameraUnknown'), tone: 'neutral' as const }
}

export function StudentProfileHeader({
  studentId,
  student,
  group,
}: {
  studentId: string
  student: StudentItem
  group: StudentGroup | null
}) {
  const { t, i18n } = useTranslation()
  const { hasPermission, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mainFileRef = useRef<HTMLInputElement>(null)
  const examFileRef = useRef<HTMLInputElement>(null)

  const canUpdate = hasPermission('update-student')
  const canChangeMain = hasPermission('manual-change-image-student')
  const canChangeExam = hasPermission('manual-change-exam-image-student')
  const canSync = hasPermission('sync-image-student')
  const canGate = hasPermission('use-image-gate') || isSuperAdmin
  const canPassword = hasPermission('show-user-password')
  const canEditPage = canUpdate && group?.group_type?.id !== 3
  const showActions = canSync || canGate || canPassword || canEditPage

  const photo = resolveFileUrl(student.image, PATH_PREFIX_FILE)
  const examPhoto = resolveFileUrl(student.exam_image, PATH_PREFIX_FILE)
  const pending = student.monitoring_camera_pending_student
  const pendingMeta = cameraPendingLabel(pending?.status, t)
  const pendingImg = resolveFileUrl(pending?.image, PATH_PREFIX_FILE)
  const status = Number(student.edu_status)
  const additional = useUpdateStudentAdditionalInfoMutation(studentId)

  const [inline, setInline] = useState<InlineField>(null)
  const [phoneDraft, setPhoneDraft] = useState('')
  const [addressDraft, setAddressDraft] = useState('')
  const [medicalDraft, setMedicalDraft] = useState('')

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [previewField, setPreviewField] = useState<ImageField>('image')
  const [previewTitle, setPreviewTitle] = useState('')

  const [accountsOpen, setAccountsOpen] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<{ src: string; title: string } | null>(null)

  useEffect(() => {
    setPhoneDraft(student.phone1 || student.phone || '')
    setAddressDraft(student.address || '')
    setMedicalDraft(student.medical_sertificate || '')
  }, [student.phone1, student.phone, student.address, student.medical_sertificate])

  const refreshStudent = () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.students.detail(studentId),
    })
  }

  const imageMutation = useMutation({
    mutationFn: async ({ field, file }: { field: ImageField; file: File }) => {
      const form = new FormData()
      form.append(field, file, file.name || 'image.jpg')
      return field === 'exam_image'
        ? changeExamImageManual(studentId, form)
        : changeStudentImageManual(studentId, form)
    },
    onSuccess: (res) => {
      notify.success(res.message || t('common.saved'))
      closePreview()
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const syncMutation = useMutation({
    mutationFn: () =>
      syncStudentImage(studentId, {
        passport_seria: student.passport_seria ?? student.passport?.serial,
        passport_number: student.passport_number ?? student.passport?.number,
        birthday: student.birthday,
      }),
    onSuccess: (res) => {
      const statusCode = Number(res.status ?? res.data?.status)
      if (statusCode === 1) {
        notify.success(t('students.showPage.syncImageOk'))
        refreshStudent()
        return
      }
      notify.error(res.message || t('students.showPage.syncImageFail'))
    },
    onError: (err: Error) => notify.error(err.message || t('students.showPage.syncImageFail')),
  })

  const gateMutation = useMutation({
    mutationFn: () => adaptCurrentStudentImage(studentId),
    onSuccess: (res) => {
      if (res.result === 'corrected' && res.image_base64) {
        setPreviewField('image')
        setPreviewTitle(t('students.showPage.adaptGate'))
        setPreviewSrc(`data:image/jpeg;base64,${res.image_base64}`)
        setPreviewOpen(true)
        return
      }
      if (res.result === 'ok') {
        notify.info(t('students.showPage.adaptGateOk'))
        return
      }
      if (res.result === 'rejected') {
        notify.error(res.message || t('students.showPage.adaptGateRejected'))
        return
      }
      notify.warning(res.message || t('students.showPage.adaptGateUnavailable'))
    },
    onError: () => notify.warning(t('students.showPage.adaptGateUnavailable')),
  })

  const openFilePreview = (file: File, field: ImageField, title: string) => {
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewField(field)
      setPreviewTitle(title)
      setPreviewSrc(String(reader.result || ''))
      setPreviewOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setPreviewSrc(null)
  }

  const saveInline = (field: Exclude<InlineField, null>) => {
    if (field === 'phone') {
      const phone1 = toAdditionalPhone(phoneDraft)
      if (!isPhoneComplete(phoneDraft) || !phone1) {
        notify.error(t('students.showPage.invalidPhone'))
        return
      }
      additional.mutate(
        { phone1 },
        {
          onSuccess: () => {
            notify.success(t('students.showPage.phoneUpdated'))
            setInline(null)
          },
          onError: (err) => notify.error(err.message || t('common.loadError')),
        },
      )
      return
    }
    if (field === 'address') {
      const address = addressDraft.trim()
      if (!address) {
        notify.error(t('students.showPage.invalidAddress'))
        return
      }
      additional.mutate(
        { address },
        {
          onSuccess: () => {
            notify.success(t('students.showPage.addressUpdated'))
            setInline(null)
          },
          onError: (err) => notify.error(err.message || t('common.loadError')),
        },
      )
      return
    }
    const medical_sertificate = medicalDraft.trim()
    if (!medical_sertificate) {
      notify.error(t('students.showPage.invalidMedical'))
      return
    }
    additional.mutate(
      { medical_sertificate },
      {
        onSuccess: () => {
          notify.success(t('students.showPage.medicalUpdated'))
          setInline(null)
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  const openAccounts = () => setAccountsOpen(true)

  return (
    <Panel padding="none">
      <div className="profile-hero flex items-center gap-2.5 p-2.5">
        <div className="relative w-20 shrink-0">
          <button
            type="button"
            disabled={!photo}
            aria-label={photo ? asFio(student) : undefined}
            onClick={() => {
              if (photo) setViewPhoto({ src: photo, title: asFio(student) })
            }}
            className={
              photo
                ? 'block w-full cursor-pointer rounded-xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-signal/40'
                : 'block w-full cursor-default'
            }
          >
            <div className="rounded-xl bg-linear-to-br from-signal via-teal to-signal/70 p-px">
              <SafeImage
                src={photo}
                alt={asFio(student)}
                size="sm"
                label={t('common.noImage')}
                className="aspect-3/4 w-full rounded-[11px]"
              />
            </div>
          </button>
          {canChangeMain ? (
            <Button
              variant="primary"
              size="icon-sm"
              style={miniIconStyle}
              className="absolute top-1 right-1 rounded-full ring-2 ring-white"
              aria-label={t('students.showPage.uploadImage')}
              onClick={() => mainFileRef.current?.click()}
            >
              <Pencil className="size-3" aria-hidden />
            </Button>
          ) : null}
          <input
            ref={mainFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) openFilePreview(file, 'image', t('students.showPage.uploadImage'))
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <h3 className="min-w-0 flex-1 font-display text-sm leading-snug font-semibold tracking-tight text-deep uppercase">
              {asFio(student)}
            </h3>
            <Button
              variant="ghost"
              size="icon-sm"
              style={miniIconStyle}
              aria-label={t('common.refresh')}
              onClick={refreshStudent}
            >
              <RefreshCw className="size-3.5" aria-hidden />
            </Button>
          </div>

          <p className="mt-1 flex items-start gap-1 text-[13px]">
            <Building2 className="mt-0.5 size-3.5 shrink-0 text-signal" aria-hidden />
            <span className="min-w-0 font-medium text-signal">
              {asLangName(student.organization, i18n.language)}
            </span>
          </p>

          <div className="mt-1.5 flex flex-wrap gap-1">
            <StatusChip label={t('students.showPage.pupil')}>
              <Badge tone={studentEduStatusTone(student.edu_status)}>
                {eduStatusLabel(status, t)}
              </Badge>
            </StatusChip>
            <StatusChip label={t('students.showPage.autodromeJoin')}>
              <Badge tone={student.is_join_autodrome ? 'teal' : 'rose'}>
                {student.is_join_autodrome
                  ? t('students.showPage.joined')
                  : t('students.showPage.notJoined')}
              </Badge>
            </StatusChip>
            {pending ? (
              <StatusChip label={t('students.showPage.cameraSend')}>
                {pendingImg ? (
                  <button
                    type="button"
                    aria-label={t('students.showPage.cameraSend')}
                    onClick={() =>
                      setViewPhoto({
                        src: pendingImg,
                        title: t('students.showPage.cameraSend'),
                      })
                    }
                    className="cursor-pointer rounded-full outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-signal/40"
                  >
                    <SafeImage
                      src={pendingImg}
                      alt={t('students.showPage.cameraSend')}
                      size="sm"
                      className="size-5 rounded-full ring-1 ring-mist/70"
                    />
                  </button>
                ) : null}
                <Badge tone={pendingMeta.tone}>{pendingMeta.label}</Badge>
              </StatusChip>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-1.5 border-t border-mist/60 bg-surface/80 p-2 sm:grid-cols-2">
        <InlineRow
          icon={Phone}
          label={t('students.phone')}
          editing={inline === 'phone'}
          canEdit={canUpdate}
          onEdit={() => {
            setPhoneDraft(student.phone1 || student.phone || '')
            setInline('phone')
          }}
          onCancel={() => setInline(null)}
          onSave={() => saveInline('phone')}
          saving={additional.isPending}
          display={
            <MissingValue
              value={student.phone1 || student.phone}
              fallback={t('students.showPage.notEntered')}
            />
          }
        >
          <PhoneInput
            label=""
            value={phoneDraft}
            onChange={(e) => setPhoneDraft(e.target.value)}
          />
        </InlineRow>

        <InlineRow
          icon={MapPin}
          label={t('directorProfile.address')}
          editing={inline === 'address'}
          canEdit={canUpdate}
          onEdit={() => {
            setAddressDraft(student.address || '')
            setInline('address')
          }}
          onCancel={() => setInline(null)}
          onSave={() => saveInline('address')}
          saving={additional.isPending}
          display={
            <MissingValue
              value={student.address}
              fallback={t('students.showPage.notEntered')}
            />
          }
        >
          <Input
            label=""
            value={addressDraft}
            onChange={(e) => setAddressDraft(e.target.value)}
          />
        </InlineRow>

        <InlineRow
          icon={Stethoscope}
          label={t('students.medical')}
          editing={inline === 'medical'}
          canEdit={canUpdate}
          onEdit={() => {
            setMedicalDraft(student.medical_sertificate || '')
            setInline('medical')
          }}
          onCancel={() => setInline(null)}
          onSave={() => saveInline('medical')}
          saving={additional.isPending}
          display={
            <MissingValue
              value={student.medical_sertificate}
              fallback={t('students.showPage.notEntered')}
            />
          }
        >
          <Input
            label=""
            value={medicalDraft}
            onChange={(e) => setMedicalDraft(e.target.value)}
          />
        </InlineRow>

        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-mist/60 bg-white px-2 py-1.5">
          {examPhoto ? (
            <button
              type="button"
              aria-label={t('students.showPage.examPhoto')}
              onClick={() =>
                setViewPhoto({ src: examPhoto, title: t('students.showPage.examPhoto') })
              }
              className="inline-flex size-7 shrink-0 cursor-pointer overflow-hidden rounded-md outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-signal/40"
            >
              <SafeImage
                src={examPhoto}
                alt={t('students.showPage.examPhoto')}
                size="sm"
                className="size-7 rounded-md"
              />
            </button>
          ) : (
            <span className="inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-signal-soft text-signal">
              <ImageIcon className="size-3.5" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
              {t('students.showPage.examPhoto')}
            </p>
            {!examPhoto ? (
              <div className="mt-0.5">
                <Badge tone="rose">{t('common.noImage')}</Badge>
              </div>
            ) : null}
          </div>
          {canChangeExam ? (
            <Button
              variant="ghost"
              size="icon-sm"
              style={miniIconStyle}
              aria-label={t('students.showPage.changeExamImage')}
              onClick={() => examFileRef.current?.click()}
            >
              <Pencil className="size-3 text-signal" aria-hidden />
            </Button>
          ) : null}
          <input
            ref={examFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) {
                openFilePreview(file, 'exam_image', t('students.showPage.changeExamImage'))
              }
            }}
          />
        </div>
      </div>

      {showActions ? (
        <div className="flex flex-wrap gap-1 border-t border-mist/60 bg-white px-2 py-1.5">
          {canSync ? (
            <Button
              variant="secondary"
              size="sm"
              style={compactBtnStyle}
              loading={syncMutation.isPending}
              onClick={() => syncMutation.mutate()}
            >
              <RefreshCw className="size-3" aria-hidden />
              {t('students.showPage.syncImage')}
            </Button>
          ) : null}
          {canGate ? (
            <Button
              variant="primary"
              size="sm"
              style={compactBtnStyle}
              className="bg-teal hover:bg-teal"
              loading={gateMutation.isPending}
              onClick={() => gateMutation.mutate()}
            >
              <ShieldCheck className="size-3" aria-hidden />
              {t('students.showPage.adaptGate')}
            </Button>
          ) : null}
          {canPassword ? (
            <Button variant="secondary" size="sm" style={compactBtnStyle} onClick={openAccounts}>
              <Lock className="size-3" aria-hidden />
              {t('students.showPage.loginAccounts')}
            </Button>
          ) : null}
          {canEditPage ? (
            <Button
              variant="secondary"
              size="sm"
              style={compactBtnStyle}
              onClick={() => navigate(studentEditPath(studentId))}
            >
              <Pencil className="size-3" aria-hidden />
              {t('common.edit')}
            </Button>
          ) : null}
        </div>
      ) : null}

      <Modal
        open={Boolean(viewPhoto)}
        onClose={() => setViewPhoto(null)}
        title={viewPhoto?.title}
        sizeClassName="max-w-lg"
        bodyClassName="p-3 sm:p-4"
      >
        {viewPhoto ? (
          <SafeImage
            src={viewPhoto.src}
            alt={viewPhoto.title}
            size="xl"
            fit="contain"
            className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
          />
        ) : null}
      </Modal>

      <ImageCropModal
        open={previewOpen}
        imageSrc={previewSrc}
        title={previewTitle}
        onClose={closePreview}
        onSave={(file) => imageMutation.mutate({ field: previewField, file })}
        saving={imageMutation.isPending}
        canUseImageGate={canGate}
      />

      <StudentAccessModal
        open={accountsOpen}
        onClose={() => setAccountsOpen(false)}
        student={student}
      />
    </Panel>
  )
}

function StatusChip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/85 px-1.5 py-0.5 ring-1 ring-mist/70">
      <span className="text-[11px] text-muted">{label}</span>
      {children}
    </span>
  )
}

function InlineRow({
  icon: Icon,
  label,
  editing,
  canEdit,
  onEdit,
  onCancel,
  onSave,
  saving,
  display,
  children,
}: {
  icon: LucideIcon
  label: string
  editing: boolean
  canEdit: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
  display: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-mist/60 bg-white px-2 py-1.5">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-signal-soft text-signal">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">{label}</p>
        <div className="mt-0.5 min-w-0 [&_input]:h-7 [&>div>span]:h-7">
          {editing ? children : display}
        </div>
      </div>
      {editing ? (
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="primary"
            size="icon-sm"
            style={miniIconStyle}
            loading={saving}
            aria-label="save"
            onClick={onSave}
          >
            <Check className="size-3" aria-hidden />
          </Button>
          <Button
            variant="danger"
            size="icon-sm"
            style={miniIconStyle}
            disabled={saving}
            aria-label="cancel"
            onClick={onCancel}
          >
            <X className="size-3" aria-hidden />
          </Button>
        </div>
      ) : canEdit ? (
        <Button
          variant="ghost"
          size="icon-sm"
          style={miniIconStyle}
          className="shrink-0"
          aria-label={label}
          onClick={onEdit}
        >
          <Pencil className="size-3 text-signal" aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}
