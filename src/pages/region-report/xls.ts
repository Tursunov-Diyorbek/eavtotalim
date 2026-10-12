export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function downloadTableXls(filename: string, tableHtml: string) {
  const blob = new Blob([`\uFEFF${tableHtml}`], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

export function yesterdayLabel() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}
