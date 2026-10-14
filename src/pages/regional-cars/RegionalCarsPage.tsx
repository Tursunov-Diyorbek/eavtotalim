import { useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Car } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  OrganizationSelect,
  Pagination,
  SafeImage,
  Select,
  ShowButton,
  Switch,
  TBody,
  Tooltip,
  TD,
  TH,
  THead,
  TR,
  Table,
  TableSearch,
  fieldLabelClassName,
  notify,
} from '@/components/ui'
import { fetchDistricts, fetchRegions } from '@/api/students'
import { PATH_PREFIX_FILE, carShowPath } from '@/config'
import { useCarsQuery, useSetCarGaiStatusMutation } from '@/features/cars'
import { resolveFileUrl } from '@/features/lessons'
import { useOpenedOnce, usePageState } from '@/hooks'
import type { CarItem } from '@/types/cars'

const CATEGORIES = [
  { value: '1', label: 'A' },
  { value: '2', label: 'B' },
  { value: '3', label: 'C' },
  { value: '4', label: 'D' },
]

function personName(teacher: CarItem['teacher']) {
  if (!teacher) return ''
  return [teacher.last_name, teacher.first_name, teacher.middle_name].filter(Boolean).join(' ')
}

export function RegionalCarsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [name, setName] = usePageState('name', '')
  const [number, setNumber] = usePageState('number', '')
  const [organizationId, setOrganizationId] = usePageState('organizationId', '')
  const [inn, setInn] = usePageState('inn', '')
  const [categoryId, setCategoryId] = usePageState('categoryId', '')
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [gaiStatus, setGaiStatus] = usePageState('gaiStatus', '1')
  const [mspdStatus, setMspdStatus] = usePageState('mspdStatus', '1')
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null)
  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(regionId))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(areaId))
  const gai = useSetCarGaiStatusMutation()

  useEffect(() => {
    setPage(1)
  }, [name, number, organizationId, inn, categoryId, regionId, areaId, gaiStatus, mspdStatus, pageSize])

  const query = useCarsQuery({
    page,
    showCount: pageSize,
    name,
    number,
    organizationId,
    inn,
    categoryId,
    regionId,
    areaId,
    gaiStatus,
    mspdStatus,
    includeArea: true,
  })
  const regions = useQuery({
    queryKey: ['regions', 'regional-cars'],
    queryFn: fetchRegions,
    enabled: regionsEnabled,
  })
  const districts = useQuery({
    queryKey: ['districts', 'regional-cars', regionId],
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
        title={t('nav.cars')}
        actions={
          <div className="flex flex-wrap items-end gap-2">
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
            <FilterField label={t('carsPage.gai')}>
              <Select
                size="sm"
                className="w-32"
                value={gaiStatus}
                options={[
                  { value: '1', label: t('regionalCarsPage.active') },
                  { value: '0', label: t('regionalCarsPage.inactive') },
                ]}
                onChange={(event) => setGaiStatus(event.target.value)}
              />
            </FilterField>
            <FilterField label={t('carsPage.mspd')}>
              <Select
                size="sm"
                className="w-40"
                value={mspdStatus}
                options={[
                  { value: '1', label: t('regionalCarsPage.correct') },
                  { value: '2', label: t('regionalCarsPage.wrong') },
                  { value: '0', label: t('regionalCarsPage.checking') },
                ]}
                onChange={(event) => setMspdStatus(event.target.value)}
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
            <Table storageKey="regional-cars" fill>
              <THead>
                <HeaderTR>
                  <TH column="index" className="w-12 text-center">
                    №
                  </TH>
                  <TH column="photo" className="w-16">
                    {t('carsPage.photo')}
                  </TH>
                  <TH column="name">{t('directorList.name')}</TH>
                  <TH column="number" className="min-w-44">
                    {t('carsPage.plate')}
                  </TH>
                  <TH column="teacher">{t('regionalCarsPage.teacher')}</TH>
                  <TH column="org" className="min-w-72">
                    {t('carsPage.organization')}
                  </TH>
                  <TH column="inn" className="min-w-44">
                    {t('regionalCarsPage.inn')}
                  </TH>
                  <TH column="district">{t('regionalCarsPage.district')}</TH>
                  <TH column="category">{t('carsPage.eduType')}</TH>
                  <TH column="gai" className="text-center">
                    {t('carsPage.gai')}
                  </TH>
                  <TH column="mspd" className="text-center">
                    {t('carsPage.mspd')}
                  </TH>
                  <TH column="actions" className="w-16 text-center">
                    {t('common.actions')}
                  </TH>
                </HeaderTR>
                <FilterTR>
                  <FilterTH column="index" />
                  <FilterTH column="photo" />
                  <FilterTH column="name">
                    <TableSearch
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t('common.search')}
                    />
                  </FilterTH>
                  <FilterTH column="number" className="min-w-44">
                    <TableSearch
                      className="w-full min-w-40"
                      value={number}
                      onChange={(event) => setNumber(event.target.value)}
                      placeholder={t('common.search')}
                    />
                  </FilterTH>
                  <FilterTH column="teacher" />
                  <FilterTH column="org" className="min-w-72">
                    <OrganizationSelect
                      className="w-full min-w-64"
                      valueKey="id"
                      value={organizationId}
                      onChange={(event) => setOrganizationId(event.target.value)}
                    />
                  </FilterTH>
                  <FilterTH column="inn" className="min-w-44">
                    <TableSearch
                      className="w-full min-w-40"
                      value={inn}
                      onChange={(event) => setInn(event.target.value)}
                      placeholder={t('common.search')}
                    />
                  </FilterTH>
                  <FilterTH column="district" />
                  <FilterTH column="category">
                    <Select
                      size="sm"
                      clearable
                      value={categoryId}
                      placeholder={t('regionalCarsPage.pick')}
                      options={CATEGORIES}
                      onChange={(event) => setCategoryId(event.target.value)}
                    />
                  </FilterTH>
                  <FilterTH column="gai" />
                  <FilterTH column="mspd" />
                  <FilterTH column="actions" />
                </FilterTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={12} />
                ) : (
                  rows.map((row, index) => {
                    const teacher = personName(row.teacher)
                    const photo = resolveFileUrl(row.photo || row.image, PATH_PREFIX_FILE)
                    return (
                      <TR key={row.id}>
                        <TD column="index" className="text-center text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD column="photo">
                          <CarPhoto
                            src={photo}
                            title={[row.name, row.number].filter(Boolean).join(' · ')}
                            onOpen={setPreview}
                          />
                        </TD>
                        <TD column="name" className="font-medium">
                          <span className="line-clamp-2">{row.name || '—'}</span>
                        </TD>
                        <TD column="number" className="min-w-44 whitespace-nowrap tabular-nums">
                          {row.number || '—'}
                        </TD>
                        <TD column="teacher">
                          {teacher ? (
                            <span className="line-clamp-2">{teacher}</span>
                          ) : (
                            <Badge tone="rose">{t('regionalCarsPage.notAttached')}</Badge>
                          )}
                        </TD>
                        <TD column="org" className="min-w-72">
                          <span className="line-clamp-2">{row.organization?.name || '—'}</span>
                        </TD>
                        <TD column="inn" className="min-w-44 whitespace-nowrap text-rose tabular-nums">
                          {row.organization?.inn || '—'}
                        </TD>
                        <TD column="district">{row.area?.name || '—'}</TD>
                        <TD column="category">{row.car_category?.name || '—'}</TD>
                        <TD column="gai" className="text-center">
                          <Switch
                            checked={Number(row.gai_status) === 1}
                            checkedLabel={t('regionalCarsPage.active')}
                            uncheckedLabel={t('regionalCarsPage.inactive')}
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
                        <TD column="mspd" className="text-center">
                          <MspdBadge status={row.mspd_status} date={row.mspd_check_date} />
                        </TD>
                        <TD column="actions" className="text-center">
                          <ShowButton onClick={() => navigate(carShowPath(row.id))} />
                        </TD>
                      </TR>
                    )
                  })
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
      <Modal
        open={preview != null}
        onClose={() => setPreview(null)}
        title={preview?.title || t('carsPage.photo')}
        sizeClassName="max-w-3xl"
        bodyClassName="p-3 sm:p-4"
      >
        <SafeImage
          src={preview?.src}
          alt={preview?.title || ''}
          icon={Car}
          size="xl"
          fit="contain"
          className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
        />
      </Modal>
    </>
  )
}

function CarPhoto({
  src,
  title,
  onOpen,
}: {
  src: string
  title: string
  onOpen: (photo: { src: string; title: string }) => void
}) {
  const { t } = useTranslation()
  const label = title || t('carsPage.photo')
  if (!src) {
    return <SafeImage src="" alt={label} icon={Car} size="sm" fit="cover" className="size-10 rounded-full" />
  }
  return (
    <Button
      variant="ghost"
      size="inline"
      className="!size-10 !rounded-full !p-0"
      aria-label={label}
      onClick={() => onOpen({ src, title: label })}
    >
      <SafeImage src={src} alt={label} icon={Car} size="sm" fit="cover" className="size-10 rounded-full" />
    </Button>
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

function MspdBadge({ status, date }: { status: CarItem['mspd_status']; date?: string | null }) {
  const { t } = useTranslation()
  const value = Number(status)
  if (value === 2) {
    const badge = <Badge tone="rose">{t('regionalCarsPage.wrong')}</Badge>
    if (!date) return badge
    return <Tooltip content={`${t('regionalCarsPage.checkedAt')}: ${date}`}>{badge}</Tooltip>
  }
  if (value === 0) return <Badge tone="amber">{t('regionalCarsPage.checking')}</Badge>
  if (value === 1) return <Badge tone="teal">{t('regionalCarsPage.correct')}</Badge>
  return <span className="text-muted">—</span>
}
