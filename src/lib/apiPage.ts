export type FilterItem = {
  fieldKey: string
  fieldOperator: string
  fieldValue: string | number
}

export type ApiPage<T> = {
  data: T[]
  total_items: number
  current_page: number
  last_page: number
}

export type DirectorRow = Record<string, unknown>

export function get(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object' || !path) return undefined
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

export function asText(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (typeof value === 'string') {
    const v = value.trim()
    return v && v !== 'null' ? v : '—'
  }
  if (Array.isArray(value)) {
    const parts = value.map((item) => asText(item)).filter((s) => s !== '—')
    return parts.length ? parts.join(', ') : '—'
  }
  if (typeof value === 'object') {
    const rec = value as Record<string, unknown>
    if ('name' in rec) return asText(rec.name)
    if ('title' in rec) return asText(rec.title)
    if ('short_name' in rec) return asText(rec.short_name)
    if ('character_name' in rec) return asText(rec.character_name)
    if ('body' in rec) return asText(rec.body)
  }
  return '—'
}

export function asLangName(value: unknown, lang: string): string {
  if (value == null) return '—'
  if (typeof value === 'string') return asText(value)
  if (typeof value !== 'object') return asText(value)
  const rec = value as Record<string, unknown>
  const keys =
    lang === 'ru'
      ? ['name_ru', 'ru', 'name']
      : lang === 'kiril'
        ? ['name_kiril', 'name_kr', 'kiril', 'kr', 'name_uz', 'name']
        : ['name_uz', 'uz', 'name']
  for (const key of keys) {
    const hit = rec[key]
    if (hit == null) continue
    if (typeof hit === 'object' && hit && 'body' in hit) {
      const body = asText((hit as { body?: unknown }).body)
      if (body !== '—') return body
    }
    const text = asText(hit)
    if (text !== '—') return text
  }
  return asText(value)
}

export function asFio(row: unknown): string {
  if (!row || typeof row !== 'object') return '—'
  const rec = row as Record<string, unknown>
  const person =
    rec.student && typeof rec.student === 'object'
      ? (rec.student as Record<string, unknown>)
      : rec
  const name = [person.last_name, person.first_name, person.middle_name]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(' ')
  if (name) return name
  const fio = asText(rec.fio)
  return fio === '—' ? asText(rec.student_fullname) : fio
}

export type SortItem = {
  fieldKey: string
  fieldValue: 'ASC' | 'DESC' | string
}

export function buildListQuery(input: {
  page?: number
  show_count?: number
  filters?: FilterItem[]
  sort?: SortItem[]
  extra?: Record<string, string | number | boolean | null | undefined>
}): string {
  const sp = new URLSearchParams()
  if (input.page != null) sp.set('page', String(input.page))
  if (input.show_count != null) sp.set('show_count', String(input.show_count))
  for (const [key, value] of Object.entries(input.extra ?? {})) {
    if (value == null || value === '') continue
    sp.set(key, String(value))
  }
  input.filters?.forEach((filter, i) => {
    if (filter.fieldValue === '' || filter.fieldValue == null) return
    sp.set(`filters[${i}][fieldKey]`, filter.fieldKey)
    sp.set(`filters[${i}][fieldOperator]`, filter.fieldOperator)
    sp.set(`filters[${i}][fieldValue]`, String(filter.fieldValue))
  })
  input.sort?.forEach((item, i) => {
    if (!item.fieldKey || item.fieldValue === '' || item.fieldValue == null) return
    sp.set(`sort[${i}][fieldKey]`, item.fieldKey)
    sp.set(`sort[${i}][fieldValue]`, String(item.fieldValue))
  })
  return sp.toString()
}

export function unwrapPage<T>(
  payload: unknown,
  page = 1,
  showCount = 10,
): ApiPage<T> {
  const body = (payload ?? {}) as Record<string, unknown>
  const nested = body.data
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      total_items: payload.length,
      current_page: page,
      last_page: 1,
    }
  }
  if (Array.isArray(nested)) {
    const total = Number(body.total_items ?? body.total ?? nested.length) || nested.length
    return {
      data: nested as T[],
      total_items: total,
      current_page: Number(body.current_page ?? page) || page,
      last_page:
        Number(body.last_page) || Math.max(1, Math.ceil(total / showCount) || 1),
    }
  }
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>
    const list = Array.isArray(inner.data)
      ? (inner.data as T[])
      : Array.isArray(inner.items)
        ? (inner.items as T[])
        : []
    const total =
      Number(inner.total_items ?? inner.total ?? body.total_items ?? list.length) ||
      list.length
    return {
      data: list,
      total_items: total,
      current_page: Number(inner.current_page ?? body.current_page ?? page) || page,
      last_page:
        Number(inner.last_page ?? body.last_page) ||
        Math.max(1, Math.ceil(total / showCount) || 1),
    }
  }
  return { data: [], total_items: 0, current_page: page, last_page: 1 }
}

export function assertOk(res: { status?: number | boolean; message?: string }) {
  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Request failed')
  }
}

/** `{ data: T }` yoki `{ data: { data: T } }` javobini ochadi. */
export function unwrapEntity<T>(payload: unknown): T {
  const body = (payload ?? {}) as Record<string, unknown>
  const nested = body.data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>
    if (inner.data && typeof inner.data === 'object' && !Array.isArray(inner.data)) {
      return inner.data as T
    }
    return nested as T
  }
  return body as T
}

export function asNamedList<T extends { id?: number | string }>(
  value: unknown,
): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>
    if (Array.isArray(rec.data)) return rec.data as T[]
    if (Array.isArray(rec.items)) return rec.items as T[]
  }
  return []
}
