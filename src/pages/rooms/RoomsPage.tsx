import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  ShowButton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { roomEditPath, roomShowPath, routes } from '@/config'
import { useDeleteRoomMutation, useRoomsQuery } from '@/features/rooms'
import type { RoomItem } from '@/api/rooms'

export function RoomsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch, isFetching } = useRoomsQuery()
  const deleteMutation = useDeleteRoomMutation()
  const [deleteRow, setDeleteRow] = useState<RoomItem | null>(null)
  const rows = data ?? []

  return (
    <>
      <Header
        title={t('nav.rooms')}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={isFetching && !isLoading}
              onClick={() => void refetch()}
            >
              {t('common.refresh')}
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate(routes.roomsAdd)}>
              <Plus className="size-3.5" aria-hidden />
              {t('common.add')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={6} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>{t('directorList.name')}</TH>
                <TH>{t('directorList.status')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={4}>
                    <EmptyState className="border-0 py-4" description={t('common.empty')} />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-muted">{index + 1}</TD>
                  <TD className="font-medium text-ink">{row.name_uz || row.name || '—'}</TD>
                  <TD>
                    <Badge tone={Number(row.status) === 1 ? 'teal' : 'rose'}>
                      {Number(row.status) === 1
                        ? t('dashboard.active')
                        : t('dashboard.inactive')}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      <ShowButton onClick={() => navigate(roomShowPath(row.id))} />
                      <EditButton onClick={() => navigate(roomEditPath(row.id))} />
                      <DeleteButton onClick={() => setDeleteRow(row)} />
                    </div>
                  </TD>
                </TR>
                ))
              )}
            </TBody>
          </Table>
        )}
      </PageMain>
      <ConfirmDialog
        open={Boolean(deleteRow)}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => {
          if (!deleteRow) return
          deleteMutation.mutate(deleteRow.id, {
            onSuccess: () => {
              notify.success(t('common.deleted'))
              setDeleteRow(null)
            },
            onError: (err) => notify.error(err.message || t('common.loadError')),
          })
        }}
        description={t('common.confirmDelete', {
          name: deleteRow?.name_uz || deleteRow?.name,
        })}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
