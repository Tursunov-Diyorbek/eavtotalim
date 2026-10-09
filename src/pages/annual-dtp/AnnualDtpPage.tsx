import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  DetailList,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Pagination,
  Select,
  TBody,
  TD,
  TH,
  THead,
  Table,
  TR,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useAnnualDtpQuery } from '@/features/annual-dtp'
import { usePageState } from '@/hooks'
import { formatDate } from '@/lib/format'
import type { DtpRecord } from '@/types/annual-dtp'

function incidentStamp(value?: string | null) {
  if (!value) return null
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function AnnualDtpPage() {
  const { t, i18n } = useTranslation()
  const { isSuperAdmin } = useAuth()
  const query = useAnnualDtpQuery()
  const [org, setOrg] = usePageState('org', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<DtpRecord | null>(null)

  const rows = query.data ?? []
  const orgOptions = useMemo(() => {
    const names = [...new Set(rows.map((row) => row.organization_name).filter(Boolean))] as string[]
    return [
      { value: '', label: t('common.all') },
      ...names.map((name) => ({ value: name, label: name })),
    ]
  }, [rows, t])

  const filtered = isSuperAdmin && org
    ? rows.filter((row) => (row.organization_name ?? '').includes(org))
    : rows
  const visible = isSuperAdmin
    ? filtered.slice((page - 1) * pageSize, page * pageSize)
    : filtered
  const colSpan = isSuperAdmin ? 8 : 7

  return (
    <>
      <Header title={t('annualDtpPage.title')} />
      <PageMain fill>
        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table fill>
              <THead>
                <HeaderTR>
                  <TH className="w-14 text-center">№</TH>
                  <TH>{t('annualDtpPage.fullName')}</TH>
                  {isSuperAdmin ? <TH>{t('annualDtpPage.organization')}</TH> : null}
                  <TH>{t('annualDtpPage.violation')}</TH>
                  <TH className="text-center">{t('annualDtpPage.condition')}</TH>
                  <TH className="text-center">{t('annualDtpPage.age')}</TH>
                  <TH>{t('annualDtpPage.jshir')}</TH>
                  <TH>{t('annualDtpPage.about')}</TH>
                </HeaderTR>
                {isSuperAdmin ? (
                  <FilterTR>
                    <FilterTH />
                    <FilterTH />
                    <FilterTH>
                      <Select
                        size="sm"
                        value={org}
                        onChange={(event) => {
                          setOrg(event.target.value)
                          setPage(1)
                        }}
                        options={orgOptions}
                      />
                    </FilterTH>
                    <FilterTH />
                    <FilterTH />
                    <FilterTH />
                    <FilterTH />
                    <FilterTH />
                  </FilterTR>
                ) : null}
              </THead>
              <TBody>
                {visible.length === 0 ? (
                  <EmptyTR colSpan={colSpan} description={t('common.empty')} />
                ) : (
                  visible.map((row, index) => {
                    const number = isSuperAdmin
                      ? (page - 1) * pageSize + index + 1
                      : index + 1
                    const healthy = row.health_condition === 'healthy'
                    return (
                      <TR key={row.id ?? `${row.pinfl}-${index}`}>
                        <TD className="text-center text-muted">{number}</TD>
                        <TD className="font-semibold text-deep">{row.fio || '—'}</TD>
                        {isSuperAdmin ? <TD>{row.organization_name || '—'}</TD> : null}
                        <TD>{row.accident_type || '—'}</TD>
                        <TD className="text-center">
                          <Badge tone={healthy ? 'teal' : 'rose'}>
                            {healthy
                              ? t('annualDtpPage.healthy')
                              : t('annualDtpPage.notSpecified')}
                          </Badge>
                        </TD>
                        <TD className="text-center">{row.age ?? '—'}</TD>
                        <TD className="whitespace-nowrap">{row.pinfl || '—'}</TD>
                        <TD>
                          <Button variant="link" size="inline" onClick={() => setSelected(row)}>
                            {t('annualDtpPage.more')}
                          </Button>
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
          </div>
        )}
        {isSuperAdmin ? (
          <Pagination
            className="shrink-0"
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            totalPages={Math.max(1, Math.ceil(filtered.length / pageSize))}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </PageMain>

      <Modal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={t('annualDtpPage.modalTitle')}
        sizeClassName="max-w-3xl"
      >
        {selected ? (
          <div className="space-y-4">
            <p className="text-base font-semibold text-deep">{selected.fio || '—'}</p>
            {isSuperAdmin ? (
              <p className="text-sm text-muted">
                {t('annualDtpPage.organization')}: {selected.organization_name || '—'}
              </p>
            ) : null}
            <DetailList
              items={[
                { label: t('annualDtpPage.age'), value: selected.age ?? '—' },
                {
                  label: t('annualDtpPage.gender'),
                  value:
                    selected.gender == null
                      ? '—'
                      : Number(selected.gender) === 1
                        ? t('annualDtpPage.male')
                        : t('annualDtpPage.female'),
                },
                { label: t('annualDtpPage.jshir'), value: selected.pinfl || '—' },
                {
                  label: t('annualDtpPage.certificateSeries'),
                  value: selected.certificate_series || '—',
                },
                {
                  label: t('annualDtpPage.certificateDate'),
                  value: formatDate(selected.certificate_date, i18n.language) || '—',
                },
              ]}
            />
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
                {t('annualDtpPage.eventInfo')}
              </p>
              <DetailList
                items={[
                  {
                    label: t('annualDtpPage.violation'),
                    value: selected.accident_type || '—',
                  },
                  {
                    label: t('annualDtpPage.condition'),
                    value: (
                      <Badge tone={selected.health_condition === 'healthy' ? 'teal' : 'rose'}>
                        {selected.health_condition === 'healthy'
                          ? t('annualDtpPage.healthy')
                          : t('annualDtpPage.notSpecified')}
                      </Badge>
                    ),
                  },
                  {
                    label: t('annualDtpPage.seatBelt'),
                    value:
                      selected.safety_belt == null
                        ? '—'
                        : Number(selected.safety_belt) === 0
                          ? t('annualDtpPage.notWorn')
                          : t('annualDtpPage.worn'),
                  },
                  {
                    label: t('annualDtpPage.incidentDate'),
                    value: incidentStamp(selected.date_of_create) || '—',
                  },
                  { label: t('annualDtpPage.address'), value: selected.address || '—' },
                  {
                    label: t('annualDtpPage.experience'),
                    value:
                      selected.driver_experience == null
                        ? '—'
                        : `${selected.driver_experience} ${t('annualDtpPage.year')}`,
                  },
                ]}
              />
            </div>
            {selected.card_description ? (
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  {t('annualDtpPage.description')}
                </p>
                <p className="text-sm leading-relaxed text-deep">{selected.card_description}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  )
}
