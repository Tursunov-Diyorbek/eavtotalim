import { PATH_PREFIX_FILE, eduTypeShortName } from '@/config'
import { resolveFileUrl } from '@/features/lessons'
import { formatDate, fullNameOf } from '@/lib'
import type { PrintGroupData, PrintPerson } from '@/types/documents'
import { QrCodeImg } from './QrCodeImg'
import './personalSheet.css'

const CATEGORIES = [
  'A',
  'B',
  'BC',
  'C (T)',
  'C (QT)',
  'D (QT)',
  'BE (QT)',
  'CE (QT)',
  'DE (QT)',
  'MO',
  'I',
  'TM',
  'TB',
  'RKDULET',
  'AI',
] as const

const CATEGORY_ALIASES: Record<string, (typeof CATEGORIES)[number]> = {
  CT: 'C (T)',
  C1: 'C (T)',
  CQT: 'C (QT)',
  CQ1: 'C (QT)',
  DQT: 'D (QT)',
  DQ1: 'D (QT)',
  BEQT: 'BE (QT)',
  BEQ1: 'BE (QT)',
  CEQT: 'CE (QT)',
  CEQ1: 'CE (QT)',
  DEQT: 'DE (QT)',
  DEQ1: 'DE (QT)',
  IQT: 'I',
  IQ1: 'I',
}

function groupLabel(data: PrintGroupData) {
  const group = data.group
  if (!group) return ''
  if (group.name && typeof group.name === 'object') {
    return group.name.uz || group.name_uz || ''
  }
  return group.name_uz || (typeof group.name === 'string' ? group.name : '') || ''
}

function compactCategory(value: string) {
  return value.replace(/[«»"'’‘()\s._-]/g, '').toUpperCase()
}

function matchCategory(raw: string) {
  const columns = [...CATEGORIES]
    .map((label) => ({ label, key: compactCategory(label) }))
    .sort((a, b) => b.key.length - a.key.length)
  const tokens = raw
    .split(/[\s,;/]+/)
    .map((part) => compactCategory(part))
    .filter(Boolean)
  for (const key of [compactCategory(raw), ...tokens]) {
    if (!key) continue
    if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key]
    const exact = columns.find((col) => col.key === key)
    if (exact) return exact.label
  }
  return ''
}

export function studiedCategory(data: PrintGroupData) {
  const edu = data.edu_type
  const groupEdu = data.group?.edu_type
  const byId = eduTypeShortName(Number(edu?.id ?? data.group?.edu_type_id))
  const groupName = groupLabel(data)
  const fromName = groupName.includes('_') ? (groupName.split('_').pop() ?? '') : ''
  const sources = [
    edu?.character_name,
    edu?.short_name,
    edu?.short_name_uz,
    edu?.short_name_en,
    groupEdu?.character_name,
    groupEdu?.short_name,
    groupEdu?.short_name_uz,
    groupEdu?.short_name_en,
    byId === '—' ? '' : byId,
    fromName,
  ]
  for (const source of sources) {
    const hit = matchCategory(typeof source === 'string' ? source : '')
    if (hit) return hit
  }
  return ''
}

function sheetDate(value?: string | null) {
  if (!value) return ''
  return formatDate(value) || value
}

function addressOf(student: PrintPerson) {
  return [student.area?.name, student.constant_address || student.address]
    .filter(Boolean)
    .join(' ')
}

type PenaltyRow =
  | { kind: 'section'; title: string }
  | { kind: 'item'; no: string; text: string; points: number }
  | { kind: 'sum'; title: string }

const PENALTY_ROWS: PenaltyRow[] = [
  { kind: 'section', title: "I.Birinchi bosqich (avtodrom yoki yopiq maydonchada)" },
  { kind: 'item', no: '1\n1.1', text: "Balandlikka qo‘zg‘alishda:\nNotekis qo‘zg‘aldi.", points: 20 },
  { kind: 'item', no: '1.2', text: "Dvigatelni o'chirib qo'ydi", points: 20 },
  {
    kind: 'item',
    no: '2.\n2.1',
    text: "Cheklangan harakat qismida qayrilish:\nOrqaga uzatmani bir marta qo'shib qayrila olmadi.",
    points: 20,
  },
  { kind: 'item', no: '2.2', text: "Dvigatelni o'chirib qo'ydi.", points: 20 },
  { kind: 'item', no: '2.3', text: "Cheklagichlardan chetga o'tib ketdi.", points: 20 },
  {
    kind: 'item',
    no: '3\n3.1',
    text: "Yo'nalishning ilon izi qismida\nUstunlarga tegib ketdi",
    points: 20,
  },
  { kind: 'item', no: '3.2', text: "O'tish davomida to'xtab harakatlandi", points: 20 },
  { kind: 'item', no: '3.3', text: "Dvigatelni o'chirib qo'ydi", points: 20 },
  {
    kind: 'item',
    no: '4\n4.1',
    text: "Orqaga yurgizib boksga qo'yish\nOrqaga uzatmani bir marta qo'shib kira olmadi",
    points: 20,
  },
  { kind: 'item', no: '4.2', text: "Dvigatelni o'chirib qo'ydi", points: 20 },
  { kind: 'item', no: '4.3', text: "Cheklagichlardan chetga o'tib ketdi", points: 20 },
  { kind: 'item', no: '1\n1.1', text: "Balandlikka qo'zg'alishda\nNotekis qo'zg'aldi.", points: 20 },
  { kind: 'item', no: '5', text: "Bosqichni noto'g'ri bajardi", points: 100 },
  { kind: 'sum', title: 'Birinchi bosqichning natijalari:' },
  { kind: 'section', title: "II. Ikkinchi bosqich (sinov yo'nalishida)" },
  {
    kind: 'item',
    no: '1',
    text: "Boshqarish organlaridan foydalanishni bilmaydi, tekis harakatlanmadi",
    points: 20,
  },
  { kind: 'item', no: '2', text: "Harakat qismida to'g'ri tizilishga rioya qilmadi", points: 20 },
  {
    kind: 'item',
    no: '3',
    text: "Belgilangan harakat tezligi va oraliq masofaga rioya qilmadi",
    points: 20,
  },
  { kind: 'item', no: '4', text: "Bir yo'nalishdan ikkinchisiga o'tishni noto'g'ri bajardi", points: 20 },
  {
    kind: 'item',
    no: '5',
    text: "Svetafor yoki harakatni tartibga soluvchi xodimning signallariga rioya qilmadi",
    points: 100,
  },
  { kind: 'item', no: '6', text: "Yo'l belgilari va chiziqlarning talablariga rioya qilmadi", points: 20 },
  { kind: 'item', no: '7', text: "Burilish, qaytish va to'xtashni noto'g'ri bajardi", points: 20 },
  {
    kind: 'item',
    no: '8',
    text: "Avariya xolatini keltirgani uchun imtihon oluvchi boshqaruvga aralashdi",
    points: 100,
  },
  { kind: 'sum', title: 'Ikkinchi bosqichning natijalari:' },
  { kind: 'sum', title: "Jami to'planganjarima ballari" },
]

function blank(value: string | null | undefined, line: string) {
  const text = value?.trim()
  return text ? text : line
}

function ExamPenalty({
  data,
  student,
  qr,
}: {
  data: PrintGroupData
  student: PrintPerson
  qr: string
}) {
  const orgName = data.organization?.name_uz || data.organization?.name || ''
  const school =
    Number(data.organization?.agreement) === 1 ? orgName : "«Shartnoma qilinmagan avtomaktab»"
  const practical = data.amaliy_usta?.teacher as
    | (PrintPerson & { license_seria?: string | null; license_number?: string | null })
    | null
    | undefined
  const teacherName = fullNameOf(practical)
  const license = [practical?.license_seria, practical?.license_number].filter(Boolean).join(' ')
  const category = data.edu_type?.name_uz || data.group?.edu_type?.name_uz || ''

  return (
    <section className="ps-penalty">
      <p className="ps-penalty-school">
        Avtomabil maktabi nomi: <span>{school}</span>
      </p>
      <p className="ps-penalty-meta">
        <b>
          Toifasi: <span>{category}</span>
        </b>
        <b>
          Guruh nomi: <span>{groupLabel(data)}</span>
        </b>
        <b>
          Mashg&apos;.boshl:{' '}
          <span>{sheetDate(data.group?.edu_starting_date || data.starting_date)}</span>
        </b>
        <b>
          Mashg&apos;.tugashi:{' '}
          <span>{sheetDate(data.group?.edu_ending_date || data.ending_date)}</span>
        </b>
      </p>
      <p className="ps-penalty-meta">
        <b>
          Guruh o&apos;qituvchisi F.I.Sh:{' '}
          {blank(teacherName, '_____________________________________________________')}
        </b>
        <b> Guvohnoma №: {blank(license, '_________________________')}</b>
      </p>
      <p className="ps-penalty-meta">
        <b>
          O&apos;quvchining yashash manzili:{' '}
          <span>{blank(student.address, '____________________________________')}</span>
        </b>
        <b> Tib.ma&apos;l: {blank(student.medical_sertificate, '________________')}</b>
      </p>
      <p className="ps-penalty-meta">
        <b>
          Pasport seriyasi va raqami:{' '}
          <span>
            {student.passport_seria} {student.passport_number}
          </span>
        </b>
        <b>
          {' '}
          Berilgan vaqti: <span>{sheetDate(student.passport_given_date)}</span>
        </b>
        <b> Pasport berilgan joyi: {student.passport_given_place}</b>
      </p>
      <p className="ps-penalty-meta">
        <b>Guvohnoma raqami (avtomaktab) _________________</b>
      </p>
      <p className="ps-penalty-title">Avtomabil boshqarish bo&apos;yicha imtihon:</p>
      <p className="ps-penalty-sheet">VARAQASI</p>
      <p className="ps-penalty-name">
        {student.last_name} {student.first_name} {student.middle_name}. {sheetDate(student.birthday)}
      </p>
      <p className="ps-penalty-hint">(familiyasi, ismi, otasining ismi, tug&apos;ilgan sanasi)</p>

      <table className="ps-penalty-table">
        <thead>
          <tr className="ps-penalty-pad">
            <td colSpan={7} />
          </tr>
          <tr>
            <th rowSpan={3}>t/r</th>
            <th rowSpan={3}>Xatoliklar</th>
            <th rowSpan={3}>Bitta xato uchun jarima ballari</th>
            <th colSpan={4}>To&apos;plangan jarima ballari</th>
          </tr>
          <tr>
            <th colSpan={4}>Imtihon o&apos;tkazilgan sana</th>
          </tr>
          <tr>
            <th />
            <th />
            <th />
            <th />
          </tr>
          <tr>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
            <th>6</th>
            <th>7</th>
          </tr>
        </thead>
        <tbody>
          {PENALTY_ROWS.map((row) => {
            if (row.kind === 'section') {
              return (
                <tr key={row.title}>
                  <th colSpan={7}>{row.title}</th>
                </tr>
              )
            }
            if (row.kind === 'sum') {
              return (
                <tr key={row.title} className="ps-penalty-sum">
                  <td colSpan={2}>{row.title}</td>
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              )
            }
            return (
              <tr key={`${row.no}-${row.text}`}>
                <td className="ps-penalty-no">{row.no}</td>
                <td className="ps-penalty-text">{row.text}</td>
                <td className="ps-penalty-points">{row.points}</td>
                <td />
                <td />
                <td />
                <td />
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="ps-penalty-foot">
        <div>
          <p>Imtihon natijasi (topshirdi yoki topshirmadi) ___________________</p>
          <p>Berilgan g/r № __________________________</p>
          <p>O/t № __________________________________</p>
        </div>
        <div className="ps-penalty-sign">
          <QrCodeImg data={qr} size={80} margin={0} />
          <div>
            <p>YHQ_________________________________________</p>
            <p>Amaliy mashg&apos;ulot _____________________________</p>
            <p>Berilgan sanasi: ________________________________</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Photo({ src }: { src: string }) {
  if (!src) {
    return (
      <div className="ps-photo ps-photo-empty" aria-hidden>
        <svg viewBox="0 0 80 96">
          <circle cx="40" cy="28" r="16" />
          <path d="M12 92c2-22 14-32 28-32s26 10 28 32" />
        </svg>
      </div>
    )
  }
  return <img className="ps-photo" src={src} alt="" />
}

function SheetCard({ data, student }: { data: PrintGroupData; student: PrintPerson }) {
  const org = data.organization?.name_uz || data.organization?.name || ''
  const cat = studiedCategory(data)
  const teacher = fullNameOf(data.asosiy_oqituvchi?.teacher)
  const start = sheetDate(data.group?.edu_starting_date || data.starting_date)
  const end = sheetDate(data.group?.edu_ending_date || data.ending_date)
  const photo = resolveFileUrl(student.image, PATH_PREFIX_FILE)
  const passport = [student.passport_seria, student.passport_number].filter(Boolean).join(' ')
  const sheetQr = `Tizim:"https://eavtotalim.uz/" Avtomaktab:${org || "Avtomaktab nomi yo'q"} Guruh:${
    groupLabel(data) || "guruhning nomi yo'q"
  } Toifa:${
    data.edu_type?.short_name_en || data.group?.edu_type?.short_name_en || ''
  } Passport ma'lumoti:${student.passport_seria || ''}${student.passport_number || ''}`

  return (
    <article className="ps-sheet">
      <table className="ps-pad">
        <thead>
          <tr>
            <td />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
      <div className="ps-fill">
      <header className="ps-head">
        <span>
          Mashg‘ulot boshlanish vaqti: <b>{start}</b>
        </span>
        <h2>HAYDOVCHINING SHAXSIY IMTIHON VARAQASI</h2>
        <span>
          Mashg‘ulot tugash vaqti: <b>{end}</b>
        </span>
      </header>

      <div className="ps-identity">
        <Photo src={photo} />
        <div className="ps-fields">
          <p>
            F.I.Sh: <b>{fullNameOf(student)}</b>
          </p>
          <p>
            Tug‘ilgan sanasi: <b>{sheetDate(student.birthday)}</b>
          </p>
          <p>
            Pasport seriya va raqam: <b>{passport}</b>
          </p>
          <p>
            Pasport berilgan joyi: <b>{student.passport_given_place || ''}</b>
          </p>
          <p>
            Yashash manzili: <b>{addressOf(student)}</b>
          </p>
          <p>
            O‘qituvchi: <b>{teacher}</b>
          </p>
          <p>AV/BR Y:</p>
          <p>
            Tibbiy ma’lumot raqami: <b>{student.medical_sertificate || ''}</b>
          </p>
        </div>
        <div className="ps-aside">
          <p>
            Pasport seriya va raqam: <b>{passport}</b>
          </p>
          <p>
            Guruh: <b>{groupLabel(data)}</b>
          </p>
          <p>
            Tashkilot nomi: <b>{org}</b>
          </p>
        </div>
      </div>

      <p className="ps-org">{org}</p>
      <p className="ps-org-note">(O‘quv tashkiloti nomi, transport vositasi toifasi)</p>
      <p className="ps-done">
        «{cat || '____'}» toifali avtotransport vositalari haydovchilarini tayyorlash
        toifa haydovchi tayyorlash dasturi bo‘yicha o‘qishni tugatdi.
      </p>
      <p>
        Sana: ______________ dagi № __________ raqamli guvohnomani oldi.
      </p>
      <div className="ps-signs">
        <span>O‘quvchi imzosi ______________</span>
        <span>
          Direktor imzosi ______________ M.O‘
        </span>
      </div>

      <p className="ps-caption">Haydovchilik guvohnomasini olish uchun imtihon topshirgan toifasi</p>
      <table className="ps-cats">
        <thead>
          <tr>
            {CATEGORIES.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {CATEGORIES.map((col) => (
              <td key={col}>{col === cat ? 'XXX' : ''}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="ps-note">IZOX: Tegishli toifaga «XXX» belgisi qo‘yiladi</p>

      <table className="ps-exam">
        <thead>
          <tr>
            <th colSpan={5}>Imtihon natijalari</th>
          </tr>
          <tr>
            <th>Imtihonlar</th>
            <th>Bayonnoma raqami</th>
            <th>Sana</th>
            <th>Natija</th>
            <th>Komissiya a’zolari FIO si va imzosi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan={4}>Nazariy</td>
            <td />
            <td />
            <td />
            <td />
          </tr>
          {Array.from({ length: 3 }, (_, index) => (
            <tr key={`nazariy-${index}`}>
              <td />
              <td />
              <td />
              <td />
            </tr>
          ))}
          <tr>
            <td rowSpan={3}>Amaliy</td>
            <td />
            <td />
            <td />
            <td />
          </tr>
          {Array.from({ length: 2 }, (_, index) => (
            <tr key={`amaliy-${index}`}>
              <td />
              <td />
              <td />
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      <table className="ps-license">
        <thead>
          <tr>
            <th colSpan={5}>Berilgan haydovchilik guvohnomasi</th>
          </tr>
          <tr>
            <th rowSpan={2}>Toifa</th>
            <th colSpan={2}>Haydovchilik guvohnomasi</th>
            <th rowSpan={2}>Berilgan sana</th>
            <th rowSpan={2}>Izoh</th>
          </tr>
          <tr>
            <th>Seriyasi</th>
            <th>Raqami</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }, (_, index) => (
            <tr key={`license-${index}`}>
              <td />
              <td />
              <td />
              <td />
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ps-after">
        <div className="ps-commission">
          <span>
            Komissiya raisi: <span className="ps-line" />
          </span>
          <span>
            Imzo <span className="ps-line ps-line-short" />
          </span>
        </div>
        <p className="ps-date">
          «___» <span className="ps-line ps-line-date" /> M.O'
        </p>
        <p className="ps-keep">
          Eslatma: Shaxsiy imtihon varaqa haydovchi tomonidan umrbod saqlanadi va
          haydovchilik guvohnomasini almashtirilganda yoki uning dublikatini olganda
          YHXB va TRIIBga taqdim etiladi.
        </p>
        <div className="ps-prep">
          <span>PrepDrive — imtihonni ishonch bilan topshiring!</span>
          <QrCodeImg data="https://prepdrive.uz" size={80} margin={0} />
          <QrCodeImg data={sheetQr} size={80} margin={0} />
        </div>
      </div>
      </div>
            </td>
          </tr>
        </tbody>
      </table>
      <ExamPenalty data={data} student={student} qr={sheetQr} />
    </article>
  )
}

export function PersonalSheetBody({ data }: { data: PrintGroupData }) {
  const students = [...(data.students ?? [])].sort((a, b) =>
    String(a.last_name ?? '').localeCompare(String(b.last_name ?? ''), 'uz'),
  )
  return (
    <>
      {students.map((student, index) => (
        <SheetCard
          key={student.id ?? `${student.last_name}-${index}`}
          data={data}
          student={student}
        />
      ))}
    </>
  )
}
