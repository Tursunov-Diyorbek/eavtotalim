export type WeekPart = {
  count?: number | null
  groups?: { id?: number; name?: string | null }[] | null
}

export type WeekDaySlot = {
  day?: number | null
  total_groups?: number | null
  part1?: WeekPart | null
  part2?: WeekPart | null
}

export type ScheduleWeekday = {
  day?: number | null
  part?: number | null
}

export type ScheduleGroup = {
  id: number
  name?: string | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  edu_type?: {
    name?: string | null
    short_name?: string | null
    character_name?: string | null
  } | null
  organization?: { name?: string | null; inn?: string | null } | null
  autodrome_weekdays?: ScheduleWeekday[] | null
}
