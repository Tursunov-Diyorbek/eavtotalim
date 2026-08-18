import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Brush, CheckSquare, Settings, Square } from 'lucide-react'
import { Button } from './Button'

export type ColumnVisibilityItem = {
  id: string
  label: string
}

type MenuPos = {
  top: number
  left: number
  openUp: boolean
}

export function ColumnVisibility({
  columns,
  visibility,
  onChange,
  onReset,
}: {
  columns: ColumnVisibilityItem[]
  visibility: Record<string, boolean>
  onChange: (next: Record<string, boolean>) => void
  onReset: () => void
}) {
  const { t } = useTranslation()
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<MenuPos | null>(null)

  const isVisible = (id: string) => visibility[id] !== false

  const updatePosition = () => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const menuMax = 340
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < menuMax && rect.top > spaceBelow
    setPos({
      top: openUp ? rect.top : rect.bottom + 6,
      left: rect.left,
      openUp,
    })
  }

  useEffect(() => {
    if (!open) return
    updatePosition()
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (wrapRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  const setVisible = (id: string, value: boolean) => {
    onChange({ ...visibility, [id]: value })
  }

  const showAll = () => {
    const next: Record<string, boolean> = {}
    columns.forEach((col) => {
      next[col.id] = true
    })
    onChange(next)
    setOpen(false)
  }

  const hideAll = () => {
    const next: Record<string, boolean> = {}
    columns.forEach((col) => {
      next[col.id] = false
    })
    onChange(next)
    setOpen(false)
  }

  const menu =
    open && pos && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: pos.openUp ? undefined : pos.top,
              bottom: pos.openUp
                ? window.innerHeight - pos.top + 6
                : undefined,
              left: pos.left,
              zIndex: 120,
            }}
            className="w-[min(280px,calc(100vw-24px))] overflow-hidden rounded-xl border border-mist/80 bg-white shadow-[0_12px_40px_rgba(15,36,48,0.16)]"
          >
            <p className="px-3.5 pt-3 pb-2 text-sm font-semibold text-deep">
              {t('common.columnsTitle')}
            </p>
            <div className="max-h-70 overflow-y-auto py-1">
              {columns.map((col) => {
                const checked = isVisible(col.id)
                return (
                  <button
                    key={col.id}
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={checked}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-ink hover:bg-fog/70"
                    onClick={() => setVisible(col.id, !checked)}
                  >
                    {checked ? (
                      <CheckSquare className="size-4 shrink-0 text-signal" aria-hidden />
                    ) : (
                      <Square className="size-4 shrink-0 text-muted/50" aria-hidden />
                    )}
                    <span className="min-w-0 truncate">{col.label}</span>
                  </button>
                )
              })}
            </div>
            <div className="border-t border-mist/70 px-2 py-1.5">
              <button
                type="button"
                className="w-full rounded-lg px-2.5 py-2 text-left text-[12px] text-muted hover:bg-fog/70"
                onClick={showAll}
              >
                {t('common.columnsShowAll')}
              </button>
              <button
                type="button"
                className="w-full rounded-lg px-2.5 py-2 text-left text-[12px] text-muted hover:bg-fog/70"
                onClick={hideAll}
              >
                {t('common.columnsHideAll')}
              </button>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div
        ref={wrapRef}
        className="inline-flex overflow-hidden rounded-lg border border-mist/90 bg-white"
      >
        <Button
          variant="ghost"
          size="sm"
          className="rounded-none"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Settings className="size-3.5" aria-hidden />
          {t('common.columns')}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-none border-l border-mist/90 text-amber hover:bg-amber-soft hover:text-amber"
          aria-label={t('common.columnsReset')}
          onClick={() => {
            onReset()
            setOpen(false)
          }}
        >
          <Brush className="size-3.5" aria-hidden />
        </Button>
      </div>
      {menu}
    </>
  )
}
