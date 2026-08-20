const DAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'] as const

export function practicalDayLabel(day: string | number) {
  const n = Number(day)
  return DAY_LABELS[n - 1] ?? String(day)
}

export function asDayList(value: Array<string | number> | null | undefined) {
  if (!Array.isArray(value)) return []
  return value.filter((day) => day !== '' && day != null)
}
