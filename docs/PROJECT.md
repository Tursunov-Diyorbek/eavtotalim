# eavtotalim — loyiha holati

**Oxirgi yangilanish:** 2026-09-22  
**Status:** Auth + shell; **o‘quvchi mobil shell** (`src/pages/mobile`, ≤700px, 1-bosqich: dashboard/darslar/testlar); student modullar; student dashboard (zich band layout: gorizontal 4×4 profil, darslar+metrikalar, avtodrom davomat kartasi, stretch/bo‘sh panel yo‘q); direktor dashboard + CRUD; guruh show; o‘quvchilar (qo‘shish = my.gov.uz yo‘riqnoma); darsliklar (fan → toifa → mavzu → kontent); o‘zlashtirish (guruh → o‘quvchi → mavzu); shablon test hisoboti (ro‘yxat → o‘quvchi); dars qoldirganlar (ro‘yxat → davomat); qatnashmaslik sabablari; o‘quvchi yo‘qligi sababi; avtodrom davomat (guruhlar → oylik keldi/ketdi); amaliy davomat (guruhlar → oylik qatnashuv); takroriy imtihonlar (ro‘yxat → natijalar); tashkilot yakuniy imtihoni (ro‘yxat → natijalar); avtodrom shartnomasi (kameralar → yuborish/ko‘rish); xarajatlar boshqaruvi (tab + hisobotlar); tushumlar hisoboti (kunlik/oylik kartalar + ro‘yxat); to‘lovlar hisoboti (5 tab, chek, o‘quvchi to‘lovi); qarzdorlar; pul qaytarish (chetlashtirish); hujjatlar (chop etish: ariza o‘quvchi/guruh, shartnoma, ro‘yxatga olish, yo‘llanma); muammoli vaziyatlar; xabarnomalar; My Gov; direktor murojaatlari; qolgan director sahifalar generic jadval

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
