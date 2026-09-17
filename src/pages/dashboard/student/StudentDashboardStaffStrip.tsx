import { useTranslation } from 'react-i18next'
import { Car, Users } from 'lucide-react'
import {
  Badge,
  Panel,
  SafeImage,
  Skeleton,
  SkeletonLines,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import { useGroupDetailsQuery } from '@/features/group-details'
import { resolveFileUrl } from '@/features/lessons'

type Props = {
  studentId: number
}

/** Ixcham o‘qituvchi / avtomobil ro‘yxati — dashboard pastki qator. */
export function StudentDashboardStaffStrip({ studentId }: Props) {
  const { t } = useTranslation()
  const { data: details, isLoading } = useGroupDetailsQuery(studentId)
  const teachers = details?.teachers ?? []
  const cars = details?.cars ?? []

  if (isLoading) {
    return (
      <div className="grid gap-2 lg:grid-cols-2">
        <Panel padding="sm">
          <Skeleton className="mb-1.5 h-3 w-36" />
          <SkeletonLines lines={2} />
        </Panel>
        <Panel padding="sm">
          <Skeleton className="mb-1.5 h-3 w-36" />
          <SkeletonLines lines={2} />
        </Panel>
      </div>
    )
  }

  if (!teachers.length && !cars.length) return null

  return (
    <div
      className={
        teachers.length && cars.length
          ? 'grid gap-2 lg:grid-cols-2'
          : 'grid gap-2'
      }
    >
      {teachers.length ? (
        <Panel padding="sm" className="space-y-1.5">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            <Users className="size-3 text-signal" aria-hidden />
            {t('groupDetails.teachersTitle')}
          </p>
          <ul className="space-y-1">
            {teachers.map((teacher, index) => (
              <li
                key={teacher.id ?? index}
                className="flex items-center justify-between gap-2 rounded-lg border border-mist/50 bg-fog/20 px-2 py-1"
              >
                <span className="min-w-0 truncate text-[11px] font-medium text-deep">
                  {teacher.full_name || '—'}
                </span>
                {teacher.specialization ? (
                  <Badge tone="teal" className="shrink-0 text-[9px]">
                    {teacher.specialization}
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {cars.length ? (
        <Panel padding="sm" className="space-y-1.5">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            <Car className="size-3 text-signal" aria-hidden />
            {t('groupDetails.carsTitle')}
          </p>
          <ul className="space-y-1">
            {cars.map((car, index) => {
              const src = resolveFileUrl(car.photo, PATH_PREFIX_FILE)
              return (
                <li
                  key={car.id ?? index}
                  className="flex items-center gap-2 rounded-lg border border-mist/50 bg-fog/20 px-2 py-1"
                >
                  <SafeImage
                    src={src}
                    size="sm"
                    className="size-8 shrink-0 rounded-md ring-1 ring-mist/70"
                  />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-deep">
                    {car.name || '—'}
                  </span>
                  {car.number ? (
                    <Badge tone="teal" className="shrink-0 text-[9px]">
                      {car.number}
                    </Badge>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </Panel>
      ) : null}
    </div>
  )
}
