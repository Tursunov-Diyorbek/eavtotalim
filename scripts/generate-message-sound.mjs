// Bildirishnoma ovozi: mayin F-major akkord, bir vaqtda.
// Ishga tushirish: node scripts/generate-message-sound.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const RATE = 44100
const DURATION = 1.25
const OUT = fileURLToPath(new URL('../public/sounds/message.wav', import.meta.url))

const total = Math.floor(RATE * DURATION)
const samples = new Float64Array(total)

function addNote(freq, startSec, dur, amp) {
  const start = Math.floor(startSec * RATE)
  const len = Math.min(Math.floor(dur * RATE), total - start)
  for (let i = 0; i < len; i++) {
    const t = i / RATE
    const attack = Math.min(1, t / 0.09)
    const env = attack * Math.exp(-1.55 * t)
    const partial =
      Math.sin(2 * Math.PI * freq * t) * 0.94 +
      Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-4 * t) * 0.06
    samples[start + i] += partial * env * amp
  }
}

addNote(349.23, 0, 1.2, 0.42)
addNote(440, 0, 1.2, 0.3)
addNote(523.25, 0, 1.2, 0.22)

const fade = Math.floor(RATE * 0.16)
for (let i = 0; i < fade; i++) samples[total - 1 - i] *= i / fade

let peak = 0
for (let i = 0; i < total; i++) peak = Math.max(peak, Math.abs(samples[i]))
const gain = peak > 0 ? 0.42 / peak : 1

const data = Buffer.alloc(total * 2)
for (let i = 0; i < total; i++) {
  const v = Math.max(-1, Math.min(1, samples[i] * gain))
  data.writeInt16LE(Math.round(v * 32767), i * 2)
}

const header = Buffer.alloc(44)
header.write('RIFF', 0)
header.writeUInt32LE(36 + data.length, 4)
header.write('WAVE', 8)
header.write('fmt ', 12)
header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20)
header.writeUInt16LE(1, 22)
header.writeUInt32LE(RATE, 24)
header.writeUInt32LE(RATE * 2, 28)
header.writeUInt16LE(2, 32)
header.writeUInt16LE(16, 34)
header.write('data', 36)
header.writeUInt32LE(data.length, 40)

writeFileSync(OUT, Buffer.concat([header, data]))
console.log(`message.wav: ${36 + data.length + 8} bytes, ${DURATION}s`)
