import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, Camera, ImageUp, MapPinned, RotateCcw, Send, Users } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Pagination,
  SafeImage,
  Table,
  TableSearch,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tooltip,
  notify,
} from '@/components/ui'
import { routes } from '@/config'
import {
  useAutodromeOrganizationStudentsQuery,
  useResendAutodromeStudentMutation,
  useReturnAutodromeStudentImageMutation,
  useUpdateAutodromeStudentImageMutation,
} from '@/features/autodrome-attendance'
import { useAuth } from '@/features/auth'
import { usePageState, useSmartBack } from '@/hooks'
import { asFio } from '@/lib/apiPage'
import type { AutodromeOrganizationStudent } from '@/types/autodrome-attendance'

const CAN_UPDATE_IMAGE = 'update-image-autodrome-organization-student'
const CAN_RESEND = 'resend-autodrome-organization-student'

type ConfirmTarget = { kind: 'returnImage' | 'resend'; student: AutodromeOrganizationStudent }

function fullName(row: AutodromeOrganizationStudent) {
  const full = row.full_name?.trim()
  if (full) return full
  return asFio(row)
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : undefined
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value?: string | null
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-mist/70 bg-white px-4 py-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-signal-soft text-signal">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-muted">{label}</p>
        <p className="truncate text-sm font-semibold text-deep" title={value || undefined}>
          {value?.trim() || '—'}
        </p>
      </div>
    </div>
  )
}

function ImageUpdateModal({
  student,
  onClose,
}: {
  student: AutodromeOrganizationStudent | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  const mutation = useUpdateAutodromeStudentImageMutation()

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const close = () => {
    if (mutation.isPending) return
    setFile(null)
    onClose()
  }

  const submit = () => {
    if (!student || !file) return
    mutation.mutate(
      { id: student.id, image: file },
      {
        onSuccess: () => {
          notify.success(t('autodromeAttendancePage.imageChanged'))
          setFile(null)
          onClose()
        },
        onError: (error) => notify.error(errorText(error) ?? t('common.loadError')),
      },
    )
  }

  return (
    <Modal
      open={Boolean(student)}
      onClose={close}
      dismissible={!mutation.isPending}
      sizeClassName="max-w-xl"
      title={`${student ? fullName(student) : ''} — ${t('autodromeAttendancePage.changeImage')}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={mutation.isPending} onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button loading={mutation.isPending} disabled={!file} onClick={submit}>
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[12px] font-medium text-muted">
            {t('autodromeAttendancePage.currentImage')}
          </p>
          <SafeImage
            src={student?.image}
            alt={student ? fullName(student) : ''}
            fit="cover"
            className="aspect-[3/4] w-full rounded-xl"
            label={t('common.noImage')}
          />
        </div>
        <div className="space-y-2">
          <p className="text-[12px] font-medium text-muted">
            {t('autodromeAttendancePage.newImage')}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group relative grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-xl border-2 border-dashed border-mist bg-surface transition hover:border-signal/50 hover:bg-signal-soft/30"
          >
            {preview ? (
              <>
                <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-deep/60 py-2 text-center text-[12px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {t('autodromeAttendancePage.chooseImage')}
                </span>
              </>
            ) : (
              <span className="flex flex-col items-center gap-2 px-4 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-signal-soft text-signal">
                  <ImageUp className="size-5" />
                </span>
                <span className="text-sm font-medium text-deep">
                  {t('autodromeAttendancePage.chooseImage')}
                </span>
                <span className="text-[12px] text-muted">
                  {t('autodromeAttendancePage.chooseImageHint')}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function AutodromeConnectedStudentsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const goBack = useSmartBack(routes.autodromeOrganizationGroup)
  const { hasPermission } = useAuth()
  const canUpdateImage = hasPermission(CAN_UPDATE_IMAGE)
  const canResend = hasPermission(CAN_RESEND)
  const hasActions = canUpdateImage || canResend

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)
  const [word, setWord] = usePageState('word', '')
  const [imageTarget, setImageTarget] = useState<AutodromeOrganizationStudent | null>(null)
  const [preview, setPreview] = useState<AutodromeOrganizationStudent | null>(null)
  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null)

  const { data, isLoading, isError, error } = useAutodromeOrganizationStudentsQuery({
    groupId: id,
    word,
    page,
    showCount: pageSize,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const first = rows[0]

  const returnImage = useReturnAutodromeStudentImageMutation()
  const resend = useResendAutodromeStudentMutation()
  const confirmPending = returnImage.isPending || resend.isPending

  const runConfirm = () => {
    if (!confirm) return
    const mutation = confirm.kind === 'returnImage' ? returnImage : resend
    const success =
      confirm.kind === 'returnImage'
        ? t('autodromeAttendancePage.imageReturned')
        : t('autodromeAttendancePage.resent')
    mutation.mutate(confirm.student.id, {
      onSuccess: () => {
        notify.success(success)
        setConfirm(null)
      },
      onError: (err) => notify.error(errorText(err) ?? t('common.loadError')),
    })
  }

  const colSpan = 4 + (hasActions ? 1 : 0)

  return (
    <>
      <Header
        onBack={goBack}
        title={
          <>
            <span>{first?.group?.name ? `${first.group.name} — ` : ''}</span>
            <span>{t('autodromeAttendancePage.connectedTitle')}</span>{' '}
            <span className="text-muted">({t('autodromeAttendancePage.groupId', { id })})</span>
          </>
        }
        actions={
          <Badge tone="teal">{t('autodromeAttendancePage.totalHash', { count: total })}</Badge>
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage>{errorText(error)}</ErrorMessage>
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <>
            <div className="grid shrink-0 gap-3 md:grid-cols-3">
              <InfoCard
                icon={<Users className="size-5" />}
                label={t('directorList.group')}
                value={first?.group?.name}
              />
              <InfoCard
                icon={<Building2 className="size-5" />}
                label={t('autodromeAttendancePage.organization')}
                value={first?.organization?.name}
              />
              <InfoCard
                icon={<MapPinned className="size-5" />}
                label={t('directorList.autodrome')}
                value={first?.autodrome?.name}
              />
            </div>

            <Table storageKey="autodrome-connected-students">
              <THead>
                <HeaderTR>
                  <TH column="index" className="w-12 text-center">
                    №
                  </TH>
                  <TH column="photo" className="w-24 text-center">
                    {t('autodromeAttendancePage.photo')}
                  </TH>
                  <TH column="fio" className="min-w-72">
                    {t('statsPage.fish')}
                  </TH>
                  <TH column="passport" className="w-40 text-center">
                    {t('autodromeAttendancePage.passport')}
                  </TH>
                  {hasActions ? (
                    <TH column="actions" className="w-36 text-center">
                      {t('common.actions')}
                    </TH>
                  ) : null}
                </HeaderTR>
                <FilterTR>
                  <FilterTH column="index" />
                  <FilterTH column="photo" />
                  <FilterTH column="fio">
                    <TableSearch
                      id="autodrome-connected-search"
                      name="autodrome-connected-search"
                      label=""
                      placeholder={t('autodromeAttendancePage.searchStudent')}
                      value={word}
                      onChange={(e) => {
                        setWord(e.target.value)
                        setPage(1)
                      }}
                    />
                  </FilterTH>
                  <FilterTH column="passport" />
                  {hasActions ? <FilterTH column="actions" /> : null}
                </FilterTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR
                    colSpan={colSpan}
                    description={
                      word.trim() ? t('common.empty') : t('autodromeAttendancePage.noConnected')
                    }
                  />
                ) : (
                  rows.map((row, index) => {
                    const name = fullName(row)
                    return (
                      <TR key={row.id}>
                        <TD column="index" className="text-center text-[12px] text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD column="photo" className="py-2!">
                          <button
                            type="button"
                            className="mx-auto block rounded-xl transition hover:ring-2 hover:ring-signal/30 disabled:cursor-default disabled:hover:ring-0"
                            disabled={!row.image}
                            onClick={() => setPreview(row)}
                            aria-label={name}
                          >
                            <SafeImage
                              src={row.image}
                              alt={name}
                              fit="cover"
                              className="h-16 w-12 rounded-xl"
                              label={t('common.noImage')}
                            />
                          </button>
                        </TD>
                        <TD column="fio">
                          <span className="block truncate font-medium text-deep" title={name}>
                            {name}
                          </span>
                        </TD>
                        <TD column="passport" className="text-center">
                          {row.passport ? (
                            <Badge tone="neutral" className="font-mono tracking-wider">
                              {row.passport}
                            </Badge>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </TD>
                        {hasActions ? (
                          <TD column="actions">
                            <div className="flex items-center justify-center gap-1.5">
                              {canUpdateImage ? (
                                <>
                                  <Tooltip content={t('autodromeAttendancePage.changeImage')}>
                                    <Button
                                      variant="soft"
                                      size="icon-sm"
                                      aria-label={t('autodromeAttendancePage.changeImage')}
                                      onClick={() => setImageTarget(row)}
                                    >
                                      <Camera className="size-3.5" />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content={t('autodromeAttendancePage.returnImage')}>
                                    <Button
                                      variant="outline"
                                      size="icon-sm"
                                      aria-label={t('autodromeAttendancePage.returnImage')}
                                      onClick={() => setConfirm({ kind: 'returnImage', student: row })}
                                    >
                                      <RotateCcw className="size-3.5" />
                                    </Button>
                                  </Tooltip>
                                </>
                              ) : null}
                              {canResend ? (
                                <Tooltip content={t('autodromeAttendancePage.resend')}>
                                  <Button
                                    variant="outline"
                                    size="icon-sm"
                                    aria-label={t('autodromeAttendancePage.resend')}
                                    onClick={() => setConfirm({ kind: 'resend', student: row })}
                                  >
                                    <Send className="size-3.5" />
                                  </Button>
                                </Tooltip>
                              ) : null}
                            </div>
                          </TD>
                        ) : null}
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
          </>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>

      <ImageUpdateModal student={imageTarget} onClose={() => setImageTarget(null)} />

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        sizeClassName="max-w-md"
        title={preview ? fullName(preview) : ''}
      >
        {preview ? (
          <SafeImage
            src={preview.image}
            alt={fullName(preview)}
            fit="contain"
            className="aspect-[3/4] w-full rounded-xl bg-surface"
            label={t('common.noImage')}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => (confirmPending ? undefined : setConfirm(null))}
        onConfirm={runConfirm}
        loading={confirmPending}
        title={
          confirm?.kind === 'returnImage'
            ? t('autodromeAttendancePage.returnImage')
            : t('autodromeAttendancePage.resend')
        }
        confirmLabel={
          confirm?.kind === 'returnImage'
            ? t('autodromeAttendancePage.returnImage')
            : t('autodromeAttendancePage.resend')
        }
        description={confirm ? fullName(confirm.student) : undefined}
      />
    </>
  )
}
