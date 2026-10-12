import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileSignature, UserCheck, UserRoundX } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  SafeImage,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui'
import { PAGE_ACCESS, schoolReportGroupsPath, studentPath } from '@/config'
import { useAuth } from '@/features/auth'
import { useSchoolReportMonitoringQuery } from '@/features/school-report'
import { useSmartBack } from '@/hooks'
import type { SchoolReportLesson, SchoolReportMark } from '@/types/school-report'

function clock(value: string) {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/)
  if (!match) return value || '—'
  const time = match[4] ? ` ${match[4]}:${match[5]}` : ''
  return `${match[3]}.${match[2]}.${match[1]}${time}`
}

function shortDay(value: string) {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return value
  return `${match[3]}.${match[2]}.${match[1].slice(2)}`
}

function isDue(value: string) {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return false
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const now = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  return `${match[1]}-${match[2]}-${match[3]}` <= now
}

export function SchoolReportMonitoringPage() {
  const { id = '', org_id: orgId = '', group_id: groupId = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canStudent = hasPermission(PAGE_ACCESS.students)
  const goBack = useSmartBack(schoolReportGroupsPath(id, orgId))
  const query = useSchoolReportMonitoringQuery(groupId)
  const lessons = query.data?.lessons ?? []
  const students = query.data?.students ?? []
  const [picked, setPicked] = useState<{
    lesson: SchoolReportLesson
    name: string
    mark: SchoolReportMark
  } | null>(null)

  return (
    <>
      <Header
        title={<span className="uppercase">{t('schoolReportPage.studentReport')}</span>}
        onBack={goBack}
      />
      <PageMain fill>
        {query.isError && !query.data ? (
          <ErrorMessage />
        ) : query.isLoading && !query.data ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="school-report-monitoring" fill>
            <THead>
              <HeaderTR>
                <TH column="index" className="sticky left-0 z-20 w-12 min-w-12 bg-fog text-center">
                  №
                </TH>
                <TH column="name" className="sticky left-12 z-20 min-w-56 bg-fog">
                  {t('schoolReportPage.fish')}
                </TH>
                {lessons.map((lesson) => (
                  <TH
                    key={lesson.id}
                    column={`lesson-${lesson.id}`}
                    columnLabel={shortDay(lesson.start)}
                    className="w-16 min-w-16 text-center"
                  >
                    <span className="block rounded bg-signal-soft px-1 text-[11px] text-signal">
                      {shortDay(lesson.start)}
                    </span>
                    <span className="mt-1 block rounded bg-rose-soft px-1 text-[11px] text-rose">
                      {shortDay(lesson.end)}
                    </span>
                  </TH>
                ))}
              </HeaderTR>
            </THead>
            <TBody>
              {students.length === 0 ? (
                <EmptyTR colSpan={2 + lessons.length} />
              ) : (
                students.map((student, index) => (
                  <TR key={student.id}>
                    <TD
                      column="index"
                      className="sticky left-0 z-10 w-12 min-w-12 bg-white text-center text-muted"
                    >
                      {index + 1}
                    </TD>
                    <TD column="name" className="sticky left-12 z-10 min-w-56 bg-white whitespace-nowrap">
                      {canStudent ? (
                        <Button
                          variant="link"
                          size="inline"
                          className="!h-auto !justify-start !px-0 !font-medium"
                          onClick={() => navigate(studentPath(student.id))}
                        >
                          {student.name}
                        </Button>
                      ) : (
                        student.name
                      )}
                    </TD>
                    {lessons.map((lesson) => (
                      <TD
                        key={lesson.id}
                        column={`lesson-${lesson.id}`}
                        className="text-center"
                      >
                        <MarkCell
                          lesson={lesson}
                          mark={student.marks[lesson.id]}
                          onOpen={(mark) => setPicked({ lesson, name: student.name, mark })}
                        />
                      </TD>
                    ))}
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )}
      </PageMain>
      <Modal
        open={picked != null}
        onClose={() => setPicked(null)}
        title={picked?.name}
        sizeClassName="max-w-md"
        hideHeader
      >
        {picked ? (
          <div className="space-y-3">
            <div className="text-center">
              <SafeImage
                src={picked.mark.image}
                alt=""
                size="xl"
                className="mx-auto size-16 rounded-full border-4 border-teal-soft"
              />
              <p className="mt-2 text-sm font-semibold text-deep">{picked.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-teal/30 bg-teal-soft px-3 py-2">
                <p className="text-[12px] font-semibold text-deep">{t('schoolReportPage.lessonStart')}</p>
                <p className="text-[12px] text-ink">{clock(picked.lesson.start)}</p>
              </div>
              <div className="rounded-lg border border-rose/30 bg-rose-soft px-3 py-2">
                <p className="text-[12px] font-semibold text-deep">{t('schoolReportPage.lessonEnd')}</p>
                <p className="text-[12px] text-ink">{clock(picked.lesson.end)}</p>
              </div>
            </div>
            <div>
              <p className="text-[12px] text-muted">{t('schoolReportPage.average')}</p>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{ width: `${Math.min(100, Math.max(0, picked.lesson.average))}%` }}
                />
              </div>
            </div>
            <div
              className={
                picked.mark.type === 2
                  ? 'flex items-center gap-3 rounded-lg border border-rose/30 bg-rose-soft px-3 py-2'
                  : picked.mark.type === 3
                    ? 'flex items-center gap-3 rounded-lg border border-amber/40 bg-amber-soft px-3 py-2'
                    : 'flex items-center gap-3 rounded-lg border border-teal/30 bg-teal-soft px-3 py-2'
              }
            >
              {picked.mark.type === 2 ? (
                <UserRoundX className="size-8 text-rose" aria-hidden />
              ) : (
                <UserCheck className="size-8 text-teal" aria-hidden />
              )}
              <div>
                <p className="text-[12px] text-muted">{t('schoolReportPage.monitoring')}</p>
                <p className="text-sm font-semibold text-deep">{markLabel(picked.mark.type, t)}</p>
              </div>
            </div>
            <Button variant="danger" className="w-full" onClick={() => setPicked(null)}>
              {t('common.close')}
            </Button>
          </div>
        ) : null}
      </Modal>
    </>
  )
}

function markLabel(type: number, t: (key: string) => string) {
  if (type === 0) return t('schoolReportPage.present')
  if (type === 1) return t('schoolReportPage.graded')
  if (type === 2) return t('schoolReportPage.missed')
  if (type === 3) return t('schoolReportPage.excused')
  return '—'
}

function MarkCell({
  lesson,
  mark,
  onOpen,
}: {
  lesson: SchoolReportLesson
  mark?: SchoolReportMark
  onOpen: (mark: SchoolReportMark) => void
}) {
  if (!mark) return '—'
  const open = () => onOpen(mark)
  if (mark.type === 2) {
    return (
      <Button variant="ghost" size="icon-sm" onClick={open} aria-label={mark.value || '—'}>
        <UserRoundX className="size-4 text-rose" aria-hidden />
      </Button>
    )
  }
  if (mark.type === 3) {
    return (
      <Button variant="ghost" size="icon-sm" onClick={open} aria-label="*">
        <FileSignature className="size-4 text-amber" aria-hidden />
      </Button>
    )
  }
  if (mark.type === 1) {
    return (
      <Button variant="ghost" size="icon-sm" onClick={open}>
        {mark.value || '—'}
      </Button>
    )
  }
  if (mark.type === 0 && mark.value === '' && isDue(lesson.start)) {
    return (
      <Button variant="ghost" size="icon-sm" onClick={open} aria-label="+">
        <UserCheck className="size-4 text-teal" aria-hidden />
      </Button>
    )
  }
  return '—'
}
