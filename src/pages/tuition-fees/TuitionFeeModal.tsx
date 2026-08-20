import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Modal, Select, notify } from '@/components/ui'
import { EDU_TYPES } from '@/config'
import {
  useStoreTuitionFeeMutation,
  useTuitionFeeEduTypesQuery,
} from '@/features/tuition-fees'
import type { StudentEduType } from '@/types/student'
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

function isUsefulLabel(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const v = value.trim()
  return Boolean(v) && v !== 'null' && !/^\d+$/.test(v)
}

function pickEduTypeLabel(
  item: StudentEduType | TuitionFeeItem,
  fees: TuitionFeeItem[],
) {
  const rec = item as Record<string, unknown>
  const own = [
    rec.short_name_uz,
    rec.short_name,
    rec.short_name_kiril,
    rec.short_name_ru,
    rec.character_name,
    rec.name_uz,
    rec.name,
  ].find(isUsefulLabel)
  if (own) return own

  const fee = fees.find((row) => String(row.id) === String(item.id))
  const fromFee = [fee?.short_name, fee?.short_name_uz, fee?.name].find(
    isUsefulLabel,
  )
  if (fromFee) return fromFee

  return (
    EDU_TYPES.find((row) => row.id === Number(item.id))?.shortName ||
    String(item.id ?? '')
  )
}

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  row: TuitionFeeItem | null
  fees: TuitionFeeItem[]
  onClose: () => void
}

export function TuitionFeeModal({ open, mode, row, fees, onClose }: Props) {
  const { t } = useTranslation()
  const optionsQuery = useTuitionFeeEduTypesQuery(open)
  const mutation = useStoreTuitionFeeMutation()
  const [eduTypeId, setEduTypeId] = useState('')
  const [price, setPrice] = useState('')
  const [firstPay, setFirstPay] = useState('')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && row) {
      setEduTypeId(String(row.id))
      setPrice(
        row.edu_type_price?.price != null && row.edu_type_price.price !== ''
          ? formatGrouped(String(row.edu_type_price.price))
          : '',
      )
      setFirstPay(
        row.edu_type_price?.first_pay != null &&
          row.edu_type_price.first_pay !== ''
          ? String(row.edu_type_price.first_pay)
          : '',
      )
      return
    }
    setEduTypeId('')
    setPrice('')
    setFirstPay('')
  }, [mode, open, row])

  const eduTypes = useMemo(() => {
    const fromApi = (optionsQuery.data?.edu_types ?? []).filter(
      (item) => item.id != null,
    )
    if (fromApi.length) return fromApi
    return fees.map((item) => ({
      id: item.id,
      short_name: item.short_name,
      short_name_uz: item.short_name_uz,
      name: item.name,
    }))
  }, [fees, optionsQuery.data?.edu_types])

  const title =
    mode === 'edit'
      ? t('tuitionFeesPage.editTitle', {
          name: pickEduTypeLabel(
            row ?? { id: 0 },
            fees,
          ),
        })
      : t('tuitionFeesPage.addTitle')

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
      },
      {
        onSuccess: (res) => {
          notify.success(res.message || t('common.saved'))
          onClose()
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      sizeClassName="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={mutation.isPending}
            onClick={submit}
          >
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Select
          label={t('tuitionFeesPage.eduType')}
          required={mode === 'add'}
          disabled={mode === 'edit'}
          value={eduTypeId}
          placeholder={t('common.selectPlaceholder')}
          options={eduTypes.map((item) => ({
            value: String(item.id ?? ''),
            label: pickEduTypeLabel(item, fees),
          }))}
          onChange={(e) => setEduTypeId(e.target.value)}
        />
        <Input
          label={t('tuitionFeesPage.priceLabel')}
          hint={t('tuitionFeesPage.priceHint')}
          inputMode="numeric"
          value={price}
          onChange={(e) => setPrice(clampGrouped(e.target.value, PRICE_MAX))}
        />
        <Input
          label={t('tuitionFeesPage.firstPayLabel')}
          inputMode="numeric"
          value={firstPay}
          onChange={(e) => setFirstPay(clampGrouped(e.target.value, PAY_MAX))}
        />
      </div>
    </Modal>
  )
}
