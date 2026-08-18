export function formatTaskId(value: string | number | null | undefined): string {
  if (value == null || value === '') return '—'
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Eski moment `DD-MM-YYYY, HH:mm:ss`. */
export function formatMyGovDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
