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
  },
  myProfile: {
    all: ['my-profile'] as const,
    detail: () => [...queryKeys.myProfile.all, 'detail'] as const,
    autodromeCameraStatus: () =>
      [...queryKeys.myProfile.all, 'autodrome-camera-status'] as const,
    autodromeEnrollmentStatus: () =>
      [...queryKeys.myProfile.all, 'autodrome-status'] as const,
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
  directorDashboard: {
    all: ['director-dashboard'] as const,
    dailyPayments: (from: string, to: string) =>
      [...queryKeys.directorDashboard.all, 'daily-payments', from, to] as const,
    imageStats: () =>
      [...queryKeys.directorDashboard.all, 'image-stats'] as const,
    faceWarnings: () =>
      [...queryKeys.directorDashboard.all, 'face-warnings'] as const,
    cameras: () => [...queryKeys.directorDashboard.all, 'cameras'] as const,
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
    options: () => [...queryKeys.cars.all, 'options'] as const,
  },
  rooms: {
    all: ['rooms'] as const,
    list: () => [...queryKeys.rooms.all, 'list'] as const,
  },
  holidays: {
    all: ['holidays'] as const,
    list: () => [...queryKeys.holidays.all, 'list'] as const,
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
  },
  autodromeAttendance: {
    all: ['autodrome-attendance'] as const,
    groups: (filters: object) =>
      [...queryKeys.autodromeAttendance.all, 'groups', filters] as const,
    students: (filters: object) =>
      [...queryKeys.autodromeAttendance.all, 'students', filters] as const,
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
} as const
