function fitSheetsToA4(iframe: HTMLIFrameElement, doc: Document, selector: string) {
  iframe.style.left = '0'
  iframe.style.top = '0'
  iframe.style.width = '210mm'
  iframe.style.height = '297mm'
  const mm = 96 / 25.4
  const pageH = 297 * mm
  const bodyStyle = doc.defaultView?.getComputedStyle(doc.body)
  const pad =
    (parseFloat(bodyStyle?.paddingTop || '0') || 0) +
    (parseFloat(bodyStyle?.paddingBottom || '0') || 0)
  const available = pageH - pad - 4
  doc.querySelectorAll<HTMLElement>(selector).forEach((sheet) => {
    const height = sheet.scrollHeight
    if (height <= available) return
    const zoom = Math.max(0.62, (available / height) * 0.985)
    sheet.style.zoom = String(zoom)
  })
}
function waitForImages(doc: Document) {
  const images = Array.from(doc.images)
  if (!images.length) return Promise.resolve()
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  )
}

export type PrintElementOptions = {
  /** Faqat body padding / shrift. `@page { margin }` qo‘ymang — Chrome URL/sana chizadi. */
  extraCss?: string
  /** Mos element A4 dan baland bo‘lsa, bitta varaqqa sig‘guncha kichraytiriladi. */
  fitOnePage?: string
}

/**
 * Joriy sahifadan chiqmasdan chop etadi (yangi tab / about:blank yo‘q).
 * `@page { margin: 0 }` majburiy: brauzer domen va sana chiqarmasin.
 */
export function printElement(
  node: HTMLElement | null,
  _title?: string,
  options?: PrintElementOptions,
) {
  if (!node || typeof document === 'undefined') return

  document.getElementById('eavt-print-frame')?.remove()

  const prevTitle = document.title
  document.title = ' '

  const iframe = document.createElement('iframe')
  iframe.id = 'eavt-print-frame'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.setAttribute('title', ' ')
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    document.title = prevTitle
    iframe.remove()
    return
  }

  const styles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]'),
  )
    .map((el) => el.outerHTML)
    .join('')

  doc.open()
  doc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title> </title>${styles}<style>
      html, body { background: #fff !important; margin: 0 !important; padding: 6mm; }
      ${options?.extraCss ?? ''}
      @page { margin: 0 !important; }
    </style></head><body></body></html>`,
  )
  doc.close()

  const clone = node.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')
  doc.body.appendChild(clone)

  const cleanup = () => {
    document.title = prevTitle
    iframe.remove()
  }

  const run = async () => {
    await waitForImages(doc)
    if (doc.fonts?.ready) await doc.fonts.ready
    if (options?.fitOnePage) fitSheetsToA4(iframe, doc, options.fitOnePage)
    win.addEventListener('afterprint', cleanup, { once: true })
    window.setTimeout(cleanup, 60_000)
    win.focus()
    win.print()
  }

  void run()
}
