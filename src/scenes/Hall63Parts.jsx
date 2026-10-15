import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import landTopo from 'world-atlas/land-110m.json'
import { useApp } from '../store.jsx'
import { AI_PATHS, AI_DEBATE, NETWORK, REGIONS } from '../data/content.js'
import { Lazy, Pic, Station, StationHead } from '../components/ui.jsx'
import { Anchor, Label, LabelLayer, Projector, useLabelStore } from '../three/labels.jsx'
import { useCursor } from '../three/common.jsx'
import { DNA } from '../three/models.jsx'
import { rng } from '../three/textures.js'
import { sfx } from '../sound.js'

const SEC = 'hall63'
const TAU = Math.PI * 2

/* ═════════ AI және ғылым тарихы: нейрондық желі ═════════ */
const LAYERS = [5, 8, 8, 5]
function NeuralNet({ mode }) {
  const nodes = useMemo(() => LAYERS.flatMap((n, l) => Array.from({ length: n }).map((_, i) => ({ l, i, p: new THREE.Vector3((l - 1.5) * 2.1, (i - (n - 1) / 2) * 0.62, Math.sin(i * 1.7 + l) * 0.4) }))), [])
  const byLayer = useMemo(() => LAYERS.map((_, l) => nodes.filter((n) => n.l === l)), [nodes])
  const edgeGeo = useMemo(() => {
    const a = []
    for (let l = 0; l < LAYERS.length - 1; l++) byLayer[l].forEach((u) => byLayer[l + 1].forEach((v) => a.push(u.p.x, u.p.y, u.p.z, v.p.x, v.p.y, v.p.z)))
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); return g
  }, [byLayer])
  const pulses = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 46 }).map(() => ({ path: byLayer.map((L) => L[Math.floor(r() * L.length)].p), t: r() * 3, sp: 0.5 + r() * 0.7, glitch: r() < 0.35 }))
  }, [byLayer])
  const inst = useRef()
  const nodeRefs = useRef([])
  const m = useMemo(() => new THREE.Object3D(), [])
  const col = mode === 'risk' ? '#ff5d73' : mode === 'help' ? '#7dffb0' : '#4de3ff'
  useFrame(({ clock }, d) => {
    pulses.forEach((p, k) => {
      p.t += d * p.sp
      if (p.t >= 3) p.t = 0
      const seg = Math.floor(p.t), f = p.t - seg
      const pos = new THREE.Vector3().lerpVectors(p.path[seg], p.path[seg + 1], f)
      if (mode === 'risk' && p.glitch) pos.add(new THREE.Vector3(Math.sin(clock.elapsedTime * 30 + k) * 0.12, Math.cos(clock.elapsedTime * 23 + k) * 0.12, 0))
      m.position.copy(pos); m.scale.setScalar(1); m.updateMatrix()
      inst.current?.setMatrixAt(k, m.matrix)
    })
    if (inst.current) inst.current.instanceMatrix.needsUpdate = true
    nodeRefs.current.forEach((n, i) => {
      if (!n) return
      const flick = mode === 'risk' && i % 5 === 0 ? (Math.sin(clock.elapsedTime * 14 + i) > 0.3 ? 2.5 : 0.2) : 1 + Math.sin(clock.elapsedTime * 2 + i) * 0.3
      n.material.emissiveIntensity = flick
    })
  })
  return (
    <group rotation-y={-0.25}>
      <lineSegments geometry={edgeGeo}><lineBasicMaterial color={col} transparent opacity={0.14} /></lineSegments>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.p} ref={(el) => (nodeRefs.current[i] = el)}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={mode === 'risk' && i % 5 === 0 ? '#ff5d73' : col} emissive={mode === 'risk' && i % 5 === 0 ? '#ff5d73' : col} emissiveIntensity={1} />
        </mesh>
      ))}
      <instancedMesh ref={inst} args={[null, null, pulses.length]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={mode === 'risk' ? '#ffb3bd' : '#ffffff'} />
      </instancedMesh>
    </group>
  )
}

export function AIStation() {
  const { markDone } = useApp()
  const [mode, setMode] = useState(null)
  const [lit, setLit] = useState(0)
  const [vote, setVote] = useState(null)
  useEffect(() => {
    if (!mode) return
    setLit(0)
    const t = setInterval(() => setLit((l) => (l >= 4 ? l : l + 1)), 650)
    return () => clearInterval(t)
  }, [mode])
  const choose = (m) => { sfx(m === 'risk' ? 'wrong' : 'click'); setMode(m); markDone(SEC, 'ai') }
  return (
    <Station id="ai">
      <StationHead sec={SEC} id="ai" eyebrow="Интерактивті аймақ" title="AI және ғылым тарихы">
        Жасанды интеллект — тарихшының жаңа құралы әрі жаңа қаупі. Бағытты таңдап, желінің қалай «ойлайтынын» бақылаңыз.
      </StationHead>
      <div className="split">
        <Lazy className="canvas-box" height="min(60vh, 520px)" style={{ background: '#04070f' }}>
          <Canvas camera={{ position: [0, 0, 7.4], fov: 50 }} dpr={[1, 1.75]}>
            <color attach="background" args={['#04070f']} />
            <ambientLight intensity={0.4} />
            <NeuralNet mode={mode} />
            <Sparkles count={50} scale={[9, 5, 4]} size={1.4} color={mode === 'risk' ? '#ff5d73' : '#4de3ff'} speed={0.4} />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          <div className="canvas-hint">{mode === 'risk' ? '⚠ шу, бұрмаланған сигналдар' : mode === 'help' ? '✓ деректер тиімді өңделуде' : 'нейрондық желі · бағытты таңдаңыз'}</div>
        </Lazy>
        <div className="ai-paths" style={{ gridTemplateColumns: '1fr', alignContent: 'center' }}>
          {['help', 'risk'].map((k) => {
            const p = AI_PATHS[k]
            return (
              <button key={k} className={`glass ai-path ${k} ${mode === k ? 'active' : ''}`} onClick={() => choose(k)}>
                <span className="eyebrow" style={{ color: k === 'help' ? 'var(--good)' : 'var(--bad)' }}>{k === 'help' ? '✓ ' : '⚠ '}{p.title}</span>
                <ol>{p.steps.map((s, i) => <li key={s} className={mode === k && i < lit ? 'lit' : ''}>{s}{i < p.steps.length - 1 ? ' →' : ''}</li>)}</ol>
                {mode === k && lit >= 4 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 10, fontSize: 14 }}>{p.note}</motion.p>}
              </button>
            )
          })}
        </div>
      </div>
      <div className="glass" style={{ padding: 24, marginTop: 18 }}>
        <span className="eyebrow">Пікірталас сұрағы</span>
        <h3 style={{ fontSize: 'clamp(26px, 3vw, 38px)', margin: '8px 0 16px' }}>«AI ғылым тарихшысын алмастыра ала ма?»</h3>
        <div className="chip-row">
          {AI_DEBATE.map((o) => <button key={o.id} className="chip" aria-pressed={vote === o.id} onClick={() => { sfx('click'); setVote(o.id); markDone(SEC, 'ai') }}>{o.label}</button>)}
        </div>
        <AnimatePresence mode="wait">
          {vote && <motion.p key={vote} className="muted" style={{ marginTop: 14, fontSize: 16.5 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{AI_DEBATE.find((o) => o.id === vote).reply}</motion.p>}
        </AnimatePresence>
      </div>
    </Station>
  )
}

/* ═════════ «Бір жаңалықтың тарихы» — 3D желі ═════════ */
const NODE_POS = {
  th1: [-1.5, 2.75, 0], th2: [1.5, 2.75, 0.2],
  sc1: [-3.5, 0.7, 0.3], sc2: [-3.5, -0.7, 0],
  ex1: [3.5, 0.7, 0.3], ex2: [3.5, -0.7, 0],
  te1: [0, -1.85, 0.6],
  nr1: [-1.7, -3.25, 0], nr2: [1.7, -3.25, 0.2],
}
const GROUP_COL = { 'Бұрынғы теориялар': '#ffd166', 'Ғалымдар': '#ff9ff3', 'Эксперименттер': '#7dffb0', 'Технология': '#4de3ff', 'Жаңа зерттеулер': '#8b7bff' }
const GROUP_POS = { 'Бұрынғы теориялар': [0, 3.55, 0], 'Ғалымдар': [-3.5, 1.45, 0], 'Эксперименттер': [3.5, 1.45, 0], 'Технология': [1.55, -1.85, 0.6], 'Жаңа зерттеулер': [0, -4.15, 0] }

function Beam({ from, to, color, progress }) {
  const ref = useRef()
  const pulse = useRef()
  const a = useMemo(() => new THREE.Vector3(...from), [from])
  const b = useMemo(() => new THREE.Vector3(...to), [to])
  const len = a.distanceTo(b)
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()), [a, b])
  useFrame(({ clock }) => {
    const p = progress.current
    if (ref.current) { ref.current.scale.y = Math.max(0.001, p); ref.current.position.copy(a).lerp(b, p / 2) }
    if (pulse.current) { pulse.current.visible = p > 0.98; pulse.current.position.copy(a).lerp(b, (clock.elapsedTime * 0.6 + len) % 1) }
  })
  return (
    <>
      <mesh ref={ref} quaternion={quat}><cylinderGeometry args={[0.018, 0.018, len, 6]} /><meshBasicMaterial color={color} transparent opacity={0.65} /></mesh>
      <mesh ref={pulse}><sphereGeometry args={[0.055, 10, 10]} /><meshBasicMaterial color="#ffffff" /></mesh>
    </>
  )
}

function DiscoveryNet({ open, sel, onCenter, onNode, store }) {
  const progress = useRef(0)
  const center = useRef()
  const nodeRefs = useRef({})
  useFrame(({ clock }, d) => {
    progress.current += ((open ? 1 : 0) - progress.current) * (1 - Math.exp(-d * 2.2))
    const p = progress.current
    if (center.current) center.current.scale.setScalar(1 + (open ? 0 : Math.sin(clock.elapsedTime * 3) * 0.08))
    NETWORK.nodes.forEach((n) => {
      const g = nodeRefs.current[n.id]
      if (!g) return
      const t = NODE_POS[n.id]
      g.position.set(t[0] * p, t[1] * p, t[2] * p)
      const s = (sel === n.id ? 1.35 : 1) * Math.max(0.001, p)
      g.scale.setScalar(s)
    })
  })
  return (
    <group>
      <group ref={center} onClick={(e) => { e.stopPropagation(); onCenter() }} onPointerOver={() => useCursor(true)} onPointerOut={() => useCursor(false)}>
        <mesh><sphereGeometry args={[0.72, 40, 40]} /><meshStandardMaterial color="#0b1a33" emissive="#4de3ff" emissiveIntensity={0.25} transparent opacity={0.55} /></mesh>
        <DNA pairs={14} height={1.1} radius={0.22} scale={1} spin={0.8} />
        <mesh><sphereGeometry args={[0.78, 24, 24]} /><meshBasicMaterial color="#4de3ff" wireframe transparent opacity={0.15} /></mesh>
      </group>
      <Anchor store={store} id="center" position={[0, 1.05, 0]} />
      {NETWORK.nodes.map((n) => {
        const out = n.g === 'Жаңа зерттеулер'
        const from = out ? [0, 0, 0] : NODE_POS[n.id]
        const to = out ? NODE_POS[n.id] : [0, 0, 0]
        return <Beam key={n.id} from={from} to={to} color={GROUP_COL[n.g]} progress={progress} />
      })}
      {NETWORK.nodes.map((n) => (
        <group key={n.id} ref={(el) => (nodeRefs.current[n.id] = el)}
          onClick={(e) => { e.stopPropagation(); onNode(n.id) }} onPointerOver={() => useCursor(true)} onPointerOut={() => useCursor(false)}>
          <mesh><icosahedronGeometry args={[0.26, 1]} /><meshStandardMaterial color={GROUP_COL[n.g]} emissive={GROUP_COL[n.g]} emissiveIntensity={sel === n.id ? 1.6 : 0.6} flatShading /></mesh>
          <Anchor store={store} id={n.id} position={[0, -0.45, 0]} />
        </group>
      ))}
      {Object.entries(GROUP_POS).map(([g, p]) => <Anchor key={g} store={store} id={`g-${g}`} position={p} />)}
    </group>
  )
}

export function NetworkStation() {
  const { markDone } = useApp()
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState(null)
  const store = useLabelStore()
  const node = NETWORK.nodes.find((n) => n.id === sel)
  const onCenter = () => { sfx('whoosh'); setOpen(true); setSel(null) }
  const onNode = (id) => { sfx('click'); setSel(id); markDone(SEC, 'network') }
  return (
    <Station id="network">
      <StationHead sec={SEC} id="network" eyebrow="3D визуализация" title="Бір жаңалықтың тарихы">
        Ғылыми жаңалық — бір адамның кенеттен тапқан нәрсесі емес. Ортадағы идеяны басып, оның артындағы желіні ашыңыз.
      </StationHead>
      <div className="split">
        <Lazy className="canvas-box" height="min(72vh, 640px)" style={{ background: '#04070f' }}>
          <Canvas camera={{ position: [0, 0, 11.5], fov: 50 }} dpr={[1, 1.75]} onPointerMissed={() => setSel(null)}>
            <color attach="background" args={['#04070f']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 4]} intensity={20} color="#4de3ff" />
            <DiscoveryNet open={open} sel={sel} onCenter={onCenter} onNode={onNode} store={store} />
            <Stars radius={40} depth={20} count={1000} factor={2} fade />
            <OrbitControls enableZoom={false} enablePan={false} maxAzimuthAngle={0.8} minAzimuthAngle={-0.8} maxPolarAngle={2.1} minPolarAngle={1.0} />
            <Projector store={store} />
          </Canvas>
          <LabelLayer>
            <Label store={store} id="center" anchor="above">
              <button className="problem-btn" style={{ fontSize: 14, fontWeight: 600 }} onClick={onCenter}>ЖАҢАЛЫҚ · {NETWORK.center.t} ({NETWORK.center.y}){!open ? ' — басыңыз' : ''}</button>
            </Label>
            {open && NETWORK.nodes.map((n) => (
              <Label key={n.id} store={store} id={n.id}><button className={`problem-btn ${sel === n.id ? 'active' : ''}`} style={{ borderColor: GROUP_COL[n.g] }} onClick={() => onNode(n.id)}>{n.t}</button></Label>
            ))}
            {open && Object.keys(GROUP_POS).map((g) => (
              <Label key={g} store={store} id={`g-${g}`}><span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: GROUP_COL[g], whiteSpace: 'nowrap', textShadow: '0 0 8px #000' }}>{g}</span></Label>
            ))}
          </LabelLayer>
          <div className="canvas-hint">{open ? 'түйінді басыңыз' : 'ортадағы идеяны басыңыз'}</div>
        </Lazy>
        <AnimatePresence mode="wait">
          <motion.div key={sel || (open ? 'open' : 'closed')} className="glass info-panel net-panel" style={{ padding: 24, justifyContent: 'center' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {node ? <>
              <span className="k" style={{ color: GROUP_COL[node.g] }}>{node.g}</span>
              <h3>{node.t}</h3>
              <p className="muted" style={{ fontSize: 16 }}>{node.d}</p>
              <p style={{ fontSize: 14, color: 'var(--ink-faint)' }}>{node.g === 'Жаңа зерттеулер' ? 'Жаңалықтан туған келесі зерттеу.' : 'Жаңалыққа осылай ықпал етті.'}</p>
            </> : <>
              <span className="k">Жаңалық · {NETWORK.center.y}</span>
              <h3>{NETWORK.center.t}</h3>
              <p className="muted">{NETWORK.center.d}</p>
              {open && <p style={{ fontSize: 14 }}>Бұрынғы теориялар ↓ · Ғалымдар → · ← Эксперименттер · Технология ↑ · ↓ Жаңа зерттеулер</p>}
              {!open && <button className="btn sm" onClick={onCenter}>Желіні ашу</button>}
            </>}
          </motion.div>
        </AnimatePresence>
      </div>
    </Station>
  )
}

/* ═════════ «Ғылым картасы» — 3D глобус ═════════ */
function latLonToVec(lat, lon, r = 1) {
  const phi = ((lon + 180) / 360) * TAU
  const theta = ((90 - lat) / 180) * Math.PI
  return new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta))
}

let landTexCache = null
function landTexture() {
  if (landTexCache) return landTexCache
  const W = 2048, H = 1024
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d')
  const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#06142a'); grd.addColorStop(0.5, '#0a1f3d'); grd.addColorStop(1, '#06142a')
  g.fillStyle = grd; g.fillRect(0, 0, W, H)
  g.strokeStyle = 'rgba(77,227,255,0.12)'; g.lineWidth = 1
  for (let lon = -180; lon <= 180; lon += 15) { const x = ((lon + 180) / 360) * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke() }
  for (let lat = -75; lat <= 75; lat += 15) { const y = ((90 - lat) / 180) * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke() }
  const geo = feature(landTopo, landTopo.objects.land)
  const px = ([lon, lat]) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H]
  g.beginPath()
  const polys = geo.features ? geo.features.flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)) : (geo.geometry.type === 'Polygon' ? [geo.geometry.coordinates] : geo.geometry.coordinates)
  polys.forEach((poly) => poly.forEach((ring) => {
    let prev = null
    ring.forEach((pt, i) => {
      const [x, y] = px(pt)
      if (i === 0 || (prev && Math.abs(pt[0] - prev[0]) > 180)) g.moveTo(x, y)
      else g.lineTo(x, y)
      prev = pt
    })
    g.closePath()
  }))
  g.fillStyle = '#1b4a6b'; g.fill('evenodd')
  g.strokeStyle = 'rgba(77,227,255,0.75)'; g.lineWidth = 1.6; g.stroke()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  landTexCache = t
  return t
}

function Pin({ region, active, onPick, store }) {
  const ring = useRef()
  const pos = useMemo(() => latLonToVec(region.lat, region.lon, 2.0), [region])
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize()), [pos])
  useFrame(({ clock }) => {
    if (!ring.current) return
    const t = (clock.elapsedTime * 0.8 + region.lat) % 1
    ring.current.scale.setScalar(1 + t * 1.6)
    ring.current.material.opacity = 0.9 * (1 - t)
  })
  const col = active ? '#ffffff' : '#ffd166'
  return (
    <group position={pos} quaternion={quat}
      onClick={(e) => { e.stopPropagation(); onPick(region.id) }} onPointerOver={() => useCursor(true)} onPointerOut={() => useCursor(false)}>
      <mesh position-y={0.12}><cylinderGeometry args={[0.012, 0.012, 0.24, 6]} /><meshBasicMaterial color={col} /></mesh>
      <mesh position-y={0.26}><sphereGeometry args={[active ? 0.07 : 0.05, 16, 16]} /><meshBasicMaterial color={col} /></mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.005}><ringGeometry args={[0.06, 0.08, 32]} /><meshBasicMaterial color="#ffd166" transparent side={THREE.DoubleSide} /></mesh>
      <mesh visible={false} position-y={0.2}><sphereGeometry args={[0.2, 8, 8]} /></mesh>
      <Anchor store={store} id={region.id} position={[0, 0.42, 0]} backface={[0, 0, 0]} />
    </group>
  )
}

function Globe({ sel, onPick, store }) {
  const spin = useRef()
  const { camera, controls } = useThree()
  const fly = useRef(null)
  const tex = useMemo(() => landTexture(), [])
  useEffect(() => {
    if (!sel || !spin.current) return
    const r = REGIONS.find((x) => x.id === sel)
    const wp = latLonToVec(r.lat, r.lon, 1).applyQuaternion(spin.current.getWorldQuaternion(new THREE.Quaternion()))
    fly.current = wp.normalize().multiplyScalar(camera.position.length())
  }, [sel, camera])
  useFrame((_, d) => {
    if (spin.current && !sel) spin.current.rotation.y += d * 0.06
    if (fly.current) {
      // шар бетімен ұшу: бағыттарды сфералық интерполяциялау
      const len = camera.position.length()
      const dir = camera.position.clone().normalize().lerp(fly.current.clone().normalize(), 1 - Math.exp(-d * 3)).normalize()
      camera.position.copy(dir.multiplyScalar(len))
      camera.lookAt(0, 0, 0)
      controls?.update()
      if (camera.position.distanceTo(fly.current) < 0.02) fly.current = null
    }
  })
  return (
    <group ref={spin} rotation-y={-1.2}>
      <mesh><sphereGeometry args={[2, 96, 96]} /><meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.55} roughness={0.8} /></mesh>
      <mesh scale={1.06}><sphereGeometry args={[2, 48, 48]} /><meshBasicMaterial color="#4de3ff" transparent opacity={0.07} side={THREE.BackSide} /></mesh>
      {REGIONS.map((r) => <Pin key={r.id} region={r} active={sel === r.id} onPick={onPick} store={store} />)}
    </group>
  )
}

export function GlobeStation() {
  const { markDone } = useApp()
  const [sel, setSel] = useState(null)
  const store = useLabelStore()
  const pick = (id) => { sfx('click'); setSel(id); markDone(SEC, 'globe') }
  const r = REGIONS.find((x) => x.id === sel)
  return (
    <Station id="globe">
      <StationHead sec={SEC} id="globe" eyebrow="Интерактивті 3D глобус" title="Ғылым картасы">
        Ғылым тек Еуропада дамыған жоқ. Глобусты айналдырып, жарқыраған аймақтарды басыңыз.
      </StationHead>
      <div className="globe-wrap">
        <Lazy className="canvas-box" height="min(72vh, 640px)" style={{ background: '#02040a' }}>
          <Canvas camera={{ position: [0, 1.6, 6.4], fov: 45 }} dpr={[1, 1.75]}>
            <color attach="background" args={['#02040a']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 3, 5]} intensity={1.2} />
            <Globe sel={sel} onPick={pick} store={store} />
            <Stars radius={50} depth={20} count={2500} factor={2.5} fade />
            <OrbitControls makeDefault enableZoom={false} enablePan={false} />
            <Projector store={store} />
          </Canvas>
          <LabelLayer>
            {REGIONS.map((x) => (
              <Label key={x.id} store={store} id={x.id}><button className={`region-btn ${sel === x.id ? 'active' : ''}`} onClick={() => pick(x.id)}>{x.name}</button></Label>
            ))}
          </LabelLayer>
          <div className="canvas-hint">⟲ глобусты айналдыру</div>
        </Lazy>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="chip-row">
            {REGIONS.map((x) => <button key={x.id} className="chip" aria-pressed={sel === x.id} style={{ fontSize: 12.5 }} onClick={() => pick(x.id)}>{x.name}</button>)}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={sel || 'none'} className="glass info-panel" style={{ padding: 22, flex: 1 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {r ? <>
                <span className="k">Аймақ</span>
                <h3>{r.name}</h3>
                <p className="muted" style={{ fontSize: 15.5 }}>{r.text}</p>
                {r.img && <Pic k={r.img} title={r.name} type="Тарихи визуал" text={r.text} style={{ aspectRatio: '16 / 9' }} />}
              </> : <>
                <span className="k">Еуроцентризм мәселесі</span>
                <h3>Кімнің тарихы?</h3>
                <p className="muted">Ұзақ уақыт ғылым тарихы негізінен еуропалық ғалымдар арқылы баяндалды. Бірақ нөл Үндістанда, алгебра Бағдат пен Хорезмде, қағаз Қытайда пайда болды. Ғылым — көптеген өркениеттің ортақ жемісі.</p>
              </>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Station>
  )
}
