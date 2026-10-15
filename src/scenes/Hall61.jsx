import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import { useApp } from '../store.jsx'
import { TREE_BRANCHES, DEVELOP_EXAMPLES, CONTINUITY, SOCIETY_EXAMPLES, WORLDVIEWS } from '../data/content.js'
import { Lazy, NextDoor, Station, StationHead } from '../components/ui.jsx'
import { StudioEnv, useCursor } from '../three/common.jsx'
import { sfx } from '../sound.js'
import { Anchor, Label, LabelLayer, Projector, useLabelStore } from '../three/labels.jsx'

const SEC = 'hall61'
const TAU = Math.PI * 2

/* ═════════ Ғылым ағашы (3D) ═════════ */
function Branch({ b, i, selected, onSelect, store }) {
  const a = (i / TREE_BRANCHES.length) * TAU
  const [hover, setHover] = useState(false)
  const { curve, end } = useMemo(() => {
    const base = new THREE.Vector3(0, 0.55 + (i % 2) * 0.35, 0)
    const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a))
    const c = new THREE.CatmullRomCurve3([
      base,
      base.clone().add(dir.clone().multiplyScalar(0.55)).add(new THREE.Vector3(0, 0.45, 0)),
      base.clone().add(dir.clone().multiplyScalar(1.25)).add(new THREE.Vector3(0, 0.95, 0)),
      base.clone().add(dir.clone().multiplyScalar(1.75)).add(new THREE.Vector3(0, 1.25, 0)),
    ])
    return { curve: c, end: c.getPoint(1) }
  }, [a, i])
  const on = selected || hover
  const leafCol = on ? '#7dffb0' : '#4fbf7d'
  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); useCursor(true) }}
      onPointerOut={() => { setHover(false); useCursor(false) }}
      onClick={(e) => { e.stopPropagation(); onSelect(b.id) }}>
      <mesh><tubeGeometry args={[curve, 40, 0.07, 10]} /><meshStandardMaterial color={on ? '#c7894a' : '#7a5230'} roughness={0.8} emissive={on ? '#e0b25e' : '#000'} emissiveIntensity={on ? 0.35 : 0} /></mesh>
      {b.leaves.map((l, j) => {
        const off = [Math.cos(j * 2.1) * 0.32, 0.12 + j * 0.13, Math.sin(j * 2.1) * 0.32]
        return (
          <group key={l} position={[end.x + off[0], end.y + off[1], end.z + off[2]]}>
            <mesh><icosahedronGeometry args={[0.13, 0]} /><meshStandardMaterial color={leafCol} emissive={leafCol} emissiveIntensity={on ? 0.9 : 0.35} flatShading /></mesh>
            <Anchor store={store} id={`l-${b.id}-${j}`} position={[0, 0.25, 0]} />
          </group>
        )
      })}
      <mesh position={end}><sphereGeometry args={[0.36, 12, 12]} /><meshBasicMaterial visible={false} /></mesh>
      <Anchor store={store} id={`b-${b.id}`} position={[end.x, end.y - 0.3, end.z]} />
    </group>
  )
}

function ScienceTree({ selected, onSelect, store }) {
  const roots = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const a = (i / 7) * TAU + 0.3
    const d = new THREE.Vector3(Math.cos(a), 0, Math.sin(a))
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.3, 0),
      new THREE.Vector3(d.x * 0.5, -1.65, d.z * 0.5),
      new THREE.Vector3(d.x * 1.1, -1.9, d.z * 1.1),
      new THREE.Vector3(d.x * 1.6, -2.25, d.z * 1.6),
    ])
  }), [])
  const glow = useRef()
  useFrame(({ clock }) => { if (glow.current && selected !== 'roots') glow.current.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 2) * 0.25 })
  return (
    <group position-y={0.2}>
      {/* тамырлар: өткен ғылыми білім */}
      <group onClick={(e) => { e.stopPropagation(); onSelect('roots') }} onPointerOver={() => useCursor(true)} onPointerOut={() => useCursor(false)}>
        {roots.map((c, i) => <mesh key={i}><tubeGeometry args={[c, 30, 0.06 - i * 0.003, 8]} /><meshStandardMaterial ref={i === 0 ? glow : undefined} color="#c98b3d" emissive="#e0b25e" emissiveIntensity={selected === 'roots' ? 1.2 : 0.5} /></mesh>)}
      </group>
      {/* дің: ғылыми даму */}
      <mesh position-y={-0.35} onClick={(e) => { e.stopPropagation(); onSelect('trunk') }} onPointerOver={() => useCursor(true)} onPointerOut={() => useCursor(false)}>
        <cylinderGeometry args={[0.16, 0.3, 2.0, 20]} />
        <meshStandardMaterial color={selected === 'trunk' ? '#a8703c' : '#6e4a28'} roughness={0.85} emissive="#e0b25e" emissiveIntensity={selected === 'trunk' ? 0.3 : 0} />
      </mesh>
      {TREE_BRANCHES.map((b, i) => <Branch key={b.id} b={b} i={i} selected={selected === b.id} onSelect={onSelect} store={store} />)}
      <Anchor store={store} id="roots" position={[0, -2.7, 0]} />
      <Anchor store={store} id="trunk" position={[0.6, -0.6, 0]} />
      <mesh position-y={-2.32} rotation-x={-Math.PI / 2}><circleGeometry args={[2.4, 64]} /><meshStandardMaterial color="#1c140c" /></mesh>
    </group>
  )
}

function TreeStation() {
  const { markDone } = useApp()
  const [sel, setSel] = useState(null)
  const store = useLabelStore()
  const select = (id) => { sfx('click'); setSel(id); markDone(SEC, 'tree') }
  const b = TREE_BRANCHES.find((x) => x.id === sel)
  return (
    <Station id="tree">
      <StationHead sec={SEC} id="tree" eyebrow="Залдың орталық экспонаты" title="Ғылым ағашы">
        Ағашты тышқанмен айналдырыңыз. Тамырды, дінді немесе кез келген бұтақты басыңыз.
      </StationHead>
      <div className="split">
        <Lazy className="canvas-box" height="min(68vh, 600px)">
          <Canvas camera={{ position: [0, 0.6, 7.2], fov: 45 }} dpr={[1, 1.75]} onPointerMissed={() => setSel(null)}>
            <color attach="background" args={['#160f09']} />
            <ambientLight intensity={0.45} />
            <directionalLight position={[3, 5, 4]} intensity={1.6} color="#ffe2b8" />
            <pointLight position={[0, -2, 0]} intensity={6} color="#e0b25e" distance={5} />
            <Suspense fallback={null}><StudioEnv /></Suspense>
            <ScienceTree selected={sel} onSelect={select} store={store} />
            <Projector store={store} />
            <Sparkles count={60} scale={[6, 5, 6]} size={2.4} color="#9dffc4" speed={0.4} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={!sel} autoRotateSpeed={0.8} minPolarAngle={0.9} maxPolarAngle={1.9} />
          </Canvas>
          <LabelLayer>
            {TREE_BRANCHES.map((br) => (
              <Label key={br.id} store={store} id={`b-${br.id}`}><button className="chip tree-chip" aria-pressed={sel === br.id} onClick={() => select(br.id)}>{br.name}</button></Label>
            ))}
            {b && b.leaves.map((l, j) => (
              <Label key={`${b.id}-${j}`} store={store} id={`l-${b.id}-${j}`}><span className="leaf" style={{ whiteSpace: 'nowrap', background: 'rgba(20,40,28,0.92)', fontSize: 11 }}>{l}</span></Label>
            ))}
            <Label store={store} id="roots"><button className="chip tree-chip root" onClick={() => select('roots')}>Тамырлар · Өткен ғылыми білім</button></Label>
            <Label store={store} id="trunk"><button className="chip tree-chip root" onClick={() => select('trunk')}>Дің · Ғылыми даму</button></Label>
          </LabelLayer>
          <div className="canvas-hint">⟲ айналдыру · басу — ақпарат</div>
        </Lazy>
        <div className="card info-panel" style={{ justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div key={sel || 'none'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="info-panel">
              {!sel && <>
                <span className="k">Ағаштың құрылымы</span>
                <h3>Білім қалай өседі?</h3>
                <p className="muted"><b style={{ color: 'var(--accent)' }}>Тамырлары</b> — өткен ғылыми білім. <b style={{ color: 'var(--accent)' }}>Діңі</b> — ғылыми даму. <b style={{ color: 'var(--accent)' }}>Бұтақтары</b> — физика, химия, биология, медицина, астрономия, информатика. <b style={{ color: '#7dffb0' }}>Жапырақтары</b> — бүгінгі технологиялар.</p>
                <p className="muted">Тамырсыз жапырақ болмайды: смартфон да, вакцина да ғасырлар бойы жинақталған білімнің жемісі.</p>
              </>}
              {sel === 'roots' && <>
                <span className="k">Тамырлар</span><h3>Өткен ғылыми білім</h3>
                <p className="muted">Ежелгі бақылаулар, қолжазбалар, аудармалар, жұлдыз каталогтары, сәтсіз тәжірибелер — бәрі көзге көрінбейтін тамыр сияқты. Олар бүгінгі ғылымды «қоректендіреді».</p>
              </>}
              {sel === 'trunk' && <>
                <span className="k">Дің</span><h3>Ғылыми даму</h3>
                <p className="muted">Дің — әдістің дамуы: бақылау → өлшеу → эксперимент → модель → тексеру. Пәндер бөлек бұтақтарға тарағанымен, бәрі бір ғылыми әдіске сүйенеді.</p>
              </>}
              {b && <>
                <span className="k">Бұтақ</span><h3>{b.name}</h3>
                <p className="muted">{b.text}</p>
                <div><span className="k">Тамыры</span><p>{b.root}</p></div>
                <div><span className="k">Жапырақтары · қазіргі технологиялар</span><div className="leaf-list" style={{ marginTop: 6 }}>{b.leaves.map((l) => <span key={l} className="leaf">{l}</span>)}</div></div>
              </>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Station>
  )
}

/* ═════════ 1. Ғылыми білімнің дамуы ═════════ */
function DevelopStation() {
  const { markDone } = useApp()
  const [ex, setEx] = useState(DEVELOP_EXAMPLES[0].id)
  const [step, setStep] = useState(0)
  const cur = DEVELOP_EXAMPLES.find((e) => e.id === ex)
  const next = () => { sfx('click'); const s = Math.min(step + 1, 2); setStep(s); if (s === 2) markDone(SEC, 'develop') }
  return (
    <Station id="develop">
      <StationHead sec={SEC} id="develop" num="1" eyebrow="Интерактивті нүкте" title="Ғылыми білімнің дамуын түсіну">
        Өткен теория → жаңа дәлел → жаңа теория. Мысалды таңдап, қадам бойынша жүріңіз.
      </StationHead>
      <div className="chip-row" style={{ marginBottom: 18 }}>
        {DEVELOP_EXAMPLES.map((e) => <button key={e.id} className="chip" aria-pressed={ex === e.id} onClick={() => { sfx('click'); setEx(e.id); setStep(0) }}>{e.label}</button>)}
      </div>
      <div className="flow">
        {cur.steps.map((s, i) => (
          <FlowItem key={ex + i} i={i} last={i === cur.steps.length - 1} active={i <= step}>
            <span className="k">{s.k}</span><h4>{s.t}</h4><p>{s.d}</p>
          </FlowItem>
        ))}
      </div>
      <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {step < 2 ? <button className="btn" onClick={next}>Келесі қадам →</button> : <button className="btn ghost" onClick={() => setStep(0)}>↺ Қайта көру</button>}
        {step === 2 && <span className="muted">Ескі теория жойылмайды — ол жаңа білімнің баспалдағы болады.</span>}
      </div>
    </Station>
  )
}

function FlowItem({ i, last, active, children }) {
  return (
    <>
      <motion.div className={`flow-step ${active ? '' : 'dim'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
        style={active ? { borderColor: 'var(--accent)', boxShadow: 'var(--glow)' } : undefined}>
        {children}
      </motion.div>
      {!last && <div className="flow-arrow" style={{ opacity: active ? 1 : 0.25 }}>→</div>}
    </>
  )
}

/* ═════════ 2. Сабақтастық: Коперник → Галилей → Кеплер → Ньютон ═════════ */
function ContinuityStation() {
  const { markDone } = useApp()
  const [sel, setSel] = useState(null)
  const pick = (id) => { sfx('click'); setSel(id); markDone(SEC, 'continuity') }
  const cur = CONTINUITY.find((c) => c.id === sel)
  const W = 900, xs = CONTINUITY.map((_, i) => 110 + i * ((W - 220) / 3))
  return (
    <Station id="continuity">
      <StationHead sec={SEC} id="continuity" num="2" eyebrow="Интерактивті нүкте" title="Ғылыми жаңалықтардың сабақтастығы">
        Бір ғалымның жаңалығы келесі зерттеуге негіз болады. Әр ғалымды басып, кімнен не алып, кейінгіге не бергенін көріңіз.
      </StationHead>
      <div className="card" style={{ padding: '10px 10px 0' }}>
        <svg className="chain-svg" viewBox={`0 0 ${W} 230`}>
          <defs>
            <linearGradient id="cg" x1="0" x2="1"><stop offset="0" stopColor="var(--accent-2)" /><stop offset="1" stopColor="var(--accent)" /></linearGradient>
            <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--accent)" /></marker>
          </defs>
          {xs.slice(0, -1).map((x, i) => (
            <g key={i}>
              <path d={`M${x + 62} 110 Q ${(x + xs[i + 1]) / 2} 40 ${xs[i + 1] - 62} 110`} fill="none" stroke="url(#cg)" strokeWidth="3" strokeDasharray="8 8" markerEnd="url(#ah)">
                <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1s" repeatCount="indefinite" />
              </path>
              <circle r="5" fill="#ffe3a0"><animateMotion dur={`${2 + i * 0.3}s`} repeatCount="indefinite" path={`M${x + 62} 110 Q ${(x + xs[i + 1]) / 2} 40 ${xs[i + 1] - 62} 110`} /></circle>
            </g>
          ))}
          {CONTINUITY.map((c, i) => (
            <g key={c.id} style={{ cursor: 'pointer' }} onClick={() => pick(c.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && pick(c.id)}>
              <circle cx={xs[i]} cy={120} r={sel === c.id ? 62 : 56} fill="var(--panel-solid)" stroke={sel === c.id ? 'var(--accent)' : 'var(--line)'} strokeWidth="2" style={{ transition: 'r .3s' }} />
              <text x={xs[i]} y={114} textAnchor="middle" fill="var(--ink)" fontFamily="var(--serif)" fontSize="23" fontWeight="700">{c.name}</text>
              <text x={xs[i]} y={140} textAnchor="middle" fill="var(--accent)" fontFamily="var(--mono)" fontSize="13">{c.year}</text>
            </g>
          ))}
          <text x={W / 2} y={215} textAnchor="middle" fill="var(--ink-faint)" fontFamily="var(--mono)" fontSize="12" letterSpacing="2">ИДЕЯЛАР ЭСТАФЕТАСЫ</text>
        </svg>
      </div>
      <AnimatePresence mode="wait">
        {cur ? (
          <motion.div key={cur.id} className="grid-3" style={{ marginTop: 16 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card"><span className="eyebrow">Неге сүйенді</span><p style={{ marginTop: 8 }}>{cur.took}</p></div>
            <div className="card" style={{ borderColor: 'var(--accent)' }}><span className="eyebrow">Не қосты</span><p style={{ marginTop: 8 }}>{cur.gave}</p></div>
            <div className="card"><span className="eyebrow">Түйін</span><p style={{ marginTop: 8, fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic' }}>{cur.quote}</p></div>
          </motion.div>
        ) : <p className="muted" style={{ marginTop: 16 }}>↑ Ғалымды басыңыз</p>}
      </AnimatePresence>
    </Station>
  )
}

/* ═════════ 3. Ғылыми қателіктердің маңызы ═════════ */
const ERR_CHAIN = [
  { k: 'Қате', t: 'Өздігінен пайда болу', d: 'Ғасырлар бойы құрт, шыбын, микробтар шіріген заттан өздігінен пайда болады деп есептелді.' },
  { k: 'Тексеру', t: 'Сұрақ туындады', d: 'Реди (1668) жабық ыдыстағы етте құрт пайда болмайтынын көрсетті. Ғалымдар идеяны тексере бастады.' },
  { k: 'Жаңа дәлел', t: 'Пастер колбасы', d: 'Пастер (1859–1862) мойны иілген колбадағы қайнатылған сорпада микробтар пайда болмайтынын дәлелдеді.' },
  { k: 'Теорияның өзгеруі', t: 'Биогенез', d: 'Тірі ағза тек тірі ағзадан пайда болады. Бұл медицинадағы стерильдеу мен вакцинаға жол ашты.' },
]
function ErrorsStation() {
  const { markDone } = useApp()
  const [ans, setAns] = useState(null)
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (ans !== 'no') return
    setShown(0)
    const timers = ERR_CHAIN.map((_, i) => setTimeout(() => { setShown(i + 1); if (i === ERR_CHAIN.length - 1) markDone(SEC, 'errors') }, 500 + i * 900))
    return () => timers.forEach(clearTimeout)
  }, [ans, markDone])
  return (
    <Station id="errors">
      <StationHead sec={SEC} id="errors" num="3" eyebrow="Интерактивті нүкте" title="Ғылыми қателіктердің маңызы" />
      <motion.div className="card" style={{ padding: 30, maxWidth: 900 }} initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
        <h3 style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', marginBottom: 20 }}>«Ғылым әрқашан бірден дұрыс жауап бере ме?»</h3>
        <div className="yesno">
          <button className="btn ghost" aria-pressed={ans === 'yes'} onClick={() => { sfx('wrong'); setAns('yes') }} style={ans === 'yes' ? { borderColor: 'var(--bad)' } : undefined}>ИӘ</button>
          <button className="btn" onClick={() => { sfx('click'); setAns('no') }}>ЖОҚ</button>
        </div>
        <AnimatePresence>
          {ans === 'yes' && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} style={{ marginTop: 18, color: 'var(--warn)' }}>
              Ойланып көріңіз: ғылым тарихында ұзақ уақыт «дұрыс» саналған идеялар кейін өзгерген. Тарихтан бір мысал көру үшін «ЖОҚ» батырмасын басыңыз.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
      {ans === 'no' && (
        <div className="flow" style={{ marginTop: 22 }}>
          {ERR_CHAIN.map((s, i) => (
            <FlowItem key={i} i={i} last={i === ERR_CHAIN.length - 1} active={i < shown}>
              <span className="k">{s.k}</span><h4>{s.t}</h4><p>{s.d}</p>
            </FlowItem>
          ))}
        </div>
      )}
      {shown === ERR_CHAIN.length && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lesson" style={{ marginTop: 20, maxWidth: 900 }}>Қате — ғылымның жауы емес, қозғаушы күші. Ғылым өз қатесін тексеру арқылы түзейді.</motion.p>}
    </Station>
  )
}

/* ═════════ 4. Ғылым мен қоғам (цикл) ═════════ */
const CYCLE = ['Ғылым', 'Жаңалық', 'Технология', 'Қоғамдағы өзгеріс', 'Жаңа ғылыми сұрақтар']
function SocietyStation() {
  const { markDone } = useApp()
  const [ex, setEx] = useState(SOCIETY_EXAMPLES[0].id)
  const [node, setNode] = useState(0)
  const [paused, setPaused] = useState(false)
  const cur = SOCIETY_EXAMPLES.find((e) => e.id === ex)
  const R = 150, C = 200
  const pos = CYCLE.map((_, i) => { const a = -Math.PI / 2 + (i / CYCLE.length) * TAU; return [C + Math.cos(a) * R, C + Math.sin(a) * R] })
  const click = (i) => { sfx('click'); setPaused(true); setNode(i); markDone(SEC, 'society') }
  useEffect(() => { if (paused) return; const t = setInterval(() => setNode((n) => (n + 1) % CYCLE.length), 4500); return () => clearInterval(t) }, [ex, paused])
  return (
    <Station id="society">
      <StationHead sec={SEC} id="society" num="4" eyebrow="Интерактивті схема" title="Ғылым мен қоғам">
        Ғылым қоғамды өзгертеді, ал қоғам ғылымға жаңа сұрақ қояды. Мысалды таңдап, шеңбердегі кезеңдерді басыңыз.
      </StationHead>
      <div className="chip-row" style={{ marginBottom: 18 }}>
        {SOCIETY_EXAMPLES.map((e) => <button key={e.id} className="chip" aria-pressed={ex === e.id} onClick={() => { sfx('click'); setEx(e.id); setNode(0); markDone(SEC, 'society') }}>{e.label}</button>)}
      </div>
      <div className="cycle-wrap">
        <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 460, margin: '0 auto', display: 'block' }}>
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="4 8" />
          <circle r="7" fill="var(--accent)"><animateMotion dur="8s" repeatCount="indefinite" path={`M${C} ${C - R} A ${R} ${R} 0 1 1 ${C - 0.01} ${C - R}`} /></circle>
          {pos.map(([x, y], i) => (
            <g key={i} onClick={() => click(i)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={node === i ? 44 : 38} fill={node === i ? 'var(--accent)' : 'var(--panel-solid)'} stroke="var(--accent)" strokeWidth="1.5" style={{ transition: 'all .3s' }} />
              <foreignObject x={x - 42} y={y - 30} width="84" height="60" style={{ pointerEvents: 'none' }}>
                <div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', fontSize: 11.5, lineHeight: 1.15, fontWeight: 600, color: node === i ? 'var(--bg)' : 'var(--ink)' }}>{CYCLE[i]}</div>
              </foreignObject>
            </g>
          ))}
          <text x={C} y={C - 6} textAnchor="middle" fill="var(--ink-dim)" fontFamily="var(--serif)" fontSize="24" fontStyle="italic">{cur.label}</text>
          <text x={C} y={C + 18} textAnchor="middle" fill="var(--ink-faint)" fontFamily="var(--mono)" fontSize="10" letterSpacing="2">ТҰЙЫҚ ЦИКЛ ↻</text>
        </svg>
        <AnimatePresence mode="wait">
          <motion.div key={ex + node} className="card info-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <span className="k">{node + 1} / 5 · {CYCLE[node]}</span>
            <h3>{cur.steps[node]}</h3>
            <p className="muted">{node === 4 ? 'Жаңа сұрақ — келесі ғылыми айналымның басы. Сондықтан ғылым ешқашан «аяқталмайды».' : 'Келесі кезеңді көру үшін шеңбердегі түйінді басыңыз.'}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </Station>
  )
}

/* ═════════ 5. Ғылыми дүниетаным ═════════ */
function WorldviewArt({ i }) {
  const stroke = 'var(--accent)'
  if (i === 0) return (
    <svg className="wv-svg" viewBox="0 0 300 300">
      {[40, 70, 100, 130].map((r, k) => <circle key={r} cx="150" cy="150" r={r} fill="none" stroke={stroke} strokeOpacity={0.3 + k * 0.15} />)}
      <circle cx="150" cy="150" r="16" fill="#5aa0d8" />
      {['Жер', 'Су', 'Ауа', 'От'].map((t, k) => <text key={t} x="150" y={150 - 40 - k * 30 + 4} textAnchor="middle" fill="var(--ink-dim)" fontSize="11">{t}</text>)}
      <circle cx="150" cy="20" r="8" fill="#ffcc55"><animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="14s" repeatCount="indefinite" /></circle>
    </svg>
  )
  if (i === 1) return (
    <svg className="wv-svg" viewBox="0 0 300 300">
      <path d="M60 90 Q150 60 150 90 Q150 60 240 90 V230 Q150 200 150 230 Q150 200 60 230 Z" fill="none" stroke={stroke} strokeWidth="2" />
      <path d="M150 90 V230" stroke={stroke} />
      {[110, 130, 150, 170, 190].map((y) => <g key={y}><path d={`M75 ${y} H135`} stroke="var(--ink-faint)" /><path d={`M165 ${y} H225`} stroke="var(--ink-faint)" /></g>)}
      <g><circle cx="150" cy="50" r="26" fill="none" stroke={stroke} strokeWidth="2" /><path d="M150 50 L170 40" stroke={stroke} strokeWidth="2"><animateTransform attributeName="transform" type="rotate" from="0 150 50" to="360 150 50" dur="6s" repeatCount="indefinite" /></path></g>
    </svg>
  )
  if (i === 2) return (
    <svg className="wv-svg" viewBox="0 0 300 300">
      {[[110, 130, 50, 12, '6s'], [190, 150, 38, 10, '-4.5s'], [150, 210, 30, 8, '3.6s']].map(([x, y, r, n, d], k) => (
        <g key={k}>
          <g>
            <circle cx={x} cy={y} r={r} fill="none" stroke={stroke} strokeWidth="2" />
            {Array.from({ length: n }).map((_, j) => { const a = (j / n) * TAU; return <rect key={j} x={x + Math.cos(a) * r - 4} y={y + Math.sin(a) * r - 4} width="8" height="8" fill={stroke} transform={`rotate(${(a * 180) / Math.PI} ${x + Math.cos(a) * r} ${y + Math.sin(a) * r})`} /> })}
            <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`${d.startsWith('-') ? -360 : 360} ${x} ${y}`} dur={d.replace('-', '')} repeatCount="indefinite" />
          </g>
        </g>
      ))}
      <text x="150" y="40" textAnchor="middle" fill="var(--ink-dim)" fontFamily="var(--serif)" fontSize="20" fontStyle="italic">F = ma</text>
    </svg>
  )
  if (i === 3) return (
    <svg className="wv-svg" viewBox="0 0 300 300">
      {Array.from({ length: 9 }).map((_, k) => <path key={'h' + k} d={`M20 ${60 + k * 22} Q150 ${60 + k * 22 + 60 * Math.exp(-((k - 4) ** 2) / 6)} 280 ${60 + k * 22}`} fill="none" stroke={stroke} strokeOpacity="0.35" />)}
      {Array.from({ length: 11 }).map((_, k) => <path key={'v' + k} d={`M${20 + k * 26} 50 Q${20 + k * 26 + (150 - (20 + k * 26)) * 0.25} 160 ${20 + k * 26} 260`} fill="none" stroke={stroke} strokeOpacity="0.35" />)}
      <circle cx="150" cy="170" r="20" fill="#ffcc55" />
      <circle r="6" fill="#7dd3fc"><animateMotion dur="5s" repeatCount="indefinite" path="M150 120 A60 50 0 1 1 149.9 120" /></circle>
    </svg>
  )
  return (
    <svg className="wv-svg" viewBox="0 0 300 300">
      {(() => {
        const pts = Array.from({ length: 16 }).map((_, k) => [150 + Math.cos(k * 2.4) * (40 + (k * 37) % 100), 150 + Math.sin(k * 2.4) * (40 + (k * 53) % 100)])
        return <>
          {pts.map((p, k) => pts.slice(k + 1, k + 4).map((q, j) => <line key={`${k}-${j}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={stroke} strokeOpacity="0.3" />))}
          {pts.map((p, k) => <circle key={k} cx={p[0]} cy={p[1]} r={k % 4 ? 4 : 7} fill={k % 3 ? stroke : '#7dffb0'}><animate attributeName="r" values={`${k % 4 ? 4 : 7};${k % 4 ? 6 : 9};${k % 4 ? 4 : 7}`} dur={`${1.5 + (k % 5) * 0.4}s`} repeatCount="indefinite" /></circle>)}
        </>
      })()}
    </svg>
  )
}

function WorldviewStation() {
  const { markDone } = useApp()
  const [i, setI] = useState(0)
  const w = WORLDVIEWS[i]
  return (
    <Station id="worldview">
      <StationHead sec={SEC} id="worldview" num="5" eyebrow="Салыстыру" title="Ғылыми дүниетаным">
        Әр дәуірде адамдар әлемді қалай елестетті? Шкаланы жылжытып, дүниетанымның өзгеруін салыстырыңыз.
      </StationHead>
      <div className="card" style={{ padding: '18px 22px', marginBottom: 18 }}>
        <input type="range" min="0" max={WORLDVIEWS.length - 1} step="1" value={i} style={{ width: '100%', accentColor: 'var(--accent)' }} aria-label="Дәуір"
          onChange={(e) => { setI(+e.target.value); sfx('hover'); markDone(SEC, 'worldview') }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 6, gap: 6 }}>
          {WORLDVIEWS.map((x, k) => <button key={x.id} onClick={() => { setI(k); markDone(SEC, 'worldview') }} style={{ background: 'none', border: 0, padding: 0, color: k === i ? 'var(--accent)' : 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }}>{x.era}</button>)}
        </div>
      </div>
      <div className="worldview-stage">
        <AnimatePresence mode="wait">
          <motion.div key={w.id} initial={{ opacity: 0, rotate: -6, scale: 0.92 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.45 }}>
            <WorldviewArt i={i} />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div key={w.id} className="card info-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <span className="k">{w.era}</span>
            <h3>{w.title}</h3>
            <p className="muted" style={{ fontSize: 17 }}>{w.text}</p>
            <div><span className="k">Білім алу тәсілі</span><p>{w.method}</p></div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Station>
  )
}

/* ═════════ 6. «Бұрын қалай ойладық?» — геоцентризм vs гелиоцентризм ═════════ */
function Body({ r, size, color, speed, label, epi, emissive, ring, phase = 0, store }) {
  const g = useRef()
  const e = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (g.current) g.current.rotation.y = t * speed + phase
    if (e.current) e.current.rotation.y = t * speed * 4.5
  })
  const planet = (
    <group>
      <mesh><sphereGeometry args={[size, 32, 32]} /><meshStandardMaterial color={color} emissive={emissive || '#000'} emissiveIntensity={emissive ? 1.6 : 0} roughness={0.6} /></mesh>
      {ring && <mesh rotation-x={1.2}><ringGeometry args={[size * 1.4, size * 2.1, 40]} /><meshStandardMaterial color="#d9c48f" side={THREE.DoubleSide} transparent opacity={0.8} /></mesh>}
      <Anchor store={store} id={label} position={[0, size + 0.18, 0]} />
    </group>
  )
  return (
    <>
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[r, 0.008, 6, 128]} /><meshBasicMaterial color="#e0b25e" transparent opacity={0.35} /></mesh>
      <group ref={g}>
        <group position-x={r}>
          {epi ? (
            <>
              <mesh rotation-x={Math.PI / 2}><torusGeometry args={[epi, 0.006, 6, 64]} /><meshBasicMaterial color="#e0b25e" transparent opacity={0.45} /></mesh>
              <group ref={e}><group position-x={epi}>{planet}</group></group>
            </>
          ) : planet}
        </group>
      </group>
    </>
  )
}

function GeoScene({ store }) {
  return (
    <>
      <color attach="background" args={['#2a1d10']} />
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 4, 3]} intensity={30} color="#ffe2b8" />
      <mesh><sphereGeometry args={[0.38, 48, 48]} /><meshStandardMaterial color="#4f8fc9" roughness={0.6} /></mesh>
      <Anchor store={store} id="Жер" position={[0, 0.62, 0]} />
      <Body r={0.8} size={0.08} color="#ddd" speed={1.3} label="Ай" store={store} />
      <Body r={1.25} size={0.07} color="#b0a08a" speed={0.9} label="Меркурий" epi={0.18} phase={1} store={store} />
      <Body r={1.7} size={0.1} color="#e6c27a" speed={0.75} label="Шолпан" epi={0.22} phase={2} store={store} />
      <Body r={2.2} size={0.2} color="#ffcc55" emissive="#ffaa22" speed={0.55} label="Күн" phase={3} store={store} />
      <Body r={2.75} size={0.09} color="#d0603a" speed={0.4} label="Марс" epi={0.28} phase={4} store={store} />
      <Body r={3.3} size={0.15} color="#d8b48a" speed={0.28} label="Юпитер" epi={0.25} phase={5} store={store} />
      <Body r={3.85} size={0.13} color="#e3d29b" speed={0.2} label="Сатурн" epi={0.22} ring phase={6} store={store} />
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[4.35, 0.03, 8, 160]} /><meshBasicMaterial color="#e0b25e" /></mesh>
      <Sparkles count={80} scale={[10, 2, 10]} size={1.6} color="#ffe3a0" speed={0.1} />
    </>
  )
}

function HelioScene({ store }) {
  return (
    <>
      <color attach="background" args={['#070b18']} />
      <ambientLight intensity={0.25} />
      <mesh><sphereGeometry args={[0.42, 48, 48]} /><meshStandardMaterial color="#ffcc55" emissive="#ffaa22" emissiveIntensity={2} /></mesh>
      <pointLight intensity={40} color="#fff1cc" distance={20} decay={1.5} />
      <Anchor store={store} id="Күн" position={[0, 0.66, 0]} />
      <Body r={0.85} size={0.07} color="#b0a08a" speed={1.6} label="Меркурий" phase={1} store={store} />
      <Body r={1.3} size={0.1} color="#e6c27a" speed={1.15} label="Шолпан" phase={2} store={store} />
      <Body r={1.85} size={0.11} color="#4a90d9" speed={0.9} label="Жер" phase={3} store={store} />
      <Body r={2.45} size={0.09} color="#d0603a" speed={0.65} label="Марс" phase={4} store={store} />
      <Body r={3.15} size={0.18} color="#d8b48a" speed={0.35} label="Юпитер" phase={5} store={store} />
      <Body r={3.85} size={0.15} color="#e3d29b" speed={0.24} label="Сатурн" ring phase={6} store={store} />
      <Stars radius={30} depth={10} count={1200} factor={2} fade />
    </>
  )
}

function PlanetLabels({ store, names }) {
  return (
    <LabelLayer>
      {names.map((n) => <Label key={n} store={store} id={n}><span className="planet-label" style={n === 'Жер' || n === 'Күн' ? { fontWeight: 700, color: '#ffe3a0', fontSize: 13 } : undefined}>{n}</span></Label>)}
    </LabelLayer>
  )
}

function CompareStation() {
  const { markDone } = useApp()
  const [x, setX] = useState(50)
  const geoStore = useLabelStore()
  const helioStore = useLabelStore()
  const box = useRef()
  const dragging = useRef(false)
  const move = (clientX) => {
    const r = box.current.getBoundingClientRect()
    setX(Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100)))
    markDone(SEC, 'geohelio')
  }
  return (
    <Station id="geohelio">
      <StationHead sec={SEC} id="geohelio" num="6" eyebrow="Before / After" title="«Бұрын қалай ойладық?»">
        Ортадағы тұтқаны жылжытып, екі модельді салыстырыңыз. Әр жақтағы жүйені тышқанмен айналдыруға болады.
      </StationHead>
      <Lazy style={{ minHeight: 'min(70vh, 620px)' }}>
        <div className="compare" ref={box}
          onPointerMove={(e) => dragging.current && move(e.clientX)}
          onPointerUp={() => (dragging.current = false)} onPointerLeave={() => (dragging.current = false)}>
          <div className="compare-layer">
            <Canvas camera={{ position: [0, 6.6, 8.2], fov: 45 }} dpr={[1, 1.5]}><HelioScene store={helioStore} /><Projector store={helioStore} /><OrbitControls enableZoom={false} enablePan={false} /></Canvas>
            <PlanetLabels store={helioStore} names={['Күн', 'Меркурий', 'Шолпан', 'Жер', 'Марс', 'Юпитер', 'Сатурн']} />
          </div>
          <div className="compare-layer" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
            <Canvas camera={{ position: [0, 6.6, 8.2], fov: 45 }} dpr={[1, 1.5]}><GeoScene store={geoStore} /><Projector store={geoStore} /><OrbitControls enableZoom={false} enablePan={false} /></Canvas>
            <PlanetLabels store={geoStore} names={['Жер', 'Ай', 'Меркурий', 'Шолпан', 'Күн', 'Марс', 'Юпитер', 'Сатурн']} />
          </div>
          <div className="compare-label l" style={{ opacity: x > 18 ? 1 : 0 }}><small>БҰРЫН · Птолемей, II ғ.</small><h3>Геоцентрлік модель</h3><p className="muted" style={{ fontSize: 14 }}>Жер ортасында. Планеталар қосымша шеңберлермен (эпициклдермен) қозғалады.</p></div>
          <div className="compare-label r" style={{ opacity: x < 82 ? 1 : 0 }}><small>КЕЙІН · Коперник, 1543</small><h3>Гелиоцентрлік модель</h3><p className="muted" style={{ fontSize: 14, color: '#c5d3ea' }}>Күн ортасында. Жер — қатардағы планета.</p></div>
          <div className="compare-handle" style={{ left: `${x}%` }} role="slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(x)} aria-label="Модельдерді салыстыру" tabIndex={0}
            onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); move(e.clientX) }}
            onPointerMove={(e) => dragging.current && move(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
            onKeyDown={(e) => { if (e.key === 'ArrowLeft') { setX((v) => Math.max(4, v - 4)); markDone(SEC, 'geohelio') } if (e.key === 'ArrowRight') { setX((v) => Math.min(96, v + 4)); markDone(SEC, 'geohelio') } }}>
            <span>⇆</span>
          </div>
        </div>
      </Lazy>
      <div className="card" style={{ marginTop: 18, maxWidth: 900 }}>
        <span className="eyebrow">Негізгі сұрақ</span>
        <h3 style={{ fontSize: 30, margin: '8px 0 10px' }}>«Жаңа дәлел пайда болған кезде ғылыми білім қалай өзгереді?»</h3>
        <p className="muted">Геоцентрлік модель 1400 жыл бойы бақылауларды жақсы түсіндірді. Бірақ телескоп әкелген жаңа дәлелдер (Шолпан фазалары, Юпитер серіктері) оны қайта қарауға мәжбүр етті. Ғылым — тұрақты «дайын жауаптар» емес, дәлелге сай өзгеріп отыратын дамушы білім жүйесі.</p>
      </div>
    </Station>
  )
}

export default function Hall61() {
  return (
    <div className="hall">
      <div className="hall-inner">
        <section className="hall-hero">
          <motion.div className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>6.1-зал · Тарихи музей</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>Ғылым тарихының маңызы</motion.h1>
          <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Ғылым тарихы адамзат білімінің қалай қалыптасқанын, ғылыми идеялардың қалай өзгергенін және қазіргі ғылыми жетістіктердің қандай тарихи негіздерден пайда болғанын түсінуге мүмкіндік береді.
          </motion.p>
          <div className="chip-row" style={{ marginTop: 26 }}>
            {['Ғылым ағашы', '1 · Білімнің дамуы', '2 · Сабақтастық', '3 · Қателіктер', '4 · Ғылым мен қоғам', '5 · Дүниетаным', '6 · Бұрын қалай ойладық?'].map((t, i) => (
              <button key={t} className="chip" onClick={() => document.getElementById(`st-${['tree', 'develop', 'continuity', 'errors', 'society', 'worldview', 'geohelio'][i]}`)?.scrollIntoView({ behavior: 'smooth' })}>{t}</button>
            ))}
          </div>
          <button className="scroll-cue" style={{ alignSelf: 'flex-start' }} onClick={() => document.getElementById('st-tree')?.scrollIntoView({ behavior: 'smooth' })}>Залға кіру<span>↓</span></button>
        </section>
        <TreeStation />
        <DevelopStation />
        <ContinuityStation />
        <ErrorsStation />
        <SocietyStation />
        <WorldviewStation />
        <CompareStation />
        <NextDoor to="hall62" title="6.2 · Ғалым үшін ғылым тарихы" sub="Ғалымның зертханасы, зерттеу симуляциясы және ғалымдар галереясы" />
      </div>
    </div>
  )
}
