import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  Button,
  ConfirmDialog,
  DeleteButton,
  DetailList,
  EditButton,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Pagination,
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
import { marketerEditPath, routes } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useDeleteMarketerMutation,
  useMarketerQuery,
  useMarketersQuery,
} from '@/features/marketers'
import { formatDate, formatPhoneLocal, fullNameOf, parsePhoneDigits } from '@/lib'
import type { MarketerItem } from '@/types/marketers'
import { StudentAccessModal } from '@/pages/students/StudentAccessModal'

function phoneOf(value?: string | null) {
  if (!value || value === 'null') return ''
  const digits = parsePhoneDigits(value)
  return digits ? `+998 ${formatPhoneLocal(digits)}` : value
}

function passportOf(row: MarketerItem) {
  return [row.passport_seria, row.passport_number].filter(Boolean).join(' ')
}

function hasValue(value: unknown) {
  return value != null && value !== '' && value !== 'null'
}

function mergeMarketer(base: MarketerItem, extra?: MarketerItem | null) {
  if (!extra) return base
  const next: MarketerItem = { ...base }
  for (const key of Object.keys(extra) as (keyof MarketerItem)[]) {
    if (!hasValue(extra[key])) continue
    next[key] = extra[key] as never
  }
  return next
}

export function MarketersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canPassword = hasPermission('show-user-password')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [view, setView] = useState<MarketerItem | null>(null)
  const [access, setAccess] = useState<MarketerItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const remove = useDeleteMarketerMutation()
  const query = useMarketersQuery(page, pageSize)
  const detail = useMarketerQuery(view?.id != null ? String(view.id) : undefined)
  const person = view ? mergeMarketer(view, detail.data) : null

  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? rows.length
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
        title={t('marketersPage.title')}
        actions={
          <AddButton onClick={() => navigate(routes.marketerCreate)}>
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
            <Table storageKey="marketers">
              <THead>
                <HeaderTR>
                  <TH className="w-14 text-center">№</TH>
                  <TH>{t('marketersPage.fio')}</TH>
                  <TH>{t('marketersPage.phone')}</TH>
                  <TH>{t('marketersPage.passport')}</TH>
                  <TH className="w-36 text-center">{t('marketersPage.status')}</TH>
                  <TH className="w-28 text-center">{t('common.actions')}</TH>
                </HeaderTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={6} description={t('common.empty')} />
                ) : (
                  rows.map((row, index) => {
                    const active = Number(row.status) === 1
                    return (
                      <TR key={row.id ?? index}>
                        <TD className="text-center text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD className="font-semibold text-deep">{fullNameOf(row) || '—'}</TD>
                        <TD>{phoneOf(row.phone) || t('marketersPage.notEntered')}</TD>
                        <TD>{passportOf(row) || '—'}</TD>
                        <TD className="text-center">
                          <Badge tone={active ? 'teal' : 'rose'}>
                            {active ? t('marketersPage.active') : t('marketersPage.inactive')}
                          </Badge>
                        </TD>
                        <TD>
                          <div className="flex items-center justify-center gap-1">
                            {canPassword ? (
                              <Button
                                variant="soft"
                                size="icon-sm"
                                aria-label={t('students.showPage.autoLoginTitle')}
                                onClick={() => setAccess(row)}
                              >
                                <Lock className="size-3.5" />
                              </Button>
                            ) : null}
                            <ShowButton onClick={() => setView(row)} />
                            <EditButton
                              onClick={() => row.id && navigate(marketerEditPath(row.id))}
                            />
                            <DeleteButton onClick={() => row.id && setDeleteId(row.id)} />
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
        title={t('marketersPage.viewTitle')}
        sizeClassName="max-w-xl"
      >
        {detail.isLoading ? (
          <SkeletonLines lines={6} />
        ) : person ? (
          <DetailList
            items={[
              { label: t('marketersPage.fio'), value: fullNameOf(person) },
              {
                label: t('marketersPage.gender'),
                value:
                  person.gender == null || person.gender === ''
                    ? ''
                    : String(person.gender) === '1'
                      ? t('marketersPage.male')
                      : t('marketersPage.female'),
              },
              { label: t('marketersPage.birthday'), value: formatDate(person.birthday) },
              { label: t('marketersPage.passport'), value: passportOf(person) },
              { label: t('marketersPage.phone'), value: phoneOf(person.phone) },
              { label: t('marketersPage.status'), value: Number(person.status) === 1 ? t('marketersPage.active') : t('marketersPage.inactive') },
              { label: t('marketersPage.region'), value: person.region?.name },
              { label: t('marketersPage.district'), value: person.area?.name },
              { label: t('marketersPage.address'), value: person.address },
              { label: t('marketersPage.email'), value: person.email },
            ]}
          />
        ) : null}
      </Modal>

      <StudentAccessModal
        open={access != null}
        student={access}
        onClose={() => setAccess(null)}
      />

      <ConfirmDialog
        open={deleteId != null}
        loading={remove.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </>
  )
}
