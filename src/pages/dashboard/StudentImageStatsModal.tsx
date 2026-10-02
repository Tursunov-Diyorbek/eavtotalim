import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  Modal,
  Pagination,
  SafeImage,
  SearchInput,
  Select,
  Skeleton,
  TBody,
  TD,
  TH,
  TR,
  Table,
  THead,
} from '@/components/ui'
import { PATH_PREFIX_FILE_HOST, studentPath } from '@/config'
import {
  useStudentImageStatsGroupStudentsQuery,
  useStudentImageStatsGroupsQuery,
} from '@/features/dashboard'
import { cn, formatNumber, fullNameOf, isFilled } from '@/lib'
import type {
  StudentImageGroupRow,
  StudentImageStudentRow,
  StudentImageStudentStatus,
} from '@/types'

const PER_PAGE = 30

function fileUrl(path: string | null | undefined): string | null {
  if (!isFilled(path)) return null
  const value = String(path)
  if (/^https?:\/\//i.test(value) || value.startsWith('blob:')) return value
  return `${PATH_PREFIX_FILE_HOST.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
}

function hasPhoto(row: StudentImageStudentRow) {
  return row.has_image === true || row.has_image === 1 || row.has_image === '1'
}

function percentBar(p: number) {
  if (p >= 80) return 'bg-teal'
  if (p >= 50) return 'bg-signal'
  if (p >= 20) return 'bg-amber'
  return 'bg-rose'
}

function CountChip({
  value,
  tone,
}: {
  value: number | null | undefined
  tone: 'signal' | 'teal' | 'rose'
}) {
  return (
    <Badge tone={tone} className="min-w-7 justify-center tabular-nums">
      {formatNumber(value)}
    </Badge>
  )
}

type Props = {
  open: boolean
  onClose: () => void
}

/** Guruh / o‘quvchi drilldown — eski StudentImageStatsDrilldownModal. */
export function StudentImageStatsModal({ open, onClose }: Props) {
  const { t } = useTranslation()

  const [group, setGroup] = useState<StudentImageGroupRow | null>(null)
  const [status, setStatus] = useState<StudentImageStudentStatus>('without_image')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (open) return
    setGroup(null)
    setStatus('without_image')
    setSearch('')
    setPage(1)
  }, [open])

  const groupsQuery = useStudentImageStatsGroupsQuery(open)
  const studentsQuery = useStudentImageStatsGroupStudentsQuery(
    group?.group_id ?? null,
    { page, status, search },
    open && group != null,
  )

  const openGroup = (row: StudentImageGroupRow) => {
    setGroup(row)
    setStatus('without_image')
    setSearch('')
    setPage(1)
  }

  const groups = groupsQuery.data ?? []
  const students = studentsQuery.data?.data ?? []
  const lastPage = studentsQuery.data?.lastPage ?? 1
  const total = studentsQuery.data?.total ?? 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        group
          ? `${t('dashboard.imageGroupStudents')}: ${group.group_name || `#${group.group_id}`}`
          : t('dashboard.imageGroupsTitle')
      }
      sizeClassName="max-w-5xl"
      maxHeightClassName="max-h-[min(90svh,800px)]"
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4"
    >
      {group ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 flex-wrap items-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setGroup(null)}>
              <ArrowLeft className="size-3.5" aria-hidden />
              {t('common.back')}
            </Button>
            <SearchInput
              key={group.group_id}
              size="sm"
              className="min-w-56 flex-1"
              placeholder={t('dashboard.imageStudentSearch')}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
            <Select
              size="sm"
              searchable={false}
              value={status}
              className="w-44"
              options={[
                { value: 'all', label: t('common.all') },
                { value: 'without_image', label: t('dashboard.imageOnlyWithout') },
                { value: 'with_image', label: t('dashboard.imageOnlyWith') },
              ]}
              onChange={(event) => {
                setStatus(event.target.value as StudentImageStudentStatus)
                setPage(1)
              }}
            />
          </div>

          {studentsQuery.isError ? (
            <ErrorMessage />
          ) : studentsQuery.isLoading && students.length === 0 ? (
            <Skeleton className="h-64 w-full" rounded="lg" />
          ) : (
            <>
              <Table storageKey="dashboard-image-students">
                <THead>
                  <HeaderTR>
                    <TH column="idx" className="w-12">
                      #
                    </TH>
                    <TH column="photo" className="w-16">
                      {t('dashboard.imagePhoto')}
                    </TH>
                    <TH column="fio">{t('dashboard.imageFio')}</TH>
                    <TH column="passport">{t('dashboard.imagePassport')}</TH>
                    <TH column="status" className="w-28">
                      {t('dashboard.imageStatus')}
                    </TH>
                  </HeaderTR>
                </THead>
                <TBody>
                  {students.length === 0 ? (
                    <EmptyTR colSpan={5} />
                  ) : (
                    students.map((row, index) => {
                      const photo = hasPhoto(row)
                      const src = fileUrl(row.image || row.exam_image)
                      const passport =
                        isFilled(row.passport_seria) && isFilled(row.passport_number)
                          ? `${row.passport_seria} ${row.passport_number}`
                          : null
                      return (
                        <TR key={row.id}>
                          <TD column="idx" className="text-muted">
                            {(page - 1) * PER_PAGE + index + 1}
                          </TD>
                          <TD column="photo">
                            <SafeImage
                              src={src}
                              alt=""
                              size="sm"
                              className="size-12 rounded-lg"
                            />
                          </TD>
                          <TD column="fio">
                            <Link
                              to={studentPath(row.id)}
                              className="font-semibold text-signal hover:underline"
                              title={t('dashboard.imageOpenStudent')}
                              onClick={onClose}
                            >
                              {fullNameOf(row) || '—'}
                            </Link>
                            {isFilled(row.phone) ? (
                              <p className="text-[11px] text-muted">{row.phone}</p>
                            ) : null}
                          </TD>
                          <TD column="passport">
                            {passport ? (
                              <Badge tone="neutral">{passport}</Badge>
                            ) : null}
                            {isFilled(row.passport_jshir) ? (
                              <p className="mt-0.5 text-[11px] text-muted">
                                {t('dashboard.imageJshir')}: {row.passport_jshir}
                              </p>
                            ) : null}
                          </TD>
                          <TD column="status">
                            <Badge tone={photo ? 'teal' : 'rose'}>
                              {photo
                                ? t('dashboard.imageHasPhoto')
                                : t('dashboard.imageNoPhoto')}
                            </Badge>
                          </TD>
                        </TR>
                      )
                    })
                  )}
                </TBody>
              </Table>
              <Pagination
                persist={false}
                page={page}
                totalPages={lastPage}
                onPageChange={setPage}
                total={total}
              />
            </>
          )}
        </div>
      ) : groupsQuery.isError ? (
        <ErrorMessage />
      ) : groupsQuery.isLoading ? (
        <Skeleton className="h-64 w-full" rounded="lg" />
      ) : (
        <Table storageKey="dashboard-image-groups">
          <THead>
            <HeaderTR>
              <TH column="idx" className="w-12">
                #
              </TH>
              <TH column="group">{t('dashboard.imageGroup')}</TH>
              <TH column="total" className="w-20 text-center">
                {t('dashboard.imageTotal')}
              </TH>
              <TH column="with" className="w-20 text-center">
                {t('dashboard.withImage')}
              </TH>
              <TH column="without" className="w-20 text-center">
                {t('dashboard.withoutImage')}
              </TH>
              <TH column="percent" className="w-48">
                {t('dashboard.imagePercentShort')}
              </TH>
              <TH column="action" className="w-32 text-center">
                {t('common.actions')}
              </TH>
            </HeaderTR>
          </THead>
          <TBody>
            {groups.length === 0 ? (
              <EmptyTR colSpan={7} />
            ) : (
              groups.map((row, index) => {
                const percent = Number(row.percent_uploaded ?? 0)
                const done = percent >= 100
                return (
                  <TR key={row.group_id}>
                    <TD column="idx" className="text-muted">
                      {index + 1}
                    </TD>
                    <TD column="group">
                      <p className="font-semibold text-deep">
                        {row.group_name || `#${row.group_id}`}
                      </p>
                      {isFilled(row.edu_type_name) ? (
                        <p className="text-[11px] text-muted">
                          {isFilled(row.edu_type_code)
                            ? `[${row.edu_type_code}] `
                            : ''}
                          {row.edu_type_name}
                        </p>
                      ) : null}
                    </TD>
                    <TD column="total" className="text-center">
                      <CountChip value={row.total} tone="signal" />
                    </TD>
                    <TD column="with" className="text-center">
                      <CountChip value={row.with_image} tone="teal" />
                    </TD>
                    <TD column="without" className="text-center">
                      <CountChip value={row.without_image} tone="rose" />
                    </TD>
                    <TD column="percent">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-fog">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              percentBar(percent),
                            )}
                            style={{
                              width: `${Math.min(100, Math.max(0, percent))}%`,
                            }}
                          />
                        </div>
                        {done ? (
                          <CheckCircle2
                            className="size-4 shrink-0 text-teal"
                            aria-label={`${percent}%`}
                          />
                        ) : (
                          <span className="shrink-0 text-[12px] font-semibold text-deep">
                            {percent}%
                          </span>
                        )}
                      </div>
                    </TD>
                    <TD column="action" className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[12px] text-signal"
                        onClick={() => openGroup(row)}
                      >
                        {t('dashboard.imageStudentsAction')}
                        <ArrowRight className="size-3.5" aria-hidden />
                      </Button>
                    </TD>
                  </TR>
                )
              })
            )}
          </TBody>
        </Table>
      )}
    </Modal>
  )
}
