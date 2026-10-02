/** Xabar ohangi — bildirishnoma chiqqan zahoti chaladi. */

const SOUND_URL = '/sounds/message.wav?v=7'

let audio: HTMLAudioElement | null = null
let ctx: AudioContext | null = null
let lastChimeAt = 0
let wired = false

function element(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(SOUND_URL)
    audio.preload = 'auto'
    audio.load()
  }
  return audio
}

function audioContext(): AudioContext | null {
  const Ctor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  return ctx
}

function tone(
  context: AudioContext,
  freq: number,
  start: number,
  duration: number,
  peak: number,
) {
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(context.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function playOscillators(context: AudioContext) {
  const now = context.currentTime
  tone(context, 349.23, now, 0.95, 0.05)
  tone(context, 440, now, 0.95, 0.035)
  tone(context, 523.25, now, 0.95, 0.025)
}

function systemChime(title: string, body: string) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  try {
    const note = new Notification(title || 'Bildirishnoma', {
      body,
      silent: false,
      tag: 'eavt-announce',
    })
    window.setTimeout(() => note.close(), 1600)
  } catch {
    /* ruxsat yo‘q */
  }
}

/** Login bosilganda ovoz kanalini ochadi. */
export function primeMessageAudio() {
  const context = audioContext()
  if (!context) return
  void context.resume()
  try {
    const buffer = context.createBuffer(1, 1, context.sampleRate)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    source.start()
  } catch {
    /* kontekst yopiq */
  }
  const el = element()
  el.muted = true
  void el.play().then(
    () => {
      el.pause()
      el.currentTime = 0
      el.muted = false
    },
    () => {
      el.muted = false
    },
  )
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    void Notification.requestPermission()
  }
}

export function playMessageChime(title = '', body = '') {
  const now = Date.now()
  if (now - lastChimeAt < 600) return
  lastChimeAt = now

  const context = audioContext()
  if (context && context.state !== 'running') void context.resume()

  const el = element()
  el.muted = false
  el.volume = 0.45
  try {
    el.currentTime = 0
  } catch {
    /* hali tayyor emas */
  }
  void el.play().then(
    () => undefined,
    () => {
      if (context?.state === 'running') {
        playOscillators(context)
        return
      }
      systemChime(title, body)
    },
  )
}

function wireUnlock() {
  if (wired || typeof window === 'undefined') return
  wired = true
  element()
  const unlock = () => {
    const context = audioContext()
    if (context && context.state !== 'running') void context.resume()
  }
  window.addEventListener('pointerdown', unlock, true)
  window.addEventListener('keydown', unlock, true)
}

wireUnlock()
