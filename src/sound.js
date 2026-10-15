// Дыбыс файлсыз: WebAudio арқылы жұмсақ эмбиент пен интерфейс дыбыстары.
let ctx = null
let master = null
let ambient = null
let enabled = false

function ensure() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)
  return ctx
}

function startAmbient() {
  if (!ctx || ambient) return
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 520
  filter.Q.value = 0.6
  const gain = ctx.createGain()
  gain.gain.value = 0.06
  filter.connect(gain).connect(master)
  // Аккорд: A2, E3, A3, C#4 — тыныш музей фоны
  const freqs = [110, 164.81, 220, 277.18]
  const oscs = freqs.flatMap((f, i) => [-4, 4].map((detune) => {
    const o = ctx.createOscillator()
    o.type = i < 2 ? 'sine' : 'triangle'
    o.frequency.value = f
    o.detune.value = detune
    const g = ctx.createGain()
    g.gain.value = i < 2 ? 0.5 : 0.18
    o.connect(g).connect(filter)
    o.start()
    return o
  }))
  // Баяу «тыныс»
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.07
  lfoGain.gain.value = 260
  lfo.connect(lfoGain).connect(filter.frequency)
  lfo.start()
  ambient = { oscs, lfo }
}

export function setSound(on) {
  enabled = on
  if (!ensure()) return
  if (ctx.state === 'suspended') ctx.resume()
  if (on) startAmbient()
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setTargetAtTime(on ? 0.9 : 0, now, 0.4)
}

export function sfx(kind = 'click') {
  if (!enabled || !ctx) return
  const now = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.connect(g).connect(master)
  const presets = {
    click: { type: 'sine', f0: 880, f1: 660, dur: 0.08, vol: 0.08 },
    hover: { type: 'sine', f0: 1320, f1: 1400, dur: 0.05, vol: 0.025 },
    done: { type: 'triangle', f0: 660, f1: 990, dur: 0.28, vol: 0.09 },
    wrong: { type: 'sawtooth', f0: 220, f1: 160, dur: 0.22, vol: 0.05 },
    whoosh: { type: 'sine', f0: 180, f1: 520, dur: 0.45, vol: 0.06 },
  }
  const p = presets[kind] || presets.click
  o.type = p.type
  o.frequency.setValueAtTime(p.f0, now)
  o.frequency.exponentialRampToValueAtTime(p.f1, now + p.dur)
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(p.vol, now + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, now + p.dur)
  o.start(now)
  o.stop(now + p.dur + 0.02)
}
