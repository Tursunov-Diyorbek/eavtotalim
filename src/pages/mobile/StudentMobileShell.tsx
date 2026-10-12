import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROLE_CODE } from '@/config/access'
import { PAGE_ACCESS } from '@/config/access'
import { PATH_PREFIX_FILE, routes } from '@/config'
import { useAuth } from '@/features/auth'
import { useIsMobileViewport } from '@/features/mobile'
import { Tooltip } from '@/components/ui'
import { Icons, TabIcons } from './icons'
import { useSwipeBack } from './hooks/useSwipeBack'
import { usePullToRefresh } from './hooks/usePullToRefresh'
import { SCREENS, TEST_SUB_SCREENS, type MobileScreen } from './screens'
import { MobileDashboard } from './screens/MobileDashboard'
import { MobileLessons } from './screens/MobileLessons'
import { MobileTests } from './screens/MobileTests'
import { MobileTemplateTests } from './screens/MobileTemplateTests'
import { MobileMixedTests } from './screens/MobileMixedTests'
import { MobileAllTests } from './screens/MobileAllTests'
import { MobileSavedTests } from './screens/MobileSavedTests'
import './global.css'

type IconComp = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

type NavItem = {
  screen: MobileScreen
  label: string
  icon: IconComp
  tone: string
  path?: string
}

function fileUrl(path: string | null | undefined) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${PATH_PREFIX_FILE.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`
}

function isTestRelatedPath(pathname: string) {
  const p = (pathname || '').toLowerCase()
  return (
    p.includes('/exam-templates/take') ||
    p.includes('/random-tests/take') ||
    p.includes('/lessons/topic-test') ||
    p.includes('/final-exam/take')
  )
}

function tabFromPath(pathname: string): MobileScreen | null {
  if (!pathname || isTestRelatedPath(pathname)) return null
  if (pathname.startsWith('/lessons')) return SCREENS.lessons
  if (pathname.includes('penalt')) return SCREENS.penalties
  if (pathname.includes('myprofile') || pathname.includes('profile')) {
    return SCREENS.profile
  }
  if (pathname === routes.home || pathname === '/dashboard') return SCREENS.home
  return null
}

const EXTERNAL_BY_SCREEN: Partial<Record<MobileScreen, string>> = {
  lessonSchedule: routes.lessonSchedule,
  groupDetails: routes.groupDetails,
  attendances: routes.myAttendance,
  missedClasses: routes.missedClasses,
  activeSchools: routes.activeSchools,
  practicalPrep: routes.practicalTraining,
  autodromeGuide: routes.circuitDiagram,
  roadSigns: routes.roadSigns,
  penalties: routes.penalties,
  appeal: routes.appeal,
  profile: routes.profile,
}

type Props = { children?: ReactNode }

/**
 * O‘quvchi telefon shell — ≤700px, pastki tab-bar + drawer.
 * Phase-1: home / lessons / tests (+ sub). Qolganlari desktop route.
 */
export function StudentMobileShell({ children }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { me, user, hasPermission } = useAuth()
  const isMobileVp = useIsMobileViewport(700)

  const isHomeRoute =
    location.pathname === routes.home || location.pathname === '/dashboard'
  const isLessonDetail = /^\/lessons\/\d+/.test(location.pathname)
  const isTestRoute = isTestRelatedPath(location.pathname)

  const [screen, setScreen] = useState<MobileScreen>(SCREENS.home)
  const [burgerOpen, setBurgerOpen] = useState(false)
  const [testsOpen, setTestsOpen] = useState(true)

  const MAIN_NAV: NavItem[] = [
    { screen: SCREENS.home, label: t('nav.dashboard', { defaultValue: 'Bosh sahifa' }), icon: Icons.home, tone: 'blue' },
    { screen: SCREENS.lessons, label: t('nav.lessons'), icon: Icons.lessons, tone: 'purple' },
    { screen: SCREENS.lessonSchedule, label: t('nav.lessonSchedule'), icon: Icons.schedule, tone: 'cyan' },
    { screen: SCREENS.groupDetails, label: t('nav.groupDetails'), icon: Icons.group, tone: 'teal' },
    { screen: SCREENS.attendances, label: t('nav.myAttendance'), icon: Icons.attendance, tone: 'green' },
    { screen: SCREENS.missedClasses, label: t('nav.missedClasses'), icon: Icons.missed, tone: 'red' },
    { screen: SCREENS.activeSchools, label: t('nav.activeSchools'), icon: Icons.schools, tone: 'navy' },
    { screen: SCREENS.practicalPrep, label: t('nav.practicalTraining'), icon: Icons.practical, tone: 'orange' },
    { screen: SCREENS.autodromeGuide, label: t('nav.circuitDiagram', { defaultValue: 'Avtodrom' }), icon: Icons.autodrome, tone: 'amber' },
    { screen: SCREENS.roadSigns, label: t('nav.roadSigns'), icon: Icons.roadSigns, tone: 'pink' },
    { screen: SCREENS.penalties, label: t('nav.penalties'), icon: Icons.penalties, tone: 'red' },
    { screen: SCREENS.appeal, label: t('nav.appeal'), icon: Icons.appeal, tone: 'purple' },
  ]

  const TEST_NAV: NavItem[] = [
    {
      screen: SCREENS.templateTests,
      label: t('nav.examTemplates'),
      icon: Icons.templateTests,
      tone: 'blue',
    },
    {
      screen: SCREENS.mixedTests,
      label: t('nav.randomTests'),
      icon: Icons.mixedTests,
      tone: 'purple',
    },
    ...(hasPermission(PAGE_ACCESS.allTests)
      ? [
          {
            screen: SCREENS.allTests,
            label: t('nav.allTests'),
            icon: Icons.allTests,
            tone: 'teal',
          } satisfies NavItem,
        ]
      : []),
    {
      screen: SCREENS.savedTests,
      label: t('nav.savedTests'),
      icon: Icons.savedTests,
      tone: 'amber',
    },
  ]

  useEffect(() => {
    const clear = () => {
      document.body.classList.remove(
        'student-mobile-active',
        'student-mobile-exam',
        'student-mobile-topic-test',
        'student-mobile-subject',
      )
    }
    if (!isMobileVp) {
      clear()
      return clear
    }
    if (isTestRoute) {
      document.body.classList.remove('student-mobile-active', 'student-mobile-topic-test')
      document.body.classList.add('student-mobile-exam')
    } else if (isLessonDetail) {
      document.body.classList.add('student-mobile-active', 'student-mobile-subject')
      document.body.classList.remove('student-mobile-exam', 'student-mobile-topic-test')
    } else {
      document.body.classList.add('student-mobile-active')
      document.body.classList.remove(
        'student-mobile-exam',
        'student-mobile-topic-test',
        'student-mobile-subject',
      )
    }
    return clear
  }, [isMobileVp, isTestRoute, isLessonDetail])

  const openScreen = useCallback(
    (key: MobileScreen) => {
      setBurgerOpen(false)
      const external = EXTERNAL_BY_SCREEN[key]
      if (external) {
        setScreen(SCREENS.home)
        navigate(external)
        return
      }
      setScreen(key)
      if (!isHomeRoute) navigate(routes.home)
    },
    [isHomeRoute, navigate],
  )

  const pathTab = tabFromPath(location.pathname)
  const activeTab = isHomeRoute ? screen : pathTab

  const back = () => setScreen(SCREENS.home)

  const handleSwipeBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 700) return
    if (
      !document.body.classList.contains('student-mobile-active') &&
      !document.body.classList.contains('student-mobile-subject')
    ) {
      return
    }
    if (isTestRoute) return

    if (isLessonDetail) {
      navigate(routes.home)
      setScreen(SCREENS.lessons)
      return
    }

    if (isHomeRoute) {
      if (screen === SCREENS.home) return
      if (TEST_SUB_SCREENS.includes(screen)) {
        setScreen(SCREENS.tests)
        return
      }
      setScreen(SCREENS.home)
      return
    }

    navigate(routes.home)
    setScreen(SCREENS.home)
  }, [isHomeRoute, isLessonDetail, isTestRoute, navigate, screen])

  useSwipeBack(handleSwipeBack, {
    enabled: isMobileVp && !isTestRoute,
  })

  const handlePullRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  const { pull, refreshing: pullRefreshing, ready: pullReady } = usePullToRefresh(
    handlePullRefresh,
    { enabled: isMobileVp && !isTestRoute },
  )

  const renderBody = () => {
    switch (screen) {
      case SCREENS.home:
        return (
          <MobileDashboard
            onOpenTests={() => openScreen(SCREENS.tests)}
            onOpenProfile={() => openScreen(SCREENS.profile)}
            onOpenScreen={openScreen}
          />
        )
      case SCREENS.tests:
        return (
          <MobileTests onBack={back} onOpenScreen={openScreen} />
        )
      case SCREENS.lessons:
        return <MobileLessons onBack={back} />
      case SCREENS.templateTests:
        return (
          <MobileTemplateTests onBack={() => openScreen(SCREENS.tests)} />
        )
      case SCREENS.mixedTests:
        return <MobileMixedTests onBack={() => openScreen(SCREENS.tests)} />
      case SCREENS.allTests:
        if (!hasPermission(PAGE_ACCESS.allTests)) {
          return <MobileTests onBack={back} onOpenScreen={openScreen} />
        }
        return <MobileAllTests onBack={() => openScreen(SCREENS.tests)} />
      case SCREENS.savedTests:
        return <MobileSavedTests onBack={() => openScreen(SCREENS.tests)} />
      default:
        return (
          <MobileDashboard
            onOpenTests={() => openScreen(SCREENS.tests)}
            onOpenProfile={() => openScreen(SCREENS.profile)}
            onOpenScreen={openScreen}
          />
        )
    }
  }

  const showChrome =
    screen === SCREENS.home && isHomeRoute && !isLessonDetail
  const showFullShell = isMobileVp && (isHomeRoute || isLessonDetail)

  const initial = (
    me?.profession?.first_name ||
    user?.username ||
    'O'
  )
    .trim()
    .charAt(0)
    .toUpperCase()
  const avatarSrc = fileUrl(me?.profession?.image) || fileUrl(user?.image)

  const renderTabBar = (floating = false) => (
    <nav className={`sm-tabbar${floating ? ' sm-tabbar--floating' : ''}`}>
      <div className="sm-tabbar__waves" aria-hidden="true">
        <svg
          className="sm-tabbar__base"
          viewBox="0 0 360 120"
          preserveAspectRatio="none"
        >
          <path
            className="sm-tabbar__base-fill"
            d="M0 28 C45 10 75 42 120 24 C165 6 195 38 240 22 C285 6 320 34 360 18 L360 120 L0 120 Z"
          />
        </svg>
      </div>
      <button
        type="button"
        className={`sm-tab sm-tab--tilt-a${activeTab === SCREENS.home ? ' sm-tab--active' : ''}`}
        onClick={() => openScreen(SCREENS.home)}
      >
        <span className="sm-tab__ico">
          <TabIcons.home size={20} />
        </span>
        <span className="sm-tab__label">
          {t('nav.dashboard', { defaultValue: 'Bosh' })}
        </span>
      </button>
      <button
        type="button"
        className={`sm-tab sm-tab--tilt-b${activeTab === SCREENS.lessons ? ' sm-tab--active' : ''}`}
        onClick={() => openScreen(SCREENS.lessons)}
      >
        <span className="sm-tab__ico">
          <TabIcons.lessons size={20} />
        </span>
        <span className="sm-tab__label">{t('nav.lessons')}</span>
      </button>
      <div className="sm-fab-wrap">
        <button
          type="button"
          className={`sm-fab${activeTab === SCREENS.tests || TEST_SUB_SCREENS.includes(screen) ? ' sm-fab--active' : ''}`}
          aria-label={t('nav.tests', { defaultValue: 'Testlar' })}
          onClick={() => openScreen(SCREENS.tests)}
        >
          <span className="sm-fab__ico">
            <TabIcons.tests size={22} />
          </span>
        </button>
        <span className="sm-fab__caption">
          {t('nav.tests', { defaultValue: 'Testlar' })}
        </span>
      </div>
      <button
        type="button"
        className={`sm-tab sm-tab--tilt-a${activeTab === SCREENS.penalties ? ' sm-tab--active' : ''}`}
        onClick={() => openScreen(SCREENS.penalties)}
      >
        <span className="sm-tab__ico">
          <TabIcons.penalties size={20} />
        </span>
        <span className="sm-tab__label">{t('nav.penalties')}</span>
      </button>
      <button
        type="button"
        className={`sm-tab sm-tab--tilt-b${activeTab === SCREENS.profile ? ' sm-tab--active' : ''}`}
        onClick={() => openScreen(SCREENS.profile)}
      >
        <span className="sm-tab__ico">
          <TabIcons.profile size={20} />
        </span>
        <span className="sm-tab__label">{t('nav.profile')}</span>
      </button>
    </nav>
  )

  if (!isMobileVp) return <>{children}</>

  return (
    <>
      {pull > 0 || pullRefreshing ? (
        <div
          className={`sm-ptr${pullReady || pullRefreshing ? ' sm-ptr--ready' : ''}`}
          style={{ height: Math.max(pull, pullRefreshing ? 56 : 0) }}
          aria-hidden
        >
          <span className="sm-ptr__label">
            {pullRefreshing
              ? t('common.refreshing', { defaultValue: 'Yangilanmoqda…' })
              : pullReady
                ? t('common.releaseRefresh', { defaultValue: 'Yangilash uchun qo‘yib yuboring' })
                : t('common.pullRefresh', { defaultValue: 'Yangilash uchun torting' })}
          </span>
        </div>
      ) : null}

      {showFullShell ? (
        <div className="student-mobile-root">
          <div className="sm-shell">
            {showChrome ? (
              <header className="sm-header">
                <button
                  type="button"
                  className="sm-icon-btn"
                  aria-label={t('common.menu', { defaultValue: 'Menyu' })}
                  onClick={() => setBurgerOpen(true)}
                >
                  <Icons.menu size={20} />
                </button>

                <div className="sm-header__brand" aria-label="Eavtota'lim">
                  <span className="sm-header__logo-word">
                    Ea
                    <span className="sm-header__logo-check" aria-hidden>
                      ✓
                    </span>
                    tota&apos;lim
                  </span>
                </div>

                <div className="sm-header__actions">
                  <button
                    type="button"
                    className="sm-avatar-btn"
                    aria-label={t('nav.profile')}
                    onClick={() => openScreen(SCREENS.profile)}
                  >
                    {avatarSrc ? <img src={avatarSrc} alt="" /> : initial}
                  </button>
                </div>
              </header>
            ) : null}

            <main
              className={`sm-content${isLessonDetail ? ' sm-content--lesson' : ''}`}
            >
              {isLessonDetail ? children : renderBody()}
            </main>
            {renderTabBar(false)}
          </div>
        </div>
      ) : (
        <>
          <div className="student-mobile-outlet">{children}</div>
          {!isTestRoute ? renderTabBar(true) : null}
        </>
      )}

      {burgerOpen ? (
        <div className="sm-drawer-root" role="dialog" aria-modal="true">
          <button
            type="button"
            className="sm-drawer-backdrop"
            aria-label={t('common.close')}
            onClick={() => setBurgerOpen(false)}
          />
          <aside className="sm-drawer sm-drawer--css">
            <div className="sm-drawer__head">
              <strong>{t('common.menu', { defaultValue: 'Menyu' })}</strong>
              <button
                type="button"
                className="sm-icon-btn"
                onClick={() => setBurgerOpen(false)}
                aria-label={t('common.close')}
              >
                <Icons.close size={18} />
              </button>
            </div>
            <div className="sm-drawer__body">
              {MAIN_NAV.map((item) => {
                const Icon = item.icon
                return (
                  <Tooltip
                    key={item.screen}
                    content={item.label}
                    side="right"
                    className="!flex w-full min-w-0"
                  >
                    <button
                      type="button"
                      className={`sm-nav-item${screen === item.screen ? ' sm-nav-item--active' : ''}`}
                      onClick={() => openScreen(item.screen)}
                    >
                      <span
                        className={`sm-nav-item__icon sm-nav-item__icon--${item.tone}`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="sm-nav-item__label">{item.label}</span>
                    </button>
                  </Tooltip>
                )
              })}

              <button
                type="button"
                className="sm-nav-section"
                onClick={() => setTestsOpen((v) => !v)}
              >
                {t('nav.tests', { defaultValue: 'Testlar' })}
                {testsOpen ? <Icons.up size={14} /> : <Icons.down size={14} />}
              </button>

              {testsOpen
                ? TEST_NAV.map((item) => {
                    const Icon = item.icon
                    return (
                      <Tooltip
                        key={item.screen}
                        content={item.label}
                        side="right"
                        className="!flex w-full min-w-0"
                      >
                        <button
                          type="button"
                          className={`sm-nav-item${
                            screen === item.screen ? ' sm-nav-item--active' : ''
                          }`}
                          onClick={() => openScreen(item.screen)}
                        >
                          <span
                            className={`sm-nav-item__icon sm-nav-item__icon--${item.tone}`}
                          >
                            <Icon size={16} />
                          </span>
                          <span className="sm-nav-item__label">{item.label}</span>
                        </button>
                      </Tooltip>
                    )
                  })
                : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}

/** AppShell: faqat student + ≤700 */
export function useStudentMobileShellActive() {
  const isMobile = useIsMobileViewport(700)
  const { user } = useAuth()
  const isStudent =
    user?.role === ROLE_CODE.STUDENT || user?.roles?.includes('student')
  return isMobile && isStudent
}
