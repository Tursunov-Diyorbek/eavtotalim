import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout'
import { PAGE_ACCESS } from '@/config/access'
import { routes } from '@/config'
import {
  DIRECTOR_IMPLEMENTED_PAGES,
  DIRECTOR_NAV_ITEMS,
} from '@/config/directorNav'
import { GuestOnly, RequireAuth } from '@/features/auth'
import {
  AttendancePage,
  DashboardPage,
  LessonDetailPage,
  LessonSchedulePage,
  LessonsPage,
  TakeTopicTestPage,
  LoginPage,
  NotFoundPage,
  PenaltiesCategoryPage,
  PenaltiesPage,
  AppealsPage,
  AppealDetailPage,
  DirectorAppealsPage,
  CircuitDiagramPage,
  PracticalTrainingPage,
  MyAttendancePage,
  MissedClassesPage,
  GroupDetailsPage,
  ActiveSchoolsPage,
  ExamTemplatesPage,
  TakeExamTemplatePage,
  RandomTestsPage,
  TakeRandomTestPage,
  AllTestsPage,
  SavedTestsPage,
  FinalExamPage,
  TakeFinalExamPage,
  ProfilePage,
  DirectorEditDataPage,
  DirectorApplicationsPage,
  DirectorResourcePage,
  RoadSignsPage,
  RoadSignsTypePage,
  SavedTopicsPage,
  StudentsPage,
  AddStudentPage,
  StudentShowPage,
  StudentEditPage,
  StudentPrintPage,
  AssignedLimitPage,
  TeachersPage,
  TeacherCreatePage,
  TeacherEditPage,
  TeacherShowPage,
  AttendanceStatisticsPage,
  AbsenceStudentsPage,
  AnnualDtpPage,
  OrganizationReportsPage,
  ModeratorsPage,
  ModeratorCreatePage,
  ModeratorEditPage,
  AccountantsPage,
  AccountantCreatePage,
  AccountantEditPage,
  MarketersPage,
  MarketerCreatePage,
  MarketerEditPage,
  CarsPage,
  CarCreatePage,
  CarEditPage,
  CarShowPage,
  CarRoadCostPage,
  TemplateViewStatisticPage,
  TemplateViewStudentShowPage,
  ExtraLessonsPage,
  CameraAttendancePage,
  FaceControlWarningsPage,
  DailyArrivalsPage,
  ReportsMonitoringPage,
  ReportsMonitoringShowPage,
  AbsenceReasonPage,
  ReasonStudentAbsencePage,
  AutodromeAttendancePage,
  AutodromeAttendanceStudentsPage,
  AutodromeConnectedStudentsPage,
  PracticalAttendancePage,
  PracticalAttendanceStudentsPage,
  InfoExamResultsPage,
  InfoExamResultsShowPage,
  OrganizationFinalExamPage,
  AutodromeAgreementPage,
  AutodromeAgreementSendPage,
  AutodromeAgreementShowPage,
  ExpensesPage,
  PaymentDashboardPage,
  PaymentHistoryPage,
  PaymentCheckPage,
  StudentPaymentCreatePage,
  StudentPaymentEditPage,
  DebtorsPage,
  RefundPage,
  DocumentsPage,
  GroupDocumentPrintPage,
  ContentViewStatisticPage,
  ContentViewByStudentsPage,
  ContentViewStudentShowPage,
  GroupsPage,
  GroupShowPage,
  GroupNotebookPage,
  GroupEditPage,
  GroupPaymentsPage,
  GroupFinalMarksPage,
  FinalMarkGroupsPage,
  GroupExamResultsPage,
  RoomsPage,
  RoomCreatePage,
  RoomEditPage,
  RoomShowPage,
  HolidaysPage,
  HolidayCreatePage,
  ExternalLeadsPage,
  VideoGuidesPage,
  EducationGuidesPage,
  PaymentGuidesPage,
  FaqPage,
  TrailersPage,
  ProblemSituationsPage,
  ProblemSituationCreatePage,
  ProblemSituationEditPage,
  NotificationsServicePage,
  MyGovApplicationPage,
  TrailerCreatePage,
  TrailerEditPage,
  TrailerShowPage,
  TextbooksPage,
  TextbookEduTypesPage,
  TextbookTopicsPage,
  TextbookViewPage,
  TuitionFeesPage,
} from '@/pages'

function guarded(
  permission: (typeof PAGE_ACCESS)[keyof typeof PAGE_ACCESS],
  element: ReactNode,
) {
  return <RequireAuth permission={permission}>{element}</RequireAuth>
}

const directorPlaceholderRoutes = DIRECTOR_NAV_ITEMS.filter(
  (item) => !DIRECTOR_IMPLEMENTED_PAGES.has(item.page),
).map((item) => ({
  path: item.to.replace(/^\//, ''),
  element: guarded(PAGE_ACCESS[item.page], <DirectorResourcePage />),
}))

export const router = createBrowserRouter([
  {
    path: routes.login,
    element: (
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    ),
  },
  {
    path: '/',
    element: <Navigate to={routes.login} replace />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: 'exam-templates/take',
        element: guarded(PAGE_ACCESS.examTemplates, <TakeExamTemplatePage />),
      },
      {
        path: 'lessons/topic-test',
        element: guarded(PAGE_ACCESS.lessons, <TakeTopicTestPage />),
      },
      {
        path: 'random-tests/take',
        element: guarded(PAGE_ACCESS.randomTests, <TakeRandomTestPage />),
      },
      {
        path: 'final-exam/take',
        element: guarded(PAGE_ACCESS.finalExam, <TakeFinalExamPage />),
      },
      {
        path: 'student/:id/print/:doc',
        element: guarded(PAGE_ACCESS.studentShow, <StudentPrintPage />),
      },
      {
        element: <AppShell />,
        children: [
          {
            path: 'dashboard',
            element: guarded(PAGE_ACCESS.dashboard, <DashboardPage />),
          },
          {
            path: 'lessons',
            element: guarded(PAGE_ACCESS.lessons, <LessonsPage />),
          },
          {
            path: 'lessons/saved',
            element: guarded(PAGE_ACCESS.lessons, <SavedTopicsPage />),
          },
          {
            path: 'lessons/:id',
            element: guarded(PAGE_ACCESS.lessons, <LessonDetailPage />),
          },
          {
            path: 'lesson-schedule',
            element: guarded(PAGE_ACCESS.lessonSchedule, <LessonSchedulePage />),
          },
          {
            path: 'road-signs',
            element: guarded(PAGE_ACCESS.roadSigns, <RoadSignsPage />),
          },
          {
            path: 'road-signs/:id',
            element: guarded(PAGE_ACCESS.roadSigns, <RoadSignsTypePage />),
          },
          {
            path: 'penalties',
            element: guarded(PAGE_ACCESS.penalties, <PenaltiesPage />),
          },
          {
            path: 'penalties/:id',
            element: guarded(PAGE_ACCESS.penalties, <PenaltiesCategoryPage />),
          },
          {
            path: 'appeal',
            element: guarded(PAGE_ACCESS.appeal, <AppealsPage />),
          },
          {
            path: 'appeal/:id',
            element: guarded(PAGE_ACCESS.appeal, <AppealDetailPage />),
          },
          {
            path: 'circuit-diagram',
            element: guarded(
              PAGE_ACCESS.circuitDiagram,
              <CircuitDiagramPage />,
            ),
          },
          {
            path: 'practical-training',
            element: guarded(
              PAGE_ACCESS.practicalTraining,
              <PracticalTrainingPage />,
            ),
          },
          {
            path: 'my-attendance',
            element: guarded(PAGE_ACCESS.myAttendance, <MyAttendancePage />),
          },
          {
            path: 'missed-classes',
            element: guarded(PAGE_ACCESS.missedClasses, <MissedClassesPage />),
          },
          {
            path: 'group-details',
            element: guarded(PAGE_ACCESS.groupDetails, <GroupDetailsPage />),
          },
          {
            path: 'active-schools',
            element: guarded(PAGE_ACCESS.activeSchools, <ActiveSchoolsPage />),
          },
          {
            path: 'students',
            element: guarded(PAGE_ACCESS.students, <StudentsPage />),
          },
          {
            path: 'student/add',
            element: guarded(PAGE_ACCESS.studentAdd, <AddStudentPage />),
          },
          {
            path: 'student/edit/:id',
            element: guarded(PAGE_ACCESS.studentEdit, <StudentEditPage />),
          },
          {
            path: 'student/:id',
            element: guarded(PAGE_ACCESS.studentShow, <StudentShowPage />),
          },
          {
            path: 'assigned-limit/:id',
            element: guarded(PAGE_ACCESS.assignedLimit, <AssignedLimitPage />),
          },
          {
            path: 'group-optimal',
            element: guarded(PAGE_ACCESS.groups, <GroupsPage />),
          },
          {
            path: 'group/edit/:id',
            element: guarded(PAGE_ACCESS.groups, <GroupEditPage />),
          },
          {
            path: 'group/:id/edit-notebook',
            element: guarded(PAGE_ACCESS.groups, <GroupNotebookPage />),
          },
          {
            path: 'group/:id',
            element: guarded(PAGE_ACCESS.groups, <GroupShowPage />),
          },
          {
            path: 'groupdetails/:id',
            element: guarded(PAGE_ACCESS.groups, <GroupPaymentsPage />),
          },
          {
            path: 'final-marks/:id',
            element: guarded(PAGE_ACCESS.groups, <GroupFinalMarksPage />),
          },
          {
            path: 'info-final-exam-results/:id',
            element: guarded(
              [
                ...(PAGE_ACCESS.groups ?? []),
                ...(PAGE_ACCESS.organizationFinalExam ?? []),
              ],
              <GroupExamResultsPage />,
            ),
          },
          {
            path: 'marketolog',
            element: guarded(PAGE_ACCESS.marketers, <MarketersPage />),
          },
          {
            path: 'marketolog/add',
            element: guarded(PAGE_ACCESS.marketers, <MarketerCreatePage />),
          },
          {
            path: 'marketolog/edit/:id',
            element: guarded(PAGE_ACCESS.marketers, <MarketerEditPage />),
          },
          {
            path: 'accountant',
            element: guarded(PAGE_ACCESS.accountants, <AccountantsPage />),
          },
          {
            path: 'addaccountant',
            element: guarded(PAGE_ACCESS.accountants, <AccountantCreatePage />),
          },
          {
            path: 'editaccountant/:id',
            element: guarded(PAGE_ACCESS.accountants, <AccountantEditPage />),
          },
          {
            path: 'moderator',
            element: guarded(PAGE_ACCESS.moderators, <ModeratorsPage />),
          },
          {
            path: 'addmoderator',
            element: guarded(PAGE_ACCESS.moderators, <ModeratorCreatePage />),
          },
          {
            path: 'editmoderator/:id',
            element: guarded(PAGE_ACCESS.moderators, <ModeratorEditPage />),
          },
          {
            path: 'teacher',
            element: guarded(PAGE_ACCESS.teachers, <TeachersPage />),
          },
          {
            path: 'teacher_create',
            element: guarded(PAGE_ACCESS.teachers, <TeacherCreatePage />),
          },
          {
            path: 'teacher/edit/:id',
            element: guarded(PAGE_ACCESS.teachers, <TeacherEditPage />),
          },
          {
            path: 'teacher/:id',
            element: guarded(PAGE_ACCESS.teachers, <TeacherShowPage />),
          },
          {
            path: 'groups-attendance-statistics',
            element: guarded(
              PAGE_ACCESS.groupsAttendanceStatistics,
              <AttendanceStatisticsPage />,
            ),
          },
          {
            path: 'annual-dtp-reports',
            element: guarded(PAGE_ACCESS.annualDtpReports, <AnnualDtpPage />),
          },
          {
            path: 'reports-for-organization',
            element: guarded(
              PAGE_ACCESS.reportsForOrganization,
              <OrganizationReportsPage />,
            ),
          },
          {
            path: 'students-groups-attendance-statistics/:id',
            element: guarded(
              PAGE_ACCESS.groupsAttendanceStatistics,
              <AbsenceStudentsPage />,
            ),
          },
          {
            path: 'cars',
            element: guarded(PAGE_ACCESS.cars, <CarsPage />),
          },
          {
            path: 'cars/add',
            element: guarded(PAGE_ACCESS.cars, <CarCreatePage />),
          },
          {
            path: 'cars/edit/:id',
            element: guarded(PAGE_ACCESS.cars, <CarEditPage />),
          },
          {
            path: 'cars/updata/:id',
            element: guarded(PAGE_ACCESS.cars, <CarEditPage />),
          },
          {
            path: 'cars/show/:id',
            element: guarded(PAGE_ACCESS.cars, <CarShowPage />),
          },
          {
            path: 'car-road-cost/:id',
            element: guarded(PAGE_ACCESS.cars, <CarRoadCostPage />),
          },
          {
            path: 'rooms',
            element: guarded(PAGE_ACCESS.rooms, <RoomsPage />),
          },
          {
            path: 'rooms/add',
            element: guarded(PAGE_ACCESS.rooms, <RoomCreatePage />),
          },
          {
            path: 'rooms/edit/:id',
            element: guarded(PAGE_ACCESS.rooms, <RoomEditPage />),
          },
          {
            path: 'rooms/show/:id',
            element: guarded(PAGE_ACCESS.rooms, <RoomShowPage />),
          },
          {
            path: 'holidays',
            element: guarded(PAGE_ACCESS.holidays, <HolidaysPage />),
          },
          {
            path: 'holidays/add',
            element: guarded(PAGE_ACCESS.holidays, <HolidayCreatePage />),
          },
          {
            path: 'external-leads',
            element: guarded(PAGE_ACCESS.externalLeads, <ExternalLeadsPage />),
          },
          {
            path: 'useful-infos/video-guides',
            element: guarded(PAGE_ACCESS.videoGuides, <VideoGuidesPage />),
          },
          {
            path: 'useful-infos/video-guides/education',
            element: guarded(PAGE_ACCESS.videoGuides, <EducationGuidesPage />),
          },
          {
            path: 'useful-infos/video-guides/payments',
            element: guarded(PAGE_ACCESS.videoGuides, <PaymentGuidesPage />),
          },
          {
            path: 'frequently-asked-question',
            element: guarded(PAGE_ACCESS.faq, <FaqPage />),
          },
          {
            path: 'trailers',
            element: guarded(PAGE_ACCESS.trailers, <TrailersPage />),
          },
          {
            path: 'trailers/add',
            element: guarded(PAGE_ACCESS.trailers, <TrailerCreatePage />),
          },
          {
            path: 'trailers/edit/:id',
            element: guarded(PAGE_ACCESS.trailers, <TrailerEditPage />),
          },
          {
            path: 'trailers/show/:id',
            element: guarded(PAGE_ACCESS.trailers, <TrailerShowPage />),
          },
          {
            path: 'director-applications',
            element: guarded(
              PAGE_ACCESS.directorApplications,
              <DirectorApplicationsPage />,
            ),
          },
          {
            path: 'problem-situations/create',
            element: guarded(
              PAGE_ACCESS.problemSituations,
              <ProblemSituationCreatePage />,
            ),
          },
          {
            path: 'problem-situations/:id',
            element: guarded(
              PAGE_ACCESS.problemSituations,
              <ProblemSituationEditPage />,
            ),
          },
          {
            path: 'problem-situations',
            element: guarded(
              PAGE_ACCESS.problemSituations,
              <ProblemSituationsPage />,
            ),
          },
          {
            path: 'notifications-service',
            element: guarded(
              PAGE_ACCESS.notificationsService,
              <NotificationsServicePage />,
            ),
          },
          {
            path: 'my-gov-application',
            element: guarded(
              PAGE_ACCESS.myGovApplication,
              <MyGovApplicationPage />,
            ),
          },
          {
            path: 'director/appeals/:id',
            element: guarded(
              PAGE_ACCESS.directorAppeals,
              <AppealDetailPage variant="director" />,
            ),
          },
          {
            path: 'director/appeals',
            element: guarded(
              PAGE_ACCESS.directorAppeals,
              <DirectorAppealsPage />,
            ),
          },
          {
            path: 'template-view-statistic',
            element: guarded(
              PAGE_ACCESS.templateViewStatistic,
              <TemplateViewStatisticPage />,
            ),
          },
          {
            path: 'template-view-statistic-student/:id',
            element: guarded(
              PAGE_ACCESS.templateViewStatistic,
              <TemplateViewStudentShowPage />,
            ),
          },
          {
            path: 'reports-monitoring-by-student',
            element: guarded(
              PAGE_ACCESS.reportsMonitoringByStudent,
              <ReportsMonitoringPage />,
            ),
          },
          {
            path: 'reports-monitoring-by-student-show/:id',
            element: guarded(
              PAGE_ACCESS.reportsMonitoringByStudent,
              <ReportsMonitoringShowPage />,
            ),
          },
          {
            path: 'absence-reason-index',
            element: guarded(
              PAGE_ACCESS.absenceReasonIndex,
              <AbsenceReasonPage />,
            ),
          },
          {
            path: 'reason-student-absence',
            element: guarded(
              PAGE_ACCESS.reasonStudentAbsence,
              <ReasonStudentAbsencePage />,
            ),
          },
          {
            path: 'autodrome-organization-group',
            element: guarded(
              PAGE_ACCESS.autodromeOrganizationGroup,
              <AutodromeAttendancePage />,
            ),
          },
          {
            path: 'autodrome-organization-students/:id',
            element: guarded(
              PAGE_ACCESS.autodromeOrganizationGroup,
              <AutodromeAttendanceStudentsPage />,
            ),
          },
          {
            path: 'autodrome-organization-students-list/:id',
            element: guarded(
              PAGE_ACCESS.autodromeOrganizationGroup,
              <AutodromeConnectedStudentsPage />,
            ),
          },
          {
            path: 'group-practical-attendance',
            element: guarded(
              PAGE_ACCESS.groupPracticalAttendance,
              <PracticalAttendancePage />,
            ),
          },
          {
            path: 'group-practical-attendance-student/:id',
            element: guarded(
              PAGE_ACCESS.groupPracticalAttendance,
              <PracticalAttendanceStudentsPage />,
            ),
          },
          {
            path: 'info-exam-results/:id',
            element: guarded(
              PAGE_ACCESS.infoExamResults,
              <InfoExamResultsShowPage />,
            ),
          },
          {
            path: 'info-exam-results',
            element: guarded(
              PAGE_ACCESS.infoExamResults,
              <InfoExamResultsPage />,
            ),
          },
          {
            path: 'organization-final-exam',
            element: guarded(
              PAGE_ACCESS.organizationFinalExam,
              <OrganizationFinalExamPage />,
            ),
          },
          {
            path: 'autodrome-agreement',
            element: guarded(
              PAGE_ACCESS.autodromeAgreement,
              <AutodromeAgreementPage />,
            ),
          },
          {
            path: 'autodrome-send-agreement',
            element: guarded(
              PAGE_ACCESS.autodromeAgreement,
              <AutodromeAgreementSendPage />,
            ),
          },
          {
            path: 'autodrome-show-agreement/:id',
            element: guarded(
              PAGE_ACCESS.autodromeAgreement,
              <AutodromeAgreementShowPage />,
            ),
          },
          {
            path: 'expenses',
            element: guarded(PAGE_ACCESS.expenses, <ExpensesPage />),
          },
          {
            path: 'payment-dashboard',
            element: guarded(
              PAGE_ACCESS.paymentDashboard,
              <PaymentDashboardPage />,
            ),
          },
          {
            path: 'payment-history',
            element: guarded(
              PAGE_ACCESS.paymentHistory,
              <PaymentHistoryPage />,
            ),
          },
          {
            path: 'payment-history/check/:id',
            element: guarded(
              PAGE_ACCESS.paymentHistory,
              <PaymentCheckPage />,
            ),
          },
          {
            path: 'paymentstudents/addpayment',
            element: guarded(
              PAGE_ACCESS.paymentHistory,
              <StudentPaymentCreatePage />,
            ),
          },
          {
            path: 'paymentstudents/addpayment/:id',
            element: guarded(
              PAGE_ACCESS.paymentHistory,
              <StudentPaymentEditPage />,
            ),
          },
          {
            path: 'debtors',
            element: guarded(PAGE_ACCESS.debtors, <DebtorsPage />),
          },
          {
            path: 'refund',
            element: guarded(PAGE_ACCESS.refund, <RefundPage />),
          },
          {
            path: 'doc',
            element: guarded(PAGE_ACCESS.documents, <DocumentsPage />),
          },
          {
            path: 'final-mark-groups',
            element: guarded(PAGE_ACCESS.finalMarkGroups, <FinalMarkGroupsPage />),
          },
          {
            path: 'pupil-application/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="application" />,
            ),
          },
          {
            path: 'pagetoview/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="contract" />,
            ),
          },
          {
            path: 'group-registration-application/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="registration" />,
            ),
          },
          {
            path: 'statements_doc/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="statements" />,
            ),
          },
          {
            path: 'voucher/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="voucher" />,
            ),
          },
          {
            path: 'personalsheet/two/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="sheet2" />,
            ),
          },
          {
            path: 'personalsheet/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="sheet" />,
            ),
          },
          {
            path: 'mygov-group-approve/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="mygov" />,
            ),
          },
          {
            path: 'jurnal/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="jurnal" />,
            ),
          },
          {
            path: 'practical-exercise/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="practical" />,
            ),
          },
          {
            path: 'group-approved-director/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="approved" />,
            ),
          },
          {
            path: 'doc/warning-letter/:id',
            element: guarded(
              PAGE_ACCESS.documents,
              <GroupDocumentPrintPage kind="warning" />,
            ),
          },
          {
            path: 'content-view-statistic',
            element: guarded(
              PAGE_ACCESS.contentViewStatistic,
              <ContentViewStatisticPage />,
            ),
          },
          {
            path: 'content-view-statistic/by-students/show/:id',
            element: guarded(
              PAGE_ACCESS.contentViewStatistic,
              <ContentViewStudentShowPage />,
            ),
          },
          {
            path: 'content-view-statistic/by-students/:id',
            element: guarded(
              PAGE_ACCESS.contentViewStatistic,
              <ContentViewByStudentsPage />,
            ),
          },
          {
            path: 'attendance',
            element: guarded(PAGE_ACCESS.attendance, <AttendancePage />),
          },
          {
            path: 'exam-templates',
            element: guarded(PAGE_ACCESS.examTemplates, <ExamTemplatesPage />),
          },
          {
            path: 'random-tests',
            element: guarded(PAGE_ACCESS.randomTests, <RandomTestsPage />),
          },
          {
            path: 'all-tests',
            element: guarded(PAGE_ACCESS.allTests, <AllTestsPage />),
          },
          {
            path: 'saved-tests',
            element: guarded(PAGE_ACCESS.savedTests, <SavedTestsPage />),
          },
          {
            path: 'final-exam',
            element: guarded(PAGE_ACCESS.finalExam, <FinalExamPage />),
          },
          {
            path: 'textbooks',
            element: guarded(PAGE_ACCESS.textbooks, <TextbooksPage />),
          },
          {
            path: 'textbooks_lessons/:id',
            element: guarded(PAGE_ACCESS.textbooks, <TextbookEduTypesPage />),
          },
          {
            path: 'subjectclasses/:id',
            element: guarded(PAGE_ACCESS.textbooks, <TextbookTopicsPage />),
          },
          {
            path: 'viewsubject/:id',
            element: guarded(PAGE_ACCESS.textbooks, <TextbookViewPage />),
          },
          {
            path: 'tuitionfees',
            element: guarded(PAGE_ACCESS.tuitionFees, <TuitionFeesPage />),
          },
          {
            path: 'extra-lessons',
            element: guarded(PAGE_ACCESS.extraLessons, <ExtraLessonsPage />),
          },
          {
            path: 'camera-control-attendance',
            element: guarded(
              PAGE_ACCESS.cameraControlAttendance,
              <CameraAttendancePage />,
            ),
          },
          {
            path: 'face-control-warnings',
            element: guarded(
              PAGE_ACCESS.faceControlWarnings,
              <FaceControlWarningsPage />,
            ),
          },
          {
            path: 'monitoring-camera-daily-attendance',
            element: guarded(
              PAGE_ACCESS.monitoringCameraDaily,
              <DailyArrivalsPage />,
            ),
          },
          {
            path: 'myprofile',
            element: guarded(PAGE_ACCESS.profile, <ProfilePage />),
          },
          {
            path: 'director/edit-my-data',
            element: guarded(
              PAGE_ACCESS.directorEditData,
              <DirectorEditDataPage />,
            ),
          },
          ...directorPlaceholderRoutes,
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
