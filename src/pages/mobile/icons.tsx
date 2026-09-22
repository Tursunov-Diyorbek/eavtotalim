import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  Car,
  ChartLine,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  FileText,
  Gavel,
  GraduationCap,
  Home,
  IdCard,
  Inbox,
  LayoutGrid,
  List,
  Lock,
  Menu,
  PlayCircle,
  ScanLine,
  School,
  Shield,
  SquareX,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'

export const ICON_TONES: Record<string, { bg: string; color: string }> = {
  blue: { bg: '#e3f0ff', color: '#3b82f6' },
  purple: { bg: '#efeaff', color: '#8b5cf6' },
  red: { bg: '#ffe8eb', color: '#ef4444' },
  amber: { bg: '#fff4e0', color: '#f59e0b' },
  green: { bg: '#e6f8ef', color: '#10b981' },
  teal: { bg: '#e4f7f5', color: '#14b8a6' },
  navy: { bg: '#e8eef3', color: '#3d5a6c' },
  pink: { bg: '#fde8f3', color: '#ec4899' },
  cyan: { bg: '#e0f7fa', color: '#06b6d4' },
  orange: { bg: '#ffedd5', color: '#f97316' },
}

export function SmIcon({
  icon: Icon,
  tone = 'blue',
  size = 18,
  className = '',
  onDark = false,
}: {
  icon: LucideIcon
  tone?: keyof typeof ICON_TONES | string
  size?: number
  className?: string
  onDark?: boolean
}) {
  const palette = ICON_TONES[tone] || ICON_TONES.blue
  return (
    <span
      className={cn(
        'sm-icon-chip',
        onDark && 'sm-icon-chip--on-dark',
        className,
      )}
      style={onDark ? undefined : { background: palette.bg, color: palette.color }}
    >
      <Icon size={size} strokeWidth={2} />
    </span>
  )
}

export const Icons = {
  home: Home,
  lessons: BookOpen,
  schedule: Calendar,
  group: Users,
  attendance: ScanLine,
  missed: SquareX,
  schools: School,
  practical: Wrench,
  autodrome: Car,
  roadSigns: Shield,
  penalties: Gavel,
  appeal: FileText,
  tests: FileText,
  testsFilled: ClipboardList,
  lessonsFilled: BookOpen,
  scheduleFilled: Calendar,
  warningFilled: AlertTriangle,
  templateTests: ChartLine,
  mixedTests: LayoutGrid,
  allTests: List,
  savedTests: BookMarked,
  finalExam: Car,
  menu: Menu,
  user: User,
  bell: Bell,
  close: X,
  down: ChevronDown,
  up: ChevronUp,
  back: ArrowLeft,
  right: ChevronRight,
  lock: Lock,
  play: PlayCircle,
  warning: AlertTriangle,
  academic: GraduationCap,
  id: IdCard,
  teacher: IdCard,
  inbox: Inbox,
  check: CheckCircle2,
}

export const TabIcons = {
  home: Home,
  lessons: BookOpen,
  tests: ClipboardList,
  penalties: Gavel,
  profile: User,
}
