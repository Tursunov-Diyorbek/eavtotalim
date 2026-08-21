import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Car } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  DashboardProfileSkeleton,
  SafeImage,
} from '@/components/ui'
import { PATH_PREFIX_FILE_HOST, getRoleMeta, TONE_CLASS } from '@/config'
import { useAuth } from '@/features/auth'
import { useMyProfileQuery } from '@/features/dashboard'
import { AutodromeCameraStatusCard } from './AutodromeCameraStatusCard'
import { AutodromeEnrollmentStatusCard } from './AutodromeEnrollmentStatusCard'
import {
  cn,
  formatDate,
  formatDateTime,
  fullNameOf,
} from '@/lib'
import type { MeLangName } from '@/types'

function buildImageUrl(image: string | null | undefined): string | null {
  if (!image) return null
  if (/^https?:\/\//i.test(image)) return image
  return `${PATH_PREFIX_FILE_HOST.replace(/\/$/, '')}/${image.replace(/^\//, '')}`
}

function localizedName(
  lang: MeLangName | null | undefined,
  fallback: string | null | undefined,
  locale: string,
): string | null {
  if (!lang && !fallback) return null
  if (locale === 'kiril' && lang?.kiril) return lang.kiril
  if (locale === 'ru' && lang?.ru) return lang.ru
  if (lang?.uz) return lang.uz
  return fallback ?? null
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1 text-[12px] leading-snug">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-deep">
        {value ?? '—'}
      </dd>
    </div>
  )
}

export function StudentDashboard() {
  const { t, i18n } = useTranslation()
  const { me, user, loading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useMyProfileQuery()
  const bootLoading = loading && !me
  const showProfileSkeleton = bootLoading || (profileLoading && !profile)

  const profession = me?.profession ?? null
  const study = me?.study_info ?? null
  const org = profession?.organization ?? null
  const roleMeta = getRoleMeta(user?.role)
  const roles = user?.roles ?? []
  const cars = study?.cars ?? []
  const eduCategory =
    profile?.group?.edu_type?.character_name ||
    profile?.group?.edu_type?.name_uz ||
    profile?.group?.edu_type?.name ||
    null

  const displayName =
    fullNameOf(profession) ??
    (loading && !user ? t('common.loading') : (user?.username ?? '—'))

  const avatarUrl =
    buildImageUrl(profession?.image) ?? buildImageUrl(user?.image)
  const lastSeen = formatDateTime(user?.last_seen, i18n.language)
  const isOnline = user?.online === 1
  const groupStart = formatDate(study?.group?.edu_starting_date, i18n.language)
  const groupEnd = formatDate(study?.group?.edu_ending_date, i18n.language)
  const birthday = formatDate(profession?.birthday, i18n.language)
  const passportDate = formatDate(profession?.passport_given_date, i18n.language)
  const agreementName = org?.last_agreement?.agreement_type?.name_uz

  const addressShort =
    [
      study?.organization?.address?.region,
      study?.organization?.address?.area,
    ]
      .filter(Boolean)
      .join(' ') ||
    [
      localizedName(org?.region?.lang, org?.region?.name, i18n.language),
      localizedName(org?.area?.lang, org?.area?.name, i18n.language),
    ]
      .filter(Boolean)
      .join(' ') ||
    profession?.address ||
    null

  const orgAddress =
    study?.organization?.address?.details || org?.address || addressShort

  const passport =
    profession?.passport_seria && profession?.passport_number
      ? `${profession.passport_seria} ${profession.passport_number}`
      : null

  return (
    <>
      <Header
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      <main className="flex-1 space-y-2.5 p-3 sm:p-4">
        {showProfileSkeleton ? (
          <DashboardProfileSkeleton />
        ) : (
          <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* Chap: profil + tashkilot — doim birinchi */}
          <section className="overflow-hidden rounded-xl border border-mist/70 bg-white">
            <div className="profile-hero grid grid-cols-[92px_minmax(0,1fr)] items-stretch gap-3 p-3 sm:grid-cols-[110px_minmax(0,1fr)]">
              <div className="relative min-h-full">
                <SafeImage
                  src={avatarUrl}
                  alt={displayName}
                  size="lg"
                  className="h-full min-h-30 w-full rounded-lg ring-1 ring-mist/80"
                />
                <span
                  className={cn(
                    'absolute right-1 bottom-1 z-10 size-2.5 rounded-full border-2 border-white',
                    isOnline ? 'bg-teal' : 'bg-mist',
                  )}
                />
              </div>

              <div className="min-w-0">
                <h3 className="font-display text-[15px] leading-snug font-semibold text-deep uppercase">
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
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="rounded bg-indigo-soft px-1.5 py-0.5 text-[10px] font-medium text-indigo"
                    >
                      {role}
                    </span>
                  ))}
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-medium',
                      isOnline ? 'bg-teal-soft text-teal' : 'bg-fog text-muted',
                    )}
                  >
                    {isOnline ? t('dashboard.online') : t('dashboard.offline')}
                  </span>
                  {agreementName ? (
                    <span className="rounded bg-amber-soft px-1.5 py-0.5 text-[10px] font-semibold text-amber">
                      {agreementName}
                    </span>
                  ) : null}
                </div>

                <dl className="mt-2 border-t border-mist/50 pt-1.5">
                  <Row label={t('dashboard.group')} value={study?.group?.name} />
                  <Row
                    label={t('dashboard.eduCategory')}
                    value={eduCategory}
                  />
                  <Row
                    label={t('dashboard.lessonStart')}
                    value={groupStart}
                  />
                  <Row label={t('dashboard.lessonEnd')} value={groupEnd} />
                  <Row label={t('dashboard.address')} value={addressShort} />
                  <Row
                    label={t('dashboard.phone')}
                    value={
                      <span className="inline-flex items-center gap-1">
                        {profession?.phone || user?.phone || '—'}
                        {user?.phone_verified_at ? (
                          <span className="rounded bg-teal-soft px-1 text-[9px] font-semibold text-teal">
                            {t('dashboard.verified')}
                          </span>
                        ) : null}
                      </span>
                    }
                  />
                </dl>
              </div>
            </div>

            <div className="border-t border-mist/60 px-3 py-2.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-deep">
                <Building2 className="size-3.5 text-signal" aria-hidden />
                {t('dashboard.orgInfo')}
              </p>
              <dl>
                <Row
                  label={t('dashboard.orgName')}
                  value={org?.name || study?.organization?.name}
                />
                <Row
                  label={t('dashboard.inn')}
                  value={org?.inn || study?.organization?.inn}
                />
                <Row label={t('dashboard.accountNumber')} value={org?.hr} />
                <Row label={t('dashboard.address')} value={orgAddress} />
                <Row label={t('dashboard.phone')} value={org?.phone} />
              </dl>
            </div>
          </section>

          {/* O‘ng: meta */}
          <div className="flex flex-col gap-2.5">
            <section className="rounded-xl border border-mist/70 bg-white px-3 py-2.5">
              <dl>
                <Row
                  label={t('dashboard.userId')}
                  value={user?.id != null ? `#${user.id}` : '—'}
                />
                <Row label={t('dashboard.lastSeen')} value={lastSeen} />
                <Row
                  label={t('dashboard.practicalStrict')}
                  value={
                    me?.is_practical_attendance_strict
                      ? t('dashboard.yes')
                      : t('dashboard.no')
                  }
                />
                <Row label={t('dashboard.birthday')} value={birthday} />
                <Row label={t('dashboard.passport')} value={passport} />
                <Row label={t('dashboard.passportDate')} value={passportDate} />
                <Row
                  label={t('dashboard.passportPlace')}
                  value={profession?.passport_given_place}
                />
                <Row
                  label={t('dashboard.professionId')}
                  value={profession?.id != null ? `#${profession.id}` : '—'}
                />
                <Row
                  label={t('dashboard.autodromeName')}
                  value={study?.autodrome?.name}
                />
                <Row
                  label={t('dashboard.schoolType')}
                  value={org?.school_type?.name}
                />
                <Row label={t('dashboard.contract')} value={org?.contract} />
                <Row
                  label={t('dashboard.license')}
                  value={org?.license?.number}
                />
              </dl>
            </section>

            {cars.length > 0 ? (
              <section className="rounded-xl border border-mist/70 bg-white px-3 py-2">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-deep">
                  <Car className="size-3.5 text-signal" aria-hidden />
                  {t('dashboard.cars')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cars.map((car) => (
                    <span
                      key={car.id}
                      className="rounded-md bg-fog px-2 py-1 text-[11px] font-medium text-deep"
                    >
                      {car.name} · {car.number}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
          </div>
        )}

        <AutodromeEnrollmentStatusCard />
        <AutodromeCameraStatusCard />
      </main>
    </>
  )
}
