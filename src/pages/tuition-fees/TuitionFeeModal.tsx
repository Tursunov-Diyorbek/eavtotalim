import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Modal, Select, notify } from '@/components/ui'
import { useStoreTuitionFeeMutation } from '@/features/tuition-fees'
import type { TuitionFeeItem } from '@/types/tuition-fees'

const PRICE_MAX = 10_000_000
const PAY_MAX = 100

function digitsOf(value: string) {
  return value.replace(/\D/g, '')
}

function formatGrouped(raw: string) {
  const digits = digitsOf(raw)
  if (!digits) return ''
  return Number(digits).toLocaleString('en-US')
}

function clampGrouped(raw: string, max: number) {
  const digits = digitsOf(raw)
  if (!digits) return ''
  const n = Math.min(Number(digits), max)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('en-US')
}

type Props = {
  rows: TuitionFeeItem[]
  editId: number | null
  onEditId: (id: number | null) => void
}

/** Tahrirlash — modal. Bekor qilish modalni yopadi. */
export function TuitionFeeEditor({ rows, editId, onEditId }: Props) {
  const { t } = useTranslation()
  const mutation = useStoreTuitionFeeMutation()
  const [eduTypeId, setEduTypeId] = useState('')
  const [shortName, setShortName] = useState('')
  const [price, setPrice] = useState('')
  const [firstPay, setFirstPay] = useState('')

  const fill = (row: TuitionFeeItem | undefined) => {
    if (!row) {
      setShortName('')
      setPrice('')
      setFirstPay('')
      return
    }
    setShortName(row.short_name || '')
    setPrice(
      row.edu_type_price?.price != null && row.edu_type_price.price !== ''
        ? formatGrouped(String(row.edu_type_price.price))
        : '',
    )
    setFirstPay(
      row.edu_type_price?.first_pay != null && row.edu_type_price.first_pay !== ''
        ? String(row.edu_type_price.first_pay)
        : '',
    )
  }

  useEffect(() => {
    setEduTypeId(editId != null ? String(editId) : '')
    fill(rows.find((row) => row.id === editId))
  }, [editId, rows])

  const clear = () => {
    onEditId(null)
    setEduTypeId('')
    fill(undefined)
  }

  const submit = () => {
    if (!eduTypeId) {
      notify.error(t('tuitionFeesPage.eduTypeRequired'))
      return
    }
    mutation.mutate(
      {
        edu_type_id: Number(eduTypeId),
        price: digitsOf(price),
        first_pay: digitsOf(firstPay),
        short_name: shortName.trim(),
      },
      {
        onSuccess: (res) => {
          notify.success(res.message || t('common.saved'))
          clear()
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <Modal
      open={editId != null}
      onClose={clear}
      title={t('tuitionFeesPage.formTitle')}
      sizeClassName="max-w-2xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="danger" size="sm" onClick={clear}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" loading={mutation.isPending} onClick={submit}>
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label={t('tuitionFeesPage.eduType')}
          value={eduTypeId}
          placeholder={t('common.selectPlaceholder')}
          options={rows.map((row) => ({
            value: String(row.id),
            label: row.name || row.short_name || String(row.id),
          }))}
          onChange={(e) => {
            const id = e.target.value
            setEduTypeId(id)
            onEditId(id ? Number(id) : null)
            fill(rows.find((row) => String(row.id) === id))
          }}
        />
        <Input
          label={t('tuitionFeesPage.shortNameOptional')}
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
        />
        <Input
          label={t('tuitionFeesPage.firstPay')}
          inputMode="numeric"
          value={firstPay}
          onChange={(e) => setFirstPay(clampGrouped(e.target.value, PAY_MAX))}
        />
        <Input
          label={t('tuitionFeesPage.fullPayField')}
          inputMode="numeric"
          value={price}
          onChange={(e) => setPrice(clampGrouped(e.target.value, PRICE_MAX))}
        />
      </div>
    </Modal>
  )
}
