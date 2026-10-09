import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ImageOff, ImagePlus, Minus } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  Button,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  EmptyState,
  ErrorMessage,
  Input,
  ListPageSkeleton,
  Modal,
  SafeImage,
  ShowButton,
  notify,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import {
  useCreateTrailerMutation,
  useDeleteTrailerMutation,
  useDisableTrailerMutation,
  useEnableTrailerMutation,
  useTrailersQuery,
  useUpdateAnyTrailerMutation,
} from '@/features/trailers'
import { resolveFileUrl } from '@/features/lessons'
import type { TrailerItem } from '@/api/trailers'

function photoUrl(value?: string | null) {
  return value ? resolveFileUrl(value, PATH_PREFIX_FILE) : ''
}

function mspdTone(status: TrailerItem['mspd_status']) {
  const code = Number(status)
  if (code === 1) return 'teal' as const
  if (code === 2) return 'rose' as const
  if (code === 0) return 'amber' as const
  return 'neutral' as const
}

function TrailerPhotoField({
  file,
  currentSrc,
  onFile,
  onClear,
}: {
  file: File | null
  currentSrc: string
  onFile: (file: File | null) => void
  onClear: () => void
}) {
  const { t } = useTranslation()
  const [localUrl, setLocalUrl] = useState('')

  useEffect(() => {
    if (!file) {
      setLocalUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    setLocalUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const src = localUrl || currentSrc

  return (
    <div>
      <p className="mb-1 text-[13px] font-medium text-deep">
        {t('trailersPage.photo')} <span className="text-rose">*</span>
      </p>
      <input
        id="trailer-image"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      {src ? (
        <div className="relative h-36 overflow-hidden rounded-xl border border-mist/70 bg-fog">
          <SafeImage src={src} alt="" size="lg" icon={ImageOff} fit="contain" className="size-full" />
          <div className="absolute top-1.5 right-1.5">
            <DeleteButton
              onClick={() => {
                const input = document.getElementById('trailer-image') as HTMLInputElement | null
                if (input) input.value = ''
                onClear()
              }}
            />
          </div>
        </div>
      ) : (
        <label
          htmlFor="trailer-image"
          title={t('trailersPage.uploadPhoto')}
          className="flex h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-mist bg-fog text-muted hover:border-signal hover:text-signal"
        >
          <ImagePlus className="size-6" aria-hidden />
          <span className="text-xs">{t('trailersPage.uploadPhoto')}</span>
        </label>
      )}
    </div>
  )
}

function TrailerFormModal({
  open,
  trailer,
  onClose,
}: {
  open: boolean
  trailer: TrailerItem | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const createMutation = useCreateTrailerMutation()
  const updateMutation = useUpdateAnyTrailerMutation()
  const [number, setNumber] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [keepImage, setKeepImage] = useState(true)

  useEffect(() => {
    if (!open) return
    setNumber(trailer?.number ?? '')
    setFile(null)
    setKeepImage(Boolean(trailer?.image))
  }, [open, trailer])

  const editing = Boolean(trailer)
  const currentSrc = editing && keepImage ? photoUrl(trailer?.image) : ''
  const canSave = Boolean(number.trim()) && (editing ? keepImage || Boolean(file) : Boolean(file))
  const pending = createMutation.isPending || updateMutation.isPending

  const save = () => {
    if (!number.trim()) {
      notify.warning(t('trailersPage.numberRequired'))
      return
    }
    if (!editing && !file) {
      notify.warning(t('trailersPage.photoRequired'))
      return
    }
    const fd = new FormData()
    fd.append('number', number.trim())
    if (file) fd.append('image', file)
    const onOk = () => {
      notify.success(editing ? t('common.saved') : t('common.created'))
      onClose()
    }
    const onErr = (err: Error) => notify.error(err.message || t('common.loadError'))
    if (editing && trailer) {
      updateMutation.mutate({ id: trailer.id, formData: fd }, { onSuccess: onOk, onError: onErr })
    } else {
      createMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('trailersPage.editWindow') : t('trailersPage.addWindow')}
      sizeClassName="max-w-xl"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" disabled={!canSave} loading={pending} onClick={save}>
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3">
        <TrailerPhotoField
          file={file}
          currentSrc={currentSrc}
          onFile={(next) => {
            setFile(next)
            if (next) setKeepImage(true)
          }}
          onClear={() => {
            setFile(null)
            setKeepImage(false)
          }}
        />
        <Input
          required
          label={t('trailersPage.number')}
          placeholder={t('trailersPage.numberPh')}
          value={number}
          onChange={(event) => setNumber(event.target.value)}
        />
      </div>
    </Modal>
  )
}

/** Eski `CarTrailers` — kartochka, qo‘shish/tahrir/ko‘rish oynalari. */
export function TrailersPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useTrailersQuery()
  const deleteMutation = useDeleteTrailerMutation()
  const enableMutation = useEnableTrailerMutation()
  const disableMutation = useDisableTrailerMutation()
  const rows = data ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TrailerItem | null>(null)
  const [viewing, setViewing] = useState<TrailerItem | null>(null)
  const [deleteRow, setDeleteRow] = useState<TrailerItem | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const mspdLabel = (status: TrailerItem['mspd_status']) => {
    const code = Number(status)
    if (code === 0) return t('trailersPage.checking')
    if (code === 1) return t('trailersPage.correct')
    if (code === 2) return t('trailersPage.wrong')
    return '—'
  }

  const onToast = {
    onSuccess: () => notify.success(t('common.saved')),
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  }

  return (
    <>
      <Header
        title={t('nav.trailers')}
        actions={
          <AddButton
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            {t('trailersPage.addBtn')}
          </AddButton>
        }
      />
      <PageMain>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(300px,360px))]">
            {rows.map((row) => {
              const src = photoUrl(row.image)
              const active = Number(row.status) === 1
              const mspd = Number(row.mspd_status)
              const accent =
                mspd === 2 ? 'bg-rose' : mspd === 0 ? 'bg-amber' : active ? 'bg-teal' : 'bg-mist'
              return (
                <article
                  key={row.id}
                  className="flex overflow-hidden rounded-2xl border border-mist/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                >
                  <span className={`w-1 shrink-0 ${accent}`} aria-hidden />
                  <div className="flex min-w-0 flex-1 gap-3 p-2.5">
                    <div className="h-[108px] w-[78px] shrink-0 overflow-hidden rounded-xl bg-fog">
                      {src ? (
                        <Button
                          variant="ghost"
                          size="inline"
                          className="!size-full !rounded-xl !p-0"
                          aria-label={t('trailersPage.photo')}
                          onClick={() => setPreview(src)}
                        >
                          <SafeImage src={src} alt="" size="md" icon={ImageOff} className="size-full" />
                        </Button>
                      ) : (
                        <SafeImage src="" alt="" size="md" icon={ImageOff} className="size-full" />
                      )}
                    </div>
                    <dl className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 text-[12px]">
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted">{t('trailersPage.numberShort')}</dt>
                        <dd className="truncate font-semibold text-deep">{row.number || '—'}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted">{t('directorList.status')}</dt>
                        <dd>
                          <Badge tone={active ? 'teal' : 'rose'}>
                            {active ? t('dashboard.active') : t('dashboard.inactive')}
                          </Badge>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted">{t('trailersPage.info')}</dt>
                        <dd>
                          <Badge tone={mspdTone(row.mspd_status)}>{mspdLabel(row.mspd_status)}</Badge>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted">{t('common.actions')}</dt>
                        <dd className="flex gap-1">
                          <ShowButton onClick={() => setViewing(row)} />
                          <EditButton
                            onClick={() => {
                              setEditing(row)
                              setFormOpen(true)
                            }}
                          />
                          <DeleteButton onClick={() => setDeleteRow(row)} />
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </PageMain>

      <TrailerFormModal
        open={formOpen}
        trailer={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      />

      <Modal
        open={viewing != null}
        onClose={() => setViewing(null)}
        title={t('trailersPage.showWindow')}
        sizeClassName="max-w-md"
      >
        {viewing ? (
          <div className="space-y-3">
            {photoUrl(viewing.image) ? (
              <Button
                variant="ghost"
                size="inline"
                className="!h-44 !w-full !overflow-hidden !rounded-2xl !p-0"
                aria-label={t('trailersPage.photo')}
                onClick={() => setPreview(photoUrl(viewing.image))}
              >
                <SafeImage
                  src={photoUrl(viewing.image)}
                  alt={viewing.number ?? ''}
                  icon={ImageOff}
                  size="xl"
                  fit="cover"
                  className="size-full"
                />
              </Button>
            ) : (
              <SafeImage
                src=""
                alt=""
                icon={ImageOff}
                size="xl"
                className="h-44 w-full rounded-2xl bg-fog"
              />
            )}
            <dl className="divide-y divide-mist/70 overflow-hidden rounded-xl border border-mist/70">
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <dt className="text-xs text-muted">{t('trailersPage.numberShort')}</dt>
                <dd className="font-display text-sm font-semibold tracking-wide text-deep">
                  {viewing.number || '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <dt className="text-xs text-muted">{t('directorList.status')}</dt>
                <dd>
                  <Badge tone={Number(viewing.status) === 1 ? 'teal' : 'rose'}>
                    {Number(viewing.status) === 1 ? t('dashboard.active') : t('dashboard.inactive')}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <dt className="text-xs text-muted">{t('trailersPage.info')}</dt>
                <dd>
                  <Badge tone={mspdTone(viewing.mspd_status)}>{mspdLabel(viewing.mspd_status)}</Badge>
                </dd>
              </div>
            </dl>
            {Number(viewing.status) === 1 ? (
              <Button
                variant="danger"
                className="w-full"
                loading={disableMutation.isPending}
                onClick={() =>
                  disableMutation.mutate(viewing.id, {
                    ...onToast,
                    onSuccess: () => {
                      notify.success(t('common.saved'))
                      setViewing(null)
                    },
                  })
                }
              >
                <Minus className="size-3.5" aria-hidden />
                {t('trailersPage.stop')}
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                loading={enableMutation.isPending}
                onClick={() =>
                  enableMutation.mutate(viewing.id, {
                    ...onToast,
                    onSuccess: () => {
                      notify.success(t('common.saved'))
                      setViewing(null)
                    },
                  })
                }
              >
                <Check className="size-3.5" aria-hidden />
                {t('trailersPage.activate')}
              </Button>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={preview != null}
        onClose={() => setPreview(null)}
        title={t('trailersPage.photo')}
        sizeClassName="max-w-3xl"
        bodyClassName="p-3 sm:p-4"
      >
        <SafeImage
          src={preview ?? ''}
          alt=""
          icon={ImageOff}
          size="xl"
          fit="contain"
          className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => {
          if (!deleteRow) return
          deleteMutation.mutate(deleteRow.id, {
            onSuccess: () => {
              notify.success(t('common.deleted'))
              setDeleteRow(null)
            },
            onError: (err) => notify.error(err.message || t('common.loadError')),
          })
        }}
        title={t('common.delete')}
        description={deleteRow?.number ?? undefined}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
