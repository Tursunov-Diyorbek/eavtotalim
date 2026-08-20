import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Button,
  ErrorMessage,
  Input,
  Panel,
  SkeletonLines,
  notify,
} from '@/components/ui'
import { routes } from '@/config'
import {
  useCreateTrailerMutation,
  useTrailerQuery,
  useUpdateTrailerMutation,
} from '@/features/trailers'
import { useSmartBack } from '@/hooks'

export function TrailerFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.trailers)
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useTrailerQuery(mode === 'edit' ? id : undefined)
  const createMutation = useCreateTrailerMutation()
  const updateMutation = useUpdateTrailerMutation(id)
  const [number, setNumber] = useState('')

  useEffect(() => {
    if (data?.number) setNumber(data.number)
  }, [data])

  const submit = () => {
    if (!number.trim()) {
      notify.error(t('trailersPage.fillRequired'))
      return
    }
    const fd = new FormData()
    fd.append('number', number)
    const onOk = () => {
      notify.success(mode === 'create' ? t('common.created') : t('common.saved'))
      navigate(routes.trailers)
    }
    const onErr = (err: Error) => notify.error(err.message || t('common.loadError'))
    if (mode === 'create') createMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    else updateMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
  }

  const waiting = mode === 'edit' && isLoading
  const title = mode === 'create' ? t('trailersPage.add') : t('trailersPage.edit')

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
            <SkeletonLines lines={3} />
          </Panel>
        ) : mode === 'edit' && (isError || !data) ? (
          <ErrorMessage />
        ) : (
          <Panel padding="md" className="max-w-xl space-y-3">
            <Input
              required
              label={t('directorList.number')}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
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

export function TrailerCreatePage() {
  return <TrailerFormPage mode="create" />
}

export function TrailerEditPage() {
  return <TrailerFormPage mode="edit" />
}
