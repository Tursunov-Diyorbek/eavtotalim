import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageOff } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyState,
  ErrorMessage,
  ExportButton,
  ListPageSkeleton,
  SafeImage,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import { resolveFileUrl } from '@/features/lessons'
import { useTuitionFeesQuery } from '@/features/tuition-fees'
import { downloadXls } from '@/lib/downloadXls'
import type { TuitionFeeItem } from '@/types/tuition-fees'
import { TuitionFeeEditor } from './TuitionFeeModal'

/**
 * Eski ta’lim narxi tartibi: A, B, BC, C(QT), D(QT), BE(QT), CE(QT).
 * Qolgan toifalar (C(T), DE, MO, I va boshqalar) eski jadvalda yo‘q.
 */
const TUITION_EDU_ORDER = [2, 1, 4, 8, 5, 7, 6]

function hasTuitionPrice(row: TuitionFeeItem) {
  const price = row.edu_type_price
  if (!price) return false
  const filled = (value: unknown) => value != null && value !== '' && value !== 'null'
  return filled(price.price) || filled(price.first_pay)
}

function FeeImage({ src }: { src?: string | null }) {
  return (
    <SafeImage
      src={resolveFileUrl(src, PATH_PREFIX_FILE)}
      size="sm"
      icon={ImageOff}
      fit="contain"
      className="mx-auto size-10 rounded-md"
    />
  )
}

export function TuitionFeesPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useTuitionFeesQuery()
  const rows = useMemo(() => {
    const allowed = new Map(TUITION_EDU_ORDER.map((id, index) => [id, index]))
    return (data ?? [])
      .filter((row) => allowed.has(row.id) && hasTuitionPrice(row))
      .sort((a, b) => (allowed.get(a.id) ?? 0) - (allowed.get(b.id) ?? 0))
  }, [data])
  const [editId, setEditId] = useState<number | null>(null)

  const exportXls = () => {
    downloadXls(
      t('tuitionFeesPage.exportFile'),
      [
        '№',
        t('tuitionFeesPage.eduType'),
        t('tuitionFeesPage.shortName'),
        t('tuitionFeesPage.firstPay'),
        t('tuitionFeesPage.fullPay'),
      ],
      rows.map((row, index) => [
        index + 1,
        row.name || '—',
        row.short_name || '—',
        row.edu_type_price?.first_pay != null
          ? `${row.edu_type_price.first_pay} %`
          : '',
        row.edu_type_price?.price != null
          ? Number(row.edu_type_price.price).toLocaleString('en-US')
          : '',
      ]),
    )
  }

  return (
    <>
      <Header
        title={t('nav.tuitionFees')}
        actions={
          <ExportButton onClick={exportXls} disabled={isLoading || rows.length === 0} />
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="tuition-fees">
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH className="w-16">{t('tuitionFeesPage.image')}</TH>
                <TH>{t('tuitionFeesPage.eduType')}</TH>
                <TH>{t('tuitionFeesPage.shortName')}</TH>
                <TH className="w-40">{t('tuitionFeesPage.firstPay')}</TH>
                <TH className="w-44">{t('tuitionFeesPage.fullPay')}</TH>
                <TH className="w-20">{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={7}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const first = row.edu_type_price?.first_pay
                  const price = row.edu_type_price?.price
                  return (
                    <TR key={row.id}>
                      <TD className="text-center text-muted">{index + 1}</TD>
                      <TD className="text-center">
                        <FeeImage key={row.id} src={row.image} />
                      </TD>
                      <TD className="font-medium text-ink">{row.name || '—'}</TD>
                      <TD>{row.short_name || '—'}</TD>
                      <TD className="text-center font-medium text-teal">
                        {first != null && first !== '' ? `${first} %` : '—'}
                      </TD>
                      <TD className="text-center">
                        {price != null && price !== ''
                          ? Number(price).toLocaleString('en-US')
                          : '—'}
                      </TD>
                      <TD className="text-center">
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={() => setEditId(row.id)}
                        >
                          {t('common.edit')}
                        </Button>
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
      </PageMain>
      <TuitionFeeEditor rows={rows} editId={editId} onEditId={setEditId} />
    </>
  )
}
