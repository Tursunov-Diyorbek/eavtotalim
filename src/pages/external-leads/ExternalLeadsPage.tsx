import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Check,
  ClipboardList,
  EyeOff,
  Gauge,
  Package,
  PieChart,
  Wallet,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EditButton,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Panel,
  Select,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Tabs,
  Textarea,
  Tooltip,
  TR,
  notify,
} from '@/components/ui'
import type { ExternalLead, LeadStatus } from '@/api/external-leads'
import {
  useExternalLeadsQuery,
  useLeadStatsQuery,
  useUnlockLeadMutation,
  useUpdateLeadMutation,
} from '@/features/external-leads'
import { usePageState } from '@/hooks'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

const STATUSES: LeadStatus[] = ['', 'new', 'contacted', 'registered', 'rejected']

const STAT_CARDS = [
  { key: 'total_limit', icon: PieChart, tone: 'text-signal bg-signal-soft' },
  { key: 'total_used_limit', icon: ClipboardList, tone: 'text-teal bg-teal-soft' },
  { key: 'free_limit', icon: Wallet, tone: 'text-amber bg-amber-soft' },
  { key: 'limit', icon: Package, tone: 'text-violet bg-violet-soft' },
  { key: 'used_limit', icon: Gauge, tone: 'text-rose bg-rose-soft' },
] as const

function sourceTone(source: string | null | undefined) {
  if (source === 'prepdrive') return 'signal' as const
  if (source === 'road24') return 'rose' as const
  return 'violet' as const
}

function statusTone(status: string | null | undefined) {
  if (status === 'registered') return 'teal' as const
  if (status === 'contacted') return 'amber' as const
  if (status === 'rejected') return 'rose' as const
  return 'signal' as const
}

function leadName(row: ExternalLead) {
  return [row.last_name, row.first_name].filter(Boolean).join(' ') || '—'
}

function sentAt(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} / ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ExternalLeadsPage() {
  const { t } = useTranslation()
  const [status, setStatus] = usePageState<LeadStatus>('status', '')
  const listQuery = useExternalLeadsQuery(status)
  const statsQuery = useLeadStatsQuery()
  const unlock = useUnlockLeadMutation()
  const update = useUpdateLeadMutation()
  const [editing, setEditing] = useState<ExternalLead | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [comment, setComment] = useState('')
  const [unlockingId, setUnlockingId] = useState<number | null>(null)

  const rows = listQuery.data ?? []
  const stats = statsQuery.data

  function openEdit(row: ExternalLead) {
    setEditing(row)
    setEditStatus(row.status ?? '')
    setComment(row.comment ?? '')
  }

  async function onUnlock(id: number) {
    setUnlockingId(id)
    try {
      await unlock.mutateAsync(id)
      notify.success(t('leadsPage.unlocked'))
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t('common.loadError'))
    } finally {
      setUnlockingId(null)
    }
  }

  async function onSave() {
    if (!editing) return
    try {
      await update.mutateAsync({ id: editing.id, status: editStatus, comment })
      notify.success(t('common.saved'))
      setEditing(null)
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t('common.loadError'))
    }
  }

  return (
    <>
      <Header
        title={t('nav.externalLeads')}
        actions={
          <Tabs
            size="sm"
            aria-label={t('leadsPage.status')}
            value={status}
            onChange={(value) => setStatus(value as LeadStatus)}
            items={STATUSES.map((value) => ({
              value,
              label: t(`leadsPage.status_${value || 'all'}`),
            }))}
          />
        }
      />
      <PageMain fill>
        {statsQuery.isLoading ? (
          <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-5">
            {STAT_CARDS.map((card) => (
              <Skeleton key={card.key} className="h-[92px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-5">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon
              const value = stats?.[card.key]
              return (
                <Panel key={card.key} className="px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-slate">
                        {t(`leadsPage.stat_${card.key}`)}
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums text-deep">
                        {value == null ? '—' : formatNumber(value)}
                      </div>
                    </div>
                    <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', card.tone)}>
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-slate">
                    {t(`leadsPage.statHint_${card.key}`)}
                  </p>
                </Panel>
              )
            })}
          </div>
        )}

        {listQuery.isLoading ? (
          <ListPageSkeleton />
        ) : listQuery.isError ? (
          <ErrorMessage />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table fill>
              <THead>
                <HeaderTR>
                  <TH className="w-12">№</TH>
                  <TH>{t('leadsPage.fio')}</TH>
                  <TH>{t('leadsPage.phone')}</TH>
                  <TH>{t('leadsPage.source')}</TH>
                  <TH>{t('leadsPage.sentAt')}</TH>
                  <TH>{t('leadsPage.status')}</TH>
                  <TH>{t('leadsPage.comment')}</TH>
                  <TH className="w-24 text-center">{t('common.actions')}</TH>
                </HeaderTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={8} description={t('leadsPage.empty')} />
                ) : (
                  rows.map((row, index) => {
                    const locked = !row.unlocked_at
                    const cell = locked ? '!bg-amber-soft' : undefined
                    return (
                      <TR key={row.id}>
                        <TD className={cell}>{index + 1}</TD>
                        <TD className={cn('font-medium', cell)}>{leadName(row)}</TD>
                        <TD className={cell}>
                          {row.phone ? (
                            locked ? (
                              <Tooltip content={t('leadsPage.unlock')}>
                                <Button
                                  variant="ghost"
                                  size="inline"
                                  className="!bg-rose-soft !text-rose"
                                  loading={unlockingId === row.id}
                                  onClick={() => void onUnlock(row.id)}
                                >
                                  {row.phone}
                                </Button>
                              </Tooltip>
                            ) : (
                              <Badge tone="teal">{row.phone}</Badge>
                            )
                          ) : (
                            '—'
                          )}
                        </TD>
                        <TD className={cell}>
                          {row.source ? (
                            <Badge tone={sourceTone(row.source)}>{row.source}</Badge>
                          ) : (
                            '—'
                          )}
                        </TD>
                        <TD className={cn('whitespace-nowrap text-center', cell)}>
                          <Badge tone="teal">{sentAt(row.created_at)}</Badge>
                        </TD>
                        <TD className={cn('text-center', cell)}>
                          <Badge tone={statusTone(row.status || 'new')}>
                            {t(`leadsPage.status_${row.status || 'new'}`)}
                          </Badge>
                        </TD>
                        <TD className={cn('max-w-[220px] truncate', cell)} title={row.comment ?? ''}>
                          {row.comment || '—'}
                        </TD>
                        <TD className={cn('text-center', cell)}>
                          <div className="inline-flex items-center gap-1">
                            {locked ? (
                              <Tooltip content={t('leadsPage.unlock')}>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={t('leadsPage.unlock')}
                                  loading={unlockingId === row.id}
                                  onClick={() => void onUnlock(row.id)}
                                >
                                  <EyeOff className="size-4" />
                                </Button>
                              </Tooltip>
                            ) : (
                              <span className="grid size-8 place-items-center text-teal" aria-hidden>
                                <Check className="size-4" />
                              </span>
                            )}
                            <EditButton onClick={() => openEdit(row)} />
                          </div>
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
          </div>
        )}
      </PageMain>

      <Modal
        open={Boolean(editing)}
        title={editing ? leadName(editing) : ''}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="danger" onClick={() => setEditing(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" loading={update.isPending} onClick={() => void onSave()}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label={t('leadsPage.status')}
            value={editStatus}
            onChange={(event) => setEditStatus(event.target.value)}
            options={STATUSES.map((value) => ({
              value,
              label: t(`leadsPage.status_${value || 'all'}`),
            }))}
          />
          <Textarea
            label={t('leadsPage.comment')}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </>
  )
}
