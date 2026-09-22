export type MobileScreen =
  | 'home'
  | 'lessons'
  | 'lessonSchedule'
  | 'groupDetails'
  | 'attendances'
  | 'missedClasses'
  | 'activeSchools'
  | 'practicalPrep'
  | 'autodromeGuide'
  | 'roadSigns'
  | 'penalties'
  | 'appeal'
  | 'tests'
  | 'templateTests'
  | 'mixedTests'
  | 'allTests'
  | 'savedTests'
  | 'profile'

export const SCREENS = {
  home: 'home',
  lessons: 'lessons',
  lessonSchedule: 'lessonSchedule',
  groupDetails: 'groupDetails',
  attendances: 'attendances',
  missedClasses: 'missedClasses',
  activeSchools: 'activeSchools',
  practicalPrep: 'practicalPrep',
  autodromeGuide: 'autodromeGuide',
  roadSigns: 'roadSigns',
  penalties: 'penalties',
  appeal: 'appeal',
  tests: 'tests',
  templateTests: 'templateTests',
  mixedTests: 'mixedTests',
  allTests: 'allTests',
  savedTests: 'savedTests',
  profile: 'profile',
} as const satisfies Record<string, MobileScreen>

export const TEST_SUB_SCREENS: MobileScreen[] = [
  'templateTests',
  'mixedTests',
  'allTests',
  'savedTests',
]
