import { useTranslation } from 'react-i18next'
import { Building2, MapPin, Phone } from 'lucide-react'
import { Panel, SafeImage } from '@/components/ui'
import { PATH_PREFIX_FILE_HOST, getRoleMeta, TONE_CLASS } from '@/config'
import { cn, formatDate, formatDateTime, fullNameOf } from '@/lib'
import type { MeData, MyProfileData } from '@/types'
import type { MeProfession, MeUser } from '@/types/auth'

function buildImageUrl(image: string | null | undefined): string | null {
  if (!image) return null
  if (/^https?:\/\//i.test(image)) return image
  return `${PATH_PREFIX_FILE_HOST.replace(/\/$/, '')}/${image.replace(/^\//, '')}`
}

function profileAddress(orgAddress: string | null | undefined): string | null {
  if (!orgAddress) return null
  const parts = orgAddress.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 3) return orgAddress
  return parts.slice(0, 3).join(' ')
}

function Meta({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="truncate text-[11px] font-semibold text-deep">
        {value || '—'}
      </p>
    </div>
  )
}

type Props = {
  profile: MyProfileData | null | undefined
  me: MeData | null | undefined
  user: MeUser | null | undefined
}

/** Gorizontal profil bandi — 4×4 ramkali foto, bo‘sh joy yo‘q. */
export function StudentDashboardProfileCard({ profile, me, user }: Props) {
  const { t, i18n } = useTranslation()
  const profession = me?.profession ?? null
  const study = me?.study_info ?? null
  const student = profile?.student
  const group = profile?.group ?? study?.group ?? null
  const org =
    student?.organization ??
    profession?.organization ??
    (study?.organization
      ? {
          name: study.organization.name,
          inn: study.organization.inn,
          address: study.organization.address?.details,
        }
      : null)

  const profileGroup = profile?.group
  const eduCategory =
    profileGroup?.edu_type?.character_name ||
    profileGroup?.edu_type?.name_uz ||
    profileGroup?.edu_type?.name ||
    null

  const displayName =
    fullNameOf(student as MeProfession | null) ??
    fullNameOf(profession) ??
    user?.username ??
    '—'

  const avatarUrl =
    buildImageUrl(profession?.image) ?? buildImageUrl(user?.image)
  const roleMeta = getRoleMeta(user?.role)
  const isOnline = user?.online === 1
  const lastSeenTime = formatDateTime(user?.last_seen, i18n.language)
  const presenceLabel = isOnline
    ? t('dashboard.online')
    : lastSeenTime
      ? t('dashboard.lastSeenAt', { time: lastSeenTime })
      : t('dashboard.offline')
  const phone =
    student?.phone || profession?.phone || user?.phone || null
  const address =
    profileAddress(student?.organization?.address) ||
    profileAddress(org?.address) ||
    student?.address ||
    profession?.address ||
    null

  const orgName =
    (org && 'name_uz' in org ? org.name_uz : null) ||
    org?.name ||
    study?.organization?.name

  const orgInn = org?.inn ?? study?.organization?.inn ?? null
  const orgHr =
    org && 'hr' in org && typeof org.hr === 'string' ? org.hr : null
  const orgAddressFull =
    (org && typeof org.address === 'string' ? org.address : null) ||
    study?.organization?.address?.details ||
    null
  const orgPhone =
    org && 'phone' in org && typeof org.phone === 'string' ? org.phone : null

  const orgRows = [
    { key: 'name', label: t('dashboard.orgName'), value: orgName },
    { key: 'inn', label: t('dashboard.inn'), value: orgInn },
    { key: 'hr', label: t('dashboard.accountNumber'), value: orgHr },
    { key: 'address', label: t('dashboard.address'), value: orgAddressFull },
    { key: 'phone', label: t('dashboard.phone'), value: orgPhone },
  ] as const

  return (
    <Panel padding="none" className="overflow-hidden">
      <div className="profile-hero grid gap-3 p-2.5 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.1fr)] sm:items-start">
        {/* Ramka padding bilan — absolute inset matnni yopmasin */}
        <div className="relative mx-auto w-fit shrink-0 sm:mx-0 sm:mt-0.5">
          <div className="rounded-2xl bg-linear-to-br from-signal via-teal to-signal/70 p-[3px]">
            <div className="rounded-[13px] bg-white p-px">
              <SafeImage
                src={avatarUrl}
                alt={displayName}
                size="lg"
                className="size-28 rounded-xl shadow-[0_4px_14px_rgba(15,36,48,0.12)]"
              />
            </div>
          </div>
          <span
            className={cn(
              'absolute right-1.5 bottom-1.5 z-10 size-3 rounded-full border-2 border-white shadow-sm',
              isOnline ? 'bg-teal' : 'bg-mist',
            )}
            title={presenceLabel}
          />
        </div>

        <div className="relative z-10 min-w-0 space-y-2">
          <div>
            <h3 className="font-display text-[14px] leading-snug font-semibold text-deep uppercase">
              {displayName}
            </h3>
            <div className="mt-1 flex flex-wrap gap-1">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                  TONE_CLASS[roleMeta.tone],
                )}
              >
                {t(roleMeta.labelKey)}
              </span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-medium',
                  isOnline ? 'bg-teal-soft text-teal' : 'bg-fog text-muted',
                )}
                title={
                  isOnline
                    ? t('dashboard.online')
                    : t('dashboard.lastSeen')
                }
              >
                {presenceLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
            <Meta label={t('dashboard.group')} value={group?.name ?? null} />
            <Meta label={t('dashboard.eduCategory')} value={eduCategory} />
            <Meta
              label={t('dashboard.lessonStart')}
              value={formatDate(group?.edu_starting_date, i18n.language)}
            />
            <Meta
              label={t('dashboard.lessonEnd')}
              value={formatDate(group?.edu_ending_date, i18n.language)}
            />
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
            {address ? (
              <p className="flex min-w-0 items-center gap-1 text-muted">
                <MapPin className="size-3 shrink-0 text-signal" aria-hidden />
                <span className="truncate text-deep">{address}</span>
              </p>
            ) : null}
            {phone ? (
              <p className="flex items-center gap-1 text-muted">
                <Phone className="size-3 shrink-0 text-signal" aria-hidden />
                <span className="font-medium text-deep">{phone}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 self-stretch rounded-lg border border-mist/50 bg-white/80 p-2.5">
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            <Building2 className="size-3 text-signal" aria-hidden />
            {t('dashboard.orgInfo')}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {orgRows.map((row) => (
              <div key={row.key} className="min-w-0">
                <dt className="text-[9px] font-medium uppercase tracking-wide text-muted">
                  {row.label}
                </dt>
                <dd className="break-words text-[11px] leading-snug font-semibold text-deep">
                  {row.value || '—'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Panel>
  )
}
