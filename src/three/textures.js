import * as THREE from 'three'

const cache = new Map()
function make(key, w, h, draw) {
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const g = c.getContext('2d')
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  cache.set(key, t)
  return t
}

// Тұрақты псевдокездейсоқ сандар — әр жүктеуде бірдей сурет
export function rng(seed = 1) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

export function parchmentBg(g, w, h, seed = 3) {
  const r = rng(seed)
  const grd = g.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.8)
  grd.addColorStop(0, '#f1e3bf'); grd.addColorStop(1, '#cfb27a')
  g.fillStyle = grd; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(120,80,30,${r() * 0.06})`
    g.fillRect(r() * w, r() * h, r() * 3 + 1, r() * 3 + 1)
  }
}

export function scribble(g, x, y, width, lines, lh, seed = 7, color = 'rgba(60,35,15,0.8)') {
  const r = rng(seed)
  g.strokeStyle = color; g.lineWidth = 1.6; g.lineCap = 'round'
  for (let l = 0; l < lines; l++) {
    let cx = x
    const cy = y + l * lh
    const end = x + width * (l % 5 === 4 ? 0.55 : 0.92 + r() * 0.08)
    g.beginPath(); g.moveTo(cx, cy)
    while (cx < end) {
      const wlen = 10 + r() * 26
      for (let k = 0; k < wlen; k += 3) g.lineTo(cx + k, cy + Math.sin((cx + k) * 0.9) * 2.4 * r() - r() * 2)
      cx += wlen + 6 + r() * 4
      g.moveTo(cx, cy)
    }
    g.stroke()
  }
}

export const manuscriptTex = () => make('manuscript', 512, 720, (g, w, h) => {
  parchmentBg(g, w, h, 5)
  g.fillStyle = '#7a1f12'; g.font = 'bold 58px serif'; g.fillText('ℵ', 40, 92)
  scribble(g, 110, 60, 360, 2, 30, 11)
  scribble(g, 40, 150, 430, 13, 30, 13)
  g.strokeStyle = 'rgba(80,40,10,0.7)'; g.lineWidth = 2
  g.beginPath(); g.arc(150, 610, 62, 0, Math.PI * 2); g.stroke()
  g.beginPath(); g.moveTo(88, 610); g.lineTo(212, 610); g.moveTo(150, 548); g.lineTo(150, 672); g.stroke()
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.moveTo(150, 610); g.lineTo(150 + Math.cos(a) * 62, 610 + Math.sin(a) * 62); g.stroke() }
  scribble(g, 250, 570, 220, 4, 28, 17)
})

export const screenTex = () => make('screen', 512, 384, (g, w, h) => {
  g.fillStyle = '#04140a'; g.fillRect(0, 0, w, h)
  g.font = '20px monospace'; g.fillStyle = '#58ff9a'
  const lines = ['> RUN SIMULATION', 'F = G·m1·m2 / r²', 'DNA: ATG CCA TTG GCA', 'for (t in history) {', '   learn(t);', '}', '> 1945 ENIAC ...OK', '> 1969 ARPANET ..OK', '> 2026 MUSEUM  ..OK', '█']
  lines.forEach((l, i) => g.fillText(l, 24, 40 + i * 34))
  for (let y = 0; y < h; y += 3) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, y, w, 1) }
})

export const boardTex = () => make('board', 1024, 512, (g, w, h) => {
  g.fillStyle = '#1d2b22'; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.fillRect(Math.random() * w, Math.random() * h, 40, 2) }
  g.fillStyle = 'rgba(240,240,225,0.9)'
  g.font = 'italic 54px serif'; g.fillText('F = m·a', 60, 110)
  g.font = 'italic 64px serif'; g.fillText('E = mc²', 560, 120)
  g.font = 'italic 44px serif'; g.fillText('a² + b² = c²', 60, 230)
  g.font = 'italic 44px serif'; g.fillText('PV = nRT', 620, 250)
  g.font = 'italic 42px serif'; g.fillText('∇·E = ρ/ε₀', 80, 350)
  g.font = 'italic 42px serif'; g.fillText('Δx·Δp ≥ ħ/2', 560, 370)
  g.font = '28px sans-serif'; g.fillStyle = 'rgba(255,220,140,0.85)'; g.fillText('Евклид → Ньютон → Максвелл → Эйнштейн → ?', 80, 460)
  g.strokeStyle = 'rgba(240,240,225,0.6)'; g.lineWidth = 3
  g.beginPath(); g.arc(880, 440, 40, 0, Math.PI * 2); g.stroke()
})

export const articleTex = () => make('article', 512, 700, (g, w, h) => {
  g.fillStyle = '#f7f5ee'; g.fillRect(0, 0, w, h)
  g.fillStyle = '#111'; g.font = 'bold 30px serif'; g.fillText('On the history of', 40, 70); g.fillText('scientific method', 40, 108)
  g.font = '16px sans-serif'; g.fillStyle = '#555'; g.fillText('Abstract · References [1–48]', 40, 140)
  scribble(g, 40, 180, 200, 16, 24, 21, 'rgba(40,40,40,0.55)')
  scribble(g, 272, 180, 200, 16, 24, 23, 'rgba(40,40,40,0.55)')
  g.strokeStyle = '#999'; g.strokeRect(40, 590, 432, 70)
  g.fillStyle = '#c33'; g.fillRect(60, 640, 30, -30); g.fillRect(110, 640, 30, -45); g.fillRect(160, 640, 30, -20); g.fillRect(210, 640, 30, -38)
})

export const panelTex = () => make('solar', 256, 256, (g, w, h) => {
  g.fillStyle = '#0c2a6b'; g.fillRect(0, 0, w, h)
  g.strokeStyle = '#7aa7ff'; g.lineWidth = 2
  for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke() }
})

export const labelTex = (text, color) => make('label-' + text, 256, 128, (g, w, h) => {
  g.fillStyle = 'rgba(6,16,30,0.85)'; g.fillRect(0, 0, w, h)
  g.strokeStyle = color; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6)
  g.fillStyle = color; g.font = 'bold 44px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, w / 2, h / 2 + 2)
})

export const floorTex = () => make('floor', 512, 512, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h)
  g.strokeStyle = '#000'; g.lineWidth = 3
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke() }
})
