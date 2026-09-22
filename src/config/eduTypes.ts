export type EduTypeMeta = {
  id: number
  shortName: string
  nameKey: string
}

/** Eski front `eduTypesStaticData` bilan bir xil tartib. */
export const EDU_TYPES: EduTypeMeta[] = [
  { id: 2, shortName: 'A', nameKey: 'dashboard.eduA' },
  { id: 1, shortName: 'B', nameKey: 'dashboard.eduB' },
  { id: 4, shortName: 'BC', nameKey: 'dashboard.eduBC' },
  { id: 3, shortName: 'C(T)', nameKey: 'dashboard.eduCT' },
  { id: 8, shortName: 'C(QT)', nameKey: 'dashboard.eduCQT' },
  { id: 7, shortName: 'BE(QT)', nameKey: 'dashboard.eduBEQT' },
  { id: 6, shortName: 'CE(QT)', nameKey: 'dashboard.eduCEQT' },
  { id: 9, shortName: 'DE(QT)', nameKey: 'dashboard.eduDEQT' },
  { id: 5, shortName: 'D(QT)', nameKey: 'dashboard.eduDQT' },
  { id: 10, shortName: 'MO', nameKey: 'dashboard.eduMO' },
  { id: 63, shortName: 'I(QT)', nameKey: 'dashboard.eduIQT' },
]

const EDU_ORDER: Record<number, number> = {
  2: 1,
  1: 2,
  4: 3,
  3: 4,
  8: 5,
  7: 6,
  6: 7,
  9: 8,
  5: 9,
  10: 10,
  63: 11,
}

export function eduTypeShortName(id: number | null | undefined): string {
  if (id == null) return '—'
  return EDU_TYPES.find((item) => item.id === id)?.shortName ?? '—'
}

export function sortEduTypes<T extends { edu_type_id: number }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      (EDU_ORDER[a.edu_type_id] ?? Number.POSITIVE_INFINITY) -
      (EDU_ORDER[b.edu_type_id] ?? Number.POSITIVE_INFINITY),
  )
}
