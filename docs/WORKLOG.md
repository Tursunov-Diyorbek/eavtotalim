# Ishlar jurnali (WORKLOG)

Yangi yozuv **yuqoriga**. Har yozuvda: nima → nima uchun → tahlil → keyingi.

---

## 2026-10-05 — Shaxsiy varaqa: pastki bo‘shliq

- **Sabab:** birinchi list pastida katta bo‘shliq ochilib, imzo va QR keyingi varaqqa tushardi.
- **Nima:** cho‘zish olib tashlandi. Jadval va pastki qism orasi 4mm, hammasi birinchi listda.

---

## 2026-10-05 — Shaxsiy varaqa: birinchi list to‘ldirish

- **Sabab:** chop etishda birinchi varaq tepada siqilgan, pastida bo‘sh joy qolgan, QR lar ko‘rinmay qolgan.
- **Nima:** birinchi list balandligi varaqqa cho‘ziladi, imzo va QR pastga tushadi. QR o‘lchami chop etishda qat’iy.

---

## 2026-10-05 — Imtihon varaqasi: chop etish yuqori joyi

- **Sabab:** keyingi list chop etishda yuqoriga yopishib chiqardi.
- **Nima:** chop etishda imtihon varaqasi boshida 12mm padding.

---

## 2026-10-05 — Imtihon varaqasi: qatorlar chapda

- **Sabab:** xatolik matni va tartib raqami katak markazida turardi.
- **Nima:** jadval qatorlari chapga. Sarlavha, bosqich natijasi va ball ustuni o‘rtada.

---

## 2026-10-05 — Shaxsiy varaqa: sana formati

- **Sabab:** sanalar `yyyy-mm-dd` chiqardi.
- **Nima:** shaxsiy varaqa va keyingi imtihon varaqasidagi sanalar `dd.mm.yyyy`.

---

## 2026-10-05 — Imtihon varaqasi: yopishgan matnlar

- **Sabab:** toifa, guruh, sana va pasport qatorlari bir-biriga yopishib chiqardi.
- **Nima:** har bir maydon alohida, orasida 18px bo‘shliq, sig‘masa keyingi qatorga tushadi.

---

## 2026-10-05 — Shaxsiy varaqa: keyingi list imtihon varaqasi

- **Sabab:** eski `PersonalSheet.jsx` da shaxsiy varaqadan keyin alohida listda «Avtomabil boshqarish bo‘yicha imtihon: VARAQASI» chiqadi. Yangisida bu qism yo‘q edi.
- **Nima:** har bir o‘quvchi varaqasi tagida `page-break-before` bilan jarima ballari jadvali: I va II bosqich, natijalar, YHQ / amaliy imzo va o‘quvchi QR. Matn eski koddan.

---

## 2026-10-05 — Shaxsiy varaqa: jadvaldan keyingi qism

- **Nima:** guvohnoma jadvalidan keyin eski tartib: komissiya raisi va imzo bir qatorda, ostida sana va M.O', eslatma to‘liq qator, PrepDrive yozuvi QR ning chapida.

---

## 2026-10-05 — Shaxsiy varaqa: jadval qatorlari

- **Sabab:** imtihon va guvohnoma jadvallarida bo‘sh kataklar kam edi.
- **Nima:** Nazariy 4 qator, Amaliy 3 qator, guvohnoma jadvali 4 qator.

---

## 2026-10-05 — Shaxsiy varaqa: rasm matn balandligida

- **Sabab:** rasm yonidagi F.I.Sh blokidan kichik edi.
- **Nima:** rasm qizil ramka o‘lchamida — 166×144. Direktor imzosi yonida faqat M.O‘.

---

## 2026-10-05 — Shaxsiy varaqa: imtihon varaqasi

- **Sabab:** yangi sahifa oddiy matn ro‘yxati edi. Eski ko‘rinish — haydovchining shaxsiy imtihon varaqasi.
- **Nima:** `PersonalSheetBody` — rasm shaxsiy varaqa va amaliy varaqadagi rasm bilan bir xil (64×80), toifa jadvali, imtihon natijalari. Chop etish shrifti kichikroq, matn tekis. `PracticalSheetBody` — amaliy mashq varaqasi: ikki bosqich, reja soati, sana/baho ustunlari, QR.

---

## 2026-10-05 — Yo‘llanma: ikkitasi bitta varaqda

- **Sabab:** har bir yo‘llanma alohida varaq edi.
- **Nima:** chop etishda juftlikdan keyin sahifa uziladi. Shrift 10px, jadval qatorlari 13px, QR 52px o‘ng pastda. Bitta yo‘llanma varaq o‘rtasida uzilmaydi.

---

## 2026-10-05 — Yo‘llanma: QR va chop etish

- **Sabab:** QR chap pastda edi. Chop etishda `break-inside: avoid` har bir yo‘llanmani ikki varaqqa bo‘lib, 24 varaq chiqarardi.
- **Nima:** QR jadval ostida, o‘ng pastki burchakda. Har bir o‘quvchi bitta varaq. Keyingi varaqlar tepasida 8mm joy — `body` padding faqat birinchi sahifada qolardi.

---

## 2026-10-05 — Ro‘yxatga olish arizasi: to‘rt tomon padding

- **Sabab:** hujjat kontent chetiga yopishib turardi.
- **Nima:** `.group-registration-print` ga `padding: 24px` — yuqori, o‘ng, past, chap.

---

## 2026-10-05 — Ro‘yxatga olish arizasi: to‘liq kenglik

- **Sabab:** hujjat 190mm tor ustunda qolgan, sahifa bo‘sh edi.
- **Nima:** `.group-registration-print` `width: 100%`. Yorliq qiymat yonida qoladi.

---

## 2026-10-05 — Ro‘yxatga olish arizasi: joylashuv

- **Sabab:** yorliqlar sahifa chapida, qiymatlar o‘rtada qolib ketgandi. INN o‘ng chetga surilgandi.
- **Nima:** hujjat 190mm qog‘oz kengligida. Guruh va INN chapda, ustma-ust. Jadval yorlig‘i qiymat yonida. Amaliy karta yana ikki ustun, avtomobil o‘ngda.

---

## 2026-10-05 — Ro‘yxatga olish arizasi: chop etish

- **Sabab:** guruhni ro‘yxatga olish arizasi chop etilganda oxirgi karta varaqdan chiqib ketardi, oraliqlar keng edi.
- **Nima:** shrift 11px, qatorlar zich. Guruh va INN bir qatorda. Amaliy o‘qituvchi kartasi ikki ustun. Kartalar sahifa o‘rtasida uzilmaydi.

---

## 2026-10-05 — Shartnoma: 2-varaq tepasi

- **Sabab:** chop etishda ikkinchi varaq matni qog‘ozning yuqori chetiga yopishib qolardi. `body` padding faqat birinchi varaqda ishlaydi.
- **Nima:** har bir shartnoma jadvalining `thead` qatori chop etishda 8mm va har bir varaq tepasida takrorlanadi.

---

## 2026-10-05 — Shartnoma: chop etish bitta varaq

- **Sabab:** chop etishda shartnoma 4-bo‘limdan keyin ikkinchi varaqqa tushardi. 6-bo‘lim alohida sahifadan boshlanardi.
- **Nima:** chop etish shrifti 9.5px, qator oralig‘i zich, majburiy sahifa uzilishi olib tashlandi. Baribir sig‘masa har bir o‘quvchi varag‘i A4 ga `zoom` bilan sig‘diriladi. O‘lchov: A4 da balandlik ~1013px, varaq ~1092px.

---

## 2026-10-05 — Hujjatlar: Lottie ramkasi kichikroq

- **Sabab:** belgilar qatorda haddan tashqari katta chiqardi.
- **Nima:** har bir hujjat 32px `rounded-lg` ramkada (`border-mist`), ichidagi Lottie 22px. `DOC_SCALE` saqlangan — chizmalar bir xil o‘lchamda.

---

## 2026-10-05 — Hujjatlar: Lottie o‘lchami bir xil

- **Sabab:** katak 40px bo‘lsa ham chizma ichki bo‘sh joyi tufayli har xil kattada ko‘rinardi.
- **Nima:** har tur uchun `DOC_SCALE` — to‘liq kadrdagi belgi bir xil ~35px. Havola `overflow-hidden`.

---

## 2026-10-05 — Hujjatlar: har turga Lottie

- **Sabab:** jadvaldagi barcha hujjatlar bir xil printer belgisi edi. Ikonka o‘rniga mos animatsiya kerak edi.
- **Nima:** 12 ta kichik Lottie (Lottie Simple License) `src/assets/lottie/docs/` da. `DocumentsPage` katakdagi havola ichida `LottiePlayer` (40px): ariza, imzo, clipboard, papka, chipta, guvohnoma, profil, bank, kitob, mashina, belgi, ogohlantirish. Umumiy `lottieAnimations` ga qo‘shilmagan.

---

## 2026-10-05 — To‘lov cheki: yangi ko‘rinish

- **Sabab:** chek ixcham qatorlar edi. Kerakli ko‘rinish: tashkilot, №, sana/vaqt, o‘quvchi/guruh, to‘lov turi/kassir, yashil summa, QR va pastki izoh.
- **Nima:** `CheckBody` shu tartibda. `createdAt` va `cashier` chekka uzatiladi. Tugmalar: «Bekor qilish», «Chekni chop etish». Chop etish `printElement` orqali, chek varaq yuqorisida.

---

## 2026-10-05 — Pul qaytarish: o‘quvchi bosilsa to‘lov modali

- **Sabab:** Chetlashtirish ro‘yxatidagi F.I.Sh o‘quvchi sahifasiga olib ketardi. To‘lovlar tarixidagi modal ochilishi kerak edi.
- **Nima:** `RefundPage` ism tugmasi `StudentPaymentDetailModal` ni `student.id` bilan ochadi. Guruh havolasi o‘zgarmagan.

---

## 2026-10-05 — Qarzdorlar: F.I.Sh bosilmaydi

- **Sabab:** ro‘yxatdagi o‘quvchi ismi to‘lov sahifasiga olib ketardi. Bosish shart emas.
- **Nima:** `DebtorsPage` dagi `Link` va `paymentStudentPath` olib tashlandi. Ism oddiy matn.

---

## 2026-10-05 — Qarzdorlar: shartnomasiz holat (Lottie)

- **Sabab:** shartnoma tasdiqlanmaganda sahifa sariq ogohlantirish matnini ko‘rsatardi. Zamonaviy, tushunarli aloqa ekrani kerak edi.
- **Nima:** `NoAgreementGate` sahifa bo‘sh joyini to‘ldiradi. Chapda katta `fillingDocument` Lottie (420px), o‘ngda yirik sarlavha va to‘liq kenglikdagi telefon (`TARIFF_PHONE`) hamda Telegram (`@avtointalim`) kartalari. Jadval va filterlar shartnoma bor bo‘lsa o‘zgarmagan.
- **i18n:** `debtorsPage.noAgreementBadge|noAgreementTitle|callLabel|telegramLabel` (uz / kiril / ru).

---

## 2026-10-02 — Kabinetga kirganda animatsiyali bildirishnoma

- **Sabab:** direktor kabinetiga kirganda qo‘ng‘iroqcha yonida yangi xabar darhol ko‘rinishi va eshitilishi kerak edi.
- **Nima:** `NotificationsMenu` o‘qilmagan bildirishnomani (yangi ariza bo‘lsa — uni) qo‘ng‘iroqcha ostida suzuvchi kartada chiqaradi. Chapda `smsConfirmation` Lottie (xat tushishi). Matn, yopish, 8 soniyalik chiziq. Bir nechta bo‘lsa birinchisi + «Yana N ta». Bosish ariza sahifasiga yoki xabar modaliga olib boradi. Ro‘yxat ochilsa karta yopiladi.
- **Ovoz:** `src/lib/notificationChime.ts` — xabar ohangi (wav). Login bosilganda audio ochiladi, bildirishnoma bilan birga chaladi.
- **Ko‘rinish:** karta `bg-white/10`. Animatsiya — `newMessage` (`src/assets/lottie/new-message.json`): Kenyang Bersama Studio, Lottie Simple License, https://lottiefiles.com/free-animation/new-message-notification-BoatheccpQ (telefon + xat, «1» belgisi).
- **Ovoz:** `public/sounds/message.wav` — mayin F-major akkord, notalar bir vaqtda (`scripts/generate-message-sound.mjs`). Bildirishnoma chiqqanda shu fayl chaladi. Login bosilganda ovoz kanali ochiladi.
- **Ovoz:** sichqoncha bosilishiga bog‘lanmaydi. Bildirishnoma chiqqanda o‘zi chaladi. Sahifa yangilansa va brauzer ovozni yopgan bo‘lsa, login paytida bildirishnoma ruxsati so‘raladi — ruxsatdan keyin ovoz yana o‘zi keladi.
- **Takror:** har kirishda (sahifa yangilanganda) o‘qilmagan xabar bo‘lsa karta qoladi, o‘zi 8 soniyada yopilmaydi. Qo‘ng‘iroqcha ro‘yxatining tepasida ham shu karta.
- **i18n:** `topbar.moreNotifications` (uz / kiril / ru).

---

## 2026-09-29 — To‘lovlar hisoboti: «Yillik hisobot» tabi eskisidek

- **Sabab:** tab v1 `/year-report/index` ni chaqirardi — «Network Error», jadval bo‘sh.
- **Nima:** eski `YearReportIndex` (`GET v2 /accounting-yearly-reports/index?year=`). `fetchAccountingYearlyReport`; qatorlar eski `yearlyReportHelpers` maydonlari (`group_name`, `students_count`, `education_price`, `total_expected`, `total_paid`, `uzcard_amount`, `humo_amount`, `cash_amount`, `bank_amount`, `returned_amount`, `debt`, `teacher_name`). Ro‘yxat `groups` / `data` / `items` / `table` dan.
- **Yil:** «dan» sanasining yili (eskidagi `start_date` kabi). «gacha» faqat ko‘rinish — eski API ham uni yubormagan.
- **Jadval:** №, Guruh, O‘quvchilar soni, Ta’lim narxi, Jami to‘lanadigan, To‘langan, UZCARD, HUMO, Naqd, O‘tkazma, Qaytarilgan, Qarzdor (>0 qizil), O‘qituvchi. Qidiruv guruh va o‘qituvchi bo‘yicha shu ro‘yxat ichida. Sahifalash mijozda.
- **Eksport:** `yillik-hisobot-{yil}.xls` (qidiruvdan keyingi qatorlar).
- **i18n:** `paymentHistoryPage.yrGroup|yrPayable|yrTransfer`.

---

## 2026-09-29 — O‘quvchi to‘lov tafsiloti modali (bonus + yangi to‘lov)

- **Nima:** «O‘quvchilar to‘lovlari» tabida F.I.SH bosilganda eski `StudentPaymentDetailModal` kabi modal (`src/pages/payment-history/StudentPaymentDetailModal.tsx`):
  - Sarlavha: F.I.SH, «Guruh: … · Ta’lim toifasi: …».
  - 4 karta: Umumiy narx (fog), To‘langan (teal), Qoldiq qarz (rose), Bonus (amber + izoh, «+» tugma).
  - Progress (≥100% teal, aks holda rose) + «N% to‘langan» (`paid_percent_label` mos kelsa shu).
  - «To‘lovlar tarixi» jadvali: Sana, Summa, Usul, Kim kiritdi, Chek (`PrintCheckModal` qayta ishlatildi).
  - Footer: Yopish · Bonus qo‘shish · + Yangi to‘lov qo‘shish.
- **Tekshiruvlar (eskidagidek):**
  - Bonus tugmalari faqat `moliya.payment.bonus.add` ruxsati bor **va** joriy bonus 0 bo‘lsa.
  - Bonus: faqat raqam, maksimal 500 000 (kiritishda clamp), majburiy; izoh majburiy, ≤255 belgi.
  - Yangi to‘lov: `moliya.payment.add`; summa (>0), to‘lov usuli (`pay_types` yoki `PAYMENT_TYPES`), sana (default bugun, kelajak emas) majburiy.
- **API (v2):** `fetchAccountingPaymentShow` (`GET /accounting-payments/show/:id`, eski `unwrapPaymentShow`), `storeAccountingPayment` (`POST /accounting-payments/store` — `student_id`, `pay_type_id`, `amount`, `payment_date` YYYY-MM-DD), `setAccountingPaymentBonus` (`POST /accounting-payments/set-bonus` — `student_id`, `bonus`, `bonus_description`). Mutatsiyalar `paymentHistory.all` ni invalidate qiladi (ro‘yxat + modal yangilanadi).
- **Shared UI:** `Button` ga `variant="link"` + `size="inline"` (jadvaldagi havola-tugma); `shared-ui.mdc` yangilandi.
- **i18n:** `paymentHistoryPage.pd*`.

---

## 2026-09-29 — To‘lovlar hisoboti: «O‘quvchilar to‘lovlari» tabi eskisidek

- **Nima:** students tab eski `PaymentStudents` (`eavtotalim_front/src/pages/Accountant/PaymentStudents/index.jsx`, tab rejimi) kabi:
  - API: `fetchStudentPaymentsIndex` endi `GET v2 /accounting-payments/index` (`student_search`, `group_id`, `payment_status`, `start_date`, `end_date`, `page`, `show_count`); v1 `/payments-index` olib tashlandi. Qatorlar `StudentPaymentListRow` ga normallashtiriladi (eski `paymentHelpers`: `getStudentName`, `getGroupName`, `total_course_price`, `debt`, `total_paid|paid_amount|summa`, `bonus|bonus_amount`, bonus izohi, `last_payment_date`, `getStatusMeta`).
  - Guruh filtri: `fetchStudentPaymentGroups` → `GET v2 /accounting-payments/filter-groups` (lazy, `useOpenedOnce`); hook `useStudentPaymentGroupsQuery`.
  - Filter qatori (jadval ustida): Barcha guruhlar, Holati (To‘langan / Qisman / Qarzdor → `paid|partial|debt`), Dan / Gacha (`DateInput`). Holatlar `usePageState` (`psGroup`, `psStatus`, `psFrom`, `psTo`).
  - Jadval: №, F.I.SH (havola `paymentStudentPath(studentId)`), Guruh, Umumiy narx, Qarz (>0 qizil), To‘langan, Bonus, Bonus izohi (truncate), Sana, Holati (`Badge` teal/amber/rose).
  - Header: «Ism yoki F.I.SH bo‘yicha qidirish» + «Qo‘shish».
- **i18n:** `paymentHistoryPage.ps*`.
- **TODO:** eskisida F.I.SH bosilganda `StudentPaymentDetailModal` (`accounting-payments/show/:id`, bonus, to‘lov qo‘shish) ochilardi — hozir mavjud `paymentStudentPath` sahifasiga o‘tadi.

---

## 2026-09-29 — To‘lovlar hisoboti: «Guruh hisoboti» tabi eskisidek

- **Nima:** group tab eski `GroupReports` (`eavtotalim_front/src/pages/Accountant/GroupReports`) kabi:
  - API: `fetchAccountingGroupReport({page, showCount, search})` → `GET v2 /accounting-group-reports/index?page=&show_count=&group_search=`; qatorlar eski `groupReportHelpers` bo‘yicha `GroupShareRow` ga (`fully_paid` / `partially_paid` / `unpaid` → `count`, `percent`, `label`; `students_count` va muqobil kalitlar). Eski v1 `/get-general-groups-report` (`fetchGroupPaymentReport`) o‘chirildi; `useGroupPaymentReportQuery` endi v2 ni chaqiradi.
  - Jadval: №, Guruh nomi (havola `groupPaymentsPath`), O‘quvchilar soni, 100% to‘lagan (teal), Qisman to‘lagan (amber), Umuman to‘lamagan (rose), Taqsimot (`DistributionBar` — teal/amber/rose chiziq). Ustida info `Notification` (guruh nomiga bosish maslahati).
  - Qidiruv: «Guruh nomi bo‘yicha qidirish» (`group_search`).
  - Eksport: `fetchAllAccountingGroupReport` (100 tadan, ≤50 sahifa) → `guruh-hisoboti.xls`; bo‘sh bo‘lsa `notify.warning`, xato `notify.error`.
- **Shared UI:** `ExportButton` ga `loading` prop.
- **i18n:** `paymentHistoryPage.grp*` (uz/kiril/ru).
- **TODO:** eski `/group-details/:id` (GroupDetails, `accounting-group-reports/show`) sahifasi yangi loyihada alohida yo‘q — hozir havola mavjud `GroupPaymentsPage` ga.

---

## 2026-09-29 — To‘lovlar hisoboti: «Tashkilot umumiy hisoboti» tabi eskisidek

- **Nima:** org tab endi eski `OrganizationReports` (`eavtotalim_front/src/pages/Accountant/OrganizationReports`) kabi:
  - API: `fetchAccountingGeneralReport(year)` → `GET v2 /accounting-general-reports/index?year=` (`src/api/payment-history.ts`). Normalizatsiya eski `unwrapGeneralReport` bo‘yicha: `cards.total_income|total_expense|net_profit|yearly_net_profit` (`amount|total|value`, `label|title`, `sub_label|subtitle|description`, `is_grow`), `monthly_table` (`cash`, `card`, `bank`, `total_income`, `total_expense`, `net_profit`, `month_name`), `dynamics_chart` (`income`, `expense`). Kelajakdagi bo‘sh oy → «—».
  - Tiplar: `GeneralReport`, `GeneralReportCard`, `GeneralReportMonth` (`types/payment-history.ts`); key `paymentHistory.generalReport(year)`; hook `useAccountingGeneralReportQuery`.
  - UI: `src/pages/payment-history/OrgGeneralReport.tsx` — 4 karta (chap chegara: indigo / amber / teal / violet; ↑/↓ subtekst), «Kirim va chiqim dinamikasi (yil)» ustunli grafik (kutubxonasiz, `bg-indigo`/`bg-amber`), oylik jadval (Oy, Naqd, Plastik karta, Bank o‘tkazmasi, Jami kirim, Jami chiqim, Sof foyda). Loading — skeleton.
  - Header: yil `Select` (`usePageState('reportYear')`, joriy yil − 6) + `ExportButton` → `tashkilot-umumiy-hisobot-{yil}.xls`. Org tabida `Pagination` yo‘q.
  - Eski `/get-report-groups` jadvali org tabidan olib tashlandi (`useOrgPaymentReportQuery` hook qoldi, sahifada ishlatilmaydi).
- **Qo‘shimcha:** `groups` `useMemo` ga o‘raldi (exhaustive-deps ogohlantirishi).
- **i18n:** `paymentHistoryPage.gr*` (uz/kiril/ru).
- **TODO:** backend javob shakli brauzerda tekshirilmagan (auth sessiya yo‘q); karta `label` bo‘sh kelsa frontend fallback matni ishlatiladi.

---

## 2026-09-29 — To‘lovlar hisoboti: «groups is not defined» (sahifa yiqilardi)

- **Sabab:** `PaymentHistoryPage.tsx` da `groupOptions` `groups` ni ishlatardi, lekin `usePaymentGroupsQuery` chaqiruvi sahifadan tushib qolgan (oldingi filter refaktorida) → `ReferenceError`.
- **Nima:** `useOpenedOnce(Boolean(groupName))` + `usePaymentGroupsQuery(groupsEnabled && tab === 'history')`; guruh `Select` ga `onOpen` va `loading` — optionlar faqat dropdown ochilganda so‘raladi.
- **Tekshiruv:** butun loyihada `TS2304/TS2552` (aniqlanmagan nom) qolmadi.

---

## 2026-09-29 — Avtodrom shartnomasi: kameralar holati faqat tasdiqlangan shartnomalar uchun

- **Sabab:** eski `pages/Autodrome/agreement/index.jsx` — `approvedAgreements` = `organization_autodrome_agreement_status.id === 2`, keyin takrorlanmas avtodromlar. Yangi `AutodromeAgreementPage` barcha shartnomalar (kutilayotgan, bekor qilingan, to‘xtatilgan) avtodromlarini `AgreementCamerasPanel` ga berardi.
- **Nima:** `autodromes` memo da `statusId(row) !== 2` bo‘lsa o‘tkazib yuboriladi. Tasdiqlangani yo‘q bo‘lsa panel chiqmaydi (eski kabi).
- **Ochiq:** eski blokda `sync_status` («Ma'lumot hali yig'ilmagan» / «Oxirgi yangilash xato bilan tugagan») va `synced_at` ko‘rsatilardi — yangi `fetchAgreementCameras` faqat ro‘yxatni qaytaradi, meta yo‘q (TODO).

---

## 2026-09-29 — Jadval: sticky ustunlar sarlavha ustiga chiqib ketardi (global)

- **Sabab:** `THead` `z-10` + `bg-fog/95` (yarim shaffof); body sticky kataklar ham `z-10` → scroll qilganda o‘quvchi qatorlari sarlavha ustida ko‘rinardi. «№» ustuni torayib, `left-10` dagi F.I.O bilan orada tirqish qolardi.
- **Nima:** `Table.tsx` — `THead` `z-30 bg-fog` (shaffofsiz), `TablePagingLoader` `z-40` (sarlavhadan ham yuqori). `PracticalAttendanceStudentsPage` — «№» `w-10 min-w-10 max-w-10 px-0`, F.I.O ga `border-r`.
- **Qoida:** sticky chap ustunlar doim qat’iy kenglik (`w-* min-w-* max-w-*`), keyingi ustun `left-*` shu kenglikka teng.

---

## 2026-09-29 — Amaliy davomat: sarlavha 2-qatori oq bo‘lib ajralib qolgan edi

- **Sabab:** `THead` 2-qator `TR` ni avtomatik `filter` variant (`bg-white`) qiladi; `PracticalAttendancePage` da 2-qator filter emas, «Amaliy qatnashuv» ostidagi sub-sarlavhalar edi.
- **Nima:** ikkala qator `HeaderTR` ga o‘tkazildi — fon bir xil `bg-fog`.
- **Eslatma:** guruhlangan (colSpan) sarlavhaning ichki qatori doim `HeaderTR`; `FilterTR` faqat ustun filtrlari uchun.

---

## 2026-09-29 — «Kameraga ulangan» → Avtodrom o‘quvchilari ro‘yxati sahifasi

- **Nima:** yangi sahifa `/autodrome-organization-students-list/:id` (`AutodromeConnectedStudentsPage.tsx`) — eski `AutodromeOrganizationStudentsList` analogi. Guruhlar jadvalidagi «Kameraga ulangan» ustunida son > 0 bo‘lsa «Ko‘rish» tugmasi (`autodromeConnectedStudentsPath`). Access — `PAGE_ACCESS.autodromeOrganizationGroup`.
- **UI:** tepada Guruh / Tashkilot / Avtodrom info kartalari; jadval: №, rasm (bosilsa katta preview), F.I.O (+ `TableSearch`, `usePageState('word')`), pasport (mono Badge), amallar (ikon tugma + Tooltip). Default 24 ta/sahifa (eski kabi), `Pagination`.
- **Amallar (permission bo‘yicha, eski kabi):** `update-image-autodrome-organization-student` → «Rasm o‘zgartirish» (joriy/yangi rasm yonma-yon modal, file picker) va «Asl rasmni qaytarish» (`ConfirmDialog`); `resend-autodrome-organization-student` → «Qayta jo‘natish» (`ConfirmDialog`).
- **API (`src/api/autodrome-attendance.ts`):** `GET v2 /autodrome-organization-students/list?group_id&word&page&show_count`; `POST .../update-image/:id` (FormData `image`, `token`); `POST .../return-real-image/:id`; `POST .../resend-autodrome-organization-student/:id` (`resendAutodromeOrganizationStudent` — `students.ts` dagi `resendAutodromeStudent` bilan adashtirmaslik uchun). Hooklar: `useAutodromeOrganizationStudentsQuery` + 3 mutation (`queryKeys.autodromeAttendance.connected` invalidate).
- **i18n:** `autodromeAttendancePage.connectedTitle`, `groupId`, `organization`, `photo`, `passport`, `noConnected`, `changeImage`, `returnImage`, `resend`, `imageChanged`, `imageReturned`, `resent`, `currentImage`, `newImage`, `chooseImage`, `chooseImageHint` (uz/kiril/ru).
- **TODO:** javob maydonlari (`image`, `passport`, `group`, `organization`, `autodrome`) eski koddan olingan — brauzerda tasdiqlanmagan.

---

## 2026-09-29 — Avtodrom guruh o‘quvchilari davomati: zamonaviy dizayn

- **Sahifa:** `/autodrome-organization-students/:id` (`AutodromeAttendanceStudentsPage.tsx`).
- **Nima:** tepada 4 ta stat karta (o‘quvchilar, davomat kunlari, jami tashriflar, o‘rtacha davomat %); legenda (Keldi/Ketdi, katakni bosing). Sana sarlavhasi: hafta kuni + kun raqami, dam olish kunlari `rose-soft`, bugun `signal-soft`. FIO ustuni: initsial avatar + truncate nom + qatnashish progress bar (`n/jami`). Katak — bosiladigan ixcham chip (LogIn/LogOut ikon, `HH:MM`, to‘liq vaqt `title` da); alohida «Tarixi» tugmasi olib tashlandi; bo‘sh kun — kulrang nuqta. Tarix modali: sana/keldi/ketdi Badge + rasm + timeline.
- **Holat:** oy/yil/qidiruv `usePageState` ga o‘tdi (refresh/orqaga saqlanadi).
- **i18n:** `autodromeAttendancePage.stat*`, `attendedDays`, `clickHint`, `noHistory`, `weekday1..7` (uz/kiril/ru).
- **Tuzatish:** body sticky kataklar (`z-10`) sticky `thead` (`z-10`) ustiga chiqardi → `THead className="z-30 bg-fog"`, sana TH lari shaffof emas. «№» ustuni torayib F.I.SH (`left-12`) bilan orada tirqish qolardi → `w-12 min-w-12 max-w-12 px-0`. Backend sanasi `DD.MM.YYYY` — `parseDay` ISO va DMY ni tushunadi (hafta kuni/bugun chiqadi).

---

## 2026-09-29 — Avtodrom filtri tanlanganda «Validation failed»

- **Sabab (ehtimoliy):** klient fallback `show_count=1000` bilan so‘rardi — backend validatsiyadan o‘tkazmadi.
- **Nima:** `fetchAutodromeOrganizationGroups` — keng so‘rov 100 tadan, ko‘pi bilan 10 sahifa; xato bo‘lsa birinchi javob klientda filtrlanadi. Birinchi so‘rov `word` bilan xato bersa — `word` siz qayta so‘raladi va klientda filtrlanadi. Sahifa xato ko‘rsatmaydi.
- **TODO:** backend `word` ni avtodrom INN bo‘yicha qo‘llashi tasdiqlanmagan.

---

## 2026-09-29 — Avtodrom filtri nom bo‘yicha qidirmasdi: `OrganizationSelect source="autodromes"`

- **Sabab:** `GET v2 /organizations/list` faqat avtomaktablarni qaytaradi — avtodrom nomi topilmasdi. Eski `AutodromeOrganizationGroupDirectors` da `OrganizationFilterC` «Avtomaktab» ustunida, avtodrom esa oddiy `Input`; ikkalasi ham `word` parametri bilan yuborilgan.
- **Nima:** `fetchAutodromesList(search)` — `GET v2 /autodromes/list?search=&limit=10` (eski `autodromeFilterApi`), `queryKeys.organizations.autodromes`. `OrganizationSelect` ga `source: 'organizations' | 'autodromes'`. INN bo‘lmasa option qiymati nom.
- **API:** `/autodrome-organization-groups/list` ga tanlangan qiymat `word` bilan (eski kabi); taxminiy `autodrome_inn`/`organization_inn`/`inn` olib tashlandi. Klient fallback: avtodrom INN yoki nomi mos qatorlar.
- **Qoida:** avtodrom filtri — `OrganizationSelect source="autodromes"`.

---

## 2026-09-29 — `OrganizationLabel stacked`: nom tepada, INN ostida

- Jadval katagida tashkilot/avtodrom endi `RegionDistrict` kabi ikki qator: nom (truncate + `title`), ostida INN (12px, `text-rose`). `AutodromeAttendancePage` da ulandi. Select optionida bir qatorli ko‘rinish qoldi (`h-9` trigger). Qoida `shared-ui.mdc` da yangilandi.

---

## 2026-09-29 — Avtodromdagi davomat: avtodrom filtri `OrganizationSelect`, INN+nom truncate

- **Nima:** `/autodrome-organization-group` sahifasida avtodrom filtri `SearchInput` o‘rniga `OrganizationSelect` (eski `OrganizationFilterC` analogi, value = INN, optionlar faqat bosilganda). Holat `usePageState('autodromeInn')`. Guruh filtri kengaytirildi (`min-w-60`, `SearchInput flex-1`; ustun `min-w-64`).
- **API:** `fetchAutodromeOrganizationGroups({ autodromeInn })` — `autodrome_inn` / `organization_inn` / `inn` yuboriladi; server filtrlamasa (bo‘sh yoki boshqa INN qaytsa) keng so‘rov (`show_count=1000`) + klient INN filtri + sahifalash.
- **UI kit:** `OrganizationLabel` (`OrganizationSelect.tsx` dan eksport) — INN qizil + « - » + nom, `truncate` + `title`. Jadval katagida ham, select optionida ham shu.
- **Qoida:** `shared-ui.mdc` — tashkilot/avtodrom filtri doim `OrganizationSelect`; katak doim `OrganizationLabel` (bitta ustun, truncate).
- **Noma’lum / TODO:** backend avtodrom INN parametrining aniq nomi tasdiqlanmagan — klient fallback bor.

---

## 2026-09-29 — Guruhlar: «Yangi guruh» tugmasi olib tashlandi

- `GroupsPage.tsx`: header dagi «Yangi guruh» tugmasi, `createOpen` holati, `canCreate` va `CreateGroupModal` ulanishi olib tashlandi (user so‘rovi). `CreateGroupModal.tsx` fayli joyida qoldi (boshqa joyda kerak bo‘lsa)

---

## 2026-09-29 — Viloyat + tuman bitta ustunda

### Nima qilindi
- Shared `RegionDistrict` (`src/components/ui/RegionDistrict.tsx`): viloyat tepada, tuman ostida kulrang (12px); bo‘sh bo‘lsa «—»
- Sarlavha `common.regionDistrict` (uz «Viloyat / Tuman», kiril, ru)
- Qo‘llandi: `AbsenceReasonPage` (Qatnashmaslik sabablari), `StudentShowTabs` (imtihon markazi), `StudentDashboardExamCenterCard`
- Qoida `shared-ui.mdc` jadvaliga qo‘shildi

### Nima uchun
User: eski loyihadagi avtodrom sahifasidagidek viloyat va tuman bitta ustunda, doim shu tartibda.

---

## 2026-09-29 — Filterlar saqlanadi (refresh / sahifa / show → orqaga)

### Nima qilindi
- `src/hooks/usePageState.ts`: `useState` o‘rnini bosuvchi hook — `sessionStorage` (`page_state:` + pathname + search + `#name`). Tab (`?tab=`) o‘zgarsa kalit o‘zgaradi va qiymat qayta o‘qiladi
- 40+ ro‘yxat sahifasida filter holati (qidiruv, FIO, select, sana, chip, draft + applied, saralash) `usePageState` ga o‘tkazildi (to‘rt parallel subagent + qo‘lda: sort holatlari AutodromeAttendance, ContentViewStudentShow, GroupExamResults)
- Lazy filter Select larda `useOpenedOnce(Boolean(value))` — tiklangan qiymat nomi darhol ko‘rinadi; `OrganizationSelect` ham shunday
- Qoida `.cursor/rules/shared-ui.mdc` («Filter va sahifa holati saqlanadi»)

### Tahlil
- Sahifa raqami / o‘lchami — `Pagination` (alohida kalit); modal/forma holati — oddiy `useState`
- Filtri yo‘q sahifalar: AutodromeAgreement, ContentViewStatistic, InfoExamResultsShow, LessonDetail (`visibleTypes` — `Set`, JSON ga mos emas), SentNotificationsTab, TemplatesTab, ReportsMonitoringShow, RoadSignsType, TemplateViewStudentShow
- `tsc` — yangi xato yo‘q (qolganlar oldindan: auth.ts, PaymentHistoryPage `groups` va h.k.)
- Brauzerda tekshirilmadi (auth sessiya yo‘q)

---

## 2026-09-29 — Filter Select: optionlar faqat bosilganda (lazy)

### Nima qilindi
- `Select`: yangi `onOpen` prop (dropdown ochilganda chaqiriladi)
- `src/hooks/useOpenedOnce.ts`: `[enabled, open]` — birinchi ochilishda `true`
- Option hooklariga `enabled` parametri: `useGroupsQuery(filters, enabled = true)`, `useDebtorFilterGroupsQuery(enabled)`, `useProblemSituationStatusesQuery(enabled)` (`useAppealTypesQuery` da bor edi)
- Lazy + dropdown skeleton: Kelganlar (guruh), Kamera davomati (guruh fallback — summary/list payloadida guruh bo‘lmasa), Sababli qoldirish ×2 (guruh), Qarzdorlar (guruh), Muammoli vaziyatlar (status), Murojaatlar ×2 (tur), `OrganizationSelect` (ichida lazy — barcha sahifalar)
- Qoida `.cursor/rules/shared-ui.mdc` ga yozildi («Filter Select — optionlar faqat bosilganda»)

### Nima uchun
User: filterdagi selectlar sahifaga kirganda emas, bosilganda so‘rov yuborsin, chiroyli loading bilan; doim shunday qilinsin.

### Tahlil / tegilmaganlar
- `PenaltiesCategoryPage` (kategoriya sarlavhada ham kerak), `SendStudentsPanel` (birinchi guruh avto-tanlanadi), side-payload optionlar (refund, info-exam, payment-create, camera statuses — qo‘shimcha so‘rov yo‘q) — o‘zgarmadi
- Modal/forma Selectlari (StudentForm, CarForm, TeacherForm…) — filter emas, o‘zgarmadi (TODO: kerak bo‘lsa)

---

## 2026-09-29 — Barcha jadvallar: sahifaga o‘tish, sahifani saqlash, Lottie loader

### Nima qilindi
- `Pagination` (`src/components/ui/Pagination.tsx`):
  - «keyingi» tugmasi yonida kichik input (`w-16`): raqam + Enter/blur → shu sahifaga o‘tadi; `1..totalPages` dan tashqari bo‘lsa o‘tmaydi, input tozalanadi
  - sahifa va o‘lcham `sessionStorage` da (`table_page:` + pathname + search [+ `#storageKey`]) — refresh va show sahifadan orqaga qaytganda tiklanadi. Tiklash `setTimeout(0)` bilan — sahifaning mount dagi `setPage(1)` effektlaridan keyin
  - saqlangan sahifa `totalPages` dan katta bo‘lsa (faqat `total > 0` bo‘lganda) oxirgi sahifaga tushadi
  - yangi proplar: `persist` (default `true`; modal/tanlash jadvallarida `false`), `storageKey` (bitta route da bir nechta pagination)
- `src/lib/tablePaging.ts`: `markTablePaging` / `usePagingLoader` store (`useSyncExternalStore`) + sessionStorage helperlar
  - Tuzatish: avval global `useIsFetching()` ga qaralardi — boshqa (fon/polling) so‘rov davom etsa loader o‘chmasdi. Endi `queryCache.subscribe` bilan faqat sahifa almashgandan **keyin boshlangan** so‘rovlar kuzatiladi, hammasi `idle` bo‘lganda o‘chadi; so‘rov boshlanmasa 400ms, himoya 15s
  - Yakuniy: `markTablePaging` olib tashlandi. Loader = biror so‘rov `fetching` va uning observeri `isPlaceholderData === true` (jadvalda eski qatorlar, yangi kalit kutilmoqda). Sahifa va filter bir xil ishlaydi; refresh (birinchi yuklash — oldingi data yo‘q) da loader chiqmaydi, fon refetch ham loadersiz. Oldingi variant refreshda guruh dropdown so‘rovi (u ham `placeholderData` li) tufayli osilib qolardi
- `Table`: foydalanuvchi sahifa/o‘lchamni almashtirsa, so‘rov (`useIsFetching`) tugaguncha jadval ustida Lottie overlay (`table-loader.json`, 84px, `bg-white/70`); CSS `.table-paging-loader` 120ms kechikish bilan fade-in (tez javobda miltillamaydi)
- `scripts/generate-table-loader-lottie.mjs` → `src/assets/lottie/table-loader.json` (brend `signal`/`teal` yoylari, pulsli markaz); `lottieAnimations.tableLoader`
- `placeholderData: keepPreviousData` — debtors, appeals, expenses (list, types), payment-history (list, org, groupReport, students, year, createList), notifications-service (list, templates), road-signs byType, my-gov-application, problem-situations, refund. Sahifa almashganda jadval skeletonga tushib ketmaydi, loader ustida ko‘rinadi
- `persist={false}`: `SentNotificationDetailModal`, `StudentImageStatsModal`, `CarPickTable`, Expenses dagi ikkita statik pagination. `storageKey`: notifications `sent`/`templates`/`send`, `StudentShowTabs` (attendance/autodrome)
- i18n `common.goToPage`, `common.goToPagePlaceholder` (uz/kiril/ru)

### Nima uchun
User: barcha jadvallarda sahifaga o‘tish inputi, refresh va show dan qaytishda sahifa saqlanishi, sahifa almashganda Lottie loading.

### Tahlil
- Hamma narsa shared `Pagination`/`Table` da — 50 ta sahifa o‘zgarishsiz oladi
- Filtrlar saqlanmaydi (faqat sahifa/o‘lcham); filter o‘zgarganda sahifalar o‘zlari `setPage(1)` qiladi va shu saqlanadi
- `tsc` / eslint dagi qolgan xatolar oldindan bor (auth.ts, PaymentHistoryPage `groups`, DirectorDashboard va h.k.), bu ish bilan bog‘liq emas
- Brauzerda ro‘yxat sahifalari tekshirilmadi — auth sessiya yo‘q (TODO: login qilib qo‘lda tekshirish)

### Keyingi
- Kerak bo‘lsa filtrlarni ham URL/sessionStorage da saqlash

---

## 2026-09-29 — Login: rasmiy (senior) dizayn

### Nima qilindi
- Multfilm sahna (`driving.json`) o‘chirildi. Yangi `src/assets/lottie/road-emblem.json` (`scripts/generate-login-lottie.mjs`): line-art perspektivali yo‘l, oqayotgan chiziqlar, yorug‘lik izlari, qalqon-emblema (kontur nuri, aylanuvchi halqalar, impuls)
- `LoginHero`: to‘q brend fon, kattaroq rasmiy sarlavha, imkoniyatlar ajratgichli 3 ustunda (chip emas)
- O‘ng tomon kartasiz: oq fon, katta sarlavha, forma `max-w-[480px]`, pastda ajratgich bilan footer
- Shared UI: `Input`/`Field` `size="lg"` (`h-12`), `Button` `size="xl"` va `icon-xl` — faqat auth formalar uchun; qolgan sahifalar `h-9` da qoladi
- Captcha: rasm + yangilash + kod bitta qatorda; xato `Notification tone="error"`
- `login.loginPlaceholder` (uz/kiril/ru)

### Nima uchun
User: dizayn multfilmga o‘xshab qolgan, rasmiy sayt uchun jiddiy, forma kattaroq va kartasiz bo‘lsin.

### Keyingi
—

---

## 2026-09-29 — Login sahifasi qayta dizayn

### Nima qilindi
- Chap panel (`LoginHero`): brend gradient + setka fon, rasmiy sarlavha, markazda Lottie (`src/assets/lottie/driving.json` — o‘quv mashinasi yo‘lda, svetofor, shahar, 12 s uzluksiz sikl), pastda imkoniyatlar (`login.features.*`)
- O‘ng panel (`LoginPage`): logo + til tanlash, oq kartada forma, pastda himoyalangan ulanish va ©
- Responsive: telefonda animatsiya tepada, forma pastda yumaloq kartada (sahifa scroll bo‘ladi); `lg` dan ikki ustun
- `globals.css` media: past balandlikdagi noutbuk (≤780 / ≤640 px), planshet, kichik telefon (≤380 px), telefon yotiq holatda animatsiya yashiriladi
- `back1.jpg` foto va `login-ken` animatsiyasi olib tashlandi

### Nima uchun
User chapda loyihaga mos Lottie, o‘ngda login formasi va barcha qurilmalarga moslashuvni so‘radi. LottieFiles sahifalari Cloudflare bilan yopiq bo‘lgani uchun animatsiya `scripts/generate-driving-lottie.mjs` orqali yaratildi (litsenziya muammosi yo‘q, brend ranglarida).

### Keyingi
- Animatsiyani o‘zgartirish: skriptni tahrirlab `node scripts/generate-driving-lottie.mjs`

---

## 2026-09-28 — Kelganlar ro‘yxati bo‘sh

### Nima qilindi
- `student.group` relation olib tashlandi — shu so‘rov ro‘yxatni bo‘shatardi
- Javob bo‘sh yoki xato bo‘lsa, `relations=["student"]` bilan qayta so‘raladi

### Nima uchun
Sahifada Jami: 0 chiqardi, o‘quvchilar ko‘rinmasdi.

### Keyingi
—

---

## 2026-09-28 — Kelganlar filtrlari

### Nima qilindi
- F.I.O, guruh va sana `Qidirish` dan keyin ro‘yxatni haqiqatan kesadi
- Server filtri e’tiborsiz qolsa, kelgan qatorlar bo‘yicha qayta filtrlanadi

### Nima uchun
`group_id` / `word` parametrlarini API qabul qilmasdi, jadval o‘zgarmasdi.

### Keyingi
—

---

## 2026-09-28 — Kelganlar sahifasi

### Nima qilindi
- `/monitoring-camera-daily-attendance`: F.I.O, guruh, sana, Qidirish, Tozalash, shu kunni qayta olish
- Jadval: №, F.I.O, guruh, tashkilot, sana, vaqt, kechikish (soniya)
- `GET v2 /monitoring-camera/index-daily-attendance`

### Nima uchun
Eski «Kelganlar» sahifasi shu ro‘yxat edi; yangida placeholder chiqardi.

### Keyingi
—

---

## 2026-09-28 — Face control buzilishi

### Nima qilindi
- `/face-control-warnings` endi alohida sahifa: №, rasm, izoh, yaratilgan/yangilangan sana
- «Ko‘rish»: ko‘rilmagan (`/unseen`), ko‘rilgan, barchasi
- Bo‘sh holat: «Ma’lumot mavjud emas»; rasm bosilsa katta ochiladi

### Nima uchun
Eski «Face control narusheniyasi» sahifasi shu jadval edi; yangida placeholder chiqardi.

### Keyingi
—

---

## 2026-09-28 — Kamera davomati: F.I.SH qidiruv

### Nima qilindi
- Qidiruv famila, ism va otasining ismi bo‘yicha kesadi (`word` / `fio` / `student_search` ham ketadi)

### Nima uchun
`word` parametri bu ro‘yxatni filtrlamagan, shuning uchun yozilgan ism jadvalda qolardi.

### Keyingi
—

---

## 2026-09-28 — Kamera davomati filtrlari

### Nima qilindi
- Guruh va holat `filters[]` (`group_id`, `status`) orqali ketadi; `word` qidiruv saqlangan

### Nima uchun
Oddiy `group_id` / `status` query parametrini bu ro‘yxat o‘qimaydi, shuning uchun tanlov jadvalni o‘zgartirmagan.

### Keyingi
—

---

## 2026-09-28 — Kamera davomati: filtr va karta

### Nima qilindi
- Guruh tanlovi `/groups` ro‘yxatidan; holatda «Hamma holatlar», Yuborilgan, Yuborilmoqda, Xato, Eski yozuv
- Statistika kartasidagi 5-raqam «Eski yozuv» (holat 8)
- Jadval holati: «Eski yozuv (#8)»; rasm bosilsa katta modal
- O‘quvchi kamera kartasida holat 8 endi «Yuborilmagan» emas

### Nima uchun
Eski sahifada guruhlar, «Hamma holatlar» va «Eski yozuv» chiqardi; yangida bu yo‘q edi.

### Keyingi
—

---

## 2026-09-28 — Kamera davomati sahifasi

### Nima qilindi
- `/camera-control-attendance` endi placeholder emas: `CameraAttendancePage`
- `GET v2 /monitoring-camera/pending-students` — guruh, holat, F.I.SH qidiruv
- Sarlavha, ogohlantirish, jami / yuborilgan / yuborilmoqda / xato / fakt yuzuvlar
- Jadval: №, rasm, F.I.SH, kamera, holati, ko‘rish

### Nima uchun
Eski «Kamera ro‘yxatdan o‘tish holati» sahifasi shu ko‘rinishda edi.

### Keyingi
—

---

## 2026-09-28 — Qo‘shimcha darslar sahifasi

### Nima qilindi
- `/extra-lessons` endi placeholder emas: `ExtraLessonsPage`
- `GET v2 /groups/with-student-class-dates` — holat, guruh nomi, sanadan–sanagacha
- Ustunlar: guruh, tashkilot (superadmin yoki `view-cross-organization-data`), ta’lim turi, sanalar, vaqt, qo‘shimcha dars qo‘yilgan o‘quvchilar soni, holati, ko‘rish
- Sarlavha yonida «Yangilash»

### Nima uchun
Eski menyu jadvali shu ko‘rinishda edi; yangi ilovada umumiy `DirectorResourcePage` chiqardi.

### Keyingi
—

---

## 2026-09-28 — Dars qoldirganlar: ustun nomi

### Nima qilindi
- `directorList.remaining`: «Qolgan darslar» → «Qoldirilgan darslar soni» (uz, kiril, ru)

### Nima uchun
Dars qoldirganlar jadvalidagi ustun nomi shunday bo‘lishi kerak.

### Keyingi
—

---

## 2026-09-28 — Ta’lim narxi: eski sahifa

### Nima qilindi
- «Qo‘shish» va modal olib tashlandi
- Jadval: foiz yashil matn, to‘liq narx `2,500,000`, amal «Tahrirlash»
- «Tahrirlash» modal ochadi; «Bekor qilish» modalni yopadi
- `POST /edu-type/prices/store-or-update` ga `short_name` ham ketadi

### Nima uchun
Eski `/tuition-fees` jadval va pastdagi forma edi; yangida modal va badge chiqardi.

### Tahlil
Jadval eski 7 ta toifa: A, B, BC, C(QT), D(QT), BE(QT), CE(QT) (`id` 2, 1, 4, 8, 5, 7, 6) va faqat narxi borlari. Narxsiz va qolgan toifalar chiqmaydi.

### Keyingi
—

---

## 2026-09-28 — Guruhlar: tartiblash sarlavhasi

### Nima qilindi
- Guruhlar headeridagi «Tartiblash» label olib tashlandi. Select placeholder va `aria-label` qoldi.

### Nima uchun
Sarlavha tanlov matnini takrorlardi.

### Keyingi
—

---

## 2026-09-28 — Guruh avtomobili: ruxsat tugmani ochadi

### Nima qilindi
- Biriktirish `attach-group-car`, o‘chirish `delete-group-car` bilan ochiladi
- Faol/tugagan guruh (`edu_status` 1/2) endi tugmani yashirmaydi; ogohlantirish shu ruxsat bor bo‘lsa qoladi

### Nima uchun
`attach-group-car` berilsa ham tugma chiqmasdi, chunki guruh holati uni yopardi.

### Keyingi
—

---

## 2026-09-28 — Guruh avtomobillari: qulf va banner

### Nima qilindi
- Faol yoki tugagan guruhda (`edu_status` 1/2) «Guruhga avtomobil biriktirish» va o‘chirish yashirinadi
- Ogohlantirish `Notification` bannerida, sarlavha yonidagi katta harflar emas
- Almashtirish shu qulfdan tashqari

### Nima uchun
Boshlangan guruhga qo‘shimcha avtomobil biriktirib yoki olib tashlab bo‘lmaydi. Matn jadval ustida siqilib turardi.

### Keyingi
—

---

## 2026-09-28 — Guruh show: tahrirlash tugmasi

### Nima qilindi
- Guruh show amallar qatoridan «Guruhni tahrirlash» olib tashlandi

### Nima uchun
Show sahifada bu tugma kerak emas.

### Keyingi
—

---

## 2026-09-28 — Guruh to‘lovlari: toifa va o‘quvchi show

### Nima qilindi
- `/groupdetails/:id` sarlavhasidagi Ta’lim toifasi `GET v2 /groups/show/:id` va v1 guruh maydonlaridan (`short_name`, `short_name_uz`, `character_name`, `edu_type_id`) olinadi
- O‘quvchi qatori bosilganda `/student/:id` show sahifasiga o‘tadi

### Nima uchun
`GET v1 /get-payments-by-group` guruhida `edu_type.short_name` bo‘sh kelardi, sarlavhada «—» chiqardi. Jadvalda o‘quvchi showga o‘tish yo‘q edi.

### Tahlil
Toifa avval to‘lov javobidan, bo‘sh bo‘lsa guruh showdan. Qator `studentPath(row.id)`.

### Keyingi
—

---

## 2026-09-24 — Guruh to‘lovlari hisoboti

### Nima qilindi
- `/groupdetails/:id` eski hisobotga yaqin: jami / 100% / qisman / to‘lamagan, taqsimot chizig‘i, qidiruv, holat, jadval, sahifalash, export

### Nima uchun
Sahifa oddiy jadval edi, guruh to‘lov holati ko‘rinmasdi.

### Keyingi
—

---

## 2026-09-24 — Guruh haqida: nom

### Nima qilindi
- To‘liq ma’lumot modalida «—» o‘rniga guruh nomi (`asLangName`)

### Nima uchun
Nom til obyektida keladi, `asText` uni o‘qimay «—» chiqarardi.

### Keyingi
—

---

## 2026-09-24 — Guruh: tugmalar va tablar ajratildi

### Nima qilindi
- «Guruhga o‘quvchilarni biriktirish» olib tashlandi
- Yuqori amallar `outline` tugma, pastki qator `line` tab

### Nima uchun
Ikki qator bir xil chip ko‘rinishida edi. Yuqorisi amal, pastkisi bo‘lim.

### Keyingi
—

---

## 2026-09-24 — Guruh nomi sarlavha yonida, menyu bir xil balandlik

### Nima qilindi
- «Guruh ma’lumoti» yonida guruh nomi
- Davomat, yangilash, YHXX va Orqaga `h-9`

### Nima uchun
Nom alohida qatorda qolib, menyu bloklari har xil balandlikda edi.

### Keyingi
—

---

## 2026-09-24 — Guruh menyusi: nom siqilmaydi

### Nima qilindi
- Guruh show sarlavhasi guruh nomi; ostida «Guruh ma’lumoti» va ta’lim turi
- Headerdagi tugmalar sarlavhani nolga siqmaydi, sig‘masa keyingi qatorga tushadi

### Nima uchun
Davomat va YHXX tugmalari sarlavhani yutib, qaysi guruh ekani ko‘rinmas edi.

### Keyingi
—

---

## 2026-09-24 — O‘quvchi sahifasi rasmlari kattalashadi

### Nima qilindi
- Profil, imtihon va ikkala kamera rasmi bosilsa modalda katta ochiladi

### Nima uchun
Guruh jadvalidagi kabi, o‘quvchi kartasidagi kichik rasmlarni ham shu sahifada ko‘rish kerak.

### Keyingi
—

---

## 2026-09-24 — Guruh o‘quvchisi rasmi kattalashadi

### Nima qilindi
- Guruh show o‘quvchilar jadvalidagi rasm bosilsa modalda katta ochiladi

### Nima uchun
Kichik rasmni ko‘rish uchun alohida sahifaga o‘tmasdan kattalashtirish kerak edi.

### Keyingi
—

---

## 2026-09-24 — Jurnal tabi so‘rovni qayta yubormaydi

### Nima qilindi
- Davomat / Baholash almashinuvi `mark-monitoring/show` ni qayta chaqirmaydi
- Ma’lumot sahifa ochilganda bir marta keladi, tab faqat jadval rejimini almashtiradi

### Nima uchun
Tab o‘zgarganda ikkinchi so‘rov kerak emas.

### Keyingi
—

---

## 2026-09-24 — Jurnal: Baholash so‘rovi va rangli tooltip

### Nima qilindi
- Baholash (va Davomatga qaytish) `POST /mark-monitoring/show` ni qayta yuboradi — query kalitida rejim
- Qatnashgan / sababsiz / ma’lumotnoma info ikonkasida eski rangli tooltip (`#50cd89`, `#f1416c`, `#f6c000`)

### Nima uchun
Eski `ElectronNotebook` har tab ochilganda shu endpointga alohida murojaat qiladi. Info ikonkasidagi matn `title` atributida qolib, rangli bubble chiqmagan.

### Keyingi
—

---

## 2026-09-24 — Mavjud: alohida jurnal sahifasi

### Nima qilindi
- «Mavjud» `/group/:id/edit-notebook` ni ochadi
- Sahifada faqat elektron jurnal: guruh amallari va boshqa tablar yo‘q

### Nima uchun
Oldin guruh kartasi ochilardi, rasmdagi jurnalda bo‘lmagan tugmalar chiqardi.

### Keyingi
—

---

## 2026-09-24 — Guruhlar: Mavjud → elektron jurnal

### Nima qilindi
- «Mavjud» `/group/:id?tab=journal` ga o‘tadi
- Jurnalda EXPORT va pastda qatnashgan / sababsiz / ma’lumotnoma izohi

### Nima uchun
Eski saytda «Mavjud» `/group/:id/edit-notebook` (elektron jurnal) ni ochardi. Yangida belgi bosilmasdi va export yo‘q edi.

### Keyingi
—

---

## 2026-09-24 — Ishtirok etgan: jami minus qoldirilgan

### Nima qilindi
- Avtomaktab davomatida ishtirok etgan = `all_classes_count - absence_count`

### Nima uchun
`ended_classes_count` 58 chiqardi; eski sayt 72 − 15 = 57 ko‘rsatadi.

### Keyingi
—

---

## 2026-09-24 — Face extension API

### Nima qilindi
- «6 kunga kameraga ruxsat berish» `POST /v2/api/students/:id/autodrome/face-extension`
- Javobdagi `message` toast da, X bosilmaguncha turadi

### Nima uchun
To‘g‘ri manzil `face-extension`; xabar «O‘quvchi kamera tizimida topilmadi» kabi keladi.

### Keyingi
—

---

## 2026-09-24 — 6 kun ruxsat: popconfirm

### Nima qilindi
- «6 kunga kameraga ruxsat berish» bosilganda Bekor / Ha tasdiqi
- Shu amalning toasti `duration: 0` — X bosilmaguncha turadi

### Nima uchun
Eski saytda Ant Popconfirm edi; xabar o‘zi yopilmasligi kerak.

### Keyingi
—

---

## 2026-09-24 — Kamera ikonkasi: faqat superadmin

### Nima qilindi
- Avtodrom kartasidagi kamera havolasi faqat superadmin da chiqadi

### Nima uchun
Davomat paneli boshqa rollarga ochilmasligi kerak.

### Keyingi
—

---

## 2026-09-24 — Avtodrom ikonlari: modal va sahifa

### Nima qilindi
- Sariq ikonka «Rasm muddati qanday ishlashi haqida» modalini ochadi
- Kamera ikonkasi `admin-attendance.nextdevteam.uz` davomat paneliga o‘tadi (`?q=` o‘quvchi id)

### Nima uchun
Eski saytda sariq belgi izoh modali, kamera belgisi esa kameralar sahifasi edi.

### Keyingi
—

---

## 2026-09-24 — Avtodrom: 6 kun ruxsat va ikonlar

### Nima qilindi
- Sarlavha yonida kamera va ogohlantirish ikonkalari, tooltip bilan
- Tugatilgan o‘quvchida «6 kunga kameraga ruxsat berish» «Kameradan tekshirish» bilan yonma-yon (`POST /students/:id/autodrome/:aosId/extend-6-days`)
- Ruxsat tugmasi bo‘lmasa tekshirish to‘liq kenglikda

### Nima uchun
Eski avtodrom kartasida shu ikonlar va tugma bor edi.

### Keyingi
`extend-6-days` manzili backend bilan mos kelmasa, haqiqiy path ga almashtirish.

---

## 2026-09-24 — Kamera tugmalari bir qatorda

### Nima qilindi
- Ikkala kartada «Kameradan tekshirish» va keyingi tugma bitta `mt-auto` blokda, kartaning pastida

### Nima uchun
Chap kartada tugmalar orasi ochilib, o‘ng bilan qatorlari mos kelmasdi.

### Keyingi
—

---

## 2026-09-24 — Kameradan tekshirish: ikki karta

### Nima qilindi
- Bitta pastki tugma olib tashlandi: Avtomaktab kartasi Bionet modalini, Avtodrom kartasi kameralar modalini ochadi
- Bionet modalidan «Yopish» footer olib tashlandi

### Nima uchun
Tugma ikki marta chiqardi; yopish uchun sarlavhadagi X yetarli.

### Keyingi
—

---

## 2026-09-24 — Avtomaktab kamerasi: alohida Bionet modali

### Nima qilindi
- Avtomaktab kamerasi kartasida «Kameradan tekshirish» — `StudentBionetCheckModal` (`GET /students/:id/camera/check-bionet`)
- Pastdagi «Kameradan tekshirish» faqat avtodrom kameralari jadvali

### Nima uchun
Bionet natijasi avtodrom kameralari bilan bitta modalda edi; eski saytda u alohida.

### Keyingi
—

---

## 2026-09-24 — O‘qituvchi va avtomobil ro‘yxati: scroll

### Nima qilindi
- `StudentGroupStaffSection`: ikkala jadval `max-h-40 overflow-y-auto`
- Qator ko‘p bo‘lsa balandlik o‘smaydi, ichida scroll

### Nima uchun
6+ qator chapdagi guruh kartasidan pastga cho‘zilardi.

### Keyingi
—

---

## 2026-09-24 — Qo‘shimcha darslar tabi ixcham

### Nima qilindi
- Sarlavha, «Davomatni qayta olish», sana chiplari va filtrlar bir qatorga siqildi
- Jadval `fill={false}`, qatorlar `py-1`, bo‘sh holat ikonkasiz

### Nima uchun
Bo‘sh jadval ekranni to‘ldirib, filtrlar ikki qatorga tushardi.

### Keyingi
—

---

## 2026-09-24 — Hujjatlar tugmalari: chop etish bo‘limi

### Nima qilindi
- O‘quvchi hujjat tugmalari `/student/:id/print/...` o‘rniga guruh hujjat sahifalariga o‘tadi
- Ariza `/pupil-application/:groupId`, shartnoma `/pagetoview/:groupId`, varaqa, yo‘llanma, amaliy varaqa — `documentPrintPath`

### Nima uchun
Alohida sodda chop sahifasi eski dizaynni buzardi. Shu hujjatlar Chop etish bo‘limida tayyor.

### Keyingi
—

---

## 2026-09-24 — Hujjatlar tabi: faqat tugmalar

### Nima qilindi
- `StudentDocumentsPanel` dan shartnoma matni va rekvizitlar olib tashlandi
- «Shartnomani chop etish» ham qolgan tugmalar kabi `/student/:id/print/contract` sahifasini ochadi

### Nima uchun
Eski sahifada Hujjatlar tabida faqat tugmalar bor edi. Bosilganda hujjat alohida sahifada chiqardi, tab ichida emas.

### Keyingi
—

---

## 2026-09-24 — Imtihon markazi tabi ixcham

### Nima qilindi
- To‘rt alohida karta bitta qatorga siqildi: jami, o‘tgan, o‘tmagan, o‘rtacha ball
- Jadval `fill={false}`, qatorlar `py-1`, bo‘sh holat ikonkasiz
- Sana va «Yangilash» sarlavha yonida, ixchamroq

### Nima uchun
Imtihon markazi bloki katta kartalar va baland bo‘sh holat bilan ekranni egallardi.

### Keyingi
—

---

## 2026-09-24 — Avtomaktab: sabablar xato qutisi

### Nima qilindi
- O‘quvchi show endi `GET /absence-reason/index-applications` ni `student_id` bilan chaqiradi
- So‘rov yiqilsa qizil «Ma’lumot yuklanmadi» o‘rniga jadval va «Ma’lumot topilmadi»

### Nima uchun
`/students/:id/absence-reason-applications` o‘quvchining o‘z profession id sini kutadi. Direktor kartasida student id yuborilganda API xato berardi.

### Keyingi
—

---

## 2026-09-24 — Avtomaktab: sabablar va to‘lov yangilash

### Nima qilindi
- Qatnashmaganlik sabablari jadvali bo‘sh bo‘lsa ham chiqadi: №, sanadan, sanagacha, sabab, izoh, holat, darslar, hujjat; «Yangilash» sarlavha yonida
- To‘lovlar sarlavhasi yoniga «Yangilash» — to‘lov va shartnoma qayta so‘raladi

### Nima uchun
Eski Avtomaktab tabida bu ikki blok jadval ustunlari bilan turardi. Yangida bo‘sh sabablar jadvalsiz, to‘lovda yangilash yo‘q edi.

### Keyingi
—

---

## 2026-09-24 — O‘quvchi show: Avtomaktab tabi ixcham

### Nima qilindi
- Avtomaktab tabi eski `StudentInfo` tartibida qoldi (davomat log, darslarga qatnashish, sabablar, to‘lov), lekin balandlik siqildi
- Davomat va to‘lov jadvallari `fill={false}`, bo‘sh holat `EmptyTR compact`
- Darslarga qatnashish: sarlavha va «Yangilash» bir qatorda, ingichka foiz, uch ko‘rsatkich bitta qatorda
- `AbsenceReasonsPanel compact` — o‘quvchi tabida jadval cho‘zilmaydi

### Nima uchun
Bo‘sh davomat jadvali ekranni to‘ldirib, pastdagi ko‘rsatkichlarni pastga surardi. Eski sahifada bu bloklar kontent balandligida, yonma-yon emas, ustma-ust ixcham turardi.

### Keyingi
—

---

## 2026-09-23 — O‘quvchi show: davomat rangi

### Nima qilindi
- Headerdagi davomat qiymati `Badge`: yo‘q yoki 70% dan past — rose, 70–89 — amber, 90+ — teal

### Nima uchun
«Mavjud emas» va past foiz oddiy matndan ajralishi kerak edi. Chegara shu sahifadagi davomat chizig‘i bilan bir xil.

### Keyingi
—

---

## 2026-09-23 — O‘quvchi show: davomat yo‘q

### Nima qilindi
- Headerdagi davomat bo‘sh bo‘lsa `—` o‘rniga `students.attendanceMissing` («mavjud emas»)

### Nima uchun
Davomat foizi kelmasa chiziq tushunarsiz edi.

### Keyingi
—

---

## 2026-09-23 — O‘quvchi show: avtomobil rasmi kattalashtirish

### Nima qilindi
- `StudentGroupStaffSection`: avtomobil rasmi bosilganda `Modal` da katta ko‘rinish
- Rasm yo‘q bo‘lsa tugma ochilmaydi

### Nima uchun
Ro‘yxatdagi rasm `size-5`, raqam va nomni tekshirish uchun kattaroq ko‘rish kerak edi. Xuddi shu usul `GroupDetailsPage` da bor.

### Keyingi
—

---

## 2026-09-23 — O‘quvchi show: ro‘yxat qatorlari ixcham

### Nima qilindi
- O‘qituvchi va avtomobil jadvallarida qator `py-1`, panel `p-2`, sarlavha `mb-1`
- Mashina rasmi `size-5`

### Nima uchun
Ustma-ust joylashuv sahifani cho‘zgan edi; balandlikni ozroq qisqartirish kerak edi.

### Keyingi
—

---

## 2026-09-23 — O‘quvchi show: o‘qituvchi va avtomobil ustma-ust

### Nima qilindi
- `StudentGroupStaffSection`: o‘qituvchilar va avtomobillar yonma-yon emas, `flex flex-col` bilan ustma-ust
- Har bir jadval o‘ng ustunning to‘liq kengligini oladi, gorizontal scroll yo‘qoladi

### Nima uchun
Yonma-yon (`lg:grid-cols-2`) joylashuvda ikkala jadval `min-w-[480px]` tufayli siqilib, ustunlar kesilgan va gorizontal scroll chiqqan.

### Keyingi
—

---

## 2026-09-23 — O‘quvchi show: o‘qituvchi va avtomobil qatori

### Nima qilindi
- O‘qituvchilar va avtomobillar yana yonma-yon (`lg:grid-cols-2`), chapdagi guruh kartasi bilan bir qatorda
- Ikkala jadval `min-w-[480px]` + `overflow-x-auto`: tor ustunda gorizontal scroll

### Nima uchun
Ikki qator qilib qo‘yilganda o‘ng tomon pastga cho‘zilib, chap tomon ochiq qolgan edi.

### Keyingi
—

---

## 2026-09-23 — O‘quvchi show: profil kartasi

### Nima qilindi
- `StudentProfileHeader`: rasm ramkasi, status chip’lar, telefon/manzil/tibbiy/imtihon rasmi 2 ustunli maydonlar, pastda amallar qatori
- Rasm qalami kichraytirildi; tahrirda saqlash va bekor bir qatorda; amal tugmalari va bo‘sh joy ixchamlashtirildi
- Pasport va guruh kartalari chap ustunda, profil kartasi bilan bir xil kenglikda
- Kamera kartasi: holatlar alohida qator, o‘rtada chiziq, yangilash va muammo tugmalari ixcham
- «Kameradan tekshirish» — o‘quvchi natijasi va avtodrom kameralari jadvali modali
- Show tablari eski chiziqli ko‘rinishda, profil va kameralar tagida: avtomaktab, avtodrom, imtihon markazi, imtihon, hujjatlar, qo‘shimcha darslar, amaliy davomat

### Nima uchun
Show sahifasidagi profil bloki siqilgan qatorlar va ustma-ust tugmalardan iborat edi. Keyin qalam yuzni yopdi, bekor tugmasi pastga tushdi, ism yonida bo‘sh joy qoldi.

### Keyingi
—

---

## 2026-09-22 — O‘quvchi show: ixcham joylashuv

### Nima qilindi
- Yuqori qator: kichik profil + kameralar
- Passport va guruh yonma-yon; tablar to‘liq kenglikda
- Rasm, padding va sarlavhalar kichraytirildi

### Nima uchun
Kartochkalar juda baland edi, davomat pastga tushib qolardi.

### Keyingi
—

---

## 2026-09-22 — O‘quvchi show: eski ikki ustun

### Nima qilindi
- `StudentShowPage` eski `StudentInfo` tartibi: chap (profil, passport, guruh, qo‘shimcha, maktab), o‘ng (kameralar, o‘qituvchi/mashina, tablar)
- Maktab ma’lumoti default yopiq (eski Collapse)

### Nima uchun
Yangi sahifa bitta ustunda edi; eski show chap kartochka + o‘ng tablar.

### Keyingi
—

---

## 2026-09-22 — O‘quvchi o‘chirish: Tooltip

### Nima qilindi
- Shared `Tooltip` (qora bubble + strelka) — eski Ant Tooltip kabi
- Guruhdagi o‘quvchi delete: `students.cannotDeleteGrouped` tooltip
- Matn eski bilan: «Guruhga qo'shilgan uchun o'chirib bo'lmaydi»

### Nima uchun
Native `title` ko‘rinmas / boshqacha edi; eski saytdagi tooltip kerak.

### Keyingi
—

---

## 2026-09-22 — StudentAccessModal: login Lottie

### Nima qilindi
- SMS Lottie o‘rniga `login.json` (lock/user) — profilga kirish modaliga mos
- `lottieAnimations.login` eksport qilindi

### Nima uchun
SMS animatsiya kirish hisoblari uchun mos emas edi.

### Keyingi
—

---

## 2026-09-22 — StudentAccessModal: header yo‘q + Lottie

### Nima qilindi
- Standart modal header olib tashlandi (faqat burchakdagi X)
- Shield → `smsConfirmation` Lottie (`size={72}`, loop)

### Nima uchun
Header ortiqcha; ikonka o‘rniga animatsiya kerak edi.

### Keyingi
—

---

## 2026-09-22 — StudentAccessModal: eski ShowPasswordRN

### Nima qilindi
- Modal dizayn: shield, login/parol ikonkalari, footer xavfsizlik matnlari
- Matnlar eski bilan: welcome, nusxa, yangilash savoli, «Ushbu foydalanuvchiga kirish!»

### Nima uchun
Screenshotdagi oddiy modal eski `ShowPasswordRN`ga mos emas edi.

### Keyingi
—

---

## 2026-09-22 — Copyright ikonka: doimiy animatsiya

### Nima qilindi
- Pulsatsiya `acked` / modal holatidan mustaqil — topbarda doim `!` + ring
- `is-acked` da animatsiyani o‘chirish olib tashlandi

### Nima uchun
Animatsiya faqat modal ochilganda chiqardi; doim ko‘rinishi kerak edi.

### Keyingi
—

---

## 2026-09-22 — Copyright ikonka: pulsatsiya qaytarildi

### Nima qilindi
- `globals.css`: `cn-ring` kuchaytirildi + `cn-icon` scale/glow qayta
- Pending: `TriangleAlert` (!); acked: `Info`, animatsiyasiz

### Nima uchun
O‘quvchidagi kabi diqqat animatsiyasi yo‘qolib qolgan edi.

### Keyingi
—

---

## 2026-09-22 — My Gov simulator: bo‘limli qayta dizayn

### Nima qilindi
- Forma 3 blok: Asosiy (2×2), Dars jadvali (kunlar + 5 maydon), ro‘yxatlar
- Har blok `rounded` panel; kun chip’lari alohida qator

### Nima uchun
Oldingi 12-ustun grid chalkash/yoqimsiz edi.

### Keyingi
—

---

## 2026-09-22 — My Gov forma: 12-ustun grid + DateInput

### Nima qilindi
- Simulator maydonlari `grid-cols-12`: 3+3+3+3; kunlar 9 + amaliy 3; vaqtlar 3+3+3+3
- `DateInput` blur race qayta tuzatildi (sana yo‘qolmasin)

### Nima uchun
2-qator («Amaliy kunlar») vertikal tekislikdan chiqib ketgan edi.

### Keyingi
—

---

## 2026-09-22 — My Gov simulator: ixcham dizayn

### Nima qilindi
- `MyGovSimulator`: grid qatorlar; kun chip’lari Field qutisisiz
- Dinamik bo‘limlar: divider sarlavha + dashed `+ Qator` (bo‘sh katta quti yo‘q)

### Nima uchun
O‘quvchi/o‘qituvchi/mashina joylari bo‘sh baland qutilardek ko‘rinardi.

### Keyingi
—

---

## 2026-09-22 — PageMain: simulator pastini kesib qo‘ygan

### Nima qilindi
- `PageMain` `fill={false}`: `[&>*]:shrink-0` — flex bolalar siqilmasin, scroll `main` da
- `MyGovSimulator` Panel: `shrink-0`

### Nima uchun
Flex + `Panel overflow-hidden` simulatorni title balandligiga siqib, forma «yo‘qolgan» ko‘rinardi.

### Keyingi
—

---

## 2026-09-22 — My Gov: layout / ikki scroll

### Nima qilindi
- `MyGovApplicationPage`: `PageMain` fill yo‘q; `Table fill={false}`
- Jadval + Pagination + simulator — bitta sahifa scroll
- `EmptyTR`; ustun `column` kalitlari

### Nima uchun
`PageMain fill` + Table default fill jadvalni siqib, ichki+tashqi ikki scroll chiqardi; simulator alohida «buzilgan» ko‘rinardi.

### Keyingi
—

---

## 2026-09-22 — Tug‘ilgan kun: DD.MM.YYYY

### Nima qilindi
- `SendStudentsPanel` birthday: `formatDate` → kun.oy.yil

### Nima uchun
ISO/xom sana o‘rniga o‘qiladigan format.

### Keyingi
—

---

## 2026-09-22 — Yuborish: eski UX (warning banner yo‘q)

### Nima qilindi
- Sariq `Notification` banner olib tashlandi (eskida yo‘q edi)
- Yuborish: `disabled={!template || tanlov yo‘q}` — eski AllGroups kabi
- Telefon o‘qish `phone1 || phone` saqlanadi

### Nima uchun
Eskida alohida ogohlantirish bloki bo‘lmagan.

### Keyingi
—

---

## 2026-09-22 — Xabarnoma yuborish: tugma ishlamagan

### Nima qilindi
- Telefon: `phone1 || phone` (`studentPhoneOf`)
- Tanlash ustuni `registerColumn={false}` — yashirilmaydi
- Yuborish: shablon tanlanganda active; tanlov/telefon bo‘lmasa `notify` + warning banner

### Nima uchun
Telefon yo‘q qatorlarda checkbox o‘chiq → hech kim tanlanmas → Yuborish disabled; sabab ko‘rinmas edi.

### Keyingi
—

---

## 2026-09-22 — Table fill=false: ikki scroll

### Nima qilindi
- `Table` `fill={false}`: `max-h` + ichki `overflow-auto` olib tashlandi; faqat `overflow-x-auto`
- Scroll faqat `PageMain` da

### Nima uchun
Xabarnoma yuborishda jadval va sahifa birga ikki scrollbar chiqardi.

### Keyingi
—

---

## 2026-09-22 — Xabarnoma yuborish: filter + jadval UI

### Nima qilindi
- Panel o‘rab tashlandi (boshqa tablar bilan bir xil)
- Select `size="sm"` + `w-56` — guruh/shablon yonma-yon; Yuborish `ml-auto`
- Jadval `fill={false}`; Pagination faqat data bilan
- `formatPhone1` → `+998 (99) 359-47-47`

### Nima uchun
Select `md`/`w-full` sabab filterlar vertikal va to‘liq kenglikda ochilib qolardi.

### Keyingi
—

---

## 2026-09-22 — Shablon kalit so‘zlar: ixcham 2 qator

### Nima qilindi
- `TemplateFormModal`: kalit so‘zlar `grid-cols-4` (2×4), `h-7` chip, `+` yo‘q; info banner o‘rniga qisqa label+hint

### Nima uchun
Katta outline tugmalar bir qatorga cho‘zilib, dizayn og‘ir edi.

### Keyingi
—

---

## 2026-09-22 — Shablon forma modal: dizayn

### Nima qilindi
- `TemplateFormModal`: Modal `footer`, kalit so‘zlar `Notification` + soft chip’lar, create/edit sarlavha, ochilganda state reset
- i18n: qisqa placeholder/hint; `templateEditTitle`

### Nima uchun
Yaratish modalida uzun hint, ad-hoc amber matn va footer body ichida edi.

### Keyingi
—

---

## 2026-09-22 — Table toolbar: Ustunlar yonida

### Nima qilindi
- `Table`: `toolbar` prop — «Ustunlar» bilan bir qator (`items-end justify-between`)
- `TemplatesTab`: `AddButton` shu toolbar orqali

### Nima uchun
Yaratish tugmasi alohida qatorda o‘rtada ochilib qolardi.

### Keyingi
—

---

## 2026-09-22 — Xabarnoma shablonlari: yuborilganlar bilan bir xil UI

### Nima qilindi
- `TemplatesTab`: `AddButton` / `EditButton` / `DeleteButton`; `fill={false}`; ustun stillari; Pagination faqat data bilan

### Nima uchun
«Yuborilgan» tabdagi qoida va shared ActionButtons.

### Keyingi
—

---

## 2026-09-22 — Xabarnomalar: tab ostidagi takror sarlavha

### Nima qilindi
- `SentNotificationsTab` / `TemplatesTab`: tab tugmasi bilan bir xil `h3` olib tashlandi

### Nima uchun
«Yuborilgan xabarnomalar» tab ostida yana bir marta chiqardi.

### Keyingi
—

---

## 2026-09-22 — Xabarnoma detail: telefon format

### Nima qilindi
- `SentNotificationDetailModal`: telefon `+998 (99) 359-47-47`; `Table fill={false}`

### Nima uchun
Xom `993594747` o‘rniga bir xil telefon formati.

### Keyingi
—

---

## 2026-09-22 — Table fill={false}: kontent balandligi

### Nima qilindi
- `Table`: ixtiyoriy `fill` (default `true`); `false` — flex-1 yo‘q, balandlik qatorlarga mos
- Xabarnomalar «Yuborilgan»: `fill={false}`; sahifa `PageMain` (fill emas)

### Nima uchun
Kam qatorli jadval butun ekranni bo‘sh joy bilan to‘ldirardi.

### Keyingi
—

---

## 2026-09-22 — Xabarnomalar: yuborilgan jadval UI

### Nima qilindi
- `SentNotificationsTab`: ustun kengliklari, matn `line-clamp-2` + title, status `truncate`, `ShowButton`
- `PageMain fill`; Table o‘z Panelida (ikki qavatli Panel yo‘q)
- Holat: `asLangName`

### Nima uchun
Uzun matn/status qatorlarni cho‘zib, badge o‘ralib ketardi.

### Keyingi
—

---

## 2026-09-22 — API 403 / ruxsat: toast notification

### Nima qilindi
- `apiClient`: HTTP **403** → `notify.error(message)` (`notifyForbiddenMessage`, 2.5s dedupe)
- `assertOk`: body `status:0` + permission matni (yoki `response_code: 403`) → xuddi shu toast
  (masalan: «Necessary permissions are show-message-schedule»)

### Nima uchun
Ruxsat xatosi faqat bo‘sh ro‘yxat / ErrorMessage da qolmasin — foydalanuvchi toast ko‘rsin.

### Keyingi
—

---

## 2026-09-22 — Topbar: announces chuqur unwrap

### Nima qilindi
- `fetchMyAnnounces`: nested `data.data…` (eski `response.data.data.data`) + `assertOk`
- NotificationsMenu: API xatosini bo‘sh holat o‘rniga ko‘rsatadi

### Nima uchun
Bildirishnomalar (message) topbar bellda chiqmasligi — javob chuqur nested bo‘lib, `asList` bo‘sh qaytarardi.

### Keyingi
—

---

## 2026-09-22 — Xabarnomalar: show-message-schedule

### Nima qilindi
- `PAGE_ACCESS.notificationsService`: `show-message-schedule` + `menu.director.notifications_service`
- `/message-schedule*` so‘rovlariga eski kabi query `token` qo‘shildi
- `assertOk`: string `'0'` ham xato
- Sent/Templates tab: API `message` ni ErrorMessage da ko‘rsatadi

### Nima uchun
API `status:0` + «Necessary permissions are show-message-schedule» — menyu `menu.director…` bo‘lsa ham ro‘yxat bo‘sh/xato edi.

### Keyingi
Foydalanuvchiga backendda **`show-message-schedule`** berilishi kerak; aks holda ma’lumot kelmaydi.

---

## 2026-09-22 — Muammoli vaziyat: fayl upload UI

### Nima qilindi
- Yaratish/tahrir: `Field` ichidagi ikkinchi `outline` Button olib tashlandi (ikki border)
- Bitta `h-9` control: Upload ikonka + matn; delete `Field` tashqarisida `items-end`

### Nima uchun
Ikki qavatli border chalkash ko‘rinardi.

### Keyingi
—

---

## 2026-09-22 — Muammoli vaziyatlar: status Select

### Nima qilindi
- Select kengligi `w-52` → `300px`, `menuMinWidth={360}` (eski antd 300px)
- Status label: `asLangName` (til obyekti bo‘lsa ham to‘g‘ri)
- Shared `Select` option: `items-start` + `break-words` (uzun matn o‘ralganda checkmark yuqorida)

### Nima uchun
Tor dropdownda uzun status nomlari chalkash o‘ralib ketardi.

### Keyingi
—

---

## 2026-09-22 — Online arizalar: nom + telefon format

### Nima qilindi
- Menyu/title `nav.onlineApplications`: «Online ariza qoldirgan o'quvchilar» (uz/ru/kiril — eski tarjima)
- `DirectorResourcePage` `kind: 'phone'` → `+998 (93) 290-53-91` (`formatPhoneLocal`)

### Nima uchun
Eski director_links nomi; jadvalda xom 9 raqam o‘rniga format.

### Keyingi
—

---

## 2026-09-22 — O'qish uchun arizalar: menyu permission gate

### Nima qilindi
- `PAGE_ACCESS.directorApplications` = `['view-external-application']` (route + sidebar + badge/notif)
- Sidebar: `PAGE_ACCESS` da kalit yo‘q bo‘lsa band **yashirin** (ochiq emas)
- `canAccess`: faqat `null` ochiq; `undefined` / bo‘sh ro‘yxat — yopiq; permission obyekt `{name}` ham qo‘llab-quvvatlanadi

### Nima uchun
Eski `director_links` da filter o‘chirilgan edi — permission bermasa ham chiqardi. Yangida faqat `view-external-application` bilan chiqishi kerak.

### Keyingi
Agar menyu hali ham ko‘rinsa — `/me` yoki `localStorage.permissions` ichida `view-external-application` bor (yoki `superadmin`).

---

## 2026-09-22 — O'qish uchun arizalar (director-applications)

### Nima qilindi
- Sahifa `/director-applications` — eski `ExternalApplicationsDirektor` 1:1 mantiq
- Permission: `view-external-application` (`PAGE_ACCESS.directorApplications`)
- Menyu: Masofaviy xizmatlar → «O'qish uchun arizalar» (Online arizalardan oldin), qizil badge = `status_counts.received`
- API: `GET /road24/applications`; accept/cancel `PATCH .../accept|cancel`
- **1 so‘rov**: React Query `session` key, `staleTime: Infinity` — sidebar badge, xabarlar va default list bir cache
- Filter/qidiruv/pagination — alohida so‘rov; `status_counts` session ga sync
- Xabarlar: sintetik «O'qish uchun yangi arizalar» + «Barchasini ko'rish» → sahifa
- Logout: `queryClient.clear()` (Infinity kesh qolmasin)
- UI: test banner, Tabs (Barchasi/Yangi/Tasdiqlandi/Rad), SearchInput, Table, ConfirmDialog, bekor izoh Modal

### Nima uchun
Direktor roli eski saytdagi kabi arizalar + count ko‘rsin.

### Keyingi
—

---

## 2026-09-22 — Noma’lum ta’lim toifasi: id o‘rniga —

### Nima qilindi
- `eduTypeShortName`: `EDU_TYPES` da yo‘q id (`66`, `67`…) endi `String(id)` emas, `—`

### Nima uchun
Dashboard kartalarida toifa nomi o‘rniga xom id chiqardi.

### Keyingi
—

---

## 2026-09-22 — Rasm yuklash: guruhlar bo‘yicha modal

### Nima qilindi
- Kartada «Guruhlar bo'yicha» tugmasi — eski `StudentImageStatsDrilldownModal`
- `StudentImageStatsModal`: 1) guruhlar jadvali (`#`, guruh, jami/rasmli/rasmsiz chip, foiz progress, «O'quvchilar →»); 2) guruh o‘quvchilari (orqaga, qidiruv 1s debounce, holat select, rasm/FIO/passport/holat, pagination)
- 100% guruhda foiz o‘rniga teal check (eski Ant Progress `status=success`)
- API: `GET /organization/student-image-stats/groups` va `/groups/:id/students?page&per_page&status&search`
- F.I.Sh `Link` → `studentPath(id)`, modal yopiladi
- Default o‘quvchi filtri: `without_image` (eski sayt)

### Nima uchun
Foydalanuvchi: rasm holati kartasida guruh bo‘yicha ko‘rish modali ham bo‘lishi kerak (skrinshot).

### Keyingi
—

---

## 2026-09-22 — Dashboard pastki blok: 2 ustunli maket + karta dizayni

### Nima qilindi
- Maket: `lg` dan boshlab 2 teng ustun — chapda «O'quvchilar rasm yuklash holati» + «Kunlik tushum» (ustma-ust), o‘ngda «Ta'lim toifalari». Grid `items-start` (kartalar cho‘zilmaydi)
- Umumiy `CardTitle` (rangli ikonka chip + matn) va `StatTile` (uppercase label + katta son) yordamchilari
- Rasm holati: sarlavha yonida rangli foiz chipi (`percentChip`), 3 ta rangli plitka (Jami/Rasmli/Rasmsiz), progress ostida `316 / 511` nisbati
- Kunlik tushum: sarlavhada `Jami: X so'm` badge, toggle `label` ichiga olindi, to‘lov kartalari 2 ustun — summasi bor bo‘lsa teal + to‘q ikonka, 0 bo‘lsa neytral
- Ta'lim toifalari: sarlavha + 3 badge bir qatorda; plitkada toifa nomi rangli chip, o‘ngda umumiy son, ostida **yozuvli** `Faol` / `Tugatgan` qatorlari (avval faqat ikki raqam edi — tushunarsiz)
- i18n (uz/ru/kiril): `dashboard.eduActive`, `dashboard.eduEnded`
- `percentTone()` ishlatilmay qoldi — olib tashlandi

### Nima uchun
Foydalanuvchi: rasm holati + kunlik tushum chapda, ta'lim toifalari o‘ngda bo‘lsin va uchalasi ham chiroyli/tushunarli ko‘rinsin.

### Keyingi
—

---

## 2026-09-22 — Shared `Popover` + profil badge dropdownlari

### Nima qilindi
- `src/components/ui/Popover.tsx` (+ `PopoverRow`) — eski Ant `Popover` o‘rnini bosuvchi hover/fokus oynasi
  - `createPortal(document.body)` + `fixed` joylashuv: `Panel` ning `overflow-hidden` i kesib tashlamaydi
  - `side` (`top|bottom`), `align` (`start|center|end`), viewport chegarasiga clamp, scroll/resize da qayta hisoblash
  - Panelga sichqoncha o‘tganda yopilmaydi (120ms kechikish) — ichidagi link bosiladi
- `DirectorDashboard` profil badge lari:
  - `Face ID: Bor` → `Face ID ma'lumotlari`: nomi, telefon raqami (`study_platform_agreement.face_control`)
  - `Avtodrom shartnomasi: Bor` → `Shartnoma haqida`: nomi, holati (status id 9 → «Tasdiqlangan»), boshlanish/tugash sanasi, punktir ramkada «Shartnoma fayl» PDF linki
  - `Yo‘q` holatida dropdown yo‘q (eski sayt bilan bir xil)
- `DirectorAutodromeStatusCard`: ad-hoc qora tooltip va `title=""` olib tashlandi — kamera kartasi va A/B/E chip lari ham shared `Popover` ishlatadi
- i18n (uz/ru/kiril): `dashboard.faceIdInfo` `agreementInfo` `infoName` `infoPhone` `infoStatus` `infoStartDate` `infoEndDate` `agreementApproved` `agreementFile`

### Nima uchun
Eski saytdagi badge dropdownlari yo‘q edi («bularda dropdown bo‘lishi kerak»). Tooltip mantiqi ikki joyda takrorlanmasin — shared-ui qoidasi bo‘yicha `components/ui` ga chiqarildi.

### Tahlil
`Panel` da `overflow-hidden` bor, shuning uchun absolute tooltip kartochka chetida kesilardi — portal yechimi tanlandi.

### Keyingi
Boshqa sahifalardagi `title=""` tooltiplarni ham `Popover` ga o‘tkazish (ixtiyoriy).

---

## 2026-09-22 — Direktor profil: rol/online/tarif badge olib tashlandi

### Nima qilindi
- `DirectorDashboard` profil kartochkasida ism ostidagi `Direktor` / `Oflayn` / `COMFORT` badge qatori olib tashlandi
- Faqat MSPD unconfirmed badge qoldi; `getRoleMeta` / `TONE_CLASS` / `agreementName` ishlatilmaydigan bo‘ldi
- Siqilgan layout tuzatildi: normal padding/`space-y-2.5`, avatar kontent balandligiga mos (`min-h-24`), offline nuqta `bg-deep/35`
- Tugmalar `h-7` / `text-[12px]`; avatar `size-20`, `space-y-2`, MetaPill/footer biroz siqildi

### Nima uchun
Profil header ixchamroq — rol/status/tarif chip lari kerak emas edi; heightni haddan siqib dizayn buzilmasin.

### Keyingi
—

---

## 2026-09-22 — Direktor: Avtodrom holati (eski AutodromeCamerasCompact)

### Nima qilindi
- `DirectorAutodromeStatusCard` — eski `AutodromeCamerasCompact` maketi 1:1: `AVTODROM HOLATI` uppercase sarlavha + dumaloq refresh
- Qator: chapda nom + kamera kartalari (`Kamera holati: Online`), o‘ngda punktir chegarali panel (`lg:w-95`)
- O‘ng panel: indigo ikonka + «O‘quvchi qabul qilish holati», sana pill (`31.12.2026 gacha 100 kun`), A/B/E teng kenglikda 3 chip
- Kamera kartasi hover/fokus: tooltip (IP · model, oxirgi online, sabab)
- API: faqat status 1|2, muddati o‘tmagan; `autodrome_has_free_space`

### Kamera endpoint (muhim)
- `/autodrome-agreements/cameras/:id` **nginxda bloklangan** (NDT ga to‘g‘ridan-to‘g‘ri borib FPM worker larni to‘ldirardi) → «Kamera yo‘q» chiqardi
- To‘g‘ri manzil: `/autodrome-agreements/camera-statuses/:id` (lokal snapshot). `director-dashboard.ts` va `autodrome-agreements.ts` (`fetchAgreementCameras`) shunga o‘tkazildi
- `cameraList()` — `[]` / `{data:[]}` / `{data:{data:[]}}` / `{cameras:[]}` shakllarini oladi; agreements `show_count=500`

### Nima uchun
Foydalanuvchi eski dizaynni ko‘rsatib «shunaqa qilib ber» dedi; tooltip ham kerak edi. Eski saytda kamera Online, bizda bo‘sh chiqardi.

### Keyingi
—

---

## 2026-09-22 — Direktor dashboard: tezkor menyular

### Nima qilindi
- «Yangi o‘quvchi qo‘shish» tezkor link olib tashlandi
- Qolgan 6 ta kartochka: ixcham `min-h-9`, yumshoq theme ranglar (signal/violet/amber/indigo/teal/rose), Panel o‘rniga ochiq grid
- KPI (Hodimlar/O‘quvchilar/Guruhlar/Mashinalar) ham ixcham: `py-2`, ikonka `size-7`, yumshoq fon
- «Avtodrom kameralari holati» KPI kartochkalar tagiga ko‘chirildi

### Nima uchun
Tezkor menyu ixchamroq va rangli; o‘quvchi qo‘shish dashboarddan kerak emas edi; avtodrom holati tezkor kartalar yonida ko‘rinsin.

### Keyingi
—

---

## 2026-09-22 — Direktor topbar: Telegram / Instagram

### Nima qilindi
- `DirectorPaymentButton` — eski Header `AddPaymentHistory header` (Wallet + «To‘lov»)
- `AddPaymentHistoryModal`: `GET /groups/select` + guruh tanlanganda students/show; layout skrinshotga mos
- API: `fetchGroupsSelect`

### Nima uchun
Direktor topbarda to‘lov qo‘shish modal ochilishi kerak edi.

### Keyingi
—

---

### Nima qilindi
- `DirectorSocialLinks` — faqat direktor; til switcher yonida; oq fon/border yo‘q
- URL: Telegram [`t.me/e_avtotalimuz`](https://t.me/e_avtotalimuz); Instagram [`prepdrive_uz`](https://www.instagram.com/prepdrive_uz)
- O‘quvchi `StudentAppLinks` o‘zgarmagan

### Nima uchun
Direktor topbarida ijtimoiy ikonlar; Telegram eski saytdagi support guruh.

### Keyingi
—

---

## 2026-09-22 — Tarif drawer: Lottie + matn tartibi

### Nima qilindi
- Hero Lottie `168` → `280` (kattaroq, header bo‘shlig‘ini to‘ldiradi)
- `DetailRow`: label/value bir qator, to‘lov summası + `so'm (har bir…)` alohida hint
- Footer shartnoma/yopish tugmalari `soft`/`ghost` (kam “bosilgan” ko‘rinish)

### Nima uchun
Lottie kichik qolgan; to‘lov matni ikki qatorga siqilib tartibsiz edi.

### Keyingi
—

---

## 2026-09-22 — Tarif: modal → drawer

### Nima qilindi
- Shared `Drawer` (`components/ui`) — o‘ng/chap slide + blur fon
- `DirectorTariffPlan`: modal o‘rniga o‘ng drawer; gradient hero + Lottie + stat pill + detail kartalar

### Nima uchun
Foydalanuvchi modal dizaynini yoqtirmadi; eski Header drawer uslubiga qaytish.

### Keyingi
—

---

### Nima qilindi
- `lottie-react` o‘rnatildi; `src/assets/lottie/` (tariff, out-of-limit, info, …)
- Shared `LottiePlayer` (`components/ui`)
- `DirectorTariffPlan` modal: Lottie + yumshoq gradient/kartacha dizayn; limit oshganda `out-of-limit`
- `TariffPlansModal` ga kichik tariff Lottie

### Nima uchun
Eski saytdagi tarif animatsiyasini yangi UI ga ko‘chirish.

### Keyingi
Boshqa modal/empty holatlarda `LottiePlayer` + `lottieAnimations.*` ishlatish.

---

## 2026-09-22 — Direktor: Tarif rejangiz (topbar)

### Nima qilindi
- `DirectorTariffPlan` — topbar chip (`Tarif rejangiz: COMFORT …`) + to‘liq ma’lumot modal
- Faqat `role === director`; ma’lumot `me.profession.organization` (limit, ishlatilgan, qoldiq, oshgan, to‘lov)
- Shartnoma tugmalari `organization.agreements`; `MeOrgReport` tipiga yangi maydonlar
- i18n: uz / ru / kiril `tariff.*`

### Nima uchun
Eski Header dagi tarif ko‘rinishi yangi AppTopBar da yo‘q edi.

### Keyingi
—

---

## 2026-09-22 — Mobile shell 1-bosqich (≤700px)

### Nima qilindi
- `src/pages/mobile/`: `global.css`, icons, swipe/pull hooks, `PageChrome`, `StudentMobileShell`
- `useIsMobileViewport(700)` + `AppShell`: student + ≤700 → desktop sidebar/header o‘rniga mobil shell
- Ekranlar (RQ): `MobileDashboard`, `MobileLessons` → `/lessons/:id`, `MobileTests` hub + Template/Mixed/Saved/All + yakuniy → `/final-exam`
- Take sahifalar: `take.module.css` mobil «app yuklab oling» gate o‘chirildi (brauzerda yechish)

### Nima uchun
Eski `Students/Mobile` dizaynini yangi TS/React Query loyihaga ko‘chirish (1-bosqich).

### Keyingi
2-bosqich: jadval, davomat, yo‘l belgilari, jarimalar, apellyatsiya, profil mobil UI.

---

## 2026-09-22 — Yakuniy imtihon: Yaratilmagan / kamera (eski oqim)

### Nima qilindi
- `FinalExamPage`: guruh `edu_ending_date` (eski `localStorage.endingData`) vs today+10
- **Yaratilmagan** — o‘quvchi + imtihon ma’lumoti kartasi (20 savol / 25 daqiqa / 2 xato), kamera yo‘q
- **Yaratilgan** — yuz paneli (oldingi UI)
- Header: Holati: Yaratilgan | Yaratilmagan

### Nima uchun
Yangi doim kamerani ochardi; eskida guruh tugamaguncha info karta chiqardi.

### Keyingi
—

---

## 2026-09-22 — Mavzu testi yo‘q: notification, sahifaga kirmaslik

### Nima qilindi
- `LessonDetailPage`: tugma bosilganda avval `GET /exam-topic-test/start` — muvaffaqiyatsiz bo‘lsa `notify.warning`, navigate yo‘q
- `TakeTopicTestPage`: boot xatosida ham toast + `returnTo` (to‘g‘ridan URL ochilsa)

### Nima uchun
Test yo‘qida bo‘sh qora sahifa («Mavzulashtirilgan testlar…» + Orqaga) chiqardi.

### Keyingi
—

---

## 2026-09-22 — Test pagination: scrollsiz wrap (eski uslub)

### Nima qilindi
- `take.module.css`: sahifa `100svh` flex; kontent scroll; footer pastga
- Savol raqamlari: `flex-wrap` + markaz, `overflow-x` olib tashlandi (eski `test_pagination`)
- oldingi/keyingi/Yakunlash — raqamlar ostida bir qator

### Nima uchun
32+ savolda pastki raqamlar gorizontal scroll chiqardi; sahifa ham ortiqcha scroll berardi.

### Keyingi
—

---

## 2026-09-22 — Darslar: mavzu testi bosiladi (isType 10)

### Nima qilindi
- API: `GET /exam-topic-test/start/:id/:lang`, `POST /exam-topic-test/check`
- `TakeTopicTestPage` + route `/lessons/topic-test` (AppShell tashqarida)
- `LessonDetailPage`: «Mavzu bo'yicha test bajarish» alohida `Button` — joriy til bilan test ochadi

### Nima uchun
Matn «test bajarish» chiqardi, lekin span edi — click ishlamasdi; eski `/test/completetest` oqimi yo‘q edi.

### Tahlil
Eski: `startedFunc` → state `{ template_id, lang_id, isType: 10 }`. Yangi shu state + sessionStorage.

### Keyingi
—

---

## 2026-09-22 — Darslar: mavzu testi «mavjud emas» noto‘g‘ri

### Nima qilindi
- `fetchStudentTopics`: `relations[]` o‘rniga eski axios/Laravel formati `relations[0|1]=…`
- `topicHasTest` / `getExamTopics` (eski mobile `LessonView`): array, `{ data }`, `exam_topics_count`, field yo‘q bo‘lsa eski desktop semantikasi
- `LessonDetailPage` shu helperdan foydalanadi

### Nima uchun
Barcha mavzularda «Hozirda test mavjud emas» chiqardi; eskida test bor edi.

### Tahlil
Yangi: `(exam_topics?.length ?? 0) > 0` — `undefined`/paginated obyektni «yo‘q» deb hisoblaydi. Eski desktop: faqat `length === 0` da disabled. Relations ham `relations[]` bilan kelmasligi mumkin edi.

### Keyingi
Mavzu testi click → `isType: 10` exam flow (eski `/test/completetest`).

---

## 2026-09-18 — Davomatlarim: Oy/Yil filter overflow

### Nima qilindi
- `TheoreticalAttendancePanel`: Oy/Yil `Select` kalendar `Panel` ichiga ko‘chirildi (dars jadvali bilan bir xil, chapda)
- Yil select: `min-w-0` + `w-[5.5rem]` — `Select` `min-w-34` endi triggerda emas, wrapperda
- Kalendar kataklari `min-w-0 overflow-hidden`; `PageMain` / `.shell-canvas > main` ga `min-width: 0`
- `PageMain fill`: tab `shrink-0`, kalendar `flex-1 min-h-0 overflow-auto` — oxirgi hafta kesilmaydi, pastga scroll ochiladi

### Nima uchun
Oy/Yil `ml-auto` bilan sahifa o‘ng chetiga chiqib ketardi; 7 kunlik grid min-content sahifani gorizontal kengaytirardi. Filter tuzatilgach `Panel overflow-hidden` flexda kalendarni pastdan kesib, scrollni yopib qo‘ydi.

### Tahlil
`Select size="sm"` trigger `min-w-34` yil maydonini `w-[5.5rem]` dan kengaytirardi. `main` flex child `min-width: auto` tufayli kalendar page overflow berardi. Flex + `overflow-hidden` min-height:auto ni 0 qiladi — kontent clip, scrollbar yo‘q.

### Keyingi
—

---

## 2026-09-18 — O‘quvchi dashboard: oflayn → last_seen

### Nima qilindi
- `StudentDashboardProfileCard`: oflayn badge o‘rniga `dashboard.lastSeenAt` («Oxirgi kirilgan: {{time}}»); onlayn «Onlayn»; vaqt yo‘q — «Oflayn»
- i18n: `uz` / `ru` / `kiril` da `dashboard.lastSeenAt`

### Nima uchun
API `last_seen` beradi; o‘quvchi oxirgi kirgan vaqtni ko‘rishi kerak.

### Tahlil
`MeUser` da `online` + `last_seen` bor; ProfilePage ham shu formatdan foydalanadi.

### Keyingi
—

---

## 2026-09-17 — Murojaat: filterlar 1 qator

### Nima qilindi
- `AppealsPage`: 3 ta filter `Select size="sm"` + `flex-nowrap`; Table `flex-1` scroll

---

## 2026-09-17 — Jarimalar kategoriya: header menyu

### Nima qilindi
- `PenaltiesCategoryPage`: `Select size="sm"` + `w-[14rem]`; orqaga `Header onBack` (vertikal yig‘ilgan Orqaga olib tashlandi)

---

## 2026-09-17 — PageMain fill: doim scroll

### Nima qilindi
- `globals.css` `.page-fill`: `overflow: hidden` → `overflow-y-auto` (mobil media-query olib tashlandi)
- `PageMain` fill: `overflow-y-auto`
- `shared-ui.mdc`: Table+Pagination fill pattern (non-flex wrapper taqiqlangan)

### Nima uchun
Fill sahifalarda noto‘g‘ri wrapper scrollni kesardi; endi pastki ma’lumot doim ko‘rinadi.

---

## 2026-09-17 — Faol avtomaktablar: jadval scroll

### Nima qilindi
- `ActiveSchoolsPage`: `PageMain fill` ichida Table `flex-1 min-h-0` — ichki scroll ochildi (avval wrapper `space-y-3` clip qilardi)

---

## 2026-09-17 — EmptyState / ErrorMessage: yagona bo‘sh/xato UI

### Nima qilindi
- `EmptyState`: ikonka + dashed panel (Inbox); barcha bo‘sh ro‘yxatlar uchun
- `ErrorMessage`: xuddi shu til (CloudOff) — qizil matn o‘rniga
- i18n: `common.emptyHint`, `common.loadErrorHint`
- `EmptyTR` yangi EmptyState ga moslandi

### Nima uchun
«Ma'lumot yuklanmadi» oddiy qizil matn edi; ma’lumot yo‘q / xato holatlari bir xil chiroyli komponentda.

---

## 2026-09-17 — Sidebar rol badge: ixcham pill

### Nima qilindi
- `Sidebar`: rol chip `items-start` + `w-fit` + `rounded-full` — flex-col stretch tufayli keng yashil chiziq yo‘qoldi

---

## 2026-09-17 — Sidebar ochiq logo: logo_old2

### Nima qilindi
- Sidebar ochiq holat: `src/assets/images/logo_old2.png`

---

## 2026-09-17 — Sidebar logo: ochiq/yopiq holat

### Nima qilindi
- Ochiq: `app-logo-full.png` (eski `logo.png` — Eavtota'lim so‘zli)
- Yopiq (collapsed): `app-logo.png` (eski `logo_mini.png`)

---

## 2026-09-17 — Sidebar: EA o‘rniga app logo

### Nima qilindi
- Eski `logo_mini.png` → `src/assets/images/app-logo.png`
- `Sidebar` header: «EA» gradient o‘rniga logo rasm

---

## 2026-09-17 — Davomatlarim: Oy/Yil filter 1 qator

### Nima qilindi
- `MyAttendancePage`: Oy/Yil `Select size="sm"` + `flex-nowrap` (dars jadvali bilan bir xil)

---

## 2026-09-17 — Guruh tafsilotlari: avtomobil rasm preview

### Nima qilindi
- `GroupDetailsPage` `CarPhoto`: rasmga bosilsa `Modal` da kattalashtirilgan ko‘rinish

### Nima uchun
Jadvaldagi thumbnail kichik — batafsil ko‘rish kerak edi.

---

## 2026-09-17 — Dars jadvali: filterlar 1 qator

### Nima qilindi
- `LessonSchedulePage`: Oy / Yil `Select size="sm"` + `flex-nowrap`; Bugun/prev/next `ml-auto` bir qatorda

### Nima uchun
Select default `w-full` edi — oy va yil vertikal yig‘ilib qolardi.

---

## 2026-09-17 — O‘quvchi: birinchi kirishda ta’lim ma’lumoti modal

### Nima qilindi
- `StudentSchoolModal` (eski `eavtotalim_front` port): maktab/avtodrom/sanalar/mashinalar, «Xabar berish» → `POST /student-alternative-study-reports`
- «Tushunarli» → `localStorage school_notice_ack_{professionId}` — qayta chiqmaydi
- `AppShell` ga ulandi; i18n `studentSchool.*` (uz/ru/kiril)

### Nima uchun
O‘quvchi litsenziyalangan maktab/manzilni birinchi marta ko‘rib tasdiqlashi kerak.

### Keyingi
Student-ended uchun ham ko‘rsatish kerakmi — tekshirish.

---

## 2026-09-17 — Topbar student QR: JS generatsiya + Instagram

### Nima qilindi
- Eski `eavtotalim_front` `StyledQrCode.jsx` → `src/components/layout/topbar/StyledQrCode.tsx` (`qrcode` + rounded modules + intalim mark)
- `StudentAppLinks`: static PNG o‘rniga `href` dan canvas QR; Instagram (`prepdrive_uz`) qo‘shildi
- i18n: `topbar.instagram`, `topbar.followInstagram` (uz/ru/kiril)
- Static `src/assets/images/qr/*.png` endi ishlatilmaydi (import olib tashlandi)

### Nima uchun
Eski front JS da QR chizardi; yangi kod faqat rasm ko‘rsatardi va Instagram yo‘q edi.

### Keyingi
Hover tooltipda QR skaner bilan tekshirish; kerak bo‘lsa eski PNG larni o‘chirish.

---

## 2026-09-17 — Dashboard 4 karta: tekis alignment

### Nima qilindi
- Avtodrom ring: CSS rotate olib tashlandi (SVG origin 0,0 foizni qiyshaytirardi); aylanish faqat `circle` da, foiz SVG `text` o‘rtada
- 4 panel `h-full` + bir xil header (`h-6`) va metrika kataklari (`h-14`)

### Nima uchun
Ring yonidagi «Davomat» progress chizig‘ini surib, qiyshiq ko‘rinardi.

---

## 2026-09-17 — Dashboard: 4 karta qator (avtodrom progress)

### Nima qilindi
- Darslar + dars davomati + avtodrom: `xl:grid-cols-4`
- Avtodrom kartada faqat ring/progress/soatlar; tashriflar «Batafsil» modalida
- `StudentDashboardTimetableCard` fragment — 2 panel grid item bo‘ladi

### Nima uchun
To‘liq keng avtodrom qatori zich layoutni buzardi; 4-karta bilan progress ko‘rinadi, detal alohida.

---

## 2026-09-17 — O‘quvchi dashboard: Avtodrom davomatim

### Nima qilindi
- `StudentDashboardAutodromeCard`: progress ring + soat metrikalar + oxirgi 4 tashrif
- `GET /my-profile/attendances/autodrome` (`useAutodromeAttendanceQuery`)
- Ko‘z tugmasi — to‘liq jadval modal; «Batafsil» — `/my-attendance?tab=autodrome`
- i18n: uz / ru / kiril (`dashboard.student.autodromeTitle`, `autodromeLastVisits`)

### Nima uchun
Dashboardda dars davomati bor edi, avtodrom soatlari (masalan 8/22) va tashriflar ko‘rinmasdi.

### Tahlil
Mavjud davomat kartasi bilan bir xil zich Panel tili; ring avtodrom sahifasidagi gradient progressni farqlaydi.

### Keyingi
Kerak bo‘lsa nazariy/amaliy davomat ham shu uslubda.

---

## 2026-09-15 — O‘quvchi dashboard: bo‘sh markaz yo‘q (qayta)

### Nima qilindi
- Stretch/`h-full`/`page-fill` olib tashlandi — o‘rtadagi katta bo‘sh panel sababi shu edi
- Layout bandlar: status+nav → gorizontal profil (4×4 ramkali foto) → darslar+davomat → to‘lov+imtihon → staff
- Kartalar kontent balandligida; nav ixcham gorizontal chip

### Nima uchun
Birinchi cockpit versiyada o‘rta ustun viewportga cho‘zilib, darslar ostida katta oq bo‘shliq qoldi — yoqmadi.

### Keyingi
Viewportda zichlikni ko‘rib, kerak bo‘lsa yana siqish.

---

## 2026-09-15 — O‘quvchi dashboard: scrollsiz zich dizayn

### Nima qilindi
- `StudentDashboard`: 3 qatorli cockpit; `page-fill`
- Profil 4×4 ramkali foto; imtihon jadvali modalda
- `StudentDashboardStatusStrip`, `StudentDashboardStaffStrip`
- `page-fill` mobil (<1280) da scroll

### Nima uchun
Zich/qulay tartib va bir xil kvadrat foto.

### Tahlil
Stretch bo‘sh joy qoldirdi → keyingi yozuvda tuzatildi.

---

## 2026-09-14 — Topbar mobil: menyular siqilishi

### Nima qilindi
- `TopbarIconButton`: `hidden`/`md:inline-flex` endi ishlaydi (`cn` tw-merge qilmagani uchun `inline-flex` bilan urushardi)
- Mobil: lupa/fullscreen yashirin; til — dropdown (`LanguageSwitcher mode="auto"`)
- Topbar tools: ixcham padding + gorizontal scroll (kerak bo‘lsa)

### Nima uchun
Mobil/tablet da til switcher + barcha ikonlar bir qatorda siqilib, qisman kesilib qolardi.

---

## 2026-09-14 — Refresh token (401 → /auth/refresh-token)

### Nima qilindi
- `src/lib/tokenRefresh.ts`: `POST /auth/refresh-token`, queue, `forceLogout` / `token-refreshed` event
- `api/client.ts`: 401 da refresh + original so‘rovni qayta yuborish (v1/v2)
- `fetchMe`: querydagi `?token=` olib tashlandi (eski token retryni buzardi)
- `AuthProvider`: forceLogout / token-refreshed tinglaydi; /me xatosida darhol logout emas

### Nima uchun
Access muddati tugaganda login ga tashlab yuborardi — refresh saqlanar, lekin hech qachon chaqirilmasdi.

### Tahlil
Eski `index_v2.js` interceptor bilan bir xil oqim. Refresh o‘zi `fetch` orqali (client loop yo‘q).

---

## 2026-09-14 — PrepDrive header logo

### Nima qilindi
- Eski `prep-drive-logo.png` → `src/assets/images/prep-drive-logo.png`
- Topbar tugmada «PD» o‘rniga logo + «Mustaqil tayyorlov» (eski `prepdrive-header-btn` kabi)

---

## 2026-09-14 — Student app linklar: QR + dizayn

### Nima qilindi
- Eski QR rasmlar: `src/assets/images/qr/{app-store,google-play,telegram}-students.png`
- `StudentAppLinks`: brend ikonkalar (Apple / Play gradient / Telegram), hover/focus da QR tooltip
- i18n: `appStoreQr`, `googlePlayQr`, …

### Nima uchun
Foydalanuvchi: App Store / Play / Telegram chiroyli bo‘lsin va eski QR lar qaytsin.

---

## 2026-09-14 — PrepDrive modal: eski matnlar

### Nima qilindi
- `StudentsRedirect` dagi matnlar bilan bir xil: typographic apostrof (`yo‘l`, `Do‘stlar`, `o‘tish`)
- Eslatma: 2 paragraf + bold `"Inta'lim"`, `"PrepDrive"`, `PrepDrive.uz`
- CTA: `ArrowRight`; yopish tugmasi qizil

### Nima uchun
Foydalanuvchi: PrepDrive modal matnlari ham eski bilan bir xil bo‘lsin.

---

## 2026-09-14 — Topbar modallar: eski dizayn

### Nima qilindi
- `Modal` ga `hideHeader` — custom header uchun
- Copyright: gradient header, ogohlantirish ikonkasi, himoya kartalari, qizil/amber bloklar, «Tushundim»
- PrepDrive: rangli feature ikonkalar, Web/Android/iOS linklar, «Eslatma» box, CTA

### Nima uchun
Foydalanuvchi: eski screenshot dagi modal lar bilan bir xil bo‘lsin.

---

## 2026-09-14 — Topbar: eski header util'lari

### Nima qilindi
`AppTopBar` ga eski `VerticalLayout/Header.js` student util'lari ko‘chirildi:
- Mualliflik (info) + majburiy modal
- A+ / A− shrift
- Lupa (zoom 1.2)
- PrepDrive (Mustaqil tayyorlov) modal
- Til switcher
- App Store / Google Play / Telegram
- Fullscreen
- Bildirishnomalar (`GET /announces/my-announces`)

### Nima uchun
Foydalanuvchi: menudagi (yuqori panel) barchasini eski kabi chiqar.

### Keyingi
Dark theme toggle (dizayn tokenlari yo‘q — keyinroq); floating murojaat widget (`AppealMessageC`) — alohida.

---

## 2026-09-14 — O‘quvchi dashboard: eski StudentDashboardNew

### Nima qilindi
- `eavtotalim_front/StudentDashboardNew.jsx` va `DashboardComponents/*` bo‘yicha yangi dashboard to‘ldirildi
- Manba: `GET /my-profile` (profil + tashkilot + `student_personal_attendance`), `/my-profile/payments`, `/this-week-timetable`, `/students/:id/group-details`, `/students/:id/exam-center-student-results`
- Bloklar: tezkor havolalar, profil/tashkilot, to‘lovlar (ko‘rish/yashirish), o‘qituvchilar/mashinalar, bugungi/hafta jadvali, davomat, imtihon markazi
- `src/pages/dashboard/student/*` komponentlar, i18n `dashboard.student.*`

### Nima uchun
Foydalanuvchi: eski koddek barcha ma’lumotlar chiqsin.

### Keyingi
Guvohnoma (`/my-profile/certificate`) va AutoExam ixtiyoriy qo‘shish.

---

## 2026-09-14 — StudentDashboard: guruh/sana fallback

### Nima qilindi
`StudentDashboard` da guruh nomi, dars boshlanish/tugash sanalari va telefon endi `/me.study_info` bo‘sh bo‘lsa `GET /my-profile` dan olinadi (`ProfilePage` dagi kabi).

### Nima uchun
`student-ended` holatida `/me.study_info` va ba’zan `profession.organization` kelmaydi; eski UI `StudentProfileV2` dan to‘ldirardi. Yangi dashboard faqat `/me` ga tayanib «—» chiqarardi (toifa `BC` esa `/my-profile` dan chiqardi).

### Tahlil
- Guruh/sanalar: frontend mapping tuzatildi.
- Tashkilot (nom, INN, HR…), avtodrom, shartnoma: hali faqat `/me` — API bo‘sh qaytarsa «—» qoladi.
- Eski dashboarddagi to‘lov / davomat / dars / o‘qituvchi bloklari hali ulanmagan (ADR-012 TODO).

### Keyingi
Tashkilot uchun boyroq manba (masalan `/my-profile` kengaytmasi yoki eski profile API); keyin to‘lov/davomat bloklari.

---

## 2026-08-22 — Yo'llanma chop etish

### Nima qilindi
`/voucher/:id` eski `Voucher.jsx`: pasport, tug‘ilgan kun, guvohnoma, «Yo'riqnoma № 1 ilova», toifa + XXX, F.I.SH, rahbar, imzo, 6 qatorli natija jadvali, QR. Har o‘quvchi — 1 A4. `POST v1 /print/students-by-group`. Chop etish `printElement`.

### Nima uchun
Qisqartirilgan «YO‘LLANMA» rasmiy blankga mos emas edi.

### Keyingi
Shaxsiy varaqa, jurnal va boshqa chop turlari hali soddalashtirilgan.

---

## 2026-08-22 — Ariza (guruh) 1 varaq

### Nima qilindi
Chop etishda shrift 11px, qator va o‘qituvchi kartalari siqildi, body padding 4mm. 20+ o‘quvchi A4 ga sig‘ishi uchun.

### Nima uchun
Print preview 2 varaq chiqardi.

---

## 2026-08-22 — Ariza (guruh) chop etish

### Nima qilindi
`/statements_doc/:id` endi eski `Statements_doc.jsx`: IIB YHHB sarlavhasi, guruh/INN, muddat va kun-vaqt, o‘qituvchilar, yo‘riqchilar (mashina), o‘quvchilar jadvali (F.I.SH, tug‘ilgan sana, manzil), rahbar + imzo. `GET v2 /groups/show/:id` + `GET v2 /groups/print-document/:id` + `GET v2 /groups/show/:id/students`. Chop etish `printElement` (`@page` margin 0).

### Nima uchun
Qisqartirilgan «ARIZA (GURUH)» eski rasmiy blankga mos emas edi.

### Tahlil
O‘quvchilar `showCount=200`. Manzil faqat `"null"` / `"undefined"` bo‘lsa «Manzil kiritilmagan!».

### Keyingi
Qolgan chop turlari (yo‘llanma, varaqa, jurnal…) hali soddalashtirilgan.

---

## 2026-08-22 — Guruhlarni ro‘yxatga olish arizasi

### Nima qilindi
Eski `GroupRegistrationApp.jsx`: guruh/INN, manzil, sanalar, nazariy/amaliy kun-vaqt, o‘qituvchilar va yo‘riqchilar (mashina). `GET v2 /groups/show/:id` + `GET v2 /groups/print-document/:id`.

### Nima uchun
Qisqartirilgan versiya eski layoutga mos emas edi.

---

## 2026-08-21 — Chop etish: xatolik modali

### Nima qilindi
Eski `InfoContactCard`: sariq `!` tugma, modal matn, Telegram (`t.me/avtointalim`). Hujjat chop sahifalarida.

---

## 2026-08-21 — Chop etish: URL va sana yo‘q

### Nima qilindi
`printElement` oxirida `@page { margin: 0 }` — brauzer domen/sana chiqarmaydi. Chet `body` padding. `window.print()` o‘quvchi chopida ham `printElement`.

### Nima uchun
Preview da `localhost:5173/pagetoview/...` va sana chiqardi.

---

## 2026-08-21 — Shartnoma: eski PageToView

### Nima qilindi
`/pagetoview/:id` to‘liq eski shartnoma: 1–9 bo‘lim, jadval, rekvizitlar, «Qo‘lda kiritish», chop etish A4. Sidebar ichida.

### Nima uchun
Ariza port qilingan, shartnoma qisqartirilgan qolib ketgan edi.

---

## 2026-08-21 — Ariza chop etish: 2 ta / sahifa

### Nima qilindi
A4 portrait, kichik margin; har 2 ta ariza bitta varaq. `printElement` 12mm padding olib tashlandi.

### Nima uchun
Eski saytda print preview da 2 ta ARIZA bitta varaqqa sig‘ardi.

---

## 2026-08-21 — Ariza (o‘quvchi): layout va sahifa

### Nima qilindi
Chop etish endi yangi tab/sidebar-siz sahifa emas — `AppShell` ichida. Ariza matni eski `PupilApplication.jsx` bilan bir xil (1–8 band, imzo, sana, QR). `POST /print/students-by-group` unwrap tuzatildi (`students` yuqorida bo‘lsa yo‘qolmasin). Chop etish `printElement`.

### Nima uchun
Printer ikonka boshqa page ochardi va ariza eski ko‘rinishda chiqmasdi.

---

## 2026-08-21 — Hujjatlar (chop etish)

### Nima qilindi
`/doc` generic jadval o‘rniga eski `Documents/index.jsx`: faol/yangi/tamomlangan guruh filter, qidiruv, `1-bo'lim` / `2-bo'lim` tablar, chop etish ikonkalari. Shartnoma yo‘q — `Notification`. Chop etish sahifalari eski URL da (`/pupil-application/:id`, `/pagetoview/:id`, …), sidebar siz, `POST v1 /print/students-by-group` va `GET v2 /groups/print-document/:id`. Jurnal ichki jadvallari (davomat/imtihon grid) soddalashtirilgan.

### Nima uchun
Generic `DirectorResourcePage` da chop etish tugmalari va 2 bo‘lim yo‘q edi.

---

## 2026-08-21 — Pul qaytarish (Chetlashtirish)

### Nima qilindi
`/refund` generic jadval o‘rniga eski `ReturnPayment/index.jsx`: qidiruv, guruh filter, `+ Qo'shish`, jadval (F.I.SH, guruh, summa, sana, izoh), `Pagination`. Qo‘shish modalida ogohlantirish, guruh/o‘quvchi/summa/sana/tavsif, o‘quvchi ma’lumotlari + rasm. Saqlash oldin `ConfirmDialog`. `GET v1 /returned-payments-index`, `GET v1 /return-payment-get-students-by-group`, `POST v1 /return-payment-store`.

### Nima uchun
Generic `DirectorResourcePage` da qo‘shish, guruh filter, izoh va chetlashtirish ogohlantirishi yo‘q edi.

---

## 2026-08-21 — Qarzdorlar sahifasi

### Nima qilindi
`/debtors` generic jadval o‘rniga eski `Debtors.jsx`: F.I.O qidiruv, guruh filter, o‘qituvchi, telefon, qarz (qizil) / to‘lagan (yashil) `Badge`, `Pagination`. `GET v2 /school-payment/debtors-v2`. Shartnoma yo‘q — `Notification`.

### Nima uchun
Generic `DirectorResourcePage` da o‘qituvchi, to‘langan, guruh filter va rangli summa yo‘q edi.

---

## 2026-08-21 — Rasm yo‘q: hamma joyda ikonka

### Nima qilindi
`SafeImage` odam rasmlari, mashina, yo‘l belgilari, darslik, to‘lov sahifasi. URL yo‘q yoki 404 — `UserRound` (yoki `icon`). Imtihon savollari `onBrokenImg` → `no-image.webp`.

### Nima uchun
«Yangi to‘lov kiritish» da buzilgan `<img>` chiqardi; shu xato boshqa sahifalarda ham bor edi.

---

## 2026-08-21 — Guruh to‘lovlari: to‘langan ustunida tahrir

### Nima qilindi
`/groupdetails/:id` «To‘langan» ustunida eski kabi inline tahrir: summa + to‘lov turi + saqlash. `POST /payment-store`. Qarz — pushti, to‘langan — yashil.

### Nima uchun
Eski `GroupDetails.jsx` da qalam bosilganda shu yerda to‘lov kiritilardi; yangi sahifada faqat matn bor edi.

---

## 2026-08-21 — Yangi o‘quvchi qo‘shish: my.gov.uz yo‘riqnoma

### Nima qilindi
`AddStudentPage` placeholder o‘rniga eski `GroupAddingGuid`: ogohlantirish + PDF tugma. PDF: `public/docs/group-add-guide.pdf`. Shared: `Header` `PageMain` `Panel` `Button`.

### Nima uchun
Oddiy tashkilotlarda o‘quvchi/guruh kiritish `my.gov.uz` orqali; mahalliy forma yo‘q edi.

### Tahlil
Mudofaa (`is_defense == 1`) tashkilotlarda eski front MSPD + forma ko‘rsatadi — hali TODO.

---

## 2026-08-21 — To‘lov qo‘shish: magnet ikonka

### Nima qilindi
Qarzni to‘ldirish tugmasi `Input rightSlot` ichida, `size-7`, vertikali markazda.

### Nima uchun
`top-8` + `icon-sm` (`h-9`) input pastidan chiqib ketardi.

---

## 2026-08-21 — Chek print: kun.oy.yil, URL yo‘q

### Nima qilindi
`formatDate` doim `DD.MM.YYYY`. Chop etishda `@page { margin: 0 }` — brauzer sana/URL header-footer chiqmaydi.

---

## 2026-08-21 — Chek modal: select yo‘q, zichroq

### Nima qilindi
Modal `select-none`, ichki ikkinchi karta/scroll olib tashlandi. Qatorlar 2 ustun grid, QR kichikroq.

### Nima uchun
Matn tanlanardi, chek modal ichida yana ramka + scrollbar bor edi.

---

## 2026-08-21 — To‘lov cheki: dizayn + chop etish

### Nima qilindi
Eski `PrintCheck.jsx` asosida chek: chap-o‘ng qatorlar, ikonka, summa yashil, QR, logo-blok. Chop etish `printElement` — yashirin iframe, yangi tab/`about:blank` yo‘q.

### Nima uchun
Modal xunuk edi; `window.open` chop etishda boshqa sahifaga olib ketardi.

---

## 2026-08-21 — Jadval kit: HeaderTR / EmptyTR / TableSearch

### Nima qilindi
`Table.tsx`: `HeaderTR`, `FilterTR`, `EmptyTR`, `TableSearch`. `THead` qatorlarini o‘zi stillaydi. To‘lovlar hisoboti 5 tab shu qismlardan. Badge sahifada qayta stil qilinmaydi.

### Nima uchun
To‘lovlar jadvali guruh/o‘quvchi jadvallaridan farq qilardi (katta pill, boshqa empty).

### Tahlil
Keyin: qolgan list sahifalardagi EmptyState-in-TD ni `EmptyTR` ga o‘tkazish.

---

## 2026-08-21 — Control balandligi doim `h-9`

### Nima qilindi
`Input`, `Select`, `DateInput`, `SearchInput`, `PhoneInput`, `Button` (`sm`/`md`/`lg`), `ExportButton`, `AddButton` — hammasi `h-9`. `size="sm"|"md"` endi faqat label. `CONTROL_HEIGHT` (`Field.tsx`).

### Nima uchun
Headerda sana `h-11`, qidiruv `h-9`/`h-8`, export turli balandlikda edi.

### Tahlil
Textarea `h-auto` qoladi. Keyin: sahifadagi raw `input` larni ham kitga o‘tkazish.

---

## 2026-08-21 — EXPORT skeleton paytida o‘chiq

### Nima qilindi
`ExportButton` `disabled` — query `isLoading` yoki qator yo‘q. To‘lovlar hisoboti (org/guruh/yillik), o‘quv to‘lovlari, guruh to‘lovlari, imtihon natijalari, monitoring, guruh tablarida bo‘sh ro‘yxat.

### Nima uchun
Skeleton ko‘rinayotganda EXPORT bosilsa bo‘sh XLS yuklanardi.

### Tahlil
Ma’lumot kelgach va kamida 1 qator bo‘lgach tugma ochiladi.

---

## 2026-08-21 — Header filter tekis `h-9`

### Nima qilindi
Headerda `DateInput size="sm"` (ixcham `dan`/`gacha`), `SearchInput`, `ExportButton` (eski outline EXPORT), `AddButton` (pill `h-9`). Hammasi bir qator, bir xil balandlik.

### Nima uchun
Sana `h-11`, qidiruv `h-9`, qo‘shish `h-11` aralashib, toolbar xunuk ko‘rinardi.

---

## 2026-08-21 — Show / Edit / Delete / Export tugmalari

### Nima qilindi
`ShowButton`, `EditButton`, `DeleteButton`, `ExportButton` (`src/components/ui/ActionButtons.tsx`). Export `SearchInput` bilan bir xil `h-9`, outline, `EXPORT (.XLS)`. To‘lovlar hisoboti va boshqa ro‘yxatlarda shu komponentlar.

### Nima uchun
Har sahifada export/show/edit/delete qayta stil qilinardi; qidiruv va export balandligi mos emasdi.

---

## 2026-08-21 — Tab URL da saqlanadi

### Nima qilindi
`useUrlTab`: `?tab=` + `replace`. To‘lovlar hisoboti, guruhlar, o‘quvchilar, xarajatlar, o‘zlashtirish, dars qoldirganlar. Link orqali chiqib orqaga qaytganda oxirgi tab ochiq qoladi.

### Nima uchun
Tab `useState` da edi — sahifa unmount bo‘lgach default tabga tushardi.

---

## 2026-08-21 — To‘lovlar hisoboti

### Nima qilindi
`/payment-history`: 5 tab (tarix, tashkilot, guruh, o‘quvchilar, yillik). Tarix: FIO/guruh/usul filter, sana, `POST v2 /create-payment-history`, chek+QR, print. Tashkilot/guruh/yillik: v1 hisobot + EXPORT XLS. O‘quvchi: `/paymentstudents/addpayment` va `/:id` (`GET/POST v1 payment-create`, `get-student-for-payment`, `payment-store`, `payment-delete`).

### Nima uchun
Sahifa generic jadval edi; screenshotdagi tablar, modal, chek va o‘quvchi to‘lovi yo‘q edi.

---

## 2026-08-21 — Tushumlar hisoboti

### Nima qilindi
`/payment-dashboard`: kunlik/oylik tushum kartalari (`GET v2 /school-payment/by-type-payment`) va kunlik ro‘yxat (`GET v2 /school-payment/daily-payment`). Yangilash tugmasi, skeleton, FIO → `/student/:id`.

### Nima uchun
Sahifa generic jadval edi; screenshotdagi kartalar va ro‘yxat yo‘q edi.

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
