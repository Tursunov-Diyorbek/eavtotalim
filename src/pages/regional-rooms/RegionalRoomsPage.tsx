import { useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  OrganizationSelect,
  Pagination,
  Select,
  Switch,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  fieldLabelClassName,
  notify,
} from '@/components/ui'
import { fetchDistricts, fetchRegions } from '@/api/students'
import { useRegionalRoomsQuery, useSetRoomGaiStatusMutation } from '@/features/rooms'
import { useOpenedOnce, usePageState } from '@/hooks'
import { formatDate } from '@/lib'

export function RegionalRoomsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [organizationId, setOrganizationId] = usePageState('organizationId', '')
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [gaiStatus, setGaiStatus] = usePageState('gaiStatus', '1')
  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(regionId))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(areaId))
  const gai = useSetRoomGaiStatusMutation()

  useEffect(() => {
    setPage(1)
  }, [organizationId, regionId, areaId, gaiStatus, pageSize])

  const query = useRegionalRoomsQuery({
    page,
    showCount: pageSize,
    organizationId,
    regionId,
    areaId,
    gaiStatus,
  })
  const regions = useQuery({
    queryKey: ['regions', 'regional-rooms'],
    queryFn: fetchRegions,
    enabled: regionsEnabled,
  })
  const districts = useQuery({
    queryKey: ['districts', 'regional-rooms', regionId],
    queryFn: () => fetchDistricts(regionId),
    enabled: Boolean(regionId) && areasEnabled,
  })

  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? 1
  const loading = query.isLoading && !query.data

  return (
    <>
      <Header
        title={t('nav.rooms')}
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <FilterField label={t('carsPage.organization')}>
              <OrganizationSelect
                className="w-64"
                valueKey="id"
                value={organizationId}
                onChange={(event) => setOrganizationId(event.target.value)}
              />
            </FilterField>
            <FilterField label={t('regionalCarsPage.region')}>
              <Select
                size="sm"
                clearable
                className="w-44"
                value={regionId}
                placeholder={t('regionalCarsPage.pick')}
                onOpen={openRegions}
                loading={regions.isFetching && (regions.data?.length ?? 0) === 0}
                options={(regions.data ?? []).map((item) => ({
                  value: String(item.id),
                  label: item.name || String(item.id),
                }))}
                onChange={(event) => {
                  setRegionId(event.target.value)
                  setAreaId('')
                }}
              />
            </FilterField>
            <FilterField label={t('regionalCarsPage.district')}>
              <Select
                size="sm"
                clearable
                className="w-44"
                value={areaId}
                placeholder={t('regionalCarsPage.pick')}
                disabled={!regionId}
                onOpen={openAreas}
                loading={districts.isFetching && (districts.data?.length ?? 0) === 0}
                options={(districts.data ?? []).map((item) => ({
                  value: String(item.id),
                  label: item.name || String(item.id),
                }))}
                onChange={(event) => setAreaId(event.target.value)}
              />
            </FilterField>
            <FilterField label={t('regionalRoomsPage.gai')}>
              <Select
                size="sm"
                className="w-32"
                value={gaiStatus}
                options={[
                  { value: '1', label: t('regionalRoomsPage.active') },
                  { value: '0', label: t('regionalRoomsPage.inactive') },
                ]}
                onChange={(event) => setGaiStatus(event.target.value)}
              />
            </FilterField>
          </div>
        }
      />
      <PageMain fill>
        {query.isError && !query.data ? (
          <ErrorMessage />
        ) : loading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table storageKey="regional-rooms" fill>
              <THead>
                <HeaderTR>
                  <TH column="index" className="w-12 text-center">
                    №
                  </TH>
                  <TH column="name" className="min-w-48">
                    {t('regionalRoomsPage.name')}
                  </TH>
                  <TH column="created" className="w-36 text-center">
                    {t('regionalRoomsPage.created')}
                  </TH>
                  <TH column="org" className="min-w-56">
                    {t('carsPage.organization')}
                  </TH>
                  <TH column="inn" className="w-32">
                    {t('regionalCarsPage.inn')}
                  </TH>
                  <TH column="district" className="min-w-36">
                    {t('regionalCarsPage.district')}
                  </TH>
                  <TH column="gai" className="w-36 text-center">
                    {t('regionalRoomsPage.gai')}
                  </TH>
                  <TH column="status" className="w-28 text-center">
                    {t('regionalRoomsPage.status')}
                  </TH>
                </HeaderTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={8} />
                ) : (
                  rows.map((row, index) => (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="name">
                        <span className="line-clamp-2">{row.name || '—'}</span>
                      </TD>
                      <TD column="created" className="text-center whitespace-nowrap tabular-nums">
                        {formatDate(row.created_at) || '—'}
                      </TD>
                      <TD column="org">
                        <span className="line-clamp-2">{row.organization?.name || '—'}</span>
                      </TD>
                      <TD column="inn" className="whitespace-nowrap text-rose tabular-nums">
                        {row.organization?.inn || '—'}
                      </TD>
                      <TD column="district">{row.area?.name || '—'}</TD>
                      <TD column="gai" className="text-center">
                        <Switch
                          checked={Number(row.gai_status) === 1}
                          checkedLabel={t('regionalRoomsPage.active')}
                          uncheckedLabel={t('regionalRoomsPage.inactive')}
                          loading={gai.isPending && gai.variables?.id === row.id}
                          onChange={(next) =>
                            gai.mutate(
                              { id: row.id, active: next },
                              {
                                onError: (error) =>
                                  notify.error(error instanceof Error ? error.message : t('common.loadError')),
                              },
                            )
                          }
                        />
                      </TD>
                      <TD column="status" className="text-center">
                        <Badge tone={Number(row.status) === 1 ? 'teal' : 'rose'}>
                          {Number(row.status) === 1
                            ? t('regionalRoomsPage.active')
                            : t('regionalRoomsPage.inactive')}
                        </Badge>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
            <Pagination
              className="shrink-0"
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </div>
        )}
      </PageMain>
    </>
  )
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={fieldLabelClassName}>{label}</span>
      {children}
    </div>
  )
}
