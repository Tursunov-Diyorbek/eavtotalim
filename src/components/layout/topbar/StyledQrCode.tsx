import { useLayoutEffect, useRef, useId } from 'react'
import QRCode from 'qrcode'

function IntalimMark({ width = 72 }: { width?: number }) {
  const gid = useId().replace(/:/g, '')

  return (
    <svg
      width={width}
      height={Math.round(width * 0.24)}
      viewBox="0 0 80 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gid}
          x1="0"
          y1="4"
          x2="20"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2EE6C5" />
          <stop offset="55%" stopColor="#5B9EFF" />
          <stop offset="100%" stopColor="#005ED0" />
        </linearGradient>
      </defs>
      <path
        d="M4.24852 6.68813V18.8484H0V6.68813H4.24852Z"
        fill={`url(#${gid})`}
      />
      <path
        d="M14.6231 6.57975C16.0248 6.57975 17.1375 7.0494 17.9612 7.9887C18.7849 8.91355 19.1967 10.1708 19.1967 11.7603V18.8484H14.9482V12.3239C14.9482 11.6303 14.7676 11.0884 14.4063 10.6982C14.045 10.2936 13.5609 10.0913 12.954 10.0913C12.3182 10.0913 11.8196 10.2936 11.4584 10.6982C11.0971 11.0884 10.9165 11.6303 10.9165 12.3239V18.8484H6.66794V6.68813H10.9165V8.42222C11.2922 7.87309 11.798 7.43234 12.4338 7.09998C13.0696 6.75316 13.7994 6.57975 14.6231 6.57975Z"
        fill={`url(#${gid})`}
      />
      <path
        d="M28.7027 15.2285V18.8484H26.8602C23.7533 18.8484 22.1999 17.3094 22.1999 14.2314V10.2213H20.7042V6.68813H28.681V10.2213H26.4701V14.2964C26.4701 14.6288 26.5423 14.8672 26.6868 15.0118C26.8458 15.1563 27.1059 15.2285 27.4672 15.2285H28.7027Z"
        fill="#005ED0"
      />
      <path
        d="M29.9577 12.7574C29.9577 11.5002 30.1817 10.402 30.6297 9.46267C31.0921 8.52338 31.7135 7.80084 32.4938 7.29506C33.2886 6.78929 34.1701 6.5364 35.1383 6.5364C35.9765 6.5364 36.699 6.70258 37.3059 7.03495C37.9129 7.36732 38.3825 7.81529 38.7149 8.37887V6.68813H42.9634V18.8484H38.7149V17.1577C38.3825 17.7213 37.9056 18.1692 37.2843 18.5016C36.6773 18.834 35.962 19.0002 35.1383 19.0002C34.1701 19.0002 33.2886 18.7473 32.4938 18.2415C31.7135 17.7357 31.0921 17.0132 30.6297 16.0739C30.1817 15.1201 29.9577 14.0147 29.9577 12.7574ZM38.7149 12.7574C38.7149 11.9771 38.4981 11.3629 38.0646 10.915C37.6455 10.467 37.1253 10.243 36.5039 10.243C35.8681 10.243 35.3406 10.467 34.9216 10.915C34.5025 11.3485 34.2929 11.9627 34.2929 12.7574C34.2929 13.5378 34.5025 14.1592 34.9216 14.6216C35.3406 15.0696 35.8681 15.2935 36.5039 15.2935C37.1253 15.2935 37.6455 15.0696 38.0646 14.6216C38.4981 14.1736 38.7149 13.5522 38.7149 12.7574Z"
        fill="#005ED0"
      />
      <path
        d="M49.6329 0.333496V18.8484H45.3843V0.333496H49.6329Z"
        fill="#005ED0"
      />
      <path
        d="M56.3008 6.68813V18.8484H52.0523V6.68813H56.3008Z"
        fill="#005ED0"
      />
      <path
        d="M74.6088 6.57975C76.1406 6.57975 77.34 7.04218 78.207 7.96702C79.0885 8.89187 79.5293 10.1563 79.5293 11.7603V18.8484H75.2808V12.3239C75.2808 11.6736 75.1001 11.1679 74.7389 10.8066C74.3776 10.4453 73.8863 10.2647 73.2649 10.2647C72.6435 10.2647 72.1522 10.4453 71.7909 10.8066C71.4296 11.1679 71.249 11.6736 71.249 12.3239V18.8484H67.0005V12.3239C67.0005 11.6736 66.8199 11.1679 66.4586 10.8066C66.1118 10.4453 65.6277 10.2647 65.0063 10.2647C64.3705 10.2647 63.8719 10.4453 63.5106 10.8066C63.1494 11.1679 62.9687 11.6736 62.9687 12.3239V18.8484H58.7202V6.68813H62.9687V8.29217C63.3445 7.77194 63.8286 7.36009 64.421 7.05663C65.028 6.73871 65.7216 6.57975 66.5019 6.57975C67.3979 6.57975 68.1927 6.77484 68.8863 7.16501C69.5944 7.55518 70.1507 8.10431 70.5554 8.81239C70.9889 8.14766 71.5597 7.61298 72.2678 7.20836C72.9759 6.78929 73.7562 6.57975 74.6088 6.57975Z"
        fill="#005ED0"
      />
    </svg>
  )
}

const FINDER = 7
const MARGIN = 2

function inFinder(row: number, col: number, n: number) {
  return (
    (row < FINDER && col < FINDER) ||
    (row < FINDER && col >= n - FINDER) ||
    (row >= n - FINDER && col < FINDER)
  )
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | number[],
  color: string,
) {
  const list = Array.isArray(radii) ? radii : [radii, radii, radii, radii]
  const maxR = Math.min(w, h) / 2
  const [tl, tr, br, bl] = list.map((v) => Math.max(0, Math.min(v, maxR)))

  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, [tl, tr, br, bl])
  } else {
    ctx.moveTo(x + tl, y)
    ctx.lineTo(x + w - tr, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr)
    ctx.lineTo(x + w, y + h - br)
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
    ctx.lineTo(x + bl, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl)
    ctx.lineTo(x, y + tl)
    ctx.quadraticCurveTo(x, y, x + tl, y)
    ctx.closePath()
  }
  ctx.fillStyle = color
  ctx.fill()
}

function drawFinder(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  cell: number,
) {
  const outer = FINDER * cell
  fillRoundRect(ctx, ox, oy, outer, outer, cell * 1.45, '#000')
  fillRoundRect(
    ctx,
    ox + cell,
    oy + cell,
    outer - cell * 2,
    outer - cell * 2,
    cell,
    '#fff',
  )
  fillRoundRect(
    ctx,
    ox + cell * 2,
    oy + cell * 2,
    outer - cell * 4,
    outer - cell * 4,
    cell * 0.65,
    '#000',
  )
}

function drawQr(canvas: HTMLCanvasElement, value: string, cssSize: number) {
  const qr = QRCode.create(value, { errorCorrectionLevel: 'H' })
  const n = qr.modules.size
  const total = n + MARGIN * 2
  const dpr = window.devicePixelRatio || 1

  canvas.width = Math.round(cssSize * dpr)
  canvas.height = Math.round(cssSize * dpr)
  canvas.style.width = `${cssSize}px`
  canvas.style.height = `${cssSize}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, cssSize, cssSize)

  const cell = cssSize / total
  const ox = MARGIN * cell
  const oy = MARGIN * cell
  const get = (row: number, col: number) =>
    row >= 0 && col >= 0 && row < n && col < n && !!qr.modules.get(row, col)

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (inFinder(row, col, n) || !get(row, col)) continue
      const top = get(row - 1, col)
      const right = get(row, col + 1)
      const bottom = get(row + 1, col)
      const left = get(row, col - 1)
      const r = cell / 2
      fillRoundRect(
        ctx,
        ox + col * cell,
        oy + row * cell,
        cell,
        cell,
        [
          top || left ? 0 : r,
          top || right ? 0 : r,
          bottom || right ? 0 : r,
          bottom || left ? 0 : r,
        ],
        '#000',
      )
    }
  }

  drawFinder(ctx, ox, oy, cell)
  drawFinder(ctx, ox + (n - FINDER) * cell, oy, cell)
  drawFinder(ctx, ox, oy + (n - FINDER) * cell, cell)
}

export function StyledQrCode({
  value,
  size = 200,
  alt = 'QR kod',
}: {
  value: string
  size?: number
  alt?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    if (!canvasRef.current || !value) return
    try {
      drawQr(canvasRef.current, value, size)
    } catch {
      // silent — QR chizilmasa tooltip bo‘sh qoladi
    }
  }, [value, size])

  const logoW = Math.round(size * 0.36)

  return (
    <div
      className="relative mx-auto mt-2 overflow-hidden rounded-lg bg-white select-none"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} aria-label={alt} className="block" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white px-[7px] pt-[5px] pb-1 leading-none"
      >
        <IntalimMark width={logoW} />
      </div>
    </div>
  )
}
