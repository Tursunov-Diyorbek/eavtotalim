import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil } from 'lucide-react'
import {
  Button,
  DateInput,
  EmptyState,
  Modal,
  Notification,
  Select,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Textarea,
  notify,
} from '@/components/ui'
import { useCreateAbsenceReasonMutation } from '@/features/absence-reason'
import { useGroupShowStudentsQuery, useGroupsQuery } from '@/features/groups'
import { asFio } from '@/lib/apiPage'
import type { GroupEduStatusTab, GroupStudentRow } from '@/types/groups'

type Props = {
  open: boolean
  onClose: () => void
}

const todayIso = () => new Date().toISOString().slice(0, 10)

export function AbsenceReasonCreateModal({ open, onClose }: Props) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const createMutation = useCreateAbsenceReasonMutation()
  const [eduStatus, setEduStatus] = useState<GroupEduStatusTab>('all')
  const [groupId, setGroupId] = useState('')
  const [student, setStudent] = useState<GroupStudentRow | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const groupsQuery = useGroupsQuery({
    page: 1,
    showCount: 3000,
    eduStatus,
  })
  const studentsQuery = useGroupShowStudentsQuery(
    groupId || undefined,
    open && Boolean(groupId),
    3000,
  )
  const groups = groupsQuery.data?.data ?? []
  const students = studentsQuery.data?.data ?? []

  useEffect(() => {
    if (open) return
    setEduStatus('all')
    setGroupId('')
    setStudent(null)
    setFromDate('')
    setToDate('')
    setReason('')
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }, [open])

  const handleClose = () => {
    if (createMutation.isPending) return
    onClose()
  }

  const submit = async () => {
    if (!student) return
    if (!fromDate || !toDate || !reason.trim() || !file) {
      notify.error(t('absenceReasonPage.fillRequired'))
      return
    }
    const data = new FormData()
    data.append('student_id', String(student.id))
    data.append('from_date', fromDate)
    data.append('to_date', toDate)
    data.append('reason', reason.trim())
    data.append('document', file)
    try {
      await createMutation.mutateAsync(data)
      notify.success(t('common.saved'))
      onClose()
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t('common.loadError'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        student
          ? t('absenceReasonPage.enterFor', { name: asFio(student) })
          : t('absenceReasonPage.enterTitle')
      }
      sizeClassName="max-w-3xl"
      dismissible={!createMutation.isPending}
    >
      {student ? (
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="px-0"
            onClick={() => setStudent(null)}
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t('common.back')}
          </Button>
          <Notification tone="warning">{t('absenceReasonPage.hint')}</Notification>
          <div className="grid gap-3 sm:grid-cols-2">
            <DateInput
              label={t('missedClasses.fromDate')}
              value={fromDate}
              max={todayIso()}
              required
              onChange={(e) => setFromDate(e.target.value)}
            />
            <DateInput
              label={t('missedClasses.toDate')}
              value={toDate}
              max={todayIso()}
              required
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <Textarea
            label={t('directorList.reason')}
            value={reason}
            required
            rows={4}
            onChange={(e) => setReason(e.target.value)}
          />
          <div>
            <p className="mb-1 text-[12px] font-medium text-deep">
              {t('absenceReasonPage.document')}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="block w-full text-[12px] text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-signal-soft file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-signal"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              loading={createMutation.isPending}
              onClick={() => void submit()}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label={t('absenceReasonPage.groupStatus')}
              value={eduStatus}
              onChange={(e) => {
                setEduStatus((e.target.value || 'all') as GroupEduStatusTab)
                setGroupId('')
              }}
              options={[
                { value: 'all', label: t('common.all') },
                { value: '0', label: t('groupsPage.tabNew') },
                { value: '1', label: t('groupsPage.tabActive') },
                { value: '2', label: t('groupsPage.tabFinished') },
              ]}
            />
            <Select
              label={t('directorList.group')}
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              options={[
                { value: '', label: t('absenceReasonPage.pickGroup') },
                ...groups.map((group) => ({
                  value: String(group.id),
                  label: group.name || group.name_uz || String(group.id),
                })),
              ]}
            />
          </div>
          <Notification tone="warning">{t('absenceReasonPage.hint')}</Notification>
          {!groupId ? (
            <EmptyState
              className="border-0 py-6"
              description={t('absenceReasonPage.pickGroup')}
            />
          ) : studentsQuery.isLoading ? (
            <SkeletonLines lines={6} />
          ) : students.length === 0 ? (
            <EmptyState
              className="border-0 py-6"
              description={t('common.empty')}
            />
          ) : (
            <div className="max-h-[min(24rem,50vh)] overflow-y-auto">
              <Table storageKey="absence-reason-pick-student" columnToggle={false}>
                <THead>
                  <TR>
                    <TH>{t('directorList.fio')}</TH>
                    <TH className="w-36">{t('absenceReasonPage.writeReason')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {students.map((row) => (
                    <TR key={row.id}>
                      <TD>{asFio(row)}</TD>
                      <TD className="text-center">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={t('absenceReasonPage.writeReason')}
                          onClick={() => setStudent(row)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
