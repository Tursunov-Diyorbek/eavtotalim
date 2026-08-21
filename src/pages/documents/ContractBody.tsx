import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { fetchRegions, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import { formatDate, formatNumber, fullNameOf } from '@/lib'
import type { PrintGroupData, PrintOrganization, PrintPerson } from '@/types/documents'
import './contractPrint.css'

function dashDate(value?: string | null) {
  if (!value) return ''
  return (formatDate(value) || value).replace(/\./g, '-')
}

function yearSuffix(value?: string | null) {
  const d = dashDate(value)
  return d ? d.slice(-2) : ''
}

function pickName(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') {
    const v = value.trim()
    if (!v || v === 'null') return ''
    if (v.startsWith('{') || v.startsWith('[')) {
      try {
        const nested = pickName(JSON.parse(v) as unknown)
        if (nested) return nested
      } catch {
        /* oddiy matn */
      }
    }
    return v
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = pickName(item)
      if (nested) return nested
    }
    return ''
  }
  if (typeof value !== 'object') return ''
  const rec = value as Record<string, unknown>
  return (
    pickName(rec.uz) ||
    pickName(rec.name_uz) ||
    pickName(rec.kiril) ||
    pickName(rec.name_kiril) ||
    pickName(rec.ru) ||
    pickName(rec.body) ||
    pickName(rec.lang) ||
    pickName(rec.name)
  )
}

function regionIdOf(data: PrintGroupData, meRegion: unknown, meRegionId?: number | null) {
  const rec = (value: unknown) => {
    if (!value || typeof value !== 'object') return ''
    const id = (value as { id?: unknown; region_id?: unknown }).id
      ?? (value as { region_id?: unknown }).region_id
    return id != null && id !== '' ? String(id) : ''
  }
  return (
    rec(data.region) ||
    rec(data.organization?.region) ||
    (data.organization?.region_id != null ? String(data.organization.region_id) : '') ||
    rec(meRegion) ||
    (meRegionId != null ? String(meRegionId) : '')
  )
}

function hasAgreement(org: PrintOrganization | null | undefined) {
  return Number(org?.agreement) === 1
}

function schoolName(org: PrintOrganization | null | undefined) {
  if (!hasAgreement(org)) return null
  return org?.name_kiril || org?.name_uz || org?.name || null
}

function personName(person: PrintPerson | null | undefined) {
  return fullNameOf(person) || ''
}

function directorIntroName(person: PrintPerson | null | undefined) {
  if (!person) return ''
  return [person.first_name, person.last_name, person.middle_name]
    .filter(Boolean)
    .join(' ')
}

function contractNo(student: PrintPerson) {
  const year = yearSuffix(student.created_at)
  if (student.id == null) return year ? `_______________ - ${year}` : '_______________'
  return year ? `${student.id} - ${year}` : String(student.id)
}

function ManualToggle({
  auto,
  onClick,
}: {
  auto: boolean
  onClick: () => void
}) {
  return (
    <Button variant="ghost" size="sm" className="hide-button mr-2" onClick={onClick}>
      <Pencil className="size-3.5" aria-hidden />
      {auto ? "Qo'lda kiritish" : 'Avtomatik kiritish'}
    </Button>
  )
}

export function ContractBody({ data }: { data: PrintGroupData }) {
  const { me, isAuthenticated } = useAuth()
  const [autoNumber, setAutoNumber] = useState(true)
  const [autoYear, setAutoYear] = useState(true)
  const org = data.organization
  const school = schoolName(org)
  const director = data.director
  const cat = data.edu_type?.short_name_en || data.edu_type?.short_name || '____'
  const orgRegion = me?.profession?.organization?.region
  const orgRegionId = me?.profession?.organization?.region_id
  const directRegion =
    pickName(data.region) ||
    pickName(data.organization?.region) ||
    pickName(orgRegion)
  const lookupId = regionIdOf(data, orgRegion, orgRegionId)
  const regionsQuery = useQuery({
    queryKey: queryKeys.students.regions(),
    queryFn: fetchRegions,
    enabled: isAuthenticated && !directRegion && Boolean(lookupId),
  })
  const fromList = regionsQuery.data?.find((row) => String(row.id) === lookupId)
  const region = directRegion || pickName(fromList)
  const students = [...(data.students ?? [])].sort((a, b) =>
    String(a.last_name ?? '').localeCompare(String(b.last_name ?? ''), 'uz'),
  )
  const from = data.group?.edu_starting_date || data.starting_date || '__________________'
  const to = data.group?.edu_ending_date || data.ending_date || '__________________'
  const price = data.price ?? data.education_price
  const firstPay = data.first_pay || 30
  const orgInfo = data.organization_info
  const bank = data.bank

  return (
    <>
      {students.map((student, index) => {
        const fio = personName(student)
        const number = contractNo(student)
        const created = dashDate(student.created_at)
        return (
          <div key={student.id ?? `${fio}-${index}`} className="card_page_view">
            <div>
              <span>
                Shartnoma raqami:&nbsp;
                <u>
                  <strong>{number}</strong>
                </u>
              </span>
              <br />
              <span>
                Pasport seria va raqam:&nbsp;
                <u>
                  <strong>
                    {student.passport_seria} {student.passport_number}
                  </strong>
                </u>
              </span>
              <br />
              <span>
                Tashkilot inn:{' '}
                <u>
                  <strong>{org?.inn}</strong>
                </u>
              </span>
            </div>
            <h5>
              <ManualToggle auto={autoNumber} onClick={() => setAutoNumber((v) => !v)} />
              <span style={{ display: autoNumber ? undefined : 'none' }}>{number}</span>
              <span style={{ display: autoNumber ? 'none' : undefined }}>
                _______________
              </span>
              <span> SONLI SHARTNOMA</span>
            </h5>
            <div className="contract-date-row">
              <span>"______"_______________</span>
              <span className="contract-date-right">
                <ManualToggle auto={autoYear} onClick={() => setAutoYear((v) => !v)} />
                {autoYear ? (
                  <span>
                    {created || '_________________________'}
                    {created ? '-yil' : ''}
                    {region ? ` ${region}` : ''}
                  </span>
                ) : (
                  '_________________________'
                )}
              </span>
            </div>
            <span className="mt-3 block">
              <b>
                {school ?? (
                  <Badge tone="rose">«Shartnoma qilinmagan avtomaktab»</Badge>
                )}
              </b>{' '}
              boshligʼi <b>{directorIntroName(director)}</b> bundan keyingi
              matnlarda <b>“Oʼquv muassasasi”</b> deb nomlanuvchi, Oʼzbekiston
              Respublikasi qonunchiligi va amaldagi <strong>Ustavi</strong>ga
              asoslanib ish yurituvchi bir tomondan va fuqaro&nbsp;
              <b>{fio}</b>, bundan keyingi matnlarda
              <b>“Taʼlim oluvchi”</b> deb nomlanuvchi, amaldagi Oʼzbekiston
              Respublikasi qonunchiligi va amaldagi Fuqarolik kodeksi
              talablariga asoslanib ish yurituvchi ikkinchi tomondan mazkur
              shartnomani quyidagilar toʼgʼrisida tuzdik:
            </span>
            <h5>1. SHARTNOMANING PREDMETI</h5>
            <span>
              1.1.<b>“Oʼquv muassasasi”</b> mazkur shartnoma shartlariga asosan,{' '}
              <b>«Taʼlim oluvchini»</b> <b>{cat}</b>&nbsp; toifali avtotransport
              vositalari haydovchilarini tayyorlash toifali avtotransport
              vositasi haydovchiligiga tayyorlaydi.
            </span>
            <br />
            <h5>
              2. <b>“OʼQUV MUASSASASI”</b> NING HUQUQ VA MAJBURIYATLARI
            </h5>
            2.1.Avtotransport vositalari haydovchilarini tayyorlash va qayta
            tayyorlash oʼquv jarayonini Oʼzbekiston Respublikasi Vazirlar
            Mahkamasining Qarorlari, amaldagi rahbariy-meʼyoriy xujjatlar hamda
            belgilangan tartibda tasdiqlangan yagona oʼquv rejasi va dasturlariga
            asosan olib boradi. Oʼquv dasturlarida belgilangan oʼquv
            mashgʼulotlarining toʼla xajmda bajarlishini taʼminlaydi.
            <br />
            2.2.<b>“Taʼlim oluvchi”</b>ning oʼqishga qabul qilinishi uchun taqdim
            etishi lozim boʼlgan xujjatlarni, amaldagi rahbariy-meʼyoriy
            xujjatlar asosida toʼliq talab qiladi.
            <br />
            2.3.<b>“Taʼlim oluvchi”</b> uchun avtomototransport vositalari
            xaydovchilarini tayyorlash va qayta tayyorlash muddatlarini
            tasdiqlangan rejalar va oʼquv dasturlariga muvofiq belgilaydi.
            <br />
            2.4.<b>“Taʼlim oluvchi”</b>ga tegishli dastur asosida{' '}
            <b>oʼquv muassasasi</b>dagi bitiruv imtixonlarini test sinovlari
            asosida muvaffaqiyatli topshirganidan soʼng, unga taʼlimni
            tugatganligi toʼgʼrisidagi, belgilangan naʼmunadagi guvohnomani
            beradi.
            <br />
            2.5.Zarurat tugʼilganda <b>“Taʼlim oluvchi”</b>
            lar safiga qabul qilinayotgan nomzodlarning bilim darajasi va amaliy
            mahoratlarini aniqlash uchun suhbatdan oʼtkazadi.
            <br />
            2.6.<b>“Taʼlim oluvchi”</b>larga taʼlim olish uchun qulay sharoitlar
            (talab darajasida jixozlangan oʼquv va sinf xonalari, amaliy
            mashgʼulotlarni oʼtashlari uchun texnik soz boʼlgan oʼquv avtomobili
            bilan taʼminlash) yaratadi.
            <br />
            2.7.Mazkur shartnomaning 4-boʼlim 4.2-bandiga asosan oldindan oʼqish
            pulini toʼlamagan <b>“Taʼlim oluvchi”</b>lar oʼqishga qabul
            qilinmaydi va taʼlim olishdan chetlatiladi.
            <br />
            2.8.<b>«Taʼlim oluvchi»</b> uchun ushbu shartnomaning 3-boʼlimi
            bandlari orqali belgilangan vazifalar, oʼquvchi tomonidan qoʼpol
            ravishda buzilsa, unga nisbatdan mos ravishda taʼsir choralari
            koʼriladi.
            <br />
            2.9.<b>«Taʼlim oluvchi»</b>dan oʼquv mashgʼulotlarini qoʼyib
            yuborgan kunlarini tasdiqlovchi xujjatlarni taqdim etishini talab
            qiladi.
            <br />
            2.10.Agar <b>“Taʼlim oluvchi”</b> Dasturda belgilangan oʼquv
            mashgʼulotlarining 20 foizidan ortigʼini sababsiz qoldirsa va
            sababini tasdiqlovchi xujjatlarni taqdim etmasa,{' '}
            <b>“Taʼlim oluvchi”</b> buyruq asosida <b>taʼlim oluvchi</b>lar
            safidan chiqariladi va oʼqishga qayta qabul qilish umumiy qoidalar
            asosida amalga oshiriladi.
            <br />
            2.11.Agar <b>«Taʼlim oluvchi»</b> Dasturda belgilangan oʼquv
            mashgʼulotlarining 20 foizi miqdorini sababli ravishda qoldirsa,
            oʼquv dasturi boʼyicha quyib yuborgan soatlarini xisobga olgan xolda,{' '}
            <b>«Taʼlim oluvchi»</b> boshqa oʼquv guruhiga oʼtkaziladi.
            <br />
            <h5>3. «TA'LIM OLUVCHI» NING HUQUQ VA MAJBURIYATLARI</h5>
            3.1.<b>“Taʼlim oluvchi”</b> Oʼzbekiston Respublikasi Vazirlar
            Mahkamasining Qarorlari, amaldagi rahbariy-meʼyoriy xujjatlar
            talablariga asosan, oʼqishga qabul qilish uchun tegishli xujjatlarni
            «Oʼquv muassasasi»ga taqdim etadi.
            <br />
            3.2.Oʼquv mashgʼulotlari soatlari va xajmining, haydovchilarni{' '}
            <b>«{cat}»</b> toifali avtotransport vositalari haydovchilarini
            tayyorlash toifali avtotransport vositasi haydovchiligiga
            tayyorlashdagi oʼquv reja va dasturlarida belgilangan toʼliq xajmda
            olib borilishini «Oʼquv muassasasi» dan talab qiladi.
            <br />
            3.3.Avtotransport vositalari xaydovchilarini tegishli toifalarga
            sifatli tayyorlash va qayta tayyorlashga imkoniyat yaratish uchun
            qulay sharoitlar tashkil etilishini «Oʼquv muassasasi»dan talab
            etadi.
            <br />
            3.4.Oʼqish uchun haq toʼlashni ushbu shartnomaning 4-boʼlim
            4.2-bandida koʼrsatilgan miqdorda, oʼquv guruhi tashkil etilgunga
            qadar tegishli bank yoki bank shaxobchalari orqali naqd pul toʼlash,
            plastik kartochkalar orqali toʼlash yoki pul oʼtkazish yoʼli bilan
            «Oʼquv muassasasi»ning xisob raqamiga pul tushirish yoʼli bilan
            amalga oshiradi.
            <br />
            3.5.<b>«Oʼquv muassasasi»</b> tomonidan oʼtkaziladigan barcha
            tadbirlarda faol qatnashadi.
            <br />
            3.6.<b>«Oʼquv muassasasi»</b> ning ichki tartib qoidalariga qatʼiy
            rioya qiladi.
            <br />
            3.7.Oʼqish yakunida oʼquv Dasturi boʼyicha belgilangan tartibda{' '}
            <b>oʼquv muassasasi</b>dagi ichki imtixonlarni belgilangan
            tartibdagi test sinovlari asosida topshiradi.
            <br />
            <h5>
              4. OʼQUV MASHGʼULOTINING TURI, HAJMI, MUDDATI VA UMUMIY QIYMATI
            </h5>
            4.1.Oʼquv mashgʼulotlarining qiymat miqdori va muddatini aniqlash.
            <br />
            <table>
              <tbody>
                <tr>
                  <td>Oʼquv mashgʼulotlari(taʼlim) turi</td>
                  <td>Nazariy soat</td>
                  <td>Amaliy soat</td>
                  <td>Amaliy boshqaruv soati</td>
                  <td>Oʼqish muddati</td>
                  <td>Oʼqish narxi (soʼm)</td>
                </tr>
                <tr>
                  <td>
                    <b>Nazariy va amaliy mashgʼulotlar</b>
                  </td>
                  <td />
                  <td />
                  <td />
                  <td>
                    <b>
                      {from} dan {to} gacha
                    </b>
                  </td>
                  <td>
                    <b>{price != null && price !== '' ? formatNumber(price) : ''}</b>
                  </td>
                </tr>
              </tbody>
            </table>
            4.2.Tomonlar kelishuviga asosan, <b>«Taʼlim oluvchi»</b> toʼlov
            summasining <b>{firstPay} %(oʼttiz foiz)</b> kam boʼlmagan mablagʼ
            miqdori toʼlovini oʼquv mashgʼulotlari boshlanishidan oldin, qolgan
            qismini esa (toʼla xisob-kitobni) oʼquv Dasturining birinchi yarmi
            tugaguniga qadar toʼliq amalga oshiradi.
            <br />
            4.3.<b>«Taʼlim oluvchi»</b> da avtomobilni boshqarishni oʼrganish
            boʼyicha qoʼshimcha dars mashgʼulotlarini oʼtish istagi boʼlgan
            taqdirda, yozma ravishda ariza bilan murojaat etadi va kalkulyatsiya
            boʼyicha bank va bank shaxobchalari orqali tegishli mablagʼni{' '}
            <b>«Oʼquv muassasasi»</b> xisob raqamiga toʼlaydi.
            <br />
            <h5>5. ALOHIDA SHARTLAR</h5>
            5.1. Hukumat qarorlari yoki farmonlariga asosan yoqilgʼi-moy va
            boshqa tovar maxsulotlarining narxlari va ish xaqining oshishi
            munosabati bilan oʼquv jarayonini tashkil etishga sarflanadigan
            xarajatlar koʼpaysa, shunga mos ravishda toʼlov miqdori oʼzgarishi
            va oshishi mumkin. Bu borada
            <b>
              {' '}
              «Oʼquv muassasasi» 10 kun ichida «Taʼlim oluvchi»ga xabar beradi
              va shu davr ichida «Taʼlim oluvchi» belgilangan toʼlovni amalga
              oshiradi.
            </b>{' '}
            <br />
            5.2.Oʼquv guruHi toʼliq jamlangandan keyin, <b>«Taʼlim oluvchi»</b>
            lar bilan oʼqish boshlanadi va bu toʼgʼrida oʼqishning boshlanishi
            haqida <b>«Oʼquv muassasa»</b> boʼyicha buyruq chiqariladi.
            <br />
            5.3.<b>«Taʼlim oluvchi» «Oʼquv muassasasi»</b> da oʼquv Dasturini
            toʼliq oʼtib,{' '}
            <b>
              «Taʼlim oluvchi» ichki test imtihonlarini topshirgan va o`qiganlik
              haqidagi guvohnoma olgan kuni
            </b>{' '}
            oʼqish muddati tugagan va mazkur shartnoma boʼyicha ikki tomonlama
            olingan majburiyatlar toʼliq bajarilgan deb hisoblanadi.
            <br />
            <div className="contract-page-2">
              <h5>6. TOMONLARNING JAVOBGARLIGI</h5>
              6.1.Shartnomadagi toʼlov miqdorini oʼz vaqtida toʼliq miqdorda
              toʼlamasa <b>«Taʼlim oluvchi»</b>dan har bir kechiktirilgan kun
              uchun umumiy oʼqish pulining <b>0,4%</b>, lekin bu miqdor
              shartnomada koʼrsatilgan umumiy oʼqish pulining <b>15%</b> dan
              koʼp boʼlmasligi kerak.
              <br />
              6.2.Ushbu shartnomaning 2-boʼlim 2.3-bandida qayd etilgan hamda
              oʼqish muddatlari sababsiz ravishda <b>«Oʼquv muassasasi»</b>
              tomonidan uzaytirilsa, <b>«Oʼquv muassasasi» «Taʼlim oluvchiga»</b>{' '}
              uzaytirilgan har bir kun uchun shartnomadaga umumiy summaning{' '}
              <br />
              <b>0,4%</b> miqdorida penya tulaydi, lekin bu miqdor shartnomada
              koʼrsatilgan umumiy oʼqish pulining <b>15%</b> dan koʼp
              boʼlmasligi kerak.
              <br />
              6.3.
              <b>
                Agar «Taʼlim oluvchi» ushbu shartnomaning 2-boʼlim 2.10-bandi va
                3-boʼlim 3.5-bandiga asosan «Taʼlim oluvchi»lar safidan
                chiqarilgan boʼlsa «Oʼquv muassasasi» «Taʼlim oluvchi» tomonidan
                toʼlangan pul mablagʼlarini qaytarmaydi.
              </b>{' '}
              <br />
              6.4.
              <b>
                Agar «Taʼlim oluvchi» oʼquvchilar safidan sababli ravishda
                chiqarilgan boʼlsa, uning toʼlagan pul mablagʼlari miqdori
                oʼqish davrida xaqiqiy sarflangan xarajatlari boʼyicha
                xisob-kitob qilinadi va qolgan qoldiq mablagʼlar «Taʼlim
                oluvchi»ga qonunda belgilangan tartibda uning shaxsiy hisob
                raqamiga oʼtkazish orqali qaytarib beriladi.
              </b>{' '}
              <br />
              6.5.Agar ushbu shartnoma boʼyicha bahs va tortishuvlar roʼy bersa,
              ular muzokara yoʼli bilan hal etiladi, aks holda tomonlar tegishli
              sud idoralariga murojaat etish xuquqiga ega.
              <br />
              <h5>7. FORS-MAJOR HOLATLAR</h5>
              7.1.Ushbu shartnomadagi oʼzaro olingan majburiyatlar ularga bogʼliq
              boʼlmagan sabablarga koʼra toʼla yoki qisman bajarilmasa, tomonlar
              javobgarlikka tortilmaydi.
              <br />
            </div>
            <h5>
              8. SHARTNOMANING AMAL QILISHI, UNI OʼZGARTIRISH VA BEKOR QILISH:
            </h5>
            8.1. Shartnoma imzolangan kundan boshlab kuchga kiradi va{' '}
            <b>«Taʼlim oluvchi»</b> tomonidan oʼqish Dasturini toʼliq oʼtab,
            avtomototransport vositalari xaydovchilarini tayyorlash kurslarini
            tugatganligi toʼgʼrisidagi guvoxnomani olgunga qadar amal qiladi.
            <br />
            8.2.Ushbu shartnoma taraflarning kelishuviga muvofiq oʼzgartirilishi
            yoki bekor qilinishi mumkin.
            <br />
            8.3.Shartnoma ikki nusxada tuziladi va bir xil kuchga ega.
            <br />
            <h5>9. TOMONLAR XUQUQIY MANZILLARI VA REKVIZITLARI</h5>
            <table className="contract-parties">
              <tbody>
                <tr>
                  <td className="center-head">
                    <b>“OʼQUV MUASASSASI”</b>
                  </td>
                  <td className="center-head">
                    <b>“TA’LIM OLUVCHI”</b>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={{ padding: 5 }}>
                      {school ?? '«Шартнома қилинмаган автомактаб»'}
                      <br />
                      {org?.address}
                      <br />
                      H/R {org?.hr}
                      <br />
                      MFO {org?.mfo}, INN {org?.inn}, OKONX {orgInfo?.okonh}.{' '}
                      {bank?.bank_name} {bank?.bank_address}
                      <br />
                      Tel: {org?.phone ? `+998${org.phone}` : ''}
                      <br />
                      {org?.email && org.email !== 'null' ? org.email : ' '}
                      {school ?? '«Шартнома қилинмаган автомактаб»'}
                      <br />
                      (imzo)_________________ {director?.last_name}{' '}
                      {director?.first_name}
                    </div>
                  </td>
                  <td className="contract-learner">
                    <div>
                      {fio}
                      <br />
                      Manzili: {student.address}
                      <br />
                      Pasport seria va raqam: {student.passport_seria} №{' '}
                      {student.passport_number}
                      <br />
                      Telefonlar:(uy) +998
                      {student.phone1 || student.phone2 || student.phone || ''}
                    </div>
                    <div className="contract-learner-sign">
                      Imzo:_________________________________
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      })}
    </>
  )
}
