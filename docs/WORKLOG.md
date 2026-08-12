# Ishlar jurnali (WORKLOG)

Yangi yozuv **yuqoriga**. Har yozuvda: nima → nima uchun → tahlil → keyingi.

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
