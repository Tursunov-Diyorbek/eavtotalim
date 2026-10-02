// Login sahifasi uchun rasmiy «line-art» Lottie: perspektivali yo‘l + qalqon emblema.
// Ishga tushirish: node scripts/generate-login-lottie.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const W = 800
const H = 640
const FR = 30
const OP = 360

const OUT = fileURLToPath(new URL('../src/assets/lottie/road-emblem.json', import.meta.url))

const CYAN = '#9ed4e8'
const WHITE = '#ffffff'
const TEAL = '#5fd3bc'

function hex(color) {
  const n = parseInt(color.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1]
}

const still = (k) => ({ a: 0, k })
const LINEAR = { i: { x: [1], y: [1] }, o: { x: [0], y: [0] } }
const EASE_IN = { i: { x: [0.9], y: [1] }, o: { x: [0.55], y: [0] } }
const EASE = { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } }

function frames(list, curve = LINEAR) {
  const unique = list.filter((item, i) => i === list.length - 1 || list[i + 1][0] !== item[0])
  return {
    a: 1,
    k: unique.map(([t, s], i) => {
      const value = Array.isArray(s) ? s : [s]
      return i === unique.length - 1 ? { t, s: value } : { t, s: value, ...curve }
    }),
  }
}

const transform = (extra = {}) => ({
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

const fill = (color, opacity = still(100)) => ({ ty: 'fl', c: still(hex(color)), o: opacity, r: 1 })

function stroke(color, width, opacity = still(100), dash) {
  const s = {
    ty: 'st',
    c: still(hex(color)),
    o: opacity,
    w: still(width),
    lc: 2,
    lj: 2,
    ml: 4,
  }
  if (dash) {
    s.d = [
      { n: 'd', nm: 'dash', v: still(dash.dash) },
      { n: 'g', nm: 'gap', v: still(dash.gap) },
      { n: 'o', nm: 'offset', v: dash.offset ?? still(0) },
    ]
  }
  return s
}

const ellipse = (cx, cy, w, h) => ({ ty: 'el', d: 1, s: still([w, h]), p: still([cx, cy]) })

function path(v, { closed = false, i, o } = {}) {
  return {
    ty: 'sh',
    d: 1,
    ks: still({ i: i ?? v.map(() => [0, 0]), o: o ?? v.map(() => [0, 0]), v, c: closed }),
  }
}

const trim = (s, e, o = still(0)) => ({ ty: 'tm', s, e, o, m: 1 })

const group = (nm, it, tr = {}) => ({ ty: 'gr', nm, it: [...it, transform(tr)] })

let ind = 0
function layer(nm, shapes, ks = {}, timing = {}) {
  ind += 1
  const st = timing.st ?? 0
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
    ip: timing.ip ?? 0,
    op: timing.op ?? OP,
    st,
    bm: 0,
  }
}

function random(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ---------- Geometriya ----------
const VP = [400, 340]
const BOTTOM = H
const HALF_TOP = 14
const HALF_BOTTOM = 330
const EMBLEM = [400, 168]

const edgeX = (side, y) => {
  const f = (y - VP[1]) / (BOTTOM - VP[1])
  return VP[0] + side * (HALF_TOP + f * (HALF_BOTTOM - HALF_TOP))
}

// ---------- Yulduz zarralari ----------
function particles() {
  const rnd = random(11)
  const shapes = []
  for (let n = 0; n < 34; n++) {
    const x = 30 + rnd() * (W - 60)
    const y = 20 + rnd() * (VP[1] - 60)
    const size = 1.6 + rnd() * 2.2
    const phase = rnd() * 120
    const k = []
    for (let t = 0; t <= OP; t += 30) {
      k.push([t, 18 + 42 * (0.5 + 0.5 * Math.sin(((t + phase) / 120) * Math.PI * 2))])
    }
    shapes.push(group('Zarra', [ellipse(x, y, size, size), fill(CYAN, frames(k, EASE))]))
  }
  return layer('Zarralar', shapes)
}

// ---------- Ufq ----------
function horizon() {
  return layer('Ufq', [
    group('Chiziq', [
      path([
        [40, VP[1]],
        [W - 40, VP[1]],
      ]),
      stroke(CYAN, 1.2, still(35)),
    ]),
    group('Yog‘du 3', [ellipse(VP[0], VP[1], 90, 8), fill(WHITE, still(45))]),
    group('Yog‘du 2', [ellipse(VP[0], VP[1], 300, 26), fill(CYAN, still(14))]),
    group('Yog‘du 1', [ellipse(VP[0], VP[1], 640, 70), fill(CYAN, still(6))]),
  ])
}

// ---------- Yo‘l ----------
function roadLines() {
  const lane = (side, t) => [
    [VP[0] + side * HALF_TOP * t, VP[1]],
    [VP[0] + side * HALF_BOTTOM * t, BOTTOM],
  ]
  const flow = frames([
    [0, 0],
    [OP, -60 * 12],
  ])
  return layer('Yo‘l', [
    group('Chetlar', [
      path(lane(-1, 1)),
      path(lane(1, 1)),
      stroke(WHITE, 2, still(40)),
    ]),
    group('Bo‘lak chiziqlari', [
      path(lane(-1, 1 / 3)),
      path(lane(1, 1 / 3)),
      stroke(CYAN, 2, still(55), { dash: 26, gap: 34, offset: flow }),
    ]),
    group('Asfalt', [
      path([...lane(-1, 1), ...lane(1, 1).reverse()], { closed: true }),
      fill(CYAN, still(5)),
    ]),
  ])
}

/** Ko‘ndalang chiziqlar ufqdan pastga — tezlik hissi. */
function crossLines() {
  const layers = []
  const DUR = 120
  const COUNT = 6
  const widthAt = (y) => edgeX(1, y) - edgeX(-1, y)
  const full = widthAt(BOTTOM)
  const startScale = (widthAt(VP[1]) / full) * 100
  for (let n = 0; n < COUNT; n++) {
    const offset = (n * DUR) / COUNT
    for (const st of [offset - DUR, offset, offset + DUR, offset + DUR * 2]) {
      if (st >= OP || st + DUR <= 0) continue
      layers.push(
        layer(
          'Ko‘ndalang',
          [
            group('Chiziq', [
              path([
                [-full / 2, 0],
                [full / 2, 0],
              ]),
              stroke(CYAN, 1.4),
            ]),
          ],
          {
            p: frames(
              [
                [0, [VP[0], VP[1], 0]],
                [DUR, [VP[0], BOTTOM, 0]],
              ],
              EASE_IN,
            ),
            s: frames(
              [
                [0, [startScale, 100, 100]],
                [DUR, [100, 100, 100]],
              ],
              EASE_IN,
            ),
            o: frames(
              [
                [0, 0],
                [DUR * 0.35, 38],
                [DUR * 0.85, 22],
                [DUR, 0],
              ],
              EASE,
            ),
          },
          { st, ip: Math.max(0, st), op: Math.min(OP, st + DUR) },
        ),
      )
    }
  }
  return layers
}

/** Yo‘l bo‘ylab ko‘ruvchiga qarab keluvchi yorug‘lik izlari. */
function lightTrails() {
  const DUR = 90
  const trail = (t, st) => {
    const line = [
      [VP[0] + HALF_TOP * t, VP[1]],
      [VP[0] + HALF_BOTTOM * t, BOTTOM],
    ]
    return layer(
      'Yorug‘lik izi',
      [
        group('Iz', [
          path(line),
          trim(
            frames(
              [
                [0, 0],
                [DUR, 100],
              ],
              EASE_IN,
            ),
            frames(
              [
                [0, 6],
                [DUR * 0.8, 100],
                [DUR, 100],
              ],
              EASE_IN,
            ),
          ),
          stroke(WHITE, 3, frames([[0, 0], [15, 90], [DUR * 0.8, 70], [DUR, 0]], EASE)),
        ]),
      ],
      {},
      { st, ip: Math.max(0, st), op: Math.min(OP, st + DUR) },
    )
  }
  const out = []
  const plan = [
    [-2 / 3, 0],
    [2 / 3, 60],
    [0.02, 130],
    [-2 / 3, 200],
    [2 / 3, 260],
  ]
  for (const [t, st] of plan) out.push(trail(t, st))
  return out
}

// ---------- Emblema ----------
const SHIELD = {
  v: [
    [0, -62],
    [52, -44],
    [52, 4],
    [0, 64],
    [-52, 4],
    [-52, -44],
  ],
  i: [
    [-18, -2],
    [-20, -2],
    [0, -26],
    [24, -12],
    [0, 26],
    [0, 0],
  ],
  o: [
    [18, -2],
    [0, 0],
    [0, 26],
    [-24, -12],
    [0, -26],
    [20, -2],
  ],
}

function shieldPath(scale = 1) {
  return path(
    SHIELD.v.map(([x, y]) => [x * scale, y * scale]),
    {
      closed: true,
      i: SHIELD.i.map(([x, y]) => [x * scale, y * scale]),
      o: SHIELD.o.map(([x, y]) => [x * scale, y * scale]),
    },
  )
}

function emblem() {
  const [x, y] = EMBLEM
  const float = frames(
    [
      [0, [x, y, 0]],
      [OP / 4, [x, y - 6, 0]],
      [OP / 2, [x, y, 0]],
      [(OP * 3) / 4, [x, y - 6, 0]],
      [OP, [x, y, 0]],
    ],
    EASE,
  )
  return layer(
    'Qalqon',
    [
      group('Belgi', [
        path([
          [-20, 2],
          [-6, 17],
          [22, -14],
        ]),
        stroke(TEAL, 6),
      ]),
      group('Nur', [
        shieldPath(),
        trim(still(0), still(14), frames([[0, 0], [OP, 720]])),
        stroke(WHITE, 3.2),
      ]),
      group('Kontur', [shieldPath(), stroke(CYAN, 2, still(85))]),
      group('Ichki', [shieldPath(0.8), stroke(CYAN, 1, still(35)), fill(CYAN, still(10))]),
      group('Asos', [shieldPath(), fill('#0f2430', still(55))]),
    ],
    { p: float },
  )
}

function rings() {
  const [x, y] = EMBLEM
  const ring = (nm, d, width, opacity, dash, rotation) =>
    layer(
      nm,
      [group('Halqa', [ellipse(0, 0, d, d), stroke(CYAN, width, still(opacity), dash)])],
      { p: still([x, y, 0]), r: rotation },
    )
  return [
    ring('Halqa ichki', 196, 1.4, 45, { dash: 4, gap: 10 }, frames([[0, 0], [OP, 90]])),
    ring('Halqa tashqi', 236, 1, 30, { dash: 60, gap: 24 }, frames([[0, 0], [OP, -60]])),
  ]
}

function pulses() {
  const [x, y] = EMBLEM
  const DUR = 120
  return [0, 120, 240].map((st) =>
    layer(
      'Impuls',
      [group('Impuls', [ellipse(0, 0, 150, 150), stroke(CYAN, 1.6)])],
      {
        p: still([x, y, 0]),
        s: frames(
          [
            [0, [80, 80, 100]],
            [DUR, [190, 190, 100]],
          ],
          { i: { x: [0.2], y: [1] }, o: { x: [0.3], y: [0] } },
        ),
        o: frames([[0, 0], [12, 45], [DUR, 0]], EASE),
      },
      { st, ip: st, op: Math.min(OP, st + DUR) },
    ),
  )
}

function emblemGlow() {
  const [x, y] = EMBLEM
  return layer(
    'Emblema yog‘dusi',
    [
      group('Yog‘du', [ellipse(0, 0, 260, 260), fill(CYAN, still(7))]),
      group('Yog‘du ichki', [ellipse(0, 0, 150, 150), fill(CYAN, still(9))]),
    ],
    {
      p: still([x, y, 0]),
      s: frames(
        [
          [0, [100, 100, 100]],
          [OP / 2, [110, 110, 100]],
          [OP, [100, 100, 100]],
        ],
        EASE,
      ),
    },
  )
}

const layers = [
  emblem(),
  ...rings(),
  ...pulses(),
  emblemGlow(),
  ...lightTrails(),
  ...crossLines(),
  roadLines(),
  horizon(),
  particles(),
]

const animation = {
  v: '5.7.4',
  fr: FR,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: 'Road emblem',
  ddd: 0,
  assets: [],
  layers,
}

writeFileSync(OUT, JSON.stringify(animation))
console.log(`road-emblem.json: ${layers.length} layers, ${JSON.stringify(animation).length} bytes`)
