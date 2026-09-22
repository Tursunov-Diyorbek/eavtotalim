import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TriangleAlert } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { TopbarIconButton } from './topbarUtils'

const STORAGE_PREFIX = 'copyright_notice_state_'
const TARGET_ROLES = ['student', 'student-ended', 'director'] as const
const STATE_OPEN = 'open'
const STATE_ACKED = 'acked'

function storageKey(userId: number | string | undefined | null) {
  if (userId == null) return null
  return `${STORAGE_PREFIX}${userId}`
}

export function CopyrightNotice() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const userId = user?.id
  const roles = user?.roles ?? []

  const isTarget = useMemo(
    () => TARGET_ROLES.some((r) => roles.includes(r)),
    [roles],
  )

  const [open, setOpen] = useState(false)
  const [acked, setAcked] = useState(false)

  useEffect(() => {
    if (!isTarget || userId == null) return
    const key = storageKey(userId)
    let state: string | null = null
    try {
      state = key ? localStorage.getItem(key) : null
    } catch {
      state = null
    }
    if (state === STATE_ACKED) {
      setAcked(true)
      return
    }
    setAcked(false)
    setOpen(true)
    if (key && state !== STATE_OPEN) {
      try {
        localStorage.setItem(key, STATE_OPEN)
      } catch {
        /* ignore */
      }
    }
  }, [isTarget, userId])

  if (!isTarget) return null

  const acknowledge = () => {
    const key = storageKey(userId)
    if (key) {
      try {
        localStorage.setItem(key, STATE_ACKED)
      } catch {
        /* ignore */
      }
    }
    setAcked(true)
    setOpen(false)
  }

  const reopen = () => {
    const key = storageKey(userId)
    if (key) {
      try {
        localStorage.setItem(key, STATE_OPEN)
      } catch {
        /* ignore */
      }
    }
    setAcked(false)
    setOpen(true)
  }

  const licenses = [
    { label: t('topbar.certNumber'), value: '010100' },
    { label: t('topbar.pubLicense'), value: '356-220' },
    { label: t('topbar.pubLicense'), value: '356-221' },
  ]

  return (
    <>
      <TopbarIconButton
        label={t('topbar.copyrightTitle')}
        active={false}
        onClick={reopen}
        className="copyright-notice-trigger relative overflow-visible"
      >
        <span className="copyright-notice-icon inline-flex text-signal">
          <TriangleAlert className="size-4" aria-hidden />
        </span>
      </TopbarIconButton>

      <Modal
        open={open}
        onClose={() => {}}
        dismissible={false}
        hideHeader
        maxHeightClassName="max-h-[min(92svh,760px)]"
        bodyClassName="overflow-y-auto p-0"
        className="rounded-[14px] border-mist/60 shadow-[0_30px_60px_rgba(29,97,122,0.18)]"
      >
        {/* Header — eski CopyrightNotice */}
        <div className="relative border-b border-[#cfe3ea] bg-linear-to-br from-[#e8f3f6] to-[#f5fbfc] px-5 pt-6 pb-4 sm:px-7">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-signal via-[#2D8AA8] to-signal" />
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-signal to-[#2D8AA8] text-white shadow-[0_10px_24px_rgba(29,97,122,0.35)]">
              <TriangleAlert className="size-7" aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="font-display m-0 text-[22px] font-bold tracking-wide text-deep">
                {t('topbar.copyrightAttention')}
              </h3>
              <p className="m-0 mt-1 text-[13px] font-medium text-signal">
                {t('topbar.copyrightWarning')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5 sm:px-7">
          <p className="m-0 text-justify text-[15px] leading-[1.75] text-[#1e293b]">
            <Trans
              i18nKey="topbar.copyrightBody"
              components={{
                strong: <strong className="font-semibold text-deep" />,
                org: <strong className="font-semibold text-signal" />,
                brand: <strong className="font-semibold text-signal" />,
              }}
            />
          </p>

          <div className="rounded-xl border border-[#cfe3ea] bg-linear-to-br from-[#eef6f9] to-[#f7fbfc] p-3.5 sm:p-4">
            <p className="mb-2.5 text-[12px] font-semibold tracking-wide text-signal uppercase">
              {t('topbar.copyrightProtected')}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {licenses.map((item) => (
                <div
                  key={item.value}
                  className="rounded-lg border border-mist/80 bg-white px-3 py-2.5 shadow-sm"
                >
                  <p className="m-0 text-[11px] text-muted">{item.label}</p>
                  <p className="m-0 mt-0.5 font-mono text-sm font-bold tracking-wide text-deep">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] border border-[rgba(244,106,106,0.28)] bg-[rgba(244,106,106,0.08)] px-3.5 py-3 text-justify text-[15px] leading-[1.75] text-[#c0392b]">
            <Trans
              i18nKey="topbar.copyrightRestriction"
              components={{ strong: <strong className="font-semibold" /> }}
            />
          </div>

          <div className="rounded-lg border-l-[3px] border-[#d97706] bg-[rgba(148,163,184,0.10)] px-3.5 py-3 text-justify text-[14px] leading-[1.7] text-[#334155]">
            <Trans
              i18nKey="topbar.copyrightLiability"
              components={{ hl: <strong className="font-semibold text-[#b45309]" /> }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3.5 border-t border-mist/70 bg-linear-to-b from-transparent to-[#f3f8fa] px-5 pt-4 pb-6 sm:px-7">
          <p className="m-0 text-center text-[12.5px] leading-relaxed text-muted">
            <Trans
              i18nKey="topbar.copyrightFooter"
              values={{ year: new Date().getFullYear() }}
              components={{
                org: <strong className="text-[#334155]" />,
                brand: <strong className="text-[#334155]" />,
              }}
            />
          </p>
          <Button
            variant="primary"
            className="h-11 min-w-[220px] rounded-xl text-[15px] font-semibold shadow-[0_10px_22px_rgba(29,97,122,0.35)]"
            onClick={acknowledge}
          >
            {t('topbar.copyrightOk')}
          </Button>
        </div>
      </Modal>
    </>
  )
}
