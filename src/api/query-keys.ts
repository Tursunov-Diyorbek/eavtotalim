/**
 * Hierarchical query keys — invalidate by prefix safely.
 * Example: queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
 */
export const queryKeys = {
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.students.lists(), filters] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
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
} as const
