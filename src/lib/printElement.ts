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
    win.addEventListener('afterprint', cleanup, { once: true })
    window.setTimeout(cleanup, 60_000)
    win.focus()
    win.print()
  }

  void run()
}
