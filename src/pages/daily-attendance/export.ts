import { downloadTableXls, escapeHtml, sum } from '@/pages/region-report/xls'
import { printElement } from '@/lib/printElement'
import type { DailyAttendanceRow, DailyAttendanceTypeRow } from '@/types/daily-attendance'

export function percentText(value: number | null) {
  if (value == null) return ''
  return `${value.toFixed(2)} %`
}

function isoLabel(iso: string) {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${day}.${month}.${year}`
}

function average(values: Array<number | null>) {
  const ready = values.filter((value): value is number => value != null)
  if (!ready.length) return ''
  return percentText(sum(ready) / ready.length)
}

function sheet(html: string) {
  return `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:'Times New Roman',Times,serif;font-size:14px;text-align:center">${html}</table>`
}

export function downloadRegionTemplate1(date: string, rows: DailyAttendanceRow[], filename: string) {
  const body = rows
    .map(
      (row, index) => `<tr>
        <td>${index + 1}</td>
        <td style="text-align:left">${escapeHtml(row.name)}</td>
        <td>${row.activeSchools}</td><td>${row.allSchools}</td>
        <td>${row.lessonGroups}</td><td>${row.activeGroups}</td>
        <td>${row.lessonStudents}</td><td>${row.activeStudents}</td>
        <td>${row.absent}</td>
        <td>${percentText(row.absentPercent)}</td>
        <td>${percentText(row.monitoringPercent)}</td>
      </tr>`,
    )
    .join('')
  downloadTableXls(
    filename,
    sheet(`<thead>
      <tr><th colspan="11" style="text-align:left"><i>${isoLabel(date)} yil</i></th></tr>
      <tr>
        <th rowspan="2">№</th><th rowspan="2">Viloyat</th>
        <th colspan="2">Maktablar soni</th><th colspan="2">Guruhlar tahlili</th>
        <th colspan="2">O'quvchilar soni</th>
        <th rowspan="2">Darsga qatnashmaganlar</th>
        <th rowspan="2">Foiz qatnashmagan</th><th rowspan="2">Foiz qatnashgan</th>
      </tr>
      <tr>
        <th>Faol maktablar</th><th>Jami maktablar</th>
        <th>Bugun darsi bor</th><th>Jami faol guruhlar</th>
        <th>Bugun darsi bor o'quvchilar</th><th>Jami o'quvchilar</th>
      </tr>
    </thead><tbody>${body}</tbody>`),
  )
}

export function regionTemplate2Html(date: string, rows: DailyAttendanceRow[], area = false) {
  const body = rows
    .map(
      (row, index) => `<tr>
        <td>${index + 1}</td>
        <td style="text-align:left">${escapeHtml(area ? row.name : row.kiril || row.name)}</td>
        <td>${row.activeSchools}</td>
        <td>${row.activeGroups}</td>
        <td>${row.activeStudents}</td>
        <td>${row.lessonGroups}</td>
        <td>${row.lessonStudents}</td>
        <td>${row.absent}</td>
        <td>${percentText(row.absentPercent)}</td>
      </tr>`,
    )
    .join('')
  const total = `<tr style="background:#ffffcc;font-weight:bold">
    <td colspan="2">Ж А М И</td>
    <td>${sum(rows.map((row) => row.activeSchools))}</td>
    <td>${sum(rows.map((row) => row.activeGroups))}</td>
    <td>${sum(rows.map((row) => row.activeStudents))}</td>
    <td>${sum(rows.map((row) => row.lessonGroups))}</td>
    <td>${sum(rows.map((row) => row.lessonStudents))}</td>
    <td>${sum(rows.map((row) => row.absent))}</td>
    <td>${average(rows.map((row) => row.absentPercent))}</td>
  </tr>`
  return sheet(`<thead>
    <tr><th colspan="9">Ҳайдовчиларни тайёрлаш ва қайта тайёрлаш билан шуғулланувчи ўқув ташкилотларида таълим олаётган<br/>ўқувчилар давомати тўғрисида кунлик</th></tr>
    <tr><th colspan="9">М А Ъ Л У М О Т</th></tr>
    <tr><th colspan="9" style="text-align:right"><i>${isoLabel(date)} йил ҳолатида</i></th></tr>
    <tr style="background:#ddebf7">
      <th>Т/Р</th><th>Ҳудудлар</th>
      <th>Фаолият кўрсатаётган автомактаблар сони</th>
      <th>Жами фаол ўқув гуруҳлари сони</th>
      <th>Жами фаол ўқувчилар сони</th>
      <th>Ҳисобот кунида ўқув жараёнлари олиб борилиши белгиланган ўқув гуруҳлари сони</th>
      <th>Ҳисобот кунида ўқув жараёнида қатнашиши лозим бўлган ўқувчилар сони</th>
      <th>Шундан, ўқув жараёнида қатнашмаган ўқувчилар сони</th>
      <th>Фоизи (машғулотларга қатнашмаган ўқувчилар сонига нисбатан олинган)</th>
    </tr>
  </thead><tbody>${body}${total}
    <tr><td colspan="9" style="color:#0000ff">Изоҳ: Маълумотлар ҳисобот кунида назарий машғулотлар олиб борилиши белгиланган ўқув гуруҳлари ва ўқувчиларга нисбатан олинган</td></tr>
  </tbody>`)
}

export function downloadOfficialXls(filename: string, html: string) {
  downloadTableXls(filename, html)
}

export function printOfficial(html: string) {
  const node = document.createElement('div')
  node.innerHTML = html
  printElement(node, ' ', {
    extraCss: "body{font-family:'Times New Roman',Times,serif} table{width:100%}",
  })
}

export function organizationTemplate1(date: string, rows: DailyAttendanceRow[]) {
  const body = rows
    .map(
      (row, index) => `<tr>
        <td>${index + 1}</td>
        <td style="text-align:left">${escapeHtml(row.name)}</td>
        <td>${row.lessonGroups}</td><td>${row.activeGroups}</td>
        <td>${row.lessonStudents}</td><td>${row.activeStudents}</td>
        <td>${row.absent}</td><td>${percentText(row.absentPercent)}</td>
      </tr>`,
    )
    .join('')
  return sheet(`<thead>
    <tr><th colspan="8" style="text-align:left"><i>${isoLabel(date)} yil</i></th></tr>
    <tr>
      <th rowspan="2">№</th><th rowspan="2">Avtomaktab</th>
      <th colspan="2">Guruhlar tahlili</th><th colspan="2">O'quvchilar soni</th>
      <th rowspan="2">Darsga qatnashmaganlar</th><th rowspan="2">Foiz (%)</th>
    </tr>
    <tr>
      <th>Bugun darsi bor</th><th>Jami faol guruhlar</th>
      <th>Bugun darsi bor o'quvchilar</th><th>Jami o'quvchilar</th>
    </tr>
  </thead><tbody>${body}</tbody>`)
}

export function organizationTemplate2(date: string, rows: DailyAttendanceRow[], heading: string) {
  const body = rows
    .map(
      (row, index) => `<tr>
        <td>${index + 1}</td>
        <td style="text-align:left">${escapeHtml(row.name)}</td>
        <td>${row.activeGroups}</td>
        <td>${row.activeStudents}</td>
        <td>${row.lessonGroups}</td>
        <td>${row.lessonStudents}</td>
        <td>${row.absent}</td>
        <td>${percentText(row.absentPercent)}</td>
      </tr>`,
    )
    .join('')
  const total = `<tr style="background:#ffffcc;font-weight:bold">
    <td colspan="2">Ж А М И</td>
    <td>${sum(rows.map((row) => row.activeGroups))}</td>
    <td>${sum(rows.map((row) => row.activeStudents))}</td>
    <td>${sum(rows.map((row) => row.lessonGroups))}</td>
    <td>${sum(rows.map((row) => row.lessonStudents))}</td>
    <td>${sum(rows.map((row) => row.absent))}</td>
    <td>${average(rows.map((row) => row.absentPercent))}</td>
  </tr>`
  return sheet(`<thead>
    <tr><th colspan="8">${escapeHtml(heading)} тайёрлаш ва қайта тайёрлаш билан шуғулланувчи ўқув ташкилотларида таълим олаётган<br/>ўқувчилар давомати тўғрисида кунлик</th></tr>
    <tr><th colspan="8">М А Ъ Л У М О Т</th></tr>
    <tr><th colspan="8" style="text-align:right"><i>${isoLabel(date)} йил ҳолатида</i></th></tr>
    <tr style="background:#ddebf7">
      <th>Т/Р</th><th>Автомактаб</th>
      <th>Жами фаол ўқув гуруҳлари сони</th>
      <th>Жами фаол ўқувчилар сони</th>
      <th>Ҳисобот кунида ўқув жараёнлари олиб борилиши белгиланган ўқув гуруҳлари сони</th>
      <th>Ҳисобот кунида ўқув жараёнида қатнашиши лозим бўлган ўқувчилар сони</th>
      <th>Шундан, ўқув жараёнида қатнашмаган ўқувчилар сони</th>
      <th>Фоизи</th>
    </tr>
  </thead><tbody>${body}${total}
    <tr><td colspan="8" style="color:#0000ff">Изоҳ: Маълумотлар ҳисобот кунида назарий машғулотлар олиб борилиши белгиланган ўқув гуруҳлари ва ўқувчиларга нисбатан олинган</td></tr>
  </tbody>`)
}

export function typesTemplate(rows: DailyAttendanceTypeRow[]) {
  const body = rows
    .map(
      (row, index) => `<tr>
        <td>${index + 1}</td>
        <td style="text-align:left">${escapeHtml(row.name)}</td>
        <td>${row.organizations}</td><td>${row.activeOrganizations}</td>
        <td>${row.activeGroups}</td><td>${row.lessonGroups}</td>
        <td>${row.activeStudents}</td><td>${row.lessonStudents}</td><td>${row.absent}</td>
        <td>${percentText(row.monitoringPercent)}</td><td>${percentText(row.absentPercent)}</td>
      </tr>`,
    )
    .join('')
  return sheet(`<thead>
    <tr>
      <th rowspan="2">№</th><th rowspan="2">Nomi</th>
      <th colspan="2">Tashkilotlar tahlili</th><th colspan="2">Guruhlar tahlili</th>
      <th colspan="3">O'quvchilar tahlili</th><th colspan="2">Davomat tahlili</th>
    </tr>
    <tr>
      <th>Jami tashkilotlar</th><th>Faol tashkilotlar</th>
      <th>Jami faol guruhlar</th><th>Bugun darsi bor</th>
      <th>Jami o'quvchilar</th><th>Bugun darsi bor o'quvchilar</th><th>Darsga qatnashmaganlar</th>
      <th>Foiz qatnashgan</th><th>Foiz qatnashmagan</th>
    </tr>
  </thead><tbody>${body}</tbody>`)
}
