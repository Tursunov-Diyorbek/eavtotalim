import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer } from 'lucide-react'
import { Button, DetailList, EmptyState, ErrorMessage, Panel, SkeletonLines } from '@/components/ui'
import { studentPrintPath } from '@/config'
import { useAuth } from '@/features/auth'
import { useStudentContractQuery } from '@/features/students'
import { asFio, asLangName } from '@/lib/apiPage'
import { formatDate, formatNumber } from '@/lib/format'
import type { StudentContractInfo } from '@/types/student'

function openPrint(path: string) {
  window.open(path, '_blank', 'noopener,noreferrer')
}

function ContractPreview({ data }: { data: StudentContractInfo }) {
  const org = data.organization?.name_uz || data.organization?.name || '________'
  const director = [data.director?.last_name, data.director?.first_name, data.director?.middle_name]
    .filter(Boolean)
    .join(' ')
  const student = asFio(data.student)
  const category = data.group?.short_name_uz || data.student?.edu_type?.short_name || '________'
  const from = data.group?.edu_starting_date || '__________________'
  const to = data.group?.edu_ending_date || '__________________'
  const price = data.edu_type_price?.price != null ? formatNumber(data.edu_type_price.price) : '________'

  return (
    <article className="student-contract space-y-3 text-justify text-[13px] leading-relaxed text-deep">
      <h2 className="text-center text-sm font-bold">________ SONLI SHARTNOMA</h2>
      <p className="flex justify-between font-semibold">
        <span>"______"_______________</span>
        <span>
          {new Date().getFullYear()}-yil {data.organization?.region?.name || ''}
        </span>
      </p>
      <p>
        <b>{org}</b> boshligʼi <b>{director || '________'}</b> bundan keyingi matnlarda{' '}
        <b>“Oʼquv muassasasi”</b> deb nomlanuvchi bir tomondan va fuqaro <b>{student}</b>, bundan
        keyingi matnlarda <b>“Taʼlim oluvchi”</b> deb nomlanuvchi ikkinchi tomondan mazkur
        shartnomani tuzdik.
      </p>
      <h3 className="text-center text-sm font-bold">1. SHARTNOMANING PREDMETI</h3>
      <p>
        1.1. <b>“Oʼquv muassasasi”</b> <b>«Taʼlim oluvchini»</b> <b>{category}</b> toifali
        avtotransport vositalari haydovchiligiga tayyorlaydi.
      </p>
      <h3 className="text-center text-sm font-bold">4. OʼQUV MASHGʼULOTINING TURI VA QIYMATI</h3>
      <table className="w-full border-collapse border border-mist text-center">
        <thead>
          <tr>
            <th className="border border-mist px-2 py-1">Turi</th>
            <th className="border border-mist px-2 py-1">Muddat</th>
            <th className="border border-mist px-2 py-1">Narx (soʼm)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-mist px-2 py-1">Nazariy va amaliy mashgʼulotlar</td>
            <td className="border border-mist px-2 py-1">
              {from} dan {to} gacha
            </td>
            <td className="border border-mist px-2 py-1 font-semibold">{price}</td>
          </tr>
        </tbody>
      </table>
      <p>
        4.2. <b>«Taʼlim oluvchi»</b> toʼlovning kamida <b>30%</b>ini mashgʼulotlar boshlanishidan
        oldin toʼlaydi.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="font-bold">“OʼQUV MUASSASASI”</p>
          <p>{org}</p>
          <p>{data.organization?.address}</p>
          <p>
            H/R {data.organization?.hr || data.organization_info?.hr} · MFO{' '}
            {data.organization?.mfo || data.organization_info?.mfo} · INN {data.organization?.inn}
          </p>
          <p>
            {data.bank?.bank_name} {data.bank?.bank_address}
          </p>
          <p>Tel: {data.organization?.phone ? `+998${data.organization.phone}` : '—'}</p>
          <p>
            (imzo) _________________ {director}
          </p>
        </div>
        <div>
          <p className="font-bold">“TAʼLIM OLUVCHI”</p>
          <p>{student}</p>
          <p>Manzili: {data.student?.address || data.student?.constant_address}</p>
          <p>
            Pasport: {data.student?.passport_seria} № {data.student?.passport_number}
          </p>
          <p>Telefon: +998{data.student?.phone1 || data.student?.phone}</p>
          <p>Imzo: _________________________________</p>
        </div>
      </div>
    </article>
  )
}

export function StudentDocumentsPanel({ studentId }: { studentId: string }) {
  const { t, i18n } = useTranslation()
  const { me } = useAuth()
  const contract = useStudentContractQuery(studentId, true)
  const printRef = useRef<HTMLDivElement>(null)
  const data = contract.data
  const groupId = data?.group?.id
  const hasAgreement = me?.profession?.organization?.last_agreement?.status === 1

  const printContract = () => {
    const node = printRef.current
    if (!node) return
    const win = window.open('', '_blank', 'noopener,noreferrer')
    if (!win) return
    win.document.write(`<!doctype html><html><head><title>Shartnoma</title>
      <style>
        body { font-family: "Times New Roman", serif; padding: 24px; color: #111; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #333; padding: 6px; }
        h2, h3 { text-align: center; }
      </style></head><body>${node.innerHTML}</body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  if (contract.isLoading) return <SkeletonLines lines={6} />
  if (contract.isError) return <ErrorMessage />
  if (!data) return <EmptyState description={t('common.empty')} />

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-deep">
        {t('students.showPage.tabDocs')}
      </p>
      <div className="flex flex-wrap gap-2">
        {hasAgreement && groupId ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openPrint(studentPrintPath(studentId, 'application'))}
          >
            <Printer className="size-3.5" aria-hidden />
            {t('students.showPage.printApplication')}
          </Button>
        ) : null}
        <Button variant="outline" size="sm" onClick={printContract}>
          <Printer className="size-3.5" aria-hidden />
          {t('students.showPage.printContract')}
        </Button>
        {hasAgreement && groupId ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openPrint(studentPrintPath(studentId, 'sheet'))}
          >
            <Printer className="size-3.5" aria-hidden />
            {t('students.showPage.printPersonalSheet')}
          </Button>
        ) : null}
        {groupId ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openPrint(studentPrintPath(studentId, 'voucher'))}
          >
            <Printer className="size-3.5" aria-hidden />
            {t('students.showPage.printVoucher')}
          </Button>
        ) : null}
        {groupId ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openPrint(studentPrintPath(studentId, 'sheet2'))}
          >
            <Printer className="size-3.5" aria-hidden />
            {t('students.showPage.printDrivingSheet')}
          </Button>
        ) : null}
        {groupId ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openPrint(studentPrintPath(studentId, 'practical'))}
          >
            <Printer className="size-3.5" aria-hidden />
            {t('students.showPage.printPracticalSheet')}
          </Button>
        ) : null}
      </div>

      <Panel padding="md">
        <DetailList
          items={[
            {
              label: t('students.showPage.contractPrice'),
              value:
                data.edu_type_price?.price != null
                  ? formatNumber(data.edu_type_price.price)
                  : '—',
            },
            {
              label: t('students.showPage.contractStatus'),
              value: data.status ?? '—',
            },
            {
              label: t('students.organization'),
              value: asLangName(data.organization, i18n.language) || '—',
            },
            {
              label: t('students.showPage.groupName'),
              value: asLangName(data.group, i18n.language) || '—',
            },
            {
              label: t('students.showPage.eduDates'),
              value:
                data.group?.edu_starting_date || data.group?.edu_ending_date
                  ? `${formatDate(data.group?.edu_starting_date, i18n.language) ?? '—'} - ${
                      formatDate(data.group?.edu_ending_date, i18n.language) ?? '—'
                    }`
                  : '—',
            },
            {
              label: t('groupDetails.fullName'),
              value: asFio(data.student) || '—',
            },
          ]}
        />
      </Panel>

      <div ref={printRef} className="rounded-xl border border-mist/80 bg-white p-4">
        <ContractPreview data={data} />
      </div>
    </div>
  )
}
