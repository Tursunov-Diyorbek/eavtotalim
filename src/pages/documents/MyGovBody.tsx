import { fullNameOf } from '@/lib'
import type { PrintGroupData } from '@/types/documents'
import gerb from '@/assets/images/gerb.png'
import logo from '@/assets/images/logo_old2.png'
import { QrCodeImg } from './QrCodeImg'
import './myGov.css'

function groupLabel(data: PrintGroupData) {
  const group = data.group
  if (!group) return ''
  if (group.name && typeof group.name === 'object') {
    return group.name.uz || group.name_uz || ''
  }
  return group.name_uz || (typeof group.name === 'string' ? group.name : '') || ''
}

function day(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function stampNow() {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function MyGovBody({ data }: { data: PrintGroupData }) {
  const org = data.organization?.name_uz || ''
  const group = groupLabel(data)
  const category = data.edu_type?.short_name_en || data.group?.edu_type?.short_name_en || ''
  const approved = Number(data.group?.check_gai) === 1
  const officer = data.group?.last_group_gai_action?.user?.name || ''
  const students = [...(data.students ?? [])].sort((a, b) =>
    String(a.last_name ?? '').localeCompare(String(b.last_name ?? ''), 'uz'),
  )
  const qr = `https://eavtotalim.uz/mygov-group-approve/${data.group?.id ?? ''}`

  return (
    <article className="mg-doc">
      <p className="mg-stamp">{stampNow()}</p>
      <div className="mg-brand">
        <img src={logo} alt="" />
        <img src={gerb} alt="" />
        <p>
          {org ||
            "Hujjat to'gri bo'lishi uchun tashkilotning lotincha nomini kiriting!"}
        </p>
      </div>
      <h2>Ro‘yxatdan o‘tkazilganlik xaqida xabarnoma</h2>
      <p className="mg-lead">
        {group}-sonli “{category}” toifaga qayta tayyorlash o‘quv guruhini
        muvaffaqiyatli ro‘yxatdan o‘tqazganingizni maʼlum qilamiz.
      </p>
      <div className="mg-dates">
        <p>O‘qish boshlanish sanasi: {day(data.starting_date)}</p>
        <p>O‘qish tugash sanasi: {day(data.ending_date)}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>F.I.SH</th>
            <th>O&apos;quvchining JSHSHIR</th>
            <th>
              Pasport seriyasi
              <br /> va raqami
            </th>
            <th>Tug`ilgan sana</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id ?? index}>
              <td>{fullNameOf(student)}</td>
              <td>{student.passport_jshir || ''}</td>
              <td>
                {student.passport_seria} {student.passport_number}
              </td>
              <td>{day(student.birthday)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mg-officer">
        <p>Ma&apos;sul xodim</p>
        <p>{approved && officer ? officer : 'Guruh tasqidlanmagan'}</p>
      </div>
      <div className="mg-qr">
        <QrCodeImg data={qr} size={100} margin={2} dark="#335383" light="#eeeeee" />
      </div>
    </article>
  )
}
