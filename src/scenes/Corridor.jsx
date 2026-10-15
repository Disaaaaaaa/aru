import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useApp } from '../store.jsx'
import { ERAS } from '../data/content.js'
import { Modal, NextDoor, Pic } from '../components/ui.jsx'
import { StudioEnv, useCursor } from '../three/common.jsx'
import { ImageFrame } from '../three/ImageFrame.jsx'
import { floorTex } from '../three/textures.js'
import {
  StarGlobe, Astrolabe, PlatonicSolids, Armillary, Alembic, Manuscript, Orrery, Book, Telescope, NewtonCradle, Prism,
  VoltaicPile, Bulb, PeriodicBlocks, Computer, DNA, Atom, BlochSphere, AICore, Satellite, MAT,
} from '../three/models.jsx'
import { sfx } from '../sound.js'

const SP = 14 // кезеңдер арасындағы қашықтық
const N = ERAS.length
const CAM_OFF = 6.2
const zOf = (i) => -i * SP

function Vitruvian(props) {
  const ref = useRef()
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.4 })
  return (
    <group {...props} ref={ref}>
      <mesh><torusGeometry args={[0.7, 0.02, 8, 80]} /><meshStandardMaterial {...MAT.brass} /></mesh>
      <lineSegments position-y={-0.08}><edgesGeometry args={[new THREE.PlaneGeometry(1.22, 1.22)]} /><lineBasicMaterial color="#e0b25e" /></lineSegments>
      {[0, Math.PI / 4, -Math.PI / 4, Math.PI / 2].map((r, i) => <mesh key={i} rotation-z={r}><boxGeometry args={[1.3, 0.025, 0.025]} /><meshStandardMaterial color="#c07a3c" /></mesh>)}
      <mesh><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#c07a3c" /></mesh>
    </group>
  )
}

const EXHIBITS = [
  { left: <StarGlobe />, right: <Astrolabe scale={0.9} />, float: <PlatonicSolids /> },
  { left: <Armillary scale={0.85} />, right: <Alembic scale={1.2} />, float: <Manuscript scale={0.7} /> },
  { left: <Orrery />, right: <Book open scale={1.1} position-y={-0.4} color="#6b2a1c" />, float: <Vitruvian /> },
  { left: <Telescope position-y={-0.6} />, right: <NewtonCradle scale={0.85} />, float: <Prism /> },
  { left: <VoltaicPile scale={1.2} />, right: <Bulb scale={0.9} />, float: <PeriodicBlocks /> },
  { left: <Computer scale={0.85} />, right: <DNA scale={0.8} />, float: <Atom /> },
  { left: <BlochSphere />, right: <AICore />, float: <Satellite scale={0.8} /> },
]

function Pedestal({ x, z, color, onClick, children, label }) {
  const [hover, setHover] = useState(false)
  const ring = useRef()
  const obj = useRef()
  useFrame(({ clock }, d) => {
    if (ring.current) { const s = 1 + ((clock.elapsedTime * 0.8) % 1) * 0.6; ring.current.scale.set(s, s, s); ring.current.material.opacity = 0.7 * (1 - ((clock.elapsedTime * 0.8) % 1)) }
    if (obj.current) { const t = hover ? 1.15 : 1; obj.current.scale.x += (t - obj.current.scale.x) * (1 - Math.exp(-d * 8)); obj.current.scale.y = obj.current.scale.z = obj.current.scale.x }
  })
  return (
    <group position={[x, 0, z]}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); useCursor(true); sfx('hover') }}
      onPointerOut={() => { setHover(false); useCursor(false) }}
      onClick={(e) => { e.stopPropagation(); onClick() }}>
      <mesh position-y={-1.05}><cylinderGeometry args={[0.6, 0.7, 0.9, 32]} /><meshStandardMaterial color="#2a2018" roughness={0.6} metalness={0.2} /></mesh>
      <mesh position-y={-0.58}><cylinderGeometry args={[0.66, 0.66, 0.05, 32]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={hover ? 1.2 : 0.35} /></mesh>
      <mesh ref={ring} position-y={-1.48} rotation-x={-Math.PI / 2}><ringGeometry args={[0.75, 0.82, 48]} /><meshBasicMaterial color={color} transparent opacity={0.5} /></mesh>
      <group ref={obj} position-y={0.3}>{children}</group>
      <mesh visible={false} position-y={0.2}><boxGeometry args={[1.6, 2.4, 1.6]} /></mesh>
    </group>
  )
}

function EraSection({ i, onOpen, onImage }) {
  const era = ERAS[i]
  const z = zOf(i)
  const ex = EXHIBITS[i]
  const floatRef = useRef()
  useFrame(({ clock }) => { if (floatRef.current) floatRef.current.position.y = 2.35 + Math.sin(clock.elapsedTime * 1.2 + i) * 0.12 })
  const col = useMemo(() => new THREE.Color(era.color), [era.color])
  return (
    <group>
      <pointLight position={[0, 2.6, z - 0.5]} color={col} intensity={18} distance={13} decay={1.6} />
      <Pedestal x={-1.85} z={z - 1} color={era.color} onClick={() => onOpen(i)}>{ex.left}</Pedestal>
      <Pedestal x={1.85} z={z - 1.6} color={era.color} onClick={() => onOpen(i)}>{ex.right}</Pedestal>
      <group ref={floatRef} position={[0, 2.35, z - 3.2]} scale={0.7} onClick={(e) => { e.stopPropagation(); onOpen(i) }}
        onPointerOver={() => useCursor(true)} onPointerOut={() => useCursor(false)}>
        {ex.float}
      </group>
      {/* қабырғадағы суреттер: портрет, құрал, құжат, идея */}
      {era.images.map((im, j) => {
        const left = j % 2 === 0
        const zz = z + 1.8 - Math.floor(j / 2) * 4.2
        return (
          <ImageFrame key={im.key} k={im.key} height={1.55} maxWidth={2.3}
            position={[left ? -3.92 : 3.92, 0.85, zz]} rotation-y={left ? Math.PI / 2 : -Math.PI / 2}
            onClick={() => onImage(im)} />
        )
      })}
      {/* кезең арасындағы арка */}
      <group position={[0, 0, z - SP / 2]}>
        {[-3.4, 3.4].map((x) => <mesh key={x} position={[x, 1, 0]}><boxGeometry args={[0.5, 5, 0.5]} /><meshStandardMaterial color="#2b2118" roughness={0.7} /></mesh>)}
        <mesh position={[0, 3.35, 0]}><boxGeometry args={[7.3, 0.4, 0.5]} /><meshStandardMaterial color="#2b2118" /></mesh>
        <mesh position={[0, 3.12, 0.26]}><boxGeometry args={[6.3, 0.05, 0.02]} /><meshStandardMaterial color={ERAS[Math.min(i + 1, N - 1)].color} emissive={ERAS[Math.min(i + 1, N - 1)].color} emissiveIntensity={1.4} /></mesh>
      </group>
      {/* кезеңге тән декор */}
      {(i === 0 || i === 2) && [-3.3, 3.3].flatMap((x) => [z + 4, z - 4].map((zz) => (
        <mesh key={`${x}${zz}`} position={[x, 0.9, zz]}><cylinderGeometry args={[0.28, 0.32, 4.8, 16]} /><meshStandardMaterial color={i === 0 ? '#d9c7a0' : '#c8a27a'} roughness={0.8} /></mesh>
      )))}
      {i === 4 && [-3.6, 3.6].map((x) => (
        <mesh key={x} position={[x, 2.7, z]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.1, 0.1, SP, 12]} /><meshStandardMaterial color="#6d5a48" metalness={0.8} roughness={0.4} /></mesh>
      ))}
      {i >= 5 && [-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, -1.49, z]}><boxGeometry args={[0.04, 0.01, SP]} /><meshStandardMaterial color={era.color} emissive={era.color} emissiveIntensity={2} /></mesh>
      ))}
    </group>
  )
}

function Hall({ progress }) {
  const { camera, scene } = useThree()
  const floor = useMemo(() => { const t = floorTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, (N * SP + 20) / 2); t.needsUpdate = true; return t }, [])
  const walls = useRef([])
  const fogCol = useMemo(() => new THREE.Color(), [])
  const tmpA = useMemo(() => new THREE.Color(), [])
  const tmpB = useMemo(() => new THREE.Color(), [])
  const look = useRef(new THREE.Vector3())
  useEffect(() => { scene.fog = new THREE.Fog('#000', 4, 26) }, [scene])
  useFrame(({ pointer }, d) => {
    const f = progress.current * (N - 1)
    const tz = CAM_OFF - f * SP
    const k = 1 - Math.exp(-d * 4)
    camera.position.z += (tz - camera.position.z) * k
    camera.position.x += (pointer.x * 0.5 - camera.position.x) * k
    camera.position.y += (0.4 + pointer.y * 0.25 - camera.position.y) * k
    look.current.set(pointer.x * 1.6, 0.5 + pointer.y * 0.6, camera.position.z - 8)
    camera.lookAt(look.current)
    // кезеңге қарай атмосфераның өзгеруі
    const camF = THREE.MathUtils.clamp((CAM_OFF - camera.position.z) / SP, 0, N - 1)
    const a = Math.floor(camF), b = Math.min(a + 1, N - 1), t = camF - a
    tmpA.set(ERAS[a].fog); tmpB.set(ERAS[b].fog)
    fogCol.copy(tmpA).lerp(tmpB, t)
    scene.fog.color.copy(fogCol)
    if (!scene.background) scene.background = new THREE.Color()
    scene.background.copy(fogCol)
    tmpA.set(ERAS[a].color); tmpB.set(ERAS[b].color)
    walls.current.forEach((w) => w && w.material.color.copy(fogCol).lerp(tmpA.lerp(tmpB, t), 0.18).multiplyScalar(1.4))
  })
  const len = N * SP + 24
  const mid = -((N - 1) * SP) / 2
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#fff1d6', '#20140a', 0.5]} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.5, mid]}><planeGeometry args={[8, len]} /><meshStandardMaterial map={floor} color="#3a2f24" roughness={0.55} metalness={0.3} /></mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, 3.6, mid]}><planeGeometry args={[8, len]} /><meshStandardMaterial color="#0c0907" /></mesh>
      <mesh ref={(el) => (walls.current[0] = el)} rotation-y={Math.PI / 2} position={[-4, 1, mid]}><planeGeometry args={[len, 5.2]} /><meshStandardMaterial color="#2a2018" roughness={0.9} /></mesh>
      <mesh ref={(el) => (walls.current[1] = el)} rotation-y={-Math.PI / 2} position={[4, 1, mid]}><planeGeometry args={[len, 5.2]} /><meshStandardMaterial color="#2a2018" roughness={0.9} /></mesh>
      {/* төбедегі шамдар жолағы */}
      {Array.from({ length: N * 3 }).map((_, j) => <mesh key={j} position={[0, 3.55, 4 - j * (SP / 3)]}><boxGeometry args={[1.6, 0.04, 0.25]} /><meshBasicMaterial color="#fff2d0" /></mesh>)}
    </>
  )
}

function Scene({ progress, onOpen, onImage }) {
  return (
    <>
      <Hall progress={progress} />
      <Suspense fallback={null}><StudioEnv intensity={0.8} /></Suspense>
      {ERAS.map((_, i) => <EraSection key={i} i={i} onOpen={onOpen} onImage={onImage} />)}
      <Sparkles count={160} scale={[7, 4, N * SP]} position={[0, 1, -((N - 1) * SP) / 2]} size={2} speed={0.25} color="#ffe3a0" opacity={0.6} />
    </>
  )
}

export default function Corridor() {
  const { markDone, isDone, setLightbox, go } = useApp()
  const track = useRef()
  const progress = useRef(0)
  const [p, setP] = useState(0)
  const [open, setOpen] = useState(null)

  const metrics = useCallback(() => {
    const el = track.current
    if (!el) return { top: 0, range: 1 }
    const top = el.getBoundingClientRect().top + window.scrollY
    return { top, range: el.offsetHeight - window.innerHeight }
  }, [])

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const { top, range } = metrics()
        const v = THREE.MathUtils.clamp((window.scrollY - top) / range, 0, 1)
        progress.current = v
        setP(v)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [metrics])

  const scrollToP = (v, smooth = true) => {
    const { top, range } = metrics()
    window.scrollTo({ top: top + v * range, behavior: smooth ? 'smooth' : 'auto' })
  }
  const eraIdx = Math.round(p * (N - 1))
  const era = ERAS[eraIdx]

  useEffect(() => {
    const h = (e) => {
      if (open !== null) return
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollToP(Math.min(1, (eraIdx + 1) / (N - 1))) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToP(Math.max(0, (eraIdx - 1) / (N - 1))) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  const openEra = (i) => { sfx('click'); setOpen(i); markDone('corridor', ERAS[i].id) }
  const onImage = (im) => { sfx('click'); setLightbox({ k: im.key, title: im.title, type: im.type, text: im.text }) }
  const cur = open !== null ? ERAS[open] : null

  return (
    <div className="hall">
      <div className="corridor-track" ref={track} style={{ height: `${N * 90 + 100}vh` }}>
        <div className="corridor-stage">
          <Canvas camera={{ position: [0, 0.4, CAM_OFF], fov: 62, near: 0.1, far: 60 }} dpr={[1, 1.6]}>
            <Scene progress={progress} onOpen={openEra} onImage={onImage} />
          </Canvas>
          <div className="corridor-ui">
            <AnimatePresence mode="wait">
              <motion.div key={era.id} className="era-label" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4 }}>
                <div className="eyebrow">Ғылымның уақыт дәлізі · {eraIdx + 1}/{N}</div>
                <h2 style={{ textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>{era.name}</h2>
                <div className="years">{era.years}</div>
                <p className="muted" style={{ marginTop: 10, maxWidth: 420, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>{era.objects}</p>
                <button className="btn" onClick={() => openEra(eraIdx)}>{isDone('corridor', era.id) ? '✓ ' : ''}Кезеңді зерттеу</button>
                {eraIdx === N - 1 && <button className="btn ghost" style={{ marginLeft: 10 }} onClick={() => go('hall61')}>6.1 залына өту →</button>}
              </motion.div>
            </AnimatePresence>
            <div className="timeline card">
              <input type="range" min="0" max="1000" value={Math.round(p * 1000)} aria-label="Уақыт шкаласы"
                onChange={(e) => scrollToP(+e.target.value / 1000, false)} />
              <div className="tl-ticks">
                {ERAS.map((e, i) => (
                  <button key={e.id} className={`tl-tick ${i === eraIdx ? 'active' : ''} ${isDone('corridor', e.id) ? 'seen' : ''}`} onClick={() => scrollToP(i / (N - 1))}>
                    <i /><span>{e.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hall-inner"><NextDoor to="hall61" title="6.1 · Ғылым тарихының маңызы" sub="Ғылым ағашы, теориялардың өзгеруі және «Бұрын қалай ойладық?»" /></div>

      <Modal open={open !== null} onClose={() => setOpen(null)} width={1080}>
        {cur && (
          <div className={`era-card ${open <= 4 ? 'parchment' : ''}`} style={{ borderRadius: 16, padding: open <= 4 ? 26 : 0, margin: open <= 4 ? -8 : 0 }}>
            <div className="era-grid">
              <div>
                <div className="eyebrow">{cur.name} · {cur.years}</div>
                <h3>{cur.cardTitle}</h3>
                <p style={{ fontSize: 17 }}>{cur.text}</p>
                <ul className="facts">{cur.facts.map((f) => <li key={f}>{f}</li>)}</ul>
                <p className="muted" style={{ marginTop: 16, fontSize: 13.5 }}>Залдағы объектілер: {cur.objects}</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  {open < N - 1 && <button className="btn sm" onClick={() => { setOpen(null); setTimeout(() => scrollToP((open + 1) / (N - 1)), 250) }}>Келесі кезең: {ERAS[open + 1].name} →</button>}
                  {open === N - 1 && <button className="btn sm" onClick={() => go('hall61')}>6.1 залына өту →</button>}
                </div>
              </div>
              <div className="era-imgs">
                {cur.images.map((im) => <Pic key={im.key} k={im.key} title={im.title} type={im.type} text={im.text} />)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
