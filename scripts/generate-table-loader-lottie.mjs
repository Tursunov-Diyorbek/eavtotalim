// Jadval sahifasi almashganda chiqadigan Lottie loader.
// Ishga tushirish: node scripts/generate-table-loader-lottie.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SIZE = 120
const C = SIZE / 2
const FR = 60
const OP = 90

const OUT = fileURLToPath(new URL('../src/assets/lottie/table-loader.json', import.meta.url))

function hex(color) {
  const n = parseInt(color.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1]
}

const still = (k) => ({ a: 0, k })
const LINEAR = { i: { x: [1], y: [1] }, o: { x: [0], y: [0] } }
const SMOOTH = { i: { x: [0.35], y: [1] }, o: { x: [0.65], y: [0] } }

function frames(list, curve = LINEAR) {
  return {
    a: 1,
    k: list.map(([t, s], i) => {
      const value = Array.isArray(s) ? s : [s]
      return i === list.length - 1 ? { t, s: value } : { t, s: value, ...curve }
    }),
  }
}

const transform = () => ({
  ty: 'tr',
  p: still([0, 0]),
  a: still([0, 0]),
  s: still([100, 100]),
  r: still(0),
  o: still(100),
  sk: still(0),
  sa: still(0),
})

const ring = (d) => ({ ty: 'el', d: 1, s: still([d, d]), p: still([0, 0]) })

const stroke = (color, width, opacity = 100) => ({
  ty: 'st',
  c: still(hex(color)),
  o: still(opacity),
  w: still(width),
  lc: 2,
  lj: 2,
  ml: 4,
})

const fill = (color, opacity = 100) => ({ ty: 'fl', c: still(hex(color)), o: still(opacity), r: 1 })

let ind = 0
function layer(nm, it, ks = {}) {
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
      p: still([C, C, 0]),
      a: still([0, 0, 0]),
      s: still([100, 100, 100]),
      ...ks,
    },
    ao: 0,
    shapes: [{ ty: 'gr', nm, it: [...it, transform()] }],
    ip: 0,
    op: OP,
    st: 0,
    bm: 0,
  }
}

/** Material uslubidagi yoy: bosh va dum navbat bilan yuguradi. */
function arc(nm, d, color, width, turn, phase = 0) {
  const trim = {
    ty: 'tm',
    s: frames(
      [
        [0 + phase, 0],
        [OP * 0.45 + phase, 0],
        [OP + phase, 100],
      ].map(([t, v]) => [Math.min(t, OP), v]),
      SMOOTH,
    ),
    e: frames(
      [
        [0, 0],
        [OP * 0.55, 100],
        [OP, 100],
      ],
      SMOOTH,
    ),
    o: still(0),
    m: 1,
  }
  return layer(nm, [ring(d), trim, stroke(color, width)], {
    r: frames([
      [0, 0],
      [OP, turn],
    ]),
  })
}

const layers = [
  layer('Markaz', [ring(14), fill('#2f7ea0')], {
    s: frames(
      [
        [0, [85, 85, 100]],
        [OP / 2, [115, 115, 100]],
        [OP, [85, 85, 100]],
      ],
      SMOOTH,
    ),
    o: frames(
      [
        [0, 70],
        [OP / 2, 100],
        [OP, 70],
      ],
      SMOOTH,
    ),
  }),
  arc('Ichki yoy', 52, '#2fa08c', 6, -360),
  arc('Tashqi yoy', 84, '#2f7ea0', 7, 360),
  layer('Iz', [ring(84), stroke('#d0e6ef', 7)]),
]

const animation = {
  v: '5.7.4',
  fr: FR,
  ip: 0,
  op: OP,
  w: SIZE,
  h: SIZE,
  nm: 'Table loader',
  ddd: 0,
  assets: [],
  layers,
}

writeFileSync(OUT, JSON.stringify(animation))
console.log(`table-loader.json: ${JSON.stringify(animation).length} bytes`)
