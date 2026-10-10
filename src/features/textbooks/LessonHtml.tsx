import { useEffect, useRef } from 'react'
import { textbookMediaUrl } from './utils'

function isAbsolute(src: string) {
  return /^(https?:|blob:|data:)/i.test(src)
}

function paint(el: HTMLElement, prop: string, value: string) {
  el.style.setProperty(prop, value, 'important')
}

function plainText(el: HTMLElement) {
  return (el.textContent || '').replace(/\u00a0/g, ' ').trim()
}

function isBlank(el: HTMLElement) {
  if (plainText(el)) return false
  return el.querySelector('img, video, audio, iframe, svg, canvas') == null
}

function isImageBox(el: HTMLElement) {
  if (plainText(el)) return false
  return el.querySelectorAll('img').length === 1
}

/** Darslik HTML dagi rasm kataklarini rasmga yopishadi va bo‘sh kulrang joylarni yig‘ishtiradi. */
export function LessonHtml({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const cleanups: Array<() => void> = []

    const drop = (img: HTMLImageElement) => {
      const parent = img.parentElement
      img.remove()
      if (parent && parent !== root && isBlank(parent)) {
        paint(parent, 'display', 'none')
      }
    }

    for (const img of [...root.querySelectorAll('img')]) {
      const raw = (img.getAttribute('src') || '').trim()
      if (!raw || raw === 'null' || raw === 'undefined') {
        drop(img)
        continue
      }
      img.removeAttribute('width')
      img.removeAttribute('height')

      const onError = () => drop(img)
      img.addEventListener('error', onError)
      cleanups.push(() => img.removeEventListener('error', onError))

      const absolute = isAbsolute(raw)
      if (!absolute) img.src = textbookMediaUrl(raw)
      else if (img.complete && img.naturalWidth === 0) drop(img)
    }

    const boxes = [...root.querySelectorAll<HTMLElement>('td, th, div, p, figure, span')].filter(
      (el) => el !== root && isImageBox(el),
    )
    const boxed = new Set<HTMLImageElement>()
    for (const box of boxes) {
      const img = box.querySelector('img')
      if (img) boxed.add(img)
    }

    for (const img of [...root.querySelectorAll('img')]) {
      const gallery = boxed.has(img)
      paint(img, 'display', 'block')
      paint(img, 'position', 'static')
      paint(img, 'width', 'auto')
      paint(img, 'height', 'auto')
      paint(img, 'max-width', gallery ? 'min(100%, 240px)' : '100%')
      paint(img, 'max-height', gallery ? '200px' : '420px')
      paint(img, 'margin', '0 auto')
      paint(img, 'padding', '0')
      paint(img, 'background', 'transparent')
      paint(img, 'box-shadow', 'none')
      paint(img, 'object-fit', 'contain')
    }

    const rows = new Set<HTMLElement>()
    for (const box of boxes) {
      paint(box, 'width', 'auto')
      paint(box, 'height', 'auto')
      paint(box, 'min-height', '0')
      paint(box, 'max-height', 'none')
      paint(box, 'padding', '0')
      paint(box, 'position', 'static')
      paint(box, 'background', 'transparent')
      paint(box, 'background-color', 'transparent')
      paint(box, 'border', 'none')
      paint(box, 'box-shadow', 'none')
      paint(box, 'flex', '0 0 auto')
      if (box.parentElement && box.parentElement !== root) rows.add(box.parentElement)
    }

    for (const row of rows) {
      const kids = [...row.children] as HTMLElement[]
      if (kids.length < 2) continue
      if (!kids.every((kid) => isImageBox(kid) || isBlank(kid))) continue
      for (const kid of kids) {
        if (isBlank(kid)) paint(kid, 'display', 'none')
      }
      paint(row, 'display', 'flex')
      paint(row, 'flex-wrap', 'wrap')
      paint(row, 'justify-content', 'center')
      paint(row, 'align-items', 'center')
      paint(row, 'gap', '16px')
      paint(row, 'width', '100%')
      paint(row, 'height', 'auto')
      paint(row, 'min-height', '0')
      paint(row, 'background', 'transparent')
      paint(row, 'border', 'none')
    }

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }, [html])

  return (
    <div
      ref={ref}
      className="lesson-html lesson-gallery text-justify text-ink"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
