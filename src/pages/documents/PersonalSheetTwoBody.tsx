import { formatDate } from '@/lib'
import type { PrintGroupData, PrintPerson } from '@/types/documents'
import { QrCodeImg } from './QrCodeImg'
import './personalSheetTwo.css'

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
  return formatDate(value) || value
}

function Blanks({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <td key={index} />
      ))}
    </>
  )
}

function Row({ text, points }: { text: string; points?: number }) {
  return (
    <tr>
      <td className="ps2-item">{text}</td>
      <td className="ps2-points">{points ?? ''}</td>
      <Blanks count={5} />
    </tr>
  )
}

function SheetTwoCard({ data, student }: { data: PrintGroupData; student: PrintPerson }) {
  const org = data.organization?.name_uz || data.organization?.name || ''
  const category = data.edu_type?.short_name_en || data.group?.edu_type?.short_name_en || ''
  const year = new Date().getFullYear()
  const qr = `Tizim:"https://eavtotalim.uz/" Avtomaktab:${org} Guruh:${
    groupLabel(data) || "guruhning nomi yo'q"
  } Toifa:${category} Passport ma'lumoti:${student.passport_seria || ''}${student.passport_number || ''}`

  return (
    <article className="ps2-sheet">
      <table className="ps2-pad">
        <thead>
          <tr>
            <td />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <p>
                Pasport seriya va raqam:{' '}
                <u>
                  <b>
                    {student.passport_seria} {student.passport_number}
                  </b>
                </u>
              </p>
              <p>
                Guruh:{' '}
                <u>
                  <b>{groupLabel(data)}</b>
                </u>
              </p>
              <h2>AVTOMOBIL BOSHQARISH BUYICHA IMTIHON OLISH VARAQASI</h2>
              <div className="ps2-who">
                <div>
                  <p className="ps2-line">
                    {student.last_name} {student.first_name} {student.middle_name}
                  </p>
                  <p className="ps2-hint">familiya, ismi, sharifi</p>
                </div>
                <div>
                  <p className="ps2-line">{sheetDate(student.birthday)}</p>
                  <p className="ps2-hint">tug`ilgan yili</p>
                </div>
              </div>

              <table className="ps2-table">
                <thead>
                  <tr>
                    <th rowSpan={4} className="ps2-h-item" />
                    <th rowSpan={4} className="ps2-h-points">
                      Bitta xato uchun jarima sonlar
                    </th>
                    <th colSpan={5}>To&apos;plangan jarima sonlar</th>
                  </tr>
                  <tr>
                    <th colSpan={5}>Imtihon o&apos;tkazilgan sana</th>
                  </tr>
                  <tr>
                    <th rowSpan={2} />
                    <th rowSpan={2} />
                    <th rowSpan={2} colSpan={3}>
                      <p>{category} - ________</p>
                      <p>
                        « ___ » ___. {year}y
                      </p>
                    </th>
                  </tr>
                  <tr />
                </thead>
                <tbody>
                  <Row text="I. Birinchi bosqich (avtodrom yoki yopiq maydoncha) Balandlikka qo`zg`olishda:" />
                  <Row text="1. Notekis qo‘zg‘aldi." points={20} />
                  <Row text="2. Dvigatelni o'chirib qo'ydi" points={20} />
                  <Row text="3. Orqaga 70 sm dan ortiq yurdi" points={20} />
                  <Row text="II. Cheklangan xarakat qismidan qayrilish joyi." />
                  <Row text="1. Orqaga uzatmani bir marta qushib qayrila olmadi" points={20} />
                  <Row text="2. Dvigatelni o`chirib qo`ydi" points={20} />
                  <Row text="3. Cheklagichlardan kekka o`tib ketdi" points={20} />
                  <tr>
                    <td className="ps2-item">
                      III. Avtomabilni orqaga xarakatlantrib to`xtab turish joyiga (BOKS) qo`yish
                    </td>
                    <td className="ps2-points" />
                    <td />
                    <td />
                    <td className="ps2-org" rowSpan={3} colSpan={3}>
                      <p>
                        <b>« {org} »</b>
                      </p>
                      <p>________________</p>
                    </td>
                  </tr>
                  <tr>
                    <td className="ps2-item">1.orqa uzatmani bir marta qo`shib kira olmadi</td>
                    <td className="ps2-points">20</td>
                    <td />
                    <td />
                  </tr>
                  <tr>
                    <td className="ps2-item">2.Dvigatelni o`chrib qo`ydi</td>
                    <td className="ps2-points">20</td>
                    <td />
                    <td />
                  </tr>
                  <Row text="3.Turar-joy chigarasidan chetga o`tib ketdi" points={20} />
                  <Row text="4.Bosqichni noto`g`ri bajardi" points={100} />
                  <Row text="IV.Birinchi bosqich natijalari" />
                  <Row text="1.1 Ikkinchi bosqich (sinov yo`nalishi)" />
                  <Row text="2.1 Boshqarish organlari foydalanishni bilmaydi tekis xarakatlanishini taminlamadi" points={20} />
                  <Row text="2.2 Bilgilangan xarakat tezlikga va oraliq masofaga rioya qilmadi" points={20} />
                  <Row text="2.3 Xarakat qismida to`g`ri joylashishga rioya qilmadi" points={20} />
                  <Row text="2.4 Bir yo`nalishdan ikkinchisiga joylashishini noto`ti bajardi" points={20} />
                  <Row text="2.5 Svetafor va xarakatni tartibga oluvchi ko`rsatmasiga rioya qilmadi" />
                  <Row text="2.6 Yo`l belgilari va razmetkalarining talablariga rioya qilmadi" points={25} />
                  <Row text="2.7 burilish , qayrilish va to`xtatigni noto`g`ri bajardi" />
                  <tr>
                    <td className="ps2-item">
                      2.8 Avariya xolatini yaratish tufayli imtixon oluvchi boshqaruviga aralashdi
                    </td>
                    <td className="ps2-points">100</td>
                    <td />
                    <td className="ps2-center" colSpan={3}>
                      __________________
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <td className="ps2-item">Ikkinchi bosqichning natijalari:</td>
                    <td />
                    <td />
                    <td className="ps2-center" colSpan={3}>
                      __________________
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <td className="ps2-item">Jami to&apos;planganjarima ballari</td>
                    <td />
                    <td />
                    <td className="ps2-center" colSpan={3}>
                      Toifaga topshirdi
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <td className="ps2-item">Imtixon natijasi (toshirdi toshirmadi)</td>
                    <Blanks count={6} />
                  </tr>
                  <tr>
                    <td />
                    <td />
                    <td className="ps2-center" colSpan={3}>
                      Toifaga topshirdi
                    </td>
                    <td />
                    <td />
                  </tr>
                  <tr>
                    <td />
                    <td className="ps2-result" colSpan={6}>
                      <p>Nazariy va amaliy imtihon</p>
                      <div className="ps2-ovals">
                        <span className="ps2-oval" />
                        Topshirdi
                        <span className="ps2-oval" />
                        Topshirmadi
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="ps2-foot">
                <p>Tibbiy kurikdan o`tgan sana ___________________</p>
                <p>_________________________________________</p>
              </div>
              <div className="ps2-qr">
                <QrCodeImg data={qr} size={96} margin={1} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  )
}

export function PersonalSheetTwoBody({ data }: { data: PrintGroupData }) {
  const students = [...(data.students ?? [])].sort((a, b) =>
    String(a.last_name ?? '').localeCompare(String(b.last_name ?? ''), 'uz'),
  )
  return (
    <>
      {students.map((student, index) => (
        <SheetTwoCard
          key={student.id ?? `${student.last_name}-${index}`}
          data={data}
          student={student}
        />
      ))}
    </>
  )
}
