import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  RegionDistrict,
  SearchInput,
  Select,
  SkeletonCard,
  Switch,
  TBody,
  TD,
  TH,
  TR,
  Table,
  Tooltip,
} from '@/components/ui'
import { fetchDistricts, fetchRegions } from '@/api/students'
import {
  useRegionalTeacherGaiMutation,
  useRegionalTeachersQuery,
} from '@/features/regional-teachers'
import { useOpenedOnce, usePageState } from '@/hooks'

function fullName(last: string, first: string, middle: string) {
  return [last, first, middle].filter(Boolean).join(' ')
}

function EduTypes({ names }: { names: string[] }) {
  if (!names.length) return <span className="text-muted">—</span>
  const label = names.length > 3 ? `${names.slice(0, 2).join(', ')} …` : names.join(', ')
  if (names.length <= 3) return <span>{label}</span>
  return <Tooltip content={names.join(', ')}><span>{label}</span></Tooltip>
}

export function RegionalTeachersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [lastName, setLastName] = usePageState('last', '')
  const [firstName, setFirstName] = usePageState('first', '')
  const [middleName, setMiddleName] = usePageState('middle', '')
  const [jshir, setJshir] = usePageState('jshir', '')
  const [inn, setInn] = usePageState('inn', '')
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [gaiStatus, setGaiStatus] = usePageState('gai', '1')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(regionId))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(areaId))

  const query = useRegionalTeachersQuery({
    page,
    showCount: pageSize,
    lastName,
    firstName,
    middleName,
    jshir,
    inn,
    regionId,
    areaId,
    gaiStatus,
  })
  const toggle = useRegionalTeacherGaiMutation()
  const regions = useQuery({
    queryKey: ['regions', 'regional-teachers'],
    queryFn: fetchRegions,
    enabled: regionsEnabled || Boolean(regionId),
  })
  const districts = useQuery({
    queryKey: ['districts', 'regional-teachers', regionId],
    queryFn: () => fetchDistricts(regionId),
    enabled: Boolean(regionId) && (areasEnabled || Boolean(areaId)),
  })
  const regionOptions = (regions.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const areaOptions = (districts.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const rows = query.data?.data ?? []

  return (
    <>
      <Header title={t('nav.regionalTeachers')} />
      <PageMain fill>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {query.isError && !query.data ? <ErrorMessage /> : null}
          <Table>
            <HeaderTR>
              <TH column="n" className="w-12">№</TH>
              <TH column="name" className="min-w-[22rem]">{t('regionalTeachersPage.fio')}</TH>
              <TH column="phone" className="w-32">{t('regionalTeachersPage.phone')}</TH>
              <TH column="jshir" className="w-36">{t('regionalTeachersPage.jshir')}</TH>
              <TH column="edu" className="w-36">{t('regionalTeachersPage.edu')}</TH>
              <TH column="org" className="min-w-56">{t('regionalTeachersPage.org')}</TH>
              <TH column="place" className="w-[20rem]">{t('common.regionDistrict')}</TH>
              <TH column="gai" className="w-32">{t('regionalTeachersPage.gai')}</TH>
            </HeaderTR>
            <FilterTR>
              <FilterTH column="n" />
              <FilterTH column="name">
                <div className="flex gap-1">
                  <SearchInput
                    size="sm"
                    className="w-[6.75rem]"
                    label={t('regionalTeachersPage.lastName')}
                    placeholder={t('regionalTeachersPage.lastName')}
                    value={lastName}
                    onChange={(event) => {
                      setLastName(event.target.value)
                      setPage(1)
                    }}
                  />
                  <SearchInput
                    size="sm"
                    className="w-[6.75rem]"
                    label={t('regionalTeachersPage.firstName')}
                    placeholder={t('regionalTeachersPage.firstName')}
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value)
                      setPage(1)
                    }}
                  />
                  <SearchInput
                    size="sm"
                    className="w-[7.5rem]"
                    label={t('regionalTeachersPage.middleName')}
                    placeholder={t('regionalTeachersPage.middleName')}
                    value={middleName}
                    onChange={(event) => {
                      setMiddleName(event.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </FilterTH>
              <FilterTH column="phone" />
              <FilterTH column="jshir">
                <SearchInput
                  size="sm"
                  label={t('regionalTeachersPage.jshir')}
                  placeholder={t('common.search')}
                  value={jshir}
                  onChange={(event) => {
                    setJshir(event.target.value)
                    setPage(1)
                  }}
                />
              </FilterTH>
              <FilterTH column="edu" />
              <FilterTH column="org">
                <OrganizationSelect
                  size="sm"
                  className="w-full max-w-xs"
                  id="regional-teachers-org"
                  name="regional-teachers-org"
                  value={inn}
                  onChange={(event) => {
                    setInn(event.target.value)
                    setPage(1)
                  }}
                />
              </FilterTH>
              <FilterTH column="place">
                <div className="flex items-center gap-1.5">
                  <Select
                    id="regional-teachers-region"
                    name="regional-teachers-region"
                    size="sm"
                    clearable
                    className="min-w-0 flex-1"
                    value={regionId}
                    placeholder={t('regionalTeachersPage.region')}
                    onOpen={openRegions}
                    loading={regions.isFetching && regionOptions.length === 0}
                    options={regionOptions}
                    onChange={(event) => {
                      setRegionId(event.target.value)
                      setAreaId('')
                      setPage(1)
                    }}
                  />
                  <Select
                    id="regional-teachers-area"
                    name="regional-teachers-area"
                    size="sm"
                    clearable
                    className="min-w-0 flex-1"
                    value={areaId}
                    placeholder={t('regionalTeachersPage.district')}
                    disabled={!regionId}
                    onOpen={openAreas}
                    loading={districts.isFetching && areaOptions.length === 0}
                    options={areaOptions}
                    onChange={(event) => {
                      setAreaId(event.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </FilterTH>
              <FilterTH column="gai">
                <Select
                  id="regional-teachers-gai"
                  name="regional-teachers-gai"
                  size="sm"
                  value={gaiStatus}
                  options={[
                    { value: '1', label: t('regionalTeachersPage.active') },
                    { value: '0', label: t('regionalTeachersPage.inactive') },
                  ]}
                  onChange={(event) => {
                    setGaiStatus(event.target.value || '1')
                    setPage(1)
                  }}
                />
              </FilterTH>
            </FilterTR>
            <TBody>
              {query.isLoading && !query.data ? (
                <TR>
                  <TD colSpan={8}>
                    <SkeletonCard />
                  </TD>
                </TR>
              ) : query.isError && !query.data ? null : rows.length === 0 ? (
                <EmptyTR colSpan={8} />
              ) : (
                rows.map((row, index) => {
                  const name = fullName(row.lastName, row.firstName, row.middleName)
                  return (
                    <TR key={row.id}>
                      <TD>{(page - 1) * pageSize + index + 1}</TD>
                      <TD>
                        <span className="block truncate" title={name || undefined}>
                          {name || '—'}
                        </span>
                      </TD>
                      <TD className="whitespace-nowrap">{row.phone || '—'}</TD>
                      <TD className="whitespace-nowrap tabular-nums">{row.jshir || '—'}</TD>
                      <TD>
                        <EduTypes names={row.eduTypes} />
                      </TD>
                      <TD className="max-w-xs">
                        {row.organizationId ? (
                          <Button
                            variant="link"
                            size="inline"
                            className="!h-auto max-w-full !min-w-0 !shrink !items-start !justify-start !px-0 !py-0 !font-normal [&>div>span:first-child]:!text-signal"
                            onClick={() => navigate(`/all-organizations/${row.organizationId}`)}
                          >
                            <OrganizationLabel stacked name={row.organizationName} inn={row.inn} />
                          </Button>
                        ) : (
                          <OrganizationLabel stacked name={row.organizationName} inn={row.inn} />
                        )}
                      </TD>
                      <TD>
                        <RegionDistrict region={row.region} district={row.area} />
                      </TD>
                      <TD>
                        <Switch
                          checked={row.gaiStatus === 1}
                          loading={toggle.isPending && toggle.variables?.id === row.id}
                          checkedLabel={t('regionalTeachersPage.active')}
                          uncheckedLabel={t('regionalTeachersPage.inactive')}
                          onChange={() => toggle.mutate(row)}
                        />
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        </div>
        <Pagination
          className="shrink-0"
          page={page}
          pageSize={pageSize}
          total={query.data?.total_items ?? 0}
          totalPages={query.data?.last_page ?? 1}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
    </>
  )
}
