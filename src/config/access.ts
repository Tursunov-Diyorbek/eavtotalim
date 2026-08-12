import { routes } from './routes'
import { canAccess } from '@/lib/authStorage'
import type { MeUser } from '@/types'

/** Backend `user.role` raqamlari (eski Roles.js bilan bir xil) */
export const ROLE_CODE = {
  SUPERADMIN: 777,
  DIRECTOR: 1,
  STUDENT: 5,
  ACCOUNTANT: 6,
  EXPERT: 27,
  REGIONAL_INSPECTOR: 28,
} as const

/**
 * Sahifa permissionlari (eski allRoutes / student_links kalitlari).
 * `null` — faqat autentifikatsiya yetarli.
 * string[] — kamida bittasi bo‘lsa ochiladi.
 */
export const PAGE_ACCESS = {
  dashboard: null,
  lessons: ['menu.director.subjects'],
  lessonSchedule: ['menu.student.lesson_schedule'],
  roadSigns: ['menu.student.road_signs_students'],
  penalties: ['menu.student.student.penalties'],
  appeal: ['menu.student.student.appeal'],
  circuitDiagram: ['menu.student.circuit_diagram'],
  practicalTraining: ['menu.student.practical_training'],
  myAttendance: ['menu.student.my_attendance'],
  missedClasses: ['menu.student.missed_classes'],
  groupDetails: ['menu.student.group_details'],
  /** Super admin: yangi permission yaratib o‘quvchi roliga bering */
  activeSchools: ['menu.student.active_schools'],
  students: ['menu.user.student', 'menu.user.group'],
  attendance: ['menu.user.group', 'menu.director.groupreports'],
  examTemplates: ['menu.teacher.exam_questions'],
  randomTests: ['menu.student.random_tests'],
  allTests: ['menu.user.all_tests'],
  savedTests: ['menu.student.saveTests'],
  finalExam: ['menu.student.student_final_exam'],
  /** Eski: menu.user.myprofile — autentifikatsiya yetarli */
  profile: null,
} as const

export type PageAccessKey = keyof typeof PAGE_ACCESS

export const PAGE_PATH: Record<PageAccessKey, string> = {
  dashboard: routes.home,
  lessons: routes.lessons,
  lessonSchedule: routes.lessonSchedule,
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
  attendance: routes.attendance,
  examTemplates: routes.examTemplates,
  randomTests: routes.randomTests,
  allTests: routes.allTests,
  savedTests: routes.savedTests,
  finalExam: routes.finalExam,
  profile: routes.profile,
}

/** Rol bo‘yicha afzal boshlang‘ich sahifa */
export const ROLE_HOME_PAGE: Record<number, PageAccessKey> = {
  [ROLE_CODE.SUPERADMIN]: 'dashboard',
  [ROLE_CODE.DIRECTOR]: 'dashboard',
  [ROLE_CODE.ACCOUNTANT]: 'dashboard',
  [ROLE_CODE.EXPERT]: 'dashboard',
  [ROLE_CODE.REGIONAL_INSPECTOR]: 'dashboard',
  [ROLE_CODE.STUDENT]: 'dashboard',
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
