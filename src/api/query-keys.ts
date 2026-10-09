/**
 * Hierarchical query keys — invalidate by prefix safely.
 * Example: queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
 */
export const queryKeys = {
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (filters: object) =>
      [...queryKeys.students.lists(), filters] as const,
    counts: () => [...queryKeys.students.all, 'counts'] as const,
    certificates: (filters: object) =>
      [...queryKeys.students.all, 'certificates', filters] as const,
    withoutCertificates: (filters: object) =>
      [...queryKeys.students.all, 'without-certificates', filters] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
    options: () => [...queryKeys.students.all, 'options'] as const,
    camera: (id: string) => [...queryKeys.students.all, 'camera', id] as const,
    autodromeCamera: (id: string) =>
      [...queryKeys.students.all, 'autodrome-camera', id] as const,
    attendance: (id: string, page: number) =>
      [...queryKeys.students.all, 'attendance', id, page] as const,
    autodromeAttendance: (id: string, page: number) =>
      [...queryKeys.students.all, 'autodrome-attendance', id, page] as const,
    payments: (id: string) => [...queryKeys.students.all, 'payments', id] as const,
    exams: (id: string) => [...queryKeys.students.all, 'exams', id] as const,
    contract: (id: string) => [...queryKeys.students.all, 'contract', id] as const,
    examCenter: (id: string, from = '', to = '') =>
      [...queryKeys.students.all, 'exam-center', id, from, to] as const,
    practical: (id: string) => [...queryKeys.students.all, 'practical', id] as const,
    classDates: (id: string, from?: string, to?: string) =>
      [...queryKeys.students.all, 'class-dates', id, from ?? '', to ?? ''] as const,
    districts: (regionId: string) =>
      [...queryKeys.students.all, 'districts', regionId] as const,
    regions: () => [...queryKeys.students.all, 'regions'] as const,
  },
  myProfile: {
    all: ['my-profile'] as const,
    detail: () => [...queryKeys.myProfile.all, 'detail'] as const,
    payments: () => [...queryKeys.myProfile.all, 'payments'] as const,
    autodromeCameraStatus: () =>
      [...queryKeys.myProfile.all, 'autodrome-camera-status'] as const,
    autodromeEnrollmentStatus: () =>
      [...queryKeys.myProfile.all, 'autodrome-status'] as const,
  },
  announces: {
    all: ['announces'] as const,
    mine: () => [...queryKeys.announces.all, 'mine'] as const,
  },
  lessons: {
    all: ['lessons'] as const,
    list: () => [...queryKeys.lessons.all, 'list'] as const,
    topics: (eduTypeLessonId: string, page: number, showCount: number) =>
      [
        ...queryKeys.lessons.all,
        'topics',
        eduTypeLessonId,
        page,
        showCount,
      ] as const,
    contents: (topicId: string) =>
      [...queryKeys.lessons.all, 'contents', topicId] as const,
    savedTopics: () => [...queryKeys.lessons.all, 'saved-topics'] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    byDate: (date: string) => [...queryKeys.attendance.all, date] as const,
  },
  schedule: {
    all: ['schedule'] as const,
    myTimeTable: () => [...queryKeys.schedule.all, 'my-time-table'] as const,
    thisWeek: () => [...queryKeys.schedule.all, 'this-week'] as const,
  },
  roadSigns: {
    all: ['road-signs'] as const,
    types: () => [...queryKeys.roadSigns.all, 'types'] as const,
    byType: (typeId: string, page: number) =>
      [...queryKeys.roadSigns.all, 'by-type', typeId, page] as const,
  },
  penalties: {
    all: ['penalties'] as const,
    categories: () => [...queryKeys.penalties.all, 'categories'] as const,
    byCategory: (categoryId: string, lang: string) =>
      [...queryKeys.penalties.all, 'by-category', categoryId, lang] as const,
    detail: (id: string, lang: string) =>
      [...queryKeys.penalties.all, 'detail', id, lang] as const,
  },
  appeals: {
    all: ['appeals'] as const,
    types: () => [...queryKeys.appeals.all, 'types'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.appeals.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.appeals.all, 'detail', id] as const,
  },
  circuitDiagram: {
    all: ['circuit-diagram'] as const,
    guides: (lang: string) =>
      [...queryKeys.circuitDiagram.all, 'guides', lang] as const,
    detail: (id: string) =>
      [...queryKeys.circuitDiagram.all, 'detail', id] as const,
  },
  myAttendance: {
    all: ['my-attendance'] as const,
    theoretical: (year: number, month: number) =>
      [...queryKeys.myAttendance.all, 'theoretical', year, month] as const,
    practical: () => [...queryKeys.myAttendance.all, 'practical'] as const,
    autodrome: () => [...queryKeys.myAttendance.all, 'autodrome'] as const,
  },
  missedClasses: {
    all: ['missed-classes'] as const,
    absences: () => [...queryKeys.missedClasses.all, 'absences'] as const,
    absenceReasons: (professionId: number) =>
      [...queryKeys.missedClasses.all, 'absence-reasons', professionId] as const,
  },
  groupDetails: {
    all: ['group-details'] as const,
    detail: (professionId: number) =>
      [...queryKeys.groupDetails.all, 'detail', professionId] as const,
  },
  activeSchools: {
    all: ['active-schools'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.activeSchools.all, 'list', filters] as const,
  },
  examTemplates: {
    all: ['exam-templates'] as const,
    list: () => [...queryKeys.examTemplates.all, 'list'] as const,
  },
  randomTests: {
    all: ['random-tests'] as const,
    latest: () => [...queryKeys.randomTests.all, 'latest'] as const,
  },
  allTests: {
    all: ['all-tests'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.allTests.all, 'list', filters] as const,
  },
  savedTests: {
    all: ['saved-tests'] as const,
    list: () => [...queryKeys.savedTests.all, 'list'] as const,
  },
  finalExam: {
    all: ['final-exam'] as const,
    index: () => [...queryKeys.finalExam.all, 'index'] as const,
  },
  tests: {
    all: ['tests'] as const,
    detail: (id: string) => [...queryKeys.tests.all, id] as const,
  },
  directorApplications: {
    all: ['director-applications'] as const,
    /** Login sessiyasi — default list + badge (1 so‘rov). */
    session: () =>
      [...queryKeys.directorApplications.all, 'session'] as const,
    list: (filters: object) =>
      [...queryKeys.directorApplications.all, 'list', filters] as const,
  },
  directorDashboard: {
    all: ['director-dashboard'] as const,
    dailyPayments: (from: string, to: string) =>
      [...queryKeys.directorDashboard.all, 'daily-payments', from, to] as const,
    dailyPaymentList: (from: string, to: string) =>
      [...queryKeys.directorDashboard.all, 'daily-payment-list', from, to] as const,
    imageStats: () =>
      [...queryKeys.directorDashboard.all, 'image-stats'] as const,
    imageStatsGroups: () =>
      [...queryKeys.directorDashboard.all, 'image-stats-groups'] as const,
    imageStatsGroupStudents: (
      groupId: number | string,
      page: number,
      status: string,
      search: string,
    ) =>
      [
        ...queryKeys.directorDashboard.all,
        'image-stats-students',
        groupId,
        page,
        status,
        search,
      ] as const,
    faceWarnings: () =>
      [...queryKeys.directorDashboard.all, 'face-warnings'] as const,
    cameras: () => [...queryKeys.directorDashboard.all, 'cameras'] as const,
    gaiRating: (year: number, period: number) =>
      [...queryKeys.directorDashboard.all, 'gai-rating', year, period] as const,
  },
  directorProfile: {
    all: ['director-profile'] as const,
    editData: () => [...queryKeys.directorProfile.all, 'edit-my-data'] as const,
    organizationInfo: () =>
      [...queryKeys.directorProfile.all, 'organization-info'] as const,
    bankName: (mfo: string) =>
      [...queryKeys.directorProfile.all, 'bank-name', mfo] as const,
  },
  directorLists: {
    all: ['director-lists'] as const,
    page: (key: string, filters: Record<string, unknown>) =>
      [...queryKeys.directorLists.all, key, filters] as const,
  },
  groups: {
    all: ['groups'] as const,
    list: (filters: object) =>
      [...queryKeys.groups.all, 'list', filters] as const,
    counts: () => [...queryKeys.groups.all, 'counts'] as const,
    detail: (id: string) => [...queryKeys.groups.all, 'detail', id] as const,
    students: (id: string) => [...queryKeys.groups.all, 'students', id] as const,
    timetable: (id: string) => [...queryKeys.groups.all, 'timetable', id] as const,
    cars: (id: string) => [...queryKeys.groups.all, 'cars', id] as const,
    teachers: (id: string) => [...queryKeys.groups.all, 'teachers', id] as const,
    removedStudents: (id: string) =>
      [...queryKeys.groups.all, 'removed-students', id] as const,
    credentials: (id: string) =>
      [...queryKeys.groups.all, 'credentials', id] as const,
    incoming: (id: string, year: number, month: number, search: string) =>
      [...queryKeys.groups.all, 'incoming', id, year, month, search] as const,
    finalExam: (id: string) => [...queryKeys.groups.all, 'final-exam', id] as const,
    ungrouped: (id: string) => [...queryKeys.groups.all, 'ungrouped', id] as const,
    availableCars: (id: string) =>
      [...queryKeys.groups.all, 'available-cars', id] as const,
    teacherTypes: (id: string) =>
      [...queryKeys.groups.all, 'teacher-types', id] as const,
    mergeTeachers: () => [...queryKeys.groups.all, 'merge-teachers'] as const,
    monitoring: (id: string) => [...queryKeys.groups.all, 'monitoring', id] as const,
    payments: (id: string) => [...queryKeys.groups.all, 'payments', id] as const,
    finalMarks: (id: string) => [...queryKeys.groups.all, 'final-marks', id] as const,
    examResults: (id: string) => [...queryKeys.groups.all, 'exam-results', id] as const,
  },
  marketers: {
    all: ['marketers'] as const,
    list: (page: number, showCount: number) =>
      [...queryKeys.marketers.all, 'list', page, showCount] as const,
    detail: (id: string) => [...queryKeys.marketers.all, 'detail', id] as const,
    regions: () => [...queryKeys.marketers.all, 'regions'] as const,
    districts: (regionId: string) =>
      [...queryKeys.marketers.all, 'districts', regionId] as const,
  },
  accountants: {
    all: ['accountants'] as const,
    list: (word: string) => [...queryKeys.accountants.all, 'list', word] as const,
    detail: (id: string) => [...queryKeys.accountants.all, 'detail', id] as const,
    regions: () => [...queryKeys.accountants.all, 'regions'] as const,
    districts: (regionId: string) =>
      [...queryKeys.accountants.all, 'districts', regionId] as const,
  },
  moderators: {
    all: ['moderators'] as const,
    list: (filters: object) =>
      [...queryKeys.moderators.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.moderators.all, 'detail', id] as const,
    regions: () => [...queryKeys.moderators.all, 'regions'] as const,
    districts: (regionId: string) =>
      [...queryKeys.moderators.all, 'districts', regionId] as const,
  },
  teachers: {
    all: ['teachers'] as const,
    list: (filters: object) =>
      [...queryKeys.teachers.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.teachers.all, 'detail', id] as const,
    edit: (id: string) => [...queryKeys.teachers.all, 'edit', id] as const,
    options: () => [...queryKeys.teachers.all, 'options'] as const,
  },
  cars: {
    all: ['cars'] as const,
    list: (filters: object) => [...queryKeys.cars.all, 'list', filters] as const,
    counts: () => [...queryKeys.cars.all, 'counts'] as const,
    detail: (id: string) => [...queryKeys.cars.all, 'detail', id] as const,
    info: (id: string) => [...queryKeys.cars.all, 'info', id] as const,
    eduHistory: (id: string) => [...queryKeys.cars.all, 'edu-history', id] as const,
    options: () => [...queryKeys.cars.all, 'options', 'v2'] as const,
    share: (filters: object) => [...queryKeys.cars.all, 'share', filters] as const,
    refs: () => [...queryKeys.cars.all, 'refs'] as const,
    statistics: (filters: object) =>
      [...queryKeys.cars.all, 'statistics', filters] as const,
  },
  rooms: {
    all: ['rooms'] as const,
    list: () => [...queryKeys.rooms.all, 'list'] as const,
  },
  holidays: {
    all: ['holidays'] as const,
    list: () => [...queryKeys.holidays.all, 'list'] as const,
  },
  externalLeads: {
    all: ['external-leads'] as const,
    list: (status: string) => [...queryKeys.externalLeads.all, 'list', status] as const,
    stats: () => [...queryKeys.externalLeads.all, 'stats'] as const,
  },
  trailers: {
    all: ['trailers'] as const,
    list: () => [...queryKeys.trailers.all, 'list'] as const,
  },
  directorStats: {
    all: ['director-stats'] as const,
    templateTests: (filters: object) =>
      [...queryKeys.directorStats.all, 'template-tests', filters] as const,
    templateTestStudent: (studentId: string) =>
      [...queryKeys.directorStats.all, 'template-test-student', studentId] as const,
    contentGroups: (filters: object) =>
      [...queryKeys.directorStats.all, 'content-groups', filters] as const,
    contentStudents: (groupId: string) =>
      [...queryKeys.directorStats.all, 'content-students', groupId] as const,
    contentStudentTopics: (studentId: string) =>
      [...queryKeys.directorStats.all, 'content-student-topics', studentId] as const,
  },
  monitoringReport: {
    all: ['monitoring-report'] as const,
    list: (filters: object) =>
      [...queryKeys.monitoringReport.all, 'list', filters] as const,
    show: (filters: object) =>
      [...queryKeys.monitoringReport.all, 'show', filters] as const,
  },
  absenceReason: {
    all: ['absence-reason'] as const,
    list: (filters: object) =>
      [...queryKeys.absenceReason.all, 'list', filters] as const,
    byStudent: (filters: object) =>
      [...queryKeys.absenceReason.all, 'by-student', filters] as const,
    studentShow: (studentId: number) =>
      [...queryKeys.absenceReason.all, 'student-show', studentId] as const,
  },
  autodromeAttendance: {
    all: ['autodrome-attendance'] as const,
    groups: (filters: object) =>
      [...queryKeys.autodromeAttendance.all, 'groups', filters] as const,
    students: (filters: object) =>
      [...queryKeys.autodromeAttendance.all, 'students', filters] as const,
    connected: (filters: object) =>
      [...queryKeys.autodromeAttendance.all, 'connected', filters] as const,
  },
  extraLessons: {
    all: ['extra-lessons'] as const,
    groups: (filters: object) =>
      [...queryKeys.extraLessons.all, 'groups', filters] as const,
  },
  cameraAttendance: {
    all: ['camera-attendance'] as const,
    list: (filters: object) =>
      [...queryKeys.cameraAttendance.all, 'list', filters] as const,
    summary: () => [...queryKeys.cameraAttendance.all, 'summary'] as const,
    count: (status: string) =>
      [...queryKeys.cameraAttendance.all, 'count', status] as const,
  },
  faceControlWarnings: {
    all: ['face-control-warnings'] as const,
    list: (view: string) =>
      [...queryKeys.faceControlWarnings.all, 'list', view] as const,
  },
  dailyArrivals: {
    all: ['daily-arrivals'] as const,
    list: (filters: object) =>
      [...queryKeys.dailyArrivals.all, 'list', filters] as const,
  },
  practicalAttendance: {
    all: ['practical-attendance'] as const,
    groups: (filters: object) =>
      [...queryKeys.practicalAttendance.all, 'groups', filters] as const,
    students: (filters: object) =>
      [...queryKeys.practicalAttendance.all, 'students', filters] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    list: (search: string) =>
      [...queryKeys.organizations.all, 'list', search] as const,
    autodromes: (search: string) =>
      [...queryKeys.organizations.all, 'autodromes', search] as const,
  },
  infoExamResults: {
    all: ['info-exam-results'] as const,
    list: (filters: object) =>
      [...queryKeys.infoExamResults.all, 'list', filters] as const,
    show: (examId: string) =>
      [...queryKeys.infoExamResults.all, 'show', examId] as const,
  },
  organizationFinalExam: {
    all: ['organization-final-exam'] as const,
    list: () => [...queryKeys.organizationFinalExam.all, 'list'] as const,
  },
  autodromeAgreement: {
    all: ['autodrome-agreement'] as const,
    list: () => [...queryKeys.autodromeAgreement.all, 'list'] as const,
    autodromes: () => [...queryKeys.autodromeAgreement.all, 'autodromes'] as const,
    detail: (id: string) => [...queryKeys.autodromeAgreement.all, 'detail', id] as const,
    cameras: (autodromeId: number, filters: object) =>
      [...queryKeys.autodromeAgreement.all, 'cameras', autodromeId, filters] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    list: (filters: object) => [...queryKeys.expenses.all, 'list', filters] as const,
    types: (filters: object) => [...queryKeys.expenses.all, 'types', filters] as const,
    monthly: (year: string) => [...queryKeys.expenses.all, 'monthly', year] as const,
    range: (from: string, to: string) =>
      [...queryKeys.expenses.all, 'range', from, to] as const,
  },
  paymentHistory: {
    all: ['payment-history'] as const,
    list: (filters: object) => [...queryKeys.paymentHistory.all, 'list', filters] as const,
    groups: () => [...queryKeys.paymentHistory.all, 'groups'] as const,
    org: (filters: object) => [...queryKeys.paymentHistory.all, 'org', filters] as const,
    generalReport: (year: number) =>
      [...queryKeys.paymentHistory.all, 'general-report', year] as const,
    groupReport: (filters: object) =>
      [...queryKeys.paymentHistory.all, 'group-report', filters] as const,
    students: (filters: object) =>
      [...queryKeys.paymentHistory.all, 'students', filters] as const,
    year: (filters: object) => [...queryKeys.paymentHistory.all, 'year', filters] as const,
    createList: (filters: object) =>
      [...queryKeys.paymentHistory.all, 'create-list', filters] as const,
    student: (id: string) => [...queryKeys.paymentHistory.all, 'student', id] as const,
    check: (id: string) => [...queryKeys.paymentHistory.all, 'check', id] as const,
  },
  debtors: {
    all: ['debtors'] as const,
    list: (filters: object) => [...queryKeys.debtors.all, 'list', filters] as const,
    groups: () => [...queryKeys.debtors.all, 'groups'] as const,
  },
  refund: {
    all: ['refund'] as const,
    list: (filters: object) => [...queryKeys.refund.all, 'list', filters] as const,
    students: (groupId: string) =>
      [...queryKeys.refund.all, 'students', groupId] as const,
  },
  documents: {
    all: ['documents'] as const,
    print: (groupId: string) => [...queryKeys.documents.all, 'print', groupId] as const,
    teachers: (groupId: string) =>
      [...queryKeys.documents.all, 'teachers', groupId] as const,
    lessons: (groupId: string) =>
      [...queryKeys.documents.all, 'lessons', groupId] as const,
    practicalChapters: (lessonId: string) =>
      [...queryKeys.documents.all, 'practical-chapters', lessonId] as const,
  },
  assignedLimit: {
    all: ['assigned-limit'] as const,
    overview: (organizationId: string, asDirector: boolean) =>
      [...queryKeys.assignedLimit.all, 'overview', organizationId, asDirector] as const,
  },
  problemSituations: {
    all: ['problem-situations'] as const,
    list: (filters: object) =>
      [...queryKeys.problemSituations.all, 'list', filters] as const,
    statuses: () => [...queryKeys.problemSituations.all, 'statuses'] as const,
    detail: (id: string) =>
      [...queryKeys.problemSituations.all, 'detail', id] as const,
  },
  notificationsService: {
    all: ['notifications-service'] as const,
    list: (filters: object) =>
      [...queryKeys.notificationsService.all, 'list', filters] as const,
    detail: (id: number, filters: object) =>
      [...queryKeys.notificationsService.all, 'detail', id, filters] as const,
    templates: (filters: object) =>
      [...queryKeys.notificationsService.all, 'templates', filters] as const,
    students: (filters: object) =>
      [...queryKeys.notificationsService.all, 'students', filters] as const,
  },
  myGovApplication: {
    all: ['my-gov-application'] as const,
    list: (filters: object) =>
      [...queryKeys.myGovApplication.all, 'list', filters] as const,
    detail: (id: number) =>
      [...queryKeys.myGovApplication.all, 'detail', id] as const,
  },
  problemReports: {
    all: ['problem-reports'] as const,
    types: (context: string) =>
      [...queryKeys.problemReports.all, 'types', context] as const,
    history: (subjectType: string, subjectId: string) =>
      [...queryKeys.problemReports.all, 'history', subjectType, subjectId] as const,
  },
  textbooks: {
    all: ['textbooks'] as const,
    eduTypes: (lessonId: string) =>
      [...queryKeys.textbooks.all, 'edu-types', lessonId] as const,
    topics: (filters: object) =>
      [...queryKeys.textbooks.all, 'topics', filters] as const,
    content: (topicId: string) =>
      [...queryKeys.textbooks.all, 'content', topicId] as const,
  },
  tuitionFees: {
    all: ['tuition-fees'] as const,
    list: () => [...queryKeys.tuitionFees.all, 'list'] as const,
  },
  annualDtp: {
    all: ['annual-dtp'] as const,
    list: () => [...queryKeys.annualDtp.all, 'list'] as const,
  },
  attendanceStatistics: {
    all: ['attendance-statistics'] as const,
    dailyAll: ['attendance-statistics', 'daily'] as const,
    daily: (filters: object) =>
      ['attendance-statistics', 'daily', filters] as const,
    groups: (filters: object) =>
      ['attendance-statistics', 'groups', filters] as const,
    students: (filters: object) =>
      ['attendance-statistics', 'students', filters] as const,
  },
} as const
