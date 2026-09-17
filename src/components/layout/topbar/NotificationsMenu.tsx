import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck } from 'lucide-react'
import { Button, EmptyState, Modal, SkeletonLines } from '@/components/ui'
import {
  useMarkAnnounceReadMutation,
  useMyAnnouncesQuery,
} from '@/features/announces'
import type { AnnounceItem } from '@/types/announces'
import { cn } from '@/lib/cn'
import { TopbarIconButton } from './topbarUtils'

export function NotificationsMenu() {
  const { t } = useTranslation()
  const { data = [], isLoading } = useMyAnnouncesQuery()
  const markRead = useMarkAnnounceReadMutation()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<AnnounceItem | null>(null)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const unread = data.filter((item) => item.is_read === 0)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function openMenu() {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
    setOpen((v) => !v)
  }

  function openItem(item: AnnounceItem) {
    setSelected(item)
    setOpen(false)
    if (item.is_read === 0) {
      markRead.mutate(item.id)
    }
  }

  function markAll() {
    for (const item of unread) {
      markRead.mutate(item.id)
    }
  }

  return (
    <>
      <TopbarIconButton
        ref={triggerRef}
        label={t('topbar.notifications')}
        onClick={openMenu}
        className={cn(unread.length > 0 && 'text-signal')}
      >
        <span className="relative inline-flex">
          <Bell className="size-4" aria-hidden />
          {unread.length > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[9px] font-bold text-white">
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          ) : null}
        </span>
      </TopbarIconButton>

      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              className="fixed z-80 w-80 overflow-hidden rounded-xl border border-mist/80 bg-white shadow-lg"
              style={{ top: pos.top, right: pos.right }}
            >
              <div className="flex items-center justify-between border-b border-mist/70 px-3 py-2">
                <p className="m-0 text-sm font-semibold text-deep">
                  {t('topbar.notifications')}
                </p>
                {unread.length > 0 ? (
                  <Button variant="ghost" size="sm" onClick={markAll}>
                    <CheckCheck className="size-3.5" aria-hidden />
                    {t('topbar.markAllRead')}
                  </Button>
                ) : null}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3">
                    <SkeletonLines lines={4} />
                  </div>
                ) : data.length === 0 ? (
                  <EmptyState
                    className="border-0 py-6 shadow-none"
                    description={t('topbar.noNotifications')}
                  />
                ) : (
                  <ul className="divide-y divide-mist/60">
                    {data.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={cn(
                            'w-full px-3 py-2.5 text-left transition hover:bg-fog/70',
                            item.is_read === 0 && 'bg-signal/5',
                          )}
                          onClick={() => openItem(item)}
                        >
                          <p className="m-0 truncate text-[13px] font-medium text-deep">
                            {item.announce?.title || '—'}
                          </p>
                          <p className="m-0 mt-0.5 line-clamp-2 text-[11px] text-muted">
                            {item.announce?.body || ''}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}

      <Modal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected?.announce?.title || t('topbar.notifications')}
        sizeClassName="max-w-lg"
        footer={
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => setSelected(null)}>
              {t('topbar.readDone')}
            </Button>
          </div>
        }
      >
        <p className="m-0 whitespace-pre-wrap text-[13px] leading-relaxed text-deep">
          {selected?.announce?.body || '—'}
        </p>
      </Modal>
    </>
  )
}
