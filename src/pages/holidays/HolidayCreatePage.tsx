import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { Button, DateInput, Input, Panel, notify } from '@/components/ui'
import { routes } from '@/config'
import { useCreateHolidayMutation } from '@/features/holidays'
import { useSmartBack } from '@/hooks'

export function HolidayCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.holidays)
  const createMutation = useCreateHolidayMutation()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [comment, setComment] = useState('')

  const submit = () => {
    if (!startDate || !endDate || !comment.trim()) {
      notify.error(t('holidaysPage.fillRequired'))
      return
    }
    const fd = new FormData()
    fd.append('start_date', startDate)
    fd.append('end_date', endDate)
    fd.append('comment', comment)
    createMutation.mutate(fd, {
      onSuccess: () => {
        notify.success(t('common.created'))
        navigate(routes.holidays)
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  return (
    <>
      <Header
        title={t('holidaysPage.add')}
        actions={
          <Button variant="outline" size="sm" onClick={goBack}>
            {t('common.back')}
          </Button>
        }
      />
      <main className="flex-1 p-3 sm:p-4">
        <Panel padding="md" className="max-w-xl space-y-3">
          <DateInput
            required
            label={t('directorList.startDate')}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <DateInput
            required
            label={t('directorList.endDate')}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Input
            required
            label={t('directorList.description')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={goBack}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createMutation.isPending}
              onClick={submit}
            >
              {t('common.save')}
            </Button>
          </div>
        </Panel>
      </main>
    </>
  )
}
