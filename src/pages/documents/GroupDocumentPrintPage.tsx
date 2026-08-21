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
import { useGroupShowQuery } from '@/features/groups'
import { formatWeekDays } from '@/features/groups/utils'
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
} from '@/types/documents'
import { QrCodeImg } from './QrCodeImg'
import { ContractBody } from './ContractBody'
import { PrintErrorHint } from './PrintErrorHint'
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
  html, body { padding: 5mm 6mm !important; }
`

function PrintChrome({
  title,
  extraCss,
  children,
}: {
  title: string
  extraCss?: string
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
                printElement(
                  printRef.current,
                  undefined,
                  extraCss ? { extraCss } : undefined,
                )
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

function RegistrationBody({
  data,
  teachers,
}: {
  data: PrintGroupData
  teachers: PrintTeacherRow[]
}) {
  const org = orgName(data)
  const group = groupName(data.group)
  const cat = categoryOf(data)
  return (
    <Page>
      <p>
        Guruh: <b><u>{group}</u></b>
      </p>
      <p>
        Tashkilot INN: <b><u>{data.organization?.inn}</u></b>
      </p>
      <p className="text-center font-semibold">
        {org}
        <br />
        {cat} {group} — o‘quv guruhini ro‘yxatdan o‘tkazishni so‘raydi.
      </p>
      <p>Manzil: {data.organization?.address || '—'}</p>
      <p>Telefon: {data.organization?.phone || '—'}</p>
      <p>Nazariy kunlar: {formatWeekDays(data.group?.week_days)}</p>
      <p>Amaliy kunlar: {formatWeekDays(data.group?.practical_week_days)}</p>
      <p>O‘qituvchilar: {teacherNames(teachers) || '—'}</p>
      <h3 className="pt-4 font-bold">O‘quvchilar</h3>
      <ol className="list-decimal pl-5">
        {sortedStudents(data).map((student) => (
          <li key={student.id ?? personName(student)}>{personName(student)}</li>
        ))}
      </ol>
    </Page>
  )
}

function StatementsBody({
  data,
  teachers,
}: {
  data: PrintGroupData
  teachers: PrintTeacherRow[]
}) {
  const org = orgName(data)
  const group = groupName(data.group)
  const cat = categoryOf(data)
  return (
    <Page>
      <h2 className="text-center font-bold">ARIZA (GURUH)</h2>
      <p className="text-center font-semibold">{org}</p>
      <p>
        {cat} toifali <b>{group}</b> guruhini tasdiqlashni so‘raymiz.
      </p>
      <p>O‘qituvchilar: {teacherNames(teachers) || '—'}</p>
      <p>Nazariy: {formatWeekDays(data.group?.week_days)}</p>
      <p>Amaliy: {formatWeekDays(data.group?.practical_week_days)}</p>
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

function VoucherBody({ data }: { data: PrintGroupData }) {
  const org = orgName(data)
  const group = groupName(data.group)
  const cat = categoryOf(data)
  const director = personName(data.director)
  return (
    <>
      {sortedStudents(data).map((student) => (
        <Page key={student.id ?? personName(student)}>
          <h2 className="text-center font-bold">YO‘LLANMA</h2>
          <p>
            Pasport: <b><u>{student.passport_seria} {student.passport_number}</u></b>
          </p>
          <p>
            Tug‘ilgan kuni:{' '}
            <b><u>{formatDate(student.birthday) || student.birthday || '—'}</u></b>
          </p>
          <p>
            Fuqaro <b>{personName(student)}</b> {org} da {cat} toifali {group}{' '}
            guruhida ta'lim olganligi tasdiqlanadi.
          </p>
          <p className="pt-6">Direktor: _________________ {director}</p>
        </Page>
      ))}
    </>
  )
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

function PracticalBody({ data }: { data: PrintGroupData }) {
  const group = groupName(data.group)
  const cat = categoryOf(data)
  return (
    <>
      {sortedStudents(data).map((student) => (
        <Page key={student.id ?? personName(student)}>
          <h2 className="text-center font-bold">AMALIY MASHQ VARAQASI</h2>
          <p>F.I.SH: <b>{personName(student)}</b></p>
          <p>Guruh: {group} · Toifa: {cat}</p>
          <p>Amaliy usta: {personName(data.amaliy_usta?.teacher)}</p>
        </Page>
      ))}
    </>
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
}: {
  kind: DocumentKind
  data: PrintGroupData
  teachers: PrintTeacherRow[]
}) {
  switch (kind) {
    case 'application':
      return <ApplicationBody data={data} />
    case 'contract':
      return <ContractBody data={data} />
    case 'registration':
      return <RegistrationBody data={data} teachers={teachers} />
    case 'statements':
      return <StatementsBody data={data} teachers={teachers} />
    case 'voucher':
      return <VoucherBody data={data} />
    case 'sheet':
      return <SheetBody data={data} title="SHAXSIY VARAQA" />
    case 'sheet2':
      return <SheetBody data={data} title="SHAXSIY VARAQA (2)" />
    case 'mygov':
      return <MyGovBody data={data} />
    case 'jurnal':
      return <JurnalBody data={data} />
    case 'practical':
      return <PracticalBody data={data} />
    case 'approved':
      return <ApprovedBody data={data} teachers={teachers} />
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
  const printQuery = usePrintStudentsByGroupQuery(id)
  const teachersQuery = usePrintTeachersQuery(id, NEEDS_TEACHERS.has(kind))
  const showQuery = useGroupShowQuery(
    kind === 'registration' || kind === 'statements' ? id : undefined,
  )

  const loading =
    printQuery.isLoading ||
    (NEEDS_TEACHERS.has(kind) && teachersQuery.isLoading) ||
    ((kind === 'registration' || kind === 'statements') && showQuery.isLoading)

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
  if (printQuery.isError || !printQuery.data) {
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

  const data: PrintGroupData = {
    ...printQuery.data,
    group: printQuery.data.group ?? (showQuery.data as PrintGroupInfo | undefined),
    organization:
      printQuery.data.organization ??
      (showQuery.data?.organization as PrintGroupData['organization']),
  }

  return (
    <PrintChrome
      title={t(TITLES[kind])}
      extraCss={
        kind === 'application'
          ? APPLICATION_PRINT_CSS
          : kind === 'contract'
            ? CONTRACT_PRINT_CSS
            : undefined
      }
    >
      <DocumentBody
        kind={kind}
        data={data}
        teachers={teachersQuery.data ?? []}
      />
    </PrintChrome>
  )
}
