import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  DetailList,
  EmptyState,
  Panel,
  Skeleton,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { PATH_PREFIX_FILE, groupShowPath } from '@/config'
import { useGroupDetailsQuery } from '@/features/group-details'
import { formatLessonTime, parseWeekDays } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import { useAuth } from '@/features/auth'
import { asLangName, asText } from '@/lib/apiPage'
import { formatDate, formatDateTime } from '@/lib/format'
import type { StudentGroup, StudentItem } from '@/types/student'
import { StudentSchoolInfoPanel } from './StudentSchoolInfoPanel'
import { StudentProfileHeader } from './StudentProfileHeader'

const DAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sh', 'Ya'] as const

function daysLabel(value: string | number[] | null | undefined) {
  const days = parseWeekDays(value)
  if (!days.length) return '—'
  return days.map((d) => DAY_LABELS[d - 1] ?? String(d)).join(' | ')
}

function cameraPendingLabel(status: number | null | undefined, t: (k: string) => string) {
  if (status === 1 || status === 2) return { label: t('students.showPage.cameraJoining'), tone: 'amber' as const }
  if (status === 3) return { label: t('students.showPage.cameraOk'), tone: 'teal' as const }
  if (status === 4 || status === 5) return { label: t('students.showPage.cameraError'), tone: 'rose' as const }
  if (status === 6) return { label: t('students.showPage.cameraQueuedDelete'), tone: 'amber' as const }
  if (status === 7) return { label: t('students.showPage.cameraDeleted'), tone: 'rose' as const }
  return { label: t('students.showPage.cameraUnknown'), tone: 'neutral' as const }
}

export function StudentShowSidebar({
  studentId,
  student,
  group,
}: {
  studentId: string
  student: StudentItem
  group: StudentGroup | null
}) {
  const { t, i18n } = useTranslation()
  const { isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const pending = student.monitoring_camera_pending_student
  const pendingMeta = cameraPendingLabel(pending?.status, t)
  const pendingImg = resolveFileUrl(pending?.image, PATH_PREFIX_FILE)
  const exclusion = student.exclusions?.[0]
  const isDeed = String(student.document_type_id) === '2'
  const seria = isDeed
    ? student.document_seria
    : student.passport_seria ?? student.passport?.serial
  const number = isDeed
    ? student.document_number
    : student.passport_number ?? student.passport?.number
  const { data: details, isLoading: detailsLoading } = useGroupDetailsQuery(
    student.id,
  )
  const teachers = details?.teachers ?? []
  const cars = details?.cars ?? []

  return (
    <div className="space-y-3">
      <StudentProfileHeader studentId={studentId} student={student} group={group} />

      <StudentSchoolInfoPanel student={student} />

      <Panel padding="md">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-deep">
          {t('students.showPage.passportSection')}
        </p>
        <DetailList
          className="sm:grid-cols-2 lg:grid-cols-2"
          items={[
            {
              label: t('students.showPage.seriesAndNumber'),
              value: [seria, number].filter(Boolean).join(' ') || '—',
            },
            {
              label: isDeed ? t('students.showPage.actNumber') : t('students.showPage.jshir'),
              value: isDeed ? student.deed_number : student.passport_jshir,
            },
            {
              label: t('students.showPage.birthDate'),
              value: formatDate(student.birthday, i18n.language),
            },
            {
              label: t('students.showPage.issueDate'),
              value: formatDate(
                isDeed ? student.document_given_date : student.passport_given_date,
                i18n.language,
              ),
            },
            {
              label: isDeed
                ? t('students.showPage.regPlace')
                : t('students.showPage.givenBy'),
              value: isDeed
                ? student.document_given_place
                : student.passport_given_place,
            },
            ...(group?.uztelecom_aes_event?.task_id
              ? [
                  {
                    label: t('students.showPage.myGov'),
                    value: String(group.uztelecom_aes_event.task_id),
                  },
                ]
              : []),
            {
              label: t('students.showPage.autodromeJoin'),
              value: (
                <Badge tone={student.is_join_autodrome ? 'teal' : 'rose'}>
                  {student.is_join_autodrome
                    ? t('students.showPage.joined')
                    : t('students.showPage.notJoined')}
                </Badge>
              ),
            },
            ...(pending
              ? [
                  {
                    label: t('students.showPage.cameraSend'),
                    value: (
                      <span className="flex items-center gap-2">
                        {pendingImg ? (
                          <img
                            src={pendingImg}
                            alt=""
                            className="size-8 rounded-full object-cover"
                          />
                        ) : null}
                        <Badge tone={pendingMeta.tone}>{pendingMeta.label}</Badge>
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Panel>

      <Panel padding="md">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-deep">
          {t('students.showPage.groupSection')}
        </p>
        {exclusion ? (
          <button
            type="button"
            className="w-full rounded-xl border border-mist/80 p-3 text-left"
            onClick={() =>
              exclusion.group_id
                ? navigate(groupShowPath(exclusion.group_id))
                : undefined
            }
          >
            <p className="text-sm text-muted">{t('students.showPage.excluded')}</p>
            <p className="mt-1 text-sm font-medium text-deep">
              {t('students.showPage.excludedDate')}:{' '}
              {formatDate(exclusion.excluded_date, i18n.language) ?? '—'}
            </p>
          </button>
        ) : !group ? (
          <EmptyState description={t('students.showPage.noGroup')} />
        ) : (
          <DetailList
            className="sm:grid-cols-2 lg:grid-cols-2"
            items={[
              {
                label: t('students.showPage.groupName'),
                value:
                  Number(student.grouped) === 1 && group.id ? (
                    <button
                      type="button"
                      className="font-medium text-signal hover:underline"
                      onClick={() => navigate(groupShowPath(group.id!))}
                    >
                      {asLangName(group, i18n.language)}
                    </button>
                  ) : (
                    <Badge tone="rose">{t('students.showPage.notInGroupTag')}</Badge>
                  ),
              },
              {
                label: t('students.showPage.eduCategory'),
                value: group.edu_type?.short_name || group.edu_type?.name_uz,
              },
              {
                label: t('students.showPage.eduLang'),
                value: asText(group.edu_lang?.name),
              },
              {
                label: t('students.showPage.eduDates'),
                value:
                  group.edu_starting_date || group.edu_ending_date
                    ? `${formatDate(group.edu_starting_date, i18n.language) ?? '—'} - ${
                        formatDate(group.edu_ending_date, i18n.language) ?? '—'
                      }`
                    : '—',
              },
              {
                label: t('students.showPage.theoryDays'),
                value: daysLabel(group.week_days),
              },
              {
                label: t('students.showPage.practiceDays'),
                value: daysLabel(group.practical_week_days),
              },
              {
                label: t('students.showPage.theoryTime'),
                value: formatLessonTime(group.start_time, group.end_time) ?? '—',
              },
              {
                label: t('students.showPage.practiceTime'),
                value:
                  formatLessonTime(
                    group.practical_start_time,
                    group.practical_end_time,
                  ) ?? '—',
              },
            ]}
          />
        )}
      </Panel>

      {isSuperAdmin ? (
        <Panel padding="md">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-deep">
            {t('students.showPage.additional')}
          </p>
          <DetailList
            className="sm:grid-cols-2 lg:grid-cols-2"
            items={[
              {
                label: t('students.showPage.created'),
                value: [formatDateTime(student.created_at, i18n.language), student.created_by?.name]
                  .filter(Boolean)
                  .join(' ') || '—',
              },
              {
                label: t('students.showPage.updated'),
                value: [formatDateTime(student.updated_at, i18n.language), student.updated_by?.name]
                  .filter(Boolean)
                  .join(' ') || '—',
              },
            ]}
          />
        </Panel>
      ) : null}

      {detailsLoading ? (
        <Panel padding="md">
          <Skeleton className="mb-2 h-4 w-40" />
          <SkeletonLines lines={4} />
        </Panel>
      ) : null}

      {teachers.length ? (
        <Panel padding="md">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-deep">
            {t('groupDetails.teachersTitle')}
          </p>
          <Table storageKey="student-show-teachers">
            <THead>
              <TR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('groupDetails.fullName')}</TH>
                <TH>{t('groupDetails.specialization')}</TH>
              </TR>
            </THead>
            <TBody>
              {teachers.map((teacher, index) => (
                <TR key={teacher.id ?? index}>
                  <TD className="text-center">{index + 1}</TD>
                  <TD className="font-medium text-deep">
                    {teacher.full_name || '—'}
                  </TD>
                  <TD>
                    {teacher.specialization ? (
                      <Badge tone="teal">{teacher.specialization}</Badge>
                    ) : (
                      '—'
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Panel>
      ) : null}

      {cars.length ? (
        <Panel padding="md">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-deep">
            {t('groupDetails.carsTitle')}
          </p>
          <Table storageKey="student-show-cars">
            <THead>
              <TR>
                <TH className="w-12 text-center">№</TH>
                <TH className="w-20">{t('groupDetails.photo')}</TH>
                <TH>{t('groupDetails.carName')}</TH>
                <TH>{t('groupDetails.carNumber')}</TH>
              </TR>
            </THead>
            <TBody>
              {cars.map((car, index) => {
                const src = resolveFileUrl(car.photo, PATH_PREFIX_FILE)
                return (
                  <TR key={car.id ?? index}>
                    <TD className="text-center">{index + 1}</TD>
                    <TD>
                      {src ? (
                        <img
                          src={src}
                          alt={car.name || ''}
                          className="size-12 rounded-lg object-cover"
                        />
                      ) : (
                        '—'
                      )}
                    </TD>
                    <TD className="font-medium text-deep">{car.name || '—'}</TD>
                    <TD>
                      {car.number ? <Badge tone="teal">{car.number}</Badge> : '—'}
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </Panel>
      ) : null}
    </div>
  )
}
