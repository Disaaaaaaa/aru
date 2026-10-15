import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Sparkles } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import { useApp } from '../store.jsx'
import { LAB_OBJECTS, PATH_CHOICES, RESEARCH_STEPS, SCIENTISTS } from '../data/content.js'
import { Lazy, Modal, NextDoor, Pic, Station, StationHead, imgSrc } from '../components/ui.jsx'
import { StudioEnv, useCursor } from '../three/common.jsx'
import { Book, Microscope, Flask, Computer, Article, Chalkboard, MAT } from '../three/models.jsx'
import { sfx } from '../sound.js'
import { Anchor, Label, LabelLayer, Projector, useLabelStore } from '../three/labels.jsx'

const SEC = 'hall62'

/* ═════════ Ғалымның зертханасы (3D үстел) ═════════ */
const SPOTS = {
  book: { pos: [-2.05, -0.55, 0.15], label: 'Кітап' },
  microscope: { pos: [-1.0, -0.12, -0.1], label: 'Микроскоп' },
  flask: { pos: [0.0, -0.32, 0.25], label: 'Қате тәжірибе' },
  computer: { pos: [1.2, -0.25, -0.2], label: 'Компьютер' },
  article: { pos: [2.25, -0.62, 0.3], label: 'Ғылыми мақала' },
  board: { pos: [0, 1.35, -1.85], label: 'Формулалар тақтасы' },
}

function CameraRig({ focus }) {
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3(0, 0, 0))
  useFrame(({ pointer }, d) => {
    const k = 1 - Math.exp(-d * 3)
    let tp, tl
    if (focus) {
      const p = SPOTS[focus].pos
      tl = new THREE.Vector3(p[0], p[1] + 0.15, p[2])
      tp = focus === 'board' ? new THREE.Vector3(p[0], p[1] - 0.1, p[2] + 3.8) : new THREE.Vector3(p[0] + 0.5, p[1] + 1.25, p[2] + 2.9)
    } else {
      tl = new THREE.Vector3(0, -0.1, 0)
      tp = new THREE.Vector3(pointer.x * 0.6, 1.4 + pointer.y * 0.3, 5.6 / Math.min(1, size.width / size.height / 1.5))
    }
    camera.position.lerp(tp, k)
    look.current.lerp(tl, k)
    camera.lookAt(look.current)
  })
  return null
}

function Spot({ id, focus, onPick, children, store }) {
  const [hover, setHover] = useState(false)
  const ring = useRef()
  const p = SPOTS[id].pos
  useFrame(({ clock }) => {
    if (!ring.current) return
    const t = (clock.elapsedTime * 0.9) % 1
    ring.current.scale.setScalar(0.6 + t * 0.8)
    ring.current.material.opacity = 0.8 * (1 - t)
  })
  const active = focus === id
  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); useCursor(true); sfx('hover') }}
      onPointerOut={() => { setHover(false); useCursor(false) }}
      onClick={(e) => { e.stopPropagation(); onPick(id) }}>
      {children}
      {id !== 'board' && (
        <mesh ref={ring} position={[p[0], -0.77, p[2]]} rotation-x={-Math.PI / 2}><ringGeometry args={[0.38, 0.44, 40]} /><meshBasicMaterial color={hover || active ? '#ffe3a0' : '#e0b25e'} transparent /></mesh>
      )}
      <Anchor store={store} id={id} position={id === 'board' ? [p[0] - 1.05, p[1] - 0.98, p[2] + 0.1] : [p[0], p[1] + 0.95, p[2]]} />
    </group>
  )
}

function Lab({ focus, onPick, store }) {
  const sp = (id, el) => <Spot key={id} id={id} focus={focus} onPick={onPick} store={store}>{el}</Spot>
  return (
    <>
      <color attach="background" args={['#101511']} />
      <fog attach="fog" args={['#101511', 8, 16]} />
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 5, 3]} angle={0.7} penumbra={0.6} intensity={60} color="#ffe6c0" castShadow />
      <pointLight position={[-3, 1.5, 1]} intensity={6} color="#6fae8f" />
      <Suspense fallback={null}><StudioEnv /></Suspense>
      {/* бөлме */}
      <mesh position={[0, 1, -2]}><planeGeometry args={[14, 7]} /><meshStandardMaterial color="#1d2620" roughness={0.9} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-1.9}><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#17110b" roughness={0.8} /></mesh>
      {[-5.2, 5.2].map((x) => (
        <group key={x} position={[x, 0.3, -1.8]}>
          {[0, 1, 2].map((r) => <mesh key={r} position-y={r * 0.8 - 0.6}><boxGeometry args={[2.2, 0.06, 0.4]} /><meshStandardMaterial {...MAT.wood} /></mesh>)}
          {[0, 1, 2].flatMap((r) => Array.from({ length: 9 }).map((_, b) => (
            <mesh key={`${r}-${b}`} position={[-0.95 + b * 0.22 + (r % 2) * 0.05, r * 0.8 - 0.36 + (b % 3) * 0.02, 0]}><boxGeometry args={[0.16, 0.42 - (b % 3) * 0.05, 0.3]} /><meshStandardMaterial color={['#6b2a1c', '#2c4a3a', '#7a5a2a', '#2a3a5a'][(b + r) % 4]} roughness={0.7} /></mesh>
          )))}
        </group>
      ))}
      {/* үстел */}
      <mesh position={[0, -0.86, 0]} castShadow receiveShadow><boxGeometry args={[5.6, 0.14, 2.1]} /><meshStandardMaterial color="#5b3a1d" roughness={0.55} /></mesh>
      {[[-2.6, -0.9], [2.6, -0.9], [-2.6, 0.9], [2.6, 0.9]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x, -1.4, z]}><boxGeometry args={[0.12, 1.0, 0.12]} /><meshStandardMaterial color="#3e2712" /></mesh>)}
      <ContactShadows position={[0, -0.78, 0]} opacity={0.5} scale={6} blur={2.5} far={1} />
      {sp('book', <group position={SPOTS.book.pos}><Book color="#2c4a3a" position={[0, -0.13, 0]} /><Book color="#6b2a1c" position={[0.05, 0.04, 0]} rotation-y={0.2} /><Book open color="#7a5a2a" position={[0, 0.17, 0]} scale={0.7} rotation-y={-0.3} /></group>)}
      {sp('microscope', <Microscope position={SPOTS.microscope.pos} scale={0.95} rotation-y={0.4} />)}
      {sp('flask', <group position={SPOTS.flask.pos}><Flask liquid="#ff5d73" scale={0.75} rotation-z={0.06} /><Flask liquid="#7cff9a" scale={0.5} position={[0.5, -0.12, -0.25]} /></group>)}
      {sp('computer', <Computer position={SPOTS.computer.pos} scale={0.75} rotation-y={-0.35} />)}
      {sp('article', <Article position={SPOTS.article.pos} rotation-y={-0.2} />)}
      {sp('board', <Chalkboard position={SPOTS.board.pos} />)}
      <Sparkles count={40} scale={[8, 4, 4]} size={1.6} speed={0.2} color="#ffe3a0" opacity={0.5} />
    </>
  )
}

function LabStation() {
  const { markDone } = useApp()
  const [focus, setFocus] = useState(null)
  const [seen, setSeen] = useState(() => new Set())
  const store = useLabelStore()
  const pick = (id) => {
    sfx('click'); setFocus(id); markDone(SEC, 'lab')
    setSeen((s) => new Set(s).add(id))
  }
  const obj = LAB_OBJECTS.find((o) => o.id === focus)
  return (
    <Station id="lab">
      <StationHead sec={SEC} id="lab" eyebrow="Ғалымның зертханасы" title="Үстелдегі әр затта — бір сабақ">
        Объектіні басыңыз: камера жақындап, оның ғалым үшін ғылым тарихы туралы не айтатынын көрсетеді. Зерттелді: {seen.size} / {LAB_OBJECTS.length}
      </StationHead>
      <Lazy className="canvas-box" height="min(74vh, 660px)">
        <Canvas shadows camera={{ position: [0, 1.4, 5.6], fov: 42 }} dpr={[1, 1.75]} onPointerMissed={() => setFocus(null)}>
          <Lab focus={focus} onPick={pick} store={store} />
          <CameraRig focus={focus} />
          <Projector store={store} />
        </Canvas>
        <LabelLayer>
          {Object.keys(SPOTS).map((id) => (
            <Label key={id} store={store} id={id}>
              <button className={`lab-tag ${focus === id ? 'on' : ''} ${seen.has(id) ? 'seen' : ''}`} onClick={() => pick(id)}>{seen.has(id) ? '✓ ' : ''}{SPOTS[id].label}</button>
            </Label>
          ))}
        </LabelLayer>
        <AnimatePresence>
          {obj && (
            <motion.div className="card lab-panel" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
              <span className="eyebrow">{obj.name}</span>
              <h3 style={{ fontSize: 30, margin: '6px 0 10px' }}>«{obj.title}»</h3>
              <p className="muted">{obj.text}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <button className="btn sm ghost" onClick={() => setFocus(null)}>← Жалпы көрініс</button>
                {(() => {
                  const ids = LAB_OBJECTS.map((o) => o.id)
                  const nx = ids[(ids.indexOf(obj.id) + 1) % ids.length]
                  return <button className="btn sm" onClick={() => pick(nx)}>Келесі: {LAB_OBJECTS.find((o) => o.id === nx).name} →</button>
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="canvas-hint">басу — жақындату · бос жерді басу — қайту</div>
      </Lazy>
    </Station>
  )
}

/* ═════════ «Ғалымның жолын таңда» симуляциясы ═════════ */
function PathStation() {
  const { markDone } = useApp()
  const [choice, setChoice] = useState(null)
  const [built, setBuilt] = useState(['s1', 's2'])
  const [shake, setShake] = useState(null)
  const [hint, setHint] = useState('')
  const pool = useMemo(() => {
    const rest = RESEARCH_STEPS.slice(2)
    return [rest[2], rest[0], rest[4], rest[1], rest[3]]
  }, [])
  const ch = PATH_CHOICES.find((c) => c.id === choice)
  const complete = built.length === RESEARCH_STEPS.length
  const pickStep = (s) => {
    const expected = RESEARCH_STEPS[built.length]
    if (s.id === expected.id) {
      sfx('click'); setHint('')
      const nb = [...built, s.id]; setBuilt(nb)
      if (nb.length === RESEARCH_STEPS.length) markDone(SEC, 'path')
    } else {
      sfx('wrong'); setShake(s.id); setTimeout(() => setShake(null), 450)
      const hints = { s5: 'Тәжірибені жоспарсыз бастасаңыз, нәтижені салыстыру қиын болады. Алдымен болжам мен әдіс керек.', s6: 'Нәтиже алу үшін алдымен деректер жинау керек.', s7: 'Жаңа білім — процестің соңғы кезеңі.', s4: 'Әдісті таңдау үшін алдымен нені тексеретініңізді (гипотезаны) анықтаңыз.', s3: 'Дұрыс бағыт!' }
      setHint(hints[s.id] || 'Ойланып көріңіз: бұл қадамға дейін не істеу керек?')
    }
  }
  const reset = () => { setChoice(null); setBuilt(['s1', 's2']); setHint('') }
  return (
    <Station id="path">
      <StationHead sec={SEC} id="path" eyebrow="Мини-симуляция · сіз — ғалымсыз" title="«Ғалымның жолын таңда»" />
      <div className="split" style={{ alignItems: 'start' }}>
        <div className="card" style={{ padding: 26 }}>
          <span className="eyebrow">Сценарий</span>
          <h3 style={{ fontSize: 30, margin: '8px 0 18px' }}>Сіз жаңа ғылыми зерттеу бастадыңыз. Бірінші не істейсіз?</h3>
          <div className="choice-list">
            {PATH_CHOICES.map((c) => (
              <button key={c.id} className={`choice ${choice === c.id ? 'sel' : ''}`} onClick={() => { sfx(c.id === 'B' ? 'click' : 'wrong'); setChoice(c.id); setBuilt(['s1', 's2']) }}>
                <b>{c.id}</b><span>{c.text}</span>
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {ch ? (
            <motion.div key={ch.id} className={`card outcome ${ch.tone}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="eyebrow">Таңдаудың салдары</span>
              <p style={{ fontSize: 17, margin: '10px 0 14px' }}>{ch.outcome}</p>
              <p className="lesson">{ch.lesson}</p>
              {ch.id !== 'B' && <button className="btn sm ghost" style={{ marginTop: 16 }} onClick={reset}>↺ Басқа жолды таңдау</button>}
            </motion.div>
          ) : (
            <motion.div key="wait" className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', placeItems: 'center', minHeight: 220, textAlign: 'center' }}>
              <p className="muted">Таңдау жасаңыз — мұнда оның салдары көрсетіледі.<br />Дұрыс/қате деп емес, нәтижесі арқылы.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {choice === 'B' && (
        <motion.div className="card" style={{ marginTop: 20, padding: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="eyebrow">Енді зерттеу процесін құрыңыз · {built.length}/{RESEARCH_STEPS.length}</span>
          <div className="steps-built" style={{ margin: '14px 0' }}>
            {RESEARCH_STEPS.map((s, i) => (
              <span key={s.id} style={{ display: 'contents' }}>
                {i < built.length
                  ? <motion.span className="step-pill" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{s.t}<small>{s.d}</small></motion.span>
                  : <span className="step-slot">{i + 1}. ?</span>}
                {i < RESEARCH_STEPS.length - 1 && <span style={{ color: 'var(--accent)' }}>→</span>}
              </span>
            ))}
          </div>
          {!complete ? (
            <>
              <p className="muted" style={{ marginBottom: 10 }}>Келесі қадамды таңдаңыз:</p>
              <div className="chip-row">
                {pool.filter((s) => !built.includes(s.id)).map((s) => (
                  <button key={s.id} className={`chip ${shake === s.id ? 'shake' : ''}`} onClick={() => pickStep(s)}>{s.t}</button>
                ))}
              </div>
              {hint && <p style={{ marginTop: 12, color: 'var(--warn)' }}>{hint}</p>}
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="lesson">Зерттеу ғылым тарихынан басталып, жаңа білімге — болашақ ғалымдардың «тарихына» айналады.</p>
              <button className="btn sm ghost" style={{ marginTop: 14 }} onClick={reset}>↺ Қайта ойнау</button>
            </motion.div>
          )}
        </motion.div>
      )}
    </Station>
  )
}

/* ═════════ Ғалымдар галереясы ═════════ */
function Portrait({ s, seen, onOpen }) {
  const ref = useRef()
  const [err, setErr] = useState(false)
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 14}deg) translateZ(20px)`
  }
  const leave = () => { ref.current.style.transform = '' }
  const src = imgSrc(s.key)
  return (
    <motion.button ref={ref} className="portrait" onMouseMove={move} onMouseLeave={leave} onClick={() => onOpen(s)}
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} aria-label={`${s.name} — ашу`}>
      <div className="frame-in">{src && !err ? <img src={src} alt={s.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setErr(true)} /> : <div className="pic-fallback">{s.name[0]}</div>}</div>
      <div className="plate">{s.name}</div>
      {seen && <span className="seen-badge">✓</span>}
    </motion.button>
  )
}

function GalleryStation() {
  const { markDone } = useApp()
  const [open, setOpen] = useState(null)
  const [seen, setSeen] = useState(() => new Set())
  const openS = (s) => { sfx('click'); setOpen(s); markDone(SEC, 'gallery'); setSeen((x) => new Set(x).add(s.key)) }
  return (
    <Station id="gallery">
      <StationHead sec={SEC} id="gallery" eyebrow="Виртуалды қабырға" title="Ғалымдар галереясы">
        Бұл — өмірбаяндар емес: әр ғалым ғылымның қалай дамитынын түсіндіретін мысал. Портретті басыңыз. Ашылды: {seen.size} / {SCIENTISTS.length}
      </StationHead>
      <div className="gallery-room">
        <div className="gallery-wall">
          {SCIENTISTS.map((s) => <Portrait key={s.key} s={s} seen={seen.has(s.key)} onOpen={openS} />)}
        </div>
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} width={940}>
        {open && (
          <div className="sci-modal">
            <Pic k={open.key} title={open.name} type="Ғалым" text={`${open.era}. ${open.idea}`} caption={false} />
            <div>
              <div className="eyebrow">Ғалым</div>
              <h3 style={{ fontSize: 40, margin: '4px 0 14px' }}>{open.name}</h3>
              <div className="sci-fields">
                <div><span className="k">Дәуірі</span><p>{open.era}</p></div>
                <div><span className="k">Негізгі идеясы</span><p>{open.idea}</p></div>
                <div><span className="k">Ғылымға қосқан үлесі</span><p>{open.contribution}</p></div>
                <div><span className="k">Оның еңбегі кейінгі ғылымға қалай әсер етті?</span><p>{open.impact}</p></div>
                <p className="lesson">{open.lesson}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                {(() => {
                  const i = SCIENTISTS.findIndex((x) => x.key === open.key)
                  return <>
                    <button className="btn sm ghost" onClick={() => openS(SCIENTISTS[(i + SCIENTISTS.length - 1) % SCIENTISTS.length])}>← Алдыңғы</button>
                    <button className="btn sm" onClick={() => openS(SCIENTISTS[(i + 1) % SCIENTISTS.length])}>Келесі →</button>
                  </>
                })()}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Station>
  )
}

export default function Hall62() {
  return (
    <div className="hall">
      <div className="hall-inner">
        <section className="hall-hero">
          <motion.div className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>6.2-зал · Ғалымның зертханасы</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>Ғалым үшін ғылым тарихы неге маңызды?</motion.h1>
          <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Ғалым бос жерден бастамайды. Алдыңғы зерттеулер, әдістер мен тіпті сәтсіз тәжірибелер — жаңа жаңалықтың іргетасы. Бұл залда сіз ғалымның орнына отырасыз.
          </motion.p>
          <div className="chip-row" style={{ marginTop: 26 }}>
            {[['lab', 'Зертхана'], ['path', 'Ғалымның жолы'], ['gallery', 'Ғалымдар галереясы']].map(([id, t]) => (
              <button key={id} className="chip" onClick={() => document.getElementById(`st-${id}`)?.scrollIntoView({ behavior: 'smooth' })}>{t}</button>
            ))}
          </div>
          <button className="scroll-cue" style={{ alignSelf: 'flex-start', marginTop: 40 }} onClick={() => document.getElementById('st-lab')?.scrollIntoView({ behavior: 'smooth' })}>Зертханаға кіру<span>↓</span></button>
        </section>
        <LabStation />
        <PathStation />
        <GalleryStation />
        <NextDoor to="hall63" title="6.3 · Қазіргі мәселелер" sub="Futuristic зерттеу орталығы: архив, цифрлық ғылым, AI және ғылым картасы" />
      </div>
    </div>
  )
}
