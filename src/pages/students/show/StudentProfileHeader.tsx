import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Check,
  Lock,
  Pencil,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  Badge,
  Button,
  Input,
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
    <Panel padding="md">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-40 shrink-0">
          <SafeImage
            src={photo}
            size="lg"
            label={t('common.noImage')}
            className="aspect-[370/472] w-40 rounded-xl ring-1 ring-mist/70"
          />
          {canChangeMain ? (
            <Button
              variant="primary"
              size="icon-sm"
              className="absolute top-2 right-2"
              aria-label={t('students.showPage.uploadImage')}
              onClick={() => mainFileRef.current?.click()}
            >
              <Pencil className="size-3.5" aria-hidden />
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

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 font-display text-base font-semibold uppercase text-deep">
              {asFio(student)}
            </h3>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t('common.refresh')}
              onClick={refreshStudent}
            >
              <RefreshCw className="size-4" aria-hidden />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="text-muted">{t('students.showPage.pupil')}:</span>
              <Badge tone={studentEduStatusTone(student.edu_status)}>
                {eduStatusLabel(status, t)}
              </Badge>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-muted">{t('students.showPage.autodromeJoin')}:</span>
              <Badge tone={student.is_join_autodrome ? 'teal' : 'rose'}>
                {student.is_join_autodrome
                  ? t('students.showPage.joined')
                  : t('students.showPage.notJoined')}
              </Badge>
            </span>
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <span className="text-muted">{t('students.showPage.cameraSend')}:</span>
                {pendingImg ? (
                  <SafeImage
                    src={pendingImg}
                    size="sm"
                    className="size-7 rounded-full ring-1 ring-mist/70"
                  />
                ) : null}
                <Badge tone={pendingMeta.tone}>{pendingMeta.label}</Badge>
              </span>
            ) : null}
          </div>

          <p className="text-sm text-ink">
            <span className="text-muted">{t('students.organization')}: </span>
            <span className="font-medium text-signal">
              {asLangName(student.organization, i18n.language)}
            </span>
          </p>

          <InlineRow
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

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">{t('students.showPage.examPhoto')}:</span>
            <SafeImage
              src={examPhoto}
              size="sm"
              className="size-8 rounded-full ring-1 ring-mist/70"
            />
            {canChangeExam ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t('students.showPage.changeExamImage')}
                onClick={() => examFileRef.current?.click()}
              >
                <Pencil className="size-3.5 text-signal" aria-hidden />
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
      </div>

      {showActions ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {canSync ? (
            <Button
              variant="secondary"
              size="sm"
              loading={syncMutation.isPending}
              onClick={() => syncMutation.mutate()}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              {t('students.showPage.syncImage')}
            </Button>
          ) : null}
          {canGate ? (
            <Button
              variant="primary"
              size="sm"
              className="bg-teal shadow-[0_10px_24px_rgba(47,160,140,0.28)] hover:bg-teal"
              loading={gateMutation.isPending}
              onClick={() => gateMutation.mutate()}
            >
              <ShieldCheck className="size-3.5" aria-hidden />
              {t('students.showPage.adaptGate')}
            </Button>
          ) : null}
          {canPassword ? (
            <Button variant="secondary" size="sm" onClick={openAccounts}>
              <Lock className="size-3.5" aria-hidden />
              {t('students.showPage.loginAccounts')}
            </Button>
          ) : null}
          {canEditPage ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(studentEditPath(studentId))}
            >
              <Pencil className="size-3.5" aria-hidden />
              {t('common.edit')}
            </Button>
          ) : null}
        </div>
      ) : null}

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

function InlineRow({
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
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="shrink-0 text-muted">{label}:</span>
      {editing ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1">{children}</div>
          <Button
            variant="primary"
            size="icon-sm"
            loading={saving}
            aria-label="save"
            onClick={onSave}
          >
            <Check className="size-3.5" aria-hidden />
          </Button>
          <Button
            variant="danger"
            size="icon-sm"
            disabled={saving}
            aria-label="cancel"
            onClick={onCancel}
          >
            <X className="size-3.5" aria-hidden />
          </Button>
        </div>
      ) : (
        <>
          {display}
          {canEdit ? (
            <Button variant="ghost" size="icon-sm" aria-label={label} onClick={onEdit}>
              <Pencil className="size-3.5 text-signal" aria-hidden />
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}
