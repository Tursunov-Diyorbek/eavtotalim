import { routes } from './routes'
import { canAccess } from '@/lib/authStorage'
import type { MeUser } from '@/types'

/** Backend `user.role` raqamlari (eski Roles.js bilan bir xil) */
export const ROLE_CODE = {
  SUPERADMIN: 777,
  DIRECTOR: 1,
  MODERATOR: 3,
  TEACHER: 4,
  STUDENT: 5,
  ACCOUNTANT: 6,
  EXPERT: 27,
  REGIONAL_INSPECTOR: 28,
} as const

/**
 * Sahifa permissionlari (eski allRoutes / director_links / student_links).
 * `null` — faqat autentifikatsiya yetarli.
 * string[] — kamida bittasi bo‘lsa ochiladi.
 */
export const PAGE_ACCESS = {
  dashboard: null,
  lessons: ['menu.director.subjects'],
  lessonSchedule: ['menu.student.lesson_schedule'],
  lessonScheduleCalendar: ['menu.teacher.lesson_schedule_calendar'],
  roadSigns: ['menu.student.road_signs_students'],
  penalties: ['menu.student.student.penalties'],
  appeal: ['menu.student.student.appeal'],
  circuitDiagram: ['menu.student.circuit_diagram'],
  practicalTraining: ['menu.student.practical_training'],
  myAttendance: ['menu.student.my_attendance'],
  missedClasses: ['menu.student.missed_classes'],
  groupDetails: ['menu.student.group_details'],
  activeSchools: ['menu.student.active_schools'],
  students: ['menu.user.student', 'menu.user.group'],
  studentAdd: ['menu.user.student', 'menu.user.group'],
  studentShow: ['menu.user.student', 'menu.user.student.detail', 'menu.user.group'],
  studentEdit: ['menu.user.student', 'menu.user.group'],
  attendance: ['menu.user.group'],
  examTemplates: ['menu.teacher.exam_questions'],
  randomTests: ['menu.student.random_tests'],
  allTests: ['menu.user.all_tests'],
  savedTests: ['menu.student.saveTests'],
  finalExam: ['menu.student.student_final_exam'],
  profile: null,
  /** MSPD to‘ldirish majburiy — permission bo‘lmasa ham ochiq */
  directorEditData: null,
  /** O'qish uchun arizalar — eski allRoutes / director_links */
  directorApplications: ['view-external-application'],
  onlineApplications: ['menu.director.online_applications_table'],
  problemSituations: ['menu.user.problem_situations'],
  mentorStudents: ['menu.teacher.my_students'],
  notificationsService: ['show-message-schedule', 'menu.director.notifications_service'],
  myGovApplication: ['menu.user.my_gov_application'],
  directorAppeals: ['menu.director.director.appeals'],
  groups: ['menu.user.group_optimal', 'menu.user.group'],
  textbooks: ['menu.user.textbooks'],
  teacherEdu: ['menu.teacher.teacher_edu', 'menu.user.textbooks'],
  lessonSkips: ['menu.director.groupreports'],
  tuitionFees: ['menu.director.tuitionfees'],
  contentViewStatistic: ['menu.director.content_view_statistic'],
  templateViewStatistic: ['menu.director.template_view_statistic'],
  reportsMonitoringByStudent: ['menu.director.reports_monitoring_by_student'],
  extraLessons: ['menu.user.extra_lessons'],
  cameraControlAttendance: ['menu.director.camera_control_attendance'],
  faceControlWarnings: ['menu.director.face_control_warnings'],
  monitoringCameraDaily: ['menu.director.monitoring_camera_daily_attendance'],
  absenceReasonIndex: ['menu.user.absence_reason_index'],
  reasonStudentAbsence: ['menu.user.reason_student_absence'],
  autodromeOrganizationGroup: ['menu.user.autodrome_organization_group'],
  groupPracticalAttendance: ['menu.user.group_practical_attendance'],
  infoExamResults: ['menu.director.info_exam_results'],
  organizationFinalExam: ['menu.director.organization_final_exam'],
  autodromeAgreement: ['menu.director.autodrome_agreement'],
  expenses: ['menu.user.expenses'],
  paymentDashboard: ['menu.director.payment_dashboard'],
  paymentHistory: ['menu.director.payment_history'],
  debtors: ['menu.director.debtors'],
  refund: ['menu.director.refund'],
  documents: ['menu.user.doc'],
  finalMarkGroups: ['menu.director.final_mark_groups'],
  moderators: ['menu.user.moderator'],
  accountants: ['menu.director.accountant'],
  marketers: ['menu.director.marketolog'],
  teachers: ['menu.user.teacher'],
  groupsAttendanceStatistics: ['menu.director.groups_attendance_statistics'],
  annualDtpReports: ['menu.user.annual_dtp_reports'],
  reportsForOrganization: ['menu.director.reports_for_organization'],
  cars: ['menu.user.cars'],
  assignedLimit: ['menu.user.student', 'menu.user.group_optimal'],
  trailers: ['menu.director.trailers'],
  rooms: ['menu.director.rooms'],
  holidays: ['menu.director.holidays'],
  externalLeads: ['menu.director.external_leads'],
  videoGuides: ['menu.director.useful_infos.video_guides'],
  faq: null,
} as const

export type PageAccessKey = keyof typeof PAGE_ACCESS

export const PAGE_PATH: Record<PageAccessKey, string> = {
  dashboard: routes.home,
  lessons: routes.lessons,
  lessonSchedule: routes.lessonSchedule,
  lessonScheduleCalendar: routes.lessonScheduleCalendar,
  roadSigns: routes.roadSigns,
  penalties: routes.penalties,
  appeal: routes.appeal,
  circuitDiagram: routes.circuitDiagram,
  practicalTraining: routes.practicalTraining,
  myAttendance: routes.myAttendance,
  missedClasses: routes.missedClasses,
  groupDetails: routes.groupDetails,
  activeSchools: routes.activeSchools,
  students: routes.students,
  studentAdd: routes.studentAdd,
  studentShow: routes.studentShow,
  studentEdit: routes.studentEdit,
  attendance: routes.attendance,
  examTemplates: routes.examTemplates,
  randomTests: routes.randomTests,
  allTests: routes.allTests,
  savedTests: routes.savedTests,
  finalExam: routes.finalExam,
  profile: routes.profile,
  directorEditData: routes.directorEditData,
  directorApplications: routes.directorApplications,
  onlineApplications: routes.onlineApplications,
  problemSituations: routes.problemSituations,
  mentorStudents: routes.mentorStudents,
  notificationsService: routes.notificationsService,
  myGovApplication: routes.myGovApplication,
  directorAppeals: routes.directorAppeals,
  groups: routes.groups,
  textbooks: routes.textbooks,
  teacherEdu: routes.teacherEdu,
  lessonSkips: routes.lessonSkips,
  tuitionFees: routes.tuitionFees,
  contentViewStatistic: routes.contentViewStatistic,
  templateViewStatistic: routes.templateViewStatistic,
  reportsMonitoringByStudent: routes.reportsMonitoringByStudent,
  extraLessons: routes.extraLessons,
  cameraControlAttendance: routes.cameraControlAttendance,
  faceControlWarnings: routes.faceControlWarnings,
  monitoringCameraDaily: routes.monitoringCameraDaily,
  absenceReasonIndex: routes.absenceReasonIndex,
  reasonStudentAbsence: routes.reasonStudentAbsence,
  autodromeOrganizationGroup: routes.autodromeOrganizationGroup,
  groupPracticalAttendance: routes.groupPracticalAttendance,
  infoExamResults: routes.infoExamResults,
  organizationFinalExam: routes.organizationFinalExam,
  autodromeAgreement: routes.autodromeAgreement,
  expenses: routes.expenses,
  paymentDashboard: routes.paymentDashboard,
  paymentHistory: routes.paymentHistory,
  debtors: routes.debtors,
  refund: routes.refund,
  documents: routes.documents,
  finalMarkGroups: routes.finalMarkGroups,
  moderators: routes.moderators,
  accountants: routes.accountants,
  marketers: routes.marketers,
  teachers: routes.teachers,
  groupsAttendanceStatistics: routes.groupsAttendanceStatistics,
  annualDtpReports: routes.annualDtpReports,
  reportsForOrganization: routes.reportsForOrganization,
  cars: routes.cars,
  assignedLimit: routes.assignedLimit,
  trailers: routes.trailers,
  rooms: routes.rooms,
  holidays: routes.holidays,
  externalLeads: routes.externalLeads,
  videoGuides: routes.videoGuides,
  faq: routes.faq,
}

export const ROLE_HOME_PAGE: Record<number, PageAccessKey> = {
  [ROLE_CODE.SUPERADMIN]: 'dashboard',
  [ROLE_CODE.DIRECTOR]: 'dashboard',
  [ROLE_CODE.ACCOUNTANT]: 'dashboard',
  [ROLE_CODE.EXPERT]: 'dashboard',
  [ROLE_CODE.REGIONAL_INSPECTOR]: 'dashboard',
  [ROLE_CODE.STUDENT]: 'dashboard',
  [ROLE_CODE.TEACHER]: 'dashboard',
}

export function getHomePathByRole(
  role: number,
  user?: Pick<MeUser, 'roles' | 'permissions'> | null,
): string {
  const preferred = ROLE_HOME_PAGE[role] ?? 'dashboard'
  if (canAccess(PAGE_ACCESS[preferred], user)) {
    return PAGE_PATH[preferred]
  }
  return getFirstAllowedPath(user)
}

export function getFirstAllowedPath(
  user?: Pick<MeUser, 'roles' | 'permissions'> | null,
): string {
  for (const key of Object.keys(PAGE_ACCESS) as PageAccessKey[]) {
    if (canAccess(PAGE_ACCESS[key], user)) {
      return PAGE_PATH[key]
    }
  }
  return routes.login
}

export function pagePermissionLabel(
  page: PageAccessKey,
): string | null {
  const access = PAGE_ACCESS[page]
  if (access == null) return null
  return access.join(' | ')
}
