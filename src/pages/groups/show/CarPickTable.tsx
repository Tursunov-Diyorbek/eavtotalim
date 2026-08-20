import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge, Checkbox, Pagination } from '@/components/ui'
import { carShowPath } from '@/config'
import { asText } from '@/lib/apiPage'
import { fullNameOf } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { AvailableGroupCar, GroupItem } from '@/types/groups'

export function carAgeOf(year: string | number | null | undefined) {
  const n = Number(year)
  if (!Number.isFinite(n) || n <= 0) return null
  return new Date().getFullYear() - n
}

export function categoryAllowed(
  access: GroupItem['car_category_edu_type_access'],
  code?: string | null,
) {
  if (!code) return false
  if (Array.isArray(access)) return access.includes(code)
  if (typeof access === 'string') return access.includes(code)
  return false
}

export function yearOk(eduTypeId: number | undefined, age: number | null) {
  if (age == null) return false
  if ([1, 2, 4, 7].includes(eduTypeId ?? 0)) return age <= 10
  return age <= 20
}

export function carSelectable(
  car: AvailableGroupCar,
  group: GroupItem,
  bypass: boolean,
) {
  if (bypass) return true
  const age = carAgeOf(car.year_of_manufacture)
  const eduTypeId = group.edu_type?.id
  return (
    yearOk(eduTypeId, age) &&
    Boolean(car.teacher) &&
    Boolean(car.status) &&
    Number(car.mspd_status) === 1 &&
    categoryAllowed(group.car_category_edu_type_access, car.car_category?.code)
  )
}

type CarPickTableProps = {
  rows: AvailableGroupCar[]
  group: GroupItem
  bypass: boolean
  page: number
  pageSize?: number
  onPageChange: (page: number) => void
  mode: 'checkbox' | 'radio'
  selectedIds: number[]
  onToggle: (id: number, checked: boolean) => void
}

/** Eski AddCarModal / ReplaceCarModal jadvali. */
export function CarPickTable({
  rows,
  group,
  bypass,
  page,
  pageSize = 10,
  onPageChange,
  mode,
  selectedIds,
  onToggle,
}: CarPickTableProps) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const slice = rows.slice((page - 1) * pageSize, page * pageSize)
  const eduTypeId = group.edu_type?.id

  return (
    <div className="space-y-2">
      <div className="max-h-[50vh] overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-fog text-muted">
            <tr>
              <th className="w-10 px-2 py-2" />
              <th className="px-2 py-2">{t('groupsPage.showPage.carBrand')}</th>
              <th className="px-2 py-2">{t('groupsPage.showPage.carNumber')}</th>
              <th className="px-2 py-2">{t('groupsPage.showPage.carYear')}</th>
              <th className="px-2 py-2">{t('groupsPage.showPage.carMspd')}</th>
              <th className="px-2 py-2">{t('groupsPage.showPage.carTeacher')}</th>
              <th className="px-2 py-2">{t('groupsPage.showPage.eduCategory')}</th>
              <th className="px-2 py-2">{t('directorList.status')}</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => {
              const age = carAgeOf(row.year_of_manufacture)
              const okYear = yearOk(eduTypeId, age)
              const okMspd = Number(row.mspd_status) === 1
              const okCat = categoryAllowed(
                group.car_category_edu_type_access,
                row.car_category?.code,
              )
              const active = Boolean(row.status)
              const disabled = !carSelectable(row, group, bypass)
              return (
                <tr key={row.id} className="border-t border-mist/60">
                  <td className="px-2 py-2">
                    {mode === 'checkbox' ? (
                      <Checkbox
                        disabled={disabled}
                        checked={selectedIds.includes(row.id)}
                        onChange={(checked) => onToggle(row.id, checked)}
                      />
                    ) : (
                      <input
                        type="radio"
                        name="pick-car"
                        disabled={disabled}
                        className="accent-signal"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => onToggle(row.id, true)}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2 font-medium">{asText(row.name)}</td>
                  <td className="px-2 py-2">{asText(row.number)}</td>
                  <td className={cn('px-2 py-2', okYear ? 'text-teal' : 'text-rose')}>
                    {row.year_of_manufacture
                      ? `${row.year_of_manufacture}${age != null ? ` (${age} ${t('groupsPage.showPage.yearsShort')})` : ''}`
                      : '—'}
                  </td>
                  <td className="px-2 py-2">
                    <Badge tone={okMspd ? 'teal' : Number(row.mspd_status) === 0 ? 'amber' : 'rose'}>
                      {okMspd
                        ? t('teachersPage.mspdOk')
                        : Number(row.mspd_status) === 0
                          ? t('teachersPage.mspdPending')
                          : t('teachersPage.mspdBad')}
                    </Badge>
                  </td>
                  <td className="px-2 py-2">
                    {row.teacher ? (
                      <span className="text-teal">{fullNameOf(row.teacher)}</span>
                    ) : (
                      <span className="text-rose">
                        {t('groupsPage.showPage.teacherNotAttached')}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <Link
                      to={carShowPath(row.id)}
                      className={cn(
                        'font-semibold hover:underline',
                        okCat ? 'text-teal' : 'text-rose',
                      )}
                    >
                      {asText(row.car_category?.name) || t('common.selectPlaceholder')}
                    </Link>
                  </td>
                  <td className="px-2 py-2">
                    <Badge tone={active ? 'teal' : 'rose'}>
                      {active ? t('dashboard.active') : t('dashboard.inactive')}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={rows.length}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  )
}
