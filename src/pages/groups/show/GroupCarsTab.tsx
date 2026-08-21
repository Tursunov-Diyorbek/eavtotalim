import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, Plus } from 'lucide-react'
import {
  Badge,
  Button,
  ConfirmDialog,
  DeleteButton,
  EmptyState,
  ErrorMessage,
  ExportButton,
  Panel,
  ShowButton,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { carShowPath } from '@/config'
import { useGroupCarsQuery, useRemoveCarFromGroupMutation } from '@/features/groups'
import { downloadXls } from '@/lib/downloadXls'
import { asText } from '@/lib/apiPage'
import { fullNameOf } from '@/lib/format'
import type { GroupCarRow, GroupItem } from '@/types/groups'
import { AddCarsModal } from './AddCarsModal'
import { ReplaceCarModal } from './ReplaceCarModal'
import { TabToolbar } from './TabToolbar'

type GroupCarsTabProps = {
  groupId: string
  group: GroupItem
  canMutate: boolean
}

/** Eski `GroupTables/GroupCars` — avtomobillar, biriktirish, almashtirish, o‘chirish, EXPORT. */
export function GroupCarsTab({ groupId, group, canMutate }: GroupCarsTabProps) {
  const { t } = useTranslation()
  const query = useGroupCarsQuery(groupId)
  const removeMutation = useRemoveCarFromGroupMutation()
  const [addOpen, setAddOpen] = useState(false)
  const [replaceCar, setReplaceCar] = useState<GroupCarRow | null>(null)
  const [removeCar, setRemoveCar] = useState<GroupCarRow | null>(null)

  const rows = query.data ?? []
  const exportRows = useMemo(
    () =>
      rows.map((row, index) => [
        index + 1,
        asText(row.name),
        asText(row.number),
        asText(row.car_model?.name),
        fullNameOf(row.teacher) ?? '',
      ]),
    [rows],
  )

  const onRemove = () => {
    if (!removeCar) return
    removeMutation.mutate(
      { groupId, carId: removeCar.id },
      {
        onSuccess: () => {
          notify.success(t('common.deleted'))
          setRemoveCar(null)
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  if (query.isLoading) {
    return (
      <Panel padding="md">
        <SkeletonLines lines={6} />
      </Panel>
    )
  }
  if (query.isError) return <ErrorMessage />

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <TabToolbar
        title={t('groupsPage.showPage.carsTitle')}
        actions={
          <>
            <ExportButton
              disabled={!exportRows.length}
              onClick={() =>
                downloadXls(
                  'avtomobillar',
                  [
                    '№',
                    t('groupsPage.showPage.carBrand'),
                    t('groupsPage.showPage.carNumber'),
                    t('groupsPage.showPage.carType'),
                    t('groupsPage.showPage.carTeacher'),
                  ],
                  exportRows,
                )
              }
            />
            {canMutate ? (
              <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.attachCar')}
              </Button>
            ) : null}
          </>
        }
      />
      <Table storageKey="group-show:cars" className="min-w-200">
        <THead>
          <TR>
            <TH className="w-12 text-center">№</TH>
            <TH>{t('groupsPage.showPage.carBrand')}</TH>
            <TH>{t('groupsPage.showPage.carNumber')}</TH>
            <TH>{t('groupsPage.showPage.carType')}</TH>
            <TH>{t('groupsPage.showPage.carTeacher')}</TH>
            <TH className="w-32 text-center">{t('common.actions')}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <TR>
              <TD className="py-6 text-center" colSpan={6}>
                <EmptyState
                  className="border-0 py-4 shadow-none"
                  description={t('common.empty')}
                />
              </TD>
            </TR>
          ) : (
            rows.map((row, index) => {
              const teacher = fullNameOf(row.teacher)
              return (
                <TR key={row.id ?? index}>
                  <TD className="text-center text-muted">{index + 1}</TD>
                  <TD>
                    <Link
                      to={carShowPath(row.id)}
                      className="font-semibold text-signal hover:underline"
                    >
                      {asText(row.name)}
                    </Link>
                  </TD>
                  <TD>{asText(row.number)}</TD>
                  <TD>{asText(row.car_model?.name)}</TD>
                  <TD>
                    {teacher ?? (
                      <Badge tone="rose">
                        {t('groupsPage.showPage.teacherNotAttached')}
                      </Badge>
                    )}
                  </TD>
                  <TD>
                    <div className="flex justify-center gap-1">
                      <Link to={carShowPath(row.id)}>
                        <ShowButton />
                      </Link>
                      {canMutate ? (
                        <>
                          <Button
                            variant="soft"
                            size="icon-sm"
                            aria-label={t('groupsPage.showPage.replaceCar')}
                            onClick={() => setReplaceCar(row)}
                          >
                            <ArrowLeftRight className="size-3.5" />
                          </Button>
                          <DeleteButton onClick={() => setRemoveCar(row)} />
                        </>
                      ) : null}
                    </div>
                  </TD>
                </TR>
              )
            })
          )}
        </TBody>
      </Table>
      <AddCarsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        groupId={groupId}
        group={group}
      />
      <ReplaceCarModal
        open={Boolean(replaceCar)}
        onClose={() => setReplaceCar(null)}
        groupId={groupId}
        group={group}
        oldCar={replaceCar}
      />
      <ConfirmDialog
        open={Boolean(removeCar)}
        onClose={() => setRemoveCar(null)}
        onConfirm={onRemove}
        title={t('groupsPage.showPage.removeCar')}
        loading={removeMutation.isPending}
      />
    </div>
  )
}
