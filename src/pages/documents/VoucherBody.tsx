import { formatDate, fullNameOf } from '@/lib'
import type { PrintGroupData, PrintPerson } from '@/types/documents'
import { QrCodeImg } from './QrCodeImg'
import './voucherPrint.css'

function dashDate(value?: string | null) {
  if (!value) return ''
  const formatted = formatDate(value)
  return (formatted || value).replace(/\./g, '-')
}

function groupLabel(data: PrintGroupData) {
  const group = data.group
  if (!group) return "guruhning nomi yo'q"
  if (group.name && typeof group.name === 'object') {
    return group.name.uz || group.name_uz || "guruhning nomi yo'q"
  }
  return group.name_uz || (typeof group.name === 'string' ? group.name : '') || "guruhning nomi yo'q"
}

function certPair(
  seria?: string | null,
  number?: string | null,
) {
  return {
    seria: seria || '________',
    number: number || '______________',
  }
}

function VoucherCard({
  data,
  student,
}: {
  data: PrintGroupData
  student: PrintPerson
}) {
  const org = data.organization?.name_uz || data.organization?.name || ''
  const director = fullNameOf(data.director)
  const eduName = data.edu_type?.name_uz || data.group?.edu_type?.name_uz || ''
  const finalCert = certPair(
    student.final_mark?.sertificate_seria,
    student.final_mark?.sertificate_number,
  )
  const tempCert = certPair(
    student.student_temp_certificate?.certificate_serial,
    student.student_temp_certificate?.certificate_number,
  )
  const qrData = `Tizim:"https://eavtotalim.uz/" Avtomaktab:${
    org || "Avtomaktab nomi yo'q"
  } Guruh:${groupLabel(data)} Toifa:${
    data.edu_type?.short_name_en || data.group?.edu_type?.short_name_en || ''
  } Passport ma'lumoti:${
    student.passport_seria && student.passport_number
      ? `${student.passport_seria}${student.passport_number}`
      : "Ma'lumot yo'q"
  }`

  return (
    <div className="voucher-doc">
      <div className="v-top">
        <div>
          <span>
            Pasport seria va raqam:&nbsp;
            <u>
              <strong>
                {student.passport_seria} {student.passport_number}
              </strong>
            </u>
          </span>
          <br />
          <span>
            Tug'ulgan kuni:{' '}
            <u>
              <strong>{dashDate(student.birthday)}</strong>
            </u>
          </span>
          <br />
          <span>
            Guvohnoma seriyasi va raqami:{' '}
            <b>
              {' '}
              {finalCert.seria} № {finalCert.number}
            </b>
          </span>
        </div>
        <span className="v-top-right">
          <span>Yo'riqnoma</span>
          <br />
          <span>№ 1 ilova</span>
        </span>
      </div>

      <h5>Yo'llanma</h5>
      <div className="v-sub">
        <b>
          Toifasi bo'yicha yo'l harakati qoidalari va avtotransport
          vositalarini amaliy boshqarish bo'yicha ko'nikmalarni tekshirish
        </b>
      </div>

      <table className="v-cat">
        <tbody>
          <tr>
            <th>{eduName}</th>
            <th>XXX</th>
          </tr>
        </tbody>
      </table>
      <div className="v-note">(Izox: Tegishli toifaga «XXX» belgisi qo'yiladi)</div>

      <div className="v-fio">
        F.I.SH:
        <b> {student.last_name}</b> <b>{student.first_name}</b>{' '}
        <b>{student.middle_name}</b>
      </div>
      <div className="v-meta">
        <div>
          Tug'ilgan sana:
          <b> {student.birthday}</b>
        </div>
        <div>
          Guvohnoma seriyasi va raqami:
          <b>
            {' '}
            {tempCert.seria} № {tempCert.number}
          </b>
        </div>
      </div>

      <div className="v-line">
        <b>{org}</b> boshlig'i: <b>{director}</b>
      </div>
      <div className="v-line">
        (guvohnoma bergan tashkilot, shaxsning lavozimi, familiyasi, ismi,
        otasining ismi)
      </div>

      <div className="v-sign">Imzo _______________</div>

      <table className="v-exam">
        <thead>
          <tr>
            <th rowSpan={2}>№</th>
            <th rowSpan={2}>Bayonnoma raqami</th>
            <th rowSpan={2}>Tekshirilgan vaqt</th>
            <th colSpan={2} style={{ width: '30%' }}>
              Yo'l harakati qoidalari va avtotransport vositalarini amaliy
              boshqarish bo'yicha ko'nikmalarni tekshirish natijalari
            </th>
            <th rowSpan={2}>TRIB xodimi imzosi</th>
          </tr>
          <tr>
            <th>Nazariy</th>
            <th>amaliy</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <tr key={n}>
              <td>{n}</td>
              <td />
              <td />
              <td />
              <td />
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      <div className="v-qr">
        <QrCodeImg data={qrData} size={84} />
      </div>
    </div>
  )
}

export function VoucherBody({ data }: { data: PrintGroupData }) {
  const students = [...(data.students ?? [])].sort((a, b) =>
    String(a.last_name ?? '').localeCompare(String(b.last_name ?? ''), 'uz'),
  )

  return (
    <>
      {students.map((student, index) => (
        <VoucherCard
          key={student.id ?? `${student.last_name}-${index}`}
          data={data}
          student={student}
        />
      ))}
    </>
  )
}
