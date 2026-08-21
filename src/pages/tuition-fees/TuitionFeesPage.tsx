import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUp, ImageOff, Plus } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  EditButton,
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
import { formatNumber } from '@/lib/format'
import type { TuitionFeeItem } from '@/types/tuition-fees'
import { TuitionFeeModal } from './TuitionFeeModal'

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
  const rows = data ?? []
  const [modal, setModal] = useState<{
    mode: 'add' | 'edit'
    row: TuitionFeeItem | null
  } | null>(null)

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
          ? `${formatNumber(row.edu_type_price.price)} ${t('tuitionFeesPage.som')}`
          : '',
      ]),
    )
  }

  return (
    <>
      <Header
        title={t('nav.tuitionFees')}
        actions={
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => setModal({ mode: 'add', row: null })}>
              <Plus className="size-3.5" aria-hidden />
              {t('common.add')}
            </Button>
            <ExportButton onClick={exportXls} disabled={isLoading || rows.length === 0} />
          </div>
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
                      <TD className="text-center">
                        {first != null && first !== '' ? (
                          <Badge tone="teal">
                            <ArrowUp className="size-3" aria-hidden />
                            {first} %
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD className="text-center">
                        {price != null && price !== '' ? (
                          <Badge tone="signal">
                            {formatNumber(price)} {t('tuitionFeesPage.som')}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD className="text-center">
                        <EditButton onClick={() => setModal({ mode: 'edit', row })} />
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
      </PageMain>
      <TuitionFeeModal
        open={Boolean(modal)}
        mode={modal?.mode ?? 'add'}
        row={modal?.row ?? null}
        fees={rows}
        onClose={() => setModal(null)}
      />
    </>
  )
}
