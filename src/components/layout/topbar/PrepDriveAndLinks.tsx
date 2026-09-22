import { useEffect, useId, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import { Trans, useTranslation } from 'react-i18next'
import {
  Apple,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileVideo,
  Globe,
  Play,
  Rocket,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { isDirectorRole } from '@/config/roles'
import { cn } from '@/lib/cn'
import prepDriveLogo from '@/assets/images/prep-drive-logo.png'
import { StyledQrCode } from './StyledQrCode'

/** Direktor topbar — support ijtimoiy. */
const DIRECTOR_TELEGRAM = 'https://t.me/e_avtotalimuz'
const DIRECTOR_INSTAGRAM = 'https://www.instagram.com/prepdrive_uz'

const PREPDRIVE_URL =
  'https://prepdrive.uz?utm_source=eavtotalim&utm_medium=header&utm_campaign=mustaqil_tayyorlov'

type Feature = {
  key: string
  icon: ComponentType<{ className?: string }>
  tone: string
  iconTone: string
}

const FEATURES: Feature[] = [
  {
    key: 'topbar.prepFeature1',
    icon: CheckCircle2,
    tone: 'bg-violet-soft',
    iconTone: 'text-violet',
  },
  {
    key: 'topbar.prepFeature2',
    icon: Play,
    tone: 'bg-signal/15',
    iconTone: 'text-signal',
  },
  {
    key: 'topbar.prepFeature3',
    icon: Bot,
    tone: 'bg-teal-soft',
    iconTone: 'text-teal',
  },
  {
    key: 'topbar.prepFeature4',
    icon: Users,
    tone: 'bg-amber-soft',
    iconTone: 'text-amber',
  },
  {
    key: 'topbar.prepFeature5',
    icon: FileVideo,
    tone: 'bg-indigo-soft',
    iconTone: 'text-indigo',
  },
  {
    key: 'topbar.prepFeature6',
    icon: Rocket,
    tone: 'bg-fog',
    iconTone: 'text-deep',
  },
]

const PLATFORMS = [
  {
    href: PREPDRIVE_URL,
    labelKey: 'topbar.prepWeb' as const,
    icon: Globe,
  },
  {
    href: 'https://play.google.com/store/apps/details?id=uz.intalim.online&pcampaignid=web_share',
    labelKey: 'topbar.prepAndroid' as const,
    icon: Play,
  },
  {
    href: 'https://apps.apple.com/uz/app/prepdrive/id6757515202',
    labelKey: 'topbar.prepIos' as const,
    icon: Apple,
  },
]

export function PrepDriveButton() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isStudent =
    user?.role === 5 ||
    user?.roles?.includes('student') ||
    user?.roles?.includes('student-ended')
  const [open, setOpen] = useState(false)

  if (!isStudent) return null

  return (
    <>
      <button
        type="button"
        title={t('topbar.prepTooltip')}
        onClick={() => setOpen(true)}
        className="hidden h-8 items-center gap-1.5 rounded-lg border border-mist/80 bg-white px-2.5 text-left transition hover:border-[#2e9e5b]/50 hover:bg-fog sm:inline-flex"
      >
        <img
          src={prepDriveLogo}
          alt="PrepDrive"
          className="h-5 w-auto max-w-[88px] shrink-0 object-contain"
          draggable={false}
        />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        hideHeader
        sizeClassName="max-w-[560px]"
        maxHeightClassName="max-h-[min(92svh,720px)]"
        bodyClassName="overflow-y-auto p-0"
        className="rounded-2xl"
      >
        <div className="relative border-b border-mist/60 px-5 pt-5 pb-3 sm:px-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <X className="size-4" aria-hidden />
          </button>
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <h3 className="font-display m-0 text-[20px] font-bold text-deep">
                Prepdrive.uz
              </h3>
              <p className="m-0 mt-1 text-[13px] text-muted">
                {t('topbar.prepTagline')}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-soft px-2.5 py-1 text-[11px] font-bold text-teal">
              <Zap className="size-3.5 fill-current" aria-hidden />
              {t('topbar.prepNew')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 sm:px-6">
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {FEATURES.map(({ key, icon: Icon, tone, iconTone }) => (
              <li key={key} className="flex items-center gap-3 text-[13px] text-deep">
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    tone,
                  )}
                >
                  <Icon className={cn('size-4', iconTone)} aria-hidden />
                </span>
                <span className="leading-snug">{t(key)}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {PLATFORMS.map(({ href, labelKey, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-signal underline decoration-signal/40 decoration-dotted underline-offset-4 transition hover:text-signal-hot"
              >
                <Icon className="size-3.5" aria-hidden />
                {t(labelKey)}
              </a>
            ))}
          </div>

          <div className="rounded-xl border border-signal/25 bg-signal/10 px-3.5 py-3">
            <h4 className="m-0 text-[13px] font-bold text-signal">
              {t('topbar.prepNoteTitle')}
            </h4>
            <p className="m-0 mt-1.5 text-[12.5px] leading-relaxed text-deep">
              <Trans
                i18nKey="topbar.prepNote1"
                components={{ b: <b className="font-semibold" /> }}
              />
            </p>
            <p className="m-0 mt-1.5 text-[12.5px] leading-relaxed text-deep">
              <Trans
                i18nKey="topbar.prepNote2"
                components={{ b: <b className="font-semibold" /> }}
              />
            </p>
          </div>

          <Button
            variant="primary"
            className="h-11 w-full rounded-xl text-[15px] font-semibold shadow-[0_10px_22px_rgba(29,97,122,0.28)]"
            onClick={() =>
              window.open(PREPDRIVE_URL, '_blank', 'noopener,noreferrer')
            }
          >
            {t('topbar.prepCta')}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </Modal>
    </>
  )
}

function AppStoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function GooglePlayIcon({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A0FF" />
          <stop offset="35%" stopColor="#00D964" />
          <stop offset="65%" stopColor="#FFE000" />
          <stop offset="100%" stopColor="#FF3A44" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gid})`}
        d="M3.6 2.2c-.4.2-.6.6-.6 1.1v17.4c0 .5.2.9.6 1.1l9.7-9.8L3.6 2.2zm11.3 6.4 2.3-1.3-9.1-5.2 6.8 6.5zm3.4 1.9-2.6 1.5-2.5-2.4 2.5-2.4 2.6 1.5c.5.3.5.9 0 1.8zM5.8 21.8l9.1-5.2-2.3-1.3-6.8 6.5z"
      />
    </svg>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

type StudentLink = {
  href: string
  labelKey: string
  tipKey: string
  icon: ComponentType<{ className?: string }>
  iconClass: string
  hoverClass: string
}

/** Direktor topbar — Telegram / Instagram (eski Header URL lari). */
export const DIRECTOR_SOCIAL_LINKS: StudentLink[] = [
  {
    href: DIRECTOR_TELEGRAM,
    labelKey: 'topbar.telegram',
    tipKey: 'topbar.joinTelegram',
    icon: TelegramIcon,
    iconClass: 'text-[#20A0E1]',
    hoverClass: 'hover:bg-[#20A0E1]/10',
  },
  {
    href: DIRECTOR_INSTAGRAM,
    labelKey: 'topbar.instagram',
    tipKey: 'topbar.followInstagram',
    icon: InstagramIcon,
    iconClass: 'text-[#E4405F]',
    hoverClass: 'hover:bg-[#E4405F]/10',
  },
]

const STUDENT_LINKS: StudentLink[] = [
  {
    href: 'https://apps.apple.com/uz/app/intalim-students/id6504232456',
    labelKey: 'topbar.appStore',
    tipKey: 'topbar.appStoreQr',
    icon: AppStoreIcon,
    iconClass: 'text-[#12B2FA]',
    hoverClass: 'hover:bg-[#12B2FA]/10',
  },
  {
    href: 'https://play.google.com/store/apps/details?id=uz.intalim&hl=ru',
    labelKey: 'topbar.googlePlay',
    tipKey: 'topbar.googlePlayQr',
    icon: GooglePlayIcon,
    iconClass: '',
    hoverClass: 'hover:bg-teal/10',
  },
  {
    href: 'https://t.me/eavtotalim_student',
    labelKey: 'topbar.telegram',
    tipKey: 'topbar.joinTelegram',
    icon: TelegramIcon,
    iconClass: 'text-[#20A0E1]',
    hoverClass: 'hover:bg-[#20A0E1]/10',
  },
  {
    href: 'https://www.instagram.com/prepdrive_uz',
    labelKey: 'topbar.instagram',
    tipKey: 'topbar.followInstagram',
    icon: InstagramIcon,
    iconClass: 'text-[#E4405F]',
    hoverClass: 'hover:bg-[#E4405F]/10',
  },
]

function StudentAppLinkButton({
  href,
  labelKey,
  tipKey,
  icon: Icon,
  iconClass,
  hoverClass,
}: StudentLink) {
  const { t } = useTranslation()
  const btnRef = useRef<HTMLButtonElement>(null)
  const tipId = useId()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function place() {
    const el = btnRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const tipW = 220
    const left = Math.min(
      Math.max(8, rect.left + rect.width / 2 - tipW / 2),
      window.innerWidth - tipW - 8,
    )
    setPos({ top: rect.bottom + 8, left })
  }

  function show() {
    clearClose()
    place()
    setOpen(true)
  }

  function hideSoon() {
    clearClose()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => {
    if (!open) return
    const onScroll = () => setOpen(false)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  useEffect(() => () => clearClose(), [])

  const label = t(labelKey)

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-describedby={open ? tipId : undefined}
        title={label}
        onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
        onMouseEnter={show}
        onMouseLeave={hideSoon}
        onFocus={show}
        onBlur={hideSoon}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-md transition hover:-translate-y-px active:translate-y-0',
          hoverClass,
        )}
      >
        <Icon className={cn('size-4', iconClass)} />
      </button>

      {open && pos
        ? createPortal(
            <div
              id={tipId}
              role="tooltip"
              onMouseEnter={show}
              onMouseLeave={hideSoon}
              className="fixed z-80 w-[220px] overflow-hidden rounded-2xl border border-mist/80 bg-white p-3 text-center shadow-[0_16px_40px_rgba(15,36,48,0.18)]"
              style={{ top: pos.top, left: pos.left }}
            >
              <p className="m-0 text-[12px] font-semibold text-deep">
                {t(tipKey)}
              </p>
              <StyledQrCode value={href} size={188} alt={label} />
              <p className="m-0 mt-2 text-[11px] text-muted">{label}</p>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export function StudentAppLinks() {
  const { user } = useAuth()
  const isStudent = user?.role === 5 || user?.roles?.includes('student')

  if (!isStudent) return null

  return (
    <div className="hidden h-8 items-center gap-0.5 rounded-lg border border-mist/80 bg-white px-1 shadow-[0_1px_0_rgba(15,36,48,0.04)] md:inline-flex">
      {STUDENT_LINKS.map((link) => (
        <StudentAppLinkButton key={link.href} {...link} />
      ))}
    </div>
  )
}

/** Direktor topbar: Telegram + Instagram (fon / border yo‘q). */
export function DirectorSocialLinks() {
  const { user } = useAuth()
  if (!isDirectorRole(user)) return null

  return (
    <div className="hidden items-center gap-0.5 md:inline-flex">
      {DIRECTOR_SOCIAL_LINKS.map((link) => (
        <StudentAppLinkButton key={link.href} {...link} />
      ))}
    </div>
  )
}
