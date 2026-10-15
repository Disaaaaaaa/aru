import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Line, Sparkles, Stars } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { useApp } from '../store.jsx'
import { HERO_OBJECTS } from '../data/content.js'
import { Astrolabe, Manuscript, Telescope, Microscope, NewtonCradle, Bulb, DNA, Computer, Satellite, AICore } from '../three/models.jsx'
import { StudioEnv, Parallax, useCursor } from '../three/common.jsx'
import { sfx } from '../sound.js'
import { Anchor, Label, LabelLayer, Projector, useLabelStore } from '../three/labels.jsx'

const upper = (i) => Math.sin(THREE.MathUtils.degToRad(205 - i * (230 / 9))) > 0

const MODELS = {
  astrolabe: (p) => <Astrolabe {...p} />,
  manuscript: (p) => <Manuscript {...p} />,
  telescope: (p) => <Telescope {...p} scale={0.9} position={[0, -0.4, 0]} />,
  microscope: (p) => <Microscope {...p} scale={1.15} />,
  newton: (p) => <NewtonCradle {...p} scale={0.9} />,
  electric: (p) => <Bulb {...p} />,
  dna: (p) => <DNA {...p} height={2} />,
  computer: (p) => <Computer {...p} scale={0.95} />,
  spacecraft: (p) => <Satellite {...p} scale={0.85} />,
  ai: (p) => <AICore {...p} />,
}

function HeroItem({ obj, position, scale, onHover, active, index, store }) {
  const ref = useRef()
  const [hover, setHover] = useState(false)
  useFrame(({ clock }, d) => {
    if (!ref.current) return
    const k = 1 - Math.exp(-d * 8)
    const s = (hover || active ? 1.22 : 1) * scale
    ref.current.scale.x += (s - ref.current.scale.x) * k
    ref.current.scale.y += (s - ref.current.scale.y) * k
    ref.current.scale.z += (s - ref.current.scale.z) * k
    const wob = hover || active ? Math.sin(clock.elapsedTime * 6) * 0.12 : 0
    ref.current.rotation.z += (wob - ref.current.rotation.z) * k
    ref.current.rotation.y += ((hover || active ? 0.5 : 0) + Math.sin(clock.elapsedTime * 0.4 + index) * 0.25 - ref.current.rotation.y) * k
  })
  const over = (e) => { e.stopPropagation(); setHover(true); useCursor(true); sfx('hover'); onHover(obj.id) }
  const out = () => { setHover(false); useCursor(false); onHover(null) }
  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <group position={position}>
        <group ref={ref} scale={scale} onPointerOver={over} onPointerOut={out} onClick={(e) => { e.stopPropagation(); onHover(obj.id, true) }}>
          {/* көрінбейтін үлкен hit-аймақ */}
          <mesh visible={false}><sphereGeometry args={[1.1, 8, 8]} /></mesh>
          {MODELS[obj.id]({})}
        </group>
        <Anchor store={store} id={obj.id} position={[0, (upper(index) ? -1 : 1) * (1.15 * scale + 0.1), 0]} />
      </group>
    </Float>
  )
}

function Composition({ onHover, active, store }) {
  const { viewport } = useThree()
  const narrow = viewport.aspect < 1
  const items = useMemo(() => {
    const rx = narrow ? viewport.width * 0.36 : Math.min(6.4, viewport.width * 0.42)
    const ry = narrow ? viewport.height * 0.36 : Math.min(3.5, viewport.height * 0.36)
    return HERO_OBJECTS.map((o, i) => {
      const a = THREE.MathUtils.degToRad(205 - i * (230 / 9))
      return { obj: o, position: [Math.cos(a) * rx, Math.sin(a) * ry - 0.2, -1.2 + Math.sin(i * 1.3) * 0.9], scale: narrow ? 0.38 : 0.62 }
    })
  }, [viewport.width, viewport.height, narrow])
  const curve = useMemo(() => new THREE.CatmullRomCurve3(items.map((i) => new THREE.Vector3(...i.position))), [items])
  const pts = useMemo(() => curve.getPoints(200), [curve])
  const pulse = useRef()
  useFrame(({ clock }) => {
    if (pulse.current) pulse.current.position.copy(curve.getPointAt((clock.elapsedTime * 0.06) % 1))
  })
  return (
    <>
      <Line points={pts} color="#e0b25e" lineWidth={1.2} transparent opacity={0.35} dashed dashSize={0.18} gapSize={0.12} />
      <mesh ref={pulse}><sphereGeometry args={[0.06, 12, 12]} /><meshBasicMaterial color="#ffe3a0" /></mesh>
      {items.map((it, i) => <HeroItem key={it.obj.id} index={i} {...it} onHover={onHover} active={active === it.obj.id} store={store} />)}
    </>
  )
}

export default function Intro() {
  const { setMapOpen, markDone, go } = useApp()
  const [active, setActive] = useState(null)
  const [hovered, setHovered] = useState(null)
  const store = useLabelStore()
  const onHover = (id, pin) => {
    if (id) markDone('intro', 'objects')
    if (pin) setActive((a) => (a === id ? null : id))
    else setHovered(id)
  }
  const shown = hovered || active
  const shownIdx = HERO_OBJECTS.findIndex((o) => o.id === shown)
  const shownObj = HERO_OBJECTS[shownIdx]
  const start = () => { sfx('click'); markDone('intro', 'objects'); setMapOpen(true) }
  return (
    <section className="intro">
      <div className="intro-canvas">
        <Canvas camera={{ position: [0, 0, 11], fov: 45 }} dpr={[1, 1.75]} onPointerMissed={() => setActive(null)}>
          <color attach="background" args={['#120d08']} />
          <fog attach="fog" args={['#120d08', 10, 24]} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 6, 6]} intensity={1.4} color="#ffe2b8" />
          <directionalLight position={[-6, -2, 3]} intensity={0.5} color="#7aa2ff" />
          <Suspense fallback={null}>
            <StudioEnv />
            <Composition onHover={onHover} active={active} store={store} />
          </Suspense>
          <Stars radius={60} depth={30} count={1800} factor={3} fade speed={0.6} />
          <Sparkles count={70} scale={[16, 9, 6]} size={2.2} speed={0.3} color="#e0b25e" />
          <Parallax strength={0.8} base={[0, 0, 11]} />
          <Projector store={store} />
        </Canvas>
        <LabelLayer>
          {shownObj && (
            <Label key={shownObj.id} store={store} id={shownObj.id} anchor={upper(shownIdx) ? 'below' : 'above'}>
              <div className="hero-tip"><b>{shownObj.name}</b><span>«{shownObj.caption}»</span></div>
            </Label>
          )}
        </LabelLayer>
      </div>
      <div className="intro-title">
        <motion.div className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Виртуалды 3D ғылыми музей · Өткеннен болашаққа</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30, letterSpacing: '0.3em' }} animate={{ opacity: 1, y: 0, letterSpacing: '0.06em' }} transition={{ duration: 1.2, ease: 'easeOut' }}>ҒЫЛЫМ ТАРИХЫ</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}>Адамзаттың әлемді тану жолына саяхат</motion.p>
        <motion.button className="btn" onClick={start} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          3D турды бастау
        </motion.button>
      </div>
      <div className="intro-bottom">
        <button className="scroll-cue" onClick={() => go('corridor')}>Ғылым тарихына саяхат<span>↓</span></button>
      </div>
      <div className="intro-legend">Объектіге курсорды апарыңыз<br />астролябиядан жасанды интеллектке дейін</div>
    </section>
  )
}
