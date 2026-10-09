import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Car, Download, Lock, UserCheck, UserX } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  notify,
  ErrorMessage,
  Panel,
  SafeImage,
  SkeletonLines,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  HeaderTR,
} from '@/components/ui'
import { teacherActionError } from '@/api'
import { PATH_PREFIX_FILE, carShowPath, groupShowPath, routes } from '@/config'
import { useAuth } from '@/features/auth'
import { useSetTeacherActiveMutation, useTeacherQuery } from '@/features/teachers'
import { resolveFileUrl } from '@/features/lessons/utils'
import { asText } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import { formatPhoneLocal } from '@/lib/phone'
import { useSmartBack } from '@/hooks'
import type { TeacherDetail } from '@/types/teachers'
import { StudentAccessModal } from '@/pages/students/StudentAccessModal'

const SHOW_LANG: Record<string, string> = {
  '1': 'teachersPage.langShow1',
  '2': 'teachersPage.langShow2',
  '3': 'teachersPage.langShow3',
  '4': 'teachersPage.langShow4',
  '5': 'teachersPage.langShow5',
}

function dashDate(value?: string | null) {
  const formatted = formatDate(value)
  return formatted ? formatted.replaceAll('.', '-') : ''
}

function fileHref(path?: string | null) {
  const value = path?.trim() ?? ''
  if (!value || value === 'null') return ''
  return resolveFileUrl(value, PATH_PREFIX_FILE)
}

function photoHref(path?: string | null) {
  const value = path?.trim() ?? ''
  if (!value || value === 'null' || value === 'https://back.eavtotalim.uz') return ''
  return resolveFileUrl(value, PATH_PREFIX_FILE)
}

function maskPassport(seria?: string | null, number?: string | null) {
  const s = (seria ?? '').trim()
  const n = (number ?? '').trim()
  if (!s && !n) return ''
  const seriaMask = s.length <= 1 ? s : `${s[0]}${'*'.repeat(s.length - 1)}`
  const numberMask = n.length <= 1 ? n : `${'*'.repeat(Math.min(3, n.length - 1))}${n.slice(-1)}`
  return [seriaMask, numberMask].filter(Boolean).join(' ')
}

function phoneText(raw?: string | null) {
  const local = formatPhoneLocal(raw ?? '')
  return local ? `+998${local}` : ''
}

function money(value?: number | string | null) {
  if (value == null || value === '') return ''
  const amount = Number(value)
  if (!Number.isFinite(amount)) return String(value)
  return amount.toLocaleString('en-US')
}

function groupStillActive(end?: string | null) {
  if (!end) return false
  const today = new Date()
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return iso < end.slice(0, 10)
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-0.5 text-[13px]">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="min-w-0 text-right font-medium text-deep">{children || '—'}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-4 mb-1 border-b border-mist/70 pb-1.5 text-[13px] font-semibold text-deep">
      {children}
    </h3>
  )
}

function FileLink({
  path,
  label,
}: {
  path?: string | null
  label: string
}) {
  const { t } = useTranslation()
  const href = fileHref(path)
  if (!href) return <span className="text-rose">—</span>
  return (
    <Button
      variant="soft"
      size="icon-sm"
      aria-label={t('teachersPage.download')}
      title={label}
      onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
    >
      <Download className="size-3.5" aria-hidden />
    </Button>
  )
}

function statusBadge(active: boolean, activeText: string, inactiveText: string) {
  return <Badge tone={active ? 'teal' : 'rose'}>{active ? activeText : inactiveText}</Badge>
}

function mspdBadge(
  status: number,
  ok: string,
  bad: string,
  pending: string,
) {
  const tone = status === 1 ? 'teal' : status === 2 ? 'rose' : 'amber'
  const text = status === 1 ? ok : status === 2 ? bad : pending
  return <Badge tone={tone}>{text}</Badge>
}

export function TeacherShowPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.teachers)
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const canPassword = hasPermission('show-user-password')
  const { data, isLoading, isError } = useTeacherQuery(id)
  const statusMutation = useSetTeacherActiveMutation(id ?? '')
  const [accessOpen, setAccessOpen] = useState(false)

  const name = data
    ? (data.fio || [data.last_name, data.first_name, data.middle_name].filter(Boolean).join(' '))
    : ''
  const langs = (data?.edu_langs ?? [])
    .map((item) => {
      const key = SHOW_LANG[String(item)]
      return key ? t(key) : ''
    })
    .filter(Boolean)
    .join(', ')
  const groups = data?.teachers_for_group ?? []
  const car = data?.car
  const created = dashDate(data?.created_at ?? data?.citizenship?.created_at)

  return (
    <>
      <Header
        title={name ? name.toUpperCase() : t('teachersPage.show')}
        onBack={goBack}
      />
      <PageMain fill className="xl:!overflow-hidden">
        {isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={12} />
          </Panel>
        ) : isError || !data ? (
          <ErrorMessage />
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:h-full xl:grid-cols-2 xl:grid-rows-1">
            <Panel
              padding="none"
              className="flex min-h-0 flex-col xl:h-full xl:!overflow-hidden"
            >
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <h2 className="text-base font-semibold tracking-wide text-deep uppercase">
                {name}
              </h2>
              <div className="mt-3 flex gap-4">
                <SafeImage
                  src={photoHref(data.image)}
                  alt=""
                  size="xl"
                  fit="contain"
                  className="size-28 shrink-0 rounded-xl border border-mist/80 bg-fog"
                />
                <div className="min-w-0 flex-1">
                  <Fact label={t('teachersPage.systemStatus')}>
                    {statusBadge(
                      Number(data.status) === 1,
                      t('teachersPage.statusActive'),
                      t('teachersPage.statusInactive'),
                    )}
                  </Fact>
                  <Fact label={t('teachersPage.infoStatus')}>
                    {mspdBadge(
                      Number(data.mspd_status),
                      t('teachersPage.mspdOk'),
                      t('teachersPage.mspdBad'),
                      t('teachersPage.mspdPending'),
                    )}
                  </Fact>
                  <Fact label={t('teachersPage.specializationShort')}>{data.specialization}</Fact>
                  <Fact label={t('teachersPage.eduLang')}>{langs}</Fact>
                  <Fact label={t('teachersPage.phoneNumber')}>
                    {phoneText(data.phone1 ?? data.phone)}
                  </Fact>
                  <Fact label={t('teachersPage.addressShort')}>{data.address}</Fact>
                  <Fact label={t('teachersPage.createdAt')}>{created}</Fact>
                </div>
              </div>

              <SectionTitle>{t('teachersPage.passportInfo')}</SectionTitle>
              <Fact label={t('teachersPage.citizenship')}>{asText(data.citizenship?.name)}</Fact>
              <Fact label={t('teachersPage.birthDate')}>{dashDate(data.birthday)}</Fact>
              <Fact label={t('teachersPage.seriesNumber')}>
                {maskPassport(data.passport_seria, data.passport_number)}
              </Fact>
              <Fact label={t('directorProfile.gender')}>
                {data.gender == null
                  ? ''
                  : Number(data.gender) === 1
                    ? t('directorProfile.male')
                    : t('directorProfile.female')}
              </Fact>
              <Fact label={t('teachersPage.issueDate')}>{data.passport_given_date}</Fact>
              <Fact label={t('teachersPage.issuePlace')}>{data.passport_given_place}</Fact>
              <Fact label={t('teachersPage.jshir')}>{data.passport_jshir}</Fact>
              <Fact label={t('teachersPage.permanentAddress')}>
                {[data.region?.name, data.area?.name].filter(Boolean).join(', ')}
              </Fact>
              <Fact label={t('teachersPage.copy')}>
                <FileLink path={data.passport_copy} label={t('teachersPage.copy')} />
              </Fact>

              <SectionTitle>{t('teachersPage.educationInfo')}</SectionTitle>
              <Fact label={t('teachersPage.institutionName')}>{data.institution_name}</Fact>
              <Fact label={t('teachersPage.infoStatus')}>{data.education_degree?.name}</Fact>
              <Fact label={t('teachersPage.diplomSeries')}>
                {[data.diplom_seria, data.diplom_number].filter(Boolean).join(' ')}
              </Fact>
              <Fact label={t('teachersPage.diplomGiven')}>{dashDate(data.diplom_given_date)}</Fact>
              <Fact label={t('teachersPage.diplomCopy')}>
                <FileLink path={data.diplom_copy} label={t('teachersPage.diplomCopy')} />
              </Fact>
              <Fact label={t('teachersPage.diplomAppCopy')}>
                <FileLink
                  path={data.diplom_application_copy}
                  label={t('teachersPage.diplomAppCopy')}
                />
              </Fact>
              <Fact label={t('teachersPage.certificateSeries')}>
                {[data.certificate_seria, data.certificate_number].filter(Boolean).join(' ')}
              </Fact>
              <Fact label={t('teachersPage.certificateGiven')}>
                {dashDate(data.certificate_given_date)}
              </Fact>
              <Fact label={t('teachersPage.certificateCopy')}>
                <FileLink path={data.certificate} label={t('teachersPage.certificateCopy')} />
              </Fact>

              </div>
              <div className="grid shrink-0 gap-2 border-t border-mist/70 bg-white p-4 sm:grid-cols-2">
                {canPassword ? (
                  <Button variant="outline" onClick={() => setAccessOpen(true)}>
                    <Lock className="size-3.5" aria-hidden />
                    {t('teachersPage.loginPassword')}
                  </Button>
                ) : null}
                <Button
                  variant={Number(data.status) === 1 ? 'danger' : 'primary'}
                  loading={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate(Number(data.status) !== 1, {
                      onError: (err) =>
                        notify.error(teacherActionError(err, t('common.loadError'))),
                    })
                  }
                >
                  {Number(data.status) === 1 ? (
                    <UserX className="size-3.5" aria-hidden />
                  ) : (
                    <UserCheck className="size-3.5" aria-hidden />
                  )}
                  {Number(data.status) === 1
                    ? t('teachersPage.stopTeacher')
                    : t('teachersPage.activateTeacher')}
                </Button>
              </div>
            </Panel>

            <Panel
              padding="md"
              className="flex min-h-0 flex-col xl:h-full xl:!overflow-hidden"
            >
              <div className="shrink-0">
              <SectionTitle>{t('teachersPage.attachedCar')}</SectionTitle>
              {car ? (
                <div className="flex shrink-0 gap-4">
                  <SafeImage
                    src={photoHref(car.photo)}
                    alt=""
                    icon={Car}
                    size="xl"
                    fit="contain"
                    className="size-28 shrink-0 rounded-xl border border-mist/80 bg-fog"
                  />
                  <div className="min-w-0 flex-1">
                    {car.id ? (
                      <Button
                        variant="link"
                        size="inline"
                        className="mb-1 text-base font-semibold uppercase"
                        onClick={() => navigate(carShowPath(car.id!))}
                      >
                        {car.name || '—'}
                      </Button>
                    ) : (
                      <p className="mb-1 text-base font-semibold text-deep uppercase">
                        {car.name || '—'}
                      </p>
                    )}
                    <Fact label={t('teachersPage.carNumber')}>{car.number}</Fact>
                    <Fact label={t('teachersPage.systemStatus')}>
                      {statusBadge(
                        Number(car.status) === 1,
                        t('teachersPage.statusActive'),
                        t('teachersPage.statusInactive'),
                      )}
                    </Fact>
                    <Fact label={t('teachersPage.infoStatus')}>
                      {mspdBadge(
                        Number(car.mspd_status),
                        t('teachersPage.mspdOk'),
                        t('teachersPage.mspdBad'),
                        t('teachersPage.mspdPending'),
                      )}
                    </Fact>
                    <Fact label={t('teachersPage.checkedAt')}>
                      {dashDate(car.mspd_check_date)}
                    </Fact>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-muted">—</p>
              )}
              </div>

              <div className="mt-2 shrink-0">
                <SectionTitle>{t('teachersPage.attachedGroups')}</SectionTitle>
              </div>
              <div className="flex min-h-80 min-w-0 flex-1 flex-col xl:min-h-0">
              <Table storageKey="teacher-show-groups" fill>
                <THead>
                  <HeaderTR>
                    <TH className="w-12 text-center">№</TH>
                    <TH>{t('teachersPage.groupName')}</TH>
                    <TH>{t('teachersPage.eduCategory')}</TH>
                    <TH>{t('teachersPage.duty')}</TH>
                    <TH className="text-center">{t('teachersPage.tuition')}</TH>
                    <TH className="text-center">{t('teachersPage.startDate')}</TH>
                    <TH className="text-center">{t('teachersPage.endDate')}</TH>
                    <TH className="text-center">{t('teachersPage.status')}</TH>
                  </HeaderTR>
                </THead>
                <TBody>
                  {groups.length === 0 ? (
                    <EmptyTR colSpan={8} />
                  ) : (
                    groups.map((row, index) => {
                      const group = row.group
                      const active = groupStillActive(group?.edu_ending_date)
                      const start = formatDate(group?.edu_starting_date)
                      return (
                        <TR key={row.id ?? index}>
                          <TD className="text-center text-muted">{index + 1}</TD>
                          <TD>
                            {group?.id ? (
                              <Button
                                variant="link"
                                size="inline"
                                onClick={() => navigate(groupShowPath(group.id!))}
                              >
                                {group.name || '—'}
                              </Button>
                            ) : (
                              group?.name || '—'
                            )}
                          </TD>
                          <TD>{group?.edu_type?.short_name || group?.edu_type?.name || '—'}</TD>
                          <TD>{row.type_teacher_for_group?.name || '—'}</TD>
                          <TD className="text-center">
                            {group?.education_price != null && group.education_price !== '' ? (
                              <Badge tone="neutral">{money(group.education_price)}</Badge>
                            ) : (
                              '—'
                            )}
                          </TD>
                          <TD className="text-center">
                            {start ? <Badge tone="teal">{start}</Badge> : '—'}
                          </TD>
                          <TD className="text-center">
                            {group?.edu_ending_date ? (
                              <Badge tone="rose">{group.edu_ending_date}</Badge>
                            ) : (
                              '—'
                            )}
                          </TD>
                          <TD className="text-center">
                            {statusBadge(
                              active,
                              t('teachersPage.statusActive'),
                              t('teachersPage.graduated'),
                            )}
                          </TD>
                        </TR>
                      )
                    })
                  )}
                </TBody>
              </Table>
              </div>
            </Panel>
          </div>
        )}
      </PageMain>

      <StudentAccessModal
        open={accessOpen}
        student={data ? accessStudent(data) : null}
        onClose={() => setAccessOpen(false)}
      />
    </>
  )
}

function accessStudent(data: TeacherDetail) {
  return {
    id: data.id,
    user_id: data.user_id,
    last_name: data.last_name,
    first_name: data.first_name,
    middle_name: data.middle_name,
  }
}
