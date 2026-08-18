import type { LessonNameLang } from './lessons'

export type AppealTarget = 'organization' | 'system'

export type AppealStatus =
  | 'new'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'answered'
  | string

export type AppealType = {
  id: number
  name?: LessonNameLang | null
}

export type AppealListItem = {
  id: number
  message?: string | null
  target?: AppealTarget | string | null
  status?: AppealStatus | null
  is_closed?: boolean | number | null
  created_at?: string | null
  updated_at?: string | null
  student?: {
    id?: number
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
    image?: string | null
  } | null
  appeal_type?: AppealType | null
}

export type AppealComment = {
  id?: number
  user_name?: string | null
  comment?: string | null
  status?: AppealStatus | null
  created_at?: string | null
}

export type AppealDetail = AppealListItem & {
  is_justified?: boolean | number | null
  is_archived?: boolean | number | null
  comments?: AppealComment[] | null
  files?: Array<{ id?: number; path?: string; name?: string }> | null
}

export type AppealsPage = {
  data: AppealListItem[]
  total_items: number
  current_page?: number
  last_page?: number
}

export type AppealsFilters = {
  page?: number
  showCount?: number
  lastName?: string | null
  firstName?: string | null
  middleName?: string | null
  appealTypeId?: number | string | null
  isClosed?: 0 | 1 | null
  status?: string | null
}
