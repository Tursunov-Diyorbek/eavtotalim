import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  BookOpenCheck,
  Bookmark,
  CalendarClock,
  CalendarPlus,
  Car,
  CalendarRange,
  ClipboardCheck,
  FileWarning,
  GraduationCap,
  Hand,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map,
  Scale,
  School,
  ClipboardList,
  ScrollText,
  Shuffle,
  UserMinus,
  Users,
  UsersRound,
  Wrench,
} from 'lucide-react'
import { routes } from './routes'
import type { PageAccessKey } from './access'

export type NavTone = 'signal' | 'violet' | 'teal' | 'amber' | 'rose' | 'indigo'

export type NavItem = {
  to: string
  page: PageAccessKey
  labelKey: string
  icon: LucideIcon
  tone: NavTone
  /** Faqat direktor menyusida (eski director_links Profil) */
  directorOnly?: boolean
}

/**
 * Ichki URL `item.to` prefiksiga tushmasa — shu yerda.
 * Yangi nested route boshqa pathda bo‘lsa, shu mapga qo‘shing.
 * Oddiy `/cars/show/:id` kabi `to` ostidagi pathlar avtomatik yonadi.
 */
export const NAV_NESTED_MATCH: Partial<Record<PageAccessKey, readonly string[]>> = {
  students: ['/student', '/assigned-limit'],
  groups: ['/group', '/groupdetails', '/final-marks', '/info-final-exam-results'],
  textbooks: ['/textbooks_lessons', '/subjectclasses', '/viewsubject'],
  templateViewStatistic: ['/template-view-statistic-student'],
  reportsMonitoringByStudent: ['/reports-monitoring-by-student-show'],
  autodromeOrganizationGroup: ['/autodrome-organization-students'],
  groupPracticalAttendance: ['/group-practical-attendance-student'],
  autodromeContracts: ['/agreements-show'],
  autodromeAgreement: ['/autodrome-send-agreement', '/autodrome-show-agreement'],
  paymentHistory: ['/paymentstudents'],
  teachers: ['/teacher_create'],
  groupsAttendanceStatistics: ['/students-groups-attendance-statistics'],
  cars: ['/car-road-cost'],
  documents: [
    '/pupil-application',
    '/pagetoview',
    '/group-registration-application',
    '/statements_doc',
    '/voucher',
    '/personalsheet',
    '/mygov-group-approve',
    '/jurnal',
    '/practical-exercise',
    '/group-approved-director',
  ],
}

const NAV_ACTIVE_STORAGE = 'eavt.nav-active'

export function pathMatchesNavPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function prefixesOf(item: Pick<NavItem, 'to' | 'page'>) {
  return [item.to, ...(NAV_NESTED_MATCH[item.page] ?? [])]
}

/** Eng uzun prefiks yutadi — bir vaqtda bitta menyu yonadi. */
export function resolveActiveNavTo(
  pathname: string,
  items: Pick<NavItem, 'to' | 'page'>[],
): string | null {
  let best: { to: string; len: number } | null = null
  for (const item of items) {
    for (const prefix of prefixesOf(item)) {
      if (!pathMatchesNavPrefix(pathname, prefix)) continue
      if (!best || prefix.length > best.len) best = { to: item.to, len: prefix.length }
    }
  }
  return best?.to ?? null
}

export function rememberActiveNav(to: string) {
  try {
    sessionStorage.setItem(NAV_ACTIVE_STORAGE, to)
  } catch {
    /* ignore quota */
  }
}

export function readRememberedNav(): string | null {
  try {
    return sessionStorage.getItem(NAV_ACTIVE_STORAGE)
  } catch {
    return null
  }
}

/** Menyu ranglari: [idle icon, active icon+fon] */
export const NAV_TONE: Record<NavTone, { idle: string; active: string }> = {
  signal: { idle: 'text-signal/70', active: 'bg-signal-soft text-brand-700' },
  violet: { idle: 'text-violet/70', active: 'bg-violet-soft text-violet' },
  teal: { idle: 'text-teal/70', active: 'bg-teal-soft text-teal' },
  amber: { idle: 'text-amber/70', active: 'bg-amber-soft text-amber' },
  rose: { idle: 'text-rose/70', active: 'bg-rose-soft text-rose' },
  indigo: { idle: 'text-indigo/70', active: 'bg-indigo-soft text-indigo' },
}

/**
 * Asosiy menyu — faqat `PAGE_ACCESS[page]` ruxsati bo‘lsa chiqadi.
 * Permission kalitlari: eski `allRoutes` / student_links bilan bir xil.
 */
export const MAIN_NAV: NavItem[] = [
  {
    to: routes.home,
    page: 'dashboard',
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    tone: 'signal',
  },
  {
    to: routes.lessonScheduleCalendar,
    page: 'lessonScheduleCalendar',
    labelKey: 'nav.lessonSchedule',
    icon: CalendarRange,
    tone: 'teal',
  },
  {
    to: routes.problemSituations,
    page: 'problemSituations',
    labelKey: 'nav.problemSituations',
    icon: HelpCircle,
    tone: 'amber',
  },
  {
    to: routes.mentorStudents,
    page: 'mentorStudents',
    labelKey: 'nav.mentorStudents',
    icon: GraduationCap,
    tone: 'violet',
  },
  {
    to: routes.groups,
    page: 'groups',
    labelKey: 'nav.groups',
    icon: Users,
    tone: 'signal',
  },
  {
    to: routes.teacherEdu,
    page: 'teacherEdu',
    labelKey: 'nav.textbooks',
    icon: BookOpen,
    tone: 'teal',
  },
  {
    to: routes.lessonSkips,
    page: 'lessonSkips',
    labelKey: 'nav.lessonSkips',
    icon: UserMinus,
    tone: 'rose',
  },
  {
    to: routes.contentViewStatistic,
    page: 'contentViewStatistic',
    labelKey: 'nav.contentViewStatistic',
    icon: BookOpenCheck,
    tone: 'indigo',
  },
  {
    to: routes.agreements,
    page: 'autodromeContracts',
    labelKey: 'nav.agreements',
    icon: ScrollText,
    tone: 'signal',
  },
  {
    to: routes.autodromeGroupApplications,
    page: 'autodromeGroupApplications',
    labelKey: 'nav.groupApplications',
    icon: ClipboardList,
    tone: 'amber',
  },
  {
    to: routes.autodromeGroups,
    page: 'autodromeGroups',
    labelKey: 'nav.autodromeGroups',
    icon: Users,
    tone: 'teal',
  },
  {
    to: routes.autodromeOrganizationGroup,
    page: 'autodromeOrganizationGroup',
    labelKey: 'autodromeAttendancePage.title',
    icon: CalendarPlus,
    tone: 'signal',
  },
  {
    to: routes.autodromeWeekSchedule,
    page: 'autodromeWeekSchedule',
    labelKey: 'nav.autodromeWeekSchedule',
    icon: CalendarRange,
    tone: 'teal',
  },
  {
    to: routes.groupPracticalAttendance,
    page: 'groupPracticalAttendance',
    labelKey: 'nav.groupPracticalLessons',
    icon: Wrench,
    tone: 'teal',
  },
  {
    to: routes.teacherCars,
    page: 'teacherCars',
    labelKey: 'nav.cars',
    icon: Car,
    tone: 'indigo',
  },
  {
    to: routes.templateViewStatistic,
    page: 'templateViewStatistic',
    labelKey: 'statsPage.templateTestReport',
    icon: ListChecks,
    tone: 'violet',
  },
  {
    to: routes.randomViewStatistic,
    page: 'randomViewStatistic',
    labelKey: 'statsPage.randomTestReport',
    icon: Shuffle,
    tone: 'teal',
  },
  {
    to: routes.topicViewStatistic,
    page: 'topicViewStatistic',
    labelKey: 'statsPage.topicTestReport',
    icon: Bookmark,
    tone: 'indigo',
  },
  {
    to: routes.examViewStatistic,
    page: 'examViewStatistic',
    labelKey: 'statsPage.finalTestReport',
    icon: ClipboardCheck,
    tone: 'amber',
  },
  {
    to: routes.lessons,
    page: 'lessons',
    labelKey: 'nav.lessons',
    icon: BookOpen,
    tone: 'violet',
  },
  {
    to: routes.lessonSchedule,
    page: 'lessonSchedule',
    labelKey: 'nav.lessonSchedule',
    icon: CalendarRange,
    tone: 'teal',
  },
  {
    to: routes.roadSigns,
    page: 'roadSigns',
    labelKey: 'nav.roadSigns',
    icon: Hand,
    tone: 'amber',
  },
  {
    to: routes.penalties,
    page: 'penalties',
    labelKey: 'nav.penalties',
    icon: Scale,
    tone: 'rose',
  },
  {
    to: routes.appeal,
    page: 'appeal',
    labelKey: 'nav.appeal',
    icon: FileWarning,
    tone: 'indigo',
  },
  {
    to: routes.circuitDiagram,
    page: 'circuitDiagram',
    labelKey: 'nav.circuitDiagram',
    icon: Map,
    tone: 'signal',
  },
  {
    to: routes.practicalTraining,
    page: 'practicalTraining',
    labelKey: 'nav.practicalTraining',
    icon: Wrench,
    tone: 'amber',
  },
  {
    to: routes.myAttendance,
    page: 'myAttendance',
    labelKey: 'nav.myAttendance',
    icon: ClipboardCheck,
    tone: 'teal',
  },
  {
    to: routes.missedClasses,
    page: 'missedClasses',
    labelKey: 'nav.missedClasses',
    icon: CalendarClock,
    tone: 'amber',
  },
  {
    to: routes.groupDetails,
    page: 'groupDetails',
    labelKey: 'nav.groupDetails',
    icon: UsersRound,
    tone: 'violet',
  },
  {
    to: routes.activeSchools,
    page: 'activeSchools',
    labelKey: 'nav.activeSchools',
    icon: School,
    tone: 'signal',
  },
  {
    to: routes.students,
    page: 'students',
    labelKey: 'nav.students',
    icon: Users,
    tone: 'violet',
  },
  {
    to: routes.attendance,
    page: 'attendance',
    labelKey: 'nav.attendance',
    icon: ClipboardCheck,
    tone: 'teal',
  },
  {
    to: routes.examTemplates,
    page: 'examTemplates',
    labelKey: 'nav.examTemplates',
    icon: GraduationCap,
    tone: 'amber',
  },
  {
    to: routes.randomTests,
    page: 'randomTests',
    labelKey: 'nav.randomTests',
    icon: Shuffle,
    tone: 'indigo',
  },
  {
    to: routes.allTests,
    page: 'allTests',
    labelKey: 'nav.allTests',
    icon: ListChecks,
    tone: 'signal',
  },
  {
    to: routes.savedTests,
    page: 'savedTests',
    labelKey: 'nav.savedTests',
    icon: Bookmark,
    tone: 'violet',
  },
  {
    to: routes.finalExam,
    page: 'finalExam',
    labelKey: 'nav.finalExam',
    icon: GraduationCap,
    tone: 'rose',
  },
]

export const LOGOUT_ICON = LogOut
