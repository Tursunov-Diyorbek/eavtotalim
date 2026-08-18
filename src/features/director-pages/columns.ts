import type { PageAccessKey } from '@/config/access'

export type DirectorCol = {
  key: string
  headerKey: string
  path?: string
  kind?: 'text' | 'fio' | 'date' | 'phone' | 'lang' | 'status'
}

export const DIRECTOR_LIST_COLUMNS: Partial<Record<PageAccessKey, DirectorCol[]>> = {
  onlineApplications: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'phone', headerKey: 'directorList.phone', path: 'phone', kind: 'phone' },
    { key: 'edu', headerKey: 'directorList.eduType', path: 'edu_type.character_name' },
  ],
  problemSituations: [
    { key: 'name', headerKey: 'directorList.name', path: 'name', kind: 'lang' },
    { key: 'text', headerKey: 'directorList.info', path: 'text', kind: 'lang' },
    { key: 'status', headerKey: 'directorList.status', path: 'problematic_situation_status.name', kind: 'status' },
  ],
  notificationsService: [
    { key: 'name', headerKey: 'directorList.name', path: 'name' },
    { key: 'body', headerKey: 'directorList.text', path: 'body' },
    { key: 'students', headerKey: 'directorList.studentsCount', path: 'students_count' },
    { key: 'status', headerKey: 'directorList.status', path: 'message_schedule_status.name', kind: 'status' },
  ],
  myGovApplication: [
    { key: 'task', headerKey: 'directorList.taskId', path: 'task_id' },
    { key: 'group', headerKey: 'directorList.group', path: 'group_name' },
    { key: 'time', headerKey: 'directorList.time', path: 'event_time', kind: 'date' },
  ],
  directorAppeals: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'type', headerKey: 'directorList.type', path: 'appeal_type.name', kind: 'lang' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
    { key: 'date', headerKey: 'directorList.date', path: 'created_at', kind: 'date' },
  ],
  groups: [
    { key: 'name', headerKey: 'directorList.group', path: 'name' },
    { key: 'edu', headerKey: 'directorList.eduType', path: 'edu_type.short_name' },
    { key: 'start', headerKey: 'directorList.startDate', path: 'edu_starting_date', kind: 'date' },
    { key: 'end', headerKey: 'directorList.endDate', path: 'edu_ending_date', kind: 'date' },
    { key: 'status', headerKey: 'directorList.status', path: 'edu_status', kind: 'status' },
  ],
  textbooks: [
    { key: 'name', headerKey: 'directorList.name', kind: 'lang' },
    { key: 'edu', headerKey: 'directorList.eduTypes', path: 'edu_types_count' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
    { key: 'updated', headerKey: 'directorList.updated', path: 'updated_at', kind: 'date' },
  ],
  tuitionFees: [
    { key: 'name', headerKey: 'directorList.name', path: 'name' },
    { key: 'short', headerKey: 'directorList.eduType', path: 'short_name' },
    { key: 'first', headerKey: 'directorList.firstPay', path: 'edu_type_price.first_pay' },
    { key: 'price', headerKey: 'directorList.price', path: 'edu_type_price.price' },
  ],
  contentViewStatistic: [
    { key: 'name', headerKey: 'directorList.group', path: 'name' },
    { key: 'edu', headerKey: 'directorList.eduType', path: 'edu_type.short_name' },
    { key: 'students', headerKey: 'directorList.studentsCount', path: 'students_count' },
  ],
  templateViewStatistic: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'group', headerKey: 'directorList.group', path: 'group.name' },
    { key: 'avg', headerKey: 'directorList.average', path: 'template_test_student_report.average_corrects' },
  ],
  reportsMonitoringByStudent: [
    { key: 'fio', headerKey: 'directorList.fio', path: 'student_fullname' },
    { key: 'group', headerKey: 'directorList.group', path: 'group.name_uz' },
    { key: 'left', headerKey: 'directorList.remaining', path: 'remaining_lessons' },
  ],
  extraLessons: [
    { key: 'name', headerKey: 'directorList.group', path: 'name' },
    { key: 'edu', headerKey: 'directorList.eduType', path: 'edu_type.short_name' },
    { key: 'start', headerKey: 'directorList.startDate', path: 'edu_starting_date', kind: 'date' },
    { key: 'students', headerKey: 'directorList.studentsCount', path: 'students_with_class_dates_count' },
  ],
  cameraControlAttendance: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'type', headerKey: 'directorList.type', path: 'faceControlType.name' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
  ],
  faceControlWarnings: [
    { key: 'text', headerKey: 'directorList.text', path: 'text' },
    { key: 'created', headerKey: 'directorList.date', path: 'created_at', kind: 'date' },
    { key: 'seen', headerKey: 'directorList.status', path: 'is_seen', kind: 'status' },
  ],
  monitoringCameraDaily: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'group', headerKey: 'directorList.group', path: 'group_name' },
    { key: 'date', headerKey: 'directorList.date', path: 'attendance_date', kind: 'date' },
    { key: 'time', headerKey: 'directorList.time', path: 'attendance_time' },
  ],
  absenceReasonIndex: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'group', headerKey: 'directorList.group', path: 'group.name' },
    { key: 'reason', headerKey: 'directorList.reason', path: 'reason' },
    { key: 'from', headerKey: 'directorList.startDate', path: 'from_date', kind: 'date' },
    { key: 'to', headerKey: 'directorList.endDate', path: 'to_date', kind: 'date' },
  ],
  reasonStudentAbsence: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'lessons', headerKey: 'directorList.lessons', path: 'lessons_count' },
    { key: 'absences', headerKey: 'directorList.absences', path: 'all_absences_count' },
  ],
  autodromeOrganizationGroup: [
    { key: 'name', headerKey: 'directorList.group', path: 'name' },
    { key: 'edu', headerKey: 'directorList.eduType', path: 'edu_type.short_name' },
    { key: 'attended', headerKey: 'directorList.attended', path: 'attended_students_count' },
    { key: 'start', headerKey: 'directorList.startDate', path: 'edu_starting_date', kind: 'date' },
  ],
  groupPracticalAttendance: [
    { key: 'name', headerKey: 'directorList.group', path: 'name' },
    { key: 'start', headerKey: 'directorList.startDate', path: 'edu_starting_date', kind: 'date' },
    { key: 'end', headerKey: 'directorList.endDate', path: 'edu_ending_date', kind: 'date' },
    { key: 'practical', headerKey: 'directorList.practical', path: 'students.practical_started' },
  ],
  infoExamResults: [
    { key: 'name', headerKey: 'directorList.name', path: 'name' },
    { key: 'group', headerKey: 'directorList.group', path: 'group', kind: 'lang' },
    { key: 'start', headerKey: 'directorList.time', path: 'start_time' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
  ],
  organizationFinalExam: [
    { key: 'name', headerKey: 'directorList.name', path: 'name' },
    { key: 'group', headerKey: 'directorList.group', path: 'group.name' },
    { key: 'start', headerKey: 'directorList.time', path: 'time.start' },
    { key: 'status', headerKey: 'directorList.status', path: 'status.id', kind: 'status' },
  ],
  autodromeAgreement: [
    { key: 'name', headerKey: 'directorList.autodrome', path: 'autodrome.name' },
    { key: 'start', headerKey: 'directorList.startDate', path: 'start_date', kind: 'date' },
    { key: 'end', headerKey: 'directorList.endDate', path: 'end_date', kind: 'date' },
    { key: 'status', headerKey: 'directorList.status', path: 'organization_autodrome_agreement_status.title', kind: 'status' },
  ],
  expenses: [
    { key: 'type', headerKey: 'directorList.type', path: 'organization_expense_type.name' },
    { key: 'amount', headerKey: 'directorList.amount', path: 'amount' },
    { key: 'date', headerKey: 'directorList.date', path: 'date', kind: 'date' },
    { key: 'desc', headerKey: 'directorList.description', path: 'description' },
  ],
  paymentDashboard: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'date', headerKey: 'directorList.date', path: 'payment_date', kind: 'date' },
    { key: 'amount', headerKey: 'directorList.amount', path: 'amount' },
    { key: 'type', headerKey: 'directorList.type', path: 'pay_type.name' },
  ],
  paymentHistory: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'group', headerKey: 'directorList.group', path: 'group.name_uz' },
    { key: 'amount', headerKey: 'directorList.amount', path: 'amount' },
    { key: 'date', headerKey: 'directorList.date', path: 'payment_date', kind: 'date' },
  ],
  debtors: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'group', headerKey: 'directorList.group', path: 'group.name' },
    { key: 'phone', headerKey: 'directorList.phone', path: 'phone', kind: 'phone' },
    { key: 'debt', headerKey: 'directorList.debt', path: 'debt' },
  ],
  refund: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'group', headerKey: 'directorList.group', path: 'group.name_uz', kind: 'lang' },
    { key: 'amount', headerKey: 'directorList.amount', path: 'amount' },
    { key: 'date', headerKey: 'directorList.date', path: 'returned_date', kind: 'date' },
  ],
  documents: [
    { key: 'name', headerKey: 'directorList.group', path: 'name' },
    { key: 'edu', headerKey: 'directorList.eduType', path: 'edu_type.short_name' },
  ],
  finalMarkGroups: [
    { key: 'name', headerKey: 'directorList.group', path: 'name' },
    { key: 'end', headerKey: 'directorList.endDate', path: 'edu_ending_date', kind: 'date' },
  ],
  moderators: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'phone', headerKey: 'directorList.phone', path: 'phone', kind: 'phone' },
    { key: 'region', headerKey: 'directorList.region', path: 'region.name' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
  ],
  accountants: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'phone', headerKey: 'directorList.phone', path: 'phone', kind: 'phone' },
    { key: 'region', headerKey: 'directorList.region', path: 'region.name' },
  ],
  marketers: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'phone', headerKey: 'directorList.phone', path: 'phone', kind: 'phone' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
  ],
  teachers: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'passport', headerKey: 'directorList.passport', path: 'passport_seria' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
  ],
  groupsAttendanceStatistics: [
    { key: 'name', headerKey: 'directorList.group', path: 'group.name' },
    { key: 'avg', headerKey: 'directorList.average', path: 'average_attendance' },
  ],
  annualDtpReports: [
    { key: 'fio', headerKey: 'directorList.fio', path: 'fio' },
    { key: 'type', headerKey: 'directorList.type', path: 'accident_type' },
    { key: 'health', headerKey: 'directorList.health', path: 'health_condition' },
    { key: 'age', headerKey: 'directorList.age', path: 'age' },
  ],
  reportsForOrganization: [
    { key: 'group', headerKey: 'directorList.group', path: 'group.name_uz' },
    { key: 'students', headerKey: 'directorList.studentsCount', path: 'students_count' },
    { key: 'start', headerKey: 'directorList.startDate', path: 'group.edu_starting_date', kind: 'date' },
    { key: 'end', headerKey: 'directorList.endDate', path: 'group.edu_ending_date', kind: 'date' },
  ],
  cars: [
    { key: 'name', headerKey: 'directorList.name', path: 'name' },
    { key: 'number', headerKey: 'directorList.number', path: 'number' },
    { key: 'year', headerKey: 'directorList.year', path: 'year_of_manufacture' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
  ],
  trailers: [
    { key: 'number', headerKey: 'directorList.number', path: 'number' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
  ],
  rooms: [
    { key: 'name', headerKey: 'directorList.name', path: 'name_uz' },
    { key: 'status', headerKey: 'directorList.status', path: 'status', kind: 'status' },
  ],
  holidays: [
    { key: 'comment', headerKey: 'directorList.description', path: 'comment' },
    { key: 'start', headerKey: 'directorList.startDate', path: 'start_date', kind: 'date' },
    { key: 'end', headerKey: 'directorList.endDate', path: 'end_date', kind: 'date' },
  ],
  externalLeads: [
    { key: 'fio', headerKey: 'directorList.fio', kind: 'fio' },
    { key: 'phone', headerKey: 'directorList.phone', path: 'phone', kind: 'phone' },
    { key: 'source', headerKey: 'directorList.source', path: 'source' },
    { key: 'date', headerKey: 'directorList.date', path: 'created_at', kind: 'date' },
  ],
}
