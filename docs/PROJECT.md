# eavtotalim — loyiha holati

**Oxirgi yangilanish:** 2026-08-14  
**Status:** Auth + shell; student modullar; direktor dashboard + CRUD; o‘quvchilar ro‘yxati + show (header amallari: rasm, turniket, kirish hisoblari, qator tahrir) / edit; muammoli vaziyatlar; xabarnomalar; My Gov arizalar; direktor murojaatlari; qolgan director sahifalar generic jadval

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
| i18n | i18next + react-i18next | Uz / Kiril / Ru |
| Lint | ESLint + react-hooks | — |
| Backend | mavjud API | `apiClient` / `apiClientV2` |
| UI kit | ichki `components/ui` (`Notification`/`notify` ham) | boshlang‘ich |

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
cp .env.example .env   # birinchi marta; VITE_API_URL ni o'zingiznikiga qo'ying
npm run dev            # http://localhost:5173/
npm run build
npm run lint
```

**Base URL:** `.env` → `VITE_PATH_PREFIX`, `VITE_PATH_PREFIX_V2`, `VITE_PATH_PREFIX_FILE`, `VITE_IS_PROD`.  
Kodda: `PATH_PREFIX` / `env.apiUrl` (`src/config/env.ts`).

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
