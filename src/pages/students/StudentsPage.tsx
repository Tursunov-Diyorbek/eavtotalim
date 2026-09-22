import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Lock, Plus } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  EmptyState,
  ErrorMessage,
  FilterTH,
  Pagination,
  SearchInput,
  Select,
  ShowButton,
  Skeleton,
  Table,
  Tooltip,
  Tabs,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { EDU_TYPES } from '@/config/eduTypes'
import { routes, studentEditPath, studentPath } from '@/config'
import { useAuth } from '@/features/auth'
import {
  canDeleteStudent,
  studentAge,
  studentEduStatusTone,
  studentMspdKind,
  studentMspdTone,
  useDeleteStudentMutation,
  useStudentCertificatesQuery,
  useStudentsQuery,
  useStudentsWithoutCertificatesQuery,
} from '@/features/students'
import { asLangName } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import { useUrlTab } from '@/hooks'
import type { StudentItem, StudentsListTab } from '@/types/student'
import { StudentAccessModal } from './StudentAccessModal'

const STUDENT_TABS = ['all', '0', '1', '2', '3', '4'] as const

const SORT_OPTIONS = [
  { id: '1', key: 'last_name', order: 'ASC' as const, labelKey: 'students.sortLastAsc' },
  { id: '2', key: 'last_name', order: 'DESC' as const, labelKey: 'students.sortLastDesc' },
  { id: '3', key: 'id', order: 'ASC' as const, labelKey: 'students.sortIdAsc' },
  { id: '4', key: 'id', order: 'DESC' as const, labelKey: 'students.sortIdDesc' },
]

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-mist/70 bg-white p-3">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" rounded="lg" />
      ))}
    </div>
  )
}

function NameLink({
  id,
  children,
}: {
  id?: number | string | null
  children: string
}) {
  const navigate = useNavigate()
  if (!id || !children) return <>{children || '—'}</>
  return (
    <button
      type="button"
      className="text-left font-medium text-signal hover:underline"
      onClick={() => navigate(studentPath(id))}
    >
      {children}
    </button>
  )
}

function groupName(
  row: {
    group?: { name?: string | null; name_uz?: string | null } | null
    grouped_student?: {
      group?: { name?: string | null; name_uz?: string | null } | null
    } | null
  },
  lang: string,
) {
  return asLangName(row.group ?? row.grouped_student?.group, lang)
}

export function StudentsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canPassword = hasPermission('show-user-password')
  const canEdit = hasPermission('update-student')
  const canRemove = hasPermission('delete-student')
  const [tab, setTab] = useUrlTab(STUDENT_TABS, '1')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [jshir, setJshir] = useState('')
  const [eduTypeId, setEduTypeId] = useState('')
  const [mspdPhoto, setMspdPhoto] = useState('')
  const [eduStatus, setEduStatus] = useState('')
  const [sortId, setSortId] = useState('4')
  const [certSerial, setCertSerial] = useState('')
  const [certNumber, setCertNumber] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [deleteRow, setDeleteRow] = useState<StudentItem | null>(null)
  const [accessRow, setAccessRow] = useState<StudentItem | null>(null)

  const listTab = tab === '3' || tab === '4' ? false : true
  const certTab = tab === '3'
  const noCertTab = tab === '4'

  useEffect(() => {
    setPage(1)
  }, [
    tab,
    lastName,
    firstName,
    middleName,
    jshir,
    eduTypeId,
    mspdPhoto,
    eduStatus,
    sortId,
    certSerial,
    certNumber,
    groupSearch,
    orgSearch,
    pageSize,
  ])

  const sort = SORT_OPTIONS.find((item) => item.id === sortId) ?? SORT_OPTIONS[3]
  const listQuery = useStudentsQuery(
    {
      page,
      showCount: pageSize,
      tab: listTab ? tab : 'all',
      lastName,
      firstName,
      middleName,
      passportJshir: jshir,
      eduTypeId,
      mspdPhoto,
      eduStatus,
      sortKey: sort.key,
      sortOrder: sort.order,
    },
    listTab,
  )
  const certQuery = useStudentCertificatesQuery(
    {
      page,
      showCount: pageSize,
      lastName,
      firstName,
      middleName,
      passportJshir: jshir,
      certificateSerial: certSerial,
      certificateNumber: certNumber,
      groupName: groupSearch,
    },
    certTab,
  )
  const noCertQuery = useStudentsWithoutCertificatesQuery(
    {
      page,
      showCount: pageSize,
      lastName,
      firstName,
      middleName,
      passportJshir: jshir,
      organizationName: orgSearch,
    },
    noCertTab,
  )
  const deleteMutation = useDeleteStudentMutation()

  const activeQuery = certTab ? certQuery : noCertTab ? noCertQuery : listQuery
  const rows = listTab ? (listQuery.data?.data ?? []) : []
  const certRows = certQuery.data?.data ?? []
  const noCertRows = noCertQuery.data?.data ?? []
  const total = activeQuery.data?.total_items ?? 0
  const totalPages =
    activeQuery.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const isLoading = activeQuery.isLoading
  const isError = activeQuery.isError
  const isFetching = activeQuery.isFetching

  const tabItems = useMemo(
    () => [
      { value: 'all' as const, label: t('students.tabAll') },
      { value: '1' as const, label: t('students.tabActive') },
      { value: '2' as const, label: t('students.tabGraduated') },
      { value: '3' as const, label: t('students.tabWithCert') },
      { value: '4' as const, label: t('students.tabWithoutCert') },
      { value: '0' as const, label: t('students.tabUngrouped') },
    ],
    [t],
  )

  const mspdLabel = (row: StudentItem) => {
    const kind = studentMspdKind(row)
    return t(`students.mspd.${kind}`)
  }

  const eduStatusLabel = (status: number | string | null | undefined) => {
    const n = Number(status)
    if (n === 2) return t('students.graduated')
    if (n === 0) return t('students.inactive')
    return t('students.active')
  }

  const confirmDelete = () => {
    if (!deleteRow) return
    deleteMutation.mutate(deleteRow.id, {
      onSuccess: () => {
        notify.success(t('common.deleted'))
        setDeleteRow(null)
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const empty = listTab
    ? rows.length === 0
    : certTab
      ? certRows.length === 0
      : noCertRows.length === 0

  return (
    <>
      <Header
        title={t('students.title')}
        description={t('students.description')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={isFetching && !isLoading}
              onClick={() => {
                void activeQuery.refetch()
              }}
            >
              {t('common.refresh')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(routes.studentAdd)}
            >
              <Plus className="size-3.5" aria-hidden />
              {t('common.add')}
            </Button>
          </div>
        }
      />

      <PageMain fill>
        <Tabs
          items={tabItems}
          value={tab}
          onChange={(value) => setTab(value as StudentsListTab)}
          aria-label={t('students.title')}
        />

        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <TableSkeleton />
        ) : listTab ? (
          <Table storageKey="students-list">
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="w-10">№</TH>
                <TH>{t('students.lastName')}</TH>
                <TH>{t('students.firstName')}</TH>
                <TH>{t('students.middleName')}</TH>
                <TH>{t('students.birthday')}</TH>
                <TH>{t('students.jshir')}</TH>
                <TH>{t('students.eduType')}</TH>
                <TH>{t('students.passportInfo')}</TH>
                <TH>{t('students.status')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
              <TR className="hover:bg-transparent bg-white">
                <FilterTH />
                <FilterTH>
                  <SearchInput
                    id="students-filter-last-name"
                    name="students-last-name"
                    size="sm"
                    label={t('students.lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-first-name"
                    name="students-first-name"
                    size="sm"
                    label={t('students.firstName')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-middle-name"
                    name="students-middle-name"
                    size="sm"
                    label={t('students.middleName')}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH />
                <FilterTH>
                  <SearchInput
                    id="students-filter-jshir"
                    name="students-jshir"
                    size="sm"
                    label={t('students.jshir')}
                    value={jshir}
                    onChange={(e) =>
                      setJshir(e.target.value.replace(/\D/g, '').slice(0, 14))
                    }
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    value={eduTypeId}
                    onChange={(e) => setEduTypeId(e.target.value)}
                    options={[
                      { value: '', label: t('common.all') },
                      ...EDU_TYPES.map((item) => ({
                        value: String(item.id),
                        label: item.shortName,
                      })),
                    ]}
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    value={mspdPhoto}
                    onChange={(e) => setMspdPhoto(e.target.value)}
                    options={[
                      { value: '', label: t('common.all') },
                      { value: '0', label: t('students.mspd.pending') },
                      { value: '1', label: t('students.mspd.ok') },
                      { value: '2', label: t('students.mspd.bad') },
                    ]}
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    value={eduStatus}
                    onChange={(e) => setEduStatus(e.target.value)}
                    options={[
                      { value: '', label: t('common.all') },
                      { value: '0', label: t('students.inactive') },
                      { value: '1', label: t('students.active') },
                      { value: '2', label: t('students.graduated') },
                    ]}
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    value={sortId}
                    onChange={(e) => setSortId(e.target.value)}
                    options={SORT_OPTIONS.map((item) => ({
                      value: item.id,
                      label: t(item.labelKey),
                    }))}
                  />
                </FilterTH>
              </TR>
            </THead>
            <TBody>
              {empty ? (
                <TR>
                  <TD className="py-10 text-center" colSpan={10}>
                    <EmptyState description={t('common.empty')} />
                  </TD>
                </TR>
              ) : (
              rows.map((row, index) => {
                const age = studentAge(row.birthday)
                const mspd = studentMspdKind(row)
                const deletable = canDeleteStudent(row)
                return (
                  <TR key={row.id}>
                    <TD className="text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD>
                      <NameLink id={row.id}>{row.last_name || '—'}</NameLink>
                    </TD>
                    <TD>
                      <NameLink id={row.id}>{row.first_name || '—'}</NameLink>
                    </TD>
                    <TD>
                      <NameLink id={row.id}>{row.middle_name || '—'}</NameLink>
                    </TD>
                    <TD className="whitespace-nowrap">
                      {row.birthday
                        ? `${formatDate(row.birthday, i18n.language) ?? row.birthday}${
                            age != null ? ` / ${age} ${t('students.age')}` : ''
                          }`
                        : '—'}
                    </TD>
                    <TD>{row.passport_jshir || '—'}</TD>
                    <TD>{row.edu_type?.short_name || '—'}</TD>
                    <TD>
                      <Badge tone={studentMspdTone(mspd)}>{mspdLabel(row)}</Badge>
                    </TD>
                    <TD>
                      <Badge tone={studentEduStatusTone(row.edu_status)}>
                        {eduStatusLabel(row.edu_status)}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex gap-1">
                        {canPassword ? (
                          <Button
                            variant="soft"
                            size="icon-sm"
                            aria-label={t('students.showPage.autoLoginTitle')}
                            title={t('students.showPage.autoLoginTitle')}
                            onClick={() => setAccessRow(row)}
                          >
                            <Lock className="size-3.5" />
                          </Button>
                        ) : null}
                        <ShowButton onClick={() => navigate(studentPath(row.id))} />
                        {canEdit ? (
                          <EditButton onClick={() => navigate(studentEditPath(row.id))} />
                        ) : null}
                        {canRemove ? (
                          <Tooltip
                            side="left"
                            content={
                              deletable
                                ? undefined
                                : t('students.cannotDeleteGrouped')
                            }
                          >
                            <DeleteButton
                              disabled={!deletable}
                              onClick={() => deletable && setDeleteRow(row)}
                            />
                          </Tooltip>
                        ) : null}
                      </div>
                    </TD>
                  </TR>
                )
              })
              )}
            </TBody>
          </Table>
        ) : certTab ? (
          <Table storageKey="students-cert">
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="w-10">№</TH>
                <TH>{t('students.lastName')}</TH>
                <TH>{t('students.firstName')}</TH>
                <TH>{t('students.middleName')}</TH>
                <TH>{t('students.jshir')}</TH>
                <TH>{t('students.certificate')}</TH>
                <TH>{t('students.group')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
              <TR className="hover:bg-transparent bg-white">
                <FilterTH />
                <FilterTH>
                  <SearchInput
                    id="students-filter-last-name"
                    name="students-last-name"
                    size="sm"
                    label={t('students.lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-first-name"
                    name="students-first-name"
                    size="sm"
                    label={t('students.firstName')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-middle-name"
                    name="students-middle-name"
                    size="sm"
                    label={t('students.middleName')}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-jshir"
                    name="students-jshir"
                    size="sm"
                    label={t('students.jshir')}
                    value={jshir}
                    onChange={(e) =>
                      setJshir(e.target.value.replace(/\D/g, '').slice(0, 14))
                    }
                  />
                </FilterTH>
                <FilterTH>
                  <div className="flex gap-1">
                    <SearchInput
                      id="students-filter-cert-serial"
                      name="students-cert-serial"
                      size="sm"
                      label={t('students.serial')}
                      placeholder={t('students.serial')}
                      value={certSerial}
                      onChange={(e) =>
                        setCertSerial(e.target.value.toUpperCase().slice(0, 2))
                      }
                    />
                    <SearchInput
                      id="students-filter-cert-number"
                      name="students-cert-number"
                      size="sm"
                      label={t('students.number')}
                      placeholder={t('students.number')}
                      value={certNumber}
                      onChange={(e) =>
                        setCertNumber(e.target.value.replace(/\D/g, '').slice(0, 9))
                      }
                    />
                  </div>
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-group"
                    name="students-group"
                    size="sm"
                    label={t('students.group')}
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                  />
                </FilterTH>
                <FilterTH />
              </TR>
            </THead>
            <TBody>
              {empty ? (
                <TR>
                  <TD className="py-10 text-center" colSpan={8}>
                    <EmptyState description={t('common.empty')} />
                  </TD>
                </TR>
              ) : (
              certRows.map((row, index) => {
                const student = row.student
                const id = student?.id
                return (
                  <TR key={row.id}>
                    <TD className="text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD>
                      <NameLink id={id}>{student?.last_name || '—'}</NameLink>
                    </TD>
                    <TD>
                      <NameLink id={id}>{student?.first_name || '—'}</NameLink>
                    </TD>
                    <TD>
                      <NameLink id={id}>{student?.middle_name || '—'}</NameLink>
                    </TD>
                    <TD>{student?.passport_jshir || '—'}</TD>
                    <TD className="whitespace-nowrap">
                      {[row.certificate_serial, row.certificate_number]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </TD>
                    <TD>{asLangName(row.group, i18n.language)}</TD>
                    <TD>
                      {id ? (
                        <ShowButton onClick={() => navigate(studentPath(id))} />
                      ) : null}
                    </TD>
                  </TR>
                )
              })
              )}
            </TBody>
          </Table>
        ) : (
          <Table storageKey="students-no-cert">
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="w-10">№</TH>
                <TH>{t('students.lastName')}</TH>
                <TH>{t('students.firstName')}</TH>
                <TH>{t('students.middleName')}</TH>
                <TH>{t('students.jshir')}</TH>
                <TH>{t('students.organization')}</TH>
                <TH>{t('students.group')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
              <TR className="hover:bg-transparent bg-white">
                <FilterTH />
                <FilterTH>
                  <SearchInput
                    id="students-filter-last-name"
                    name="students-last-name"
                    size="sm"
                    label={t('students.lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-first-name"
                    name="students-first-name"
                    size="sm"
                    label={t('students.firstName')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-middle-name"
                    name="students-middle-name"
                    size="sm"
                    label={t('students.middleName')}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-jshir"
                    name="students-jshir"
                    size="sm"
                    label={t('students.jshir')}
                    value={jshir}
                    onChange={(e) =>
                      setJshir(e.target.value.replace(/\D/g, '').slice(0, 14))
                    }
                  />
                </FilterTH>
                <FilterTH>
                  <SearchInput
                    id="students-filter-org"
                    name="students-org"
                    size="sm"
                    label={t('students.organization')}
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                  />
                </FilterTH>
                <FilterTH />
                <FilterTH />
              </TR>
            </THead>
            <TBody>
              {empty ? (
                <TR>
                  <TD className="py-10 text-center" colSpan={8}>
                    <EmptyState description={t('common.empty')} />
                  </TD>
                </TR>
              ) : (
              noCertRows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-muted">
                    {(page - 1) * pageSize + index + 1}
                  </TD>
                  <TD>
                    <NameLink id={row.id}>{row.last_name || '—'}</NameLink>
                  </TD>
                  <TD>
                    <NameLink id={row.id}>{row.first_name || '—'}</NameLink>
                  </TD>
                  <TD>
                    <NameLink id={row.id}>{row.middle_name || '—'}</NameLink>
                  </TD>
                  <TD>{row.passport_jshir || '—'}</TD>
                  <TD>{asLangName(row.organization, i18n.language)}</TD>
                  <TD>{groupName(row, i18n.language)}</TD>
                  <TD>
                    <ShowButton onClick={() => navigate(studentPath(row.id))} />
                  </TD>
                </TR>
              ))
              )}
            </TBody>
          </Table>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </PageMain>

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onClose={() => setDeleteRow(null)}
        onConfirm={confirmDelete}
        description={t('common.confirmDelete', {
          name: [deleteRow?.last_name, deleteRow?.first_name]
            .filter(Boolean)
            .join(' '),
        })}
        loading={deleteMutation.isPending}
      />

      <StudentAccessModal
        open={Boolean(accessRow)}
        onClose={() => setAccessRow(null)}
        student={accessRow}
      />
    </>
  )
}
