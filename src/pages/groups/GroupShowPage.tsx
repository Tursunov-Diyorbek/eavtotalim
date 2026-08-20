import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Banknote,
  BarChart3,
  GraduationCap,
  Info,
  Pencil,
  Plus,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Trash2,
  Wallet,
  Wand2,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  ErrorMessage,
  Panel,
  SkeletonLines,
  Tabs,
  notify,
} from '@/components/ui'
import {
  groupEditPath,
  groupExamResultsPath,
  groupFinalMarksPath,
  groupPaymentsPath,
  routes,
} from '@/config'
import { useAuth } from '@/features/auth'
import {
  gaiStatusOf,
  groupAttendanceTone,
  useDeleteGroupMutation,
  useFixGroupAttendanceMutation,
  useGroupFinalExamQuery,
  useGroupShowQuery,
  usePrepareGroupCertificateMutation,
  useRefreshGroupAttendanceMutation,
  useSendGroupToGaiMutation,
} from '@/features/groups'
import { asText } from '@/lib/apiPage'
import { cn } from '@/lib/cn'
import { useSmartBack } from '@/hooks'
import type { GroupItem } from '@/types/groups'
import { AddStudentsModal } from './show/AddStudentsModal'
import { GroupCarsTab } from './show/GroupCarsTab'
import { GroupIncomingStudentsTab } from './show/GroupIncomingStudentsTab'
import { GroupInfoModal } from './show/GroupInfoModal'
import { GroupJournalTab } from './show/GroupJournalTab'
import { GroupPriceModal } from './show/GroupPriceModal'
import { GroupRemovedStudentsTab } from './show/GroupRemovedStudentsTab'
import { GroupStudentsTab } from './show/GroupStudentsTab'
import { GroupTeachersTab } from './show/GroupTeachersTab'
import { GroupTimetableTab } from './show/GroupTimetableTab'

const TABS = [
  'students',
  'timetable',
  'cars',
  'teachers',
  'journal',
  'incoming',
  'removed',
] as const

type GroupShowTab = (typeof TABS)[number]

function asTab(value: string | null): GroupShowTab {
  return TABS.includes(value as GroupShowTab) ? (value as GroupShowTab) : 'students'
}

const BAR_CLASS = {
  rose: 'bg-rose',
  amber: 'bg-amber',
  teal: 'bg-teal',
} as const

/** O‘rtacha davomat va oxirgi darsga kelmaganlar — eski «Davomat» tooltipi. */
function AttendanceStat({ group }: { group: GroupItem }) {
  const { t } = useTranslation()
  const report = group.inspection_group_report
  const raw = Number(report?.average_attendance)
  const percent = Number.isFinite(raw) ? Math.floor(raw * 10) / 10 : null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-mist/70 bg-white px-2.5 py-1.5">
      <div>
        <p className="text-[11px] text-muted">{t('groupsPage.showPage.avgAttendance')}</p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-fog">
            <div
              className={cn(
                'h-full',
                percent == null ? 'w-0' : BAR_CLASS[groupAttendanceTone(percent)],
              )}
              style={{ width: `${Math.min(100, Math.max(0, percent ?? 0))}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-deep">
            {percent == null ? t('groupsPage.attendanceMissing') : `${percent}%`}
          </span>
        </div>
      </div>
      <div className="border-l border-mist/70 pl-3">
        <p className="text-[11px] text-muted">
          {t('groupsPage.showPage.lastLessonAbsent')}
        </p>
        <p className="text-xs font-semibold text-deep">
          {report?.last_lesson_absence_count ?? 0}
        </p>
      </div>
    </div>
  )
}

export function GroupShowPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.groups)
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { hasPermission, hasRole, isSuperAdmin } = useAuth()

  const { data, isLoading, isError } = useGroupShowQuery(id)
  const examQuery = useGroupFinalExamQuery(id)
  const deleteMutation = useDeleteGroupMutation()
  const refreshMutation = useRefreshGroupAttendanceMutation()
  const gaiMutation = useSendGroupToGaiMutation()
  const fixAttendanceMutation = useFixGroupAttendanceMutation()
  const certificateMutation = usePrepareGroupCertificateMutation()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)
  const [fixOpen, setFixOpen] = useState(false)
  const [certificateOpen, setCertificateOpen] = useState(false)
  const [addStudentsOpen, setAddStudentsOpen] = useState(false)

  const tab = asTab(params.get('tab'))
  const name = data?.name_uz || data?.name
  const studentsCount = Number(data?.students_count ?? data?.grouped_students_count ?? 0)

  const isTeacher = hasRole('teacher')
  const canMutate = !isTeacher
  const canEdit = canMutate && (isSuperAdmin || hasPermission('update-group'))
  const canDelete =
    (isSuperAdmin || hasPermission('delete-group')) &&
    !hasRole('superior_limit_manager') &&
    !hasRole('superior_region_limit_manager')
  const canChangePrice = canMutate && (isSuperAdmin || hasRole('director'))
  const canFixAttendance = canMutate && hasPermission('fix-attendance-group')
  const canPrepareCertificate = canMutate && hasPermission('prepare-certificate-group')
  const canAttachStudents =
    canMutate && (isSuperAdmin || hasPermission('add-student-to-group'))
  const canBypassLimit =
    isSuperAdmin || hasPermission('add-group-student-unlimited')
  const attachBlocked = !canBypassLimit && Number(data?.check_gai) === 1
  const gaiStatus = gaiStatusOf(data?.check_gai)
  const gaiBlocked = studentsCount < 8 || studentsCount > 24
  const finalExamId = examQuery.data

  const onDelete = () => {
    if (!data) return
    deleteMutation.mutate(data.id, {
      onSuccess: () => {
        notify.success(t('common.deleted'))
        navigate(routes.groups)
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const onRefreshAttendance = () => {
    if (!data) return
    refreshMutation.mutate(data.id, {
      onSuccess: () => notify.success(t('common.saved')),
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const onSendToGai = () => {
    if (!data) return
    gaiMutation.mutate(data.id, {
      onSuccess: () => notify.success(t('groupsPage.showPage.gaiSent')),
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const onFixAttendance = () => {
    if (!data) return
    setFixOpen(false)
    fixAttendanceMutation.mutate(data.id, {
      onSuccess: (res) => notify.success(res.message || t('common.saved')),
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const onPrepareCertificate = () => {
    if (!data) return
    setCertificateOpen(false)
    certificateMutation.mutate(data.id, {
      onSuccess: (res) => notify.success(res.message || t('common.saved')),
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const tabItems = [
    {
      value: 'students' as const,
      label: (
        <span className="inline-flex items-center gap-1.5">
          {t('groupsPage.showPage.tabStudents')}
          <Badge tone={studentsCount > 0 ? 'neutral' : 'rose'}>{studentsCount}</Badge>
        </span>
      ),
    },
    {
      value: 'timetable' as const,
      label: (
        <span className="inline-flex items-center gap-1.5">
          {t('groupsPage.showPage.tabTimetable')}
          {Number(data?.timetable) === 1 ? null : (
            <Badge tone="rose">{t('groupsPage.timetableNo')}</Badge>
          )}
        </span>
      ),
    },
    { value: 'cars' as const, label: t('groupsPage.showPage.tabCars') },
    { value: 'teachers' as const, label: t('groupsPage.showPage.tabTeachers') },
    { value: 'journal' as const, label: t('groupsPage.showPage.tabJournal') },
    { value: 'incoming' as const, label: t('groupsPage.showPage.tabIncoming') },
    { value: 'removed' as const, label: t('groupsPage.showPage.tabRemoved') },
  ]

  return (
    <>
      <Header
        title={t('groupsPage.show')}
        description={typeof name === 'string' ? name : asText(name)}
        actions={
          data ? (
            <div className="flex flex-wrap items-center gap-2">
              <AttendanceStat group={data} />
              <Button
                variant="outline"
                size="sm"
                loading={refreshMutation.isPending}
                onClick={onRefreshAttendance}
              >
                <RefreshCw className="size-3.5" aria-hidden />
                {t('groupsPage.refreshAttendance')}
              </Button>
              <div className="flex items-center gap-1.5 rounded-lg border border-mist/70 bg-white px-2.5 py-1.5">
                <ShieldCheck className="size-3.5 text-signal" aria-hidden />
                <span className="text-xs text-muted">
                  {t('groupsPage.showPage.gai')}:
                </span>
                {gaiStatus === 'notSent' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={gaiBlocked}
                    loading={gaiMutation.isPending}
                    title={
                      gaiBlocked ? t('groupsPage.showPage.gaiStudentsLimit') : undefined
                    }
                    onClick={onSendToGai}
                  >
                    {t('groupsPage.showPage.gaiSend')}
                  </Button>
                ) : (
                  <Badge
                    tone={
                      gaiStatus === 'approved'
                        ? 'teal'
                        : gaiStatus === 'rejected'
                          ? 'rose'
                          : 'amber'
                    }
                  >
                    {t(
                      gaiStatus === 'approved'
                        ? 'groupsPage.showPage.gaiApproved'
                        : gaiStatus === 'rejected'
                          ? 'groupsPage.showPage.gaiRejected'
                          : 'groupsPage.showPage.gaiWaiting',
                    )}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={goBack}>
                {t('common.back')}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={goBack}>
              {t('common.back')}
            </Button>
          )
        }
      />
      <PageMain fill>
        {isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={10} />
          </Panel>
        ) : isError || !data || !id ? (
          <ErrorMessage />
        ) : (
          <>
            <div className="flex shrink-0 flex-wrap gap-2">
              {canAttachStudents ? (
                <Button
                  variant="soft"
                  size="sm"
                  disabled={attachBlocked}
                  title={
                    attachBlocked
                      ? t('groupsPage.showPage.attachStudentsDisabled')
                      : undefined
                  }
                  onClick={() => setAddStudentsOpen(true)}
                >
                  <Plus className="size-3.5" aria-hidden />
                  {t('groupsPage.showPage.attachStudents')}
                </Button>
              ) : null}
              <Button variant="soft" size="sm" onClick={() => setInfoOpen(true)}>
                <Info className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.fullInfo')}
              </Button>
              {canMutate ? (
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => navigate(groupPaymentsPath(id))}
                >
                  <Wallet className="size-3.5" aria-hidden />
                  {t('groupsPage.showPage.paymentHistory')}
                </Button>
              ) : null}
              {canEdit ? (
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => navigate(groupEditPath(id))}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  {t('groupsPage.edit')}
                </Button>
              ) : null}
              {canChangePrice ? (
                <Button variant="soft" size="sm" onClick={() => setPriceOpen(true)}>
                  <Banknote className="size-3.5" aria-hidden />
                  {t('groupsPage.showPage.changePrice')}
                </Button>
              ) : null}
              {canMutate ? (
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => navigate(groupFinalMarksPath(id))}
                >
                  <ScrollText className="size-3.5" aria-hidden />
                  {t('groupsPage.showPage.certificates')}
                </Button>
              ) : null}
              {canMutate && finalExamId ? (
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => navigate(groupExamResultsPath(finalExamId))}
                >
                  <BarChart3 className="size-3.5" aria-hidden />
                  {t('groupsPage.showPage.finalExamResults')}
                </Button>
              ) : null}
              {canFixAttendance ? (
                <Button
                  variant="soft"
                  size="sm"
                  loading={fixAttendanceMutation.isPending}
                  onClick={() => setFixOpen(true)}
                >
                  <Wand2 className="size-3.5" aria-hidden />
                  {t('groupsPage.showPage.fixAttendance')}
                </Button>
              ) : null}
              {canPrepareCertificate ? (
                <Button
                  variant="soft"
                  size="sm"
                  loading={certificateMutation.isPending}
                  onClick={() => setCertificateOpen(true)}
                >
                  <GraduationCap className="size-3.5" aria-hidden />
                  {t('groupsPage.showPage.prepareCertificate')}
                </Button>
              ) : null}
              {canDelete && studentsCount < 1 ? (
                <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
                  <Trash2 className="size-3.5" aria-hidden />
                  {t('common.delete')}
                </Button>
              ) : null}
            </div>

            <Tabs
              items={tabItems}
              value={tab}
              onChange={(next) => {
                const nextParams = new URLSearchParams(params)
                nextParams.set('tab', next)
                setParams(nextParams, { replace: true })
              }}
              className="shrink-0"
            />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {tab === 'students' ? (
                <GroupStudentsTab groupId={id} group={data} />
              ) : tab === 'timetable' ? (
                <GroupTimetableTab
                  groupId={id}
                  group={data}
                  canMutate={canMutate}
                />
              ) : tab === 'cars' ? (
                <GroupCarsTab groupId={id} group={data} canMutate={canMutate} />
              ) : tab === 'teachers' ? (
                <GroupTeachersTab groupId={id} canMutate={canMutate} />
              ) : tab === 'journal' ? (
                <GroupJournalTab groupId={id} canMutate={canMutate} />
              ) : tab === 'incoming' ? (
                <GroupIncomingStudentsTab groupId={id} />
              ) : (
                <GroupRemovedStudentsTab groupId={id} />
              )}
            </div>

            <AddStudentsModal
              open={addStudentsOpen}
              onClose={() => setAddStudentsOpen(false)}
              groupId={id}
              currentCount={studentsCount}
              canBypassLimit={canBypassLimit}
            />

            <GroupInfoModal
              open={infoOpen}
              onClose={() => setInfoOpen(false)}
              group={data}
              canMutate={canMutate}
            />
            <GroupPriceModal
              open={priceOpen}
              onClose={() => setPriceOpen(false)}
              groupId={id}
              price={data.education_price}
            />
            <ConfirmDialog
              open={fixOpen}
              onClose={() => setFixOpen(false)}
              onConfirm={onFixAttendance}
              title={t('groupsPage.showPage.fixAttendance')}
              description={t('groupsPage.showPage.fixAttendanceConfirm')}
              confirmLabel={t('groupsPage.showPage.fixAttendance')}
              loading={fixAttendanceMutation.isPending}
            />
            <ConfirmDialog
              open={certificateOpen}
              onClose={() => setCertificateOpen(false)}
              onConfirm={onPrepareCertificate}
              title={t('groupsPage.showPage.prepareCertificate')}
              description={t('groupsPage.showPage.prepareCertificateConfirm')}
              confirmLabel={t('groupsPage.showPage.prepareCertificate')}
              loading={certificateMutation.isPending}
            />
          </>
        )}
      </PageMain>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        description={t('common.confirmDelete', { name: asText(name) })}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
