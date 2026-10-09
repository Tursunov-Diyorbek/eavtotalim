import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageOff, ImagePlus } from 'lucide-react'
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
  Select,
  ShowButton,
  notify,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useRoomsQuery,
  useUpdateAnyRoomMutation,
} from '@/features/rooms'
import { resolveFileUrl } from '@/features/lessons'
import type { RoomItem } from '@/api/rooms'

const MAX_PHOTO = 4 * 1024 * 1024

function photoUrl(value?: string | null) {
  return value ? resolveFileUrl(value, PATH_PREFIX_FILE) : ''
}

function roomName(row: RoomItem) {
  return row.name_uz?.trim() || row.name?.trim() || ''
}

function RoomPhotoField({
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
      <p className="mb-1 text-[13px] font-medium text-deep">{t('roomsPage.photo')}</p>
      <input
        id="room-image"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const next = event.target.files?.[0] ?? null
          if (next && next.size >= MAX_PHOTO) {
            notify.warning(t('roomsPage.fileTooBig'))
            event.target.value = ''
            return
          }
          onFile(next)
        }}
      />
      {src ? (
        <div className="relative h-36 overflow-hidden rounded-xl border border-mist/70 bg-fog">
          <SafeImage src={src} alt="" size="lg" icon={ImageOff} fit="contain" className="size-full" />
          <div className="absolute top-1.5 right-1.5">
            <DeleteButton
              onClick={() => {
                const input = document.getElementById('room-image') as HTMLInputElement | null
                if (input) input.value = ''
                onClear()
              }}
            />
          </div>
        </div>
      ) : (
        <label
          htmlFor="room-image"
          title={t('roomsPage.uploadPhoto')}
          className="flex h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-mist bg-fog text-muted hover:border-signal hover:text-signal"
        >
          <ImagePlus className="size-6" aria-hidden />
          <span className="text-xs">{t('roomsPage.uploadPhoto')}</span>
        </label>
      )}
    </div>
  )
}

function RoomFormModal({
  open,
  room,
  onClose,
}: {
  open: boolean
  room: RoomItem | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const createMutation = useCreateRoomMutation()
  const updateMutation = useUpdateAnyRoomMutation()
  const [name, setName] = useState('')
  const [status, setStatus] = useState('1')
  const [file, setFile] = useState<File | null>(null)
  const [keepImage, setKeepImage] = useState(true)

  useEffect(() => {
    if (!open) return
    setName(room ? roomName(room) : '')
    setStatus(room?.status == null ? '1' : String(Number(room.status) === 1 ? 1 : 0))
    setFile(null)
    setKeepImage(Boolean(room?.photo))
  }, [open, room])

  const editing = Boolean(room)
  const currentSrc = editing && keepImage ? photoUrl(room?.photo) : ''
  const pending = createMutation.isPending || updateMutation.isPending

  const save = () => {
    if (!name.trim()) {
      notify.warning(t('roomsPage.fillRequired'))
      return
    }
    const fd = new FormData()
    fd.append('name_uz', name.trim())
    fd.append('status', status)
    if (file) fd.append('photo', file)
    const onOk = () => {
      notify.success(editing ? t('common.saved') : t('common.created'))
      onClose()
    }
    const onErr = (err: Error) => notify.error(err.message || t('common.loadError'))
    if (editing && room) {
      updateMutation.mutate({ id: room.id, formData: fd }, { onSuccess: onOk, onError: onErr })
    } else {
      createMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('roomsPage.editWindow') : t('roomsPage.addWindow')}
      sizeClassName="max-w-md"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!name.trim()}
            loading={pending}
            onClick={save}
          >
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3">
        <RoomPhotoField
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
          label={t('roomsPage.name')}
          placeholder={t('roomsPage.namePh')}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Select
          label={t('directorList.status')}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={[
            { value: '1', label: t('dashboard.active') },
            { value: '0', label: t('dashboard.inactive') },
          ]}
        />
      </div>
    </Modal>
  )
}

/** Tirkamalar kartochkasiga o‘xshash xonalar ro‘yxati. */
export function RoomsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useRoomsQuery()
  const deleteMutation = useDeleteRoomMutation()
  const rows = data ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RoomItem | null>(null)
  const [viewing, setViewing] = useState<RoomItem | null>(null)
  const [deleteRow, setDeleteRow] = useState<RoomItem | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  return (
    <>
      <Header
        title={t('nav.rooms')}
        actions={
          <AddButton
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            {t('roomsPage.addBtn')}
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
              const src = photoUrl(row.photo)
              const active = Number(row.status) !== 0
              const name = roomName(row) || '—'
              return (
                <article
                  key={row.id}
                  className="flex overflow-hidden rounded-2xl border border-mist/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                >
                  <span className={`w-1 shrink-0 ${active ? 'bg-teal' : 'bg-rose'}`} aria-hidden />
                  <div className="flex min-w-0 flex-1 gap-3 p-2.5">
                    <div className="h-[108px] w-[78px] shrink-0 overflow-hidden rounded-xl bg-fog">
                      {src ? (
                        <Button
                          variant="ghost"
                          size="inline"
                          className="!size-full !rounded-xl !p-0"
                          aria-label={t('roomsPage.photo')}
                          onClick={() => setPreview(src)}
                        >
                          <SafeImage src={src} alt={name} size="md" icon={ImageOff} className="size-full" />
                        </Button>
                      ) : (
                        <SafeImage src="" alt="" size="md" icon={ImageOff} className="size-full" />
                      )}
                    </div>
                    <dl className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 text-[12px]">
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted">{t('roomsPage.name')}</dt>
                        <dd className="truncate font-semibold text-deep" title={name}>
                          {name}
                        </dd>
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

      <RoomFormModal
        open={formOpen}
        room={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      />

      <Modal
        open={viewing != null}
        onClose={() => setViewing(null)}
        title={t('roomsPage.showWindow')}
        sizeClassName="max-w-md"
      >
        {viewing ? (
          <div className="space-y-3">
            {photoUrl(viewing.photo) ? (
              <Button
                variant="ghost"
                size="inline"
                className="!h-44 !w-full !overflow-hidden !rounded-2xl !p-0"
                aria-label={t('roomsPage.photo')}
                onClick={() => setPreview(photoUrl(viewing.photo))}
              >
                <SafeImage
                  src={photoUrl(viewing.photo)}
                  alt={roomName(viewing)}
                  icon={ImageOff}
                  size="xl"
                  fit="cover"
                  className="size-full"
                />
              </Button>
            ) : (
              <SafeImage src="" alt="" icon={ImageOff} size="xl" className="h-44 w-full rounded-2xl bg-fog" />
            )}
            <dl className="divide-y divide-mist/70 overflow-hidden rounded-xl border border-mist/70">
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <dt className="text-xs text-muted">{t('roomsPage.name')}</dt>
                <dd className="truncate font-display text-sm font-semibold text-deep">
                  {roomName(viewing) || '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <dt className="text-xs text-muted">{t('directorList.status')}</dt>
                <dd>
                  <Badge tone={Number(viewing.status) !== 0 ? 'teal' : 'rose'}>
                    {Number(viewing.status) !== 0 ? t('dashboard.active') : t('dashboard.inactive')}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={preview != null}
        onClose={() => setPreview(null)}
        title={t('roomsPage.photo')}
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
        description={deleteRow ? roomName(deleteRow) : undefined}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
