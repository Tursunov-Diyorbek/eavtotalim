import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useMyProfileQuery } from '@/features/dashboard'
import { PATH_PREFIX_FILE, routes } from '@/config'
import { formatDate, fullNameOf } from '@/lib'
import { PageLoading } from '../components/PageChrome'
import { Icons } from '../icons'
import type { MobileScreen } from '../screens'

function fileUrl(path: string | null | undefined) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${PATH_PREFIX_FILE.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`
}

type Props = {
  onOpenTests: () => void
  onOpenProfile: () => void
  onOpenScreen: (screen: MobileScreen) => void
}

export function MobileDashboard({
  onOpenTests,
  onOpenProfile,
  onOpenScreen,
}: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { me, user } = useAuth()
  const { data: profile, isLoading } = useMyProfileQuery()

  if (isLoading) return <PageLoading rows={6} />

  const student = profile?.student
  const group = profile?.group ?? me?.study_info?.group
  const org =
    student?.organization ??
    me?.profession?.organization ??
    me?.study_info?.organization

  const fullName =
    fullNameOf(student) ||
    fullNameOf(me?.profession ?? {}) ||
    user?.username ||
    t('nav.profile')

  const shortName =
    student?.first_name ||
    me?.profession?.first_name ||
    fullName.split(/\s+/)[0] ||
    '—'

  const orgName =
    (typeof org === 'object' && org && 'name' in org
      ? String((org as { name?: string }).name || '')
      : '') || '—'

  const groupName = group?.name || '—'
  const eduType =
    group?.edu_type?.character_name ||
    group?.edu_type?.name_uz ||
    group?.edu_type?.name ||
    ''

  const avatarSrc =
    fileUrl(me?.profession?.image) || fileUrl(user?.image)

  const attendance = profile?.student_personal_attendance
  const attendancePercent = Math.round(
    Number(attendance?.average_attendance_percent || 0),
  )

  const metaLine = [
    groupName ? `${t('common.group', { defaultValue: 'Guruh' })} ${groupName}` : null,
    eduType
      ? `${t('common.category', { defaultValue: 'Toifa' })} ${eduType}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const phone =
    student?.phone ||
    (typeof org === 'object' && org && 'phone' in org
      ? String((org as { phone?: string }).phone || '')
      : '') ||
    me?.profession?.phone ||
    ''

  const inn =
    typeof org === 'object' && org && 'inn' in org
      ? String((org as { inn?: string }).inn || '')
      : ''
  const address =
    typeof org === 'object' && org && 'address' in org
      ? String((org as { address?: string }).address || '')
      : ''

  const startDate = group?.edu_starting_date
    ? formatDate(group.edu_starting_date, i18n.language)
    : ''
  const endDate = group?.edu_ending_date
    ? formatDate(group.edu_ending_date, i18n.language)
    : ''

  const profileFields = [
    { label: t('common.phone', { defaultValue: 'Telefon' }), value: phone },
    {
      label: t('common.organization', { defaultValue: 'Tashkilot' }),
      value: orgName,
    },
    { label: t('common.inn', { defaultValue: 'INN' }), value: inn },
    { label: t('common.address', { defaultValue: 'Manzil' }), value: address },
    {
      label: t('common.group', { defaultValue: 'Guruh' }),
      value: groupName,
    },
    {
      label: t('common.category', { defaultValue: 'Toifa' }),
      value: eduType,
    },
    {
      label: t('dashboard.startDate', { defaultValue: 'Boshlanish' }),
      value: startDate,
    },
    {
      label: t('dashboard.endDate', { defaultValue: 'Tugash' }),
      value: endDate,
    },
  ].filter((f) => f.value && String(f.value).trim() && f.value !== '—')

  const quickNav = [
    {
      key: 'tests',
      label: t('nav.tests', { defaultValue: 'Testlar' }),
      desc: t('examTemplates.description', { defaultValue: 'Shablon va mashq' }),
      Icon: Icons.testsFilled,
      tone: 'navy',
      action: onOpenTests,
    },
    {
      key: 'lessons',
      label: t('nav.lessons'),
      desc: t('lessons.title'),
      Icon: Icons.lessonsFilled,
      tone: 'teal',
      action: () => onOpenScreen('lessons'),
    },
    {
      key: 'schedule',
      label: t('nav.lessonSchedule'),
      desc: t('nav.lessonSchedule'),
      Icon: Icons.scheduleFilled,
      tone: 'blue',
      action: () => {
        onOpenScreen('home')
        navigate(routes.lessonSchedule)
      },
    },
    {
      key: 'attendances',
      label: t('nav.myAttendance'),
      desc: t('nav.myAttendance'),
      Icon: Icons.attendance,
      tone: 'green',
      action: () => {
        onOpenScreen('home')
        navigate(routes.myAttendance)
      },
    },
  ] as const

  const metrics = [
    {
      key: 'total',
      label: t('dashboard.allClasses', { defaultValue: 'Jami darslar' }),
      value: attendance?.all_classes_count || 0,
      tone: 'blue',
    },
    {
      key: 'completed',
      label: t('dashboard.endedClasses', { defaultValue: 'O‘tilgan' }),
      value: attendance?.ended_classes_count || 0,
      tone: 'gold',
    },
    {
      key: 'missed',
      label: t('nav.missedClasses'),
      value: attendance?.absence_count || 0,
      tone: 'red',
      clickable: true,
    },
  ] as const

  return (
    <div className="sm-dash">
      <div className="sm-dash__greet">
        <p className="sm-dash__hello">
          {t('dashboard.welcome', { defaultValue: 'Salom' })}, {shortName}
        </p>
        {metaLine ? <p className="sm-dash__meta">{metaLine}</p> : null}
      </div>

      <button type="button" className="sm-dash__cta" onClick={onOpenTests}>
        <span className="sm-dash__cta-icon">
          <Icons.tests size={18} />
        </span>
        <span className="sm-dash__cta-text">
          <span className="sm-dash__cta-title">
            {t('randomTests.start', { defaultValue: 'Testni boshlash' })}
          </span>
          <span className="sm-dash__cta-sub">
            {t('examTemplates.description', { defaultValue: 'Imtihonga tayyorgarlik' })}
          </span>
        </span>
        <Icons.right size={14} style={{ opacity: 0.7 }} />
      </button>

      <p className="sm-dash__label">
        {t('dashboard.quick', { defaultValue: 'Tezkor' })}
      </p>
      <div className="sm-dash__quick">
        {quickNav.map((item) => {
          const Icon = item.Icon
          return (
            <button
              key={item.key}
              type="button"
              className={`sm-dash__qcard sm-dash__qcard--${item.tone}`}
              onClick={item.action}
            >
              <span className="sm-dash__qcard-icon" aria-hidden>
                <Icon size={20} />
              </span>
              <span className="sm-dash__qcard-body">
                <span className="sm-dash__qcard-title">{item.label}</span>
                <span className="sm-dash__qcard-desc">{item.desc}</span>
              </span>
            </button>
          )
        })}
      </div>

      <p className="sm-dash__label">{t('nav.myAttendance')}</p>
      <div className="sm-dash__panel">
        <div className="sm-dash__panel-head">
          <div className="sm-dash__panel-title">
            <span className="sm-dash__panel-icon sm-dash__panel-icon--blue">
              <Calendar size={16} />
            </span>
            <span>
              {t('dashboard.attendanceIndicator', {
                defaultValue: 'Davomat ko‘rsatkichi',
              })}
            </span>
          </div>
          <button
            type="button"
            className="sm-dash__ghost-btn"
            onClick={() => navigate(routes.missedClasses)}
          >
            {t('common.details', { defaultValue: 'Batafsil' })}
          </button>
        </div>

        <div className="sm-dash__progress">
          <div className="sm-dash__progress-head">
            <span>{t('nav.myAttendance')}</span>
            <strong>{attendancePercent}%</strong>
          </div>
          <div className="sm-dash__progress-track">
            <div
              className="sm-dash__progress-fill"
              style={{ width: `${attendancePercent}%` }}
            />
          </div>
        </div>

        <div className="sm-dash__metrics">
          {metrics.map((m) => {
            const content = (
              <>
                <div className="sm-dash__metric-value">
                  {m.value}
                  <span> {t('common.hour', { defaultValue: 'soat' })}</span>
                </div>
                <div className="sm-dash__metric-label">{m.label}</div>
              </>
            )
            if ('clickable' in m && m.clickable) {
              return (
                <button
                  key={m.key}
                  type="button"
                  className={`sm-dash__metric sm-dash__metric--${m.tone} sm-dash__metric--click`}
                  onClick={() => navigate(routes.missedClasses)}
                >
                  {content}
                </button>
              )
            }
            return (
              <div
                key={m.key}
                className={`sm-dash__metric sm-dash__metric--${m.tone}`}
              >
                {content}
              </div>
            )
          })}
        </div>
      </div>

      <p className="sm-dash__label">{t('nav.profile')}</p>
      <div className="sm-dash__profile">
        <div className="sm-dash__profile-head">
          <div className="sm-dash__avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" />
            ) : (
              <Icons.academic size={18} color="#3d5a6c" />
            )}
          </div>
          <div className="sm-dash__profile-meta">
            <p className="sm-dash__profile-name">{fullName}</p>
            <p className="sm-dash__profile-sub">
              {orgName || metaLine || t('nav.profile')}
            </p>
          </div>
        </div>
        <div className="sm-dash__profile-body">
          {profileFields.length === 0 ? (
            <p className="sm-dash__empty">{t('common.noData')}</p>
          ) : (
            profileFields.map((f) => (
              <div className="sm-dash__field" key={f.label}>
                <span>{f.label}</span>
                <strong>{f.value}</strong>
              </div>
            ))
          )}
          <button
            type="button"
            className="sm-dash__profile-btn"
            onClick={onOpenProfile}
          >
            {t('profile.full', { defaultValue: 'To‘liq profil' })}
          </button>
        </div>
      </div>
    </div>
  )
}
