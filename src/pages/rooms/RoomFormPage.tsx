import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Button,
  ErrorMessage,
  Input,
  Panel,
  Select,
  SkeletonLines,
  notify,
} from '@/components/ui'
import { routes } from '@/config'
import {
  useCreateRoomMutation,
  useRoomQuery,
  useUpdateRoomMutation,
} from '@/features/rooms'
import { useSmartBack } from '@/hooks'

export function RoomFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.rooms)
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useRoomQuery(mode === 'edit' ? id : undefined)
  const createMutation = useCreateRoomMutation()
  const updateMutation = useUpdateRoomMutation(id)
  const [name, setName] = useState('')
  const [status, setStatus] = useState('1')

  useEffect(() => {
    if (!data) return
    setName(data.name_uz || data.name || '')
    setStatus(data.status == null ? '1' : String(Number(data.status)))
  }, [data])

  const submit = () => {
    if (!name.trim()) {
      notify.error(t('roomsPage.fillRequired'))
      return
    }
    const fd = new FormData()
    fd.append('name_uz', name)
    fd.append('status', status)
    const onOk = () => {
      notify.success(mode === 'create' ? t('common.created') : t('common.saved'))
      navigate(routes.rooms)
    }
    const onErr = (err: Error) => notify.error(err.message || t('common.loadError'))
    if (mode === 'create') createMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    else updateMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
  }

  const title = mode === 'create' ? t('roomsPage.add') : t('roomsPage.edit')
  const waiting = mode === 'edit' && isLoading

  return (
    <>
      <Header
        title={title}
        actions={
          <Button variant="outline" size="sm" onClick={goBack}>
            {t('common.back')}
          </Button>
        }
      />
      <main className="flex-1 p-3 sm:p-4">
        {waiting ? (
          <Panel padding="md">
            <SkeletonLines lines={4} />
          </Panel>
        ) : mode === 'edit' && (isError || !data) ? (
          <ErrorMessage />
        ) : (
          <Panel padding="md" className="max-w-xl space-y-3">
            <Input
              required
              label={t('directorList.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Select
              label={t('directorList.status')}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '1', label: t('dashboard.active') },
                { value: '0', label: t('dashboard.inactive') },
              ]}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={goBack}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={createMutation.isPending || updateMutation.isPending}
                onClick={submit}
              >
                {t('common.save')}
              </Button>
            </div>
          </Panel>
        )}
      </main>
    </>
  )
}

export function RoomCreatePage() {
  return <RoomFormPage mode="create" />
}

export function RoomEditPage() {
  return <RoomFormPage mode="edit" />
}
