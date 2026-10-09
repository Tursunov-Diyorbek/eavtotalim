import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  Button,
  ConfirmDialog,
  DateInput,
  DeleteButton,
  EmptyState,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Textarea,
  TR,
  notify,
} from '@/components/ui'
import { useCreateHolidayMutation, useDeleteHolidayMutation, useHolidaysQuery } from '@/features/holidays'
import { formatDate } from '@/lib/format'
import type { HolidayItem } from '@/api/holidays'

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function daySpan(start: string, end: string) {
  const from = new Date(`${start}T00:00:00`).getTime()
  const to = new Date(`${end}T00:00:00`).getTime()
  return Math.round((to - from) / 86_400_000)
}

export function HolidaysPage() {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError } = useHolidaysQuery()
  const deleteMutation = useDeleteHolidayMutation()
  const createMutation = useCreateHolidayMutation()
  const [deleteRow, setDeleteRow] = useState<HolidayItem | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [comment, setComment] = useState('')
  const rows = data ?? []

  const openAdd = () => {
    setStartDate('')
    setEndDate('')
    setComment('')
    setAddOpen(true)
  }

  const save = () => {
    if (!startDate || !endDate || !comment.trim()) {
      notify.warning(t('holidaysPage.fillRequired'))
      return
    }
    const span = daySpan(startDate, endDate)
    if (span < 0 || span > 7) {
      notify.warning(t('holidaysPage.rangeLimit'))
      return
    }
    const fd = new FormData()
    fd.append('start_date', startDate)
    fd.append('end_date', endDate)
    fd.append('comment', comment.trim())
    createMutation.mutate(fd, {
      onSuccess: () => {
        notify.success(t('common.created'))
        setAddOpen(false)
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  return (
    <>
      <Header
        title={t('nav.holidays')}
        actions={<AddButton onClick={openAdd}>{t('holidaysPage.add')}</AddButton>}
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <Table>
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('directorList.description')}</TH>
                <TH className="w-36 text-center">{t('directorList.startDate')}</TH>
                <TH className="w-36 text-center">{t('directorList.endDate')}</TH>
                <TH className="w-14 min-w-14 max-w-14 text-center">{t('common.actions')}</TH>
              </HeaderTR>
            </THead>
            <TBody>
              {rows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-center text-muted">{index + 1}</TD>
                  <TD>{row.comment || '—'}</TD>
                  <TD className="text-center">
                    <Badge tone="teal">{formatDate(row.start_date, i18n.language) ?? '—'}</Badge>
                  </TD>
                  <TD className="text-center">
                    <Badge tone="rose">{formatDate(row.end_date, i18n.language) ?? '—'}</Badge>
                  </TD>
                  <TD className="w-14 min-w-14 max-w-14 text-center">
                    <DeleteButton onClick={() => setDeleteRow(row)} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </PageMain>
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
        description={t('common.confirmDelete', { name: deleteRow?.comment })}
        loading={deleteMutation.isPending}
      />
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t('holidaysPage.modalTitle')}
        sizeClassName="max-w-lg"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="danger" size="sm" onClick={() => setAddOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" loading={createMutation.isPending} onClick={save}>
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <div>
            <p className="mb-1 text-[13px] font-medium text-deep">{t('holidaysPage.rangeLabel')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <DateInput
                label={t('directorList.startDate')}
                value={startDate}
                onChange={(event) => {
                  const next = event.target.value
                  setStartDate(next)
                  if (endDate && next && (daySpan(next, endDate) < 0 || daySpan(next, endDate) > 7)) {
                    setEndDate('')
                  }
                }}
              />
              <DateInput
                label={t('directorList.endDate')}
                value={endDate}
                min={startDate || undefined}
                max={startDate ? addDays(startDate, 7) : undefined}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
          <Textarea
            label={t('holidaysPage.commentLabel')}
            placeholder={t('holidaysPage.commentPh')}
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </div>
      </Modal>
    </>
  )
}
