export const TARIFF_TELEGRAM = 'https://t.me/avtointalim'
export const TARIFF_INSTAGRAM = 'https://www.instagram.com/avto.intalim.uz/'
export const TARIFF_PHONE = '+998900994477'
export const TARIFF_PHONE_HREF = 'tel:+998900994477'
export const TARIFF_TELEGRAM_LABEL = '@avtointalim'
export const TARIFF_INSTAGRAM_LABEL = '@avto.intalim.uz'

export type TariffPlanId = 'base' | 'comfort' | 'comfortPlus'

export type TariffFeature = {
  id: number
  key: string
  children?: string[]
}

/** Eski ProversionInfos ro‘yxati — 1–16 BASE, 1–21 COMFORT, 1–25 COMFORT+. */
export const TARIFF_FEATURES: TariffFeature[] = [
  { id: 1, key: 'f1' },
  { id: 2, key: 'f2' },
  { id: 3, key: 'f3' },
  { id: 4, key: 'f4' },
  { id: 5, key: 'f5' },
  { id: 6, key: 'f6' },
  { id: 7, key: 'f7' },
  { id: 8, key: 'f8' },
  { id: 9, key: 'f9' },
  { id: 10, key: 'f10' },
  { id: 11, key: 'f11' },
  { id: 12, key: 'f12' },
  { id: 13, key: 'f13' },
  { id: 14, key: 'f14' },
  { id: 15, key: 'f15' },
  { id: 16, key: 'f16' },
  {
    id: 17,
    key: 'f17',
    children: ['f17a', 'f17b', 'f17c', 'f17d', 'f17e', 'f17f', 'f17g', 'f17h'],
  },
  { id: 18, key: 'f18', children: ['f18a', 'f18b', 'f18c', 'f18d'] },
  { id: 19, key: 'f19', children: ['f19a', 'f19b', 'f19c', 'f19d', 'f19e'] },
  { id: 20, key: 'f20' },
  { id: 21, key: 'f21' },
  { id: 22, key: 'f22' },
  { id: 23, key: 'f23' },
  { id: 24, key: 'f24', children: ['f24a'] },
  { id: 25, key: 'f25' },
]

export type TariffPlan = {
  id: TariffPlanId
  nameKey: string
  percent: number
  price: number
  includedUntil: number
  featured?: boolean
  tone: 'signal' | 'teal' | 'violet'
}

export const TARIFF_PLANS: TariffPlan[] = [
  {
    id: 'base',
    nameKey: 'tariff.base',
    percent: 0,
    price: 0,
    includedUntil: 16,
    tone: 'signal',
  },
  {
    id: 'comfort',
    nameKey: 'tariff.comfort',
    percent: 11,
    price: 41250,
    includedUntil: 21,
    featured: true,
    tone: 'teal',
  },
  {
    id: 'comfortPlus',
    nameKey: 'tariff.comfortPlus',
    percent: 15,
    price: 56250,
    includedUntil: 25,
    tone: 'violet',
  },
]
