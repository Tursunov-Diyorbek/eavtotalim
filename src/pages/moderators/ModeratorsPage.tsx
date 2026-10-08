import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  ConfirmDialog,
  DeleteButton,
  DetailList,
  EditButton,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Pagination,
  Select,
  ShowButton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { moderatorEditPath, routes } from '@/config'
import { useDeleteModeratorMutation, useModeratorsQuery } from '@/features/moderators'
import { usePageState } from '@/hooks'
import { formatDate, formatPhoneLocal, fullNameOf, parsePhoneDigits } from '@/lib'
import type { ModeratorItem } from '@/types/moderators'

function phoneOf(value?: string | null) {
  if (!value || value === 'null') return ''
  const digits = parsePhoneDigits(value)
  return digits ? `+998 ${formatPhoneLocal(digits)}` : value
}

function passportOf(row: ModeratorItem) {
  return [row.passport_seria, row.passport_number].filter(Boolean).join(' ')
}

export function ModeratorsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [status, setStatus] = usePageState('status', 'all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [view, setView] = useState<ModeratorItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const remove = useDeleteModeratorMutation()

  const query = useModeratorsQuery({
    page,
    showCount: pageSize,
    status,
  })

  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const onDelete = () => {
    if (deleteId == null) return
    remove.mutate(deleteId, {
      onSuccess: () => {
        notify.success(t('common.deleted'))
        setDeleteId(null)
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  return (
    <>
      <Header
        title={t('moderatorsPage.title')}
        actions={
          <AddButton onClick={() => navigate(routes.moderatorCreate)}>
            {t('common.add')}
          </AddButton>
        }
      />
      <PageMain fill>
        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table storageKey="moderators">
              <THead>
                <HeaderTR>
                  <TH className="w-14 text-center">№</TH>
                  <TH>{t('moderatorsPage.fio')}</TH>
                  <TH>{t('moderatorsPage.phone')}</TH>
                  <TH>{t('moderatorsPage.passport')}</TH>
                  <TH className="w-36 text-center">{t('moderatorsPage.status')}</TH>
                  <TH className="w-28 text-center">{t('common.actions')}</TH>
                </HeaderTR>
                <FilterTR>
                  <FilterTH />
                  <FilterTH />
                  <FilterTH />
                  <FilterTH />
                  <FilterTH>
                    <Select
                      size="sm"
                      value={status}
                      onChange={(event) => {
                        setStatus(event.target.value)
                        setPage(1)
                      }}
                      options={[
                        { value: 'all', label: t('common.all') },
                        { value: '1', label: t('moderatorsPage.active') },
                        { value: '0', label: t('moderatorsPage.inactive') },
                      ]}
                    />
                  </FilterTH>
                  <FilterTH />
                </FilterTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={6} description={t('common.empty')} />
                ) : (
                  rows.map((row, index) => {
                    const active = Number(row.status) === 1
                    const phone = phoneOf(row.phone)
                    return (
                      <TR key={row.id ?? index}>
                        <TD className="text-center text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD className="font-semibold text-deep">
                          {fullNameOf(row) || '—'}
                        </TD>
                        <TD>{phone || t('moderatorsPage.notEntered')}</TD>
                        <TD>{passportOf(row) || '—'}</TD>
                        <TD className="text-center">
                          <Badge tone={active ? 'teal' : 'rose'}>
                            {active ? t('moderatorsPage.active') : t('moderatorsPage.inactive')}
                          </Badge>
                        </TD>
                        <TD>
                          <div className="flex items-center justify-center gap-1">
                            <ShowButton onClick={() => setView(row)} />
                            <EditButton
                              onClick={() => row.id && navigate(moderatorEditPath(row.id))}
                            />
                            <DeleteButton
                              onClick={() => row.id && setDeleteId(row.id)}
                            />
                          </div>
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
            <div className="shrink-0">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setPage(1)
                }}
              />
            </div>
          </div>
        )}
      </PageMain>

      <Modal
        open={view != null}
        onClose={() => setView(null)}
        title={t('moderatorsPage.viewTitle')}
        sizeClassName="max-w-xl"
      >
        {view ? (
          <DetailList
            items={[
              { label: t('moderatorsPage.fio'), value: fullNameOf(view) },
              { label: t('moderatorsPage.birthday'), value: formatDate(view.birthday) },
              { label: t('moderatorsPage.passport'), value: passportOf(view) },
              { label: t('moderatorsPage.phone'), value: phoneOf(view.phone) },
              { label: t('moderatorsPage.region'), value: view.region?.name },
              { label: t('moderatorsPage.district'), value: view.area?.name },
              { label: t('moderatorsPage.address'), value: view.address },
              { label: t('moderatorsPage.email'), value: view.email },
            ]}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleteId != null}
        loading={remove.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </>
  )
}
