import { routes } from '@/config/routes'

export const GUIDE_TELEGRAM = 'https://t.me/eavtotalimuz'

export type GuideModule = {
  id: string
  titleKey: string
  count: number
  to?: string
}

export type GuideVideo = {
  id: string
  youtubeId: string
  titleKey: string
}

export const GUIDE_MODULES: GuideModule[] = [
  { id: 'education', titleKey: 'videoGuidesPage.education', count: 5, to: routes.videoGuidesEducation },
  { id: 'exams', titleKey: 'videoGuidesPage.exams', count: 0 },
  { id: 'payments', titleKey: 'videoGuidesPage.payments', count: 1, to: routes.videoGuidesPayments },
  { id: 'print', titleKey: 'videoGuidesPage.print', count: 0 },
  { id: 'users', titleKey: 'videoGuidesPage.users', count: 0 },
  { id: 'settings', titleKey: 'videoGuidesPage.settings', count: 0 },
  { id: 'finalExam', titleKey: 'videoGuidesPage.finalExam', count: 0 },
  { id: 'workly', titleKey: 'videoGuidesPage.workly', count: 0 },
]

export const EDUCATION_VIDEOS: GuideVideo[] = [
  { id: 'add-student', youtubeId: 'NjxvjYOqNcI', titleKey: 'videoGuidesPage.vAddStudent' },
  { id: 'create-group', youtubeId: 'dZDy5rkfj6A', titleKey: 'videoGuidesPage.vCreateGroup' },
  { id: 'attach-student', youtubeId: 'ryVMd8fWWZE', titleKey: 'videoGuidesPage.vAttachStudent' },
  { id: 'attach-teacher', youtubeId: '98pX4XN-zw4', titleKey: 'videoGuidesPage.vAttachTeacher' },
  { id: 'group-permission', youtubeId: 'eABbxRMxZoo', titleKey: 'videoGuidesPage.vGroupPermission' },
]

export const PAYMENT_VIDEOS: GuideVideo[] = [
  { id: 'accounting', youtubeId: '3OQigTDXhxQ', titleKey: 'videoGuidesPage.vAccounting' },
]
