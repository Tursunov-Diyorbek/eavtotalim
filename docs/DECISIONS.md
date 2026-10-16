# Qarorlar (ADR — Architecture Decision Records)

Format: yangi qaror **yuqoriga** (eng yangisi birinchi).

---

## ADR-028 — O‘quvchi mobil shell ≤700px

**Sana:** 2026-09-22  
**Status:** Qabul qilingan  
**Kontekst:** Eski `Students/Mobile` telefon UI; yangi loyihada desktop `AppShell` tor ekranda noqulay.  
**Qaror:**

- `window.innerWidth <= 700` + `role === student` → `StudentMobileShell` (`src/pages/mobile`), desktop sidebar/header yashirinadi.
- 1-bosqich: screen-state (dashboard, darslar, testlar hub + shablon/aralash/saqlangan/barcha); dars detail/take — mavjud route.
- Dizayn: `global.css` saqlanadi; antd Drawer o‘rniga CSS drawer.
- Take sahifalardagi «mobile app yuklab oling» gate o‘chiriladi.

**Oqibat:** 2-bosqichda qolgan ekranlar shu shell ichida.

---

## ADR-027 — O‘quvchi/guruh kiritish: my.gov.uz

**Sana:** 2026-08-21  
**Status:** Qabul qilingan  
**Kontekst:** Eski `/student/add` oddiy tashkilotda forma emas, `GroupAddingGuid` (my.gov.uz + PDF). O‘quvchilar 2-bosqichda Yagona darcha orqali kiritiladi.  
**Qaror:**

- Yangi o‘quvchi sahifasi mahalliy CRUD forma qilmasin.
- Ogohlantirish + `public/docs/group-add-guide.pdf`.
- Mudofaa (`is_defense == 1`) forma — TODO, eski `AddStudent.js` kabi.

**Oqibat:** Guruh yaratish ham shu yo‘riqnoma bilan moslashishi mumkin.

---

## ADR-026 — Jadval kit: HeaderTR / FilterTR / EmptyTR / TableSearch

**Sana:** 2026-08-21  
**Status:** Qabul qilingan  
**Kontekst:** Har sahifada `Table` qayta yig‘ilgan: boshqa hover, EmptyState className, Badge `px-2 py-1`. To‘lovlar tarixi guruhlar/o‘quvchilar jadvalidan farq qilgan.  
**Qaror:**

- Faqat `src/components/ui/Table.tsx`.
- `HeaderTR` + `FilterTR` + `FilterTH` + `TableSearch` (`SearchInput size="sm"`).
- Bo‘sh: `EmptyTR` (EmptyState TD ichida yozilmasin).
- `THead` 1-qator `head`, 2-qator `filter` stillarini o‘zi qo‘yadi.
- Jadvalda `Badge` default; sahifa `className` bilan kattalashtirmasin.

**Oqibat:** Yangi ro‘yxat sahifasi shu qismlardan yig‘iladi.

---

## ADR-025 — Sidebar: ichki sahifada ota-menyu yonadi

**Sana:** 2026-08-20  
**Status:** Qabul qilingan  
**Kontekst:** `NavLink` faqat `to` prefiksini (`/textbooks/…`) yonadi. `/textbooks_lessons`, `/group/:id`, `/student/:id` boshqa path — menyu o‘chib qolardi.  
**Qaror:**

- Default: `pathname === to` yoki `to/` ostida.
- Prefiks tushmasa: `NAV_NESTED_MATCH[page]` (darsliklar, guruh, o‘quvchi, o‘qituvchi).
- Eng uzun prefiks yutadi (bitta item).
- Mos kelmasa — oxirgi yongan menyu (`sessionStorage`) saqlanadi.

**Oqibat:** Yangi nested URL `to` ostida bo‘lmasa, `NAV_NESTED_MATCH` ga qo‘shiladi.

---

## ADR-024 — Darsliklar: eski nested URL

**Sana:** 2026-08-20  
**Status:** Qabul qilingan  
**Kontekst:** Eski `TextBooks` oqimi `/textbooks` → `/textbooks_lessons/:id` → `/subjectclasses/:id` → `/viewsubject/:id`. Yangida faqat generic jadval bor edi, drill-in yo‘q.  
**Qaror:** Eski pathlar saqlanadi. List `GET /textbook`; toifalar `GET /textbook-show`; mavzular `GET /chapters-by-edutype-lesson`; kontent `POST /content-show`. Karta rangi `id` hash (eski `getRandomColor` har renderda o‘zgarardi). Mavzular soni API `topics_count` (36 hardcode yo‘q). Superadmin kontent editor hozircha yo‘q.  
**Oqibat:** Bookmark va Orqaga fan → toifa → mavzu → kontent zanjirida ishlaydi.

---

## ADR-023 — Orqaga: kirgan sahifaga qaytish

**Sana:** 2026-08-20  
**Status:** Qabul qilingan  
**Kontekst:** Show/form sahifalar `navigate(routes.cars|students|groups|…)` qilardi. Guruh show → avto show → Orqaga avtolar ro‘yxatiga ketardi. React Router 7 `history.state.idx` ham doim bo‘lmasligi mumkin.  
**Qaror:**

- `NavigationHistoryTracker` (`sessionStorage` stack) SPA ichidagi push/replace/pop ni yozadi. Tab `replace: true` yangi yozuv ochmaydi.
- `useSmartBack(fallback)`: ichki tarix bo‘lsa `navigate(-1)`, bo‘lmasa `fallback` (to‘g‘ridan-to‘g‘ri URL).
- Muvaffaqiyatli create/save ro‘yxatga qolishi mumkin; **Orqaga / Bekor** faqat `goBack`.

**Oqibat:** Qaysi sahifadan kirilsa, Orqaga o‘sha sahifaga qaytadi.

---

## ADR-022 — Guruh show ichki sahifalar: eski URL

**Sana:** 2026-08-20  
**Status:** Qabul qilingan  
**Kontekst:** Eski front bookmark/linklari: `/groupdetails/:id`, `/final-marks/:id`, `/info-final-exam-results/:id`. Yangida `/group-details` allaqachon o‘quvchi «guruh tafsilotlari» sahifasi.  
**Qaror:** Eski pathlar saqlanadi (`groupPayments`, `groupFinalMarks`, `groupExamResults`). `/group-details` o‘zgarmaydi.  
**Oqibat:** Direktor guruh show tugmalari eski havolalar bilan ochiladi.

---

## ADR-021 — Ro‘yxat jadvallari: Header + fill canvas

**Sana:** 2026-08-19  
**Status:** Qabul qilingan  
**Kontekst:** Filtrlar sarlavha kataklariga siqilgan; header ostida bo‘sh joy qolgan.  
**Qaror:**

- Shell canvas scroll qilmaydi; sahifa `Header` yuqorida, `PageMain` pastida.
- Ro‘yxat: `PageMain fill` + `Table` qolgan balandlikni to‘ldiradi.
- Ustun filtrlari: 1-qator nom, 2-qator `FilterTH`.

**Oqibat:** Barcha asosiy CRUD/list jadvallar Guruhlar sahifasi kabi joylashadi.

---

## ADR-020 — Rasm kesish: `react-easy-crop`

**Sana:** 2026-08-19  
**Status:** Qabul qilingan  
**Kontekst:** Eski `ImgCropUploader` (`react-easy-crop`, 370/472, 3×3 grid, image-gate) yangi show headerda oddiy preview modal edi.  
**Qaror:**

- `react-easy-crop` qayta o‘rnatildi
- Umumiy `ImageCropModal` — asosiy rasm, imtihon rasmi, `adapt-current` oqimi
- Kesilgan fayl: `POST /v2/api/image-gate/process`; saqlash: `manual-change-image` / `manual-change-exam-image`

**Oqibat:** Turniket moslash UI eski bilan bir xil (crop + qoidalar + gradient tugma).

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

## ADR-006 — API base URL `appvariables.js` da (gitignore)

**Sana:** 2026-08-18  
**Status:** Qabul qilingan (yangilangan)  
**Kontekst:** Eski front `AppVariables.js` da prod/dev comment. Gitga URL ketmasin. HTTPS sahifadan `http://back.intalim.uz` mixed-content; `https://back.intalim.uz` sertifikati 2026-07-21 da tugagan (ZeroSSL).  
**Qaror:**

- Haqiqiy: `src/utils/appvariables.js` (gitignore)
- Namuna: `src/utils/appvariables.example.js`
- Lokal HTTP: fayldagi `http://back.intalim.uz` o‘zgarmaydi
- **Dev (`vite`)**: `env.ts` absolute API ni same-origin `/api` va `/v2/api` qiladi; `vite.config.ts` proxy target = `appvariables.js` origin
- **HTTPS staging** (`newdesign.intalim.uz` va boshqa non-trusted host): cross-origin `https://back…` ham same-origin (CORS faqat `eavtotalim.uz`)
- **HTTPS `eavtotalim.uz`**: absolute `https://back.eavtotalim.uz` o‘zgarmaydi (CORS OK)
- HTTPS + `http://` API: mixed-content → same-origin
- Deploy: `vite build` `api-bridge.php` + `.htaccess` yozadi — `/api` va `/v2/api` PHP cURL orqali `appvariables` originiga (http yoki https). `SSLProxyEngine` ishlatilmaydi.
- Lokal Vite proxy: xuddi shu `appvariables` origin.

**Oqibat:** Staging (`newdesign.intalim.uz`) da ham prod backend ishlaydi; CORS chetlab o‘tiladi. Serverda PHP + curl kerak.

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
