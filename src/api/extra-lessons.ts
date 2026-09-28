import { apiClientV2 } from './client'
import {
  assertOk,
  buildListQuery,
  unwrapPage,
  type FilterItem,
} from '@/lib/apiPage'
import type { ExtraLessonGroup } from '@/types/extra-lessons'

/** GET v2 /groups/with-student-class-dates */
export async function fetchExtraLessonGroups(args: {
  page: number
  showCount: number
  groupSearch: string
  eduStatus: string
  fromDate: string
  toDate: string
}) {
  const filters: FilterItem[] = []
  const name = args.groupSearch.trim()
  if (name) {
    filters.push({
      fieldKey: 'name_uz',
      fieldOperator: 'LIKE',
      fieldValue: name,
    })
  }
  if (args.eduStatus !== '') {
    filters.push({
      fieldKey: 'edu_status',
      fieldOperator: '=',
      fieldValue: args.eduStatus,
    })
  }

  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
    extra: {
      word: name || undefined,
      edu_status: args.eduStatus || undefined,
      from_date: args.fromDate || undefined,
      to_date: args.toDate || undefined,
      'relations[0]': 'organization',
      'relations[1]': 'edu_type',
    },
  })

  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/with-student-class-dates?${query}`,
  )
  assertOk(res)
  return unwrapPage<ExtraLessonGroup>(res, args.page, args.showCount)
}
