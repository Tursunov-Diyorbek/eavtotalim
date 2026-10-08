export const APP_NAME = "EAVTOTA'LIM"

/** Route path constants — single source of truth */
export const routes = {
  login: '/login',
  home: '/dashboard',
  lessons: '/lessons',
  savedTopics: '/lessons/saved',
  topicTestTake: '/lessons/topic-test',
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
  studentAdd: '/student/add',
  studentEdit: '/student/edit/:id',
  studentShow: '/student/:id',
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
  directorEditData: '/director/edit-my-data',
  directorApplications: '/director-applications',
  onlineApplications: '/online-applications-table',
  problemSituations: '/problem-situations',
  notificationsService: '/notifications-service',
  myGovApplication: '/my-gov-application',
  directorAppeals: '/director/appeals',
  directorAppealDetail: '/director/appeals/:id',
  groups: '/group-optimal',
  textbooks: '/textbooks',
  textbooksLessons: '/textbooks_lessons/:id',
  subjectClasses: '/subjectclasses/:id',
  viewSubject: '/viewsubject/:id',
  tuitionFees: '/tuitionfees',
  contentViewStatistic: '/content-view-statistic',
  contentViewByStudents: '/content-view-statistic/by-students/:id',
  contentViewStudentShow: '/content-view-statistic/by-students/show/:id',
  templateViewStatistic: '/template-view-statistic',
  templateViewStudent: '/template-view-statistic-student/:id',
  reportsMonitoringByStudent: '/reports-monitoring-by-student',
  reportsMonitoringByStudentShow: '/reports-monitoring-by-student-show/:id',
  extraLessons: '/extra-lessons',
  cameraControlAttendance: '/camera-control-attendance',
  faceControlWarnings: '/face-control-warnings',
  monitoringCameraDaily: '/monitoring-camera-daily-attendance',
  absenceReasonIndex: '/absence-reason-index',
  reasonStudentAbsence: '/reason-student-absence',
  autodromeOrganizationGroup: '/autodrome-organization-group',
  autodromeOrganizationStudents: '/autodrome-organization-students/:id',
  autodromeOrganizationStudentsList: '/autodrome-organization-students-list/:id',
  groupPracticalAttendance: '/group-practical-attendance',
  groupPracticalAttendanceStudent: '/group-practical-attendance-student/:id',
  infoExamResults: '/info-exam-results',
  infoExamResultShow: '/info-exam-results/:id',
  organizationFinalExam: '/organization-final-exam',
  autodromeAgreement: '/autodrome-agreement',
  autodromeSendAgreement: '/autodrome-send-agreement',
  autodromeShowAgreement: '/autodrome-show-agreement/:id',
  expenses: '/expenses',
  paymentDashboard: '/payment-dashboard',
  paymentHistory: '/payment-history',
  paymentHistoryCheck: '/payment-history/check/:id',
  paymentStudentAdd: '/paymentstudents/addpayment',
  paymentStudentEdit: '/paymentstudents/addpayment/:id',
  debtors: '/debtors',
  refund: '/refund',
  documents: '/doc',
  finalMarkGroups: '/final-mark-groups',
  moderators: '/moderator',
  moderatorCreate: '/addmoderator',
  moderatorEdit: '/editmoderator/:id',
  accountants: '/accountant',
  accountantCreate: '/addaccountant',
  accountantEdit: '/editaccountant/:id',
  marketers: '/marketolog',
  marketerCreate: '/marketolog/add',
  marketerEdit: '/marketolog/edit/:id',
  teachers: '/teacher',
  teacherCreate: '/teacher_create',
  teacherEdit: '/teacher/edit/:id',
  teacherShow: '/teacher/:id',
  groupsAttendanceStatistics: '/groups-attendance-statistics',
  annualDtpReports: '/annual-dtp-reports',
  reportsForOrganization: '/reports-for-organization',
  cars: '/cars',
  carsAdd: '/cars/add',
  carsEdit: '/cars/edit/:id',
  carsShow: '/cars/show/:id',
  groupShow: '/group/:id',
  groupEdit: '/group/edit/:id',
  groupPayments: '/groupdetails/:id',
  groupFinalMarks: '/final-marks/:id',
  groupExamResults: '/info-final-exam-results/:id',
  assignedLimit: '/assigned-limit/:id',
  trailers: '/trailers',
  trailersAdd: '/trailers/add',
  trailersEdit: '/trailers/edit/:id',
  trailersShow: '/trailers/show/:id',
  rooms: '/rooms',
  roomsAdd: '/rooms/add',
  roomsEdit: '/rooms/edit/:id',
  roomsShow: '/rooms/show/:id',
  holidays: '/holidays',
  holidaysAdd: '/holidays/add',
  problemSituationsCreate: '/problem-situations/create',
  problemSituationsEdit: '/problem-situations/:id',
  externalLeads: '/external-leads',
  videoGuides: '/useful-infos/video-guides',
  faq: '/frequently-asked-question',
} as const

export type AppRoute = (typeof routes)[keyof typeof routes]

export function studentPath(id: number | string) {
  return `/student/${id}`
}

export function studentPrintPath(id: number | string, doc: string) {
  return `/student/${id}/print/${doc}`
}

export type DocumentPrintKind =
  | 'application'
  | 'contract'
  | 'registration'
  | 'statements'
  | 'voucher'
  | 'sheet'
  | 'sheet2'
  | 'mygov'
  | 'jurnal'
  | 'practical'
  | 'approved'
  | 'warning'

const DOCUMENT_PRINT_PATHS: Record<DocumentPrintKind, (id: string | number) => string> = {
  application: (id) => `/pupil-application/${id}`,
  contract: (id) => `/pagetoview/${id}`,
  registration: (id) => `/group-registration-application/${id}`,
  statements: (id) => `/statements_doc/${id}`,
  voucher: (id) => `/voucher/${id}`,
  sheet: (id) => `/personalsheet/${id}`,
  sheet2: (id) => `/personalsheet/two/${id}`,
  mygov: (id) => `/mygov-group-approve/${id}`,
  jurnal: (id) => `/jurnal/${id}`,
  practical: (id) => `/practical-exercise/${id}`,
  approved: (id) => `/group-approved-director/${id}`,
  warning: (id) => `/doc/warning-letter/${id}`,
}

export function documentPrintPath(kind: DocumentPrintKind, id: number | string) {
  return DOCUMENT_PRINT_PATHS[kind](id)
}

export function studentEditPath(id: number | string) {
  return `/student/edit/${id}`
}

export function assignedLimitPath(id: number | string) {
  return `/assigned-limit/${id}`
}

export function teacherPath(id: number | string) {
  return `/teacher/${id}`
}

export function teacherEditPath(id: number | string) {
  return `/teacher/edit/${id}`
}

export function moderatorEditPath(id: number | string) {
  return `/editmoderator/${id}`
}

export function accountantEditPath(id: number | string) {
  return `/editaccountant/${id}`
}

export function marketerEditPath(id: number | string) {
  return `/marketolog/edit/${id}`
}

export function carShowPath(id: number | string) {
  return `/cars/show/${id}`
}

export function carEditPath(id: number | string) {
  return `/cars/edit/${id}`
}

export function groupShowPath(id: number | string) {
  return `/group/${id}`
}

export function groupEditPath(id: number | string) {
  return `/group/edit/${id}`
}

export function groupPaymentsPath(id: number | string) {
  return `/groupdetails/${id}`
}

export function groupFinalMarksPath(id: number | string) {
  return `/final-marks/${id}`
}

export function groupExamResultsPath(id: number | string) {
  return `/info-final-exam-results/${id}`
}

export function paymentStudentAddPath() {
  return '/paymentstudents/addpayment'
}

export function paymentStudentPath(id: number | string) {
  return `/paymentstudents/addpayment/${id}`
}

export function paymentHistoryCheckPath(id: number | string) {
  return `/payment-history/check/${id}`
}

export function roomShowPath(id: number | string) {
  return `/rooms/show/${id}`
}

export function roomEditPath(id: number | string) {
  return `/rooms/edit/${id}`
}

export function trailerShowPath(id: number | string) {
  return `/trailers/show/${id}`
}

export function trailerEditPath(id: number | string) {
  return `/trailers/edit/${id}`
}

export function problemSituationEditPath(id: number | string) {
  return `/problem-situations/${id}`
}

export function textbooksLessonsPath(id: number | string) {
  return `/textbooks_lessons/${id}`
}

export function subjectClassesPath(id: number | string) {
  return `/subjectclasses/${id}`
}

export function viewSubjectPath(id: number | string) {
  return `/viewsubject/${id}`
}

export function contentViewByStudentsPath(id: number | string) {
  return `/content-view-statistic/by-students/${id}`
}

export function contentViewStudentShowPath(id: number | string) {
  return `/content-view-statistic/by-students/show/${id}`
}

export function templateViewStudentPath(id: number | string) {
  return `/template-view-statistic-student/${id}`
}

export function reportsMonitoringStudentPath(id: number | string) {
  return `/reports-monitoring-by-student-show/${id}`
}

export function autodromeAttendanceStudentsPath(id: number | string) {
  return `/autodrome-organization-students/${id}`
}

/** «Kameraga ulangan» — guruhning avtodromga biriktirilgan o‘quvchilari. */
export function autodromeConnectedStudentsPath(id: number | string) {
  return `/autodrome-organization-students-list/${id}`
}

export function practicalAttendanceStudentsPath(id: number | string) {
  return `/group-practical-attendance-student/${id}`
}

export function infoExamResultPath(id: number | string) {
  return `/info-exam-results/${id}`
}

export function autodromeShowAgreementPath(id: number | string) {
  return `/autodrome-show-agreement/${id}`
}
