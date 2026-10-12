import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, GraduationCap } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ErrorMessage,
  Panel,
  SafeImage,
  SkeletonCard,
  Tooltip,
} from '@/components/ui'
import { PATH_PREFIX_FILE, routes } from '@/config'
import { eduTypeShortName, sortEduTypes } from '@/config/eduTypes'
import { useAllOrganizationQuery } from '@/features/all-organizations'
import { useSmartBack } from '@/hooks'
import { formatNumber } from '@/lib'
import { cn } from '@/lib/cn'
import type { InspectionOrganization } from '@/types/all-organizations'

function filled(value: unknown) {
  if (value == null) return ''
  const text = String(value).trim()
  if (!text || text === 'null' || text === 'undefined') return ''
  return text
}

function fileUrl(path: string | null | undefined) {
  const value = filled(path)
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${PATH_PREFIX_FILE.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
}

function phoneOf(value: unknown) {
  const text = filled(value)
  if (!text) return ''
  if (text.startsWith('+')) return text
  const digits = text.replace(/\D/g, '')
  if (!digits) return text
  return digits.startsWith('998') ? `+${digits}` : `+998${digits}`
}

function count(value: number | null | undefined) {
  return Number(value) || 0
}

function tariffOf(org: InspectionOrganization, lang: string) {
  const type = org.last_agreement?.agreement_type
  if (!type) return 'Base'
  if (lang === 'ru') return type.name_ru || type.name_uz || 'Base'
  if (lang === 'kiril') return type.name_kiril || type.name_uz || 'Base'
  return type.name_uz || 'Base'
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="truncate text-sm font-medium text-deep">{value || '—'}</p>
    </div>
  )
}

function StateChip({ label, on, detail }: { label: string; on: boolean; detail?: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <span className="truncate text-muted">{label}</span>
      <Badge tone={on ? 'teal' : 'rose'}>
        {on ? detail || t('allSchoolsPage.present') : t('allSchoolsPage.absent')}
      </Badge>
    </div>
  )
}

function InfoRow({
  title,
  left,
  leftValue,
  right,
  rightValue,
}: {
  title: string
  left: string
  leftValue: number
  right?: string
  rightValue?: number
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-mist/60 py-2 last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{title}</p>
        <p className="truncate text-[12px] text-ink">{left}</p>
      </div>
      <div className="flex shrink-0 items-baseline gap-3">
        <span className="font-display text-lg font-semibold text-deep">{formatNumber(leftValue)}</span>
        {right ? (
          <span className="text-right">
            <span className="block text-[11px] text-muted">{right}</span>
            <span className="font-display text-sm font-semibold text-teal">{formatNumber(rightValue ?? 0)}</span>
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function AllOrganizationShowPage() {
  const { id = '' } = useParams()
  const goBack = useSmartBack(routes.allOrganizations)
  const { t, i18n } = useTranslation()
  const query = useAllOrganizationQuery(id)
  const org = query.data

  if (query.isLoading && !org) {
    return (
      <>
        <Header title={t('nav.allOrganizations')} onBack={goBack} />
        <PageMain>
          <SkeletonCard />
          <SkeletonCard />
        </PageMain>
      </>
    )
  }

  if (query.isError || !org) {
    return (
      <>
        <Header title={t('nav.allOrganizations')} onBack={goBack} />
        <PageMain>
          <ErrorMessage />
        </PageMain>
      </>
    )
  }

  const report = org.report
  const director = org.director
  const directorName = [director?.first_name, director?.last_name].map(filled).filter(Boolean).join(' ')
  const passport = [director?.passport_seria, director?.passport_number].map(filled).filter(Boolean).join(' ')
  const guide = filled(org.study_platform_agreement?.study_guide?.name)
  const face = filled(org.study_platform_agreement?.face_control?.name)
  const autodrome = org.examination_area_agreement?.organization_autodrome_agreement_status?.id === 2
  const monitoring = org.study_platform_agreement?.monitoring === 1
  const students = count(report?.students_count)
  const endedStudents = count(report?.ended_students_count)
  const groups = count(report?.groups_count)
  const endedGroups = count(report?.ended_groups_count)
  const eduTypes = sortEduTypes(org.report_by_edu_type ?? [])
  const allowed = eduTypes.filter((item) => item.access_organization != null).length
  const license = fileUrl(org.license_file) || fileUrl(org.license?.file)
  const legalAddress = filled(org.y_address) || filled(org.address) || filled(director?.address)

  return (
    <>
      <Header
        title={org.name || '—'}
        onBack={goBack}
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="amber">{tariffOf(org, i18n.language)}</Badge>
            <Badge tone="teal">
              {t('allSchoolsPage.allStudents')}: {formatNumber(students + endedStudents)}
            </Badge>
            <Badge tone="signal">
              {t('allSchoolsPage.limit')}: {formatNumber(report?.limit_students_count)}
            </Badge>
            <Badge tone="teal">
              {t('allSchoolsPage.used')}: {formatNumber(report?.used_limit_count)}
            </Badge>
            <Badge tone="rose">
              {t('allSchoolsPage.exceeded')}: {formatNumber(report?.unpaid_students_count)}
            </Badge>
          </div>
        }
      />
      <PageMain>
        <Panel padding="sm">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <StateChip
              label={t('allSchoolsPage.face')}
              on={Boolean(face)}
              detail={face ? `${t('allSchoolsPage.present')} (${face})` : undefined}
            />
            <StateChip label={t('allSchoolsPage.unifiedTest')} on={Boolean(guide)} detail={t('allSchoolsPage.present')} />
            <StateChip label={t('allSchoolsPage.euq')} on={Boolean(guide)} detail={t('allSchoolsPage.present')} />
            <StateChip label={t('allSchoolsPage.autodromeContract')} on={autodrome} detail={t('allSchoolsPage.present')} />
            <StateChip label={t('allSchoolsPage.monitoring')} on={monitoring} detail={t('allSchoolsPage.present')} />
          </div>
        </Panel>

        <Panel padding="sm">
          <div className="flex gap-4">
            <SafeImage
              src={fileUrl(director?.image)}
              alt={directorName}
              size="lg"
              className="size-24 shrink-0 rounded-xl"
            />
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Fact label={t('allSchoolsPage.director')} value={directorName} />
              <Fact label={t('allSchoolsPage.passport')} value={passport} />
              <Fact label={t('allSchoolsPage.jshir')} value={filled(director?.passport_jshir)} />
              <Fact label={t('allSchoolsPage.address')} value={filled(director?.address)} />
              <Fact label={t('allSchoolsPage.phone')} value={phoneOf(director?.phone)} />
              <Fact label={t('allSchoolsPage.inn')} value={filled(org.inn)} />
              <Fact label={t('allSchoolsPage.orgPhone')} value={phoneOf(org.phone)} />
              <Fact label={t('allSchoolsPage.mfo')} value={filled(org.mfo)} />
            </div>
          </div>
          <div className="mt-3 grid gap-3 border-t border-mist/70 pt-3 sm:grid-cols-3">
            <Fact label={t('allSchoolsPage.legalName')} value={filled(org.name)} />
            <Fact label={t('allSchoolsPage.legalAddress')} value={legalAddress} />
            <Fact label={t('allSchoolsPage.phone')} value={phoneOf(director?.phone || org.phone)} />
          </div>
        </Panel>

        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
          <Panel padding="sm">
            <p className="mb-1 text-sm font-semibold text-deep">{t('allSchoolsPage.aboutOrg')}</p>
            <InfoRow
              title={t('allSchoolsPage.staff')}
              left={t('allSchoolsPage.allTeachers')}
              leftValue={count(report?.teachers_count)}
            />
            <InfoRow
              title={t('allSchoolsPage.students')}
              left={t('allSchoolsPage.allStudents')}
              leftValue={students + endedStudents}
              right={t('allSchoolsPage.activeStudentsShort')}
              rightValue={students}
            />
            <InfoRow
              title={t('allSchoolsPage.groups')}
              left={t('allSchoolsPage.allGroups')}
              leftValue={groups + endedGroups}
              right={t('allSchoolsPage.activeGroupsShort')}
              rightValue={groups}
            />
            <InfoRow
              title={t('allSchoolsPage.cars')}
              left={t('allSchoolsPage.carCount')}
              leftValue={count(report?.cars_count)}
              right={t('allSchoolsPage.gpsCars')}
              rightValue={count(report?.count_car_with_gps)}
            />
          </Panel>

          <Panel padding="sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-deep">
                <GraduationCap className="size-4 text-violet" />
                {t('allSchoolsPage.eduTitle')}
              </p>
              <Badge tone="teal">
                {t('allSchoolsPage.allowed')}: {allowed} {t('allSchoolsPage.unit')}
              </Badge>
            </div>
            {eduTypes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">{t('common.empty')}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {eduTypes.map((item) => {
                  const on = item.access_organization != null
                  const studying = count(item.students_count)
                  const graduated = count(item.ended_students_count)
                  return (
                    <div
                      key={item.edu_type_id}
                      className={cn(
                        'rounded-lg border px-2 py-1.5',
                        on ? 'border-teal/30 bg-teal-soft/40' : 'border-rose/20 bg-rose-soft/30',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'inline-flex min-w-7 items-center justify-center rounded px-1.5 text-[11px] font-bold',
                            on ? 'bg-teal text-white' : 'bg-rose-soft text-rose',
                          )}
                        >
                          {eduTypeShortName(item.edu_type_id)}
                        </span>
                        <span className="font-display text-sm font-semibold text-deep">
                          {formatNumber(studying + graduated)}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-[12px] font-semibold">
                        <Tooltip content={t('allSchoolsPage.studying')}>
                          <span className="text-teal">{formatNumber(studying)}</span>
                        </Tooltip>
                        <Tooltip content={t('allSchoolsPage.graduated')}>
                          <span className="text-muted">{formatNumber(graduated)}</span>
                        </Tooltip>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>

        <Panel padding="sm" className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-deep">{t('allSchoolsPage.license')}</p>
          {license ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(license, '_blank', 'noopener')}
            >
              <Download className="size-4" />
              {t('allSchoolsPage.download')}
            </Button>
          ) : (
            <span className="text-sm text-muted">—</span>
          )}
        </Panel>
      </PageMain>
    </>
  )
}
