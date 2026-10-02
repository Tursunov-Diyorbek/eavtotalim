import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck, Flag, X } from 'lucide-react'
import { Button, EmptyState, LottiePlayer, Modal, SkeletonLines } from '@/components/ui'
import { lottieAnimations } from '@/assets/lottie'
import { PAGE_ACCESS, routes } from '@/config'
import {
  useMarkAnnounceReadMutation,
  useMyAnnouncesQuery,
} from '@/features/announces'
import { useAuth } from '@/features/auth'
import {
  buildApplicationsNotification,
  isApplicationsNotification,
  useDirectorApplicationsCountQuery,
} from '@/features/director-applications'
import type { AnnounceItem } from '@/types/announces'
import { cn } from '@/lib/cn'
import { playMessageChime } from '@/lib/notificationChime'
import { TopbarIconButton } from './topbarUtils'

function toastKey(item: NotifRow) {
  if (isApplicationsNotification(item.id)) {
    return `${item.id}:${item.announce?.body ?? ''}`
  }
  return String(item.id)
}

type NotifRow = {
  id: string | number
  is_read?: number | null
  announce?: AnnounceItem['announce']
}

export function NotificationsMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canViewApps = hasPermission(PAGE_ACCESS.directorApplications)
  const { data = [], isLoading, isError, error } = useMyAnnouncesQuery()
  const { count: appsCount, isLoading: appsLoading } =
    useDirectorApplicationsCountQuery(canViewApps)
  const markRead = useMarkAnnounceReadMutation()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<NotifRow | null>(null)
  const [toast, setToast] = useState<{ item: NotifRow; extra: number } | null>(
    null,
  )
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const announced = useRef(false)
  const menuId = useId()

  const items = useMemo<NotifRow[]>(() => {
    const list: NotifRow[] = data.map((item) => ({
      id: item.id,
      is_read: item.is_read,
      announce: item.announce,
    }))
    if (!canViewApps) return list
    const synthetic = buildApplicationsNotification(appsCount)
    if (!synthetic) {
      return list.filter((item) => !isApplicationsNotification(item.id))
    }
    return [
      {
        id: synthetic.id,
        is_read: synthetic.is_read,
        announce: {
          title: t('directorApplications.notifTitle'),
          body: t('directorApplications.notifBody', { count: appsCount }),
          important: 1,
        },
      },
      ...list.filter((item) => !isApplicationsNotification(item.id)),
    ]
  }, [data, appsCount, canViewApps, t])

  const unread = items.filter((item) => item.is_read === 0)
  const unreadKey = unread.map((item) => toastKey(item)).join('|')

  function place() {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
  }

  const ready = !isLoading && (!canViewApps || !appsLoading)

  useEffect(() => {
    if (!ready || announced.current || unread.length === 0) return
    announced.current = true
    place()
    setToast({
      item: unread[0],
      extra: Math.max(0, unread.length - 1),
    })
    // Bir marta, ma’lumot tayyor bo‘lgach
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, unreadKey])

  useEffect(() => {
    if (!toast) return
    playMessageChime(
      toast.item.announce?.title || '',
      toast.item.announce?.body || '',
    )
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [toast])

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
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    setOpen((v) => !v)
  }

  function openToast() {
    if (!toast) return
    const item = toast.item
    setToast(null)
    if (isApplicationsNotification(item.id)) {
      navigate(routes.directorApplications)
      return
    }
    openItem(item)
  }

  function openItem(item: NotifRow) {
    setOpen(false)
    if (isApplicationsNotification(item.id)) {
      return
    }
    setSelected(item)
    if (item.is_read === 0 && typeof item.id === 'number') {
      markRead.mutate(item.id)
    }
  }

  function markAll() {
    for (const item of unread) {
      if (typeof item.id === 'number') markRead.mutate(item.id)
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
        <span className={cn('relative inline-flex', toast && 'announce-bell')}>
          <Bell className="size-4" aria-hidden />
          {unread.length > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[9px] font-bold text-white">
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          ) : null}
        </span>
      </TopbarIconButton>

      {toast && pos && !open
        ? createPortal(
            <div
              key={toastKey(toast.item)}
              role="status"
              aria-live="polite"
              className="announce-toast fixed z-80 w-90 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-white/40 bg-white/10 text-deep shadow-[0_8px_28px_-14px_rgba(15,36,48,0.18)] backdrop-blur-[2px]"
              style={{ top: pos.top, right: pos.right }}
            >
              <button
                type="button"
                onClick={openToast}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 pr-10 text-left"
              >
                <span className="grid size-18 shrink-0 place-items-center">
                  <LottiePlayer
                    key="announce-new-message"
                    animationData={lottieAnimations.newMessage}
                    size={72}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold tracking-[0.14em] text-signal uppercase">
                    {t('topbar.notifications')}
                  </span>
                  <span className="mt-0.5 block truncate font-display text-sm font-semibold text-deep">
                    {toast.item.announce?.title || '—'}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-[12px] leading-snug text-muted">
                    {toast.item.announce?.body || ''}
                  </span>
                  {toast.extra > 0 ? (
                    <span className="mt-1.5 block text-[11px] font-semibold text-signal">
                      {t('topbar.moreNotifications', { count: toast.extra })}
                    </span>
                  ) : null}
                </span>
              </button>
              <button
                type="button"
                aria-label={t('common.close')}
                onClick={() => setToast(null)}
                className="absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-lg text-muted transition hover:bg-white/80 hover:text-deep"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>,
            document.body,
          )
        : null}

      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              className="fixed z-80 w-90 overflow-hidden rounded-xl border border-mist/80 bg-white shadow-lg"
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
              {toast ? (
                <button
                  type="button"
                  onClick={openToast}
                  className="flex w-full items-center gap-2.5 border-b border-white/40 bg-white/30 px-3 py-2.5 text-left backdrop-blur-[2px]"
                >
                  <span className="grid size-16 shrink-0 place-items-center">
                    <LottiePlayer
                      key="announce-new-message-menu"
                      animationData={lottieAnimations.newMessage}
                      size={64}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-semibold text-deep">
                      {toast.item.announce?.title || '—'}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-[12px] leading-snug text-muted">
                      {toast.item.announce?.body || ''}
                    </span>
                  </span>
                </button>
              ) : null}
              <div className="max-h-72 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3">
                    <SkeletonLines lines={4} />
                  </div>
                ) : isError ? (
                  <EmptyState
                    className="border-0 py-6 shadow-none"
                    description={
                      error instanceof Error
                        ? error.message
                        : t('common.loadError')
                    }
                  />
                ) : items.length === 0 ? (
                  <EmptyState
                    className="border-0 py-6 shadow-none"
                    description={t('topbar.noNotifications')}
                  />
                ) : (
                  <ul className="divide-y divide-mist/60">
                    {items
                      .filter(
                        (item) =>
                          !toast || String(item.id) !== String(toast.item.id),
                      )
                      .map((item) => {
                      const apps = isApplicationsNotification(item.id)
                      const content = (
                        <>
                          <p className="m-0 flex items-center gap-1.5 truncate text-[13px] font-medium text-deep">
                            {apps ? (
                              <Flag className="size-3.5 shrink-0 text-rose" aria-hidden />
                            ) : null}
                            {item.announce?.title || '—'}
                          </p>
                          <p className="m-0 mt-0.5 line-clamp-2 text-[11px] text-muted">
                            {item.announce?.body || ''}
                          </p>
                        </>
                      )
                      return (
                        <li key={String(item.id)}>
                          {apps ? (
                            <Link
                              to={routes.directorApplications}
                              className={cn(
                                'block w-full px-3 py-2.5 text-left transition hover:bg-fog/70',
                                item.is_read === 0 && 'bg-signal/5',
                              )}
                              onClick={() => setOpen(false)}
                            >
                              {content}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className={cn(
                                'w-full px-3 py-2.5 text-left transition hover:bg-fog/70',
                                item.is_read === 0 && 'bg-signal/5',
                              )}
                              onClick={() => openItem(item)}
                            >
                              {content}
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              {canViewApps && appsCount > 0 ? (
                <div className="border-t border-mist/70 px-3 py-2">
                  <Link
                    to={routes.directorApplications}
                    className="text-[12px] font-semibold text-signal hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    {t('directorApplications.seeAll')}
                  </Link>
                </div>
              ) : null}
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
