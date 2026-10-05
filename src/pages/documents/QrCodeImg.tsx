import { useEffect, useState } from 'react'

/** Mahalliy QR — tashqi API yo‘q. `qrcode` paketi bo‘lmasa rasm chiqmaydi. */
export function QrCodeImg({
  data,
  size = 60,
  margin = 2,
}: {
  data: string
  size?: number
  margin?: number
}) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let cancelled = false
    void import('qrcode')
      .then((mod) => {
        const QRCode = (mod as { default?: { toDataURL: typeof import('qrcode').toDataURL } }).default ?? mod
        return QRCode.toDataURL(data, {
          width: size,
          margin,
          errorCorrectionLevel: 'L',
          color: { dark: '#000000', light: '#ffffff' },
        })
      })
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setSrc('')
      })
    return () => {
      cancelled = true
    }
  }, [data, size, margin])

  if (!src) return null
  return <img src={src} alt="" width={size} height={size} />
}
