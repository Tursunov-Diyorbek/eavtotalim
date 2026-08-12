# Kod struktura (senior layout)

**Oxirgi yangilanish:** 2026-08-12

## Diagramma

```
src/
  main.tsx                 # entry
  app/                     # App shell: providers, router
  pages/                   # dashboard, lessons, road-signs, penalties, appeals, …
  components/
    ui/                    # Button, Input, Modal, Select, …
    layout/                # AppShell, Sidebar, Header
  features/                # auth, lessons, road-signs, penalties, appeals, …
  i18n/                    # uz / kiril / ru locales
  api/                     # HTTP client, endpoints, queryKeys
  types/                   # Shared domain types
  styles/                  # globals.css (Tailwind)
  hooks/, lib/, config/
```

## Qoidalar

| Qatlam | Nima yoziladi | Nima yozilmaydi |
|--------|---------------|-----------------|
| `pages/` | Layout + feature hook chaqirish | Og‘ir business logika |
| `features/` | Domen hook/UI/logic | Umumiy Button |
| `components/ui` | Qayta ishlatiladigan UI | API chaqiriq |
| `api/` | fetch/client + query keys | JSX |
| `types/` | Shared tip | Feature-faqat tip (feature ichida bo‘lishi mumkin) |

## Import

```ts
import { Button } from '@/components/ui'
import { useStudentsQuery } from '@/features/students'
import { routes } from '@/config'
```

Alias: `@/*` → `src/*` (Vite + TS paths, `baseUrl` siz — TS 6).
