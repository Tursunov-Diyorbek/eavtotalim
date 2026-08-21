import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Printer } from 'lucide-react'
import { Button, ErrorMessage, SafeImage, SkeletonLines } from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import { useStudentContractQuery } from '@/features/students'
import { resolveFileUrl } from '@/features/lessons'
import { asFio } from '@/lib/apiPage'
import { formatDate, formatNumber } from '@/lib/format'
import { printElement } from '@/lib'
import { PrintErrorHint } from '@/pages/documents/PrintErrorHint'
import type { StudentContractInfo } from '@/types/student'

const DOCS = ['application', 'sheet', 'voucher', 'sheet2', 'practical'] as const
type DocType = (typeof DOCS)[number]

function asDoc(value: string | undefined): DocType {
  return DOCS.includes(value as DocType) ? (value as DocType) : 'application'
}

function PrintChrome({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useTranslation()
  const printRef = useRef<HTMLDivElement>(null)
  return (
    <div className="min-h-screen bg-white p-6 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold text-deep">{title}</h1>
        <div className="flex items-center gap-2">
          <PrintErrorHint />
          <Button
            variant="primary"
            size="sm"
            onClick={() => printElement(printRef.current)}
          >
            <Printer className="size-3.5" aria-hidden />
            {t('students.showPage.print')}
          </Button>
        </div>
      </div>
      <div
        ref={printRef}
        className="mx-auto max-w-3xl text-[13px] leading-relaxed text-deep"
      >
        {children}
      </div>
    </div>
  )
}

function ApplicationDoc({ data }: { data: StudentContractInfo }) {
  const student = asFio(data.student)
  const org = data.organization?.name_uz || data.organization?.name || '________'
  const category = data.student?.edu_type?.short_name || data.group?.short_name_uz || '____'
  const group = data.group?.name_uz || data.group?.name || '____________'
  return (
    <div className="space-y-3">
      <p className="text-right">
        <b>{org}</b>
        <br />
        direktori <b>{[data.director?.last_name, data.director?.first_name].filter(Boolean).join(' ')}</b>
        <br />
        Fuqaro <b>{student}</b> tomonidan.
      </p>
      <h2 className="text-center font-bold">ARIZA</h2>
      <p>
        Meni, <b>{org}</b> da ochilgan <b>{category}</b> toifali avtotransport vositalari
        haydovchilarini tayyorlash <b>{group}</b> oʼquv guruhida tahsil olishga qabul qilishingizni
        soʼrayman.
      </p>
      <p>1. F.I.SH: <b>{student}</b></p>
      <p>2. Tugʼilgan sana: <b>{data.student?.birthday || '—'}</b></p>
      <p>
        4. Pasport: <b>{data.student?.passport_seria} {data.student?.passport_number}</b>,{' '}
        {data.student?.passport_given_date} — {data.student?.passport_given_place}
      </p>
      <p>5. Yashash manzilim: <b>{data.student?.address || data.student?.constant_address}</b></p>
      <p>7. Telefon: <b>{data.student?.phone1 ? `+998 ${data.student.phone1}` : '—'}</b></p>
    </div>
  )
}

function SheetDoc({ data, title }: { data: StudentContractInfo; title: string }) {
  const photo = resolveFileUrl(data.student?.image, PATH_PREFIX_FILE)
  return (
    <div className="space-y-4">
      <h2 className="text-center font-bold">{title}</h2>
      <div className="flex gap-4">
        <SafeImage
          src={photo}
          size="lg"
          className="size-28 rounded border"
        />
        <div>
          <p>F.I.SH: <b>{asFio(data.student)}</b></p>
          <p>Tugʼilgan sana: {formatDate(data.student?.birthday) ?? data.student?.birthday}</p>
          <p>
            Pasport: {data.student?.passport_seria} {data.student?.passport_number}
          </p>
          <p>Telefon: +998{data.student?.phone1 || data.student?.phone}</p>
          <p>Toifa: {data.student?.edu_type?.name_uz || data.group?.short_name_uz}</p>
          <p>
            Oʼqish: {formatDate(data.group?.edu_starting_date)} — {formatDate(data.group?.edu_ending_date)}
          </p>
        </div>
      </div>
    </div>
  )
}

function VoucherDoc({ data }: { data: StudentContractInfo }) {
  return (
    <div className="space-y-3">
      <h2 className="text-center font-bold">YOʼLLANMA</h2>
      <p>
        {data.organization?.name_uz || data.organization?.name} oʼquvchisi{' '}
        <b>{asFio(data.student)}</b> ({data.student?.edu_type?.name_uz || data.group?.short_name_uz})
        imtihon topshirish uchun yoʼllanadi.
      </p>
      <p>Guruh: {data.group?.name_uz || data.group?.name}</p>
      <p>Pasport: {data.student?.passport_seria} {data.student?.passport_number}</p>
      <p className="mt-8">Direktor: _________________ {[data.director?.last_name, data.director?.first_name].filter(Boolean).join(' ')}</p>
    </div>
  )
}

function PracticalDoc({ data }: { data: StudentContractInfo }) {
  return (
    <div className="space-y-3">
      <h2 className="text-center font-bold">AMALIY MASHQ BAJARISH VARAQASI</h2>
      <p>F.I.SH: <b>{asFio(data.student)}</b></p>
      <p>Toifa: {data.student?.edu_type?.code || data.student?.edu_type?.short_name || data.group?.short_name_uz}</p>
      <p>Guruh: {data.group?.name_uz || data.group?.name}</p>
      <p>Shartnoma summasi: {data.edu_type_price?.price != null ? formatNumber(data.edu_type_price.price) : '—'}</p>
    </div>
  )
}

export function StudentPrintPage() {
  const { t } = useTranslation()
  const { id, doc } = useParams()
  const kind = asDoc(doc)
  const contract = useStudentContractQuery(id, true)
  const titles: Record<DocType, string> = {
    application: t('students.showPage.printApplication'),
    sheet: t('students.showPage.printPersonalSheet'),
    voucher: t('students.showPage.printVoucher'),
    sheet2: t('students.showPage.printDrivingSheet'),
    practical: t('students.showPage.printPracticalSheet'),
  }

  if (contract.isLoading) {
    return (
      <div className="p-6">
        <SkeletonLines lines={8} />
      </div>
    )
  }
  if (contract.isError || !contract.data) return <ErrorMessage />

  const data = contract.data
  return (
    <PrintChrome title={titles[kind]}>
      {kind === 'application' ? <ApplicationDoc data={data} /> : null}
      {kind === 'sheet' ? <SheetDoc data={data} title={titles.sheet} /> : null}
      {kind === 'sheet2' ? <SheetDoc data={data} title={titles.sheet2} /> : null}
      {kind === 'voucher' ? <VoucherDoc data={data} /> : null}
      {kind === 'practical' ? <PracticalDoc data={data} /> : null}
    </PrintChrome>
  )
}
