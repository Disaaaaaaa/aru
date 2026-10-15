import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp, TOTAL } from '../store.jsx'
import { THESES, QUIZ } from '../data/content.js'
import { Ring } from '../components/ui.jsx'
import { sfx } from '../sound.js'

const SEC = 'final'

function Shapes() {
  const g = useRef()
  useFrame(({ pointer }, d) => {
    if (!g.current) return
    g.current.rotation.y += (pointer.x * 0.3 - g.current.rotation.y) * (1 - Math.exp(-d * 2))
    g.current.rotation.x += (-pointer.y * 0.2 - g.current.rotation.x) * (1 - Math.exp(-d * 2))
  })
  const items = [
    { p: [-5.5, 2.2, -2], s: 0.9, k: 'ico', c: '#e8d9bd' },
    { p: [5.8, 1.6, -3], s: 1.1, k: 'torus', c: '#d9b77a' },
    { p: [-4.8, -2.4, -1], s: 0.7, k: 'oct', c: '#cfe0ea' },
    { p: [4.6, -2.6, -1.5], s: 0.8, k: 'ico', c: '#f0e2c4' },
    { p: [0, 3.6, -5], s: 0.6, k: 'torus', c: '#c9d7e0' },
  ]
  return (
    <group ref={g}>
      {items.map((it, i) => (
        <Float key={i} speed={1 + i * 0.2} floatIntensity={1.2} rotationIntensity={1}>
          <mesh position={it.p} scale={it.s}>
            {it.k === 'ico' && <icosahedronGeometry args={[1, 0]} />}
            {it.k === 'oct' && <octahedronGeometry args={[1, 0]} />}
            {it.k === 'torus' && <torusGeometry args={[0.9, 0.28, 24, 64]} />}
            <meshStandardMaterial color={it.c} roughness={0.3} metalness={0.2} flatShading />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function Extruded({ text, arrow }) {
  const layers = 14
  return (
    <span className={`x3d ${arrow ? 'arrow' : ''}`}>
      {Array.from({ length: layers }).map((_, i) => (
        <span key={i} className="layer" aria-hidden style={{ transform: `translateZ(${-(i + 1) * 1.6}px)`, color: `hsl(35, 45%, ${62 - i * 2.4}%)` }}>{text}</span>
      ))}
      <span className="face">{text}</span>
    </span>
  )
}

function FinalHero() {
  const ref = useRef()
  const onMove = (e) => {
    const x = e.clientX / window.innerWidth - 0.5
    const y = e.clientY / window.innerHeight - 0.5
    if (ref.current) ref.current.style.transform = `rotateY(${x * 28}deg) rotateX(${-y * 18}deg)`
  }
  return (
    <section className="final-hero" onMouseMove={onMove}>
      <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 1.5]}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[3, 5, 5]} intensity={1.6} />
          <Shapes />
        </Canvas>
      </div>
      <motion.div className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Қорытынды зал · Болашақ ғылым</motion.div>
      <motion.div className="extrude" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <div className="extrude-inner" ref={ref} style={{ transform: 'rotateY(-14deg) rotateX(8deg)' }}>
          <Extruded text="ӨТКЕН" /><Extruded text="→" arrow /><Extruded text="БҮГІН" /><Extruded text="→" arrow /><Extruded text="БОЛАШАҚ" />
        </div>
      </motion.div>
      <p className="muted" style={{ maxWidth: 560, fontSize: 18 }}>Сіз астролабиядан жасанды интеллектке дейінгі жолды жүріп өттіңіз. Енді үш залдың негізгі ойын біріктірейік.</p>
    </section>
  )
}

function Quiz() {
  const { markDone, setFinished, percent, done, go, reset } = useApp()
  const [answers, setAnswers] = useState({})
  const all = Object.keys(answers).length === QUIZ.length
  const correct = QUIZ.filter((q, i) => q.options[answers[i]]?.ok).length
  const doneRef = useRef(null)
  useEffect(() => {
    if (!all) return
    markDone(SEC, 'quiz'); setFinished(true)
    setTimeout(() => doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
  }, [all, markDone, setFinished])
  return (
    <section className="station" id="st-quiz" style={{ minHeight: 'auto' }}>
      <div className="station-head" style={{ margin: '0 auto 28px', textAlign: 'center' }}>
        <div className="eyebrow">Финалдық интерактив</div>
        <h2>Үш сұрақ — үш зал</h2>
      </div>
      <div className="quiz">
        {QUIZ.map((q, i) => {
          const a = answers[i]
          return (
            <motion.div key={q.n} className="quiz-q" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h4><span>{q.n}</span>{q.q}</h4>
              {q.options.map((o, k) => {
                const cls = a === undefined ? '' : o.ok ? 'ok' : a === k ? 'no' : ''
                return (
                  <button key={k} className={`quiz-opt ${cls}`} disabled={a !== undefined}
                    onClick={() => { sfx(o.ok ? 'done' : 'wrong'); setAnswers((s) => ({ ...s, [i]: k })) }}>
                    {a !== undefined && o.ok ? '✓ ' : a === k && !o.ok ? '✕ ' : ''}{o.t}
                  </button>
                )
              })}
              {a !== undefined && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12, color: 'var(--ink-dim)' }}>{q.explain}</motion.p>}
            </motion.div>
          )
        })}
        <AnimatePresence>
          {all && (
            <motion.div ref={doneRef} className="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Confetti />
              <Ring value={100} size={130} stroke={10} />
              <h3>«Сіз Ғылым тарихы бойынша виртуалды турды аяқтадыңыз»</h3>
              <p className="muted">Прогресс: <b style={{ color: 'var(--accent)' }}>100%</b> · Финалдық сұрақтар: {correct}/3 · Зерттелген интерактивтер: {done.size}/{TOTAL}</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => { sfx('click'); reset() }}>↺ Турды қайта бастау</button>
                <button className="btn ghost" onClick={() => go('corridor')}>Уақыт дәлізіне оралу</button>
              </div>
              <span hidden>{percent}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function Confetti() {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current, g = c.getContext('2d')
    const W = (c.width = c.offsetWidth * 2), H = (c.height = c.offsetHeight * 2)
    const cols = ['#a8702c', '#e0b25e', '#3d6e8f', '#2f8a4a', '#c2412f']
    const ps = Array.from({ length: 140 }).map(() => ({ x: W / 2, y: H * 0.3, vx: (Math.random() - 0.5) * 22, vy: -Math.random() * 18 - 6, s: 4 + Math.random() * 8, c: cols[Math.floor(Math.random() * cols.length)], r: Math.random() * 6 }))
    let raf
    const t0 = performance.now()
    let last = t0
    const tick = (now = performance.now()) => {
      const f = (now - t0) / 16.67, dt = Math.min(6, (now - last) / 16.67)
      last = now
      g.clearRect(0, 0, W, H)
      ps.forEach((p) => { p.vy += 0.55 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += 0.1 * dt; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - f / 150); g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore() })
      if (f < 150) raf = requestAnimationFrame(tick)
      else g.clearRect(0, 0, W, H)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

export default function Final() {
  const { markDone } = useApp()
  return (
    <div className="hall">
      <div className="hall-inner">
        <FinalHero />
        <section className="station" id="st-theses" style={{ minHeight: 'auto', alignItems: 'center' }}>
          <motion.div className="theses" onViewportEnter={() => markDone(SEC, 'theses')} viewport={{ amount: 0.5 }}>
            {THESES.map((t, i) => (
              <motion.div key={t.n} className="thesis" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <b>{t.n}</b>
                <p>{t.t}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.p className="final-quote" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
            «Ғылымның болашағын түсіну үшін оның өткенін білу қажет.»
          </motion.p>
        </section>
        <Quiz />
        <div style={{ height: 120 }} />
      </div>
    </div>
  )
}
