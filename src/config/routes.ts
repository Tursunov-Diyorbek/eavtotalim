export const APP_NAME = "EAVTOTA'LIM"

/** Route path constants — single source of truth */
export const routes = {
  login: '/login',
  home: '/dashboard',
  lessons: '/lessons',
  savedTopics: '/lessons/saved',
  lessonSchedule: '/lesson-schedule',
  roadSigns: '/road-signs',
  roadSignsType: '/road-signs/:id',
  penalties: '/penalties',
  penaltiesCategory: '/penalties/:id',
  appeal: '/appeal',
  appealDetail: '/appeal/:id',
  circuitDiagram: '/circuit-diagram',
  practicalTraining: '/practical-training',
  myAttendance: '/my-attendance',
  missedClasses: '/missed-classes',
  groupDetails: '/group-details',
  activeSchools: '/active-schools',
  students: '/students',
  attendance: '/attendance',
  examTemplates: '/exam-templates',
  examTemplateTake: '/exam-templates/take',
  randomTests: '/random-tests',
  randomTestTake: '/random-tests/take',
  allTests: '/all-tests',
  savedTests: '/saved-tests',
  finalExam: '/final-exam',
  finalExamTake: '/final-exam/take',
  profile: '/myprofile',
} as const

export type AppRoute = (typeof routes)[keyof typeof routes]
