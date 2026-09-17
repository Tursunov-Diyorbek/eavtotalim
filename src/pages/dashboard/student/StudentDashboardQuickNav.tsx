import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  Scale,
} from 'lucide-react'
import { routes } from '@/config'
import { cn } from '@/lib'

const ITEMS = [
  { to: routes.lessons, labelKey: 'nav.lessons', icon: BookOpen, tone: 'text-signal bg-signal/10' },
  {
    to: routes.lessonSchedule,
    labelKey: 'nav.lessonSchedule',
    icon: CalendarClock,
    tone: 'text-teal bg-teal-soft',
  },
  { to: routes.penalties, labelKey: 'nav.penalties', icon: Scale, tone: 'text-rose bg-rose-soft' },
  {
    to: routes.examTemplates,
    labelKey: 'nav.examTemplates',
    icon: ClipboardList,
    tone: 'text-amber bg-amber-soft',
  },
] as const

export function StudentDashboardQuickNav() {
  const { t } = useTranslation()

  return (
    <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      {ITEMS.map(({ to, labelKey, icon: Icon, tone }) => (
        <Link
          key={to}
          to={to}
          className="flex items-center gap-1.5 rounded-lg border border-mist/60 bg-white px-2 py-1.5 transition hover:border-signal/40 hover:shadow-sm"
        >
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-md',
              tone,
            )}
          >
            <Icon className="size-3.5" aria-hidden />
          </span>
          <span className="line-clamp-2 text-[10px] leading-tight font-medium text-deep">
            {t(labelKey)}
          </span>
        </Link>
      ))}
    </nav>
  )
}
