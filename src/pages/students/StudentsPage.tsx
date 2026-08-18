import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Pagination,
  SearchInput,
  Select,
  Skeleton,
  Table,
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
import type { StudentItem, StudentsListTab } from '@/types/student'

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
  const [tab, setTab] = useState<StudentsListTab>('1')
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

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        <Tabs
          items={tabItems}
          value={tab}
          onChange={setTab}
          aria-label={t('students.title')}
        />

        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <TableSkeleton />
        ) : empty ? (
          <EmptyState description={t('common.empty')} />
        ) : listTab ? (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.lastName')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.lastName')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.firstName')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.firstName')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.middleName')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.middleName')}
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>{t('students.birthday')}</TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.jshir')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.jshir')}
                      value={jshir}
                      onChange={(e) =>
                        setJshir(e.target.value.replace(/\D/g, '').slice(0, 14))
                      }
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.eduType')}</span>
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
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.passportInfo')}</span>
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
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.status')}</span>
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
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('common.actions')}</span>
                    <Select
                      value={sortId}
                      onChange={(e) => setSortId(e.target.value)}
                      options={SORT_OPTIONS.map((item) => ({
                        value: item.id,
                        label: t(item.labelKey),
                      }))}
                    />
                  </div>
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => {
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
                        <Button
                          variant="soft"
                          size="icon-sm"
                          aria-label={t('common.view')}
                          onClick={() => navigate(studentPath(row.id))}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={t('common.edit')}
                          onClick={() => navigate(studentEditPath(row.id))}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <span
                          title={
                            deletable ? undefined : t('students.cannotDeleteGrouped')
                          }
                        >
                          <Button
                            variant="danger"
                            size="icon-sm"
                            aria-label={t('common.delete')}
                            disabled={!deletable}
                            onClick={() => deletable && setDeleteRow(row)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </span>
                      </div>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        ) : certTab ? (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.lastName')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.lastName')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.firstName')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.firstName')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.middleName')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.middleName')}
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.jshir')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.jshir')}
                      value={jshir}
                      onChange={(e) =>
                        setJshir(e.target.value.replace(/\D/g, '').slice(0, 14))
                      }
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.certificate')}</span>
                    <div className="flex gap-1">
                      <SearchInput
                        size="sm"
                        label={t('students.serial')}
                        placeholder={t('students.serial')}
                        value={certSerial}
                        onChange={(e) =>
                          setCertSerial(e.target.value.toUpperCase().slice(0, 2))
                        }
                      />
                      <SearchInput
                        size="sm"
                        label={t('students.number')}
                        placeholder={t('students.number')}
                        value={certNumber}
                        onChange={(e) =>
                          setCertNumber(e.target.value.replace(/\D/g, '').slice(0, 9))
                        }
                      />
                    </div>
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.group')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.group')}
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {certRows.map((row, index) => {
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
                        <Button
                          variant="soft"
                          size="icon-sm"
                          aria-label={t('common.view')}
                          onClick={() => navigate(studentPath(id))}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      ) : null}
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.lastName')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.lastName')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.firstName')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.firstName')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.middleName')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.middleName')}
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.jshir')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.jshir')}
                      value={jshir}
                      onChange={(e) =>
                        setJshir(e.target.value.replace(/\D/g, '').slice(0, 14))
                      }
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('students.organization')}</span>
                    <SearchInput
                      size="sm"
                      label={t('students.organization')}
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>{t('students.group')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {noCertRows.map((row, index) => (
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
                    <Button
                      variant="soft"
                      size="icon-sm"
                      aria-label={t('common.view')}
                      onClick={() => navigate(studentPath(row.id))}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  </TD>
                </TR>
              ))}
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
      </main>

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
    </>
  )
}
