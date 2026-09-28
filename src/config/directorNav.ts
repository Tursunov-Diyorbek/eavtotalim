import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Award,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarPlus,
  Camera,
  Car,
  CircleAlert,
  CircleHelp,
  Clapperboard,
  ClipboardList,
  ExternalLink,
  FileText,
  FileWarning,
  FilePlus2,
  GraduationCap,
  HelpCircle,
  House,
  IdCard,
  LayoutDashboard,
  ListChecks,
  Map,
  PieChart,
  Presentation,
  ScanFace,
  Server,
  Truck,
  Undo2,
  User,
  UserX,
  Users,
  UsersRound,
  Video,
  Wallet,
  Wrench,
} from 'lucide-react'
import type { PageAccessKey } from './access'
import type { NavItem, NavTone } from './nav'
import { routes } from './routes'

export type DirectorNavSection = {
  id: string
  labelKey: string
  items: NavItem[]
}

function item(
  page: PageAccessKey,
  to: string,
  labelKey: string,
  icon: LucideIcon,
  tone: NavTone,
): NavItem {
  return { page, to, labelKey, icon, tone }
}

/** Eski director_links — bo‘limlangan direktor menyusi. */
export const DIRECTOR_NAV_SECTIONS: DirectorNavSection[] = [
  {
    id: 'main',
    labelKey: '',
    items: [
      item('dashboard', routes.home, 'nav.dashboard', LayoutDashboard, 'signal'),
      item('directorEditData', routes.directorEditData, 'nav.profile', User, 'rose'),
    ],
  },
  {
    id: 'remote',
    labelKey: 'nav.sectionRemote',
    items: [
      item('directorApplications', routes.directorApplications, 'nav.directorApplications', FilePlus2, 'violet'),
      item('onlineApplications', routes.onlineApplications, 'nav.onlineApplications', BookOpen, 'violet'),
      item('problemSituations', routes.problemSituations, 'nav.problemSituations', HelpCircle, 'amber'),
      item('notificationsService', routes.notificationsService, 'nav.notificationsService', Bell, 'teal'),
      item('myGovApplication', routes.myGovApplication, 'nav.myGovApplication', FileText, 'indigo'),
      item('directorAppeals', routes.directorAppeals, 'nav.directorAppeals', FileWarning, 'rose'),
    ],
  },
  {
    id: 'education',
    labelKey: 'nav.sectionEducation',
    items: [
      item('students', routes.students, 'nav.students', GraduationCap, 'violet'),
      item('groups', routes.groups, 'nav.groups', Users, 'signal'),
      item('textbooks', routes.textbooks, 'nav.textbooks', BookOpen, 'teal'),
      item('tuitionFees', routes.tuitionFees, 'nav.tuitionFees', Wallet, 'amber'),
      item('contentViewStatistic', routes.contentViewStatistic, 'nav.contentViewStatistic', BookOpen, 'indigo'),
      item('templateViewStatistic', routes.templateViewStatistic, 'nav.templateViewStatistic', ListChecks, 'violet'),
      item('reportsMonitoringByStudent', routes.reportsMonitoringByStudent, 'nav.reportsMonitoringByStudent', ClipboardList, 'rose'),
      item('extraLessons', routes.extraLessons, 'nav.extraLessons', BookOpen, 'signal'),
    ],
  },
  {
    id: 'attendance',
    labelKey: 'nav.sectionAttendance',
    items: [
      item('cameraControlAttendance', routes.cameraControlAttendance, 'nav.cameraControlAttendance', Camera, 'teal'),
      item('faceControlWarnings', routes.faceControlWarnings, 'nav.faceControlWarnings', ScanFace, 'rose'),
      item('monitoringCameraDaily', routes.monitoringCameraDaily, 'nav.monitoringCameraDaily', Video, 'violet'),
      item('absenceReasonIndex', routes.absenceReasonIndex, 'nav.absenceReasonIndex', UserX, 'amber'),
      item('reasonStudentAbsence', routes.reasonStudentAbsence, 'nav.reasonStudentAbsence', UserX, 'indigo'),
      item('autodromeOrganizationGroup', routes.autodromeOrganizationGroup, 'nav.autodromeOrganizationGroup', CalendarPlus, 'signal'),
      item('groupPracticalAttendance', routes.groupPracticalAttendance, 'nav.groupPracticalAttendance', Wrench, 'teal'),
    ],
  },
  {
    id: 'exam',
    labelKey: 'nav.sectionExam',
    items: [
      item('infoExamResults', routes.infoExamResults, 'nav.infoExamResults', FileText, 'amber'),
      item('organizationFinalExam', routes.organizationFinalExam, 'nav.organizationFinalExam', GraduationCap, 'rose'),
    ],
  },
  {
    id: 'autodrome',
    labelKey: 'nav.sectionAutodrome',
    items: [
      item('autodromeAgreement', routes.autodromeAgreement, 'nav.autodromeAgreement', Map, 'signal'),
    ],
  },
  {
    id: 'finance',
    labelKey: 'nav.sectionFinance',
    items: [
      item('expenses', routes.expenses, 'nav.expenses', Wallet, 'amber'),
      item('paymentDashboard', routes.paymentDashboard, 'nav.paymentDashboard', Wallet, 'teal'),
      item('paymentHistory', routes.paymentHistory, 'nav.paymentHistory', ArrowLeftRight, 'violet'),
      item('debtors', routes.debtors, 'nav.debtors', CircleAlert, 'rose'),
      item('refund', routes.refund, 'nav.refund', Undo2, 'indigo'),
    ],
  },
  {
    id: 'print',
    labelKey: 'nav.sectionPrint',
    items: [
      item('documents', routes.documents, 'nav.documents', Server, 'signal'),
      item('finalMarkGroups', routes.finalMarkGroups, 'nav.finalMarkGroups', Award, 'amber'),
    ],
  },
  {
    id: 'users',
    labelKey: 'nav.sectionUsers',
    items: [
      item('moderators', routes.moderators, 'nav.moderators', UsersRound, 'violet'),
      item('accountants', routes.accountants, 'nav.accountants', IdCard, 'teal'),
      item('marketers', routes.marketers, 'nav.marketers', IdCard, 'indigo'),
      item('teachers', routes.teachers, 'nav.teachers', Presentation, 'signal'),
    ],
  },
  {
    id: 'stats',
    labelKey: 'nav.sectionStats',
    items: [
      item('groupsAttendanceStatistics', routes.groupsAttendanceStatistics, 'nav.groupsAttendanceStatistics', PieChart, 'teal'),
      item('annualDtpReports', routes.annualDtpReports, 'nav.annualDtpReports', PieChart, 'amber'),
      item('reportsForOrganization', routes.reportsForOrganization, 'nav.reportsForOrganization', FileText, 'violet'),
    ],
  },
  {
    id: 'settings',
    labelKey: 'nav.sectionSettings',
    items: [
      item('cars', routes.cars, 'nav.cars', Car, 'signal'),
      item('trailers', routes.trailers, 'nav.trailers', Truck, 'amber'),
      item('rooms', routes.rooms, 'nav.rooms', House, 'teal'),
      item('holidays', routes.holidays, 'nav.holidays', CalendarCheck, 'violet'),
      item('externalLeads', routes.externalLeads, 'nav.externalLeads', ExternalLink, 'indigo'),
    ],
  },
  {
    id: 'guides',
    labelKey: 'nav.sectionGuides',
    items: [
      item('videoGuides', routes.videoGuides, 'nav.videoGuides', Clapperboard, 'rose'),
      item('faq', routes.faq, 'nav.faq', CircleHelp, 'signal'),
    ],
  },
]

export const DIRECTOR_NAV_ITEMS: NavItem[] = DIRECTOR_NAV_SECTIONS.flatMap(
  (s) => s.items,
)

/** Real UI bor sahifalar — qolganlari placeholder. */
export const DIRECTOR_IMPLEMENTED_PAGES = new Set<PageAccessKey>([
  'dashboard',
  'directorEditData',
  'directorApplications',
  'students',
  'groups',
  'teachers',
  'cars',
  'templateViewStatistic',
  'contentViewStatistic',
  'rooms',
  'holidays',
  'trailers',
  'problemSituations',
  'notificationsService',
  'myGovApplication',
  'directorAppeals',
  'textbooks',
  'tuitionFees',
  'reportsMonitoringByStudent',
  'extraLessons',
  'cameraControlAttendance',
  'faceControlWarnings',
  'monitoringCameraDaily',
  'absenceReasonIndex',
  'reasonStudentAbsence',
  'autodromeOrganizationGroup',
  'groupPracticalAttendance',
  'infoExamResults',
  'organizationFinalExam',
  'autodromeAgreement',
  'expenses',
  'paymentDashboard',
  'paymentHistory',
  'debtors',
  'refund',
  'documents',
])
