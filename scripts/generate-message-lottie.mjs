// Bildirishnoma: zamonaviy xabar pufaklari (sariq, ko‘k emas).
// Ishga tushirish: node scripts/generate-message-lottie.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SIZE = 240
const FR = 60
const OP = 120

const OUT = fileURLToPath(new URL('../src/assets/lottie/message.json', import.meta.url))

function rgb(color) {
  const n = parseInt(color.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const still = (k) => ({ a: 0, k })
const SMOOTH = { i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] } }

function frames(list) {
  return {
    a: 1,
    k: list.map(([t, s], i) => {
      const value = Array.isArray(s) ? s : [s]
      return i === list.length - 1 ? { t, s: value } : { t, s: value, ...SMOOTH }
    }),
  }
}

const tr = (extra = {}) => ({
  ty: 'tr',
  p: still([0, 0]),
  a: still([0, 0]),
  s: still([100, 100]),
  r: still(0),
  o: still(100),
  sk: still(0),
  sa: still(0),
  ...extra,
})

const fill = (color, opacity = 100) => ({
  ty: 'fl',
  c: still([...rgb(color), 1]),
  o: still(opacity),
  r: 1,
})

const stroke = (color, width) => ({
  ty: 'st',
  c: still([...rgb(color), 1]),
  o: still(100),
  w: still(width),
  lc: 2,
  lj: 2,
  ml: 4,
})

function gradient(stops, start, end) {
  const colors = []
  const alphas = []
  for (const [pos, color] of stops) {
    colors.push(pos, ...rgb(color))
    alphas.push(pos, 1)
  }
  return {
    ty: 'gf',
    o: still(100),
    r: 1,
    bm: 0,
    g: { p: stops.length, k: still([...colors, ...alphas]) },
    s: still(start),
    e: still(end),
    t: 2,
  }
}

const rect = (w, h, r, x = 0, y = 0) => ({
  ty: 'rc',
  d: 1,
  s: still([w, h]),
  p: still([x, y]),
  r: still(r),
})

const ellipse = (w, h, x = 0, y = 0) => ({
  ty: 'el',
  d: 1,
  s: still([w, h]),
  p: still([x, y]),
})

function path(points) {
  return {
    ty: 'sh',
    d: 1,
    ks: still({
      c: true,
      v: points,
      i: points.map(() => [0, 0]),
      o: points.map(() => [0, 0]),
    }),
  }
}

let ind = 0
function layer(nm, shapes, ks = {}) {
  ind += 1
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm,
    sr: 1,
    ks: {
      o: still(100),
      r: still(0),
      p: still([0, 0, 0]),
      a: still([0, 0, 0]),
      s: still([100, 100, 100]),
      ...ks,
    },
    ao: 0,
    shapes,
    ip: 0,
    op: OP,
    st: 0,
    bm: 0,
  }
}

function float(x, y, lift) {
  return frames([
    [0, [x, y, 0]],
    [OP / 2, [x, y - lift, 0]],
    [OP, [x, y, 0]],
  ])
}

function dot(x, delay) {
  const peak = 16 + delay
  return {
    ty: 'gr',
    nm: 'nuqta',
    it: [
      ellipse(15, 15),
      fill('#fffdf6'),
      tr({
        p: still([x, 2]),
        s: frames([
          [0, [78, 78]],
          [delay, [78, 78]],
          [peak, [128, 128]],
          [peak + 18, [78, 78]],
          [OP, [78, 78]],
        ]),
      }),
    ],
  }
}

const shadow = layer(
  'Soya',
  [
    {
      ty: 'gr',
      nm: 'soya',
      it: [ellipse(128, 18), fill('#0f2430', 16), tr()],
    },
  ],
  {
    p: float(118, 178, -3),
    s: still([150, 150, 100]),
    o: frames([
      [0, 30],
      [OP / 2, 55],
      [OP, 30],
    ]),
  },
)

const rear = layer(
  'Orqa xabar',
  [
    {
      ty: 'gr',
      nm: 'qator',
      it: [rect(62, 8, 4, -6, -10), fill('#c9842a'), tr()],
    },
    {
      ty: 'gr',
      nm: 'qator 2',
      it: [rect(42, 8, 4, -16, 10), fill('#e0ad55'), tr()],
    },
    {
      ty: 'gr',
      nm: 'pufak',
      it: [
        rect(124, 76, 24),
        path([
          [28, -6],
          [58, -28],
          [34, 14],
        ]),
        fill('#fff6e4'),
        stroke('#e7b15a', 3.5),
        tr(),
      ],
    },
  ],
  { p: float(146, 96, -5), s: still([150, 150, 100]) },
)

const front = layer(
  'Old xabar',
  [
    dot(-36, 0),
    dot(0, 12),
    dot(36, 24),
    {
      ty: 'gr',
      nm: 'pufak',
      it: [
        rect(168, 108, 34),
        path([
          [-18, 46],
          [-8, 72],
          [22, 46],
        ]),
        gradient(
          [
            [0, '#ffe7a3'],
            [1, '#e0941c'],
          ],
          [-40, -40],
          [55, 50],
        ),
        tr(),
      ],
    },
  ],
  { p: float(112, 132, 6), s: still([150, 150, 100]) },
)

const animation = {
  v: '5.7.4',
  fr: FR,
  ip: 0,
  op: OP,
  w: SIZE,
  h: SIZE,
  nm: 'Message',
  ddd: 0,
  assets: [],
  layers: [front, rear, shadow],
}

writeFileSync(OUT, JSON.stringify(animation))
console.log(`message.json: ${JSON.stringify(animation).length} bytes`)
