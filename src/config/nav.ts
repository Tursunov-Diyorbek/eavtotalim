import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Bookmark,
  CalendarClock,
  CalendarRange,
  ClipboardCheck,
  FileWarning,
  GraduationCap,
  Hand,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map,
  Scale,
  School,
  Shuffle,
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
