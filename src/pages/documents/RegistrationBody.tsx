import { useAuth } from '@/features/auth'
import { formatDate, fullNameOf } from '@/lib'
import type { PrintGroupData, PrintRegTeacher } from '@/types/documents'
import './registrationPrint.css'

const DAY: Record<number, string> = {
  1: 'Du',
  2: 'Se',
  3: 'Cho',
  4: 'Pa',
  5: 'Ju',
  6: 'Sha',
  7: 'Yak',
}

export function dashDate(value?: string | null) {
  if (!value) return ''
  const formatted = formatDate(value)
  return (formatted || value).replace(/\./g, '-')
}

export function clock(value?: string | null) {
  if (!value) return '_____'
  return value.slice(0, 5)
}

export function weekWords(value: string | number[] | null | undefined) {
  let days: number[] = []
  if (Array.isArray(value)) {
    days = value.map(Number)
  } else if (value) {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed)) days = parsed.map(Number)
    } catch {
      days = []
    }
  }
  const labels = days.map((d) => DAY[d]).filter(Boolean)
  return labels.length ? labels.join(' ') : '__________________________________________'
}

function teacherFio(row: PrintRegTeacher) {
  return row.fio || fullNameOf(row) || '________'
}

export function TeacherCard({
  row,
  withCar,
}: {
  row: PrintRegTeacher
  withCar?: boolean
}) {
  const degree = row.education_degree?.name || '_________'
  const diplom = dashDate(row.diplom_given_date) || '___________'
  const license = row.license_number
    ? `${row.license_seria ?? ''} ${row.license_number}`.trim()
    : '_____________'
  const licenseDate = dashDate(row.license_date) || '___________'
  const cert = row.certificate_number
    ? `${row.certificate_seria ?? ''} ${row.certificate_number}`.trim()
    : '_____________'
  const certDate = dashDate(row.certificate_given_date) || '___________'

  return (
    <div className={withCar ? 'reg-teacher reg-practical' : 'reg-teacher'}>
      <div>
        <p>
          F.I.O: <b>{teacherFio(row)}</b>
        </p>
        <p>
          Ma'lumoti: <b>{degree}</b>{' '}
          <b>({diplom} yilda olingan)</b>
        </p>
        <p>
          Haydovchilik guvohnomasi: №: <b>{license}</b>{' '}
          <b>({licenseDate} yilda berilgan)</b>
        </p>
        <p>
          Boshqarishni o'rgatuvchi guvohnomasi: №: <b>{cert}</b>{' '}
          <b>({certDate} yilda berilgan)</b>
        </p>
      </div>
      {withCar && row.car ? (
        <div>
          <p>
            Avtomobil:{' '}
            <b>{row.car.name || '___________'}</b>
          </p>
          <p>
            Davlat raqami:{' '}
            <b>{row.car.number || '___________'}</b>
          </p>
          <p>
            Ishlab chiqarilgan yil:{' '}
            <b>{row.car.year_of_manufacture || '___________'}</b>
          </p>
        </div>
      ) : null}
    </div>
  )
}

export function RegistrationBody({
  data,
  teachers,
  practicalTeachers,
}: {
  data: PrintGroupData
  teachers: PrintRegTeacher[]
  practicalTeachers: PrintRegTeacher[]
}) {
  const { me } = useAuth()
  const group = data.group
  const org = data.organization
  const groupLabel =
    (group?.name && typeof group.name === 'object'
      ? group.name.uz
      : null) ||
    group?.name_uz ||
    (typeof group?.name === 'string' ? group.name : '') ||
    "guruhning o'zbekcha nomi kiritilmagan!"
  const cat =
    group?.edu_type?.character_name ||
    data.edu_type?.character_name ||
    data.edu_type?.short_name_en ||
    '__________'
  const inn =
    me?.profession?.organization?.inn || org?.inn || '________'
  const orgName = org?.name || org?.name_uz || '________'
  const address =
    org?.address || me?.profession?.organization?.address || ''
  const start = dashDate(group?.edu_starting_date || data.starting_date)
  const end = dashDate(group?.edu_ending_date || data.ending_date)

  return (
    <div className="group-registration-print">
      <div>
        <span>
          Guruh:{' '}
          <u>
            <strong>{groupLabel}</strong>
          </u>
        </span>
        <br />
        <span>
          Tashkilot inn:{' '}
          <u>
            <strong>{inn}</strong>
          </u>
        </span>
      </div>
      <div className="reg-center">
        <span>{orgName}</span>
        <br />
        <span>
          {cat} {groupLabel}
        </span>
        {' '}
        - o'quv guruhini ro'yhatdan o'tkazishni so'raydi.
      </div>
      <table className="reg-info">
        <tbody>
          <tr>
            <td>Manzilimiz</td>
            <td>
              <b>{address}</b>
            </td>
          </tr>
          <tr>
            <td>Mashg'ulotlarning boshlanishi:</td>
            <td>
              <b>{start}</b>
            </td>
          </tr>
          <tr>
            <td>Mashg'ulotlarning tugashi:</td>
            <td>
              <b>{end}</b>
            </td>
          </tr>
          <tr>
            <td>Nazariy mashg'ulot kunlari:</td>
            <td>
              <b>{weekWords(group?.week_days)}</b>
            </td>
          </tr>
          <tr>
            <td>Mashg'ulot vaqti:</td>
            <td>
              soat <b>{clock(group?.start_time)}</b> dan{' '}
              <b>{clock(group?.end_time)}</b> gacha.
            </td>
          </tr>
          <tr>
            <td>Amaliy mashg'ulotlar kunlari:</td>
            <td>
              <b>{weekWords(group?.practical_week_days)}</b>
            </td>
          </tr>
          <tr>
            <td>Mashg'ulot vaqti:</td>
            <td>
              soat <b>{clock(group?.practical_start_time)}</b> dan{' '}
              <b>{clock(group?.practical_end_time)}</b> gacha.
            </td>
          </tr>
        </tbody>
      </table>

      <div className="reg-section">O'qituvchilar:</div>
      {teachers.map((row, index) => (
        <TeacherCard key={row.id ?? `t-${index}`} row={row} />
      ))}

      <div className="reg-section">Haydovchi yo'riqchi o'rgatuvchilar:</div>
      {practicalTeachers.map((row, index) => (
        <TeacherCard key={row.id ?? `p-${index}`} row={row} withCar />
      ))}
    </div>
  )
}
