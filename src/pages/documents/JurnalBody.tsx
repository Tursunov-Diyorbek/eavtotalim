import { Fragment } from 'react'
import { useGroupJournalLessonsQuery } from '@/features/documents'
import {
  useGroupCarsQuery,
  useGroupMonitoringQuery,
  useGroupTimetableQuery,
} from '@/features/groups'
import type { PrintGroupData, PrintPerson } from '@/types/documents'
import type {
  GroupMonitoringDay,
  GroupMonitoringMark,
  GroupMonitoringStudent,
  GroupTimetableHandout,
  GroupTimetableRow,
} from '@/types/groups'
import './journal.css'

type Named = {
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
}

type TeacherRole = { teacher?: PrintPerson | null } | null | undefined

function groupLabel(data: PrintGroupData) {
  const group = data.group
  if (!group) return ''
  if (group.name && typeof group.name === 'object') {
    return group.name.uz || group.name_uz || ''
  }
  return group.name_uz || (typeof group.name === 'string' ? group.name : '') || ''
}

function EmptyCells({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <td key={index} />
      ))}
    </>
  )
}

function EmptyHeads({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <th key={index} />
      ))}
    </>
  )
}

function shortName(person?: Named | null) {
  if (!person?.last_name || !person.first_name || !person.middle_name) return ''
  return `${person.last_name} ${person.first_name.charAt(0)}.${person.middle_name.charAt(0)}`
}

function teacherLine(role: TeacherRole, fallback: string) {
  const teacher = role?.teacher
  const name = [teacher?.last_name, teacher?.first_name, teacher?.middle_name]
    .filter((part) => part && part !== 'null' && part !== 'undefined')
    .join(' ')
  return name || fallback
}

function stamp(value: string | null | undefined, sep: '.' | '-') {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (!match) return value
  return `${match[3]}${sep}${match[2]}${sep}${match[1]}`
}

function addressOf(value?: string | null) {
  if (!value || value === 'null' || value === 'undefined') return ''
  return value
}

function markText(mark: GroupMonitoringMark) {
  const type = String(mark.type ?? '')
  if (type === '0') return '+'
  if (type === '1' || type === '2') return mark.value ?? ''
  return ''
}

function attendanceCuts(timetableLen: number, dateCount: number) {
  if (timetableLen === 72) return { first: 24, second: 24 }
  if (timetableLen === 70) return { first: 35, second: 35 }
  if (timetableLen === 68) return { first: 34, second: 34 }
  if (timetableLen === 56) return { first: 28, second: 28 }
  if (timetableLen === 54) return { first: 27, second: 27 }
  if (timetableLen === 52) return { first: 26, second: 26 }
  if (timetableLen === 35) return { first: 35, second: 0 }
  if (timetableLen > 30) return { first: timetableLen, second: 0 }
  return { first: dateCount, second: 0 }
}

function topicLine(handout: GroupTimetableHandout) {
  const short = handout.topic?.lesson?.short_name
  const name = handout.topic?.name
  const title = typeof name === 'string' ? name : name?.uz || ''
  return (
    <>
      {short ? <b>({short}) - </b> : null}
      {title}
    </>
  )
}

function hoursOf(handouts?: GroupTimetableHandout[] | null) {
  return (handouts ?? []).reduce((sum, item) => sum + (Number(item.hours) || 0), 0)
}

function PlanTail({ name }: { name: string }) {
  return (
    <tr>
      <td />
      <td className="jr-name">{name}</td>
      <td />
      <EmptyCells count={17} />
    </tr>
  )
}

function SignRow({ role, fallback }: { role: TeacherRole; fallback: string }) {
  return (
    <div className="jr-sign-row">
      <span>Ko&apos;rsatmalar bilan tanishdim: {teacherLine(role, fallback)}</span>
      <span>______________________________</span>
    </div>
  )
}

function PracticeAccount({ students }: { students: Named[] }) {
  return (
    <section className="jr-page">
      <h4>AMALIY O&apos;RGATISH JAMLANMA HISOBI</h4>
      <table className="jr-table">
        <tbody>
          <tr>
            <th />
            <th>Dasturning mashqlari</th>
            <EmptyHeads count={21} />
          </tr>
          <tr>
            <th className="jr-narrow" />
            <th className="jr-wide">
              Mashg&apos;ulotlarni o&apos;sib boorishi xulosasini qayta ishlash vaqti
            </th>
            <EmptyHeads count={21} />
          </tr>
          <tr>
            <td colSpan={23}>
              <div className="jr-between">
                <span>Familyasi I.Sh.</span>
                <span>O&apos;rgatish sanasi</span>
              </div>
            </td>
          </tr>
          {students.map((student, index) => (
            <tr key={`${student.last_name ?? 's'}-${index}`}>
              <td>{index + 1}</td>
              <td className="jr-name">{shortName(student)}</td>
              <EmptyCells count={21} />
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function AttendanceSheet({
  title,
  dates,
  students,
}: {
  title?: string
  dates: GroupMonitoringDay[]
  students: GroupMonitoringStudent[]
}) {
  return (
    <section className="jr-page">
      {title ? <h4>{title}</h4> : null}
      <table className={dates.length > 0 ? 'jr-table jr-attendance' : 'jr-table jr-attendance-empty'}>
        {dates.length === 0 ? (
          <colgroup>
            <col className="jr-col-num" />
            <col className="jr-col-name" />
            <col />
          </colgroup>
        ) : null}
        <thead>
          <tr>
            <th className="jr-col-num">
              T/r
              <br />№
            </th>
            <th className="jr-attendance-name">F.I.Sh</th>
            {dates.length > 0 ? (
              dates.map((day, index) => (
                <th key={day.id ?? index} className="jr-date">
                  {stamp(day.start_time, '.')}
                </th>
              ))
            ) : (
              <th />
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id ?? index}>
              <td className="jr-narrow">{index + 1}</td>
              <td className="jr-name">{shortName(student)}</td>
              {dates.length > 0 ? (
                dates.map((day, dayIndex) => {
                  const mark = student.mark_monitoring?.[String(day.id)]
                  return (
                    <td key={day.id ?? dayIndex} className="jr-mark">
                      {mark ? markText(mark) : ''}
                    </td>
                  )
                })
              ) : (
                <td className="jr-attendance-blank">Davomat yuritilmagan</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function LoadSheet({
  title,
  rows,
}: {
  title?: string
  rows: GroupTimetableRow[]
}) {
  return (
    <section className="jr-page">
      {title ? <h4>{title}</h4> : null}
      <table className="jr-table">
        <thead>
          <tr>
            <th className="jr-date-col">Sana</th>
            <th>Mavzu va o&apos;quv masalalar</th>
            <th className="jr-hours">Soat miqdori</th>
            <th className="jr-hours">Rahbar imzosi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index}>
              <td>{stamp(row.start_time, '-')}</td>
              <td className="jr-name">
                {(row.handouts ?? []).map((handout, handoutIndex) => (
                  <div key={handoutIndex}>{topicLine(handout)}</div>
                ))}
              </td>
              <td>{(row.handouts ?? []).length > 0 ? hoursOf(row.handouts) : ''}</td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export function JurnalBody({ data }: { data: PrintGroupData }) {
  const org = data.organization?.name_uz || ''
  const group = groupLabel(data)
  const category = data.edu_type?.name_uz || data.group?.edu_type?.name_uz || ''
  const year = new Date().getFullYear()
  const groupId = data.group?.id != null ? String(data.group.id) : undefined
  const lessons = useGroupJournalLessonsQuery(groupId)
  const timetable = useGroupTimetableQuery(groupId)
  const monitoring = useGroupMonitoringQuery(groupId)
  const carsQuery = useGroupCarsQuery(groupId)
  const rows = lessons.data ?? []
  const classes = timetable.data ?? []
  const monitoringDays = monitoring.data?.data ?? []
  const days =
    monitoringDays.length > 0
      ? monitoringDays
      : classes.flatMap((row) =>
          row.start_time
            ? [{ id: Number(row.id) || 0, start_time: row.start_time }]
            : [],
        )
  const attendanceStudents = monitoring.data?.students ?? []
  const students = [...(data.students ?? [])].sort((a, b) =>
    (a.last_name || '').localeCompare(b.last_name || '', 'uz'),
  )
  const cars = (data.cars?.length ? data.cars : carsQuery.data) ?? []
  const cuts = attendanceCuts(classes.length, days.length)
  const firstDates = days.slice(0, cuts.first)
  const secondDates = days.slice(cuts.first, cuts.first + cuts.second)
  const restDates = days.slice(cuts.first + cuts.second)
  const loadParts: { title?: string; rows: GroupTimetableRow[] }[] = [
    { title: "O'QUV YUKLAMA BAJARISH HISOBI", rows: classes.slice(0, 10) },
  ]
  const later: [number, number, number, number][] = [
    [10, 20, 10, 20],
    [20, 30, 20, 30],
    [30, 43, 30, 43],
    [43, 56, 43, 56],
    [56, 66, 56, 68],
    [66, 72, 66, 72],
  ]
  for (const [gateFrom, gateTo, from, to] of later) {
    if (classes.slice(gateFrom, gateTo).length > 0) {
      loadParts.push({ rows: classes.slice(from, to) })
    }
  }

  return (
    <div className="jr-doc">
      <section className="jr-titul">
        <div className="jr-wrap">
          <div>
            <p className="jr-line">{org}</p>
            <p className="jr-cap">(uquv tashkiloti, muassasa nomi)</p>
            <h3>Mashg&apos;ulotlarni hisobga olish</h3>
            <h2>JURNALI</h2>
            <p className="jr-line">{category}</p>
            <p className="jr-cap">(toifasi, mutaxasisiligi)</p>
            <div className="jr-num">
              <span>№</span>
              <p className="jr-line">{group}</p>
            </div>
            <p className="jr-cap">(guruh raqami)</p>
            <p className="jr-line">{org}</p>
            <p className="jr-cap">(uquv tashkiloti, muassasa nomi)</p>
          </div>
          <p className="jr-year">{year} yil</p>
        </div>
      </section>

      <section className="jr-page jr-plan">
        <h4>O&apos;quv rejasining bajarilishi</h4>
        <table className="jr-table">
          <thead>
            <tr>
              <th rowSpan={3}>
                T/r
                <br />№
              </th>
              <th rowSpan={3}>Fan nomi</th>
              <th rowSpan={3}>
                Reja bo&apos;yicha
                <br />
                soat soni
              </th>
              <th colSpan={17}>O&apos;quv soatlarining oylar bo&apos;yicha taqsimlanishi</th>
            </tr>
            <tr>
              <th colSpan={2} />
              <th colSpan={2} />
              <th colSpan={2} />
              <th colSpan={2} />
              <th colSpan={2} />
              <th colSpan={2} />
              <th colSpan={2} />
              <th colSpan={2}>Jami</th>
              <th rowSpan={2}>Izoh</th>
            </tr>
            <tr>
              {Array.from({ length: 8 }, (_, index) => (
                <Fragment key={index}>
                  <th>Reja</th>
                  <th>Amal</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.lesson?.name_uz ?? 'fan'}-${index}`}>
                <td>{index + 1}</td>
                <td className="jr-name">{row.lesson?.name_uz || ''}</td>
                <td>{row.theoretical_hours_sum ?? ''}</td>
                <EmptyCells count={17} />
              </tr>
            ))}
            <PlanTail name="Bitiruv imtihoni" />
            <PlanTail name="YHHB imtihoni" />
            <PlanTail name="Jami" />
          </tbody>
        </table>
      </section>

      <section className="jr-page jr-statute">
        <h4>
          MASHG&apos;ULOTLAR JURNALINI YURITISH BO&apos;YICHA
          <br />
          KO&apos;RSATMALAR
        </h4>
        <div className="jr-statute-text">
          <p>
            1. Jurnal boshlangʼich asosiy hujjat hisoblanadi va uni batartib ravishda yuritish har
            bir oʼqituvchiga majburiy tartibda yuklanadi.
          </p>
          <p>
            2. Jurnal doimo mashgʼulot oʼtayotgan joyda boʼlishi kerak (elektron shakldagi jurnalga
            dustup bo`lishi lozim).
          </p>
          <p>
            3. Jurnal bir guruhga butun oʼquv davriga moʼljallangan, shu bilan birga guruh tarkibi
            haqidagi anketaviy malumotlar (2:3 bet) va oʼquv rejasining bajarilishi jurnaldagi
            daliliy yozuvlar (muqovada) oʼquv boʼlimi tomonidan to&apos;diriladi va elektron hollatda
            saqlanadi. Shu bilan birga guruh o`qish davri tugagan taqdirda jurnalni elektron
            holatdan qogozga chiqarib uni arxivga saqlab quyish lozim.
          </p>
          <p>
            4. Davomat hisobi oʼqituvchi tomonidan olib boriladi. Аgar oʼquvchining mashgʼulotda
            ishtirok etmaslik sababi aniq boʼlsa, kasallik-“K” uzursiz va sababsiz boʼlsa - “Y”-yoʼq
            belgisi bilan belgilanadi.
          </p>
          <p>
            5. Jurnalda oʼtilgan mashgʼulotlar va predmetlar yuzasidan joriy oʼzlashtirish hisobi
            olib boriladi. Jurnalda mashgʼulotning oʼtish sanasi koʼrsatiladi. Oʼqitilayotganlar
            familiyasi qarshisiga muayyan mavzu boʼyicha ballar bilan baholar qoʼyiladi. Shu bilan
            birga jurnalda mashgʼulotning oʼtilish sanasi, mavzusi va rahbarning mashgʼulot
            oʼtkazish hamda oʼqitilayotganlar tomonidan ishlab chiqilgan materialning
            oʼzlashtirilishi yuzasidan mulohazalari yoziladi.
          </p>
          <p>
            6. Аvtomobil (Mototsikl) boshqarishning yakuniy hisobi boʼlimida dasturdagi mashq
            №_____va oʼsib boruvchi boshqarish yakuni yoziladi, oʼqitilayotganlarning familyasi
            qarshisiga har bir mashqni bajarish davomidagi ularning avtomobil boshqarish sanasi
            yoziladi.
          </p>
          <p>7. Hamma oʼtilgan mashgʼulotlar oʼqituvchi tomonidan shu kunning oʼzida tegishli boʼlimiga yoziladi.</p>
          <p>8. Qo`l bilan to`ldirladigan barcha yozuvlar batartib, tuzatishlarsiz olib borilishi zarur.</p>
          <p>
            9. Mashgʼulotlar tugagach, elektron jurnal chop etiladi va oʼquv tashkilotining
            boshligʼiga topshiriladi hamda joriy yil davomida hisobot materiali sifatida saqlanadi.
          </p>
        </div>
        <div className="jr-signs">
          <SignRow role={data.asosiy_oqituvchi} fallback="FIO (asosiy o`qituvchi)" />
          <SignRow role={data.yordamchi_oqituvchi} fallback="FIO (yordamchi o`qituvchi)" />
          <SignRow role={data.tibbiyot_oqituvchisi} fallback="FIO (tibbiyot o`qituvchi)" />
          <SignRow role={data.amaliy_usta} fallback="FIO (asosiy haydovchi-yo'riqchi)" />
          <SignRow role={data.yordamchi_amaliy_usta} fallback="FIO (yordamchi haydovchi-yo'riqchi)" />
        </div>
        <div className="jr-cars">
          <p>Avtomobillar</p>
          {cars.map((car, index) => (
            <p key={`${car.number ?? 'car'}-${index}`}>
              {index + 1}. {car.name || ''} {car.number || ''}
            </p>
          ))}
        </div>
      </section>

      <section className="jr-page">
        <table className="jr-table">
          <thead>
            <tr>
              <th className="jr-narrow">
                T/r
                <br />№
              </th>
              <th className="jr-fio">F.I.Sh</th>
              <th>Tug&apos;ilgan yili</th>
              <th>Ma&apos;lumoti (necha sinfni tugatgan)</th>
              <th>Qaysi MIB xisobida turadi</th>
              <th>Mutaxassisligi va ish joyi</th>
              <th className="jr-address">Uy manzilgohi</th>
            </tr>
            <tr>
              <td>1</td>
              <td>2</td>
              <td>3</td>
              <td>4</td>
              <td>5</td>
              <td>6</td>
              <td>7</td>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id ?? index}>
                <td>{index + 1}</td>
                <td className="jr-name">{shortName(student)}</td>
                <td>{student.birthday || ''}</td>
                <td />
                <td />
                <td />
                <td className="jr-name">{addressOf(student.address)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <AttendanceSheet title="DAVOMAT" dates={firstDates} students={attendanceStudents} />
      {secondDates.length > 0 ? (
        <AttendanceSheet dates={secondDates} students={attendanceStudents} />
      ) : null}
      {restDates.length > 0 ? (
        <AttendanceSheet dates={restDates} students={attendanceStudents} />
      ) : null}

      {loadParts.map((part, index) => (
        <LoadSheet key={part.title ?? `load-${index}`} title={part.title} rows={part.rows} />
      ))}

      <PracticeAccount students={students} />
      <PracticeAccount students={students} />
      <PracticeAccount students={students} />

      <section className="jr-page">
        <h4>BITIRUV IMTIHONI ______________ soat</h4>
        <table className="jr-table jr-final">
          <colgroup>
            <col className="jr-final-num" />
            <col className="jr-final-name" />
            <col className="jr-final-car" />
            <col className="jr-final-yhq" />
            <col className="jr-final-drive" />
            <col className="jr-final-gap" />
            <col className="jr-final-gap" />
            <col className="jr-final-grade" />
            <col className="jr-final-cert" />
          </colgroup>
          <thead>
            <tr>
              <th>№</th>
              <th>Familiyasi va ismi</th>
              <th>Avtomobil tuzilishi va unga TXK</th>
              <th>YHQ va HHA</th>
              <th>Avt. Amaliy boshqarish</th>
              <th />
              <th />
              <th>Umumiy baho</th>
              <th>
                Guvohnoma
                <br />№
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id ?? index}>
                <td>{index + 1}</td>
                <td className="jr-name">{shortName(student)}</td>
                <EmptyCells count={7} />
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="jr-page">
        <h4>O&apos;QITISH NATIJALARI</h4>
        <p className="jr-sub">1.O&apos;quv tashkilotlari va kurslarida imtihon topshirish natijalari</p>
        <table className="jr-table">
          <thead>
            <tr>
              <th rowSpan={2}>O&apos;qitishning boshlarida o&apos;quvchilar miqdori</th>
              <th colSpan={3}>O&apos;qitish davomida tarqalib ketdi</th>
              <th colSpan={4}>Topshirdi</th>
              <th rowSpan={2}>Topshiraolmaganlar</th>
              <th rowSpan={2}>Imtihonga kelishmadi</th>
              <th rowSpan={2}>Ir X</th>
            </tr>
            <tr>
              <th>Jami</th>
              <th>Jumladan o&apos;zlashtirmagani uchun</th>
              <th>Imtihonga qo&apos;yildi</th>
              <th />
              <th />
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            <tr className="jr-tall">
              <EmptyCells count={11} />
            </tr>
          </tbody>
        </table>

        <p className="jr-sub">
          2.O&apos;quv tashkilotlari va kurslarida imtihon topshira olmagan o&apos;quvchilar haqida
          ma&apos;lumot.
        </p>
        <table className="jr-table">
          <thead>
            <tr>
              <th>Familyasi Ismi, Sharfi</th>
              <th>Qaysi predmetdan topshirmadi</th>
              <th>Ularni keyinchalik o&apos;qitish haqida tadbirlar</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, index) => (
              <tr key={index} className="jr-mid">
                <td />
                <td />
                <td />
              </tr>
            ))}
          </tbody>
        </table>

        <p className="jr-sub">
          3.Bilim va ko&apos;nikmalarni YHXB bilimi orqali tekshirish natijalari haqida ma&apos;lumotlar.
        </p>
        <table className="jr-table">
          <thead>
            <tr>
              <th>YHXBga tekshirish uchun qo&apos;yildi</th>
              <th>Avtomobil (motosikl) boshqarishda tekshirishdan o&apos;tdi va guvohnoma olishdi</th>
              <th>Qaysi tekshiruvga qo&apos;yildi (20 kunlik muddatga)</th>
              <th>Qaysi tekshiruvdan so&apos;ng avtomobil (motosikl) boshqarishga guvohnoma olishdi</th>
              <th>Hammasi bo&apos;lib. YHXB tekshirishidan o&apos;tishdi va 3-klass shafyor guvohnomasini olishdi</th>
              <th>3-klass shafyor guvohnomasini olmaganlar miqdori</th>
            </tr>
          </thead>
          <tbody>
            <tr className="jr-tall">
              <EmptyCells count={6} />
            </tr>
          </tbody>
        </table>
        <p className="jr-boss">O&apos;quv tashkiloti (kurs) boshlig&apos;i</p>
      </section>

      <section className="jr-page">
        <h4>TEKSHIRUVCHILARNING QAYDLARI</h4>
        <table className="jr-table">
          <thead>
            <tr>
              <th>Sana</th>
              <th>Tekshiruvchining fikrlari</th>
              <th>
                Ko&apos;rsatmalar
                <br />
                sanasi
              </th>
              <th>
                Bajarilgani
                <br />
                haqida belgi
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 20 }, (_, index) => (
              <tr key={index} className="jr-note">
                <td />
                <td />
                <td />
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
