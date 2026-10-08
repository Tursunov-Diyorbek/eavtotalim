import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
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
  RegionDistrict,
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
import { accountantEditPath, routes } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useAccountantQuery,
  useAccountantsQuery,
  useDeleteAccountantMutation,
} from '@/features/accountants'
import { formatDate, formatPhoneLocal, fullNameOf, parsePhoneDigits } from '@/lib'
import type { AccountantItem } from '@/types/accountants'
import { StudentAccessModal } from '@/pages/students/StudentAccessModal'

function phoneOf(value?: string | null) {
  if (!value || value === 'null') return ''
  const digits = parsePhoneDigits(value)
  return digits ? `+998 ${formatPhoneLocal(digits)}` : value
}

function passportOf(row: AccountantItem) {
  return [row.passport_seria, row.passport_number].filter(Boolean).join(' ')
}

function hasValue(value: unknown) {
  return value != null && value !== '' && value !== 'null'
}

/** Ro‘yxatda yo‘q maydonlarni show javobidan to‘ldiradi. */
function mergeAccountant(base: AccountantItem, extra?: AccountantItem | null) {
  if (!extra) return base
  const next: AccountantItem = { ...base }
  for (const key of Object.keys(extra) as (keyof AccountantItem)[]) {
    if (!hasValue(extra[key])) continue
    next[key] = extra[key] as never
  }
  return next
}

export function AccountantsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canPassword = hasPermission('show-user-password')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [view, setView] = useState<AccountantItem | null>(null)
  const [access, setAccess] = useState<AccountantItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const remove = useDeleteAccountantMutation()
  const query = useAccountantsQuery()
  const detail = useAccountantQuery(view?.id != null ? String(view.id) : undefined)
  const person = view ? mergeAccountant(view, detail.data) : null

  const all = query.data?.data ?? []
  const total = all.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const rows = all.slice((page - 1) * pageSize, page * pageSize)

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
        title={t('accountantsPage.title')}
        actions={
          <AddButton onClick={() => navigate(routes.accountantCreate)}>
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
            <Table storageKey="accountants">
              <THead>
                <HeaderTR>
                  <TH className="w-14 text-center">№</TH>
                  <TH>{t('accountantsPage.fio')}</TH>
                  <TH>{t('accountantsPage.phone')}</TH>
                  <TH>{t('common.regionDistrict')}</TH>
                  <TH>{t('accountantsPage.passport')}</TH>
                  <TH className="w-28 text-center">{t('common.actions')}</TH>
                </HeaderTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={6} description={t('common.empty')} />
                ) : (
                  rows.map((row, index) => (
                    <TR key={row.id ?? index}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD className="font-semibold text-deep">{fullNameOf(row) || '—'}</TD>
                      <TD>{phoneOf(row.phone) || t('accountantsPage.notEntered')}</TD>
                      <TD>
                        <RegionDistrict region={row.region?.name} district={row.area?.name} />
                      </TD>
                      <TD>{passportOf(row) || '—'}</TD>
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
                            onClick={() => row.id && navigate(accountantEditPath(row.id))}
                          />
                          <DeleteButton onClick={() => row.id && setDeleteId(row.id)} />
                        </div>
                      </TD>
                    </TR>
                  ))
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
        title={t('accountantsPage.viewTitle')}
        sizeClassName="max-w-xl"
      >
        {detail.isLoading ? (
          <SkeletonLines lines={6} />
        ) : person ? (
          <DetailList
            items={[
              { label: t('accountantsPage.fio'), value: fullNameOf(person) },
              {
                label: t('accountantsPage.gender'),
                value:
                  person.gender == null || person.gender === ''
                    ? ''
                    : String(person.gender) === '1'
                      ? t('accountantsPage.male')
                      : t('accountantsPage.female'),
              },
              { label: t('accountantsPage.birthday'), value: formatDate(person.birthday) },
              { label: t('accountantsPage.passport'), value: passportOf(person) },
              { label: t('accountantsPage.phone'), value: phoneOf(person.phone) },
              { label: t('accountantsPage.region'), value: person.region?.name },
              { label: t('accountantsPage.district'), value: person.area?.name },
              { label: t('accountantsPage.address'), value: person.address },
              { label: t('accountantsPage.email'), value: person.email },
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
