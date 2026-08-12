import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout'
import { PAGE_ACCESS } from '@/config/access'
import { routes } from '@/config'
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
  RoadSignsPage,
  RoadSignsTypePage,
  SavedTopicsPage,
  StudentsPage,
} from '@/pages'

function guarded(
  permission: (typeof PAGE_ACCESS)[keyof typeof PAGE_ACCESS],
  element: ReactNode,
) {
  return <RequireAuth permission={permission}>{element}</RequireAuth>
}

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
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
