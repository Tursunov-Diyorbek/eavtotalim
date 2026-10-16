import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftRight,
  ChevronDown,
  Eye,
  Info,
  Settings,
  Star,
  X,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Pagination,
  Panel,
  SearchInput,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { agreementsShowPath } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useAutodromeContractsQuery,
  useAutodromeTemporaryStatusMutation,
  useCancelAgreementFromAutodromeMutation,
  useChangeAgreementVipMutation,
} from '@/features/autodrome-agreement'
import { usePageState } from '@/hooks'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import {
  CONTRACT_STATUSES,
  contractIsVip,
  contractStatusId,
  contractStatusTone,
} from './status'

type ConfirmKind = 'pause' | 'cancel'

function phoneText(value?: string | null) {
  const raw = value?.trim()
  if (!raw) return '—'
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 9) {
    return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7)}`
  }
  return raw
}

function dateText(value: string | null | undefined, lang: string) {
  if (!value) return '—'
  const dmy = value.match(/^(\d{2})[-.](\d{2})[-.](\d{4})/)
  if (dmy) return `${dmy[1]}.${dmy[2]}.${dmy[3]}`
  return formatDate(value, lang) ?? value
}

function ContractActions({
  busy,
  onOpen,
  onVip,
  onPause,
  onCancel,
}: {
  busy: boolean
  onOpen: () => void
  onVip: () => void
  onPause: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    const width = 288
    const height = menuRef.current?.offsetHeight ?? 176
    let top = rect.bottom + 6
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6)
    const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8)
    setPos({ top, left })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const run = (action: () => void) => {
    setOpen(false)
    action()
  }

  const item = (label: string, icon: ReactNode, action: () => void, danger = false) => (
    <Button
      variant="ghost"
      size="sm"
      className={cn('h-9 w-full justify-start px-2.5', danger && 'text-rose')}
      onClick={() => run(action)}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Button>
  )

  return (
    <div ref={rootRef} className="inline-flex">
      <Button
        variant="soft"
        size="icon-sm"
        aria-label={t('common.actions')}
        aria-expanded={open}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
      >
        <Settings className="size-3.5" aria-hidden />
      </Button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              style={{ top: pos.top, left: pos.left }}
              className="fixed z-100 w-72 rounded-xl border border-mist/80 bg-white p-1 shadow-[0_16px_40px_rgba(15,36,48,0.16)]"
            >
              {item(t('autodromeContractsPage.more'), <Eye className="size-3.5" />, onOpen)}
              {item(t('autodromeContractsPage.changeVip'), <Star className="size-3.5" />, onVip)}
              {item(
                t('autodromeContractsPage.changeTemporary'),
                <ArrowLeftRight className="size-3.5" />,
                onPause,
              )}
              {item(t('autodromeContractsPage.cancel'), <X className="size-3.5" />, onCancel, true)}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

export function AutodromeContractsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [inn, setInn] = usePageState('inn', '')
  const [statusId, setStatusId] = usePageState('status', '')
  const [vip, setVip] = usePageState('vip', '')
  const [guideOpen, setGuideOpen] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; id: number } | null>(null)
  const filterKey = [inn, statusId, vip, pageSize].join('|')
  const filterRef = useRef(filterKey)

  useEffect(() => {
    if (filterRef.current === filterKey) return
    filterRef.current = filterKey
    setPage(1)
  }, [filterKey])

  const query = useAutodromeContractsQuery({
    page,
    showCount: pageSize,
    inn,
    statusId,
    vip,
    autodromeId: user?.id,
  })
  const vipMutation = useChangeAgreementVipMutation()
  const pauseMutation = useAutodromeTemporaryStatusMutation()
  const cancelMutation = useCancelAgreementFromAutodromeMutation()
  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const busy =
    vipMutation.isPending || pauseMutation.isPending || cancelMutation.isPending

  const onError = (err: Error) => notify.error(err.message || t('common.loadError'))

  const onConfirmed = () => {
    if (!confirm) return
    const done = () => {
      notify.success(t('common.saved'))
      setConfirm(null)
    }
    if (confirm.kind === 'pause') {
      pauseMutation.mutate(confirm.id, { onSuccess: done, onError })
      return
    }
    cancelMutation.mutate(confirm.id, { onSuccess: done, onError })
  }

  const guides = [
    ['more', 'moreHint'],
    ['changeVip', 'vipHint'],
    ['changeTemporary', 'temporaryHint'],
    ['cancel', 'cancelHint'],
  ] as const

  return (
    <>
      <Header title={t('autodromeContractsPage.title')} />
      <PageMain fill>
        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Panel padding="sm" className="shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="!w-full !justify-between"
                aria-expanded={guideOpen}
                onClick={() => setGuideOpen((value) => !value)}
              >
                <span className="inline-flex items-center gap-2 font-semibold text-deep">
                  <Info className="size-4 text-signal" aria-hidden />
                  {t('autodromeContractsPage.guide')}
                </span>
                <ChevronDown
                  className={cn('size-4 text-muted transition', guideOpen && 'rotate-180')}
                  aria-hidden
                />
              </Button>
              {guideOpen ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {guides.map(([title, hint]) => (
                    <div key={title} className="rounded-lg bg-fog/70 px-3 py-2">
                      <p className="text-[13px] font-semibold text-deep">
                        {t(`autodromeContractsPage.${title}`)}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-snug text-muted">
                        {t(`autodromeContractsPage.${hint}`)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </Panel>

            <div className="flex min-h-0 flex-1 flex-col">
              <Table storageKey="autodrome-contracts">
                <THead>
                  <HeaderTR>
                    <TH column="n" className="w-12 text-center">
                      №
                    </TH>
                    <TH column="org">{t('autodromeContractsPage.orgName')}</TH>
                    <TH column="phone">{t('autodromeContractsPage.phone')}</TH>
                    <TH column="inn">{t('autodromeContractsPage.inn')}</TH>
                    <TH column="dates" className="text-center">
                      {t('autodromeContractsPage.dates')}
                    </TH>
                    <TH column="status">{t('autodromeContractsPage.status')}</TH>
                    <TH column="vip" className="w-28">
                      {t('autodromeContractsPage.vip')}
                    </TH>
                    <TH column="actions" className="w-16 text-center">
                      {t('common.actions')}
                    </TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH column="n" />
                    <FilterTH column="org" />
                    <FilterTH column="phone" />
                    <FilterTH column="inn">
                      <SearchInput
                        size="sm"
                        id="contract-inn"
                        name="contract-inn"
                        label={t('autodromeContractsPage.inn')}
                        placeholder={t('autodromeContractsPage.innSearch')}
                        value={inn}
                        onChange={(event) => setInn(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="dates" />
                    <FilterTH column="status">
                      <Select
                        size="sm"
                        id="contract-status"
                        name="contract-status"
                        value={statusId}
                        placeholder={t('common.all')}
                        onChange={(event) => setStatusId(event.target.value)}
                        options={[
                          { value: '', label: t('common.all') },
                          ...CONTRACT_STATUSES.map((item) => ({
                            value: item.id,
                            label: t(item.labelKey),
                          })),
                        ]}
                      />
                    </FilterTH>
                    <FilterTH column="vip">
                      <Select
                        size="sm"
                        id="contract-vip"
                        name="contract-vip"
                        value={vip}
                        placeholder={t('common.all')}
                        onChange={(event) => setVip(event.target.value)}
                        options={[
                          { value: '', label: t('common.all') },
                          { value: '1', label: t('autodromeContractsPage.vip') },
                          { value: '0', label: t('autodromeContractsPage.simple') },
                        ]}
                      />
                    </FilterTH>
                    <FilterTH column="actions" />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={8} description={t('autodromeContractsPage.empty')} />
                  ) : (
                    rows.map((row, index) => {
                      const status = contractStatusId(row)
                      const vipOn = contractIsVip(row.is_vip)
                      return (
                        <TR key={row.id}>
                          <TD column="n" className="text-center text-muted">
                            {(page - 1) * pageSize + index + 1}
                          </TD>
                          <TD column="org">
                            <Button
                              variant="link"
                              size="inline"
                              className="max-w-full truncate"
                              onClick={() => navigate(agreementsShowPath(row.id))}
                            >
                              {row.organization?.name || '—'}
                            </Button>
                          </TD>
                          <TD column="phone" className="whitespace-nowrap tabular-nums">
                            {phoneText(row.organization?.director?.phone || row.organization?.phone)}
                          </TD>
                          <TD column="inn" className="font-medium text-rose">
                            {row.organization?.inn || '—'}
                          </TD>
                          <TD column="dates">
                            <span className="flex flex-wrap items-center justify-center gap-1">
                              <Badge tone="teal">{dateText(row.start_date, i18n.language)}</Badge>
                              <Badge tone="rose">{dateText(row.end_date, i18n.language)}</Badge>
                            </span>
                          </TD>
                          <TD column="status">
                            <Badge tone={contractStatusTone(status)}>
                              {row.organization_autodrome_agreement_status?.title || '—'}
                            </Badge>
                          </TD>
                          <TD column="vip">
                            <Badge tone={vipOn ? 'amber' : 'neutral'}>
                              {vipOn
                                ? t('autodromeContractsPage.vip')
                                : t('autodromeContractsPage.simple')}
                            </Badge>
                          </TD>
                          <TD column="actions" className="text-center">
                            <ContractActions
                              busy={busy}
                              onOpen={() => navigate(agreementsShowPath(row.id))}
                              onVip={() =>
                                vipMutation.mutate(row.id, {
                                  onSuccess: () =>
                                    notify.success(t('autodromeContractsPage.vipSaved')),
                                  onError,
                                })
                              }
                              onPause={() => setConfirm({ kind: 'pause', id: row.id })}
                              onCancel={() => setConfirm({ kind: 'cancel', id: row.id })}
                            />
                          </TD>
                        </TR>
                      )
                    })
                  )}
                </TBody>
              </Table>
              <Pagination
                className="shrink-0"
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                total={total}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setPage(1)
                }}
              />
            </div>
          </div>
        )}
      </PageMain>

      <ConfirmDialog
        open={Boolean(confirm)}
        loading={pauseMutation.isPending || cancelMutation.isPending}
        title={
          confirm?.kind === 'cancel'
            ? t('autodromeContractsPage.cancel')
            : t('autodromeContractsPage.changeTemporary')
        }
        question={
          confirm?.kind === 'cancel'
            ? t('autodromeContractsPage.cancelConfirm')
            : t('autodromeContractsPage.pauseConfirm')
        }
        confirmLabel={t('common.save')}
        onClose={() => setConfirm(null)}
        onConfirm={onConfirmed}
      />
    </>
  )
}
