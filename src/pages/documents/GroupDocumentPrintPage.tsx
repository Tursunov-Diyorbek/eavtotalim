import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Printer } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ErrorMessage,
  SkeletonLines,
} from '@/components/ui'
import { routes } from '@/config'
import { useGroupShowQuery, useGroupShowStudentsQuery } from '@/features/groups'
import {
  usePrintStudentsByGroupQuery,
  usePrintTeachersQuery,
} from '@/features/documents'
import { formatDate, fullNameOf, printElement } from '@/lib'
import type {
  DocumentKind,
  PrintGroupData,
  PrintGroupInfo,
  PrintPerson,
  PrintTeacherRow,
  PrintTeachersPayload,
} from '@/types/documents'
import type { GroupStudentRow } from '@/types/groups'
import { QrCodeImg } from './QrCodeImg'
import { ContractBody } from './ContractBody'
import { PrintErrorHint } from './PrintErrorHint'
import { RegistrationBody } from './RegistrationBody'
import { StatementsBody } from './StatementsBody'
import { VoucherBody } from './VoucherBody'
import { PersonalSheetBody } from './PersonalSheetBody'
import { PracticalSheetBody } from './PracticalSheetBody'
import './pupilApplication.css'

const NEEDS_TEACHERS = new Set<DocumentKind>([
  'registration',
  'statements',
  'approved',
])

function personName(person: PrintPerson | null | undefined) {
  return fullNameOf(person) || '________'
}

function orgName(data: PrintGroupData) {
  return data.organization?.name_uz || data.organization?.name || '________'
}

function groupName(group: PrintGroupInfo | null | undefined) {
  if (!group) return '________'
  if (group.name && typeof group.name === 'object') {
    return group.name.uz || group.name_uz || '________'
  }
  return group.name_uz || (typeof group.name === 'string' ? group.name : '') || '________'
}

function categoryOf(data: PrintGroupData) {
  return (
    data.edu_type?.short_name_en ||
    data.edu_type?.short_name ||
    data.group?.edu_type?.character_name ||
    '____'
  )
}

function sortedStudents(data: PrintGroupData | undefined) {
  const list = [...(data?.students ?? [])]
  list.sort((a, b) =>
    String(a.last_name ?? '').localeCompare(String(b.last_name ?? ''), 'uz'),
  )
  return list
}

function teacherNames(teachers: PrintTeacherRow[]) {
  return teachers
    .map((row) => personName(row.teacher))
    .filter((name) => name !== '________')
    .join(', ')
}

const APPLICATION_PRINT_CSS = `
  html, body { padding: 6mm 8mm !important; }
`

const CONTRACT_PRINT_CSS = `
  html, body { padding: 0 5mm 4mm !important; }
  .card_page_view {
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 9.5px !important;
    line-height: 1.15 !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
  }
  .card_page_view h5 {
    margin: 2px 0 1px !important;
    font-size: 10px !important;
    line-height: 1.1 !important;
  }
  .card_page_view,
  .card_page_view div,
  .card_page_view span,
  .card_page_view b,
  .card_page_view strong,
  .card_page_view td,
  .card_page_view p {
    font-size: 9.5px !important;
    line-height: 1.15 !important;
  }
  .card_page_view table { margin: 2px 0 !important; }
  .card_page_view table td { padding: 1px 3px !important; }
  .card_page_view .contract-learner { min-height: 0 !important; padding: 2px !important; }
  .card_page_view .contract-learner-sign { margin-top: 4px !important; }
  .card_page_view .contract-date-row { margin: 1px 0 2px !important; }
  .card_page_view .contract-page-2 {
    page-break-before: auto !important;
    break-before: auto !important;
    padding-top: 0 !important;
  }
  .card_page_view .mt-3 { margin-top: 2px !important; }
  .hide-button, .hide-print { display: none !important; }
  .contract-sheet { margin: 0 !important; }
  .contract-sheet > thead { display: table-header-group; }
  .contract-sheet > thead > tr > td {
    height: 8mm !important;
    border: none !important;
    padding: 0 !important;
    line-height: 0 !important;
  }
  .contract-sheet > tbody > tr > td {
    border: none !important;
    padding: 0 !important;
    text-align: justify !important;
  }
`

const REGISTRATION_PRINT_CSS = `
  html, body { padding: 8mm 10mm !important; }
  .group-registration-print {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 12px !important;
    line-height: 1.3 !important;
  }
  .group-registration-print .reg-info td:first-child {
    width: 1% !important;
    white-space: nowrap !important;
    padding-right: 16px !important;
  }
`

const STATEMENTS_PRINT_CSS = `
  html, body { padding: 4mm 5mm !important; }
  .statements-doc { font-size: 11px !important; line-height: 1.15 !important; padding: 0 !important; }
  .statements-doc h5 { margin: 3px 0 2px !important; font-size: 12px !important; }
  .statements-doc .st-lead { margin: 2px 0 4px !important; }
  .statements-doc .st-info td { padding: 0 4px 0 0 !important; }
  .statements-doc .reg-teacher { padding: 1px 4px !important; margin-top: 2px !important; }
  .statements-doc .reg-teacher p { margin: 0 !important; line-height: 1.15 !important; }
  .statements-doc .st-students { margin-top: 2px !important; }
  .statements-doc .st-students th,
  .statements-doc .st-students td { padding: 0 4px !important; line-height: 1.15 !important; }
  .statements-doc .st-foot { margin-top: 6px !important; }
`

const SHEET_PRINT_CSS = `
  html, body { padding: 0 7mm 4mm !important; }
  .ps-pad > thead { display: table-header-group !important; }
  .ps-pad > thead > tr > td { height: 6mm !important; border: none !important; padding: 0 !important; }
  .ps-sheet { font-size: 10px !important; line-height: 1.2 !important; }
  .ps-fill { display: block !important; min-height: 0 !important; }
  .ps-after { margin-top: 4mm !important; break-inside: avoid !important; page-break-inside: avoid !important; }
  .ps-exam { margin-top: 4mm !important; }
  .ps-license { margin-top: 4mm !important; }
  .ps-exam td, .ps-cats td, .ps-license td { height: 20px !important; }
  .ps-prep { margin-top: 3mm !important; }
  .ps-prep img { display: block !important; width: 78px !important; height: 78px !important; max-width: none !important; flex: 0 0 78px !important; visibility: visible !important; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
  .ps-done { text-align: justify !important; }
  .ps-identity { align-items: start !important; grid-template-columns: 128px minmax(0, 1fr) max-content !important; }
  .ps-photo { width: 128px !important; height: 110px !important; aspect-ratio: auto !important; min-height: 0 !important; }
  .ps-penalty { break-before: page !important; page-break-before: always !important; margin-top: 0 !important; padding-top: 12mm !important; font-size: 11px !important; }
  .ps-penalty-table { font-size: 11px !important; }
  .ps-penalty-table thead { display: table-header-group !important; }
  .ps-penalty-pad td { height: 6mm !important; border: none !important; padding: 0 !important; }
  .ps-penalty-foot { font-size: 12px !important; }
`

const PRACTICAL_PRINT_CSS = `
  html, body { padding: 0 6mm 3mm !important; }
  .px-pad > thead { display: table-header-group !important; }
  .px-pad > thead > tr > td { height: 5mm !important; border: none !important; padding: 0 !important; }
  .px-sheet { font-size: 8px !important; line-height: 1.15 !important; padding: 0 !important; }
  .px-photo { width: 64px !important; height: 80px !important; }
  .px-table td, .px-table th { height: 12px !important; padding: 0 2px !important; }
`

const VOUCHER_PRINT_CSS = `
  html, body { padding: 4mm 7mm 3mm !important; }
  .voucher-doc {
    width: 100% !important;
    padding: 3mm 0 0 !important;
    margin: 0 !important;
    font-size: 10px !important;
    line-height: 1.15 !important;
    break-after: auto !important;
    page-break-after: auto !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .voucher-doc:nth-child(2n) {
    break-after: page !important;
    page-break-after: always !important;
  }
  .voucher-doc:last-child {
    break-after: auto !important;
    page-break-after: auto !important;
  }
  .voucher-doc h5 { margin: 2px 0 1px !important; font-size: 12px !important; }
  .voucher-doc .v-line { padding: 2px 0 !important; }
  .voucher-doc .v-sign { margin: 2px 0 !important; }
  .voucher-doc .v-exam th,
  .voucher-doc .v-exam td { height: 13px !important; padding: 0 3px !important; }
  .voucher-doc .v-qr { display: flex !important; justify-content: flex-end !important; margin-top: 2px !important; }
  .voucher-doc .v-qr img { display: block !important; margin-left: auto !important; width: 52px !important; height: 52px !important; }
`

function PrintChrome({
  title,
  extraCss,
  fitOnePage,
  children,
}: {
  title: string
  extraCss?: string
  fitOnePage?: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Header
        title={title}
        onBack={() => navigate(routes.documents)}
        actions={
          <div className="flex items-center gap-2">
            <PrintErrorHint />
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                printElement(printRef.current, undefined, {
                  extraCss,
                  fitOnePage,
                })
              }
            >
              <Printer className="size-3.5" aria-hidden />
              {t('documentsPage.print')}
            </Button>
          </div>
        }
      />
      <PageMain>
        <div ref={printRef}>{children}</div>
      </PageMain>
    </>
  )
}

function Page({ children }: { children: ReactNode }) {
  return <article className="mb-8 break-after-page space-y-3">{children}</article>
}

function hasAgreement(org: PrintGroupData['organization']) {
  return Number(org?.agreement) === 1
}

function orgLabel(data: PrintGroupData) {
  if (hasAgreement(data.organization)) {
    return data.organization?.name_uz || data.organization?.name || '________'
  }
  return null
}

function ApplicationBody({ data }: { data: PrintGroupData }) {
  const group = groupName(data.group)
  const cat = categoryOf(data)
  const director = personName(data.director)
  const school = orgLabel(data)
  const students = sortedStudents(data)
  const sheets: PrintPerson[][] = []
  for (let i = 0; i < students.length; i += 2) {
    sheets.push(students.slice(i, i + 2))
  }

  return (
    <>
      {sheets.map((pair, sheetIndex) => (
        <div key={sheetIndex} className="ariza-print-sheet">
          {pair.map((student, index) => {
        const fio = personName(student)
        const passport = [student.passport_seria, student.passport_number]
          .filter(Boolean)
          .join(' ')
        const created = student.created_at
          ? (formatDate(student.created_at) || student.created_at).replace(
              /\./g,
              '-',
            )
          : ''
        const qrData = `Tizim:"https://eavtotalim.uz/" Avtomaktab:${
          data.organization?.name_uz || "Avtomaktab nomi yo'q"
        } Guruh:${group && group !== '________' ? group : "Guruh nomi yo'q"} Toifa:${
          cat && cat !== '____' ? cat : "Toifa yo'q"
        } Passport ma'lumoti:${
          student.passport_seria && student.passport_number
            ? `${student.passport_seria}${student.passport_number}`
            : "Ma'lumot yo'q"
        }`
        return (
          <div
            key={student.id ?? `${fio}-${sheetIndex}-${index}`}
            className="pupil-applications"
          >
            <div className="top-titile">
              <div>
                <span>
                  Pasport seria va raqam:&nbsp;
                  <u>
                    <strong>{passport}</strong>
                  </u>
                </span>
                <br />
                <span>
                  Guruh:{' '}
                  <u>
                    <strong>{group}</strong>
                  </u>
                </span>
                <br />
                <span>
                  Ta‘lim toifasi:{' '}
                  <u>
                    <strong>{cat}</strong>
                  </u>
                </span>
              </div>
              <div>
                <span>
                  Tashkilot nomi:&nbsp;
                  <strong>
                    {school ?? (
                      <Badge tone="rose">«Shartnoma qilinmagan avtomaktab»</Badge>
                    )}
                  </strong>
                </span>
                <br />
                <span>
                  Direktor:&nbsp;
                  <strong>{director}</strong>
                </span>
                <br />
                <span>
                  Fuqaro:&nbsp;
                  <u>
                    <strong>{fio}</strong>
                  </u>
                  <br />
                  tomonidan.
                </span>
              </div>
            </div>
            <br />
            <h5>ARIZA</h5>
            <span className="mt-3 block">
              <span className="ariza-indent">
                Meni,&nbsp;
                <strong>
                  {school ?? (
                    <Badge tone="rose">«Shartnoma qilinmagan avtomaktab»</Badge>
                  )}
                </strong>
                &nbsp;da ochilgan&nbsp;
                <u>
                  <strong>{cat}</strong>
                </u>
                &nbsp; toifali avtotransport vositalari haydovchilarini tayyorlash
                &nbsp;{' '}
                <u>
                  <strong>{group}</strong>
                </u>{' '}
                &nbsp; o‘quv guruhida tahsil olishga qabul qilishingizni so‘rayman.
              </span>
              <h5 className="ariza-heading">
                O‘ZIM HAQIMDA QUYIDAGI MA’LUMOTLARNI MA’LUM QILAMAN:
              </h5>
            </span>
            <span>
              1. F.I.SH: &nbsp;
              <u>
                <strong>{fio}</strong>
              </u>
              ;
            </span>
            <br />
            <span>
              2. Tug‘ilgan sana:&nbsp;
              <u>
                <strong>{student.birthday || ''}</strong>
              </u>
              ;
            </span>
            <br />
            <span>3. Ma‘lumotim: _______________________;</span>
            <br />
            <span>
              <div>
                4. Pasport seriyasi, raqami, kim tomonidan, qachon berilgani va
                hisobda turish manzilim:
              </div>
              <u>
                <strong className="pr-2">{passport}</strong>
              </u>{' '}
              <u>
                <strong>{student.passport_given_date || ''}</strong>
              </u>
              -da&nbsp;
              <u>
                <strong className="pr-2">{student.passport_given_place || ''}</strong>
              </u>{' '}
              tomonidan berilgan;
            </span>
            <br />
            <span>
              5. Yashash manzilim:&nbsp;
              <u>
                <strong>
                  {[student.area?.name, student.constant_address]
                    .filter(Boolean)
                    .join(' ')}
                </strong>
              </u>
            </span>
            <br />
            <span>
              6. Ish joyim va lavozimim:
              _______________________________________________;
            </span>
            <br />
            <span>
              7. Telefon raqamim:{' '}
              <u>
                <strong>{student.phone1 ? `+998 ${student.phone1}` : ''}</strong>
              </u>
            </span>
            <br />
            <span>
              8.{' '}
              <strong>
                O‘qish uchun oldindan 30% o‘quv pulini to‘lashim va sababsiz
                ravishda 10 kun o‘quv mashg‘ulotlarini qoldirsam, guruxdan
                chetlashtirilishim, shuningdek, to‘langan pullarim qaytarilmasligi
                haqida ogoxlantirildim. O‘qish davomida bajarilishi lozim bo‘lgan
                shartlari, majburiyatlari, qoidalari bilan tanishdim va
                roziligimni bildiraman.
              </strong>
            </span>
            <br />
            <br />
            <div className="ariza-footer">
              <div>
                <u>
                  <strong>{fio}</strong>
                </u>
              </div>
              <div>_____________ (imzo)</div>
              <div>
                <strong>{created ? `${created}-yil` : ''}</strong>
              </div>
              <div className="qr-code-small">
                <QrCodeImg data={qrData} size={60} />
              </div>
            </div>
          </div>
        )
          })}
        </div>
      ))}
    </>
  )
}

function asStudentRows(
  rows: PrintPerson[] | GroupStudentRow[] | undefined,
): GroupStudentRow[] {
  return (rows ?? []).map((row, index) => ({
    id: row.id ?? index,
    last_name: row.last_name,
    first_name: row.first_name,
    middle_name: row.middle_name,
    birthday: row.birthday,
    address: row.address,
  }))
}

function SheetBody({ data, title }: { data: PrintGroupData; title: string }) {
  const group = groupName(data.group)
  const cat = categoryOf(data)
  const theory = personName(data.asosiy_oqituvchi?.teacher)
  const practical = personName(data.amaliy_usta?.teacher)
  return (
    <>
      {sortedStudents(data).map((student) => (
        <Page key={student.id ?? personName(student)}>
          <h2 className="text-center font-bold">{title}</h2>
          <p>F.I.SH: <b>{personName(student)}</b></p>
          <p>Guruh: <b>{group}</b> · Toifa: <b>{cat}</b></p>
          <p>Tug‘ilgan sana: {student.birthday || '—'}</p>
          <p>Pasport: {student.passport_seria} {student.passport_number}</p>
          <p>Manzil: {student.address || student.constant_address || '—'}</p>
          <p>
            Ta'lim muddati: {data.starting_date || '—'} — {data.ending_date || '—'}
          </p>
          <p>Nazariy o‘qituvchi: {theory}</p>
          <p>Amaliy usta: {practical}</p>
        </Page>
      ))}
    </>
  )
}

function MyGovBody({ data }: { data: PrintGroupData }) {
  const org = orgName(data)
  const group = groupName(data.group)
  return (
    <Page>
      <h2 className="text-center font-bold">MY.GOV.UZ GURUH TASDIQLASH</h2>
      <p className="text-center">{org}</p>
      <p>Guruh: <b>{group}</b></p>
      <table className="mt-3 w-full border-collapse border border-deep">
        <thead>
          <tr>
            <th className="border border-deep px-2 py-1">№</th>
            <th className="border border-deep px-2 py-1">F.I.SH</th>
            <th className="border border-deep px-2 py-1">Pasport</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents(data).map((student, i) => (
            <tr key={student.id ?? i}>
              <td className="border border-deep px-2 py-1 text-center">{i + 1}</td>
              <td className="border border-deep px-2 py-1">{personName(student)}</td>
              <td className="border border-deep px-2 py-1">
                {student.passport_seria} {student.passport_number}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  )
}

function JurnalBody({ data }: { data: PrintGroupData }) {
  const org = orgName(data)
  const group = groupName(data.group)
  const cat = categoryOf(data)
  return (
    <Page>
      <h2 className="text-center font-bold">O‘QUV JURNALI</h2>
      <p className="text-center">{org}</p>
      <p>
        Guruh: <b>{group}</b> · Toifa: <b>{cat}</b>
      </p>
      <p>
        Muddat: {data.starting_date || '—'} — {data.ending_date || '—'}
      </p>
      <table className="mt-3 w-full border-collapse border border-deep">
        <thead>
          <tr>
            <th className="border border-deep px-2 py-1">№</th>
            <th className="border border-deep px-2 py-1">F.I.SH</th>
            <th className="border border-deep px-2 py-1">Tug‘ilgan sana</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents(data).map((student, i) => (
            <tr key={student.id ?? i}>
              <td className="border border-deep px-2 py-1 text-center">{i + 1}</td>
              <td className="border border-deep px-2 py-1">{personName(student)}</td>
              <td className="border border-deep px-2 py-1">{student.birthday || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  )
}

function ApprovedBody({
  data,
  teachers,
}: {
  data: PrintGroupData
  teachers: PrintTeacherRow[]
}) {
  const org = orgName(data)
  const group = groupName(data.group)
  return (
    <Page>
      <h2 className="text-center font-bold">TASDIQLOV HUJJATI</h2>
      <p className="text-center">{org}</p>
      <p>Guruh: <b>{group}</b></p>
      <p>O‘qituvchilar: {teacherNames(teachers) || '—'}</p>
      <p>Direktor: {personName(data.director)}</p>
      <ol className="list-decimal pl-5">
        {sortedStudents(data).map((student) => (
          <li key={student.id ?? personName(student)}>{personName(student)}</li>
        ))}
      </ol>
    </Page>
  )
}

function WarningBody({ data }: { data: PrintGroupData }) {
  const org = orgName(data)
  const group = groupName(data.group)
  const cat = categoryOf(data)
  const teacher = personName(data.asosiy_oqituvchi?.teacher)
  const director = personName(data.director)
  return (
    <>
      {sortedStudents(data).map((student) => (
        <Page key={student.id ?? personName(student)}>
          <h2 className="text-center font-bold tracking-[0.3em] italic">
            OGOHLANTIRISH XATI
          </h2>
          <p>
            Hurmatli <b>{personName(student)}</b> Sizga <b>«{org}»</b> avtomobil
            maktabi shuni ma'lum qiladiki. Siz ta'lim olayotgan <b>{cat}</b>{' '}
            toifali <b>{group}</b> guruhda o‘tilayotgan amaliy va nazariy
            mashg‘ulotlarga muntazam ravishda sababsiz qatnashmay kelmoqdasiz.
            Maktab ichki tartib qoidalarini buzganligingiz tufayli siz bilan
            tuzilgan shartnomaning <b>2.10</b> bandiga asosan maktab amaliy va
            nazariy mashg‘ulotlariga qatnashmasangiz siz to‘lagan pul mablag‘i
            qaytarilmasdan o‘quvchilar safidan chiqarilasiz.
          </p>
          <div className="flex justify-between pt-10">
            <span>Guruh o‘qituvchisi: _________________ {teacher}</span>
            <span>Direktor: _________________ {director}</span>
          </div>
        </Page>
      ))}
    </>
  )
}

function DocumentBody({
  kind,
  data,
  teachers,
  students,
}: {
  kind: DocumentKind
  data: PrintGroupData
  teachers: PrintTeachersPayload
  students: GroupStudentRow[]
}) {
  switch (kind) {
    case 'application':
      return <ApplicationBody data={data} />
    case 'contract':
      return <ContractBody data={data} />
    case 'registration':
      return (
        <RegistrationBody
          data={data}
          teachers={teachers.teachers}
          practicalTeachers={teachers.practical_teachers}
        />
      )
    case 'statements':
      return (
        <StatementsBody
          data={data}
          teachers={teachers.teachers}
          practicalTeachers={teachers.practical_teachers}
          students={students}
        />
      )
    case 'voucher':
      return <VoucherBody data={data} />
    case 'sheet':
      return <PersonalSheetBody data={data} />
    case 'sheet2':
      return <SheetBody data={data} title="SHAXSIY VARAQA (2)" />
    case 'mygov':
      return <MyGovBody data={data} />
    case 'jurnal':
      return <JurnalBody data={data} />
    case 'practical':
      return <PracticalSheetBody data={data} />
    case 'approved':
      return <ApprovedBody data={data} teachers={teachers.rows} />
    case 'warning':
      return <WarningBody data={data} />
  }
}

const TITLES: Record<DocumentKind, string> = {
  application: 'documentsPage.colApplication',
  contract: 'documentsPage.colContract',
  registration: 'documentsPage.colRegistration',
  statements: 'documentsPage.colGroupApp',
  voucher: 'documentsPage.colVoucher',
  sheet: 'documentsPage.colSheet',
  sheet2: 'documentsPage.colSheet2',
  mygov: 'documentsPage.colMygov',
  jurnal: 'documentsPage.colJurnal',
  practical: 'documentsPage.colPractical',
  approved: 'documentsPage.colApproved',
  warning: 'documentsPage.colWarning',
}

export function GroupDocumentPrintPage({ kind }: { kind: DocumentKind }) {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const needsShow = kind === 'registration' || kind === 'statements'
  const printQuery = usePrintStudentsByGroupQuery(id)
  const teachersQuery = usePrintTeachersQuery(id, NEEDS_TEACHERS.has(kind))
  const showQuery = useGroupShowQuery(needsShow ? id : undefined)
  const studentsQuery = useGroupShowStudentsQuery(id, kind === 'statements', 200)

  const loading = needsShow
    ? showQuery.isLoading ||
      teachersQuery.isLoading ||
      (kind === 'statements' && studentsQuery.isLoading)
    : printQuery.isLoading ||
      (NEEDS_TEACHERS.has(kind) && teachersQuery.isLoading)

  if (loading) {
    return (
      <>
        <Header
          title={t(TITLES[kind])}
          onBack={() => navigate(routes.documents)}
        />
        <PageMain>
          <SkeletonLines lines={10} />
        </PageMain>
      </>
    )
  }
  if (needsShow ? showQuery.isError || !showQuery.data : printQuery.isError || !printQuery.data) {
    return (
      <>
        <Header
          title={t(TITLES[kind])}
          onBack={() => navigate(routes.documents)}
        />
        <PageMain>
          <ErrorMessage />
        </PageMain>
      </>
    )
  }

  const showGroup = showQuery.data as PrintGroupInfo | undefined
  const showOrg = showQuery.data?.organization as PrintGroupData['organization']
  const data: PrintGroupData = {
    ...(printQuery.data ?? {}),
    group: needsShow
      ? (showGroup ?? printQuery.data?.group)
      : (printQuery.data?.group ?? showGroup),
    organization: needsShow
      ? { ...printQuery.data?.organization, ...showOrg }
      : (printQuery.data?.organization ?? showOrg),
  }
  const students = studentsQuery.data?.data?.length
    ? studentsQuery.data.data
    : asStudentRows(printQuery.data?.students)

  return (
    <PrintChrome
      title={t(TITLES[kind])}
      extraCss={
        kind === 'application'
          ? APPLICATION_PRINT_CSS
          : kind === 'contract'
            ? CONTRACT_PRINT_CSS
            : kind === 'registration'
              ? REGISTRATION_PRINT_CSS
              : kind === 'statements'
                ? STATEMENTS_PRINT_CSS
                : kind === 'voucher'
                  ? VOUCHER_PRINT_CSS
                  : kind === 'sheet'
                    ? SHEET_PRINT_CSS
                    : kind === 'practical'
                      ? PRACTICAL_PRINT_CSS
                      : undefined
      }
      fitOnePage={kind === 'contract' ? '.card_page_view' : undefined}
    >
      <DocumentBody
        kind={kind}
        data={data}
        teachers={
          teachersQuery.data ?? {
            teachers: [],
            practical_teachers: [],
            rows: [],
          }
        }
        students={students}
      />
    </PrintChrome>
  )
}
