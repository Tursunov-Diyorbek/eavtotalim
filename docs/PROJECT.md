# eavtotalim — loyiha holati

**Oxirgi yangilanish:** 2026-09-22  
**Status:** Auth + shell; **o‘quvchi mobil shell** (`src/pages/mobile`, ≤700px, 1-bosqich: dashboard/darslar/testlar); student modullar; student dashboard (zich band layout: gorizontal 4×4 profil, darslar+metrikalar, avtodrom davomat kartasi, stretch/bo‘sh panel yo‘q); direktor dashboard + CRUD; guruh show; o‘quvchilar (qo‘shish = my.gov.uz yo‘riqnoma); darsliklar (fan → toifa → mavzu → kontent); o‘zlashtirish (guruh → o‘quvchi → mavzu); shablon test hisoboti (ro‘yxat → o‘quvchi); aralash test hisoboti (ro‘yxat); mavzulashtirilgan test hisoboti (ro‘yxat → mavzular); yakuniy test hisoboti (ro‘yxat → savollar); dars qoldirganlar (ro‘yxat → davomat); qatnashmaslik sabablari; o‘quvchi yo‘qligi sababi; avtodrom davomat (guruhlar → oylik keldi/ketdi); amaliy davomat (guruhlar → oylik qatnashuv); takroriy imtihonlar (ro‘yxat → natijalar); tashkilot yakuniy imtihoni (ro‘yxat → natijalar); avtodrom shartnomasi (kameralar → yuborish/ko‘rish); xarajatlar boshqaruvi (tab + hisobotlar); tushumlar hisoboti (kunlik/oylik kartalar + ro‘yxat); to‘lovlar hisoboti (5 tab, chek, o‘quvchi to‘lovi); qarzdorlar; pul qaytarish (chetlashtirish); hujjatlar (chop etish: ariza o‘quvchi/guruh, shartnoma, ro‘yxatga olish, yo‘llanma); muammoli vaziyatlar; xabarnomalar; My Gov; direktor murojaatlari; qolgan director sahifalar generic jadval

## Maqsad

O‘quvchilarni **haydovchilik guvohnomasi (prava) olishgacha** boshqarish va o‘qitish tizimi:

- keldi–ketdi (kirish / chiqish)
- davomat
- testlar
- imtihonga tayyorgarlik
- shunga o‘xshash o‘quv jarayonini tizimlashtirish

## Auditoriyasi (rollar)

| Rol | Vazifa (reja) |
|-----|----------------|
| O‘quvchi | Davomat ko‘rish, test ishlash, imtihonga tayyorlanish |
| Instruktor / o‘qituvchi | Guruh, dars, keldi–ketdi, baholash |
| Admin / maktab | O‘quvchilar, guruhlar, hisobotlar, sozlamalar |
| Avtodrom (rol 32) | Bosh sahifa: kameralar, statistika, bugungi guruh va o‘quvchilar. Shartnomalar (`menu.user.agreements`). Guruh arizalari (`menu.autodrome.autodrome_organization_group_application`). Guruhlar (`menu.autodrome.autodrome_organization_groups`). Haftalik jadval (`menu.user.autodrome_organization_group_week_days_schedule`) |
| Respublika GAI (rol 8) va YHXX (rol 9) | Bosh sahifa: viloyatlar bo‘yicha kunlik hisobot, O‘zbekiston 3D xaritasi (balandlik — faol o‘quvchilar), avtomaktab turlari. `GET v2 /daily-rs-report/index-region`, `GET v2 /organization/index-by-superior`. Viloyat YHXX (`menu.user.region_road_safety`, `/region-road-safety`). Barcha avtomaktablar (`menu.regional_inspectors.all_organizations`, `/all-organizations`). O‘qituvchilar (`menu.regional_inspectors.regional_teachers`, `/regional-teachers`). Viloyatlar bo‘yicha hisobot (`menu.inspection.inspectionregionreport`, `/inspectionregionreport`). Avtomaktablar bo‘yicha hisobot (`menu.road_safety.reports_by_avtoschools`, `/reports-by-avtoschools`). Viloyat bo‘yicha o‘quvchilar (`menu.road_safety.road_safety.reports.student_by_region`, `/road-safety/reports/student-by-region`). Viloyat bo‘yicha guruhlar (`menu.road_safety.road_safety.reports.student_by_group`, `/road-safety/reports/student-by-group`). Avtomobillar (`menu.regional_inspectors.regional_cars`, `/regional-cars`). Xonalar (`menu.regional_inspectors.regional_rooms`, `/regional-rooms`). 393-qaror (`menu.user.report_by_region`, `/report-by-region`). Kunlik davomat (`menu.user.attendance.daily`, `/attendance/daily`). Oylik hisobot (`menu.user.monthly_report`, `/monthly-report`). Qatnashmaslik sabablari (`menu.user.absence_reason_index`, `/absence-reason-index`). O‘quvchi yo‘qligi sababi (`menu.user.reason_student_absence`, `/reason-student-absence`). Avtodromdagi davomat (`menu.regional_inspectors.autodrome_organization_group_res_gai`, `/autodrome-organization-group-res-gai`). Hisoblangan ballar (`menu.user.risk_indicator.monthly_risk_indicator_score`, `/risk-indicator/monthly-risk-indicator-score`). Tashkilotlar bo‘yicha risk (`menu.user.risk_indicator.monthly_risk_indicator_score_by_organization`, `/risk-indicator/monthly-risk-indicator-score-by-organization`). Tekshiruv uchun hodimlar (`menu.user.risk_indicator.inspectors`, `/risk-indicator/inspectors`). Tekshiruvlar (`menu.user.risk_indicator.inspections`, `/risk-indicator/inspections`). Avtomaktablar bo‘yicha reyting (`menu.user.organization_gai_rating.by_organization`, `/organization-gai-rating/by-organization`). Reyting ballari umumiy ro‘yxati (`menu.user.organization_gai_ratings`, `/organization-gai-ratings`) |

> Rol detalari hali tasdiqlanmagan — MVP da kamida Admin + O‘quvchi.

## Modullar (domen)

| Modul | Tavsif | MVP? |
|-------|--------|------|
| O‘quvchilar | Ro‘yxat, profil, guruhga biriktirish | Ha |
| Guruhlar / kurslar | Nazariya / amaliyot guruhlari | Ha |
| Keldi–ketdi | Kunlik kelish / ketish vaqti | Ha |
| Davomat | Dars / mashg‘ulot bo‘yicha bor / yo‘q | Ha (keldi–ketdi bilan bog‘liq) |
| Testlar | Savol banki, variantlar, natija | Ha |
| Imtihonga tayyorgarlik | Mashq testlari, mavzular, progress | Ha (testlar asosida) |
| Hisobotlar | Davomat %, test o‘rtachasi | Keyinroq |
| To‘lov / shartnoma | — | Keyinroq / noma’lum |

Batafsil entitylar: [DOMAIN.md](./DOMAIN.md)

## Stack (hozir)

| Qatlam | Texnologiya | Versiya |
|--------|-------------|---------|
| UI | React | ^19.2 |
| Build | Vite | ^8.2 |
| Til | TypeScript | ~6.0 |
| CSS | Tailwind CSS (`@tailwindcss/vite`) | ^4.3.3 |
| Server state | TanStack React Query | ^5.101.4 |
| Routing | React Router | ^7.18 |
| Crop | react-easy-crop (turniket rasmi) | ^6.2 |
| i18n | i18next + react-i18next | Uz / Kiril / Ru |
| Lint | ESLint + react-hooks | — |
| Backend | mavjud API | `apiClient` / `apiClientV2` |
| UI kit | ichki `components/ui` (`PageMain fill` + `Table`/`FilterTH`) | list jadvallar header ostini to‘ldiradi |

## Papka tuzilmasi (hozir)

Batafsil: [STRUCTURE.md](./STRUCTURE.md)

```
src/
  app/          # providers, router, App
  pages/        # dashboard, students, attendance, tests
  components/   # ui + layout
  features/     # students hooks (va keyin boshqalar)
  api/          # client, query-keys, endpoints
  types/
  styles/globals.css
  hooks/, lib/, config/
  main.tsx
```

## Ishga tushirish

```bash
cp .env.example .env
cp src/utils/appvariables.example.js src/utils/appvariables.js
npm run dev            # http://localhost:5173/
npm run build
npm run lint
```

**Base URL:** `src/utils/appvariables.js` (gitga ketmaydi). Lokal `http://back.intalim.uz`. HTTPS sayt: `env.ts` API ni `/api` va `/v2/api` qiladi, `public/.htaccess` backend ga proxy.

## Noma’lum / TODO (foydalanuvchidan)

- [x] Mahsulot nima — prava / haydovchilik o‘quv tizimi
- [ ] Aniq rollar va ruxsatlar
- [ ] Keldi–ketdi: QR, PIN, qo‘lda belgilash?
- [ ] Testlar: GAI rasmiy savollar yoki o‘z banki?
- [ ] Backend (Supabase / Firebase / custom)
- [ ] Dizayn / brend
- [ ] Til: faqat o‘zbek yoki ko‘p tilli?

## Cheklovlar

- Commit faqat foydalanuvchi so‘raganda
- Hujjatlar `docs/` da; har ish tahlil bilan yoziladi
