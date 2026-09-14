import { useAuth } from '@/features/auth'
import { fullNameOf } from '@/lib'
import type { GroupStudentRow } from '@/types/groups'
import type { PrintGroupData, PrintRegTeacher } from '@/types/documents'
import { Badge } from '@/components/ui'
import { TeacherCard, dashDate, weekWords } from './RegistrationBody'
import './statementsPrint.css'

function timeLabel(value?: string | null) {
  return value || '_____'
}

function pickRegion(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value !== 'object') return ''
  const rec = value as Record<string, unknown>
  const name = rec.name
  if (typeof name === 'string' && name.trim()) return name.trim()
  if (name && typeof name === 'object') {
    const n = name as Record<string, unknown>
    if (typeof n.uz === 'string' && n.uz.trim()) return n.uz.trim()
  }
  if (typeof rec.name_kiril === 'string' && rec.name_kiril.trim()) {
    return rec.name_kiril.trim()
  }
  if (typeof rec.name_uz === 'string' && rec.name_uz.trim()) return rec.name_uz.trim()
  return ''
}

export function StatementsBody({
  data,
  teachers,
  practicalTeachers,
  students,
}: {
  data: PrintGroupData
  teachers: PrintRegTeacher[]
  practicalTeachers: PrintRegTeacher[]
  students: GroupStudentRow[]
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
    ''
  const cat =
    group?.edu_type?.character_name ||
    data.edu_type?.character_name ||
    data.edu_type?.short_name_en ||
    ''
  const inn = me?.profession?.organization?.inn || org?.inn || ''
  const orgName = org?.name || org?.name_uz || ''
  const address =
    org?.address || me?.profession?.organization?.address || ''
  const region =
    pickRegion(org?.region) ||
    pickRegion(data.region) ||
    pickRegion(me?.profession?.organization?.region)
  const director = [
    me?.profession?.last_name,
    me?.profession?.first_name,
    me?.profession?.middle_name,
  ]
    .filter(Boolean)
    .join(' ') || fullNameOf(data.director) || ''

  const rows = [...students].sort((a, b) =>
    String(a.last_name ?? '').localeCompare(String(b.last_name ?? ''), 'uz'),
  )

  return (
    <div className="statements-doc">
      <div className="st-top">
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
        <span className="st-top-right">
          <b>
            {region} IIB YHHB boshligʼi
          </b>
          <br />
          <b>______________________________ga</b>
        </span>
      </div>

      <h5>Oʼquv guruhini roʼyhatga olish toʼgʼrisida</h5>
      <div className="st-lead">
        <b>
          {orgName} &nbsp; {groupLabel}
        </b>{' '}
        guruhini <b>{cat}</b>&nbsp; boʼyicha avtotransport vositasi
        haydovchilarini tayyorlash (qayta tayyorlash) uchun roʼyhatga
        olishingizni soʼrayman.
      </div>

      <table className="st-info">
        <tbody>
          <tr>
            <td>Manzilimiz</td>
            <td>{address}</td>
          </tr>
          <tr>
            <td>Mashg'ulotlarning boshlanishi:</td>
            <td>{dashDate(group?.edu_starting_date || data.starting_date)}</td>
          </tr>
          <tr>
            <td>Mashg'ulotlarning tugashi:</td>
            <td>{dashDate(group?.edu_ending_date || data.ending_date)}</td>
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
              soat <b>{timeLabel(group?.start_time)}</b> dan{' '}
              <b>{timeLabel(group?.end_time)}</b> gacha.
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
              soat <b>{timeLabel(group?.practical_start_time)}</b> dan{' '}
              <b>{timeLabel(group?.practical_end_time)}</b> gacha.
            </td>
          </tr>
        </tbody>
      </table>

      <h5>Oʼqituvchilar</h5>
      {teachers.map((row, index) => (
        <TeacherCard key={row.id ?? `t-${index}`} row={row} />
      ))}

      <h5>Avtomabil boshqarish haydovchi-yo'riqchilari:</h5>
      {practicalTeachers.map((row, index) => (
        <TeacherCard key={row.id ?? `p-${index}`} row={row} withCar />
      ))}

      <h5>
        "{cat}" toifali "{groupLabel}"-oʼquv guruhi OʼQUVCHILARINING ROʼYHATI:
      </h5>
      <table className="st-students">
        <thead>
          <tr>
            <th>T/R</th>
            <th>F.I.Sh</th>
            <th>Tug’ilgan sana</th>
            <th>Turar joyi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const fio = [row.last_name, row.first_name, row.middle_name]
              .filter(Boolean)
              .join(' ')
            const place = row.address
            const missing = place === 'null' || place === 'undefined'
            return (
              <tr key={row.id ?? `${fio}-${index}`}>
                <td>{index + 1}</td>
                <td>{fio}</td>
                <td>{row.birthday || ''}</td>
                <td>
                  {missing ? (
                    <Badge tone="rose">Manzil kiritilmagan!</Badge>
                  ) : (
                    place
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="st-foot">
        <b>{orgName} boshlig’i:</b>
        <b>
          {director}
          <span> Imzo: ________</span>
        </b>
      </div>
    </div>
  )
}
