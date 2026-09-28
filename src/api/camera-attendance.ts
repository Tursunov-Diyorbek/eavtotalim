import { apiClientV2 } from './client'
import { assertOk, buildListQuery, unwrapPage, type FilterItem } from '@/lib/apiPage'
import type {
  CameraPendingStats,
  CameraPendingStudent,
} from '@/types/camera-attendance'

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function pickNum(source: Record<string, unknown> | null, keys: string[]) {
  if (!source) return null
  for (const key of keys) {
    if (source[key] == null || source[key] === '') continue
    const n = Number(source[key])
    if (Number.isFinite(n)) return n
  }
  return null
}

function readStats(body: Record<string, unknown>): CameraPendingStats {
  const nested = asRecord(body.data)
  const bag =
    asRecord(body.counts) ??
    asRecord(body.statistics) ??
    asRecord(body.report) ??
    asRecord(nested?.counts) ??
    asRecord(nested?.statistics) ??
    asRecord(nested?.report)

  return {
    total: pickNum(bag, ['all', 'total', 'jami', 'all_count', 'total_count']),
    sent: pickNum(bag, ['sent', 'sended', 'sent_count', 'success', 'success_count']),
    sending: pickNum(bag, [
      'sending',
      'pending',
      'process',
      'sending_count',
      'pending_count',
    ]),
    error: pickNum(bag, ['error', 'failed', 'error_count', 'fail', 'failed_count']),
    old: pickNum(bag, ['old', 'old_record', 'eski', 'eski_yozuv', 'status_8']),
  }
}

function readOptions(body: Record<string, unknown>, keys: string[]) {
  const bags = [
    body,
    asRecord(body.data),
    asRecord(body.filters),
    asRecord(asRecord(body.data)?.filters),
  ].filter((item): item is Record<string, unknown> => item != null)

  for (const bag of bags) {
    for (const key of keys) {
      const list = bag[key]
      if (!Array.isArray(list)) continue
      const options = list.flatMap((item) => {
        if (!item || typeof item !== 'object') return []
        const rec = item as Record<string, unknown>
        const id = rec.id ?? rec.value
        if (id == null || id === '') return []
        const raw = rec.name_uz ?? rec.name ?? rec.label ?? rec.title
        const name = typeof raw === 'string' && raw.trim() ? raw.trim() : String(id)
        return [{ id: String(id), name }]
      })
      if (options.length) return options
    }
  }
  return []
}

/** GET v2 /monitoring-camera/pending-students */
export async function fetchCameraPendingStudents(args: {
  page: number
  showCount: number
  groupId: string
  status: string
  search: string
}) {
  const filters: FilterItem[] = []
  if (args.groupId) {
    filters.push({
      fieldKey: 'group_id',
      fieldOperator: '=',
      fieldValue: args.groupId,
    })
  }
  if (args.status) {
    filters.push({
      fieldKey: 'status',
      fieldOperator: '=',
      fieldValue: args.status,
    })
  }
  const search = args.search.trim()
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
    extra: {
      group_id: args.groupId || undefined,
      status: args.status || undefined,
      word: search || undefined,
      fio: search || undefined,
      student_search: search || undefined,
      'relations[0]': 'student',
      'relations[1]': 'faceControlType',
      'relations[2]': 'group',
    },
  })

  const res = await apiClientV2.get<Record<string, unknown>>(
    `/monitoring-camera/pending-students?${query}`,
  )
  assertOk(res)
  const page = unwrapPage<CameraPendingStudent>(res, args.page, args.showCount)
  return {
    ...page,
    stats: readStats(res),
    groups: readOptions(res, ['groups', 'group_list']),
    statuses: readOptions(res, ['statuses', 'status_list']),
  }
}
