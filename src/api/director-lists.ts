import type { PageAccessKey } from '@/config/access'
import { getAccessToken } from '@/lib/authStorage'
import {
  assertOk,
  buildListQuery,
  unwrapPage,
  type ApiPage,
  type DirectorRow,
} from '@/lib/apiPage'
import { apiClient, apiClientV2 } from './client'

export type DirectorListArgs = {
  page: number
  showCount: number
  search?: string
}

type Endpoint = {
  client: 'v1' | 'v2'
  method?: 'GET' | 'POST'
  path: string
  token?: boolean
  searchParam?: string
  extra?: Record<string, string>
  paginate?: boolean
}

const ENDPOINTS: Partial<Record<PageAccessKey, Endpoint>> = {
  onlineApplications: { client: 'v2', path: '/organization-application', paginate: false },
  problemSituations: { client: 'v2', path: '/problematic-situations/teacher' },
  notificationsService: { client: 'v2', path: '/message-schedule' },
  myGovApplication: {
    client: 'v2',
    path: '/director-uztelecom-aes/index-applications',
  },
  directorAppeals: { client: 'v2', path: '/appeals/index' },
  groups: {
    client: 'v2',
    path: '/groups',
    extra: { without_students: '1' },
  },
  textbooks: { client: 'v1', path: '/textbook', token: true, searchParam: 'word' },
  tuitionFees: { client: 'v2', path: '/edu-type/prices/index', paginate: false },
  contentViewStatistic: { client: 'v2', path: '/topic-action-statistic/groups' },
  templateViewStatistic: {
    client: 'v2',
    path: '/student-reports/template-tests',
    searchParam: 'student_search',
    paginate: false,
  },
  reportsMonitoringByStudent: {
    client: 'v2',
    path: '/monitoring/students/report',
    searchParam: 'name',
  },
  extraLessons: { client: 'v2', path: '/groups/with-student-class-dates' },
  cameraControlAttendance: {
    client: 'v2',
    path: '/monitoring-camera/pending-students',
  },
  faceControlWarnings: {
    client: 'v2',
    path: '/face-control-warnings/unseen',
    paginate: false,
  },
  monitoringCameraDaily: {
    client: 'v2',
    path: '/monitoring-camera/index-daily-attendance',
  },
  absenceReasonIndex: {
    client: 'v2',
    path: '/absence-reason/index-applications',
  },
  reasonStudentAbsence: {
    client: 'v2',
    path: '/absence-reason/index-applications-by-student',
  },
  autodromeOrganizationGroup: {
    client: 'v2',
    path: '/autodrome-organization-groups/list',
    searchParam: 'group_name',
    paginate: false,
  },
  groupPracticalAttendance: {
    client: 'v2',
    path: '/groups/practical-attendance',
    searchParam: 'group_search',
    paginate: false,
  },
  infoExamResults: {
    client: 'v1',
    path: '/info-exam-results',
    token: true,
    searchParam: 'word',
  },
  organizationFinalExam: {
    client: 'v2',
    path: '/organization-final-exam/index',
    paginate: false,
  },
  autodromeAgreement: {
    client: 'v2',
    path: '/autodrome-agreements/index-agreements',
    paginate: false,
  },
  expenses: { client: 'v2', path: '/organization-expense' },
  paymentDashboard: {
    client: 'v2',
    path: '/school-payment/daily-payment',
    paginate: false,
  },
  paymentHistory: {
    client: 'v2',
    path: '/get-payment-history',
    searchParam: 'fio',
  },
  debtors: {
    client: 'v2',
    path: '/school-payment/debtors-v2',
    searchParam: 'fio',
  },
  refund: {
    client: 'v1',
    path: '/returned-payments-index',
    token: true,
    searchParam: 'word',
  },
  documents: { client: 'v2', path: '/groups', extra: { without_students: '1' } },
  finalMarkGroups: {
    client: 'v2',
    path: '/groups',
    extra: { without_students: '1' },
  },
  moderators: {
    client: 'v1',
    method: 'POST',
    path: '/filter-moderator',
    token: true,
  },
  accountants: { client: 'v1', path: '/accountant', token: true, searchParam: 'word', paginate: false },
  marketers: {
    client: 'v1',
    path: '/marketolog-index',
    token: true,
    searchParam: 'word',
    paginate: false,
  },
  teachers: { client: 'v2', path: '/teachers' },
  groupsAttendanceStatistics: {
    client: 'v2',
    path: '/group-attendance-report',
  },
  annualDtpReports: { client: 'v2', path: '/dtp-records/index', paginate: false },
  reportsForOrganization: {
    client: 'v1',
    path: '/organization-group-report',
    token: true,
    paginate: false,
  },
  cars: { client: 'v2', path: '/cars' },
  trailers: { client: 'v2', path: '/car-trailer', paginate: false },
  rooms: { client: 'v1', path: '/rooms', token: true, paginate: false },
  holidays: { client: 'v1', path: '/holidays-index', token: true, paginate: false },
  externalLeads: {
    client: 'v2',
    path: '/organizations/external-leads',
    paginate: false,
  },
}

function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export async function fetchDirectorList(
  pageKey: PageAccessKey,
  args: DirectorListArgs,
): Promise<ApiPage<DirectorRow>> {
  const ep = ENDPOINTS[pageKey]
  if (!ep) {
    return { data: [], total_items: 0, current_page: 1, last_page: 1 }
  }

  const extra: Record<string, string | number | boolean | null | undefined> = {
    ...ep.extra,
  }
  if (ep.token) extra.token = getAccessToken() ?? ''
  if (ep.searchParam && args.search) extra[ep.searchParam] = args.search
  if (pageKey === 'paymentDashboard') {
    extra.from_date = isoDaysAgo(30)
    extra.to_date = isoDaysAgo(0)
  }
  if (pageKey === 'monitoringCameraDaily') {
    extra.relations = JSON.stringify(['student'])
  }
  if (pageKey === 'textbooks') extra.status = 'all'

  const query = buildListQuery({
    page: ep.paginate === false ? undefined : args.page,
    show_count: ep.paginate === false ? undefined : args.showCount,
    extra,
  })
  const path = query ? `${ep.path}?${query}` : ep.path
  const client = ep.client === 'v1' ? apiClient : apiClientV2
  const res =
    ep.method === 'POST'
      ? await client.post<Record<string, unknown>>(path, {})
      : await client.get<Record<string, unknown>>(path)

  assertOk(res)
  return unwrapPage<DirectorRow>(res, args.page, args.showCount)
}

export function hasDirectorListApi(page: PageAccessKey) {
  return page in ENDPOINTS
}

export function directorListHasSearch(page: PageAccessKey) {
  return Boolean(ENDPOINTS[page]?.searchParam)
}
