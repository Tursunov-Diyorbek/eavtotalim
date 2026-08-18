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
  DirectorResourcePage,
  RoadSignsPage,
  RoadSignsTypePage,
  SavedTopicsPage,
  StudentsPage,
  AddStudentPage,
  StudentShowPage,
  StudentEditPage,
  AssignedLimitPage,
  TeachersPage,
  TeacherCreatePage,
  TeacherEditPage,
  TeacherShowPage,
  CarsPage,
  CarCreatePage,
  CarEditPage,
  CarShowPage,
  TemplateViewStatisticPage,
  ContentViewStatisticPage,
  ContentViewByStudentsPage,
  GroupsPage,
  GroupShowPage,
  GroupEditPage,
  RoomsPage,
  RoomCreatePage,
  RoomEditPage,
  RoomShowPage,
  HolidaysPage,
  HolidayCreatePage,
  TrailersPage,
  ProblemSituationsPage,
  ProblemSituationCreatePage,
  ProblemSituationEditPage,
  NotificationsServicePage,
  MyGovApplicationPage,
  TrailerCreatePage,
  TrailerEditPage,
  TrailerShowPage,
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
        path: 'random-tests/take',
        element: guarded(PAGE_ACCESS.randomTests, <TakeRandomTestPage />),
      },
      {
        path: 'final-exam/take',
        element: guarded(PAGE_ACCESS.finalExam, <TakeFinalExamPage />),
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
            path: 'group/:id',
            element: guarded(PAGE_ACCESS.groups, <GroupShowPage />),
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
            path: 'content-view-statistic',
            element: guarded(
              PAGE_ACCESS.contentViewStatistic,
              <ContentViewStatisticPage />,
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
