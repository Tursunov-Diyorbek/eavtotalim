import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Car, LayoutGrid, Lock, Stethoscope, X } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  EditButton,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Pagination,
  Select,
  ShowButton,
  Table,
  TableSearch,
  Tabs,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { groupShowPath, routes, teacherEditPath, teacherPath } from '@/config'
import { useAuth } from '@/features/auth'
import { useTeachersQuery } from '@/features/teachers'
import { usePageState } from '@/hooks'
import { fullNameOf } from '@/lib'
import type { TeacherItem } from '@/types/teachers'
import { StudentAccessModal } from '@/pages/students/StudentAccessModal'

const TYPE_TABS = [
  { value: 'all', labelKey: 'teachersPage.tabAll', icon: LayoutGrid },
  { value: '1', labelKey: 'teachersPage.tabTheory', icon: BookOpen },
  { value: '2', labelKey: 'teachersPage.tabPractice', icon: Car },
  { value: '3', labelKey: 'teachersPage.tabMedical', icon: Stethoscope },
] as const

function maskMiddle(value?: string | null) {
  const raw = (value ?? '').trim()
  if (raw.length <= 2) return raw
  return `${raw[0]}${'*'.repeat(raw.length - 2)}${raw[raw.length - 1]}`
}

function groupTypeTone(
  typeId?: number | string | null,
  typeName?: string | null,
): 'teal' | 'violet' | 'rose' {
  const value = Number(typeId)
  const name = (typeName ?? '').toLowerCase()
  if (value === 2 || name.includes('amal')) return 'teal'
  if (value === 1 || name.includes('nazar')) return 'violet'
  return 'rose'
}

function TeacherGroups({
  teacher,
  onClose,
  onOpen,
}: {
  teacher: TeacherItem
  onClose: () => void
  onOpen: (id: number) => void
}) {
  const { t } = useTranslation()
  const groups = teacher.groups ?? []
  const name = fullNameOf(teacher)

  return (
    <div>
      <div className="flex items-start gap-3 border-b border-mist/70 px-4 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-muted">{t('teachersPage.groupsTitle')}</p>
          <h3 className="mt-0.5 text-base font-semibold tracking-wide text-deep uppercase">
            {name || t('teachersPage.title')}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {t('teachersPage.groupsCount', { count: groups.length })}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label={t('common.close')} onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      <ul className="space-y-2 px-4 py-3">
        {groups.map((group, index) => (
          <li key={group.id ?? index}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border border-mist/70 bg-fog px-3 py-3 text-left transition hover:border-signal/35 hover:bg-white"
              onClick={() => group.id && onOpen(group.id)}
              disabled={!group.id}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-signal ring-1 ring-mist">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-deep">
                  {group.name_uz || group.name || '—'}
                </span>
                {group.type_name ? (
                  <span className="mt-1 inline-flex">
                    <Badge tone={groupTypeTone(group.type_teacher_id, group.type_name)}>
                      {group.type_name}
                    </Badge>
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 rounded-lg bg-signal-soft px-2.5 py-1 text-[13px] font-semibold text-signal">
                {t('teachersPage.openGroup')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function maskPassport(seria?: string | null, number?: string | null) {
  const s = (seria ?? '').trim()
  const n = (number ?? '').trim()
  if (!s && !n) return ''
  const seriaMask = s.length <= 1 ? s : `${s[0]}${'*'.repeat(s.length - 1)}`
  const numberMask = n.length <= 1 ? n : `${'*'.repeat(Math.min(3, n.length - 1))}${n.slice(-1)}`
  return [seriaMask, numberMask].filter(Boolean).join(' ')
}

export function TeachersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canPassword = hasPermission('show-user-password')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [lastName, setLastName] = usePageState('lastName', '')
  const [firstName, setFirstName] = usePageState('firstName', '')
  const [middleName, setMiddleName] = usePageState('middleName', '')
  const [passport, setPassport] = usePageState('passport', '')
  const [jshir, setJshir] = usePageState('jshir', '')
  const [status, setStatus] = usePageState('status', '')
  const [mspdStatus, setMspdStatus] = usePageState('mspdStatus', '')
  const [teacherType, setTeacherType] = usePageState('teacherType', 'all')
  const [access, setAccess] = useState<TeacherItem | null>(null)
  const [groupsOf, setGroupsOf] = useState<TeacherItem | null>(null)

  useEffect(() => {
    setPage(1)
  }, [lastName, firstName, middleName, passport, jshir, status, mspdStatus, teacherType, pageSize])

  const seria = passport.slice(0, 2).replace(/[^A-Za-z]/g, '').toUpperCase()
  const number = passport.slice(2).replace(/\D/g, '').slice(0, 7)

  const { data, isLoading, isError } = useTeachersQuery({
    page,
    showCount: pageSize,
    lastName,
    firstName,
    middleName,
    passportSeria: seria,
    passportNumber: number,
    passportJshir: jshir,
    status,
    mspdStatus,
    typeId: teacherType === 'all' ? undefined : teacherType,
  })

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header
        title={t('teachersPage.title')}
        actions={
          <AddButton onClick={() => navigate(routes.teacherCreate)}>
            {t('common.add')}
          </AddButton>
        }
      />
      <PageMain fill>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <Tabs
            className="shrink-0"
            size="sm"
            aria-label={t('teachersPage.teacherType')}
            value={teacherType}
            onChange={(value) => {
              setTeacherType(value)
              setPage(1)
            }}
            items={TYPE_TABS.map((tab) => ({
              value: tab.value,
              label: t(tab.labelKey),
              icon: <tab.icon className="size-3.5" aria-hidden />,
            }))}
          />
          {isError ? (
            <ErrorMessage />
          ) : isLoading ? (
            <ListPageSkeleton rows={8} />
          ) : (
            <>
              <Table storageKey="teachers">
                <THead>
                  <HeaderTR>
                    <TH className="w-14 text-center">№</TH>
                    <TH>{t('teachersPage.lastName')}</TH>
                    <TH>{t('teachersPage.firstName')}</TH>
                    <TH>{t('teachersPage.middleName')}</TH>
                    <TH>{t('teachersPage.passport')}</TH>
                    <TH>{t('teachersPage.jshir')}</TH>
                    <TH>{t('teachersPage.mspd')}</TH>
                    <TH className="w-44 text-center">{t('teachersPage.status')}</TH>
                    <TH className="w-28 text-center">{t('common.actions')}</TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH />
                    <FilterTH>
                      <TableSearch
                        label={t('teachersPage.lastName')}
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH>
                      <TableSearch
                        label={t('teachersPage.firstName')}
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH>
                      <TableSearch
                        label={t('teachersPage.middleName')}
                        value={middleName}
                        onChange={(event) => setMiddleName(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH>
                      <TableSearch
                        label={t('teachersPage.passport')}
                        placeholder="AA1234567"
                        value={passport}
                        onChange={(event) =>
                          setPassport(event.target.value.toUpperCase().slice(0, 9))
                        }
                      />
                    </FilterTH>
                    <FilterTH>
                      <TableSearch
                        label={t('teachersPage.jshir')}
                        placeholder={t('teachersPage.jshirPlaceholder')}
                        value={jshir}
                        onChange={(event) =>
                          setJshir(event.target.value.replace(/\D/g, '').slice(0, 14))
                        }
                      />
                    </FilterTH>
                    <FilterTH>
                      <Select
                        size="sm"
                        value={mspdStatus}
                        onChange={(event) => setMspdStatus(event.target.value)}
                        options={[
                          { value: '', label: t('common.all') },
                          { value: '1', label: t('teachersPage.mspdOk') },
                          { value: '0', label: t('teachersPage.mspdPending') },
                          { value: '2', label: t('teachersPage.mspdBad') },
                        ]}
                      />
                    </FilterTH>
                    <FilterTH>
                      <Select
                        size="sm"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        options={[
                          { value: '', label: t('common.all') },
                          { value: '1', label: t('teachersPage.statusActive') },
                          { value: '2', label: t('teachersPage.statusNoGroup') },
                          { value: '0', label: t('teachersPage.statusInactive') },
                        ]}
                      />
                    </FilterTH>
                    <FilterTH />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={9} description={t('common.empty')} />
                  ) : (
                    rows.map((row, index) => {
                      const groups = row.groups ?? []
                      const statusValue = Number(row.status)
                      const mspd = Number(row.mspd_status)
                      return (
                        <TR key={row.id}>
                          <TD className="text-center text-muted">
                            {(page - 1) * pageSize + index + 1}
                          </TD>
                          <TD>
                            <Button
                              variant="link"
                              size="inline"
                              onClick={() => navigate(teacherPath(row.id))}
                            >
                              {row.last_name || '—'}
                            </Button>
                          </TD>
                          <TD>
                            <Button
                              variant="link"
                              size="inline"
                              onClick={() => navigate(teacherPath(row.id))}
                            >
                              {row.first_name || '—'}
                            </Button>
                          </TD>
                          <TD>
                            <Button
                              variant="link"
                              size="inline"
                              onClick={() => navigate(teacherPath(row.id))}
                            >
                              {row.middle_name || '—'}
                            </Button>
                          </TD>
                          <TD className="whitespace-nowrap tracking-wide">
                            {maskPassport(row.passport_seria, row.passport_number) || '—'}
                          </TD>
                          <TD className="whitespace-nowrap tracking-wide">
                            {maskMiddle(row.passport_jshir) || '—'}
                          </TD>
                          <TD>
                            <Badge
                              tone={mspd === 1 ? 'teal' : mspd === 2 ? 'rose' : 'neutral'}
                            >
                              {mspd === 1
                                ? t('teachersPage.mspdOk')
                                : mspd === 2
                                  ? t('teachersPage.mspdBad')
                                  : t('teachersPage.mspdPending')}
                            </Badge>
                          </TD>
                          <TD className="text-center">
                            {groups.length > 0 ? (
                              <Button
                                variant="soft"
                                size="sm"
                                onClick={() => setGroupsOf(row)}
                              >
                                {t('teachersPage.activeGroups', { count: groups.length })}
                              </Button>
                            ) : (
                              <Badge
                                tone={
                                  statusValue === 0
                                    ? 'rose'
                                    : statusValue === 2
                                      ? 'amber'
                                      : 'teal'
                                }
                              >
                                {statusValue === 0
                                  ? t('teachersPage.statusInactive')
                                  : statusValue === 2
                                    ? t('teachersPage.statusNoGroup')
                                    : t('teachersPage.statusActive')}
                              </Badge>
                            )}
                          </TD>
                          <TD>
                            <div className="flex items-center justify-center gap-1">
                              {canPassword ? (
                                <Button
                                  variant="soft"
                                  size="icon-sm"
                                  aria-label={t('students.showPage.autoLoginTitle')}
                                  onClick={() => setAccess(row)}
                                >
                                  <Lock className="size-3.5" />
                                </Button>
                              ) : null}
                              <ShowButton onClick={() => navigate(teacherPath(row.id))} />
                              <EditButton onClick={() => navigate(teacherEditPath(row.id))} />
                            </div>
                          </TD>
                        </TR>
                      )
                    })
                  )}
                </TBody>
              </Table>
              <div className="shrink-0">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  total={total}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </>
          )}
        </div>
      </PageMain>

      <Modal
        open={groupsOf != null}
        onClose={() => setGroupsOf(null)}
        hideHeader
        sizeClassName="max-w-[460px]"
        bodyClassName="overflow-y-auto p-0"
      >
        {groupsOf ? (
          <TeacherGroups
            teacher={groupsOf}
            onClose={() => setGroupsOf(null)}
            onOpen={(id) => {
              setGroupsOf(null)
              navigate(groupShowPath(id))
            }}
          />
        ) : null}
      </Modal>

      <StudentAccessModal
        open={access != null}
        student={access}
        onClose={() => setAccess(null)}
      />
    </>
  )
}
