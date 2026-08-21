export const PAYMENT_TYPES = [
  { id: 1, name: 'Plastik karta ( UZCARD)' },
  { id: 2, name: 'Plastik karta (HUMO)' },
  { id: 3, name: 'Naqd' },
  { id: 4, name: "Pul o'tkazma(Perechesleniya)" },
] as const

export const GROUP_STATUSES = [
  { id: 0, nameKey: 'paymentHistoryPage.statusNew' },
  { id: 1, nameKey: 'paymentHistoryPage.statusActive' },
  { id: 2, nameKey: 'paymentHistoryPage.statusFinished' },
] as const
