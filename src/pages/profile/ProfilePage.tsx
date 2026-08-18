import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  DashboardProfileSkeleton,
  Notification,
  Panel,
} from '@/components/ui'
import { PATH_PREFIX_FILE_HOST, getRoleMeta, TONE_CLASS } from '@/config'
import { useAuth } from '@/features/auth'
import { useMyProfileQuery } from '@/features/dashboard'
import {
  cn,
  formatDate,
  formatDateTime,
  fullNameOf,
  initialsOf,
} from '@/lib'

function buildImageUrl(image: string | null | undefined): string | null {
  if (!image) return null
  if (/^https?:\/\//i.test(image)) return image
  return `${PATH_PREFIX_FILE_HOST.replace(/\/$/, '')}/${image.replace(/^\//, '')}`
}

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { me, user, loading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useMyProfileQuery()
  const bootLoading = loading && !me
  const showSkeleton = bootLoading || (profileLoading && !profile)

  const profession = me?.profession ?? null
  const study = me?.study_info ?? null
  const org = profession?.organization ?? null
  const roleMeta = getRoleMeta(user?.role)
  const displayName =
    fullNameOf(profession) ?? user?.username ?? '—'
  const avatarUrl =
    buildImageUrl(profession?.image) ?? buildImageUrl(user?.image)
  const lastSeen = formatDateTime(user?.last_seen, i18n.language)
  const birthday = formatDate(profession?.birthday, i18n.language)
  const passport =
    profession?.passport_seria && profession?.passport_number
      ? `${profession.passport_seria} ${profession.passport_number}`
      : null
  const groupName = study?.group?.name || profile?.group?.name || null
  const eduCategory =
    profile?.group?.edu_type?.character_name ||
    profile?.group?.edu_type?.name_uz ||
    profile?.group?.edu_type?.name ||
    null

  return (
    <>
      <Header title={t('settings.profile')} description={t('settings.profileDesc')} />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {showSkeleton ? (
          <DashboardProfileSkeleton />
        ) : (
          <>
            <Panel className="overflow-hidden">
              <div className="profile-hero grid grid-cols-[92px_minmax(0,1fr)] items-stretch gap-3 p-4 sm:grid-cols-[110px_minmax(0,1fr)]">
                <div className="relative min-h-full">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full rounded-lg object-cover object-top ring-1 ring-mist/80"
                    />
                  ) : (
                    <div className="font-display flex h-full min-h-30 w-full items-center justify-center rounded-lg bg-signal text-lg font-semibold text-white">
                      {initialsOf(displayName)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display m-0 text-[15px] font-semibold text-deep uppercase">
                    {displayName}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                        TONE_CLASS[roleMeta.tone],
                      )}
                    >
                      {t(roleMeta.labelKey)}
                    </span>
                  </div>
                  <dl className="mt-3 grid gap-1.5 text-[13px] sm:grid-cols-2">
                    <div>
                      <dt className="text-muted">{t('dashboard.phone')}</dt>
                      <dd className="m-0 font-medium text-deep">
                        {profession?.phone || user?.phone || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t('dashboard.userId')}</dt>
                      <dd className="m-0 font-medium text-deep">
                        {user?.id ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t('dashboard.birthday')}</dt>
                      <dd className="m-0 font-medium text-deep">
                        {birthday || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t('dashboard.passport')}</dt>
                      <dd className="m-0 font-medium text-deep">
                        {passport || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t('dashboard.lastSeen')}</dt>
                      <dd className="m-0 font-medium text-deep">
                        {lastSeen || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t('dashboard.group')}</dt>
                      <dd className="m-0 font-medium text-deep">
                        {groupName || '—'}
                        {eduCategory ? ` · ${eduCategory}` : ''}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted">{t('dashboard.orgName')}</dt>
                      <dd className="m-0 font-medium text-deep">
                        {org?.name_uz || study?.organization?.name || '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Panel>

            <Notification tone="info">{t('settings.profileHint')}</Notification>
          </>
        )}
      </main>
    </>
  )
}
