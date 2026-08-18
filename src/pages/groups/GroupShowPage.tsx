import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  DetailList,
  EmptyState,
  ErrorMessage,
  Panel,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { groupEditPath, routes } from '@/config'
import {
  formatLessonTime,
  formatWeekDays,
  useDeleteGroupMutation,
  useGroupShowQuery,
  useGroupShowStudentsQuery,
} from '@/features/groups'
import { asFio, asText } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'

export function GroupShowPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, isError } = useGroupShowQuery(id)
  const studentsQuery = useGroupShowStudentsQuery(id)
  const deleteMutation = useDeleteGroupMutation()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const name = data?.name_uz || data?.name
  const students = studentsQuery.data?.data ?? []

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

  return (
    <>
      <Header
        title={t('groupsPage.show')}
        description={typeof name === 'string' ? name : asText(name)}
        actions={
          <div className="flex gap-2">
            {id ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(groupEditPath(id))}
              >
                {t('common.edit')}
              </Button>
            ) : null}
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              {t('common.delete')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(routes.groups)}>
              {t('common.back')}
            </Button>
          </div>
        }
      />
      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        ) : isError || !data ? (
          <ErrorMessage />
        ) : (
          <>
            <Panel padding="md">
              <DetailList
                items={[
                  {
                    label: t('groupsPage.colName'),
                    value: typeof data.name === 'string' ? data.name : data.name_uz,
                  },
                  {
                    label: t('groupsPage.colEduType'),
                    value: data.edu_type?.short_name ?? data.edu_type?.character_name,
                  },
                  {
                    label: t('groupsPage.colPrice'),
                    value: data.education_price,
                  },
                  {
                    label: t('groupsPage.colStart'),
                    value: formatDate(data.edu_starting_date, i18n.language),
                  },
                  {
                    label: t('groupsPage.colEnd'),
                    value: formatDate(data.edu_ending_date, i18n.language),
                  },
                  {
                    label: t('groupsPage.colTime'),
                    value: formatLessonTime(data.start_time, data.end_time),
                  },
                  {
                    label: t('groupsPage.colDays'),
                    value: formatWeekDays(data.week_days),
                  },
                  {
                    label: t('groupsPage.colStudents'),
                    value: data.grouped_students_count,
                  },
                  {
                    label: t('directorList.status'),
                    value: (
                      <Badge tone={Number(data.edu_status) === 1 ? 'teal' : 'amber'}>
                        {asText(data.edu_status)}
                      </Badge>
                    ),
                  },
                ]}
              />
            </Panel>
            <Panel padding="md">
              <p className="mb-3 font-display text-sm font-semibold text-deep">
                {t('groupsPage.colStudents')}
              </p>
              {studentsQuery.isLoading ? (
                <SkeletonLines lines={6} />
              ) : students.length === 0 ? (
                <EmptyState description={t('common.empty')} />
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH className="w-10">№</TH>
                      <TH>{t('directorList.fio')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {students.map((row, index) => (
                      <TR key={String(row.id ?? index)}>
                        <TD className="text-muted">{index + 1}</TD>
                        <TD>{asFio(row)}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </Panel>
          </>
        )}
      </main>
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
