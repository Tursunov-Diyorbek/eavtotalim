import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Notification,
  Pagination,
  SearchInput,
  Table,
  Tabs,
  TBody,
  TD,
  Textarea,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { ROLE_CODE } from '@/config/access'
import { useAuth } from '@/features/auth'
import { usePageState } from '@/hooks'
import {
  useAcceptDirectorApplicationMutation,
  useCancelDirectorApplicationMutation,
  useDirectorApplicationsQuery,
} from '@/features/director-applications'
import {
  cn,
  formatDateTime,
  formatNumber,
  formatPhoneLocal,
  parsePhoneDigits,
} from '@/lib'
import type { DirectorApplicationRow } from '@/types'

const BANNER_KEY = 'director_applications_test_banner_hidden'
const ACTIONABLE = new Set(['received', 'processing'])

type FilterTab = '' | 'received' | 'accepted' | 'rejected'

function isBannerHidden() {
  const token = localStorage.getItem('token') || ''
  return Boolean(token) && localStorage.getItem(BANNER_KEY) === token
}

function hideBanner() {
  const token = localStorage.getItem('token') || ''
  if (token) localStorage.setItem(BANNER_KEY, token)
}

function parseSearchQuery(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return { search: undefined as string | undefined, phone: undefined as string | undefined }

  const digits = trimmed.replace(/\D/g, '')
  const looksLikePhone = digits.length >= 9 && /^[\d\s+()-]+$/.test(trimmed)

  if (looksLikePhone) {
    let phone = trimmed
    if (digits.length === 9) {
      phone = `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
    } else if (digits.length >= 12 && digits.startsWith('998')) {
      const d = digits.slice(-9)
      phone = `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`
    }
    return { search: undefined, phone }
  }

  return { search: trimmed, phone: undefined }
}

function phoneLabel(raw: string | null | undefined) {
  const digits = parsePhoneDigits(raw)
  if (!digits) return '—'
  return `+998 ${formatPhoneLocal(digits)}`
}

function stateTone(state?: string | null) {
  if (state === 'received' || state === 'processing') return 'amber' as const
  if (state === 'accepted' || state === 'completed') return 'teal' as const
  if (state === 'rejected' || state === 'cancelled') return 'rose' as const
  return 'neutral' as const
}

function stateLabel(
  state: string | null | undefined,
  fallback: string | null | undefined,
  t: (k: string) => string,
) {
  const map: Record<string, string> = {
    received: t('directorApplications.stateReceived'),
    processing: t('directorApplications.stateProcessing'),
    accepted: t('directorApplications.stateAccepted'),
    rejected: t('directorApplications.stateRejected'),
    completed: t('directorApplications.stateCompleted'),
    cancelled: t('directorApplications.stateCancelled'),
  }
  if (state && map[state]) return map[state]
  return fallback || state || '—'
}

export function DirectorApplicationsPage() {
  const { t, i18n } = useTranslation()
  const { user, hasPermission } = useAuth()
  const role = user?.role
  const isOrgUser =
    role === ROLE_CODE.DIRECTOR ||
    role === 3 ||
    user?.roles?.includes('director') ||
    user?.roles?.includes('moderator')
  const canAccept =
    isOrgUser || hasPermission('accept-external-application')
  const canCancel =
    isOrgUser || hasPermission('cancel-external-application')

  const [bannerHidden, setBannerHidden] = useState(() => isBannerHidden())
  const [stateFilter, setStateFilter] = usePageState<FilterTab>('stateFilter', '')
  const [search, setSearch] = usePageState<string | undefined>('search', undefined)
  const [phone, setPhone] = usePageState<string | undefined>('phone', undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [acceptId, setAcceptId] = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<DirectorApplicationRow | null>(
    null,
  )
  const [cancelComment, setCancelComment] = useState('')

  useEffect(() => {
    setPage(1)
  }, [stateFilter, search, phone, pageSize])

  const query = useDirectorApplicationsQuery({
    page,
    showCount: pageSize,
    state: stateFilter || undefined,
    search,
    phone,
  })
  const acceptMutation = useAcceptDirectorApplicationMutation()
  const cancelMutation = useCancelDirectorApplicationMutation()

  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages =
    query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const counts = query.data?.status_counts ?? {}

  const tabs = useMemo(
    () =>
      (
        [
          { value: '' as FilterTab, label: t('common.all'), countKey: 'all' as const },
          {
            value: 'received' as FilterTab,
            label: t('directorApplications.tabNew'),
            countKey: 'received' as const,
          },
          {
            value: 'accepted' as FilterTab,
            label: t('directorApplications.tabAccepted'),
            countKey: 'accepted' as const,
          },
          {
            value: 'rejected' as FilterTab,
            label: t('directorApplications.tabRejected'),
            countKey: 'rejected' as const,
          },
        ] as const
      ).map((tab) => {
        const count = counts[tab.countKey]
        const alert = tab.value === 'received' && Number(count) > 0
        return {
          value: tab.value,
          label: (
            <span className="inline-flex items-center gap-1.5">
              {tab.label}
              {count != null ? (
                <Badge
                  tone={
                    stateFilter === tab.value
                      ? 'signal'
                      : alert
                        ? 'rose'
                        : 'neutral'
                  }
                  className="tabular-nums"
                >
                  {formatNumber(count)}
                </Badge>
              ) : null}
            </span>
          ),
        }
      }),
    [counts, stateFilter, t],
  )

  return (
    <>
      <Header title={t('directorApplications.title')} />
      <PageMain fill>
        {!bannerHidden ? (
          <Notification
            tone="info"
            className="mb-3 shrink-0"
            onClose={() => {
              hideBanner()
              setBannerHidden(true)
            }}
          >
            <p className="font-semibold text-deep">
              {t('directorApplications.bannerTitle')}
            </p>
            <p className="mt-0.5 text-[12px] text-muted">
              {t('directorApplications.bannerText')}
            </p>
          </Notification>
        ) : null}

        <div className="mb-3 flex shrink-0 flex-wrap items-end gap-2">
          <Tabs
            size="sm"
            value={stateFilter}
            onChange={setStateFilter}
            items={tabs}
            aria-label={t('directorApplications.title')}
          />
          <SearchInput
            size="sm"
            className="ml-auto w-64 shrink-0"
            placeholder={t('directorApplications.search')}
            onChange={(event) => {
              const parsed = parseSearchQuery(event.target.value)
              setSearch(parsed.search)
              setPhone(parsed.phone)
            }}
          />
        </div>

        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Table storageKey="director-applications">
              <THead>
                <HeaderTR>
                  <TH column="idx" className="w-14">
                    #
                  </TH>
                  <TH column="fio">{t('directorApplications.colFio')}</TH>
                  <TH column="phone" className="w-40">
                    {t('directorApplications.colPhone')}
                  </TH>
                  <TH column="source" className="w-28">
                    {t('directorApplications.colSource')}
                  </TH>
                  <TH column="date" className="w-40">
                    {t('directorApplications.colDate')}
                  </TH>
                  <TH column="status" className="w-36">
                    {t('directorApplications.colStatus')}
                  </TH>
                  <TH column="actions" className="w-28">
                    {t('common.actions')}
                  </TH>
                </HeaderTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={7} />
                ) : (
                  rows.map((row, index) => {
                    const actionable = ACTIONABLE.has(String(row.state))
                    return (
                      <TR
                        key={row.id}
                        className={cn(actionable && 'bg-amber-soft/15')}
                      >
                        <TD column="idx" className="text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD column="fio" className="font-semibold text-deep">
                          {row.applicant_name || '—'}
                        </TD>
                        <TD column="phone">{phoneLabel(row.applicant_phone)}</TD>
                        <TD column="source">
                          {row.source ? (
                            <Badge tone="neutral">{row.source}</Badge>
                          ) : (
                            '—'
                          )}
                        </TD>
                        <TD column="date" className="text-[12px] text-muted">
                          {formatDateTime(row.created_at, i18n.language) || '—'}
                        </TD>
                        <TD column="status">
                          <Badge tone={stateTone(row.state)}>
                            {row.state === 'received' ? (
                              <span className="size-1.5 rounded-full bg-current" />
                            ) : null}
                            {stateLabel(row.state, row.state_label, t)}
                          </Badge>
                        </TD>
                        <TD column="actions">
                          {actionable ? (
                            <div className="flex items-center gap-1">
                              {canAccept ? (
                                <Button
                                  variant="soft"
                                  size="icon-sm"
                                  className="size-8 text-teal hover:bg-teal-soft"
                                  aria-label={t('directorApplications.accept')}
                                  disabled={acceptMutation.isPending}
                                  onClick={() => setAcceptId(row.id)}
                                >
                                  <Check className="size-3.5" aria-hidden />
                                </Button>
                              ) : null}
                              {canCancel ? (
                                <Button
                                  variant="soft"
                                  size="icon-sm"
                                  className="size-8 text-rose hover:bg-rose-soft"
                                  aria-label={t('directorApplications.cancel')}
                                  onClick={() => {
                                    setCancelTarget(row)
                                    setCancelComment('')
                                  }}
                                >
                                  <X className="size-3.5" aria-hidden />
                                </Button>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </PageMain>

      <ConfirmDialog
        open={acceptId != null}
        onClose={() => setAcceptId(null)}
        onConfirm={() => {
          if (acceptId == null) return
          acceptMutation.mutate(acceptId, {
            onSuccess: () => setAcceptId(null),
          })
        }}
        loading={acceptMutation.isPending}
        title={t('directorApplications.acceptConfirm')}
        confirmLabel={t('directorApplications.accept')}
      />

      <Modal
        open={cancelTarget != null}
        onClose={() => {
          setCancelTarget(null)
          setCancelComment('')
        }}
        title={`${t('directorApplications.cancel')}: ${cancelTarget?.applicant_name || ''}`}
        sizeClassName="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCancelTarget(null)
                setCancelComment('')
              }}
            >
              {t('common.close')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={cancelMutation.isPending}
              onClick={() => {
                if (!cancelTarget) return
                cancelMutation.mutate(
                  { id: cancelTarget.id, comment: cancelComment },
                  {
                    onSuccess: () => {
                      setCancelTarget(null)
                      setCancelComment('')
                    },
                  },
                )
              }}
            >
              {t('directorApplications.cancel')}
            </Button>
          </div>
        }
      >
        <Textarea
          label={t('directorApplications.comment')}
          rows={3}
          value={cancelComment}
          onChange={(event) => setCancelComment(event.target.value)}
          placeholder={t('directorApplications.commentPlaceholder')}
          maxLength={1000}
        />
      </Modal>
    </>
  )
}
