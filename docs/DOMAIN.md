# Domen modeli (reja)

Bu fayl — kelajakdagi entitylar. Kod hali yo‘q; o‘zgarishi mumkin.

## Asosiy entitylar

```
School (maktab)
  └── Group (guruh)
        └── Student (o‘quvchi) ── Enrollment
  └── Instructor
  └── Lesson / Session (dars / mashg‘ulot)
        └── Attendance (davomat)     // bor / yo‘q / kechikdi
        └── CheckInOut (keldi–ketdi) // vaqt stamp
  └── QuestionBank
        └── Question ── Options
  └── Test / ExamAttempt
        └── AttemptAnswer ── score, duration
  └── Topic (mavzu) — imtihonga tayyorgarlik
```

## Keldi–ketdi vs davomat

| Tushuncha | Ma’nosi |
|-----------|---------|
| **Keldi–ketdi** | Kun yoki sessiya uchun kelish/chiqish vaqti (timestamp) |
| **Davomat** | Dars/mashg‘ulotga rasmiy bor/yo‘q holati |

Bir sessiya ichida ikkalasi bog‘lanishi mumkin (kelgan → davomat=bor).

## Test / imtihon

- **Mashq testi** — o‘quvchi o‘zi ishlaydi, cheksiz
- **Nazorat / imtihon** — vaqt, urinish limiti, admin ochadi
- Natija: foiz, to‘g‘ri/noto‘g‘ri, mavzu bo‘yicha zaif joylar

## Holatlar (Student lifecycle — reja)

`registered` → `active` → `exam_ready` → `graduated` / `dropped`

> Aniq statuslar keyin tasdiqlanadi.
