import { fullNameOf } from '@/lib'
import type { PrintGroupData, PrintGroupInfo, PrintPerson } from '@/types/documents'
import './warning.css'

function fio(person?: PrintPerson | null) {
  return fullNameOf(person) || ''
}

function groupLabel(group?: PrintGroupInfo | null) {
  const name = group?.name
  if (name && typeof name === 'object') return name.uz || group?.name_uz || ''
  if (typeof name === 'string') return name
  return group?.name_uz || ''
}

export function WarningBody({ data }: { data: PrintGroupData }) {
  const org = data.organization?.name_uz || data.organization?.name || ''
  const category = data.edu_type?.short_name_en || data.edu_type?.short_name || ''
  const group = groupLabel(data.group)
  const teacher = fio(data.asosiy_oqituvchi?.teacher)
  const director = fio(data.director)
  const students = [...(data.students ?? [])].sort((a, b) =>
    (a.last_name || '').localeCompare(b.last_name || '', 'uz'),
  )

  return (
    <div className="wl-doc">
      {students.map((student, index) => (
        <article className="wl-letter" key={student.id ?? index}>
          <h2>OGOHLANTIRISH XATI</h2>
          <p>
            Hurmatli <b>{fio(student)}</b> Sizga <b>“{org}”</b>, avtomobil maktabi shuni
            ma’lum qiladiki. Siz ta’lim olayotgan <b>{category}</b> toifali <b>{group}</b>{' '}
            guruhda o‘tilayotgan amaliy va nazariy mashg'ulotlarga, muntazam ravishda sababsiz
            qatnashmay kelmoqdasiz. Maktab ichki tartib qoidalarini buzganligingiz tufayli siz
            bilan tuzilgan shartnomaning <b>2.10</b> bandiga asosan maktab amaliy va nazariy
            mashg'ulotlariga qatnashmasangiz siz to‘lagan pul mablag‘i qaytarilmasdan
            o‘quvchilar safidan chiqarilasiz.
          </p>
          <div className="wl-sign">
            <div className="wl-row">
              <span>Guruh o‘qituvchisi:</span>
              <b>{teacher}</b>
            </div>
            <div className="wl-row">
              <span>Tashkilot direktori:</span>
              <b>{director}</b>
            </div>
            <div className="wl-date">
              Sana: <b>_______</b>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
