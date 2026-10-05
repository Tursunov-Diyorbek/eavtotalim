import { PATH_PREFIX_FILE } from '@/config'
import { resolveFileUrl } from '@/features/lessons'
import { fullNameOf } from '@/lib'
import type { PrintGroupData, PrintPerson } from '@/types/documents'
import { QrCodeImg } from './QrCodeImg'
import { studiedCategory } from './PersonalSheetBody'
import './practicalSheet.css'

type Row = { no: string; name: string; hours?: number; total?: boolean }

const STAGE_1: Row[] = [
  { no: '1', name: 'Mashg‘ulotga tayyorgarlik' },
  { no: '1.1', name: 'Xavfsizlik qoidalari', hours: 2 },
  { no: '1.2', name: 'Dvigatelni ishga tushirish va to‘xtatish', hours: 2 },
  { no: '2', name: 'Boshqaruv organlari bilan tanishish' },
  { no: '2.1', name: 'Uzatma, tormoz va rul bilan ishlash', hours: 2 },
  { no: '2.2', name: 'Joyidan qo‘zg‘atish va to‘xtatish', hours: 2 },
  { no: '3.1', name: 'To‘g‘ri chiziq bo‘ylab oldinga va orqaga harakat', hours: 2 },
  { no: '4', name: 'Burilishlar' },
  { no: '4.1', name: 'Cheklangan joyda burilish', hours: 2 },
  { no: '4.2', name: 'Orqaga harakatlanib burilish', hours: 2 },
  { no: '5.1', name: 'To‘xtash va tik balandlikka ko‘tarilish (estakada)', hours: 2 },
  { no: '6', name: 'Tor joy va boks' },
  { no: '6.1', name: 'Orqaga harakatlanib boksga kirish', hours: 2 },
  { no: '7', name: 'Orqaga harakatlanib parallel to‘xtash', hours: 2 },
  { no: '', name: 'Birinchi bosqichdagi mashqlar', hours: 20, total: true },
]

const STAGE_2: Row[] = [
  { no: '1', name: 'Yo‘lga chiqish va harakatni boshlash', hours: 2 },
  { no: '2', name: 'Qatnov qismida tezlikni tanlash', hours: 2 },
  { no: '3', name: 'Xavfsiz masofani saqlash', hours: 2 },
  { no: '4', name: 'Qayta tizilish va quvib o‘tish', hours: 2 },
  { no: '5', name: 'Chorrahalardan o‘tish', hours: 2 },
  { no: '6', name: 'Piyodalar o‘tish joyidan o‘tish', hours: 2 },
  { no: '7', name: 'To‘xtash va to‘xtab turish', hours: 2 },
  { no: '8', name: 'Chapga va o‘ngga burilish', hours: 2 },
  { no: '9', name: 'Tunda va yomon ob-havoda harakat', hours: 2 },
  { no: '10', name: 'Marshrut bo‘yicha yakuniy haydash', hours: 2 },
  { no: '', name: 'Ikkinchi bosqichdagi mashqlar', hours: 20, total: true },
  { no: '', name: 'Jami soat', hours: 40, total: true },
]

function groupLabel(data: PrintGroupData) {
  const group = data.group
  if (!group) return ''
  if (group.name && typeof group.name === 'object') {
    return group.name.uz || group.name_uz || ''
  }
  return group.name_uz || (typeof group.name === 'string' ? group.name : '') || ''
}

function sheetDate(value?: string | null) {
  if (!value) return ''
  const iso = value.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : value
}

function Photo({ src }: { src: string }) {
  if (!src) {
    return (
      <div className="px-photo px-photo-empty" aria-hidden>
        <svg viewBox="0 0 80 96">
          <circle cx="40" cy="28" r="16" />
          <path d="M12 92c2-22 14-32 28-32s26 10 28 32" />
        </svg>
      </div>
    )
  }
  return <img className="px-photo" src={src} alt="" />
}

function HourRows({ rows }: { rows: Row[] }) {
  return (
    <>
      {rows.map((row) => (
        <tr key={`${row.no}-${row.name}`} className={row.total ? 'px-total' : undefined}>
          <td>{row.no}</td>
          <td className="px-name">{row.name}</td>
          <td>{row.hours ?? ''}</td>
          <td />
          <td />
          <td />
          <td />
        </tr>
      ))}
    </>
  )
}

function PracticalCard({ data, student }: { data: PrintGroupData; student: PrintPerson }) {
  const org = data.organization?.name_uz || data.organization?.name || ''
  const cat = studiedCategory(data)
  const passport = [student.passport_seria, student.passport_number].filter(Boolean).join(' ')
  const address = [student.area?.name, student.constant_address || student.address]
    .filter(Boolean)
    .join(' ')
  const cert = [
    student.student_temp_certificate?.certificate_serial || student.final_mark?.sertificate_seria,
    student.student_temp_certificate?.certificate_number || student.final_mark?.sertificate_number,
  ]
    .filter(Boolean)
    .join(' ')
  const photo = resolveFileUrl(student.image, PATH_PREFIX_FILE)
  const qr = `Tizim:"https://eavtotalim.uz/" Avtomaktab:${org} Guruh:${groupLabel(data)} Toifa:${cat} F.I.Sh:${fullNameOf(student) || ''} Passport:${passport}`

  return (
    <article className="px-sheet">
      <table className="px-pad">
        <thead>
          <tr>
            <td />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="px-top">
                <p className="px-law">
                  Vazirlar Mahkamasining haydovchilarni tayyorlash tartibi to‘g‘risidagi qaroriga
                  muvofiq o‘quv mashg‘uloti hisobi.
                </p>
                <QrCodeImg data="https://prepdrive.uz" size={52} />
              </div>

              <div className="px-meta">
                <div>
                  <p>
                    Toifa: <b>{cat}</b>
                  </p>
                  <p>
                    Guruh: <b>{groupLabel(data)}</b>
                  </p>
                  <p>
                    Tashkilot: <b>{org}</b>
                  </p>
                  <p>
                    Pasport: <b>{passport}</b>
                  </p>
                  <p>
                    Yashash manzili: <b>{address}</b>
                  </p>
                  <p>
                    Guvohnoma: <b>{cert}</b>
                  </p>
                </div>
                <p>
                  Avtomobil rusumi va nomer: ____________________
                </p>
              </div>

              <div className="px-who">
                <div>
                  <h2>AVTOMOBILNI BOSHQARISH BO‘YICHA AMALIY MASHQ BAJARISH VARAQASI</h2>
                  <p className="px-fio">
                    <b>{fullNameOf(student)}</b>
                  </p>
                  <p>{sheetDate(student.birthday)}</p>
                </div>
                <Photo src={photo} />
              </div>

              <table className="px-table">
                <thead>
                  <tr>
                    <th rowSpan={2}>№</th>
                    <th rowSpan={2}>Mashqlar</th>
                    <th rowSpan={2}>Reja soati</th>
                    <th colSpan={4}>O‘tkazilgan sana, baho va imzo</th>
                  </tr>
                  <tr>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                  </tr>
                  <tr>
                    <th colSpan={7}>I. Birinchi bosqich — avtodrom / yopiq maydon</th>
                  </tr>
                </thead>
                <tbody>
                  <HourRows rows={STAGE_1} />
                  <tr className="px-section">
                    <td colSpan={7}>II. Ikkinchi bosqich — yo‘l harakati</td>
                  </tr>
                  <HourRows rows={STAGE_2} />
                </tbody>
              </table>

              <div className="px-foot">
                <p>
                  O‘qituvchi: <b>{fullNameOf(data.amaliy_usta?.teacher)}</b>
                  <span> imzo ______________</span>
                </p>
                <QrCodeImg data={qr} size={52} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  )
}

export function PracticalSheetBody({ data }: { data: PrintGroupData }) {
  const students = [...(data.students ?? [])].sort((a, b) =>
    String(a.last_name ?? '').localeCompare(String(b.last_name ?? ''), 'uz'),
  )
  return (
    <>
      {students.map((student, index) => (
        <PracticalCard
          key={student.id ?? `${student.last_name}-${index}`}
          data={data}
          student={student}
        />
      ))}
    </>
  )
}
