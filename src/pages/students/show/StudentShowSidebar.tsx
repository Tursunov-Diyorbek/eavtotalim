import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Car } from 'lucide-react'
import {
  Badge,
  DetailList,
  EmptyState,
  Modal,
  Panel,
  SafeImage,
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
import { cn } from '@/lib/cn'
import { useGroupDetailsQuery } from '@/features/group-details'
import { formatLessonTime, parseWeekDays } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import { useAuth } from '@/features/auth'
import { asLangName, asText } from '@/lib/apiPage'
import { formatDate, formatDateTime } from '@/lib/format'
import type { StudentGroup, StudentItem } from '@/types/student'

const DAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sh', 'Ya'] as const

function daysLabel(value: string | number[] | null | undefined) {
  const days = parseWeekDays(value)
  if (!days.length) return '—'
  return days.map((d) => DAY_LABELS[d - 1] ?? String(d)).join(' | ')
}

function SectionTitle({ children, className }: { children: string; className?: string }) {
  return (
    <p
      className={cn(
        'text-[11px] font-semibold tracking-wide text-deep uppercase',
        className ?? 'mb-2',
      )}
    >
      {children}
    </p>
  )
}

export function StudentPassportPanel({
  student,
  group,
}: {
  student: StudentItem
  group: StudentGroup | null
}) {
  const { t, i18n } = useTranslation()
  const isDeed = String(student.document_type_id) === '2'
  const seria = isDeed
    ? student.document_seria
    : student.passport_seria ?? student.passport?.serial
  const number = isDeed
    ? student.document_number
    : student.passport_number ?? student.passport?.number

  return (
    <Panel padding="sm" className="h-full">
      <SectionTitle>{t('students.showPage.passportSection')}</SectionTitle>
      <DetailList
        className="gap-y-1.5"
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
        ]}
      />
    </Panel>
  )
}

export function StudentGroupPanel({
  student,
  group,
}: {
  student: StudentItem
  group: StudentGroup | null
}) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const exclusion = student.exclusions?.[0]

  return (
    <Panel padding="sm" className="h-full">
      <SectionTitle>{t('students.showPage.groupSection')}</SectionTitle>
      {exclusion ? (
        <button
          type="button"
          className="w-full rounded-xl border border-mist/80 p-3 text-left"
          onClick={() =>
            exclusion.group_id ? navigate(groupShowPath(exclusion.group_id)) : undefined
          }
        >
          <p className="text-sm text-muted">{t('students.showPage.excluded')}</p>
          <p className="mt-1 text-sm font-medium text-deep">
            {t('students.showPage.excludedDate')}:{' '}
            {formatDate(exclusion.excluded_date, i18n.language) ?? '—'}
          </p>
        </button>
      ) : !group ? (
        <EmptyState className="py-6" description={t('students.showPage.noGroup')} />
      ) : (
        <DetailList
          className="gap-y-1.5"
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
                formatLessonTime(group.practical_start_time, group.practical_end_time) ??
                '—',
            },
          ]}
        />
      )}
    </Panel>
  )
}

export function StudentAdditionalPanel({ student }: { student: StudentItem }) {
  const { t, i18n } = useTranslation()
  const { isSuperAdmin } = useAuth()
  if (!isSuperAdmin) return null

  return (
    <Panel padding="sm" className="xl:col-span-12">
      <SectionTitle>{t('students.showPage.additional')}</SectionTitle>
      <DetailList
        items={[
          {
            label: t('students.showPage.created'),
            value:
              [formatDateTime(student.created_at, i18n.language), student.created_by?.name]
                .filter(Boolean)
                .join(' ') || '—',
          },
          {
            label: t('students.showPage.updated'),
            value:
              [formatDateTime(student.updated_at, i18n.language), student.updated_by?.name]
                .filter(Boolean)
                .join(' ') || '—',
          },
        ]}
      />
    </Panel>
  )
}

export function StudentGroupStaffSection({ studentId }: { studentId: number }) {
  const { t } = useTranslation()
  const { data: details, isLoading } = useGroupDetailsQuery(studentId)
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null)
  const teachers = details?.teachers ?? []
  const cars = details?.cars ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Panel padding="sm">
          <Skeleton className="mb-2 h-4 w-40" />
          <SkeletonLines lines={4} />
        </Panel>
        <Panel padding="sm">
          <Skeleton className="mb-2 h-4 w-40" />
          <SkeletonLines lines={4} />
        </Panel>
      </div>
    )
  }

  if (!teachers.length && !cars.length) return null

  return (
    <div className="flex flex-col gap-2">
      {teachers.length ? (
        <Panel padding="none" className="min-w-0 p-4">
          <SectionTitle className="mb-1">{t('groupDetails.teachersTitle')}</SectionTitle>
          <div className="max-h-22 overflow-y-auto">
          <Table
            storageKey="student-show-teachers"
            bordered={false}
            columnToggle={false}
            fill={false}
          >
            <THead>
              <TR>
                <TH className="w-10 !px-2 !py-1 text-center">№</TH>
                <TH className="!px-2 !py-1">{t('groupDetails.fullName')}</TH>
                <TH className="!px-2 !py-1">{t('groupDetails.specialization')}</TH>
              </TR>
            </THead>
            <TBody>
              {teachers.map((teacher, index) => (
                <TR key={teacher.id ?? index}>
                  <TD className="!px-2 !py-1 text-center">{index + 1}</TD>
                  <TD className="!px-2 !py-1 font-medium text-deep">{teacher.full_name || '—'}</TD>
                  <TD className="!px-2 !py-1">
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
          </div>
        </Panel>
      ) : null}

      {cars.length ? (
        <Panel padding="none" className="min-w-0 p-4">
          <SectionTitle className="mb-1">{t('groupDetails.carsTitle')}</SectionTitle>
          <div className="max-h-24 overflow-y-auto">
          <Table
            storageKey="student-show-cars"
            bordered={false}
            columnToggle={false}
            fill={false}
          >
            <THead>
              <TR>
                <TH className="w-10 !px-2 !py-1 text-center">№</TH>
                <TH className="w-14 !px-2 !py-1">{t('groupDetails.photo')}</TH>
                <TH className="!px-2 !py-1">{t('groupDetails.carName')}</TH>
                <TH className="!px-2 !py-1">{t('groupDetails.carNumber')}</TH>
              </TR>
            </THead>
            <TBody>
              {cars.map((car, index) => {
                const src = resolveFileUrl(car.photo, PATH_PREFIX_FILE)
                const title = car.name || t('groupDetails.carName')
                return (
                  <TR key={car.id ?? index}>
                    <TD className="!px-2 !py-1 text-center">{index + 1}</TD>
                    <TD className="!px-2 !py-1">
                      <button
                        type="button"
                        disabled={!src}
                        aria-label={src ? title : undefined}
                        onClick={() => {
                          if (src) setPreview({ src, title })
                        }}
                        className={
                          src
                            ? 'block rounded-md outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-signal/40'
                            : 'cursor-default'
                        }
                      >
                        <SafeImage
                          src={src}
                          alt={title}
                          size="sm"
                          icon={Car}
                          className="size-6 rounded-md ring-1 ring-mist/70"
                        />
                      </button>
                    </TD>
                    <TD className="!px-2 !py-1 font-medium text-deep">{car.name || '—'}</TD>
                    <TD className="!px-2 !py-1">
                      {car.number ? <Badge tone="teal">{car.number}</Badge> : '—'}
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
          </div>
        </Panel>
      ) : null}

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title}
        sizeClassName="max-w-2xl"
        bodyClassName="p-3 sm:p-4"
      >
        {preview ? (
          <SafeImage
            src={preview.src}
            alt={preview.title}
            size="xl"
            icon={Car}
            fit="contain"
            className="mx-auto aspect-video max-h-[min(70svh,520px)] w-full rounded-xl bg-fog"
          />
        ) : null}
      </Modal>
    </div>
  )
}
