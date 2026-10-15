import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import { useApp } from '../store.jsx'
import { PROBLEMS, SOURCES, DIGITAL_ISSUES } from '../data/content.js'
import { Lazy, NextDoor, Station, StationHead } from '../components/ui.jsx'
import { Anchor, Label, LabelLayer, Projector, useLabelStore } from '../three/labels.jsx'
import { useCursor } from '../three/common.jsx'
import { labelTex, parchmentBg, scribble, rng } from '../three/textures.js'
import { AIStation, NetworkStation, GlobeStation } from './Hall63Parts.jsx'
import { sfx } from '../sound.js'

export const SEC = 'hall63'
const TAU = Math.PI * 2

/* ═════════ Деректер сферасы және 8 мәселе ═════════ */
function DataSphere({ selected, store, onPick }) {
  const ring = useRef()
  const core = useRef()
  const pts = useMemo(() => {
    const n = 2400, a = new Float32Array(n * 3), col = new Float32Array(n * 3)
    const c1 = new THREE.Color('#4de3ff'), c2 = new THREE.Color('#8b7bff')
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963
      const R = 1.6 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.06
      a[i * 3] = Math.cos(th) * r * R; a[i * 3 + 1] = y * R; a[i * 3 + 2] = Math.sin(th) * r * R
      const c = c1.clone().lerp(c2, (y + 1) / 2)
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(a, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])
  useFrame((_, d) => {
    if (core.current) core.current.rotation.y += d * 0.12
    if (ring.current && !selected) ring.current.rotation.y += d * 0.18
  })
  return (
    <group rotation-x={0.12}>
      <group ref={core}>
        <points geometry={pts}><pointsMaterial size={0.028} vertexColors transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} /></points>
        <mesh><icosahedronGeometry args={[1.25, 1]} /><meshBasicMaterial color="#4de3ff" wireframe transparent opacity={0.12} /></mesh>
        <mesh><sphereGeometry args={[0.55, 32, 32]} /><meshBasicMaterial color="#8b7bff" transparent opacity={0.35} /></mesh>
      </group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.5, i * 0.7, 0]}><torusGeometry args={[2.1 + i * 0.25, 0.004, 6, 160]} /><meshBasicMaterial color="#4de3ff" transparent opacity={0.3} /></mesh>
      ))}
      <group ref={ring}>
        {PROBLEMS.map((p, i) => {
          const a = (i / PROBLEMS.length) * TAU
          const pos = [Math.cos(a) * 2.75, Math.sin(a * 2) * 0.55, Math.sin(a) * 2.75]
          const on = selected === p.id
          return (
            <group key={p.id} position={pos}>
              <mesh onClick={(e) => { e.stopPropagation(); onPick(p.id) }} onPointerOver={() => useCursor(true)} onPointerOut={() => useCursor(false)}>
                <octahedronGeometry args={[on ? 0.16 : 0.11, 0]} />
                <meshBasicMaterial color={on ? '#ffffff' : '#4de3ff'} />
              </mesh>
              <Anchor store={store} id={p.id} position={[0, 0.32, 0]} />
            </group>
          )
        })}
      </group>
    </group>
  )
}

function SphereStation() {
  const { markDone } = useApp()
  const [sel, setSel] = useState(null)
  const [seen, setSeen] = useState(() => new Set())
  const store = useLabelStore()
  const pick = (id) => { sfx('click'); setSel(id); markDone(SEC, 'sphere'); setSeen((s) => new Set(s).add(id)) }
  const p = PROBLEMS.find((x) => x.id === sel)
  return (
    <Station id="sphere">
      <StationHead sec={SEC} id="sphere" eyebrow="Зерттеу орталығы" title="Деректер сферасы">
        Сфераның айналасында ғылым тарихының қазіргі 8 мәселесі айналып тұр. Әрқайсысын басып ашыңыз · {seen.size}/8
      </StationHead>
      <div className="split">
        <Lazy className="canvas-box" height="min(72vh, 640px)" style={{ background: '#04070f' }}>
          <Canvas camera={{ position: [0, 1.2, 8.6], fov: 45 }} dpr={[1, 1.75]} onPointerMissed={() => setSel(null)}>
            <color attach="background" args={['#04070f']} />
            <DataSphere selected={sel} store={store} onPick={pick} />
            <Stars radius={40} depth={20} count={1500} factor={2} fade />
            <Sparkles count={80} scale={[8, 6, 8]} size={1.5} color="#4de3ff" speed={0.3} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
            <Projector store={store} />
          </Canvas>
          <LabelLayer>
            {PROBLEMS.map((x) => (
              <Label key={x.id} store={store} id={x.id}>
                <button className={`problem-btn ${sel === x.id ? 'active' : ''} ${seen.has(x.id) ? 'seen' : ''}`} onClick={() => pick(x.id)}>{x.name}</button>
              </Label>
            ))}
          </LabelLayer>
          <div className="canvas-hint">⟲ айналдыру · мәселені басу</div>
        </Lazy>
        <AnimatePresence mode="wait">
          <motion.div key={sel || 'none'} className="glass info-panel" style={{ padding: 24, justifyContent: 'center' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {p ? <>
              <span className="k">Мәселе {PROBLEMS.indexOf(p) + 1} / 8</span>
              <h3>{p.name}</h3>
              <p className="muted" style={{ fontSize: 16 }}>{p.text}</p>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}><span className="k">Ойлануға сұрақ</span><p style={{ fontFamily: 'var(--serif)', fontSize: 21, fontStyle: 'italic', marginTop: 4 }}>{p.q}</p></div>
            </> : <>
              <span className="k">6.3 · Қазіргі ғылым тарихының мәселелері</span>
              <h3>Тарих тек өткен туралы емес</h3>
              <p className="muted">Бүгінгі ғылым ертеңгі тарихқа айналады. Оны қалай сақтаймыз, кім жазады, қалай тексереміз — осы залдың басты сұрақтары.</p>
              <div className="chip-row">{PROBLEMS.map((x) => <button key={x.id} className="chip" onClick={() => pick(x.id)} style={{ fontSize: 12.5 }}>{x.name}</button>)}</div>
            </>}
          </motion.div>
        </AnimatePresence>
      </div>
    </Station>
  )
}

/* ═════════ «Тарихты кім жазады?» ═════════ */
function SourcesStation() {
  const { markDone } = useApp()
  const [pick, setPick] = useState(null)
  const [step, setStep] = useState(1)
  const [enough, setEnough] = useState(null)
  const it = SOURCES.items.find((s) => s.id === pick)
  const answer = (v) => { sfx(v === 'no' ? 'click' : 'wrong'); setEnough(v); setStep(3); markDone(SEC, 'sources') }
  return (
    <Station id="sources">
      <StationHead sec={SEC} id="sources" eyebrow="Объективтілік мәселесі" title="«Тарихты кім жазады?»">
        Іс: {SOURCES.case}. {SOURCES.intro}
      </StationHead>
      <div className="glass" style={{ padding: '18px 22px', marginBottom: 16 }}>
        <span className="eyebrow">Сұрақ {step >= 3 ? 2 : step} / 2</span>
        <h3 style={{ fontSize: 'clamp(24px, 2.8vw, 34px)', marginTop: 6 }}>{step === 1 ? '«Қай дереккөз ғылым тарихын зерттеу үшін ең сенімді?»' : '«Бір ғана дереккөз жеткілікті ме?»'}</h3>
      </div>
      <div className="source-grid">
        {SOURCES.items.map((s) => {
          const reveal = step >= 3 || pick === s.id
          return (
            <button key={s.id} className={`glass source-card ${pick === s.id ? 'sel' : ''}`} onClick={() => { if (step === 1 || step === 2) { sfx('click'); setPick(s.id); setStep(2) } }}>
              <div className="ico">{s.icon}</div>
              <h4>{s.name}</h4>
              <q>{s.snippet}</q>
              {reveal && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <div className="meter" aria-label={`Сенімділік ${s.score}/3`}>{[1, 2, 3].map((k) => <i key={k} className={k <= s.score ? 'on' : ''} />)}</div>
                  <p className="pc"><span className="plus">+ </span>{s.pro}</p>
                  <p className="pc"><span className="minus">− </span>{s.con}</p>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
      <AnimatePresence>
        {step === 2 && it && (
          <motion.div className="glass" style={{ padding: 22, marginTop: 16 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p style={{ fontSize: 16.5 }}>Сіз <b>«{it.name}»</b> таңдадыңыз. Оның күшті жағы бар, бірақ әлсіз жағы да бар. Басқа дереккөздерді де басып салыстыра аласыз.</p>
            <h3 style={{ fontSize: 26, margin: '14px 0 12px' }}>«Бір ғана дереккөз жеткілікті ме?»</h3>
            <div className="yesno"><button className="btn ghost" onClick={() => answer('yes')}>Иә</button><button className="btn" onClick={() => answer('no')}>Жоқ</button></div>
          </motion.div>
        )}
      </AnimatePresence>
      {step === 3 && (
        <motion.div className="split" style={{ marginTop: 18, alignItems: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass" style={{ padding: 24 }}>
            <span className="eyebrow" style={{ color: enough === 'no' ? 'var(--good)' : 'var(--warn)' }}>{enough === 'no' ? 'Дұрыс ойлайсыз' : 'Тағы бір ойланып көріңіз'}</span>
            <h3 style={{ fontSize: 30, margin: '8px 0 10px' }}>Дереккөздерді салыстыру — тарихшының басты әдісі</h3>
            <p className="muted">Күнделік — алғашқы бақылауды, мақала — ғылыми нәтижені, газет — қоғамның қабылдауын, оқулық — кейінгі түсіндірмені көрсетеді. Тек барлығын салыстырғанда ғана шынайы сурет шығады: пенициллинді бір адам емес, Флеминг пен Флори–Чейн командасы бірнеше жылда дәріге айналдырған.</p>
            <p className="lesson" style={{ marginTop: 14 }}>Бір дереккөз — бір көзқарас. Объективтілік салыстырудан туады.</p>
          </div>
          <svg viewBox="0 0 320 300" style={{ width: '100%', maxWidth: 380, margin: '0 auto', display: 'block' }}>
            {[[120, 115, 'Күнделік'], [200, 115, 'Мақала'], [120, 190, 'Газет'], [200, 190, 'Оқулық']].map(([x, y, t], i) => (
              <g key={t}>
                <motion.circle cx={x} cy={y} r="72" fill="#4de3ff" fillOpacity="0.08" stroke="#4de3ff" strokeOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }} style={{ transformOrigin: `${x}px ${y}px` }} />
                <text x={x + (x < 160 ? -38 : 38)} y={y + (y < 150 ? -40 : 46)} textAnchor="middle" fill="#9fb6d1" fontSize="12">{t}</text>
              </g>
            ))}
            <motion.circle cx="160" cy="152" r="18" fill="#4de3ff" initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.8 }} style={{ transformOrigin: '160px 152px' }} />
            <text x="160" y="290" textAnchor="middle" fill="#e6f2ff" fontFamily="var(--serif)" fontSize="18" fontStyle="italic">қиылысу — шынайыға жақын сурет</text>
          </svg>
        </motion.div>
      )}
    </Station>
  )
}

/* ═════════ «Ғылым тарихының жоғалған беттері» — архив ═════════ */
const DOCS = [
  { id: 'manu', name: 'Қолжазба', damaged: true, fact: 'Архимед палимпсесі: XIII ғасырда Архимед мәтіні өшіріліп, үстінен дұғалар жазылған. Ол 1906 жылы ғана анықталып, XXI ғасыр басында арнайы бейнелеу әдістерімен оқылды.' },
  { id: 'photo', name: 'Фотосурет', fact: '«Фото 51» — бір рентгенограмма ДНҚ тарихын өзгертті. Бастапқы суреттер жоғалса, кімнің қандай үлес қосқанын дәлелдеу мүмкін болмас еді.' },
  { id: 'letter', name: 'Хат', damaged: true, fact: 'Ғалымдардың хаттары — идеялардың туу тарихы. Ньютон мен Гуктың хат алмасуы тартылыс заңы туралы басымдық дауын көрсетеді.' },
  { id: 'note', name: 'Ғылыми дәптер', fact: 'Ұлықбек обсерваториясы XV ғасырда қиратылды; оның орны тек 1908 жылы табылды. Мұрасы көшірмелер мен «Зиж» жұлдыз каталогы арқылы ғана жетті.' },
  { id: 'journal', name: 'Зертханалық журнал', fact: 'Фарадейдің зертханалық күнделіктері 40 жылдан астам тәжірибені қамтиды. Олар сақталғандықтан, ашылу процесін қадамдап зерттей аламыз.' },
  { id: 'scroll', name: 'Ежелгі шиыршық', damaged: true, fact: 'Александрия кітапханасындағы шиыршықтардың көбі бізге жетпеді. Жоғалған мәтіндер туралы тек басқа авторлардың сілтемелерінен білеміз.' },
]

function drawDoc(g, d, w, h) {
  g.clearRect(0, 0, w, h)
  const seed = d.id.length * 13 + d.name.length
  if (d.id === 'photo') {
    g.fillStyle = '#e9dfc8'; g.fillRect(0, 0, w, h)
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6b5640'); gr.addColorStop(1, '#2e241a')
    g.fillStyle = gr; g.fillRect(12, 12, w - 24, h - 58)
    g.fillStyle = 'rgba(240,225,190,0.5)'
    for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(w / 2 + Math.cos(i * 0.785) * 30, 70 + Math.sin(i * 0.785) * 40, 6, 22, i * 0.785, 0, TAU); g.fill() }
    g.fillStyle = '#3a2a18'; g.font = 'italic 14px serif'; g.fillText('1952 · No. 51', 18, h - 22)
  } else {
    parchmentBg(g, w, h, seed)
    if (d.id === 'note') {
      g.strokeStyle = 'rgba(80,110,160,0.35)'; g.lineWidth = 1
      for (let x = 10; x < w; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke() }
      for (let y = 10; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
      g.fillStyle = '#2a1d10'; g.font = 'italic 15px serif'; g.fillText('★ 1018 жұлдыз', 14, 30)
      for (let i = 0; i < 22; i++) { const r = rng(i + 5); g.beginPath(); g.arc(20 + r() * (w - 40), 50 + r() * (h - 80), 1.5 + r() * 2, 0, TAU); g.fill() }
    } else if (d.id === 'journal') {
      g.strokeStyle = 'rgba(60,35,15,0.6)'
      for (let y = 40; y < h - 10; y += 22) { g.beginPath(); g.moveTo(10, y); g.lineTo(w - 10, y); g.stroke() }
      g.beginPath(); g.moveTo(48, 20); g.lineTo(48, h - 10); g.stroke()
      g.fillStyle = '#2a1d10'; g.font = 'bold 12px serif'; g.fillText('Тәжірибе №', 12, 32)
      scribble(g, 54, 58, w - 70, 7, 22, seed)
    } else {
      g.fillStyle = '#6b2a1c'; g.font = 'bold 18px serif'; g.fillText(d.id === 'letter' ? 'Құрметті әріптес,' : d.id === 'scroll' ? 'ΓΕΩΜΕΤΡΙΑ' : 'ℵ', 14, 30)
      scribble(g, 14, 52, w - 28, Math.floor((h - 70) / 18), 18, seed)
      if (d.id === 'letter') { g.strokeStyle = '#2a1d10'; g.beginPath(); g.moveTo(w - 80, h - 24); g.bezierCurveTo(w - 60, h - 44, w - 40, h - 4, w - 20, h - 28); g.stroke() }
    }
  }
  if (d.damaged) {
    // күйген/жыртылған жерлер
    g.save(); g.globalCompositeOperation = 'destination-out'
    const r = rng(seed + 99)
    for (let i = 0; i < 4; i++) {
      const cx = r() < 0.5 ? r() * w * 0.3 : w - r() * w * 0.3, cy = r() * h, rad = 14 + r() * 26
      g.beginPath()
      for (let k = 0; k <= 16; k++) { const a = (k / 16) * TAU, rr = rad * (0.7 + r() * 0.5); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) }
      g.fill()
    }
    g.restore()
    g.save(); g.globalCompositeOperation = 'source-atop'
    const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7)
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(70,35,10,0.55)')
    g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore()
  }
}

function ArchiveDoc({ d, onGone, gone, resetKey }) {
  const ref = useRef()
  const W = 132, H = 176
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const c = ref.current, dpr = 2
    c.width = W * dpr; c.height = H * dpr
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawDoc(g, d, W, H)
  }, [d, resetKey])
  const dissolve = () => {
    if (busy || gone) return
    sfx('whoosh'); setBusy(true)
    const c = ref.current, g = c.getContext('2d')
    const img = g.getImageData(0, 0, c.width, c.height)
    const parts = []
    const step = 4
    for (let y = 0; y < c.height; y += step) for (let x = 0; x < c.width; x += step) {
      const i = (y * c.width + x) * 4
      if (img.data[i + 3] > 20) parts.push({ x, y, vx: (Math.random() - 0.3) * 1.2, vy: -Math.random() * 1.6 - 0.2, r: img.data[i], g: img.data[i + 1], b: img.data[i + 2], delay: (x / c.width) * 40 + Math.random() * 30 })
    }
    // уақытқа негізделген анимация: кадр жиілігіне тәуелсіз (~2 с)
    g.setTransform(1, 0, 0, 1, 0, 0)
    const t0 = performance.now()
    let last = t0
    const tick = (now = performance.now()) => {
      const f = (now - t0) / 16.67, dt = Math.min(6, (now - last) / 16.67)
      last = now
      g.clearRect(0, 0, c.width, c.height)
      let alive = 0
      for (const p of parts) {
        const t = f - p.delay
        let a = 1
        if (t > 0) { p.x += p.vx * 1.6 * dt; p.y += p.vy * 1.6 * dt; p.vx += (Math.random() - 0.5) * 0.3 * dt; a = Math.max(0, 1 - t / 60) }
        if (a > 0) { alive++; g.fillStyle = `rgba(${p.r},${p.g},${p.b},${a})`; g.fillRect(p.x, p.y, step, step) }
      }
      if (alive > 0 && f < 140) requestAnimationFrame(tick)
      else { g.clearRect(0, 0, c.width, c.height); setBusy(false); onGone(d.id) }
    }
    tick()
  }
  return (
    <button className={`doc ${gone ? 'gone' : ''}`} onClick={dissolve} aria-label={`${d.name} — басу`}>
      <canvas ref={ref} style={{ width: W, height: H, opacity: gone ? 0.08 : 1, transition: 'opacity .4s' }} />
      <div className="doc-name">{gone ? '[ жоғалды ]' : d.name}</div>
    </button>
  )
}

function LostStation() {
  const { markDone } = useApp()
  const [gone, setGone] = useState([])
  const [resetKey, setResetKey] = useState(0)
  const last = DOCS.find((d) => d.id === gone[gone.length - 1])
  const onGone = (id) => { setGone((g) => [...g, id]); markDone(SEC, 'lost') }
  return (
    <Station id="lost">
      <StationHead sec={SEC} id="lost" eyebrow="Архив бөлмесі" title="Ғылым тарихының жоғалған беттері">
        «Егер ғылыми құжаттар сақталмаса, не болады?» Сөредегі ескі құжатты басыңыз.
      </StationHead>
      <div className="archive-room">
        {[DOCS.slice(0, 3), DOCS.slice(3)].map((row, i) => (
          <div className="shelf" key={i}>
            {row.map((d) => <ArchiveDoc key={d.id + resetKey} d={d} gone={gone.includes(d.id)} onGone={onGone} resetKey={resetKey} />)}
          </div>
        ))}
        <AnimatePresence mode="wait">
          {last ? (
            <motion.div key={last.id} className="card" style={{ background: 'rgba(20,14,8,0.85)', color: '#f2e8d3' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="lesson" style={{ color: '#f2e8d3' }}>«Ғылыми деректердің жоғалуы — ғылым тарихын зерттеудегі негізгі мәселелердің бірі.»</p>
              <p style={{ marginTop: 14, color: '#c7b796' }}><b style={{ color: '#e0b25e' }}>Тарихтан мысал · {last.name}:</b> {last.fact}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#8e7f63' }}>Жоғалды: {gone.length}/{DOCS.length}</span>
                <button className="btn sm ghost" style={{ color: '#f2e8d3' }} onClick={() => { setGone([]); setResetKey((k) => k + 1) }}>↺ Архивті қалпына келтіру</button>
              </div>
            </motion.div>
          ) : (
            <motion.p key="hint" style={{ color: '#8e7f63', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>↑ ҚҰЖАТТЫ БАСЫҢЫЗ — ОЛ БІРТІНДЕП ЖОҒАЛАДЫ</motion.p>
          )}
        </AnimatePresence>
      </div>
    </Station>
  )
}

/* ═════════ XXI ғасыр: цифрлық ғылым ═════════ */
const FILE_TYPES = [['PDF', '#ff6b6b'], ['DATA', '#4de3ff'], ['CODE', '#7dffb0'], ['IMAGE', '#ffd166'], ['VIDEO', '#ff9ff3'], ['DATABASE', '#8b7bff'], ['AI MODEL', '#ff5d73'], ['ARTICLE', '#e6f2ff'], ['EMAIL', '#9fb6d1']]
function FileStream({ type, color, count = 60, seed }) {
  const ref = useRef()
  const tex = useMemo(() => labelTex(type, color), [type, color])
  const data = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: count }).map(() => ({ a: r() * TAU, rad: 1.6 + r() * 3.4, z: -r() * 60, sp: 4 + r() * 6, rot: (r() - 0.5) * 0.6 }))
  }, [count, seed])
  const m = useMemo(() => new THREE.Object3D(), [])
  useFrame((_, d) => {
    if (!ref.current) return
    data.forEach((p, i) => {
      p.z += p.sp * d
      if (p.z > 6) p.z = -60
      p.a += d * 0.05
      m.position.set(Math.cos(p.a) * p.rad, Math.sin(p.a) * p.rad * 0.7, p.z)
      m.rotation.set(0, 0, p.rot)
      m.updateMatrix()
      ref.current.setMatrixAt(i, m.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <planeGeometry args={[0.7, 0.35]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

const DECAY = [
  { t: 'Қағаз құжат (мұрағатта)', c: '#e0b25e', f: (y) => 100 - y * 0.08 },
  { t: 'Ашық мұрағаттағы PDF/A', c: '#7dffb0', f: (y) => 100 - y * 0.15 },
  { t: 'Жеке зертхана сайты', c: '#4de3ff', f: (y) => 100 * Math.exp(-y / 14) },
  { t: 'Ескі формат файлы', c: '#ff9ff3', f: (y) => 100 * Math.exp(-y / 22) },
  { t: 'Дискета / CD', c: '#ff5d73', f: (y) => 100 * Math.exp(-y / 18) },
]
function DigitalStation() {
  const { markDone } = useApp()
  const [openI, setOpenI] = useState(new Set())
  const [year, setYear] = useState(2026)
  const toggle = (i) => { sfx('click'); setOpenI((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n }); markDone(SEC, 'digital') }
  const dy = year - 2026
  return (
    <Station id="digital">
      <StationHead sec={SEC} id="digital" eyebrow="XXI ғасыр мәселесі · цифрлық архив" title="Цифрлық ғылым" />
      <Lazy className="canvas-box files-stage" style={{ background: '#02040a' }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#02040a']} />
          <fog attach="fog" args={['#02040a', 8, 50]} />
          {FILE_TYPES.map(([t, c], i) => <FileStream key={t} type={t} color={c} seed={i * 31 + 7} count={70} />)}
        </Canvas>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', padding: 20 }}>
          <motion.div className="glass" style={{ padding: '24px 28px', maxWidth: 640, textAlign: 'center', background: 'rgba(4,10,20,0.6)' }} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}>
            <span className="eyebrow">Сұрақ</span>
            <h3 style={{ fontSize: 'clamp(26px, 3.4vw, 42px)', marginTop: 8 }}>«Бүгінгі ғылым тарихын 100 жылдан кейін қалай зерттейді?»</h3>
          </motion.div>
        </div>
      </Lazy>
      <p className="muted" style={{ margin: '20px 0 12px' }}>Мәселелерді басып ашыңыз:</p>
      <div className="issue-grid">
        {DIGITAL_ISSUES.map((x, i) => (
          <button key={x.t} className={`glass issue ${openI.has(i) ? '' : 'closed'}`} onClick={() => toggle(i)} aria-expanded={openI.has(i)}>
            <h4><span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{String(i + 1).padStart(2, '0')}</span>{x.t}<span style={{ marginLeft: 'auto', color: 'var(--ink-faint)' }}>{openI.has(i) ? '−' : '+'}</span></h4>
            <p>{x.d}</p>
          </button>
        ))}
      </div>
      <div className="glass" style={{ padding: 22, marginTop: 16 }}>
        <div className="year-slider">
          <span className="eyebrow" style={{ whiteSpace: 'nowrap' }}>Цифрлық уақыт машинасы</span>
          <input type="range" min="2026" max="2126" value={year} onChange={(e) => { setYear(+e.target.value); markDone(SEC, 'digital') }} aria-label="Жыл" />
          <b style={{ fontFamily: 'var(--mono)', fontSize: 22, color: 'var(--accent)' }}>{year}</b>
        </div>
        <div className="decay-bars">
          {DECAY.map((d) => {
            const v = Math.max(0, Math.round(d.f(dy)))
            return (
              <div key={d.t} className="row">
                <span>{d.t}</span>
                <div className="track"><div className="fill" style={{ width: `${v}%`, background: d.c }} /></div>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-dim)' }}>{v}%</span>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 10 }}>Шартты иллюстрация: нақты статистика емес, сақтау тәсілдерінің салыстырмалы тұрақтылығын көрсетеді. Қорытынды: деректерді сақтау — белсенді, үздіксіз жұмыс.</p>
      </div>
    </Station>
  )
}

export default function Hall63() {
  return (
    <div className="hall">
      <div className="future-bg" />
      <div className="hall-inner">
        <section className="hall-hero">
          <motion.div className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>6.3-зал · Futuristic research center</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ maxWidth: '16ch' }}>Қазіргі ғылым тарихының мәселелері</motion.h1>
          <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Тарихи музейден шықтыңыз. Бұл — деректер, архивтер мен алгоритмдер әлемі. Мұнда ғылым тарихы жаңа сұрақтарға тап болады: деректерді қалай сақтаймыз, кімге сенеміз, AI-ға қалай қараймыз?
          </motion.p>
          <div className="chip-row" style={{ marginTop: 26 }}>
            {[['sphere', 'Мәселелер сферасы'], ['sources', 'Тарихты кім жазады?'], ['lost', 'Жоғалған беттер'], ['digital', 'Цифрлық ғылым'], ['ai', 'AI және тарих'], ['network', 'Бір жаңалықтың тарихы'], ['globe', 'Ғылым картасы']].map(([id, t]) => (
              <button key={id} className="chip" onClick={() => document.getElementById(`st-${id}`)?.scrollIntoView({ behavior: 'smooth' })}>{t}</button>
            ))}
          </div>
          <button className="scroll-cue" style={{ alignSelf: 'flex-start', marginTop: 40 }} onClick={() => document.getElementById('st-sphere')?.scrollIntoView({ behavior: 'smooth' })}>Орталыққа кіру<span>↓</span></button>
        </section>
        <SphereStation />
        <SourcesStation />
        <LostStation />
        <DigitalStation />
        <AIStation />
        <NetworkStation />
        <GlobeStation />
        <NextDoor to="final" title="Болашақ ғылым · Қорытынды зал" sub="Өткен → Бүгін → Болашақ. Финалдық сұрақтар." />
      </div>
    </div>
  )
}
