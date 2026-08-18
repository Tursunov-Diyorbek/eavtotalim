# Qarorlar (ADR — Architecture Decision Records)

Format: yangi qaror **yuqoriga** (eng yangisi birinchi).

---

## ADR-019 — Login draft (logout dan keyin)

**Sana:** 2026-08-18  
**Status:** Qabul qilingan  
**Kontekst:** Xato login da maydonlar saqlansin; logout dan keyin ham oxirgi login/parol forma ochilganda turishi kerak. Auth sessiyasi `localStorage` dan tozalanadi.  
**Qaror:**

- Oxirgi kiritilgan login/parol `sessionStorage` (`eav_login_draft`) da
- `clearAuthSession` draft ni o‘chirmaydi
- Tab yopilsa draft yo‘qoladi (localStorage emas)

**Oqibat:** Chiqish → login sahifasida login va parol qayta to‘ladi.

---

## ADR-018 — Qidiruv API debounce 1000ms

**Sana:** 2026-08-14  
**Status:** Qabul qilingan  
**Kontekst:** `useDeferredValue` har belgidan keyin ham API chaqirardi (`index-applications` va boshqa listlar). 500ms ham tez tuyuldi.  
**Qaror:**

- `SearchInput` o‘zi debounce qiladi (`SEARCH_DEBOUNCE_MS = 1000`)
- Input matni darhol, `onChange` (va shu orqali API) yozish to‘xtagach 1 soniya
- Sahifada `useDebouncedValue` takrorlanmasin (ikki marta kutish)
- Lokal filter: `debounceMs={0}` (sidebar, darslar)
- `type="time"|"date"` — debounce yo‘q
- Sidebar / lokal filter (darslar) API emas — debounce shart emas

**Oqibat:** Kamroq so‘rov, sayt sekinlashmaydi.

---

## ADR-017 — O‘chirish doim ConfirmDialog

**Sana:** 2026-08-14  
**Status:** Qabul qilingan  
**Kontekst:** Guruh/mashina o‘chirish ad-hoc `Modal` da edi; matn har xil.  
**Qaror:**

- Shared `ConfirmDialog` (`components/ui`) — asosiy savol doim `common.reallyConfirm` («Haqiqatdan tasdiqlaysizmi?»)
- Ixtiyoriy `description` (nom)
- Yangi o‘chirish faqat shu komponent orqali

**Oqibat:** Tasdiq UX bir xil; sahifada qayta yozilmaydi.

---

## ADR-016 — Direktor menyusi to‘liq chiqadi, UI keyin

**Sana:** 2026-08-14  
**Status:** Qabul qilingan  
**Kontekst:** Direktor roli uchun faqat dashboard/profil/o‘quvchilar bor edi; qolgan ~40 sahifa kutilyotgan edi.  
**Qaror:**

- Menyu eski `director_links` tuzilmasida (12 bo‘lim)
- Band faqat `PAGE_ACCESS` ruxsati bo‘lsa chiqadi (`null` — dashboard, profil, FAQ); tekis ro‘yxat, bo‘lim sarlavhasi yo‘q
- `directorEditData` `PAGE_ACCESS = null` (MSPD to‘ldirish ochiq qoladi)
- Implement qilinmagan sahifalar `DirectorResourcePage` (list API); create/edit keyin
- FAQ / video guides — statik kontent

**Oqibat:** Permission berilgach band menyuda va route da ochiladi; UI keyin to‘ldiriladi.

---

## ADR-015 — Dashboard rol bo‘yicha

**Sana:** 2026-08-14  
**Status:** Qabul qilingan  
**Kontekst:** Bitta dashboard o‘quvchi profil maydonlarini direktorlarga ham chiqarardi.  
**Qaror:**

- `isDirectorRole` → `DirectorDashboard` (tashkilot KPI, toifalar, tushum, kameralar)
- Boshqa rollar → `StudentDashboard` (`/me` + avtodrom enrollment/kamera)
- Direktor statistikasi asosan `/me.profession.organization.report`

**Oqibat:** Har rol o‘z dashboardini ko‘radi; yangi rol qo‘shilsa alohida sahifa.

---

## ADR-014 — Shared UI kit (`components/ui`)

**Sana:** 2026-08-12  
**Status:** Qabul qilingan (yangilandi)  
**Kontekst:** Sahifalarda button/pagination/empty qayta-qayta stil qilinardi — UI bir xil emas.  
**Qaror:**

- Umumiy: `Button`, `Pagination`, `EmptyState`, `ErrorMessage`, `Badge`, `Panel`, `Table`, `SearchInput`, `Skeleton*`, `Notification` + `notify.*`
- Toast: `NotificationProvider` (`AppProviders`); imperative `notify.success|error|info|warning`
- Inline banner: `<Notification tone="warning|info|…" />` (hint / shartnoma)
- Import faqat `@/components/ui`
- Qoida: `.cursor/rules/shared-ui.mdc` (+ `global-ux.mdc`)

**Oqibat:** Yangi UI avval shared kitdan; kerak bo‘lsa kitga qo‘shiladi.

---

## ADR-013 — Global skeleton loading + global scroll

**Sana:** 2026-08-12  
**Status:** Qabul qilingan (yangilandi)  
**Kontekst:** Progress bar yoqmadi; ma’lumot kelgunicha joyida skeleton kerak.  
**Qaror:**

- UI loading = `Skeleton` / tayyor skeleton shablonlar
- Har query/sahifa `isLoading` da skeleton
- Scroll: `globals.css` da `*` uchun yupqa signal scrollbar (5px)
- Qoida: `.cursor/rules/global-ux.mdc`

**Oqibat:** Yangi API UI — doim skeleton until data.

---

## ADR-012 — Dashboard manbai: `/me` to‘liq maydonlar

**Sana:** 2026-08-12  
**Status:** Qabul qilingan  
**Kontekst:** Dashboard faqat `user` + ruxsatlarni ko‘rsatardi; eski student UI dagi F.I.O/org `/me.profession` / `study_info` da.  
**Qaror:**

- `MeData` tipida `profession`, `study_info`, `organization_id`, comfort/strict flaglar
- Dashboard birinchi navbatda shu maydonlardan (qo‘shimcha so‘rovsiz — `AuthProvider` state)
- Davomat/to‘lov/jadval/imtihon — alohida API (TODO); `/me` ga qo‘shilmaydi

**Oqibat:** Login’dan keyin dashboard boy profil ko‘rsatadi; statistik bloklar keyinroq.

---

## ADR-011 — Aksent ranglar + rol rangi

**Sana:** 2026-08-10  
**Status:** Qabul qilingan  
**Kontekst:** Faqat oq/ko‘k — interfeys quruq ko‘rindi.  
**Qaror:**

- `globals.css` `@theme` da aksent tokenlar: violet, teal, amber, rose, indigo (+ `-soft`)
- Rang faqat token orqali — komponentda hex yozilmaydi
- Rol rangi bir joyda: `config/roles.ts` → `TONE_CLASS`
- Menyu bandi rangi: `config/nav.ts` → `NAV_TONE`

**Oqibat:** Yangi modul qo‘shilsa — `nav.ts` da `tone` berish yetarli.

---

## ADR-010 — Soft collapsible AppShell

**Sana:** 2026-08-10  
**Status:** Qabul qilingan  
**Qaror:**

- Shell sidebar ochiq/yumshoq (`#f8fbfd`…), emas to‘q gradient
- Desktop: ochib-yopiladi (248px ↔ 72px), `eav_sidebar_collapsed`
- Yuqori panel ixcham (h-11); sahifa `Header` bir qator
- Til almashtirish top barda

---

## ADR-009 — API so‘rov: dedupe + no StrictMode

**Sana:** 2026-08-10  
**Status:** Qabul qilingan  
**Kontekst:** Dev Network: captcha 2×, ko‘p `.tsx` (Vite HMR).  
**Qaror:**

- `dedupeAsync` — parallel bir xil so‘rov = 1 HTTP
- Captcha mount-once; refresh `force`
- `StrictMode` yo‘q (effect x2 API chaqiruvlarini oldini olish)
- Ko‘p script = faqat `npm run dev`; prod `build` da bundle

**Oqibat:** Login/sahifa ochilishida har endpoint odatda 1 marta.

---

## ADR-008 — /me, rol home, permission route

**Sana:** 2026-08-10  
**Status:** Qabul qilingan  
**Qaror:**

- Login → token → `GET /auth/me?token=`
- `user.role` raqami bo‘yicha home (`config/access.ts`)
- Sahifalar `PAGE_ACCESS` permission; `superadmin` bypass
- Guard: `RequireAuth` / `GuestOnly`

---

## ADR-007 — i18n: Uz / Kiril / Ru

**Sana:** 2026-08-10  
**Status:** Qabul qilingan  
**Kontekst:** Butun loyiha 3 tilda.  
**Qaror:** `i18next` + `react-i18next`; locale kodlari `uz` | `kiril` | `ru`; fayllar `src/i18n/locales/*.json`; tanlov `localStorage` (`eav_lang`).  
**Oqibat:** UI matnlari `t('...')` orqali; yangi matn uchun 3 JSON ni yangilash shart.

---

## ADR-006 — API base URL `.env` da (gitignore)

**Sana:** 2026-08-10  
**Status:** Qabul qilingan  
**Kontekst:** Base URL har muhitda farq qiladi; gitga ketmasligi kerak.  
**Qaror:**

- Haqiqiy qiymat: `.env` → `VITE_PATH_PREFIX`, `VITE_PATH_PREFIX_V2`, `VITE_PATH_PREFIX_FILE`, `VITE_IS_PROD` (gitignore)
- Namuna: `.env.example` (gitda)
- Kod: `PATH_PREFIX*` / `IS_PROD` / `env.*` (`src/config/env.ts`) → `api/client.ts`

**Oqibat:** Secret/local URL repo’da bo‘lmaydi; clone qilganda `.env.example` dan nusxa.

---

## ADR-005 — Senior `src/` struktura + React Router

**Sana:** 2026-08-10  
**Status:** Qabul qilingan  
**Kontekst:** Katta prava-o‘quv tizimi uchun scale qilinadigan layout kerak.  
**Qaror:**

- Qatlamlar: `app`, `pages`, `components`, `features`, `api`, `types`, `styles`, `hooks`, `lib`, `config`
- Alias `@/*` (Vite + TS paths, `baseUrl` yo‘q — TS 6)
- `react-router-dom@7` — `createBrowserRouter` + `AppShell`
- Sahifa ingichka; domen logika `features/` + `api/`

**Oqibat:** Aniq chegaralar; yangi modul qo‘shish oson. Batafsil: `docs/STRUCTURE.md`.

---

## ADR-004 — Tailwind v4 + TanStack Query v5

**Sana:** 2026-08-10  
**Status:** Qabul qilingan  
**Kontekst:** Frontend asosiy tooling kerak (stil + server state).  
**Qaror:**

- `tailwindcss@4.3.3` + `@tailwindcss/vite` (Vite 8 bilan mos)
- `@tanstack/react-query@5.101.4` — `QueryClientProvider` `main.tsx` da, client `src/lib/queryClient.ts`

**Oqibat:** Utility CSS va API cache/hooks tayyor; routing va UI kit hali yo‘q.

---

## ADR-003 — Mahsulot: prava / haydovchilik o‘quv tizimi

**Sana:** 2026-08-10  
**Status:** Qabul qilingan (talab)  
**Kontekst:** Foydalanuvchi loyihani ta’rifladi.  
**Qaror:** `eavtotalim` — o‘quvchilarni prava olishgacha boshqarish: keldi–ketdi, davomat, testlar, imtihonga tayyorgarlik.  
**Modullar (MVP yo‘nalishi):** o‘quvchilar, guruhlar, keldi–ketdi, davomat, testlar, tayyorgarlik.  
**Oqibat:** UI va API shu domen atrofida; landing emas, operatsion tizim. Backend stack hali tanlanmagan.

---

## ADR-002 — Loyiha xotirasi `docs/` + Cursor rule

**Sana:** 2026-08-10  
**Status:** Qabul qilingan  
**Kontekst:** Katta proekt 0 dan quriladi; chatlar oralig‘ida kontekst yo‘qolmasligi kerak.  
**Qaror:**

- `docs/PROJECT.md`, `WORKLOG.md`, `DECISIONS.md`, `INDEX.md`
- `.cursor/rules/project-docs.mdc` — har mazmunli ishdan keyin hujjat yangilash majburiy

**Oqibat:** Agent eski yozuvlarga tayanib davom etadi; biroz yozish vaqti qo‘shiladi.

---

## ADR-001 — Frontend asos: Vite + React + TypeScript

**Sana:** 2026-08-10 (mavjud holatni qayd)  
**Status:** Qabul qilingan (starter)  
**Kontekst:** Repoda allaqachon Vite React-TS template bor.  
**Qaror:** Hozircha shu stackdan boshlaymiz; mahsulot talabi chiqqach routing/state/backend alohida ADR.  
**Oqibat:** Tez UI prototip; backend yo‘q.
