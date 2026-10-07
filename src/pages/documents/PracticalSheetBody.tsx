import { PATH_PREFIX_FILE } from '@/config'
import { usePracticalChaptersQuery } from '@/features/documents'
import { useGroupCarsQuery } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import type { PrintGroupData, PrintPerson } from '@/types/documents'
import { QrCodeImg } from './QrCodeImg'
import './practicalSheet.css'

function practicalLessonId(eduTypeId?: number | null) {
  if (eduTypeId === 2) return '146'
  if (eduTypeId === 1) return '149'
  if (eduTypeId === 4) return '152'
  if (eduTypeId === 3) return '155'
  return ''
}

function groupName(data: PrintGroupData) {
  const group = data.group
  if (!group) return ''
  if (group.name && typeof group.name === 'object') return group.name.uz || group.name_uz || ''
  return group.name_uz || (typeof group.name === 'string' ? group.name : '') || ''
}

function personName(person?: PrintPerson | null) {
  return [person?.last_name, person?.first_name, person?.middle_name].filter(Boolean).join(' ')
}

function stamp(value?: string | null) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '')
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

function directorLine(person?: PrintPerson | null) {
  const initial = person?.first_name?.charAt(0)
  const last = person?.last_name || ''
  const name = initial ? `${initial}. ${last}` : last
  return `${name} _________________`.trim()
}

function exerciseNames(chapters: { id: number; name_uz?: string | null }[]) {
  const names: string[] = []
  for (const chapter of chapters) {
    const times = chapter.id === 1175 ? 16 : 1
    for (let index = 0; index < times; index += 1) names.push(chapter.name_uz || '')
  }
  return names
}

function PracticalCard({
  data,
  student,
  tasks,
  cars,
  compactNames,
}: {
  data: PrintGroupData
  student: PrintPerson
  tasks: string[]
  cars: { name?: string | null; number?: string | null }[]
  compactNames: boolean
}) {
  const org = data.organization?.name_uz || ''
  const category = data.edu_type?.short_name_en || data.group?.edu_type?.short_name_en || ''
  const photo = student.image ? resolveFileUrl(student.image, PATH_PREFIX_FILE) : ''
  const qr = `Tizim:"https://eavtotalim.uz/" Avtomaktab:${org} Guruh:${groupName(data) || "guruhning nomi yo'q"} Toifa:${category} Passport ma'lumoti:${student.passport_seria || ''}${student.passport_number || ''}`
  const carLine = cars.map((car) => `${car.name || ''}-${car.number || ''}`).filter((item) => item !== '-').join(', ')

  return (
    <article className="px-sheet">
      <h2>AMALIY MASHQ BAJARISH VARAQASI</h2>
      <div className="px-head">
        <div className="px-infos">
          <div className="px-photo">
            {photo ? (
              <img src={photo} alt="" />
            ) : (
              <svg className="px-placeholder" viewBox="0 0 64 64" preserveAspectRatio="xMidYMid meet" aria-hidden>
                <circle cx="32" cy="32" r="31" className="px-placeholder-bg" />
                <circle cx="32" cy="24" r="9" />
                <path d="M16 50.5c1.2-9.5 6.8-14.5 16-14.5s14.8 5 16 14.5" />
              </svg>
            )}
          </div>
          <table className="px-meta">
            <tbody>
              <tr>
                <td>O&apos;quvchining familiyasi ismi</td>
                <td>{personName(student)}</td>
              </tr>
              <tr>
                <td>O&apos;qigan guruhining tartib raqami №</td>
                <td>
                  {groupName(data)} {category}
                </td>
              </tr>
              <tr>
                <td>Haydovchi-yo&apos;riqchining familiyasi va ismi</td>
                <td>{personName(data.amaliy_usta?.teacher)}</td>
              </tr>
              <tr>
                <td>Yengil avtomobil markasi</td>
                <td>{carLine}</td>
              </tr>
              <tr>
                <td>O&apos;qishning boshlanishi</td>
                <td>{stamp(data.starting_date) ? `${stamp(data.starting_date)} yil` : ''}</td>
              </tr>
              <tr>
                <td>O&apos;qishning tugashi</td>
                <td>{stamp(data.ending_date) ? `${stamp(data.ending_date)} yil` : ''}</td>
              </tr>
              <tr>
                <td>Ta&apos;lim muasasaning boshlig&apos;i</td>
                <td>{directorLine(data.director)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <QrCodeImg data={qr} size={100} margin={0} />
      </div>

      <table className="px-table">
        <thead>
          <tr>
            <th className="px-num">№</th>
            <th className="px-task">Vazifalari nomi</th>
            <th>Mashqlar umumiy soat</th>
            <th>Mashqlar raqami</th>
            <th>Mashq soatlari</th>
            <th>Sana</th>
            <th>Baho</th>
            <th>O&apos;quvchining imzosi</th>
            <th>Ustaning imzosi</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((name, index) => (
            <tr key={`${name}-${index}`}>
              <td>{index + 1}</td>
              <td className={compactNames ? 'px-name px-name-compact' : 'px-name'}>{name}</td>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
            </tr>
          ))}
          <tr>
            <td />
            <td className="px-name">Jami soat:</td>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
          </tr>
        </tbody>
      </table>

      <p className="px-extra-title">Qo`shimcha haydovchi-yo&apos;riqchilar</p>
      <table className="px-extra">
        <thead>
          <tr>
            <th className="px-extra-n" />
            <th>Haydovchi-yo&apos;riqchi F.I.SH</th>
            <th className="px-extra-gap" />
            <th>Avtotransport markasi</th>
            <th className="px-extra-gap" />
            <th>Avtotransport davlat raqami</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((no) => (
            <tr key={no}>
              <td>{no}</td>
              <td className="px-line" />
              <td />
              <td className="px-line" />
              <td />
              <td className="px-line" />
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  )
}

export function PracticalSheetBody({ data }: { data: PrintGroupData }) {
  const lessonId = practicalLessonId(data.edu_type?.id ?? data.group?.edu_type?.id)
  const chapters = usePracticalChaptersQuery(lessonId || undefined)
  const carsQuery = useGroupCarsQuery(
    data.group?.id != null ? String(data.group.id) : undefined,
    !(data.cars && data.cars.length > 0),
  )
  const tasks = exerciseNames(chapters.data ?? [])
  const cars = (data.cars?.length ? data.cars : carsQuery.data) ?? []
  const compactNames =
    data.edu_type?.character_name === 'B' || data.edu_type?.short_name_en === 'B'
  const students = [...(data.students ?? [])].sort((a, b) =>
    (a.last_name || '').localeCompare(b.last_name || '', 'uz'),
  )

  return (
    <>
      {students.map((student, index) => (
        <PracticalCard
          key={student.id ?? `${student.last_name}-${index}`}
          data={data}
          student={student}
          tasks={tasks}
          cars={cars}
          compactNames={compactNames}
        />
      ))}
    </>
  )
}
