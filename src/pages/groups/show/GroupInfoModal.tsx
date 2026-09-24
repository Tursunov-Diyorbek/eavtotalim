import { useTranslation } from 'react-i18next'
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarX,
  PencilLine,
  UserPlus,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge, Button, Modal, notify } from '@/components/ui'
import { formatWeekDays, useEnsureStudentRoleMutation } from '@/features/groups'
import { asLangName, asText } from '@/lib/apiPage'
import { formatDate, formatDateTime } from '@/lib/format'
import type { GroupItem } from '@/types/groups'

type GroupInfoModalProps = {
  open: boolean
  onClose: () => void
  group: GroupItem
  canMutate: boolean
}

type TimelineRow = {
  icon: ReactNode
  label: string
  value: ReactNode
  note?: ReactNode
}

/** Eski Drawer «Guruh haqida to'liq ma'lumot» — timeline + rollarni berish. */
export function GroupInfoModal({
  open,
  onClose,
  group,
  canMutate,
}: GroupInfoModalProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const roleMutation = useEnsureStudentRoleMutation()

  const rows: TimelineRow[] = [
    {
      icon: <PencilLine className="size-3.5" aria-hidden />,
      label: t('groupsPage.showPage.createdAt'),
      value: formatDateTime(group.created_at, lang) ?? '—',
      note: `${t('groupsPage.showPage.createdBy')}: ${asText(group.created_by?.name)}`,
    },
    {
      icon: <CalendarCheck className="size-3.5" aria-hidden />,
      label: t('groupsPage.showPage.startDate'),
      value: formatDate(group.edu_starting_date, lang) ?? '—',
    },
    {
      icon: <CalendarDays className="size-3.5" aria-hidden />,
      label: t('groupsPage.showPage.theoryDays'),
      value: formatWeekDays(group.week_days),
    },
    {
      icon: <CalendarClock className="size-3.5" aria-hidden />,
      label: t('groupsPage.showPage.practicalDays'),
      value: formatWeekDays(group.practical_week_days),
    },
    {
      icon: <CalendarX className="size-3.5" aria-hidden />,
      label: t('groupsPage.showPage.endDate'),
      value: formatDate(group.edu_ending_date, lang) ?? '—',
    },
  ]

  const onAssignRoles = () => {
    roleMutation.mutate(String(group.id), {
      onSuccess: (res) => {
        const info = res.data?.data
        notify.success(
          res.message ||
            t('groupsPage.showPage.rolesAssigned', {
              processed: info?.processed_students ?? 0,
              assigned: info?.assigned_roles ?? 0,
            }),
        )
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('groupsPage.showPage.fullInfo')}
      sizeClassName="max-w-xl"
    >
      <div className="rounded-xl border border-mist/70 bg-fog/40 px-3 py-2.5">
        <p className="font-display text-sm font-semibold text-deep">
          {asLangName(group.name_uz ?? group.name, i18n.language)}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>
            {t('groupsPage.colEduType')}:{' '}
            <span className="font-semibold text-deep">
              {asText(group.edu_type?.short_name ?? group.edu_type?.character_name)}
            </span>
          </span>
          <span>
            {t('groupsPage.showPage.eduLang')}:{' '}
            <span className="font-semibold text-deep">
              {asText(group.edu_lang?.name)}
            </span>
          </span>
          <span>
            {t('groupsPage.colStudents')}:{' '}
            <span className="font-semibold text-deep">
              {asText(group.students_count ?? group.grouped_students_count)}
            </span>
          </span>
        </div>
      </div>

      <ol className="mt-3 space-y-0">
        {rows.map((row, index) => (
          <li key={row.label} className="relative flex gap-3 pb-4 last:pb-0">
            {index < rows.length - 1 ? (
              <span
                className="absolute left-3 top-7 h-[calc(100%-1.25rem)] w-px bg-mist"
                aria-hidden
              />
            ) : null}
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal">
              {row.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted">{row.label}</p>
              <p className="font-display text-sm font-semibold text-deep">{row.value}</p>
              {row.note ? <p className="text-xs text-muted">{row.note}</p> : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex items-start gap-2 border-t border-mist/70 pt-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-signal-soft text-signal">
          <PencilLine className="size-3.5" aria-hidden />
        </span>
        <div>
          <p className="text-xs text-muted">
            {t('groupsPage.showPage.lastChangeMade')}:{' '}
            <span className="font-semibold text-signal">
              {formatDateTime(group.updated_at, lang) ?? t('groupsPage.showPage.notSpecified')}
            </span>
          </p>
          <p className="text-xs text-muted">
            {t('groupsPage.showPage.updatedBy')}:{' '}
            <span className="font-semibold text-signal">
              {group.updated_by?.name || t('groupsPage.showPage.notSpecified')}
            </span>
          </p>
        </div>
      </div>

      {canMutate ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          loading={roleMutation.isPending}
          onClick={onAssignRoles}
        >
          <UserPlus className="size-3.5" aria-hidden />
          {t('groupsPage.showPage.assignStudentRoles')}
        </Button>
      ) : null}

      {!Number(group.students_count ?? group.grouped_students_count) ? (
        <Badge tone="rose" className="mt-2 w-full justify-center py-1.5 text-xs">
          {t('common.empty')}
        </Badge>
      ) : null}
    </Modal>
  )
}
