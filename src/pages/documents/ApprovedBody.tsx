import { useState } from 'react'
import { useParams } from 'react-router-dom'
import logo from '@/assets/images/logo_old2.png'
import { useGroupCarsQuery } from '@/features/groups'
import { formatPhoneLocal, parsePhoneDigits } from '@/lib'
import type {
  PrintGroupData,
  PrintPerson,
  PrintRegion,
  PrintRegTeacher,
  PrintTeachersPayload,
} from '@/types/documents'
import './approved.css'

function placeName(region?: PrintRegion | { name?: string | null } | null) {
  const name = region?.name
  if (!name) return ''
  if (typeof name === 'string') return name
  return name.uz || ''
}

function dashDate(value?: string | null) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '')
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

function gaiStamp(value?: string | null) {
  if (!value) return ''
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function gaiStatus(type?: string | null) {
  if (type === 'rejected') return 'Qaytarilgan'
  if (type === 'accepted') return 'Tasdiqlangan'
  if (type === 'sended') return 'Javobi kutilmoqda'
  return "Yo'q"
}

function personLine(person?: PrintPerson | null) {
  return [person?.last_name, person?.first_name, person?.middle_name]
    .filter(Boolean)
    .join(' ')
}

function teacherFio(teacher: PrintRegTeacher) {
  return (
    teacher.fio ||
    [teacher.last_name, teacher.first_name, teacher.middle_name].filter(Boolean).join(' ')
  )
}

function groupNumber(data: PrintGroupData) {
  const name = data.group?.name
  if (name && typeof name === 'object') return name.uz || ''
  if (typeof name === 'string') return name
  return data.group?.name_uz || ''
}

function phoneLine(raw?: string | null) {
  const digits = parsePhoneDigits(raw)
  if (!digits) return ''
  return `+998 ${formatPhoneLocal(digits)}`
}

function categoryOf(data: PrintGroupData) {
  const edu = data.edu_type ?? data.group?.edu_type
  return edu?.short_name_uz || edu?.short_name || edu?.character_name || edu?.short_name_en || ''
}

function Row({ label, value, strong }: { label: string; value?: string | null; strong?: boolean }) {
  return (
    <div className="ap-row">
      <div className={strong ? 'ap-label ap-strong' : 'ap-label'}>{label}</div>
      <div className="ap-value">{value || ''}</div>
    </div>
  )
}

export function ApprovedBody({
  data,
  teachers,
}: {
  data: PrintGroupData
  teachers: PrintTeachersPayload
}) {
  const { id } = useParams()
  const [issued] = useState(() => new Date().toLocaleString('en-US'))
  const printCars = data.cars ?? []
  const carsQuery = useGroupCarsQuery(id, printCars.length === 0)
  const actions = data.group?.group_gai_actions ?? []
  const last = actions.length > 0 ? actions[actions.length - 1] : null
  const region = placeName(data.organization?.region)
  const area = data.organization?.area?.name || ''
  const cars = printCars.length
    ? printCars.map((car) => ({
        number: car.number || '',
        model: car.mspd_model_name || '',
      }))
    : (carsQuery.data ?? []).map((car) => ({
        number: car.number || '',
        model: car.name || car.car_model?.name || '',
      }))
  const students = [...(data.students ?? [])].sort((a, b) =>
    (a.last_name || '').localeCompare(b.last_name || '', 'uz'),
  )
  const staff = [...(teachers.teachers ?? []), ...(teachers.practical_teachers ?? [])]

  return (
    <div className="ap-doc">
      <img className="ap-logo" src={logo} alt="" />

      <div className="ap-lines">
        <div className="ap-title">
          Haydovchilarni tayyorlash bo'yicha o'quv guruhlarini ro'yhatga olish
        </div>
        <hr />

        <Row label="Ariza raqami" value={data.group?.id != null ? String(data.group.id) : ''} strong />
        <Row
          label="Tashkilot raqami"
          value={data.organization?.id != null ? String(data.organization.id) : ''}
          strong
        />
        <Row label="Berilgan sana" value={issued} strong />
        <Row
          label="Oxirgi o'zgartirish kiritilgan sana"
          value={last ? gaiStamp(last.date_time) || "Yo'q" : "Yo'q"}
          strong
        />
        <Row label="Holati" value={last ? gaiStatus(last.type) : "Yo'q"} strong />
        <Row label="Hozirgi amal" strong />
        <Row label="Tekshirish uchun parol" strong />

        <hr />
        <div className="ap-section">Arizachi haqida ma'lumot</div>
        <Row label="Yuridik shaxs nomi" value={data.organization?.name_uz || data.organization?.name} />
        <Row label="Yuridik shaxsning STIRI" value={data.organization?.inn} />
        <Row label="Tashkiliy-huquqiy shakli" />
        <Row label="Yuridik manzil" value={[region, area].filter(Boolean).join(' ')} />
        <Row label="Faoliyat turi" />
        <Row label="Elektron pochta manzili" />
        <Row label="Yuridik shaxs telefon raqami" value={phoneLine(data.director?.phone)} />
        <Row label="Tashkilot rahbarining F.I.Sh" value={personLine(data.director)} />
        <Row label="Tashkilot rahbarining JSHIR" value={data.director?.passport_jshir} />

        <hr />
        <div className="ap-section">Guruhning ma'lumotlari</div>
        <Row label="Ta'lim muassasasining hududi" value={region} />
        <Row label="Ta'lim muassasasining tumani" value={area} />
        <Row label="O'quv guruhining toifasi" value={categoryOf(data)} />
        <Row label="O'quv guruhining raqami" value={groupNumber(data)} />
        <Row
          label="Ta'lim boshlanish sanasi"
          value={dashDate(data.group?.edu_starting_date || data.starting_date)}
        />
        <Row
          label="Ta'lim tugash sanasi"
          value={dashDate(data.group?.edu_ending_date || data.ending_date)}
        />
        <Row label="Amaliy soatlar o'tkazilish kuni va soati" />
        <Row label="Nazariy soatlar o'tkazilish kuni va soati" />
      </div>

      <div className="ap-tables">
        <div className="ap-box">
          <div className="ap-section">Biriktirilgan avtotransport haqida ma'lumot</div>
          <table>
            <thead>
              <tr>
                <th className="ap-num">#</th>
                <th>Avtotransport davlat raqami</th>
                <th>Avtotransport turi</th>
                <th>Avtotransport markasi</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car, index) => (
                <tr key={`${car.number}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{car.number}</td>
                  <td />
                  <td>{car.model}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ap-box">
          <div className="ap-section">O'quvchilar ro'yhati</div>
          <table>
            <thead>
              <tr>
                <th className="ap-num">#</th>
                <th>F.I.Sh</th>
                <th>JSHSHIR</th>
                <th>Pasport seriyasi va raqami</th>
                <th>Tug'ulgan sana</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id ?? index}>
                  <td>{index + 1}</td>
                  <td>{personLine(student)}</td>
                  <td>{student.passport_jshir}</td>
                  <td>
                    {[student.passport_seria, student.passport_number].filter(Boolean).join(' ')}
                  </td>
                  <td>{dashDate(student.birthday)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ap-box">
          <div className="ap-section">O'qituvchilar haqida ma'lumot</div>
          <table>
            <thead>
              <tr>
                <th className="ap-num">#</th>
                <th>F.I.Sh</th>
                <th>JSHSHIR</th>
                <th>Pasport seriyasi va raqami</th>
                <th>
                  Haydovchilik
                  <br />
                  guvohnomasining seriyasi
                  <br />
                  va raqami
                </th>
                <th>Lavozimi</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((teacher, index) => (
                <tr key={teacher.id ?? index}>
                  <td>{index + 1}</td>
                  <td>{teacherFio(teacher)}</td>
                  <td>{teacher.passport_jshir}</td>
                  <td>
                    {[teacher.passport_seria, teacher.passport_number].filter(Boolean).join(' ')}
                  </td>
                  <td>
                    {[teacher.license_seria, teacher.license_number].filter(Boolean).join(' ')}
                  </td>
                  <td />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr />
        <div className="ap-title">Arizani qabul qilish to'g'risida xabarnoma</div>
      </div>
    </div>
  )
}
