# Ishlar jurnali (WORKLOG)

Yangi yozuv **yuqoriga**. Har yozuvda: nima → nima uchun → tahlil → keyingi.

---

## 2026-08-20 — Xarajat modal tugmalari

### Nima qilindi
`Textarea` `Field` o‘rami endi `h-auto` (ilgari `h-11` qotib, textarea pastdagi tugmalarni yopardi). Xarajat/tur modallarida Bekor/Saqlash `Modal` footerida, `grid-cols-2`, bir xil `h-11`. Bo‘sh majburiy maydonda `notify.error`.

### Nima uchun
«Xarajat qo‘shish» da tugmalar ko‘rinardi-yu, bosilmasdi — Izoh textarea overflow hit-test tugmalarni yopgan.

---

## 2026-08-20 — Xarajatlar boshqaruvi

### Nima qilindi

`/expenses`: 4 tab (qo‘shish, yillik, oraliq, turlar), sana/oraliq/yil filtrlari, CRUD modal, o‘chirish `ConfirmDialog`. API: `GET/POST/PUT/DELETE v2 /organization-expense`, `/organization-expense-type`, `monthly-expenses`, `expenses-between-dates`.

### Nima uchun

Sahifa generic jadval edi; screenshotdagi tablar, modal va hisobotlar yo‘q edi.

---

## 2026-08-20 — Avtodrom shartnomasi

### Nima qilindi

`/autodrome-agreement`: shartnoma qilingan avtodrom kameralari (qidiruv, holat, yangilash, `@intalim_bot`), jadval (sana Badge, PDF, o‘chirish/to‘xtatish/bekor). Yuborish `/autodrome-send-agreement` (avtodrom, PDF, sanalar, xarita). Ko‘rish `/autodrome-show-agreement/:id`. API: `GET/POST/DELETE v2 /autodrome-agreements/*`.

### Nima uchun

Sahifa generic jadval edi; screenshotdagi kameralar, amallar va yuborish formasi yo‘q edi.

---

## 2026-08-20 — Yakuniy imtihon: tarixni tozalash

### Nima qilindi

Natijalar jadvalida eraser tugmasi har qatorda (jumladan «Topshirmagan»). Click → `ConfirmDialog`.

### Nima uchun

Eski UI da tugma doim bor edi; yangida faqat topshirganlarda chiqib, qolganlari bosilmas edi.

---

## 2026-08-20 — Qayta imtihon yo‘riqnomasi PDF

### Nima qilindi

«Imtihonga qayta qo‘yish yo‘riqnomasi» matn o‘rniga keng modal + `iframe` (`public/docs/qayta-imtihonga-qoyish-yoriqnomasi.pdf`). Sarlavhada «Boshqa sahifadan ko‘rish». `Modal`: `headerExtra`, `bodyClassName`.

### Nima uchun

Eski UI PDF drawer edi; yangida faqat matn chiqardi.

---

## 2026-08-20 — Tashkilot yakuniy imtihoni

### Nima qilindi

`/organization-final-exam`: sariq izoh, imtihon/guruh qidiruv, toifa filtri, yaratish/tahrirlash (sana+vaqt), holat yoqish/o‘chirish, guruh va natijalar linklari. Natijalar `/info-final-exam-results/:id` (mavjud sahifa): statistika kartalari, Z-A tartib, tarixni tozalash, qayta qo‘yish. API: `GET/POST/PUT v2 /organization-final-exam/*`.

### Nima uchun

Sahifa generic jadval edi; screenshotdagi yaratish, holat va natijalar oqimi yo‘q edi.

---

## 2026-08-20 — Takroriy imtihonlar

### Nima qilindi

`/info-exam-results`: sariq `Notification` izoh, jadval (imtihon nomi qidiruv + link, guruh, boshlanish/tugash Badge, holat filter). Show `/info-exam-results/:id`: F.I.SH, foiz, to‘g‘ri javoblar, savollar. API: `GET v1 /info-exam-results` (`page`, `show_count`, `word`, `status`, `token`), `GET v1 /info-exam-results-show` (`exam_id`, `token`). Status `4` — shartnoma ogohlantirishi.

### Nima uchun

Sahifa generic jadval edi; screenshotdagi izoh, rangli sanalar, holat filtri va natijalar show yo‘q edi.

---

## 2026-08-20 — OrganizationSelect

### Nima qilindi

Eski `OrganizationFilterC` (`GET v2 /organizations/list`, `limit=10`, `organization_search`) `OrganizationSelect` (`components/ui`): «Barchasi», INN `text-rose`, masofaviy qidiruv (`Select.onSearch`, debounce 1s). Amaliy davomat headerida SearchInput o‘rniga.

### Nima uchun

Screenshotdagi tashkilot autocomplete yangida oddiy matn qidiruv edi.

---

## 2026-08-20 — Amaliy davomat

### Nima qilindi

`/group-practical-attendance`: guruh/tashkilot qidiruv, holat (`edu_status` 0/1/2), guruhlangan jadval (Amaliy qatnashuv → Qatnashganlar soni + Jami o‘quvchilar), nazariy/amaliy kunlar (`Du…Yak`), sanalar Badge, superadmin tashkilot ustuni. Pagination: `page` + `show_count`. Show `/group-practical-attendance-student/:id`: FIO qidiruv, oy/yil bir qator, Boshlagan/Boshlamagan, kunlik `time`. API: `GET v2 /groups/practical-attendance`, `GET v2 /groups/show/:id/practical-attendances`.

### Nima uchun

Sahifa generic jadval edi; screenshotdagi guruhlangan header siljiydi, filter label/input ustma-ust, «Ma'lumot mavjud emas».

---

## 2026-08-20 — Avtodrom davomat

### Nima qilindi

`/autodrome-organization-group`: guruh/avtodrom qidiruv, tartiblash (`created_at`, `attended_students_count`), kameraga ulangan/o‘tgan, ta’lim sanalari, dars kunlari (Sha), holat, ko‘z. Pagination: `page` + `show_count` (eski `useGet` bilan bir xil). Show `/autodrome-organization-students/:id`: oy/yil, o‘quvchi qidiruv, kunlik Keldi/Ketdi, Tarixi modal. API: `GET v2 /autodrome-organization-groups/list`, `GET v2 /autodrome-student-attendances/index`.

### Nima uchun

Sahifa generic jadval edi; screenshotdagi «Avtodromdagi davomat» va guruh oylik davomati yo‘q edi.

---

## 2026-08-20 — Rasm yo‘q placeholder

### Nima qilindi

`SafeImage` (`components/ui`): URL yo‘q yoki ochilmasa `UserRound` + «Rasm yo‘q». O‘quvchi profili, imtihon rasmi, kameralar, guruh o‘quvchilari.

### Nima uchun

Buzilgan `<img>` brauzer ikonkasini va alt matnni (F.I.SH) ko‘rsatardi.

---

## 2026-08-20 — O‘quvchi yo‘qligi sababi

### Nima qilindi

`/reason-student-absence`: guruh filtri, familiya/ism/otasi ismi qidiruv (2-qator `FilterTH`), darslar soni, sababli, (NB), bugungacha. `+` bilan arizalar jadvali. API: `GET v2 /absence-reason/index-applications-by-student`.

### Nima uchun

Sahifa generic jadval edi; screenshotdagi ustunlar va ochiladigan qatorlar yo‘q edi.

---

## 2026-08-20 — Qatnashmaslik sabablari

### Nima qilindi

`/absence-reason-index` endi generic jadval emas: guruh filtri, **+ Qo‘shish**, jadval (viloyat, tuman, guruh, F.I.SH, sabab, asos fayli, sanadan/sanagacha, holat, Qaytarish), pagination. Qo‘shish: guruh → o‘quvchi → sanalar + PDF. API: `GET v2 /absence-reason/index-applications`, `POST v2 /absence-reason/store-application`, `POST v2 /absence-reason/rollback/:id`.

### Nima uchun

Eski `AbsenceReason/index` screenshotdagi sahifa yangida `DirectorResourcePage` edi.

---

## 2026-08-20 — Dars qoldirganlar: ro‘yxat + davomat

### Nima qilindi

`/reports-monitoring-by-student`: FIO/guruh qidiruv, qolgan darslar, FIO bosilsa `/reports-monitoring-by-student-show/:id`. Show: mavzu, sana (sariq), **EXPORT EXCEL**. API: `GET v2 /monitoring/students/report`, `GET v1 /report-monitoring-by-student-show`.

### Nima uchun

Sahifa generic jadval edi; screenshotdagi «Talabalar bo‘yicha davomat» ochilmasdi. Show sarlavha: bosilgan o‘quvchi familiyasi va ismi.

---

## 2026-08-20 — Shablon test hisoboti: jadval va show

### Nima qilindi

Ro‘yxat header `rowSpan` olib tashlandi (qidiruv № ustuniga chiqib ketardi). Show: `template.name` obyekt/raqam bo‘lsa `pickLocalized`, `.trim` chaqirilmaydi.

### Nima uchun

Header siljishi va `row.template?.name?.trim is not a function`.

---


## 2026-08-20 — Shablon test hisoboti

### Nima qilindi

`/template-view-statistic`: F.I.SH / guruh qidiruv, passport mask, «Test natijalari» (faol vaqt, shablonlar, o‘rtacha/jami to‘g‘ri) yoki «Ma’lumotlar yo‘q», ko‘zcha. FIO yoki ko‘z `/template-view-statistic-student/:id` — shablon nomi, to‘g‘ri/noto‘g‘ri, foiz. API: `GET v2 /student-reports/template-tests`, `GET v2 /student-reports/template-tests/:id`.

### Nima uchun

Eski `TemplateViewStatistics` + `TempleteViewStatisticsStudent` yangida qisqa jadval edi, drill-in yo‘q.

### Tahlil

- Ro‘yxat server pagination (`page`, `show_count`, `student_search`, `group_search`).
- Show: client pagination; sarlavha `state.fullName`.
- Sidebar: `NAV_NESTED_MATCH.templateViewStatistic` = `/template-view-statistic-student`.

### Keyingi

Show API javobida `template.name` kelishini tekshirish.

---

## 2026-08-20 — O‘zlashtirish: o‘quvchi mavzulari

### Nima qilindi

Guruh → o‘quvchilar ro‘yxatida FIO bosiladi. Yangi sahifa `/content-view-statistic/by-students/show/:id`: mavzu nomi, berilgan/o‘qilgan vaqt, ko‘rsatkich (%). API: `GET v2 /topic-action-statistic/students/:id`. Header `onBack`; bo‘sh holat `EmptyState`; berilgan vaqt ustuni sort.

### Nima uchun

Eski `ContentaViewByStudentShow` yangida yo‘q edi — screenshot dagi mavzular jadvali ochilmasdi.

### Tahlil

- Ko‘rsatkich: `reading_time / time_limit * 100` (1 kasr); limit yo‘q yoki 0 bo‘lsa `--`.
- Vaqt: `secondsToHms`; `topic_action_limit` / `student_topic_action` yo‘q bo‘lsa `--:--:--`.
- Route tartibi: `by-students/show/:id` `by-students/:id` dan oldin.

### Keyingi

Haqiqiy API javobida mavzu nomi `topic.name.uz` kelishini tekshirish.

---

## 2026-08-20 — Ta'lim narxlari: rasm, export, CRUD

### Nima qilindi

`/tuitionfees` generic jadval o‘rniga: rasm ustuni, **Qo‘shish**, **EXPORT (.XLS)**, qator **tahrirlash**. API: `GET /edu-type/prices/index`, `POST /edu-type/prices/store-or-update`.

### Nima uchun

Eski `TuitionFees.jsx` da shu amallar bor edi.

### Keyingi

Narx saqlashni haqiqiy API da tekshirish.

---

## 2026-08-20 — Sidebar: ichki sahifada menyu yonadi

### Nima qilindi

Sidebar `NavLink` o‘rniga `resolveActiveNavTo`: `to/` ostidagi pathlar avtomatik; boshqa prefixlar `NAV_NESTED_MATCH` (darsliklar, guruh, o‘quvchi, o‘qituvchi). Mos kelmasa oxirgi yongan item saqlanadi.

### Nima uchun

Darsliklar ichki sahifasida «Darsliklar» o‘chib qolardi. Xuddi shu guruh/o‘quvchi show da ham.

### Keyingi

Yangi nested URL `to` dan farq qilsa `NAV_NESTED_MATCH` ga qo‘shish.

---

## 2026-08-20 — Darsliklar nested oqim

### Nima qilindi

Direktor «Darsliklar» endi generic jadval emas: fan ro‘yxati (`/textbooks`) → ta'lim toifasi kartalari (`/textbooks_lessons/:id`) → mavzular (`/subjectclasses/:id`) → kontent (`/viewsubject/:id`). API: `GET /textbook`, `GET /textbook-show`, `GET /chapters-by-edutype-lesson`, `POST /content-show`. Header `onBack` + `useSmartBack`.

### Nima uchun

Eski `eavtotalim_front` TextBooks 4 sahifali; yangida qator bosilmas, screenshotlardagi kartalar/mavzu/kontent yo‘q edi.

### Tahlil

- Karta rangi `id` bo‘yicha barqaror (theme tokenlar).
- Mavzular soni `topics_count` bo‘lmasa `—` (eski UI 36 ni hardcode qilardi).
- Kontent tili Select (`uz/kiril/qq/ru/en`); HTML `.lesson-html`; media `PATH_PREFIX_FILE_HOST`.
- Bob/mavzu/kontent editor (superadmin) hozircha yo‘q.

### Keyingi

Toifa kartalarida `topics_count` kelishini API da tekshirish; kerak bo‘lsa tahrirlash oynalari.

---

## 2026-08-20 — Guruhdan o‘quvchi o‘chirish

### Nima qilindi

Guruh show «O‘quvchilar» tabi: checkbox tanlash, **TANLANDI: N**, qizil **O‘chirish (N)**. Modal: ogohlantirish, tanlanganlar ro‘yxati (X bilan yechish), ixtiyoriy fayl (10MB, PDF yo‘q). API: `POST v1 /remove-from-group` (`students[]` + `file`).

### Nima uchun

Eski `deleteStudentModal` yangida yo‘q edi.

### Keyingi

Chiqarilganlar tabida biriktirilgan fayl ko‘rinishini tekshirish.

---

## 2026-08-20 — Orqaga + elektron jurnal

### Nima qilindi

- `useSmartBack` + `NavigationHistoryTracker`: Orqaga doim kirgan sahifaga. Ro‘yxatga qotirib qo‘yilgan `navigate(routes.*)` olib tashlandi (guruh/avto/o‘quvchi/o‘qituvchi, murojaat, jarimalar, yo‘l belgilari, darslar, kontent statistikasi, muammo formasi).
- Elektron jurnal (eski `ElectronNotebook` / `Visitings`): Davomat/Baholash matritsasi, tahrir, izoh (oldingi → yangi), sababli qilish (PDF + ogohlantirish), kun bo‘yicha Face ID qayta olish, bugungi Face ID rasm/vaqt modal, pastki jami qatorlar.

### Nima uchun

Orqaga boshqa ro‘yxatga o‘tib ketardi. Jurnal tabi bo‘sh/yarimchiq ko‘rinardi.

### Tahlil

- Tarix `sessionStorage` da; tab `?tab=` `replace` — Orqaga guruh tabini emas, kirgan sahifani ochadi.
- Baholash katagi shared `Input` emas — jadval katagi uchun ixcham native input.

### Keyingi

Jurnalni guruhda ochib davomat belgilash va Face ID modalni tekshirish.

---

## 2026-08-20 — Guruh/avto: screenshot bo‘shliqlari

### Nima qilindi
Eski UI bilan solishtirilgan 7 ta joy to‘ldirildi.

- To‘liq ma’lumot modal: oxirgi o‘zgartirish + «Guruh o‘quvchilariga rollarni berish» (`POST /groups/ensure-student-role-for-group/:id`).
- Yakuniy imtihon (`/info-final-exam-results/:id`): 5 ta statistika, FIO sort, %, savollar, to‘g‘ri javob, vaqt, holat, qayta imtihon (`re-take-exam`, `correct <= 16`), EXPORT.
- Guvohnoma (`/final-marks/:id`): ogohlantirishlar, bayonnoma sana/raqam, chop etish, fan/amaliy natijalar (`store-marks`), soat kamligi, qarz, sertifikat tugmasi.
- Avtomobil qo‘shish / almashtirish: ogohlantirishlar, yil/MSPD/o‘qituvchi/toifa/holat, pagination, almashtirishda sabab.
- Avtomobil show (`/cars/show/:id`): guruhlar, rasmlar, ichki ma’lumot, MSPD qayta olish, to‘xtatish/faollashtirish, toifa, o‘qituvchi o‘chirish/almashtirish.
- Elektron jurnal: Davomat/Baholash, afsona, `DD.MM.YY` ustunlar, pastki jami qatorlar.
- O‘quvchilar tabi: EXPORT (.XLS).

### Nima uchun
Foydalanuvchi rasmlarda qolgan farqlarni ko‘rsatdi; yangi UI eski amallarni qisqartirgan edi.

### Tahlil
- Bayonnoma chop etish hozircha brauzer `print()` (backend PDF URL noma’lum).
- Avtomobil rasmlari API maydonlari (`photo`, `front_photo`, …) bo‘sh kelsa «Rasm kiritilmagan!» chiqadi.

### Keyingi
Jurnalni tahrirlash (sababli qilish), tirkamalar tabi, to‘lov kiritish — kerak bo‘lsa.

---

## 2026-08-20 — Guruh show: eski bilan bir xil amallar

### Nima qilindi
Eski `GroupShowAction` + `GroupTables` bilan solishtirib, yangi show sahifadagi bo‘shliqlar to‘ldirildi.

- Amal qatori: o‘quvchi biriktirish (`add-student-to-group`, YHXX tasdiqlanganda blok, `add-group-student-unlimited` / superadmin cheklovsiz), to‘lovlar (`/groupdetails/:id`), Certificates (`/final-marks/:id`), yakuniy imtihon natijalari (`/info-final-exam-results/:id`).
- Tablar: **Elektron jurnal** (davomat belgilar + afsona), dars jadvali sarlavhasi + sanadan sanaga ko‘chirish + EXPORT + YHXX tasdiqlanganda yaratish, avtomobillar (qo‘shish / almashtirish / o‘chirish / EXPORT), o‘qituvchilar (biriktirish / parol / o‘chirish / EXPORT), chiqarilganlar sarlavhasi + jami soni.
- Yangi API/hooklar: ungrouped students, cars attach/replace/remove, teacher merge/unmerge, timetable store/move, mark-monitoring, payments, final-marks, generate-certificate, exam results.

### Nima uchun
Rasmdagi tugma/tab/amallar yangida yo‘q edi; foydalanuvchi ro‘yxat yozmasdan eski bilan bir xil qilishni so‘radi.

### Tahlil
- To‘lov kiritish (buxgalter `payment-store`) va jurnalni tahrirlash (sababli qilish) hali yo‘q — ko‘rish + sertifikat yaratish yetarli.
- Tirkamalar tabi (`edu_type` 6/7/9) qo‘shilmadi.

### Keyingi
Jurnal tahriri, tirkamalar tabi, to‘lov kiritish — kerak bo‘lsa.

---

## 2026-08-20 — Guruh show: eski sahifa funksiyalari

### Nima qilindi
- `GroupShowPage` to‘liq qayta yozildi (eski `pages/Groups/GroupShowAction.js` + `components/GroupTables` asosida).
- Header: o‘rtacha davomat + oxirgi darsga kelmaganlar statistikasi, «Davomatni yangilash», **YHXX ruxsati**
  (`check_gai`: 0 → «Ko‘rikka yuborish», 1 → tasdiqlangan, 2 → rad etilgan, aks holda kutilmoqda).
  Yuborish 8–24 o‘quvchi shartida faollashadi.
- Amal tugmalari: «Guruh haqida to‘liq ma’lumot» (timeline modal), tahrirlash, ta’lim narxini o‘zgartirish,
  «Davomatni to‘g‘irlash» (`fix-attendance-group`), «Sertifikat tayyorlash» (`prepare-certificate-group`), o‘chirish.
- 6 ta tab (`?tab=` URL da): o‘quvchilar, dars jadvali, avtomobillar, o‘qituvchilar, kelgan o‘quvchilar,
  guruhdan chiqarilgan o‘quvchilar — `src/pages/groups/show/*`.
- O‘quvchilar jadvali eski ustunlar bilan: rasm, F.I.SH, shaxsiy (JSHIR/tug‘ilgan sana), aloqa, oxirgi kirish,
  bugun kelgan vaqt, davomat %, avtodrom soati (seans×2), kerakli avtodrom soati, amallar (parol/ko‘rish/tahrirlash).
  «Login va parollarni ko‘rish» rejimi `/groups/:id/student-credentials` dan.
- Yangi API: `timetable`, `cars`, `teachers`, `removed-students`, `student-credentials`,
  `monitoring-camera-attendance`, `groups-gai/send`, `fix-attendance`, `prepare-certificate`,
  `organization-final-exam/by-group`.

### Nima uchun
Yangi show sahifada faqat DetailList + FIO ro‘yxati bor edi; eski saytda tablar, YHXX holati, davomat va login/parol amallari bor.

### Tahlil
- Ustun ko‘rinishi (`Ustunlar`) har tab uchun alohida `storageKey` bilan saqlanadi.
- `PageMain fill` — tab jadvali qolgan balandlikni to‘ldiradi.

### Keyingi
- Elektron jurnal tabi, «Guruhga o‘quvchilarni biriktirish», to‘lovlar tarixi (`/groupdetails/:id`),
  Certificates (`/final-marks/:id`) va yakuniy imtihon natijalari — bu sahifalar yangi appda hali yo‘q
  (`fetchFinalExamByGroup` tayyor).

---

## 2026-08-19 — Ro‘yxat amallari: eski kabi (show + ruxsat)

### Nima qilindi
- Guruhlar jadvali: Amallar = **ko‘rish**; tahrirlash yo‘q (eski `GroupCrudIndex`).
- O‘chirish faqat `delete-group` ruxsati bilan; o‘quvchisi bor guruhda o‘chirib bo‘lmaydi.
- Show sahifa o‘chirish ham shu ruxsat + bo‘sh guruh.
- O‘quvchilar: tahrirlash `update-student`, o‘chirish `delete-student`.

### Nima uchun
Eski UI da direktor ro‘yxatida faqat show chiqardi; yangida edit/delete doim turardi.

### Keyingi
—

---

## 2026-08-19 — Jadval layout: canvas fill + FilterTH

### Nima qilindi
- `AppShell` canvas `overflow-hidden`: `Header` yuqorida, `main` pastki qismda.
- `PageMain fill` — ro‘yxat jadvallari qolgan balandlikni to‘ldiradi (sticky thead, ichki scroll).
- Ustun filtrlari 2 qator: `TH` + `FilterTH` (guruhlar, o‘quvchilar, o‘qituvchilar, mashinalar, murojaatlar, template stats, My Gov).
- `Table` wrapper `flex-1 min-h-0 overflow-auto`.

### Nima uchun
Guruhlar jadvali yaxshi chiqdi; boshqa jadvallar ham shu joylashuvda bo‘lishi va header ostidagi bo‘sh joyni to‘ldirishi kerak edi.

### Keyingi
—

---

## 2026-08-19 — Guruhlar: filtrlar alohida qatorga

### Nima qilindi
- Jadval sarlavhasi ikki qator: avval ustun nomlari, pastda filtrlar (qidiruv, sana sort, vaqt, kun checkbox, dars jadvali).
- `TH` ga `registerColumn={false}` — filtr qatori «Ustunlar» nomlarini buzmaydi.
- Jadval `min-w-350`, nazariy kunlar `min-w-56` + `flex-nowrap`.

### Nima uchun
Filtrlar sarlavha bilan bir katakta siqilgan; pastda bo‘sh joy bor edi. Kunlar (`Du Se Cho Pa`) o‘qilmasdi.

### Keyingi
—

---

## 2026-08-19 — Guruhlar header: Tartiblash + Yangilash yonma-yon

Tartiblash va Yangilash `inline-flex gap-2` — oradagi bo‘shliq yo‘qoldi.

---

## 2026-08-19 — Guruhlar: vaqt tozalash + Tartiblash

### Nima qilindi
- Dars vaqti: `SearchInput type=time` olib tashlandi; range + **X** tozalash (eski TimePicker allowClear).
- Tartiblash: `Select` `clearable`, kengroq menyu, to‘liq matn; bo‘sh option olib tashlandi.

### Nima uchun
Native time input qiymatni o‘chirmaydi; sort optionlari tor dropdownda kesilgan, tozalash yo‘q edi.

### Keyingi
—

---

## 2026-08-19 — Guruhlar ro‘yxati: eski GroupCrudIndex filtrlari

### Nima qilindi

`GroupsPage` eski `GroupCrudIndex` bilan moslashtirildi:

- Filtrlar jadval ustunida: nom, sana sort, vaqt oralig‘i, Du–Sh checkbox, dars jadvali
- Tablar: Barcha / Faol / Tamomlagan / Yangi + «ta»
- Davomat halqasi + `POST /groups/update-group-average-attendance/:id`
- Sariq vaqt, binafsha kun, yashil/qizil sanalar
- Bo‘sh natijada ham filtrli jadval qoladi

### Nima uchun

Filtrlar alohida qatorda edi; eski UI da har ustun ostida.

### Keyingi

Dars jadvali «Mavjud» bosilganda notebook sahifasi (eski `/group/:id/edit-notebook`) hali yo‘q.

---

## 2026-08-19 — O‘quvchi show: to‘liq kenglik tartib

### Nima qilindi

Ikki tor ustun o‘rniga sahifa qatlamli:

1. Profil (FIO, holat, avtodrom/kamera badge) — to‘liq kenglik
2. Pasport | Guruh | Maktab — 3 teng karta
3. O‘qituvchilar | Avtomobillar — yonma-yon, «Ustunlar» yo‘q
4. Kamerlar, keyin tablar — to‘liq kenglik

`DetailList` 2 ustunli, label kichik / qiymat aniqroq.

### Nima uchun

Chapda guruh + jadvallar siqilgan, o‘ngda bo‘sh «Ma'lumot topilmadi» katta maydon edi.

### Keyingi

Davomat bo‘sh bo‘lsa ham tablar to‘liq kenglikda — bo‘sh holat kichikroq.

---

## 2026-08-19 — Turniket rasm modal: eski ImgCropUploader

### Nima qilindi

O‘quvchi show dagi «Rasmni turniket uchun moslash» / rasm yuklash oynasi eski `ImgCropUploader` ga yaqinlashtirildi:

- `react-easy-crop` (aspect `370/472`, 3×3 grid)
- Sariq yo‘riqnoma (6 qoida + 2×2 misol siluetlar)
- Gradient «Rasmni turniket uchun moslash» (`POST /v2/api/image-gate/process`)
- Qizil Bekor qilish + floppy Saqlash
- Rad etish banneri (`rejected` + reason kodlari)
- `ImageCropModal` — asosiy rasm, imtihon rasmi va `adapt-current` uchun umumiy

### Nima uchun

Yangi modal faqat statik preview + Bekor/Saqlash edi; kesish, qoidalar va moslash tugmasi yo‘q edi.

### Keyingi

Eski `acceptable.png` (4 namuna rasm) topilmasa, siluet SVG qoldi — kerak bo‘lsa asl PNG ni qo‘yish.

---

## 2026-08-19 — O‘quvchi show: barcha tablar eski StudentTable bilan

### Nima qilindi

Eski `StudentTable` dagi 7 tab qayta tekshirildi:

- **Avtomaktab** — davomat jadvali (bo‘shda ham ustunlar), davomatni yangilash (`POST /student-personal-attendance/update/:id`), qatnashmaganlik sabablari, to‘lovlar (9/10/11 rollarda yashirin).
- **Avtodrom** — tashrif/soat kartalari + hint.
- **Imtihon markazi** — sana oralig‘i, yangilash, statistika, jadval.
- **Imtihon** — natijalar jadvali.
- **Hujjatlar** — Ariza / shartnoma chop / shaxsiy varaqa / yo‘llanma / haydovchilik varaqasi / amaliy varaqa + shartnoma matni.
- **Qo‘shimcha darslar** — davomatni qayta olish, qo‘shish (`edu_status=2`), o‘chirish, davomat toggle.
- **Amaliy davomat (QR)** — eski ustunlar.

### Nima uchun

Faqat QR tab tuzatilgan edi; qolgan tablar eski UI dan orqada qolgan.

### Keyingi

Chop etish shablonlarini haqiqiy hujjat bilan solishtirish; qo‘shimcha dars qo‘shishni `edu_status=2` o‘quvchida tekshirish.

---

## 2026-08-19 — O‘quvchi show: kamera kartalari + amaliy davomat

### Nima qilindi

- `StudentCamerasPanel` eski `StudentCamerasCard` / `StudentCameraCard` / `StudentAutodromeCard` bilan mos: nested `pending`/`aos` holat, enroll/resend, rasm almashtirish, Bionet tekshiruv, avtodrom bog‘lanmagan empty, guruh sync kutilmoqda.
- Muammo + **Tarix**: `ReportProblemButton` (`create-problem-report`), qizil outline + Tarix.
- **Amaliy davomat (QR)** jadval: №, Rasm, Sana, Vaqt, Yuz natijasi, Holati, Tasdiqladi, Tasdiqlangan vaqt; bo‘sh natijada ham ustunlar qoladi.

### Nima uchun

API `{ pending, organization_has_camera, … }` nested; eski UI shu maydonlardan rasm va holat olardi. Tarjima kalitlari yo‘q edi.

### Keyingi

Kameraga yuborish / rasm almashtirish / Tarixni `resend-student-monitoring-camera-pending-student` va `create-problem-report` ruxsati bilan tekshirish.

---

## 2026-08-19 — O‘quvchilar: avtomatik kirish + filterlar

### Nima qilindi

- Ro‘yxat amallariga **kirish hisoblari** (qulf) + modalda **Avtomatik kirish** (eski `ShowPasswordRN` / `SignIn`).
- Filterlar eski `AllStudents` bilan mos: `grouped`/`edu_status` raqam, Holat tanlovi tabni override qiladi, `edu_type_id` va `mspd_photo_getting` son.
- Bo‘sh natijada jadval (filterlar) yo‘qolmasdi — `EmptyState` qator ichida.

### Nima uchun

Faol tabda Holat e’tiborsiz qolgan; filter 0 ta qator qaytarsa inputlar unmount bo‘lgan. Avtomatik kirish eski UI da bor edi.

### Keyingi

Familiya/toifa/holat filter va avtomatik kirishni `show-user-password` ruxsati bilan tekshirish.

---

## 2026-08-19 — Sidebar yopiq: Settings menyu kesilmasin

### Nima qilindi

`SettingsMenu` dropdown `createPortal` orqali `document.body` ga chiqadi. Sidebar yopiq (`lg:w-[72px]`) bo‘lsa menyu o‘ngga ochiladi, `min-width: 208px` — Profil / Parol / Chiqish ikonka + matn to‘liq.

### Nima uchun

`aside` da `overflow-hidden` bor; yopiq holatda menyu `w-full` qilib sidebar ichida qolgan — matn «Pro / Par / Chi» ga kesilgan.

### Keyingi

Yopiq sidebar da Settings ni bosib menyu to‘liq chiqishini tekshirish.

---

## 2026-08-18 — Global mixed-content: same-origin proxy

### Nima qilindi

`get-captcha` globalda `(blocked:mixed-content)` — frontend HTTPS, API `http://back.intalim.uz`. Lokal HTTP da blok yo‘q. `https://back.intalim.uz` sertifikati 2026-07-21 da tugagan (ZeroSSL), shuning uchun URL ni `https://` qilish ham ishlamaydi. `newdesign.intalim.uz` CORS allowlistda yo‘q.

`env.ts`: HTTPS sahifada faqat `http://` API → `/api` va `/v2/api`. `public/.htaccess`: Apache `mod_proxy` orqali `http://back.intalim.uz`. Captcha rasm base64 — API ishlasa rasm ham chiqadi.

### Nima uchun

Brauzer HTTPS dan HTTP fetch ni bloklaydi. Backend sertifikatini front dan yangilab bo‘lmaydi. Same-origin proxy mixed-content va CORS ni chetlab o‘tadi.

### Keyingi

`npm run build` va deploy (`dist/.htaccess` ham chiqsin). Apache da `mod_proxy` + `mod_proxy_http` yoqilgan bo‘lsin. Keyinroq `back.intalim.uz` SSL ni yangilash.

---


## 2026-08-18 — Base URL faqat appvariables.js (rewrite yo‘q)

### Nima qilindi

`env.ts` dagi same-origin rewrite olib tashlandi — so‘rov `newdesign.intalim.uz/v2/api` ga ketib Apache HTML (200) qaytargan. Endi `PATH_PREFIX*` o‘zgarmasdan `appvariables.js` dan. HTTPS uchun `https://back.intalim.uz`.

### Nima uchun

Frontend Apache `/v2/api` ni proxy qilmaydi. Backend `back.intalim.uz`.

### Keyingi

`npm run build` va deploy.

---


## 2026-08-18 — Mixed-content: HTTPS + http API

### Nima qilindi

`get-captcha` `blocked:mixed-content` — frontend HTTPS, API `http://back.intalim.uz`. Eski front localhost HTTP da shu URL ni ishlatadi, shuning uchun u yerda blok yo‘q. `env.ts`: HTTPS da `/api` va `/v2/api` same-origin (nginx avval 200 bergan), fayllar `https://`. `appvariables.js` o‘zgarmagan.

### Nima uchun

Brauzer HTTPS sahifadan HTTP fetch ni bloklaydi. `https://back.intalim.uz` avval CORS bergan.

### Keyingi

Qayta `npm run build` va deploy.

---


## 2026-08-18 — URL faqat appvariables.js

### Nima qilindi

Eski `AppVariables.js` → `src/utils/appvariables.js`. `env.ts` shu fayldan oladi. `VITE_PATH_PREFIX*` va `.env.production` olib tashlandi. `appvariables.js` gitignore.

Prod: yuqori blokni ochish, dev blokni comment.

### Nima uchun

Bitta joy, gitga URL ketmasin.

### Keyingi

—

---

## 2026-08-18 — API URL eski AppVariables kabi

### Nima qilindi

Eski `AppVariables.js` tahlil qilindi:

- **dev:** `http://back.intalim.uz` (`npm run dev`)
- **prod:** `http://back.eavtotalim.uz` (`npm run build`, `.env.production`)

Oldin prod ga `back.intalim.uz` qo‘yilgani CORS bergan. Build endi eavtotalim backend.

### Nima uchun

Eski front comment bilan almashtirardi; yangida Vite mode.

### Keyingi

Qayta `npm run build` va deploy.

---

## 2026-08-18 — Prod API again same-origin

### Nima qilindi

Absolute `https://back.intalim.uz` CORS tufayli bloklandi. API yana relative `/api` va `/v2/api`. Server nginx shu pathlarni backend ga uzatadi. Captcha avval `newdesign.intalim.uz/v2/api` da 200 edi.

### Nima uchun

Boshqa originga so‘rov brauzerda CORS/provisional headers bilan yiqiladi.

### Keyingi

Qayta `npm run build` va deploy.

---

## 2026-08-18 — Prod API base URL

### Nima qilindi

Buildda `/v2/api` relative qolgani uchun so‘rovlar `newdesign.intalim.uz` ga ketardi.

- `.env.production`: `https://back.intalim.uz/api` va `/v2/api`
- `env.ts`: prod da relative path avtomatik backend origin ga o‘tadi; `http://` → `https://` (mixed content)

Lokal `npm run dev` o‘zgarmaydi (Vite proxy).

### Nima uchun

Deploy qilingan frontend o‘z hostiga API so‘rov yuborardi.

### Keyingi

Qayta `npm run build` qilib serverga qo‘yish.

---

## 2026-08-18 — TypeScript build xatolari

### Nima qilindi

`tsc -b` 29 ta xato tuzatildi (runtime mantiq o‘zgarmadi):

- `PracticalAttendanceItem` / `AutodromeCameraItem` type to‘qnashuvi (`types/index.ts`)
- Header `description` uchun `null` → `undefined`
- Union maydonlar (`edu_type_price`, `name`, `confirmed_by`)
- Ishlatilmagan importlar (`i18n`, `ListPageSkeleton`, `useState`…)

### Nima uchun

Build TypeScript xatolari tufayli yiqilardi.

### Keyingi

—

---

## 2026-08-18 — Direktor MSPD qidiruv 1 qator

### Nima qilindi

`DirectorEditDataPage` da pasport seriya, raqam, tug‘ilgan sana, Qidirish va Saqlash o‘ng tomonda bitta qator: kengroq maydonlar, label bitta qatorda.

### Nima uchun

Tor `w-24` labelni ikki qator qilardi, `flex-1` sana maydonini cho‘zib dizaynni buzardi.

### Keyingi

—

---

## 2026-08-18 — Logout dan keyin login/parol qayta to‘ladi

### Nima qilindi

Oxirgi kiritilgan login va parol `sessionStorage` ga yoziladi (`src/lib/loginDraft.ts`). Logout auth tokenlarni o‘chiradi, draft qoladi — login sahifasi qayta ochilganda maydonlar to‘ladi.

### Nima uchun

Chiqishdan keyin foydalanuvchi login/parolni qayta yozmasligi kerak.

### Keyingi

—

---

## 2026-08-18 — Login xatosida login/parol saqlanadi

### Nima qilindi

Noto‘g‘ri login/parolda forma qayta mount bo‘lib maydonlar tozalanmasin:

- `LoginPage` endi formani `key` bilan qayta yaratmaydi
- `LoginForm` mountida login/parolni tozalash olib tashlandi
- Faqat captcha yangilanadi (`captchaNonce`)

### Nima uchun

Xato urinishdan keyin foydalanuvchi login va parolni qayta yozmasligi kerak.

### Keyingi

—

---

## 2026-08-14 — O‘quvchi show header: eski amallar

### Nima qilindi

Eski `StudentPhoto` bilan solishtirib, show headerga yetishmagan amallar qo‘shildi (`StudentProfileHeader`):

- Asosiy rasm ustida qalam → `POST v2 /student/manual-change-image/:id` (`manual-change-image-student`)
- Imtihon rasmi qalam → `POST v2 /student/manual-change-exam-image/:id` (`manual-change-exam-image-student`)
- **Rasmni yangilash** (MSPD) → `POST v2 /students/sync-image/:id` (`sync-image-student`)
- **Rasmni turniket uchun moslash** → `POST v2 /students/:id/image-gate/adapt-current`, so‘ng asosiy rasm sifatida saqlash (`use-image-gate`)
- **Kirish hisoblari** → `POST v1 /password-show`, yangilash `POST v2 /users/regenerate-credentials` (`show-user-password`)
- Telefon / manzil / tibbiy ma’lumotnoma qator tahriri → `POST v2 /students/update-additional-info/:id` (`update-student`)
- FIO yonida yangilash; **Tahrirlash** (`group_type.id !== 3`)

### Nima uchun

Yangi headerda faqat o‘qish va bitta «Tahrirlash» bor edi; eski sahifadagi asosiy amallar yo‘q edi.

### Keyingi

- Hujjatlarni chop etish
- Kamera enroll/replace
- Extra lessons CRUD

---

## 2026-08-14 — O‘quvchi show: eski sahifadagi barcha ma’lumotlar

### Nima qilindi

Eski `StudentInfo` / `StudentCard` / `StudentTable` bilan solishtirib, yangi showga chiqmagan ma’lumotlar qo‘shildi:

- Maktab ma’lumotlari (manzil, raqam, bitirgan yil, shahodatnoma) + tahrirlash (`POST /students/update-school-info/:id`)
- Pasport/akt (document_type_id=2)
- Superadmin: yaratilgan / o‘zgartirilgan
- To‘lovlar: qarz
- Avtodrom: tashrif/soat statistikasi, sana + kirish vaqti
- Imtihon markazi: jami/o‘tgan/o‘tmagan/o‘rtacha ball, toifa
- Qo‘shimcha darslar: GET `/students/:id/class-dates`
- Amaliy davomat: rasm, vaqt, yuz natijasi, holat, tasdiqlovchi
- Hujjatlar: tashkilot, guruh, muddat, FIO, summa

Chop etish, kamera enroll, kirish hisoblari, rasmni turniketga moslash — hali yo‘q (eski amallar).

### Nima uchun

Yangi showda eski sahifada ko‘rinadigan qatorlar yetishmasdi.

### Keyingi

- Hujjatlarni chop etish
- Kamera enroll/replace
- Kirish hisoblari

---

## 2026-08-14 — Edit bekor qilish → o‘quvchilar ro‘yxati

### Nima qilindi

O‘quvchi tahrirlashdagi «Bekor qilish» `/students` (index) ga qaytadi. Saqlashdan keyin show o‘zgarishsiz.

### Nima uchun

Eski EditStudent cancel `/student` indexga borardi; yangida show ochilardi.

### Keyingi

- O‘quvchi qo‘shish formasi

---

## 2026-08-14 — O‘quvchi edit: boshlang‘ich to‘lov tugmasi

### Nima qilindi

Ta’lim bo‘limida `To'lov` tugmasi qo‘shildi (hamyon ikonkasi). Bosilsa to‘lov turi, summa va bekor qilish ochiladi. Saqlashda `pay_type_id` + `amount` FormData ga qo‘shiladi (eski `studentAddValues` kabi). Moderatorda ko‘rinmaydi.

### Nima uchun

Eski EditStudent/StageFour dagi to‘lov tugmasi yo‘q edi.

### Keyingi

- O‘quvchi qo‘shish formasi

---

## 2026-08-14 — Avto-to‘ldirish: ikki tomon, keng input

### Nima qilindi

Avtomatik to‘ldirish qatori: chapda sarlavha, o‘ngda seriya/raqam/sana to‘liq kenglikda cho‘ziladi; Qidirish o‘ngda.

### Nima uchun

Maydonlar chapga siqilib tor qolardi.

### Keyingi

- O‘quvchi qo‘shish formasi

---

## 2026-08-14 — O‘quvchi edit: to‘liq kenglik, rasm tartibi

### Nima qilindi

`StudentForm` markazlangan `max-w-4xl` kartalardan qaytarildi. Bitta to‘liq kenglikdagi `Panel`: avto-to‘ldirish bir qatorda (seriya, raqam, sana, Qidirish); shaxsiy — rasm chapda, 4 ustun; passport — 5 ustun; ta’lim — til, keng toifa, tibbiy, boshlang‘ich to‘lov; Bekor/Saqlash o‘ng pastda.

### Nima uchun

Forma tor markazda turardi; kerak bo‘lgani — eski sahifadagi kabi to‘liq kenglik va tartibli panjara.

### Keyingi

- O‘quvchi qo‘shish formasi
- Kamera orqali rasm / to‘lov tugmasi (eski StageFour)

---

## 2026-08-14 — O‘quvchi show/edit eski layout

### Nima qilindi

Show (`/student/:id`) va edit (`/student/edit/:id`) eski `StudentInfo` / `EditStudent` bo‘yicha qayta yig‘ildi.

**Show:** ikki ustun — chapda rasm/FIO/holat, pasport, guruh, o‘qituvchilar, mashinalar; o‘ngda avtomaktab/avtodrom kamera holati va tablar (Avtomaktab, Avtodrom, Imtihon markazi, Imtihon, Hujjatlar, Qo‘shimcha darslar, Amaliy davomat).

API: GET `/students/:id`, `/students/:id/group-details`, kamera status, davomat log, to‘lovlar, imtihon natijalari, shartnoma, exam-center, practical-attendances, absence-reason-applications.

**Edit:** MSPD avto-to‘ldirish, shaxsiy (rasm 3x4), pasport (fayl, viloyat/tuman), ta’lim. POST v2 `/students/:id` FormData (`image`, `document_copy`, `constant_region_id`, `constant_area_id`).

### Nima uchun

Yangi show/edit DetailList + yassi forma edi; eskida barcha maydonlar va ikki ustunli dashboard bor edi.

### Keyingi

- O‘quvchi qo‘shish formasi
- Kamera enroll/replace va rasmni turniketga moslash amallari
- Hujjatlar chop etish / qo‘shimcha darslar to‘liq UI

---

## 2026-08-14 — O‘quvchi show/edit + tablarda son yo‘q

### Nima qilindi

- Tab yorliqlardan sonlar olib tashlandi
- Ro‘yxatda familiya/ism/sharif bosilsa `/student/:id` (eski Link kabi)
- Ko‘rish: GET `/students/:id` — pasport, holat, rasm, guruh
- Tahrirlash: POST `/students/:id` + MSPD qidiruv; saqlagach show sahifaga qaytadi
- Ko‘z / qalam tugmalari ham show va editga olib boradi

### Nima uchun

«Counlar kerak emas» va eski saytdagi o‘quvchi sahifasiga o‘tish yo‘q edi.

### Keyingi

- O‘quvchi qo‘shish formasi
- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — Direktor o‘quvchilar sahifasi

### Nima qilindi

Eski `Students/Students.jsx` + `AllStudents.jsx` UI (`/students`):

- Tablar + sonlar: GET v2 `/students/get-student-counts` (`all`, `studying`, `finished`, `with_certificate`, `without_certificate`, `new`)
- Asosiy ro‘yxat: GET v2 `/students` — familiya/ism/sharif/JSHIR (`SearchInput` debounce, LIKE `%value%`), toifa, MSPD, holat `Select`, sort
- Guvohnoma olganlar: GET `/student-certificates/index`
- Guvohnoma olmaganlar: GET `/student-certificates/students-without-certificates`
- O‘chirish: POST v1 `/student-delete` + `ConfirmDialog` (faqat `grouped=0`)
- Ko‘rish: GET `/students/:id` (`/student/:id`)
- Qo‘shish/tahrirlash formasi hali placeholder

### Nima uchun

Sahifa mock ro‘yxat edi; direktor o‘quvchilarni filtrlash va ko‘ra olmasdi.

### Keyingi

- O‘quvchi qo‘shish/tahrirlash (MSPD) formasi
- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — Direktor murojaatlari sahifasi

### Nima qilindi

Eski `Directors/Appeals` UI (`/director/appeals`):

- Jadval: Familiya/Ism/Sharif (`SearchInput` debounce), tur/holat `Select`, izoh, sanalar, amallar
- **Qo'shish** — `CreateAppealModal` (`target=system`)
- Batafsil: PUT `/appeals/:id/status` (jarayonda / hal / rad / javob)
- API: GET `/appeals/index` + `student.*` LIKE filterlar

### Nima uchun

Direktor menyusida generic jadval edi; filtrli ro‘yxat va holat yangilash yo‘q edi.

### Keyingi

- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — SearchInput doim debounce

### Nima qilindi

Debounce `SearchInput` ichiga ko‘chdi (default 1s). Yangi qidiruv ham avtomatik. Sahifa-level `useDebouncedValue` olib tashlandi. Sidebar/darslar: `debounceMs={0}`.

### Nima uchun

«Doim searchlar shunday ishlasin» — sahifada unutilmasin.

### Keyingi

- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — Qidiruv debounce 1s

### Nima qilindi

`SEARCH_DEBOUNCE_MS` 500 → **1000**. Yozish to‘xtagach 1 soniya o‘tib API.

### Nima uchun

500ms qisqa edi — tez yozganda ham oraliq so‘rovlar ketardi.

### Keyingi

- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — Qidiruv debounce 500ms

### Nima qilindi

`useDeferredValue` o‘rniga `useDebouncedValue` (500ms): My Gov, guruhlar, mashinalar, o‘qituvchilar, aktiv maktablar, director list, statistika, all-tests.

Qidiruv yozilganda input darhol yangilanadi; API faqat yozish to‘xtagach.

### Nima uchun

Har harfda `index-applications` kabi so‘rovlar ketardi — sayt sekinlashardi.

### Keyingi

- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — My Gov: input/select/date bir xil o‘lcham

### Nima qilindi

- Qidiruvlar headerdan chiqarildi: 2 ustunli grid, teng kenglik (`SearchInput`).
- Forma `Field`: `h-11` + `w-full min-w-0`. Label’li `Select` Input/DateInput bilan bir xil.
- Simulyator grid: `*:min-w-0`; vaqt maydonlari yangi qatorda 4 ta teng katak; kunlar `Field` ichida.

### Nima uchun

Select `h-9`/`inline-flex`, Input esa katta padding — gridda turli kenglik/balandlik. Qidiruv `w-full` + `w-52` (merge yo‘q) placeholder bo‘yicha har xil kenglik berardi.

### Keyingi

- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — Xabarnoma yuborish: sahifa qotib qolishi

### Nima qilindi

`SendStudentsPanel` da `useEffect` `rows` ga bog‘langan edi. `studentsQuery.data?.data ?? []` loading/bo‘sh holatda har renderda **yangi `[]`** berardi → `setSelected([])` → cheksiz re-render → sidebar va boshqa sahifalar bosilmasdi.

Tanlovni tozalash endi `page` va `studentsQuery.data?.data` (barqaror referens) bo‘yicha; `setSelected` bo‘sh bo‘lsa oldingi state ni qaytaradi.

### Nima uchun

«Xabarnoma yuborish» tabiga kirgach UI thread to‘lib, navigatsiya ishlamay qolardi.

### Keyingi

- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — My Gov arizalarim + simulyator

### Nima qilindi

Eski `MyGovApplication` sahifasi (`/my-gov-application`) generic jadval o‘rniga to‘liq UI:

- Ro‘yxat: ariza raqami / guruh qidiruvi, nusxa, ko‘rish (tarix modal)
- Superadmin: javobni qayta jo‘natish
- Pastki **My gov ariza simulatori** — POST v2 `/mygov/simulate/application` (saqlanmaydi)
- API: GET `/director-uztelecom-aes/index-applications`, GET `show-application/:id`

### Nima uchun

Yangi saytda faqat generic list bor edi; qidiruv, batafsil va simulyator yo‘q edi.

### Keyingi

- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — Xabarnomalar yuborish sahifasi

### Nima qilindi

Eski `NotificationService` 3 ta tab bilan yangi saytga qo‘yildi (`/notifications-service`):

- **Yuborilgan xabarnomalar** — GET v2 `/message-schedule`; ko‘rish: GET `/message-schedule/:id`
- **Shablonlar** — GET/POST/PUT/DELETE v2 `/message-schedule/templates`; kalit so‘zlar (`${first_name}` …); o‘chirish `ConfirmDialog`
- **Yuborish** — guruh / faol qarzdorlar / tamomlagan qarzdorlar / tug‘ilgan kun; POST `/message-schedule` (`students`, `name`, `message_schedule_template_id`)

Shared: `Checkbox` (qator tanlash), `Textarea` `forwardRef` (kalit so‘z kursoriga).

### Nima uchun

Menyuda band bor edi, lekin faqat generic jadval chiqardi.

### Keyingi

- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — Muammoli vaziyat kiritish / tahrirlash

### Nima qilindi

Eski `CreateSituation` / `UpdateSituation` formasi yangi saytga qo‘yildi:

- List: `/problem-situations` — holat filter, qo‘shish, tahrir, o‘chirish (`ConfirmDialog`)
- Create: `/problem-situations/create` — ta’lim toifasi, UZ/RU/EN accordion, rasm/video yuklash
- Edit: `/problem-situations/:id`
- API v2: GET/POST `/problematic-situations/teacher`, GET statuses, GET/POST/DELETE `/:id` (FormData)
- Shared: `Textarea` (`components/ui`)

### Nima uchun

Yangi saytda faqat generic jadval bor edi; eski UI dagi kiritish formasi yo‘q edi.

### Keyingi

- Superadmin uchun status o‘zgartirish (eski `ChangeStatusModal`)
- Qolgan DirectorResourcePage CRUD

---

## 2026-08-14 — Jadval «Ustunlar» filtri (hamma Table)

### Nima qilindi

`Table` ichiga eski `ColumnVisibility` UX qo‘yildi: **Ustunlar** tugma (sozlama + tozalash), checkbox ro‘yxat, «Barchasini ko‘rsatish / yashirish». Ko‘rinish `localStorage` da (`column_visibility:` + sahifa + sarlavhalar). Har `<Table>` da avtomatik — sahifalarni o‘zgartirish shart emas.

### Nima uchun

Ustunlarni yashirish faqat eski ba’zi jadvallarda bor edi; yangida umuman yo‘q edi.

### Keyingi

- Kerak bo‘lsa `storageKey` bilan bir sahifadagi bir xil jadvallarni ajratish

---

## 2026-08-14 — Direktor CRUD: show / create / edit + o‘chirish tasdig‘i

### Nima qilindi

Eski direktor UI dagi CRUD tugmalar yangi saytga qaytarildi; o‘chirish doim `ConfirmDialog` («Haqiqatdan tasdiqlaysizmi?»):

- **O‘qituvchilar:** list Show/Edit/Add; sahifalar `/teacher/:id`, `/teacher_create`, `/teacher/edit/:id` (MSPD qidiruv + asosiy maydonlar). API: GET/POST v2 `/teachers`, GET `/teachers/edit/:id`, POST v1 `/teacher-create`
- **Avtomobillar:** Show/Edit/Add/Delete; `/cars/show/:id`, `/cars/add`, `/cars/edit/:id` (eski `/cars/updata/:id` alias). Create: POST v1 `/cars`; update: POST v1 `/cars/update/:id`
- **Guruhlar:** Show/Edit/Delete; `/group/:id`, `/group/edit/:id`. Create modal saqlanadi. PUT v2 `/groups/:id`
- **Xonalar / bayramlar / tirkamalar:** eski CRUD (add/edit/show/delete yoki add/delete) alohida sahifalar
- Shared: `ConfirmDialog`, `DetailList`

### Nima uchun

List sahifalarida tugmalar placeholder/modalga olib borardi; o‘chirish tasdig‘i har joyda boshqacha edi.

### Keyingi

- O‘quvchi qo‘shish (MSPD) formasi
- Moderator/buxgalter/marketolog CRUD (eski show/edit/delete)
- Qolgan DirectorResourcePage sahifalar

---

## 2026-08-14 — Direktor list sahifalari: filter + tugmalar

### Nima qilindi

Eski direktor UI dagi filter/tugmalar asosiy sahifalarga qaytarildi:

- **Guruhlar:** tab, toifa, jadval bor/yo‘q, saralash, vaqt oralig‘i, hafta kunlari, yangilash, yaratish (modal), o‘chirish
- **O‘qituvchilar:** ustun filterlari (F.I.O, passport, JSHIR, MSPD, holat), saralash, qo‘shish/ko‘rish/tahrir tugmalari
- **Avtomobillar:** nom/raqam/toifa/YHXX/holat/MSPD filter, hisoblagichlar, qo‘shish/ko‘rish/o‘chirish
- **Test statistikasi:** F.I.O + guruh qidiruv, natija ustunlari
- **Mavzu o‘zlashtirish:** guruh tab + o‘quvchilar drill-down

### Nima uchun

Generic jadval eski sahifadagi filter va actionlarni tashlab ketgan edi.

### Keyingi

- O‘qituvchi/mashina create–edit–show formlari (hozir list ishlaydi, forma skeleton)
- Qolgan ~30 director list sahifasini shu sifatda chuqurlashtirish
- O‘quvchi qo‘shish (MSPD) formasi

---

## 2026-08-14 — Direktor dashboard tezkor menyular

### Nima qilindi

- Dashboardda eski 7 ta action tugma: yangi o‘quvchi, guruhlar, o‘qituvchilar, avtomobillar, test holati, mavzu o‘zlashtirish, yuqori tashkilot limiti
- Layout: 4 ustunli `Button variant="soft"` (eski `GeneralButtonRN` ochiq ko‘k)
- 7-tugma: `/assigned-limit/:id` — GET v2 `/superior-organization-limits/organization-overview` (stat + jadval)
- 1-tugma: `/student/add` route ochildi; qo‘shish formasi hali yo‘q

### Nima uchun

Eski dashboarddagi tezkor menyular yangi saytda yo‘q edi (o‘quvchi/davomat/darslar shortcutlari chiqardi).

### Keyingi

- Yangi o‘quvchi qo‘shish formasi (MSPD / bosqichlar)
- Test/mavzu statistika sahifalarini to‘liq UI qilish

---

## 2026-08-14 — Direktor profil rasmi noto‘g‘ri host

### Nima qilindi

- Avatar URL eski `PATH_PREFIX_FILE_WITHOUT_SLESH` ga mos: `https://back.eavtotalim.uz`
- `PATH_PREFIX_FILE_HOST` env qo‘shildi; rasm 404 bo‘lsa initials fallback

### Nima uchun

Yangi dashboard rasmni `http://back.intalim.uz` dan olardi; fayllar `back.eavtotalim.uz` da.

### Keyingi

- Boshqa media (litsenziya, ogohlantirish rasmlari) kerak bo‘lsa shu hostga o‘tkazish

---

## 2026-08-14 — Guruhlar sahifasi (to‘liq list UI)

### Nima qilindi

- `/group-optimal` endi generic jadval emas: `GroupsPage`
- API: GET v2 `/groups` (filter: `edu_status`, `name_uz`, `edu_type_id`) + `/groups/get-group-counts`
- Tablar (barchasi / faol / tamomlagan / yangi), qidiruv, toifa `Select`, jadval (nom, toifa, son, narx, sanalar, vaqt, kunlar), skeleton, pagination

### Nima uchun

Generic `DirectorResourcePage` bitta sahifani ham qayta qilmagan edi; foydalanuvchi to‘liq sahifa so‘radi.

### Keyingi

- Guruh yaratish / tahrirlash / ichki sahifa
- Keyingi menyu sahifasini shu sifatda ko‘chirish

---

## 2026-08-14 — Direktor sahifalari: ro‘yxat API ulanishi

### Nima qilindi

- Placeholder o‘rniga `DirectorResourcePage`: jadval + skeleton + pagination
- Eski API lar `src/api/director-lists.ts` da (v1/v2), ustunlar `features/director-pages/columns.ts`
- FAQ va video yo‘riqnomalar statik
- CRUD/detail (yaratish, tahrirlash, yuborish) hali yo‘q — avval index/list

### Nima uchun

Foydalanuvchi barcha menyu sahifalarini ketma-ket ulashni so‘radi.

### Keyingi

- Permission berilgan sahifalarda to‘liq UI (filter, create/edit) ni chuqurlashtirish

---

## 2026-08-14 — Direktor menyusi: tekis ro‘yxat

### Nima qilindi

- Sidebar dan bo‘lim sarlavhalari (Masofaviy xizmatlar, Ta'lim, …) olib tashlandi
- Permission bor bandlar bitta tekis ro‘yxatda chiqadi

### Nima uchun

Foydalanuvchi collapse/bo‘lim menyusini xohlamadi.

### Keyingi

- Permission berilgach sahifa UI sini ketma-ket ko‘chirish

---

## 2026-08-14 — Direktor menyusi: faqat permission bor bandlar

### Nima qilindi

- Sidebar `DIRECTOR_NAV_SECTIONS` endi `hasPermission(PAGE_ACCESS)` bilan filter qilinadi; bo‘sh bo‘lim yashirin
- Placeholder marshrutlar ham `PAGE_ACCESS` bilan yopiladi
- Dashboard / profil / FAQ (`null`) permission siz ham ochiq

### Nima uchun

Foydalanuvchi: hammasi chiqsin, lekin permission yo‘q bo‘lsa chiqmasin; keyin permission berib chiqadi.

### Keyingi

- Permission berilgach sahifa UI sini ketma-ket ko‘chirish

---

## 2026-08-14 — Direktor menyusi: barcha sahifalar (placeholder)

### Nima qilindi

- Eski `director_links` bo‘yicha 12 bo‘lim, ~45 sahifa: `config/directorNav.ts`, `routes.ts`, `PAGE_ACCESS`
- Sidebar: direktor uchun bo‘limlangan menyu (qidiruv, collapse); o‘quvchi `MAIN_NAV` o‘zgarmagan
- Real UI: dashboard, `/director/edit-my-data`, `/students`. Qolganlari `DirectorModulePage` — permission kaliti ko‘rinadi
- Placeholder route hozircha permission bilan yopilmaydi (kalitni ko‘rish uchun); real UI qo‘shilganda `PAGE_ACCESS` qaytadi

### Nima uchun

Foydalanuvchi barcha direktor sahifalarini chiqarishni so‘radi; yo‘q permissionlarni o‘zi beradi.

### Keyingi

- Permission berilgach sahifalarni ketma-ket ko‘chirish (guruhlar, moliyalar, davomat…)

---

## 2026-08-14 — Direktor roli: eski sayt tahlili (menyu + permission)

### Nima qilindi

- Eski `director_links` + `directorRoutes` + `allRoutes` (commented permission katalog) solishtirildi
- Direktor menyusidagi barcha sahifalar va permission kalitlari yig‘ildi

### Tahlil

- Hozirgi eski menyu permission bilan filter qilmaydi; kalitlar `allRoutes` izohida saqlangan
- Yangi saytda direktor uchun hali faqat dashboard, profil, o‘quvchilar, davomat bor

### Keyingi

- Foydalanuvchi direktor rolga permission beradi; keyin sahifalar ketma-ket ko‘chiriladi

---

## 2026-08-14 — Direktor profil: rekvizit + DateInput/PhoneInput

### Nima qilindi

- Shared `DateInput` (qo‘lda `DD.MM.YYYY` + kalendar) va `PhoneInput` (`+998(xx) xxx-xx-xx`)
- Direktor sahifasiga tashkilot rekvizit bloki: logo, nom, INN, Hr, MFO (+ bank nomi), telefon, litsenziya
- API: GET/POST v2 `/organization-info`, GET `/organization-info/bank-name?mfo=`

### Nima uchun

Eski sahifadagi pastki rekvizit chiqmasdi; sana/telefon har sahifada qayta yozilmasligi kerak.

### Keyingi

- Boshqa formalarda ham `DateInput` / `PhoneInput` ga o‘tkazish

---

## 2026-08-14 — Direktor profili tasdiqlanmagan (MSPD)

### Nima qilindi

- Eski `/director/edit-my-data` sahifasi: MSPD qidiruv, shaxs/manzil/telefon, bir marta saqlash tasdiqi
- `mspd_status !== 1` → «Tasdiqlanmagan» badge (menyu, sozlamalar, dashboard)
- `mspd_status` 0 yoki 2 → 5 soniyadan keyin yopilmaydigan modal («To‘ldirishga o‘tish»)
- API: GET v1 `/director/edit-my-data`, POST v1 `/director/update-my-data`, POST v2 `/eavtotalim-mspd/person-info`
- Modal `dismissible={false}` (fon/X yopilmaydi)

### Nima uchun

Eski saytda tasdiqlanmagan direktor profilini to‘ldirish majburiy edi; yangi UI da sahifa yo‘q edi.

### Tahlil

- `/me.profession.mspd_status`: `1` tasdiqlangan; `0`/`2` majburiy to‘ldirish
- `new === 0` — shaxs maydonlari ochiq; `new` truthy — shaxs yopiq, manzil ochiq; telefon doim ochiq
- Tashkilot rekvizit (`OrganizationInfoRekvizit`) hali ko‘chirilmadi

### Keyingi

- Tashkilot rekvizit formasini shu sahifaga qo‘shish (eski pastki blok)

---

## 2026-08-14 — Direktor tarif rejalari modal

### Nima qilindi

- «Tarifni o‘zgartirish» Telegram o‘rniga modal: BASE / COMFORT / COMFORT+ (eski `ProversionInfos`)
- Kontaktlar (telefon, Telegram, Instagram) + COMFORT ga o‘tish CTA
- `TariffPlansModal`, `config/tariffPlans.ts`, i18n `tariff.*`

### Nima uchun

Direktor tarif farqlarini sayt ichida ko‘rishi kerak edi.

### Keyingi

- —

---

## 2026-08-14 — Direktor dashboard (eski sayt tahlili)

### Nima qilindi

- Dashboard rol bo‘yicha: direktor → `DirectorDashboard`, o‘quvchi → `StudentDashboard`
- Eski `DirectorDashboardNew` bloklari yangi UI da:
  - profil + Face ID / Yagona test / EUQ / avtodrom shartnomasi / monitoring
  - INN, telefon, HR, MFO, litsenziya, yuridik nom/manzil
  - KPI: hodimlar, o‘quvchilar, guruhlar, mashinalar (`/me.profession.organization.report`)
  - ta’lim toifalari (`report_by_edu_type`)
  - o‘quvchi rasm statistikasi (`GET /organization/student-image-stats/summary`)
  - kunlik tushum + narx switch (`/school-payment/by-type-payment`, `POST /organization-enable-payment`)
  - avtodrom kameralari (shartnoma bo‘lsa)
  - Face Control ogohlantirish modal
- Tezkor havolalar: mavjud sahifalar (o‘quvchilar / davomat / darslar)

### Nima uchun

Direktor roli o‘quvchi profil dashboardini ko‘rardi (bo‘sh guruh/toifa). Eski saytda tashkilot statistikasi bor edi.

### Tahlil

- Asosiy raqamlar `/me` da; qo‘shimcha API lar v2.
- Eski tezkor tugmalar (`/student/add`, `/group-optimal`, `/cars`…) yangi saytda hali yo‘q — faqat mavjud route lar.
- Comfort tarif to‘liq reklama modal o‘rniga Telegram havola.

### Keyingi

- Direktor menyu modullari (guruhlar, to‘lov, o‘qituvchilar…)

---

## 2026-08-14 — Modal ichida Select optionlari ko‘rinmasligi

### Nima qilindi

- `Select` dropdown `z-index` 80 → 120 (`src/components/ui/Select.tsx`)

### Nima uchun

O‘quvchi «Murojaat qo‘shish» modalida «Murojaat turi» ochilganda variantlar chiqmasdi.

### Tahlil

Dropdown `createPortal(document.body)` bilan chiqadi, lekin `z-index: 80` Modal overlay (`z-100`) ostida qolardi — ro‘yxat ochilgan, ammo ko‘rinmas edi. Toast `z-110`, shuning uchun dropdown `120`.

### Keyingi

- —

---

## 2026-08-12 — Login / logout toast

### Nima qilindi

- Kirish: `notify.success` — «Xush kelibsiz, {{familiya ism}}! …»
- Chiqish: `notify.info` — «Xayr, {{name}}! …»; `navigate` (reload emas)

### Keyingi

- —

---

## 2026-08-12 — Sozlamalar footer + Modal portal

### Nima qilindi

- `SettingsMenu` sidebar footeriga ko‘chirildi (topbar dan olib tashlandi)
- `Modal` → `createPortal(document.body)` — sidebar transform ichida kesilmasin

### Nima uchun

- Parol modal tepada kesilib chiqardi; sozlama menyu footerida bo‘lishi kerak edi

### Keyingi

- —

---

## 2026-08-12 — Sozlamalar menyusi (Profil / Parol / Chiqish)

### Nima qilindi

- Topbar `SettingsMenu` (⚙️): Profil → `/myprofile`, Parol modal, Chiqish
- `ChangePasswordModal` → `POST /change-password`
- `ProfilePage` + route/access

### Nima uchun

- Eski saytdagi ProfileMenu funksiyasi

### Keyingi

- Profil sahifasini eski StudentProfile bilan boyitish (ixtiyoriy)

---

## 2026-08-12 — Final exam kamera: boshida ochilishi

### Nima qilindi

- Kamera faqat panel DOM’da bo‘lganda (`!isLoading`) start
- `bindVideo` callback ref + `play()`; Capture kamera tayyor bo‘lguncha disabled

### Nima uchun

- Oldin stream skeleton paytida olinardi, `videoRef` null — preview chiqmasdi

### Keyingi

- —

---

## 2026-08-12 — Shared Notification (toast + banner)

### Nima qilindi

- `components/ui/Notification.tsx`: inline banner + toast viewport
- `notify.success|error|info|warning` + `NotificationProvider` (`AppProviders`)
- Hint/shartnoma amber/signal Panel’lar → `<Notification />`
- Final exam / saved-tests / take: toast feedback

### Nima uchun

- Bir xil xabar UX; hamma joyda qayta stil qilinmasin

### Keyingi

- Qolgan sahifalarda ad-hoc xabarlar bo‘lsa `notify` ga o‘tkazish

---

## 2026-08-12 — Yakuniy imtihon kamera UI (face-id)

### Nima qilindi

- Overlay: `/images/face-id.png` (eski front kabi, 70%)
- Faqat theme tokenlar (`deep` `signal` `fog` `mist`…) — custom hex olib tashlandi
- 300px kvadrat kamera + yonida raqamli qoidalar

### Nima uchun

- Oldingi qora panel / boshqa ranglar sayt bilan mos emas edi

### Keyingi

- Real kamera / face-check bilan tekshirish

---

## 2026-08-12 — Yakuniy imtihon sahifasi

### Nima qilindi

- `/final-exam`: info, natija kartasi, kamera (yuz), til modal
- `/final-exam/take`: 25 daqiqa, 20 savol, javoblarni yuborish
- API:
  - `GET /organization-student-final-exam/index`
  - `POST /organization-student-final-exam/start`
  - `POST /organization-student-final-exam/answer`
- Permission: `menu.student.student_final_exam`

### Keyingi

- Face-check edge-case’larni real backend bilan tekshirish

---

## 2026-08-12 — Saqlangan testni olib tashlash

### Nima qilindi

- Kartada `BookmarkX` tugmasi + tasdiqlash modal
- API: `DELETE /saved-test/:id`
- Muvaffaqiyatda ro‘yxat invalidate

### Keyingi

- Yakuniy imtihon

---

## 2026-08-12 — Saqlangan testlar sahifasi

### Nima qilindi

- Route `/saved-tests`, permission `menu.student.saveTests`
- API: `GET /student-exam-center-saved-test`
- Kartalar + start modal (til, rejim 4/5) → `/exam-templates/take`
- Info: qiyin/muhim testlarni saqlab qayta ko‘rish
- Comfort plan tekshiruvi

### Keyingi

- Yakuniy imtihon

---

## 2026-08-12 — Barcha testlar sahifasi

### Nima qilindi

- Route `/all-tests`, permission `menu.user.all_tests`
- API: `GET /get-all-questions-by-language/:langId` (page, show_count, body LIKE filter)
- Kartalar: savol, rasm/video, to‘g‘ri javob belgilangan variantlar, izoh
- Qidiruv (debounce 500ms), Pagination, til bo‘yicha lang id
- Comfort plan tekshiruvi

### Keyingi

- Saqlangan testlar

---

## 2026-08-12 — /tests placeholder olib tashlandi

### Nima qilindi

- Menyudan «Testlar», route `/tests`, `TestsPage`, `PAGE_ACCESS.tests` olib tashlandi

### Nima uchun

- Alohida test sahifalari bor; skeleton kerak emas

### Keyingi

- Barcha testlar sahifasi

---

## 2026-08-12 — Aralash testlar sahifasi

### Nima qilindi

- Route `/random-tests` + take `/random-tests/take` (AppShell tashqarida)
- List: so‘nggi natija, 20/50/100, boshlash modal (til + shuffle)
- API:
  - `GET /random-test/latest-result`
  - `GET /random-test/start/lang/:langId?limit=`
  - `POST /random-test/check-test`
- Permission: `menu.student.random_tests`
- Comfort plan tekshiruvi (shartnoma)

### Keyingi

- Barcha / saqlangan testlar

---

## 2026-08-12 — Joriy belgilangan: kulrang

### Nima qilindi

- Mode 5: belgilangan savolga qaytganda joriy raqam **kulrang** (oq border emas)
- Boshqa belgilanganlar sariq qoladi

### Keyingi

- Aralash testlar

---

## 2026-08-12 — Joriy raqam indikatori yumshatildi

### Nima qilindi

- `scale` va kuchli glow olib tashlandi
- Joriy: oddiy oq border + yengil ring
- `qNav` padding biroz oshirildi (kesilmasin)

### Keyingi

- Aralash testlar

---

## 2026-08-12 — Joriy savol konturi (sariq ustida)

### Nima qilindi

- Mode 5: joriy raqamda doim oq qalin kontur + biroz kattaroq (`qBtnCurrent`)
- Belgilanган sariq savolga qaytganda ham joriy savol farqlanadi

### Keyingi

- Aralash testlar

---

## 2026-08-12 — Footer raqam ranglari (aniqlashtirish)

### Nima qilindi

- Variant tugmalari: eski inline sariq/yashil/qizil (CSS class olib tashlandi)
- Mode 5: pastki raqam **faqat javob tanlanganda** sariq; joriy savol — faqat oq kontur
- Mode 4: joriy sariq; tasdiqdan keyin yashil/qizil

### Nima uchun

- Foydalanuvchi rangni raqamlarga nazarda tutgan, variant buttoniga emas

### Keyingi

- Aralash testlar

---

## 2026-08-12 — Tanlangan variant sariq rangi

### Nima qilindi

- Variant tanlash: `answerSelected` CSS (`!important`) — hover/preflight yutmaydi
- Javob `id` Number ga normalizatsiya; solishtirish `Number(...)`
- Tasdiqdan keyin pending saqlanadi — sariq qoladi
- Savolga qaytganda store dan tanlov tiklanadi

### Keyingi

- Aralash testlar

---

## 2026-08-12 — Oxirida ko‘rish: footer ranglar

### Nima qilindi

- Mode 5 (`isType === 5`): pastki savol raqamlarida yashil/qizil faqat `liveReveal` (mode 4) da
- Oxirida ko‘rishda faqat joriy savol sariq; qolganlari bir xil

### Nima uchun

- Natija oldindan oshkor bo‘lmasin

### Keyingi

- Aralash testlar

---

## 2026-08-12 — Shablon test API fix

### Nima qilindi

- Start API: eski parametrlar (`token`, `template_id`, `lang_id`, `relations[]`)
- Javob parsing mustahkamlandi (`questions` nested / object)
- Savol `body`/`answers` normalizatsiya
- sessionStorage orqali take state saqlash

### Keyingi

- Aralash testlar

---

## 2026-08-12 — Shablon testlar (Imtihon)

### Nima qilindi

- Route `/exam-templates`, permission `menu.teacher.exam_questions`
- Shablon kartalar (progress, to‘g‘ri javoblar, saqlangan)
- Boshlash modal: til, aralashtirish, javob rejimi
- Test ishlash: `/exam-templates/take` (25 daqiqa, yakunlash/check)
- API:
  - `GET /student-exam-center-templates`
  - `GET /student-exam-center-test-template-start/:id/:lang`
  - `POST /student-exam-center-test-template-check`

### Keyingi

- Aralash / barcha / saqlangan testlar

---

## 2026-08-12 — Pagination doim + Active schools

### Nima qilindi

- `components/ui/Pagination` kengaytirildi: `total`, `pageSize` / `onPageSizeChange`, default `hideIfSingle=false`
- Faol avtomaktablar: server pagination (`page` + `show_count`) + № + Pagination
- Murojaat / yo‘l belgilari / darslar: `total` Pagination ichida

### Qoida

Paginationli ro‘yxatlarda doim shared `Pagination`.

---

## 2026-08-12 — Faol avtomaktablar

### Nima qilindi

- Route `/active-schools`
- Jadval: nom, STIR, manzil, toifalar; qidiruv (name / INN)
- API: `GET /v2/api/general/licensed-organizations`
- Shared UI: `SearchInput`, `Table`, `Badge`, skeleton

### Permission (Super Admin)

Yangi permission yaratib o‘quvchi roliga bering:

`menu.student.active_schools`

### Keyingi

- Placeholder test/exam modullar

---

## 2026-08-12 — Guruh tafsilotlari

### Nima qilindi

- Route `/group-details`, permission `menu.student.group_details`
- O‘qituvchilar va avtomobillar jadvallari
- API: `GET /v2/api/students/:professionId/group-details`
- Shared UI: `Panel`, `Table`, `Badge`, skeleton

### Keyingi

- Placeholder modullar (exam/test va boshqalar)

---

## 2026-08-12 — Qoldirilgan darslar

### Nima qilindi

- Route `/missed-classes`, permission `menu.student.missed_classes`
- 2 tab: Qoldirilgan darslar (sana + handoutlar), Qatnashmaganlik sabablari (jadval)
- API:
  - `GET /v2/api/my-profile/absences`
  - `GET /v2/api/students/:professionId/absence-reason-applications`
- Shared UI: `Tabs`, `Panel`, `Table`, `Badge`, skeleton

### Keyingi

- Guruh tafsilotlari yoki boshqa placeholder modullar

---

## 2026-08-12 — Shared `Tabs`

### Nima qilindi

- `components/ui/Tabs` — bir xil tab/segment dizayn
- Migratsiya: Davomatlarim, Avtodrom qo‘llanma, Murojaat (kimga)
- `.cursor/rules/shared-ui.mdc` yangilandi

### Qoida

Takroriy UI (tab, select, …) — shared kitdan; yangisini avval `components/ui` ga qo‘shish.

---

## 2026-08-12 — Davomatlarim

### Nima qilindi

- Route `/my-attendance`, permission `menu.student.my_attendance`
- 3 tab: Nazariy (oy kalendari), Amaliy (jadval), Avtodrom (progress + jadval)
- API:
  - `GET /v2/api/me/camera-attendances/organization?year&month`
  - `GET /v2/api/student-practical-attendance/student-history`
  - `GET /v2/api/my-profile/attendances/autodrome`
- `edu_type_id` 1/2 da nazariy tab yashirin (eski UI)

### Keyingi

- Qoldirilgan darslar

---

## 2026-08-12 — Amaliy imtihonga tayyorlov

### Nima qilindi

- Sahifa `/practical-training` (eski PracticalTraining UI)
- Bepul overview video + qolgan mashqlar Prepdrive.uz ga yo‘naltiradi
- Permission: **`menu.student.practical_training`**
- Menyu: Avtodrom qo‘llanmasidan keyin

### Super admin

Yangi permission yaratib o‘quvchi roliga bering:

`menu.student.practical_training`

### Keyingi

- Davomatlarim / qoldirilgan darslar

---

## 2026-08-12 — Avtodrom qo‘llanmasi

### Nima qilindi

- `GET /v2/api/autodrome-guides?status=1&lang_id=` — faol qo‘llanmalar
- `GET /v2/api/autodrome-guides/:id` — matn / rasm / video / audio
- Tablar (bir nechta guide), Prepdrive.uz info panel
- Route: `/circuit-diagram`
- Fayllar: `src/api/circuit-diagram.ts`, `src/features/circuit-diagram/*`, `src/pages/circuit-diagram/*`

### Keyingi

- Davomatlarim / qoldirilgan darslar

---

## 2026-08-12 — Sidebar menyu qidiruvi

### Nima qilindi

- Logo ostiga `SearchInput` (sm) — menyu bandlarini filtrlaydi
- Collapsed desktopda yashirin; bo‘sh natija matni
- `SearchInput` ga `size: sm | md`

### Keyingi

- Avtodrom qo‘llanmasi / davomatlarim

---

## 2026-08-12 — Select: qidiruvli custom dropdown

### Nima qilindi

- `components/ui/Select` native `<select>` o‘rniga zamonaviy dropdown
- Qidiruv (options > 5 yoki `searchable`), keyboard (↑↓ Enter Esc), click-outside
- Portal + position (modal/overflow ichida ham ochiladi)
- API: `value` / `onChange({ target: { value } })` — mavjud sahifalar o‘zgarmadi

### Nima uchun

Murojaat filterlari (ko‘p tur) native selectda qulay emas edi.

### Keyingi

- Avtodrom qo‘llanmasi / davomatlarim

---

## 2026-08-12 — Murojaat (ex Apellyatsiya)

### Nima qilindi

- UI nomi: **Apellyatsiya → Murojaat** (uz / kiril / ru)
- Ro‘yxat: `GET /v2/api/appeals/index` + filterlar (tur, ochiq/yopiq, status) + pagination
- Yangi: `POST /v2/api/appeals/store` (multipart: type, message, target, files[])
- Detail: `GET /v2/api/appeals/:id` + yopish `PUT /appeals/:id/close`
- Turlar: `GET /v2/api/appeal-types/index`
- Routes: `/appeal`, `/appeal/:id`
- Fayllar: `src/api/appeals.ts`, `src/features/appeals/*`, `src/pages/appeals/*`

### Nima uchun

Student menyudagi placeholder o‘rniga eski `StudentAppeal` oqimi; foydalanuvchi so‘rovi bo‘yicha nom «Murojaat».

### Tahlil

- Route/permission kaliti `appeal` qoldi (`menu.student.student.appeal`) — URL barqaror.
- Shared: Table, Modal, Select, Badge, Pagination, Skeleton.

### Keyingi

- Avtodrom qo‘llanmasi / davomatlarim

---

## 2026-08-12 — Jarimalar

### Nima qilindi

- `GET /v2/api/penalties/categories` — kategoriyalar grid (`PenaltiesPage`)
- `GET /api/student/penalties/:id` — kategoriya ichidagi kartochkalar
- `GET /api/student/penalties-show/:id` — modal: transport teglari + bandlar (jismoniy/yuridik)
- 1 kategoriya bo‘lsa avto-redirect; ko‘p bo‘lsa `Select` filter
- Routes: `/penalties`, `/penalties/:id`
- Fayllar: `src/api/penalties.ts`, `src/features/penalties/*`, `src/pages/penalties/*`

### Nima uchun

Student menyudagi placeholder o‘rniga eski front (`StudentPenalties*`) oqimini yangi UI kit bilan ko‘chirish.

### Tahlil

- Kategoriyalar v2, ro‘yxat/show v1 — eski app bilan bir xil.
- Body HTML `sanitizePenaltyHtml` orqali; MathJax paket yo‘q (matn/HTML yetarli).
- Shared: `Panel`, `Modal`, `Select`, `Badge`, `Button`, skeleton.

### Keyingi

- Live API da body/math formatini tekshirish
- Apellyatsiya / boshqa student modullar

---

## 2026-08-12 — Yo‘l belgilari

### Nima qilindi

- `GET /road-sign/types/index` — turlar grid
- `GET /road-sign/index?filters[road_sign_type_id]` — belgilar + pagination
- Modal: rasm + content (matn/video/audio/rasm)
- Shared `Modal`; routes `/road-signs`, `/road-signs/:id`

---

## 2026-08-12 — Dars jadvali

### Nima qilindi

- `GET /v2/api/my-time-table`
- `LessonSchedulePage`: oy kalendari (dushanbadan), kun tanlash → vaqt + mavzular
- Base tarif / comfort shartnoma tekshiruvi (eski UI bilan)
- Route: `/lesson-schedule`

---

## 2026-08-12 — Saqlangan mavzular

### Nima qilindi

- API: `saved-topic/index|store|delete` (+ v1 list fallback)
- Dars ichida yulduzcha: saqlash / olib tashlash
- `/lessons/saved` — saqlanganlar ro‘yxati + kontent
- Darslar sahifasida «Saqlangan mavzular» tugmasi

---

## 2026-08-12 — Shared UI kit

### Nima qilindi

- `components/ui`: `Button` (variant/size), `Pagination`, `EmptyState`, `ErrorMessage`, `Badge`, `Panel`, `Table`, `SearchInput`
- Darslar / Students / placeholder sahifalar shu kitga o‘tkazildi
- Qoida: `.cursor/rules/shared-ui.mdc`, ADR-014

### Keyingi

Dashboard kartalarini `Panel`/`Badge` ga asta-sekin migratsiya.

---

## 2026-08-12 — Darslik ichida: topics + contents

### Nima qilindi

- `GET /student-content/topics?edu_type_lesson_id=&page=&show_count=&relations[]=`
- `GET /student-content/contents?topic_id=`
- `LessonDetailPage`: chapda mavzular (progress, o‘qish vaqti, test holati), o‘ngda kontent (video/matn/audio/rasm/fayl filtrlari), shrift, skeleton
- Route: `/lessons/:id`

### Keyingi

Mavzu testi (exam flow) va saqlangan mavzular.

---

## 2026-08-12 — Darslar: `/student-content/lessons`

### Nima qilindi

- `fetchStudentLessons` + `useStudentLessonsQuery`
- `LessonsPage`: qidiruv, kartalar grid, skeleton, Base tarif ogohlantirish
- Route: `/lessons`, detail placeholder `/lessons/:id`

### Keyingi

Dars ichidagi topics/contents UI.

---

## 2026-08-12 — Skeleton loading (progress bar o‘rniga)

### Nima qilindi

- `GlobalApiLoading` olib tashlandi
- `Skeleton` + `DashboardProfileSkeleton` / `StatusCardSkeleton` / `ListPageSkeleton`
- Dashboard, avtodrom kartalar, Students — `isLoading` da skeleton
- `global-ux.mdc` + ADR-013 yangilandi

### Nima uchun

Foydalanuvchi: progress bar yoqmadi; ma’lumot kelgunicha skeleton.

### Keyingi

Har yangi modulda ham skeleton shablon.

---

## 2026-08-12 — Global API loading + scroll

### Nima qilindi

- `lib/apiLoading.ts` + `api/client.ts` begin/end
- `GlobalApiLoading` — yuqori progress bar (`AppProviders`)
- Scroll stili global (`*` scrollbar 5px, signal)
- `.cursor/rules/global-ux.mdc` + ADR-013

### Nima uchun

Foydalanuvchi: API da doim loading; scroll hamma joyda bir xil.

### Keyingi

—

---

## 2026-08-12 — Menyu permission filtri

### Nima qilindi

- `PAGE_ACCESS` + `MAIN_NAV` kengaytirildi (Darslar, jadval, belgi, jarima, …)
- Sidebar faqat `/me` dagi ruxsat bo‘yicha bandlarni ko‘rsatadi
- Route guard har band uchun; skeleton `ModulePlaceholderPage`

### Asosiy kalitlar

| Menyu | Permission |
|-------|------------|
| Darslar | `menu.director.subjects` |
| Dars jadvali | `menu.student.lesson_schedule` |
| Yo'l belgilari | `menu.student.road_signs_students` |
| … | `config/access.ts` |

### Keyingi

Har modul UI ni to‘ldirish.

---

## 2026-08-12 — Kamera holati: not_found + enrollment

### Nima qilindi

- `autodrome-camera-status` `not_found` bo‘lsa ham xabar ko‘rsatiladi
- `GET /my-profile/autodrome-status` enrollment kartasi qo‘shildi (1-rasmdagi “Yuborilmagan”)

### Tahlil

Live javob: `{ status: "not_found", message: "O'quvchi kamera tizimida topilmadi" }` — oldin yashirilgan edi.

### Keyingi

—

---

## 2026-08-12 — Avtodrom kamera holati

### Nima qilindi

- `GET /my-profile/autodrome-camera-status` + `useAutodromeCameraStatusQuery`
- Dashboard yuqorisida ixcham `AutodromeCameraStatusCard`

### Nima uchun

Foydalanuvchi: shu endpointni ham chiqar.

### Keyingi

Kerak bo‘lsa `autodrome-status` (enrollment) ham.

---

## 2026-08-12 — O‘qiyotgan toifasi (`/my-profile`)

### Nima qilindi

- `GET /v2/api/my-profile` — `fetchMyProfile` + `useMyProfileQuery`
- Dashboardda guruh ostida `edu_type.character_name` (masalan `B`)

### Nima uchun

Toifa `/me` da yo‘q; eski frontda `StudentProfileV2` dan.

### Keyingi

—

---

## 2026-08-12 — Dashboard: stats + ruxsatlar olib tashlandi

### Nima qilindi

- 4 ta stats karta (ruxsatlar/rollar/tashkilot/holat) olib tashlandi
- `Ruxsatlar` tag ro‘yxati olib tashlandi

### Nima uchun

Foydalanuvchi: “shular kerak emas”.

### Keyingi

—

---

## 2026-08-12 — Dashboard ixcham (/me dinamik)

### Nima qilindi

- Dashboard qayta yig‘ildi: 2 ustun (profil+org | meta), zich padding
- Barcha qiymatlar faqat `useAuth().me` / `user` — hardcode yo‘q
- Kelishuv badge: `last_agreement.agreement_type.name_uz` (dinamik)

### Nima uchun

Foydalanuvchi: “statik emas, /me dan; 1-rasmdagidek menyuga sig‘adigan ixcham”.

### Tahlil

Oldingi versiya bo‘sh joy ko‘p edi; endi StudentInfoCard zichligi bilan bir xil.

### Keyingi

Davomat/to‘lov/jadval — alohida API.

---

## 2026-08-12 — /me to‘liq dashboard (1-rasm uslubi)

### Nima qilindi

- Live `GET /v2/api/auth/me` javobi tekshirildi (sessiya orqali)
- `MeData` tiplari kengaytirildi: `profession`, `study_info`, `organization_id`, org/autodrome/cars
- Dashboard: F.I.O + foto, guruh/sanalar, tashkilot (INN/HR/manzil), avtodrom+mashinalar, passport, stats, ruxsatlar
- i18n: `dashboard.studyInfo` … `mspdPhoto` — uz / kiril / ru
- `formatDate`, `fullNameOf` helperlar

### Nima uchun

Foydalanuvchi: `/me` ni 1-rasmdagi (eski student dashboard) bilan solishtirib, 2-rasm joyiga chiroyli chiqarish.

### Tahlil

**1-rasm bilan mos (`/me` da bor):** F.I.O, foto, telefon `(99) 9565146`, guruh `4`, sanalar `25.03.2025`–`07.07.2026`, tashkilot Vatanparvar + INN `205791528` + HR + telefon, avtodrom nomi.

**1-rasmda bor, `/me` da yo‘q** (boshqa endpointlar): toifa `B`, davomat soatlari, to‘lovlar, bugungi/haftalik dars, imtihon natijalari, o‘qituvchilar, kamera yuborish holati. Eski frontda bular `StudentProfileV2` / alohida API.

`tsc --noEmit` toza.

### Keyingi

Student profile / davomat / to‘lov / jadval API larini ulash (1-rasmdagi qolgan bloklar).

---

## 2026-08-10 — Rangli palitra + /me dashboard

### Nima qilindi

- Aksent tokenlar: `violet` / `teal` / `amber` / `rose` / `indigo` (+ `-soft`)
- `.shell-canvas`, `.app-topbar`, `.profile-hero`, `.card-accent` — mayin gradientlar
- `config/roles.ts` — `user.role` → nom + rang (`getRoleMeta`, `TONE_CLASS`)
- `config/nav.ts` — har menyu bandiga `tone`; sidebar ikonalari rangli
- `lib/format.ts` — `formatDateTime` (til bo‘yicha), `initialsOf`
- Dashboard `/me` dan: avatar/initial, username, rol, onlayn, ID, telefon
  (+ tasdiq), oxirgi faollik, tashkilot, hisob holati, `is_practical_attendance_strict`,
  rollar/ruxsatlar soni va ruxsatlar ro‘yxati (18 ta + “Barchasi”)
- i18n: `dashboard.*` va `roles.*` — uz / kiril / ru

### Nima uchun

Foydalanuvchi: “faqat oq bo‘lib qoldi, rang ishlat” va `/me` ma’lumotini ko‘rsat.

### Tahlil

`/me` qo‘shimcha so‘rov talab qilmaydi — `AuthProvider` dagi mavjud state.
`tsc --noEmit` toza.

### Keyingi

Haqiqiy statistikalar (o‘quvchi/davomat/test) backend endpointlari aniqlangach.

---

## 2026-08-10 — Soft collapsible shell

### Nima qilindi

- Sidebar: ochiq/yumshoq gradient (qora emas); desktop collapse → 72px ikonlar
- Holat `localStorage` (`eav_sidebar_collapsed`)
- `AppTopBar` h-11: toggle + LanguageSwitcher
- `Header` ixcham (bir qator); Dashboard kartalarixchamlashdi

### Nima uchun

Foydalanuvchi: to‘q rang, katta header, ochib-yopilmaydigan layout.

---

## 2026-08-10 — API so‘rov: 1 marta (captcha /me)

### Nima qilindi

- `dedupeAsync` — parallel bir xil so‘rovlar bitta promise
- `fetchCaptcha` / `fetchMe` dedupe; captcha refresh `force: true`
- `CaptchaField` mount-once + callback refs (qayta render → qayta so‘rov yo‘q)
- `StrictMode` olib tashlandi (devda effect x2)

### Nima uchun

Network: get-captcha 2 marta; “ko‘p narsa” — Vite HMR (prod’da bundle).

### Tahlil

Fetch/XHR filtrida faqat API; scriptlar = normal dev.

---

## 2026-08-10 — Shell menu redesign (brand palette)

### Nima qilindi

- Login ranglari loyiha tokenlari sifatida qayd (`deep` / `signal` / `fog` / `mist`)
- Sidebar 0 dan: deep gradient, ikonkalar, active signal, dark LanguageSwitcher
- `config/nav.ts` — menyu manbai
- Mobile: top bar + drawer
- Header/Dashboard/sahifalar mist/brand uslubiga o‘tkazildi

### Nima uchun

Foydalanuvchi: menyu yo‘q/eski; login ranglari doim ishlatilsin.

---

## 2026-08-10 — Logout API

### Nima qilindi

- `POST /v2/api/auth/logout` JSON: `{ device, device_id, model_device, platform }`
- `AuthProvider.logout()` API chaqiradi, keyin local session tozalaydi
- Sidebar tugmasi loading holati bilan

### Nima uchun

Foydalanuvchi logout payload skrinini berdi.

---

## 2026-08-10 — /me + rol redirect + permission

### Nima qilindi

- `GET /v2/api/auth/me?token=...` login’dan keyin
- `AuthProvider` + `RequireAuth` / `GuestOnly`
- Rol bo‘yicha home (`777`→dashboard, `5`→tests, …)
- Sahifalar `PAGE_ACCESS` permission bilan; sidebar filtrlanadi
- Superadmin (`roles` ichida) barcha sahifaga kiradi

### Nima uchun

Foydalanuvchi: /me dagi rolga qarab sahifa; permission bog‘lash.

### Keyingi qadam

Permission kalitlarini aniq menyu bilan moslash; yangi modullar.

---

## 2026-08-10 — Login + Captcha API ulandi

### Nima qilindi

- `GET /v2/api/general/get-captcha` → base64 rasm + `key`
- `POST /v2/api/login` FormData: username, password, device, device_id, model_device, platform, captcha_key, captcha_code
- Vite proxy (`/v2/api` → back.intalim.uz) — CORS
- Token `localStorage` ga, muvaffaqiyatda `/dashboard`

### Nima uchun

Foydalanuvchi Network skrinlari asosida real API.

### Keyingi qadam

Auth guard (token yo‘q → login); `/auth/me`.

---

## 2026-08-10 — i18n: Uz, Kiril, Ru

### Nima qilindi

- `i18next` + `react-i18next`
- `src/i18n/locales/{uz,kiril,ru}.json`
- `LanguageSwitcher` (login + sidebar)
- Login va asosiy sahifalar `t()` ga o‘tkazildi
- Til `localStorage` da saqlanadi (`eav_lang`)

### Nima uchun

Foydalanuvchi: butun loyiha 3 til — Uz, Kiril, Ru.

### Keyingi qadam

Yangi UI matnlarni 3 locale ga parallel qo‘shish.

---

## 2026-08-10 — Login to‘liq redesign (v3)

### Nima qilindi

- Glass card olib tashlandi → full-bleed split
- Chap: `back1.jpg` to‘g‘ridan-to‘g‘ri ko‘rinadi + matn overlay
- Shrift: Sora + Manrope; rang: soft ocean blue (`#2F7EA0`)
- Mobile: skrollsiz (`100dvh` + overflow hidden)

### Nima uchun

Foydalanuvchi: oldingi dizayn chiroyli emas, qayta qil.

---

## 2026-08-10 — Login fon: `public/images/back1.jpg` + mobile no-scroll

### Nima qilindi

- Fon: `/images/back1.jpg`
- Mobile: `fixed` + `h-dvh` + `overflow: hidden` (html/body ham)
- Compact spacing / line-clamp — telefon skrollsiz

### Nima uchun

Foydalanuvchi: images ichidagi rasm; telefonda scroll bo‘lmasin.

---

## 2026-08-10 — Login redesign: soft sage + glass

### Nima qilindi

- Yangi yo‘nalish: soft mist / sage (ko‘zni charchatmaydigan)
- Shrift: Fraunces (display) + Manrope (UI)
- Kompozitsiya: full-bleed avtodrom + keng glass panel (ikki ustun)
- Accent: muted sage `#4F7F78` (old orange olib tashlandi)

### Nima uchun

Foydalanuvchi: unikal, zamonaviy, yumshoq ranglar, chiroyli shrift, boshqacha dizayn.

### Keyingi qadam

Login API.

---

## 2026-08-10 — Login: keng layout + rasmiy matn + avtodrom

### Nima qilindi

- Konteyner `max-w-[1680px]`, yon bo‘shliq kamaytirildi
- Hero matn: IIB / Yo‘l harakati xavfsizligi xizmati + ta’lim muassasalari AT
- Fon: avtodrom/trassa rasmi
- Brend signal: EAV To'talim (yuqori)

### Nima uchun

Foydalanuvchi: o‘rtada tor qolgan; ikkinchi rasm matnlari; rasim avtodrom bo‘lsin.

### Keyingi qadam

Login API.

---

## 2026-08-10 — Login / parol / captcha UI

### Nima qilindi

- `/login` sahifa (root `/` → login)
- `features/auth`: LoginHero (media), LoginForm, CaptchaField (lokal canvas, API slot `imageUrl`)
- UI: `Input`, `Button` yangilandi; `lucide-react` ikonkalar
- Dizayn: Syne + Outfit, deep teal + signal amber, ken-burns / fade / shimmer / road lines
- Submit hozircha mock (`console.info`) — API keyin

### Nima uchun

Foydalanuvchi: faqat login+parol+captcha dizayni, media/animatsiya/ikonka, zamonaviy.

### Tahlil

Captcha lokal generate — keyin server image/token bilan almashtiriladi. Auth guard hali yo‘q.

### Keyingi qadam

Login API endpoint + token saqlash.

---

## 2026-08-10 — intalim.uz PATH_PREFIX lar `.env` ga

### Nima qilindi

- `.env` / `.env.example`: `VITE_PATH_PREFIX`, `_V2`, `_FILE`, `VITE_IS_PROD`
- `env.ts`: `PATH_PREFIX`, `PATH_PREFIX_V2`, `PATH_PREFIX_FILE`, `IS_PROD` (+ `env` obyekti)
- `apiClient` `env.apiUrl` (= PATH_PREFIX) ishlatadi

### Nima uchun

Eski loyihadagi base URL konstantalari kerak.

### Tahlil

Default qiymatlar `back.intalim.uz`; lokal o‘zgartirish faqat `.env` orqali.

### Keyingi qadam

Dev server restart (env o‘qish uchun).

---

## 2026-08-10 — API base URL `.env` (gitignore)

### Nima qilindi

- `.env` — `VITE_API_URL` (lokal, gitignore)
- `.env.example` — namuna (gitda)
- `.gitignore` — `.env` / `.env.*`, `!.env.example`
- `src/vite-env.d.ts` — tip
- `env.ts` izoh + ADR-006

### Nima uchun

Foydalanuvchi: base URL alohida faylda, gitga yuklanmasin.

### Tahlil

| Jihat | Xulosa |
|-------|--------|
| Standart | Vite `VITE_*` env |
| Xavfsizlik | Haqiqiy URL/secret repo’da emas |
| Eslatma | `.env` o‘zgarsa `npm run dev` restart |

### Keyingi qadam

Backend URL aniq bo‘lgach `.env` dagi `VITE_API_URL` ni yangilash.

---

## 2026-08-10 — Senior src struktura + router

### Nima qilindi

- `react-router-dom@7.18.2`
- Papkalar: `app`, `pages`, `components`, `features`, `api`, `types`, `styles`, `hooks`, `lib`, `config`
- `@/` alias (Vite + TS paths, `baseUrl`siz)
- Skeleton: Dashboard, O‘quvchilar (React Query mock), Davomat, Testlar
- Vite starter (`App.tsx` / `App.css` / `index.css`) olib tashlandi
- `docs/STRUCTURE.md`, ADR-005

### Nima uchun

Foydalanuvchi: pages/components/types/styles/api alohida, senior zamonaviy struktura.

### Tahlil

| Jihat | Xulosa |
|-------|--------|
| Pattern | Feature-sliced + layered (pages ingichka) |
| Yutuq | Scale, import aniqlik, mock→real API oson almashtirish |
| Xavf | Hozircha UI oddiy; dizayn tizimi hali yupqa |

### O‘zgargan / yangi asosiy fayllar

- `src/app/*`, `src/pages/*`, `src/components/*`, `src/features/students/*`
- `src/api/*`, `src/types/*`, `src/styles/globals.css`, `src/config/*`
- `vite.config.ts`, `tsconfig.app.json`, `docs/*`

### Keyingi qadam

Davomat yoki test moduli UI; yoki dizayn tokens / auth.

---

## 2026-08-10 — Tailwind v4 + React Query o‘rnatildi

### Nima qilindi

- `npm install @tanstack/react-query` → **5.101.4**
- `npm install -D tailwindcss @tailwindcss/vite` → **4.3.3**
- `vite.config.ts` — `tailwindcss()` plugin
- `src/index.css` — `@import "tailwindcss"`
- `src/lib/queryClient.ts` + `main.tsx` da `QueryClientProvider`
- Typecheck (`tsc -b`) — OK
- ADR-004, `PROJECT.md` stack yangilandi

### Nima uchun

Foydalanuvchi: birinchi navbatda eng so‘nggi React Query va Tailwind.

### Tahlil

| Jihat | Xulosa |
|-------|--------|
| Tailwind | v4 Vite plugin — postcss/config fayl kerak emas |
| React Query | Provider tayyor; hali API hooklari yo‘q |
| Dev server | Agar ishlayotgan bo‘lsa, restart qilish kerak bo‘lishi mumkin |

### O‘zgargan fayllar

- `package.json`, `package-lock.json`
- `vite.config.ts`, `src/index.css`, `src/main.tsx`, `src/lib/queryClient.ts`
- `docs/PROJECT.md`, `DECISIONS.md`, `WORKLOG.md`

### Keyingi qadam

Routing (react-router) yoki birinchi UI layout / mock ekranlar.

---

## 2026-08-10 — Mahsulot talabi: prava o‘quv tizimi

### Nima qilindi

- Foydalanuvchi ta’rifini hujjatga tushirdik
- `PROJECT.md` — maqsad, rollar, modullar, MVP belgisi
- `DOMAIN.md` — entitylar, keldi–ketdi vs davomat, test/imtihon
- `DECISIONS.md` — ADR-003
- `INDEX.md` — DOMAIN qo‘shildi

### Nima uchun

Loyiha: o‘quvchilarni prava olishgacha keldi–ketdi, test, davomat, imtihonga tayyorlashni tizimlashtirish.

### Tahlil

| Jihat | Xulosa |
|-------|--------|
| Mahsulot turi | Operatsion LMS + davomat (haydovchilik maktabi) |
| Asosiy qiymat | Jarayonni bitta joyda kuzatish (davomat + test + tayyorgarlik) |
| Murakkablik | Rollar, real vaqt keldi–ketdi, savol banki — bosqichma-bosqich |
| Xavf | Hamma modulni birdan qilish → chalkashlik |
| Yondashuv | Avval domen + mock UI, keyin backend |

### O‘zgargan fayllar

- `docs/PROJECT.md`, `DOMAIN.md`, `DECISIONS.md`, `INDEX.md`, `WORKLOG.md`

### Keyingi qadam

1. Foydalanuvchidan 2–3 tanlov: keldi–ketdi usuli, test manbai, backend
2. Yoki darrov: papka tuzilmasi + routing + birinchi ekranlar (dashboard mock)

---

## 2026-08-10 — Hujjatlashtirish tizimi yaratildi

### Nima qilindi

- `.cursor/rules/project-docs.mdc` — agent har ishdan keyin `docs/` ni yangilashi shart
- `docs/INDEX.md` — xarita
- `docs/PROJECT.md` — hozirgi holat (Vite starter, talab yo‘q)
- `docs/DECISIONS.md` — ADR-001 (stack), ADR-002 (docs)
- `docs/WORKLOG.md` — shu jurnal

### Nima uchun

Foydalanuvchi: o‘zim uchun dokumentatsiya yaratay, har ishni tahlil qilib yozib boray — keyin eski ma’lumot asosida yangi ish oson bo‘lsin.

### Tahlil

| Jihat | Xulosa |
|-------|--------|
| Holat | Kod hali template; biznes maqsad noma’lum |
| Xavf | Hujjatsiz katta o‘zgarishlar → kontekst yo‘qoladi |
| Yechim | Doimiy rule + 3 asosiy fayl (PROJECT / WORKLOG / DECISIONS) |
| Yetarli emas | Mahsulot talabi, dizayn, backend — hali yo‘q |

### O‘zgargan fayllar

- `.cursor/rules/project-docs.mdc` (yangi)
- `docs/INDEX.md`, `PROJECT.md`, `DECISIONS.md`, `WORKLOG.md` (yangi)

### Keyingi qadam

Foydalanuvchidan mahsulot ta’rifini olish (nima, kim uchun, MVP), keyin `PROJECT.md` ni to‘ldirish va birinchi real ekran / arxitekturani rejalash.
