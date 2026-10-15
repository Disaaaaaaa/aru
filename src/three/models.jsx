// Процедуралық 3D ғылыми объектілер: сыртқы модель файлынсыз, тек геометрия.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { manuscriptTex, screenTex, boardTex, articleTex, panelTex } from './textures.js'

export const MAT = {
  bronze: { color: '#b98340', metalness: 0.85, roughness: 0.32 },
  brass: { color: '#d4ab55', metalness: 0.9, roughness: 0.28 },
  darkBronze: { color: '#6e4a22', metalness: 0.7, roughness: 0.45 },
  wood: { color: '#5b3a1d', metalness: 0.05, roughness: 0.75 },
  black: { color: '#1c1c1e', metalness: 0.4, roughness: 0.4 },
  steel: { color: '#b8c2cc', metalness: 0.9, roughness: 0.25 },
  cream: { color: '#e8dcc0', metalness: 0.05, roughness: 0.7 },
}
const TAU = Math.PI * 2

/* ── Астролябия ── */
export function Astrolabe(props) {
  const rete = useRef()
  useFrame((_, d) => { if (rete.current) rete.current.rotation.z += d * 0.25 })
  return (
    <group {...props}>
      <mesh><torusGeometry args={[0.9, 0.08, 16, 72]} /><meshStandardMaterial {...MAT.bronze} /></mesh>
      <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.86, 0.86, 0.05, 72]} /><meshStandardMaterial {...MAT.darkBronze} /></mesh>
      <mesh position={[0, 1.03, 0]}><torusGeometry args={[0.15, 0.04, 12, 32]} /><meshStandardMaterial {...MAT.bronze} /></mesh>
      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i / 48) * TAU
        return <mesh key={i} position={[Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0.04]} rotation-z={a}><boxGeometry args={[i % 4 ? 0.06 : 0.12, 0.012, 0.01]} /><meshStandardMaterial {...MAT.brass} /></mesh>
      })}
      <group ref={rete} position-z={0.05}>
        <mesh><torusGeometry args={[0.55, 0.02, 8, 60]} /><meshStandardMaterial {...MAT.brass} /></mesh>
        <mesh position={[0.16, 0.12, 0]}><torusGeometry args={[0.4, 0.018, 8, 60]} /><meshStandardMaterial {...MAT.brass} /></mesh>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * TAU
          return <mesh key={i} position={[Math.cos(a) * 0.66, Math.sin(a) * 0.66, 0]} rotation-z={a - Math.PI / 2}><coneGeometry args={[0.035, 0.16, 6]} /><meshStandardMaterial {...MAT.brass} /></mesh>
        })}
      </group>
      <mesh position-z={0.09} rotation-z={0.6}><boxGeometry args={[1.72, 0.07, 0.02]} /><meshStandardMaterial {...MAT.brass} /></mesh>
      <mesh position-z={0.1} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.05, 0.05, 0.06, 16]} /><meshStandardMaterial {...MAT.brass} /></mesh>
    </group>
  )
}

/* ── Қолжазба (орама) ── */
export function Manuscript(props) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.1, 1.5, 20, 20)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getY(i) * 2.2) * 0.06 + Math.cos(p.getX(i) * 3) * 0.02)
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <group {...props}>
      <mesh geometry={geo}><meshStandardMaterial map={manuscriptTex()} side={THREE.DoubleSide} roughness={0.85} /></mesh>
      {[0.78, -0.78].map((y) => (
        <group key={y} position={[0, y, 0.03]}>
          <mesh rotation-z={Math.PI / 2}><cylinderGeometry args={[0.07, 0.07, 1.22, 20]} /><meshStandardMaterial color="#d9c391" roughness={0.8} /></mesh>
          {[-0.68, 0.68].map((x) => <mesh key={x} position-x={x} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.045, 0.06, 0.14, 12]} /><meshStandardMaterial {...MAT.wood} /></mesh>)}
        </group>
      ))}
    </group>
  )
}

/* ── Телескоп ── */
export function Telescope(props) {
  return (
    <group {...props}>
      <group position={[0, 0.55, 0]} rotation={[0, 0, 0.55]}>
        <mesh rotation-z={Math.PI / 2}><cylinderGeometry args={[0.09, 0.15, 1.9, 32]} /><meshStandardMaterial {...MAT.brass} /></mesh>
        {[-0.8, -0.3, 0.3, 0.86].map((x) => <mesh key={x} position-x={x} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.17 - (x + 1) * 0.03, 0.17 - (x + 1) * 0.03, 0.06, 32]} /><meshStandardMaterial {...MAT.darkBronze} /></mesh>)}
        <mesh position-x={1.0} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.06, 0.06, 0.18, 16]} /><meshStandardMaterial {...MAT.black} /></mesh>
        <mesh position-x={-0.96} rotation-z={-Math.PI / 2}><circleGeometry args={[0.14, 32]} /><meshStandardMaterial color="#9ad0ff" metalness={0.2} roughness={0.05} emissive="#2a5d8a" emissiveIntensity={0.5} /></mesh>
      </group>
      <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial {...MAT.darkBronze} /></mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * TAU
        return <mesh key={i} position={[Math.cos(a) * 0.22, 0.02, Math.sin(a) * 0.22]} rotation={[Math.sin(a) * 0.38, 0, -Math.cos(a) * 0.38]}><cylinderGeometry args={[0.022, 0.03, 1.05, 8]} /><meshStandardMaterial {...MAT.wood} /></mesh>
      })}
    </group>
  )
}

/* ── Микроскоп ── */
export function Microscope(props) {
  return (
    <group {...props}>
      <mesh position={[0, -0.62, 0]}><boxGeometry args={[0.7, 0.1, 0.55]} /><meshStandardMaterial {...MAT.black} /></mesh>
      <mesh position={[-0.18, -0.3, 0]}><boxGeometry args={[0.12, 0.6, 0.16]} /><meshStandardMaterial {...MAT.black} /></mesh>
      <mesh position={[-0.04, 0.05, 0]} rotation-z={Math.PI * 0.08}><torusGeometry args={[0.32, 0.06, 12, 32, Math.PI * 0.8]} /><meshStandardMaterial {...MAT.black} /></mesh>
      <mesh position={[0.1, -0.25, 0]}><boxGeometry args={[0.42, 0.04, 0.4]} /><meshStandardMaterial {...MAT.steel} /></mesh>
      <group position={[0.12, 0.22, 0]} rotation-z={0.25}>
        <mesh><cylinderGeometry args={[0.07, 0.07, 0.62, 24]} /><meshStandardMaterial {...MAT.brass} /></mesh>
        <mesh position-y={0.38}><cylinderGeometry args={[0.05, 0.06, 0.16, 20]} /><meshStandardMaterial {...MAT.black} /></mesh>
        <mesh position-y={-0.36}><cylinderGeometry args={[0.1, 0.1, 0.07, 24]} /><meshStandardMaterial {...MAT.steel} /></mesh>
        <mesh position-y={-0.44}><cylinderGeometry args={[0.03, 0.045, 0.12, 16]} /><meshStandardMaterial {...MAT.brass} /></mesh>
      </group>
      <mesh position={[0.1, -0.45, 0]} rotation-x={-0.5}><cylinderGeometry args={[0.09, 0.09, 0.02, 24]} /><meshStandardMaterial color="#e8f4ff" metalness={1} roughness={0.05} /></mesh>
      <mesh position={[-0.12, 0.05, 0.1]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.07, 0.07, 0.05, 20]} /><meshStandardMaterial {...MAT.steel} /></mesh>
    </group>
  )
}

/* ── Ньютон бесігі ── */
export function NewtonCradle(props) {
  const balls = useRef([])
  useFrame(({ clock }) => {
    const s = Math.sin(clock.elapsedTime * 3.2)
    if (balls.current[0]) balls.current[0].rotation.z = -Math.max(0, s) * 0.6
    if (balls.current[4]) balls.current[4].rotation.z = -Math.min(0, s) * 0.6
  })
  const xs = [-0.4, -0.2, 0, 0.2, 0.4]
  return (
    <group {...props}>
      <mesh position={[0, -0.72, 0]}><boxGeometry args={[1.4, 0.06, 0.6]} /><meshStandardMaterial {...MAT.black} /></mesh>
      {[-0.25, 0.25].map((z) => (
        <group key={z} position-z={z}>
          {[-0.62, 0.62].map((x) => <mesh key={x} position={[x, -0.05, 0]}><cylinderGeometry args={[0.02, 0.02, 1.34, 8]} /><meshStandardMaterial {...MAT.steel} /></mesh>)}
          <mesh position={[0, 0.62, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.02, 0.02, 1.26, 8]} /><meshStandardMaterial {...MAT.steel} /></mesh>
        </group>
      ))}
      {xs.map((x, i) => (
        <group key={x} position={[x, 0.62, 0]} ref={(el) => (balls.current[i] = el)}>
          {[-0.25, 0.25].map((z) => (
            <mesh key={z} position={[0, -0.44, z / 2]} rotation-x={z > 0 ? -0.5 : 0.5}><cylinderGeometry args={[0.004, 0.004, 1.0, 4]} /><meshStandardMaterial color="#ddd" /></mesh>
          ))}
          <mesh position-y={-0.88}><sphereGeometry args={[0.1, 32, 32]} /><meshStandardMaterial {...MAT.steel} metalness={1} roughness={0.12} /></mesh>
        </group>
      ))}
    </group>
  )
}

/* ── Электр шамы ── */
export function Bulb(props) {
  const light = useRef()
  const fil = useRef()
  useFrame(({ clock }) => {
    const f = 0.85 + Math.sin(clock.elapsedTime * 17) * 0.05 + Math.sin(clock.elapsedTime * 5.3) * 0.08
    if (light.current) light.current.intensity = 2.2 * f
    if (fil.current) fil.current.emissiveIntensity = 3 * f
  })
  return (
    <group {...props}>
      <mesh position-y={0.2}><sphereGeometry args={[0.5, 40, 40]} /><meshStandardMaterial color="#fff4d6" transparent opacity={0.22} roughness={0.05} emissive="#ffcc66" emissiveIntensity={0.25} /></mesh>
      <mesh position-y={-0.32}><cylinderGeometry args={[0.2, 0.33, 0.3, 32]} /><meshStandardMaterial color="#fff4d6" transparent opacity={0.22} /></mesh>
      <mesh position-y={0.18} rotation-x={Math.PI / 2}><torusGeometry args={[0.12, 0.012, 8, 40]} /><meshStandardMaterial ref={fil} color="#ffb347" emissive="#ff9a2a" emissiveIntensity={3} /></mesh>
      {[-0.08, 0.08].map((x) => <mesh key={x} position={[x, -0.05, 0]}><cylinderGeometry args={[0.008, 0.008, 0.45, 6]} /><meshStandardMaterial color="#888" /></mesh>)}
      {[0, 1, 2, 3].map((i) => <mesh key={i} position-y={-0.52 - i * 0.07}><cylinderGeometry args={[0.2, 0.2, 0.05, 32]} /><meshStandardMaterial {...MAT.brass} /></mesh>)}
      <mesh position-y={-0.82}><cylinderGeometry args={[0.08, 0.16, 0.08, 24]} /><meshStandardMaterial {...MAT.black} /></mesh>
      <pointLight ref={light} position-y={0.2} color="#ffbe6a" intensity={2.2} distance={4} />
    </group>
  )
}

/* ── ДНҚ қос спиралі ── */
export function DNA({ pairs = 22, height = 2.2, radius = 0.38, spin = 0.5, ...props }) {
  const ref = useRef()
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * spin })
  const colors = ['#ff6b6b', '#ffd166', '#06d6a0', '#4dabf7']
  return (
    <group {...props}>
      <group ref={ref}>
        {Array.from({ length: pairs }).map((_, i) => {
          const t = i / (pairs - 1)
          const y = (t - 0.5) * height
          const a = t * TAU * 2
          const p1 = [Math.cos(a) * radius, y, Math.sin(a) * radius]
          const p2 = [Math.cos(a + Math.PI) * radius, y, Math.sin(a + Math.PI) * radius]
          return (
            <group key={i}>
              <mesh position={p1}><sphereGeometry args={[0.07, 16, 16]} /><meshStandardMaterial color="#cfe8ff" metalness={0.3} roughness={0.3} /></mesh>
              <mesh position={p2}><sphereGeometry args={[0.07, 16, 16]} /><meshStandardMaterial color="#cfe8ff" metalness={0.3} roughness={0.3} /></mesh>
              <mesh position={[0, y, 0]} rotation={[0, -a, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, radius * 2, 8]} />
                <meshStandardMaterial color={colors[i % 4]} emissive={colors[i % 4]} emissiveIntensity={0.35} />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

/* ── Компьютер ── */
export function Computer(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.3, -0.1]}><boxGeometry args={[1.0, 0.8, 0.75]} /><meshStandardMaterial color="#d8cfb8" roughness={0.6} /></mesh>
      <mesh position={[0, 0.32, 0.276]}><planeGeometry args={[0.78, 0.58]} /><meshStandardMaterial map={screenTex()} emissive="#ffffff" emissiveMap={screenTex()} emissiveIntensity={0.9} /></mesh>
      <mesh position={[0, -0.14, 0]}><boxGeometry args={[0.5, 0.08, 0.4]} /><meshStandardMaterial color="#c9bfa6" /></mesh>
      <mesh position={[0, -0.22, 0.6]} rotation-x={0.08}><boxGeometry args={[1.0, 0.06, 0.34]} /><meshStandardMaterial color="#d8cfb8" /></mesh>
      {Array.from({ length: 30 }).map((_, i) => <mesh key={i} position={[-0.42 + (i % 10) * 0.094, -0.18, 0.5 + Math.floor(i / 10) * 0.09]}><boxGeometry args={[0.075, 0.03, 0.07]} /><meshStandardMaterial color="#efe8d6" /></mesh>)}
    </group>
  )
}

/* ── Ғарыш аппараты (серік) ── */
export function Satellite(props) {
  const ref = useRef()
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.3 })
  return (
    <group {...props}>
      <group ref={ref}>
        <mesh><boxGeometry args={[0.5, 0.6, 0.5]} /><meshStandardMaterial color="#d6a640" metalness={1} roughness={0.35} /></mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.45, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.015, 0.015, 0.4, 6]} /><meshStandardMaterial {...MAT.steel} /></mesh>
            <mesh position={[s * 1.05, 0, 0]}><boxGeometry args={[0.95, 0.42, 0.02]} /><meshStandardMaterial map={panelTex()} metalness={0.6} roughness={0.3} /></mesh>
          </group>
        ))}
        <mesh position={[0, 0.45, 0]} rotation-x={Math.PI}><sphereGeometry args={[0.28, 32, 16, 0, TAU, 0, Math.PI * 0.32]} /><meshStandardMaterial color="#eeeeee" side={THREE.DoubleSide} metalness={0.5} roughness={0.3} /></mesh>
        <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.01, 0.01, 0.4, 6]} /><meshStandardMaterial {...MAT.steel} /></mesh>
        <mesh position={[0, 0.8, 0]}><sphereGeometry args={[0.03, 12, 12]} /><meshStandardMaterial color="#ff5555" emissive="#ff3333" emissiveIntensity={2} /></mesh>
      </group>
    </group>
  )
}

/* ── Жасанды интеллект ядросы ── */
export function AICore({ color = '#4de3ff', ...props }) {
  const ref = useRef()
  const inner = useRef()
  const { edges, verts } = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(0.8, 1)
    const e = new THREE.EdgesGeometry(ico)
    const pos = ico.attributes.position
    const seen = new Map()
    for (let i = 0; i < pos.count; i++) {
      const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`
      if (!seen.has(key)) seen.set(key, [pos.getX(i), pos.getY(i), pos.getZ(i)])
    }
    return { edges: e, verts: [...seen.values()] }
  }, [])
  useFrame(({ clock }, d) => {
    if (ref.current) { ref.current.rotation.y += d * 0.35; ref.current.rotation.x += d * 0.12 }
    if (inner.current) inner.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.2) * 0.08)
  })
  return (
    <group {...props}>
      <group ref={ref}>
        <lineSegments geometry={edges}><lineBasicMaterial color={color} transparent opacity={0.7} /></lineSegments>
        {verts.map((v, i) => <mesh key={i} position={v}><sphereGeometry args={[0.04, 10, 10]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} /></mesh>)}
      </group>
      <mesh ref={inner}><icosahedronGeometry args={[0.32, 2]} /><meshStandardMaterial color="#a78bfa" emissive="#7c5cff" emissiveIntensity={1.4} roughness={0.2} /></mesh>
      <pointLight color={color} intensity={1.5} distance={3} />
    </group>
  )
}

/* ── Кітап ── */
export function Book({ color = '#6b2a1c', open = false, ...props }) {
  if (open) {
    return (
      <group {...props}>
        {[-1, 1].map((s) => (
          <group key={s} rotation-z={s * -0.08}>
            <mesh position={[s * 0.36, 0, 0]}><boxGeometry args={[0.72, 0.04, 1.0]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
            <mesh position={[s * 0.35, 0.05, 0]}><boxGeometry args={[0.68, 0.06, 0.94]} /><meshStandardMaterial color="#f0e4c6" roughness={0.9} /></mesh>
          </group>
        ))}
      </group>
    )
  }
  return (
    <group {...props}>
      <mesh><boxGeometry args={[0.75, 0.16, 1.0]} /><meshStandardMaterial color={color} roughness={0.65} /></mesh>
      <mesh position={[0.02, 0, 0]}><boxGeometry args={[0.73, 0.13, 0.96]} /><meshStandardMaterial color="#efe3c5" roughness={0.9} /></mesh>
      <mesh position={[-0.37, 0, 0]}><boxGeometry args={[0.04, 0.17, 1.0]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
      <mesh position={[0.05, 0.082, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[0.12, 0.15, 32]} /><meshStandardMaterial {...MAT.brass} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

/* ── Колба (сәтсіз тәжірибе) ── */
export function Flask({ liquid = '#7cff9a', ...props }) {
  const bub = useRef([])
  useFrame(({ clock }) => {
    bub.current.forEach((b, i) => { if (b) { const t = (clock.elapsedTime * 0.5 + i * 0.37) % 1; b.position.y = 0.0 + t * 1.1; b.material.opacity = 0.6 * (1 - t); b.scale.setScalar(0.5 + t) } })
  })
  return (
    <group {...props}>
      <mesh position-y={-0.15}><cylinderGeometry args={[0.1, 0.42, 0.6, 32, 1, true]} /><meshStandardMaterial color="#d8f3ff" transparent opacity={0.28} side={THREE.DoubleSide} roughness={0.05} /></mesh>
      <mesh position-y={-0.45}><cylinderGeometry args={[0.42, 0.42, 0.01, 32]} /><meshStandardMaterial color="#d8f3ff" transparent opacity={0.3} /></mesh>
      <mesh position-y={0.32}><cylinderGeometry args={[0.1, 0.1, 0.36, 24, 1, true]} /><meshStandardMaterial color="#d8f3ff" transparent opacity={0.28} side={THREE.DoubleSide} /></mesh>
      <mesh position-y={-0.32}><cylinderGeometry args={[0.27, 0.4, 0.25, 32]} /><meshStandardMaterial color={liquid} emissive={liquid} emissiveIntensity={0.5} transparent opacity={0.75} /></mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} ref={(el) => (bub.current[i] = el)} position={[Math.sin(i * 2) * 0.05, 0, Math.cos(i * 3) * 0.05]}>
          <sphereGeometry args={[0.05, 10, 10]} /><meshStandardMaterial color="#888" transparent opacity={0.5} />
        </mesh>
      ))}
      <mesh position={[0.35, -0.47, 0.25]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.28, 24]} /><meshStandardMaterial color={liquid} emissive={liquid} emissiveIntensity={0.3} transparent opacity={0.55} /></mesh>
    </group>
  )
}

/* ── Армиллярлық сфера ── */
export function Armillary(props) {
  const ref = useRef()
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.3 })
  return (
    <group {...props}>
      <group ref={ref}>
        {[0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].map((r, i) => <mesh key={i} rotation={[0, r, 0]}><torusGeometry args={[0.8, 0.025, 8, 64]} /><meshStandardMaterial {...MAT.brass} /></mesh>)}
        <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.8, 0.03, 8, 64]} /><meshStandardMaterial {...MAT.bronze} /></mesh>
        <mesh rotation={[Math.PI / 2, 0.41, 0]}><torusGeometry args={[0.8, 0.06, 8, 64]} /><meshStandardMaterial {...MAT.darkBronze} /></mesh>
        <mesh><sphereGeometry args={[0.16, 24, 24]} /><meshStandardMaterial color="#3b6ea5" roughness={0.5} /></mesh>
        <mesh rotation-z={0.41}><cylinderGeometry args={[0.012, 0.012, 2, 6]} /><meshStandardMaterial {...MAT.steel} /></mesh>
      </group>
      <mesh position-y={-1.0}><cylinderGeometry args={[0.05, 0.2, 0.25, 16]} /><meshStandardMaterial {...MAT.wood} /></mesh>
      <mesh position-y={-1.14}><cylinderGeometry args={[0.35, 0.4, 0.06, 32]} /><meshStandardMaterial {...MAT.wood} /></mesh>
    </group>
  )
}

/* ── Платон денелері ── */
export function PlatonicSolids(props) {
  const ref = useRef()
  useFrame((_, d) => { if (ref.current) ref.current.children.forEach((c, i) => { c.rotation.y += d * (0.3 + i * 0.1); c.rotation.x += d * 0.15 }) })
  const geos = useMemo(() => [new THREE.TetrahedronGeometry(0.26), new THREE.BoxGeometry(0.34, 0.34, 0.34), new THREE.OctahedronGeometry(0.26), new THREE.DodecahedronGeometry(0.25), new THREE.IcosahedronGeometry(0.26)], [])
  return (
    <group {...props} ref={ref}>
      {geos.map((g, i) => {
        const a = (i / 5) * TAU
        return (
          <group key={i} position={[Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0]}>
            <mesh geometry={g}><meshStandardMaterial color="#e8d3a2" transparent opacity={0.25} roughness={0.2} /></mesh>
            <lineSegments><edgesGeometry args={[g]} /><lineBasicMaterial color="#f2c46a" /></lineSegments>
          </group>
        )
      })}
    </group>
  )
}

/* ── Жұлдыз картасы (аспан глобусы) ── */
export function StarGlobe(props) {
  const ref = useRef()
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.15 })
  const { pts, lines } = useMemo(() => {
    const pos = []
    for (let i = 0; i < 260; i++) {
      const u = Math.random() * 2 - 1, t = Math.random() * TAU, s = Math.sqrt(1 - u * u)
      pos.push(s * Math.cos(t) * 0.71, u * 0.71, s * Math.sin(t) * 0.71)
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    const lp = []
    for (let i = 0; i < 40; i++) { const a = i * 3, b = (i * 3 + 9) % 260 * 3; lp.push(pos[a], pos[a + 1], pos[a + 2], pos[b], pos[b + 1], pos[b + 2]) }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3))
    return { pts: g, lines: lg }
  }, [])
  return (
    <group {...props}>
      <group ref={ref}>
        <mesh><sphereGeometry args={[0.7, 48, 48]} /><meshStandardMaterial color="#14214a" roughness={0.6} metalness={0.2} /></mesh>
        <points geometry={pts}><pointsMaterial color="#ffe9a8" size={0.035} /></points>
        <lineSegments geometry={lines}><lineBasicMaterial color="#e0b25e" transparent opacity={0.5} /></lineSegments>
        <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.73, 0.015, 8, 64]} /><meshStandardMaterial {...MAT.brass} /></mesh>
      </group>
      <mesh rotation-z={0.4}><torusGeometry args={[0.8, 0.03, 8, 64, Math.PI]} /><meshStandardMaterial {...MAT.brass} /></mesh>
      <mesh position-y={-0.9}><cylinderGeometry args={[0.06, 0.25, 0.3, 16]} /><meshStandardMaterial {...MAT.wood} /></mesh>
    </group>
  )
}

/* ── Алхимиялық ыдыс (реторта) ── */
export function Alembic(props) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0.15, 0.6, 0), new THREE.Vector3(0.5, 0.55, 0), new THREE.Vector3(0.95, 0.1, 0)]), [])
  return (
    <group {...props}>
      <mesh><sphereGeometry args={[0.38, 32, 32]} /><meshStandardMaterial color="#b9e3d0" transparent opacity={0.35} roughness={0.05} /></mesh>
      <mesh position-y={-0.12}><sphereGeometry args={[0.3, 32, 16, 0, TAU, Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color="#9b3df5" emissive="#6d28d9" emissiveIntensity={0.6} transparent opacity={0.8} /></mesh>
      <mesh><tubeGeometry args={[curve, 32, 0.05, 12]} /><meshStandardMaterial color="#b9e3d0" transparent opacity={0.4} /></mesh>
      <mesh position={[0, -0.48, 0]}><cylinderGeometry args={[0.3, 0.36, 0.14, 24]} /><meshStandardMaterial {...MAT.darkBronze} /></mesh>
      <pointLight position={[0, -0.1, 0]} color="#a855f7" intensity={0.8} distance={2} />
    </group>
  )
}

/* ── Гелиоцентрлік оррерий ── */
export function Orrery({ scale = 1, ...props }) {
  const refs = useRef([])
  const planets = [{ r: 0.35, s: 0.05, c: '#b0a08a', sp: 1.6 }, { r: 0.55, s: 0.07, c: '#e6c27a', sp: 1.1 }, { r: 0.78, s: 0.075, c: '#4a90d9', sp: 0.8 }, { r: 1.0, s: 0.06, c: '#d0603a', sp: 0.6 }]
  useFrame(({ clock }) => { refs.current.forEach((g, i) => { if (g) g.rotation.y = clock.elapsedTime * planets[i].sp }) })
  return (
    <group scale={scale} {...props}>
      <mesh><sphereGeometry args={[0.18, 32, 32]} /><meshStandardMaterial color="#ffcc55" emissive="#ffaa22" emissiveIntensity={1.5} /></mesh>
      <pointLight color="#ffcc66" intensity={1.2} distance={4} />
      {planets.map((p, i) => (
        <group key={i}>
          <mesh rotation-x={Math.PI / 2}><torusGeometry args={[p.r, 0.006, 6, 80]} /><meshStandardMaterial {...MAT.brass} /></mesh>
          <group ref={(el) => (refs.current[i] = el)}>
            <mesh position-x={p.r}><sphereGeometry args={[p.s, 20, 20]} /><meshStandardMaterial color={p.c} /></mesh>
            <mesh position={[p.r / 2, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.006, 0.006, p.r, 4]} /><meshStandardMaterial {...MAT.brass} /></mesh>
          </group>
        </group>
      ))}
      <mesh position-y={-0.5}><cylinderGeometry args={[0.02, 0.02, 1, 8]} /><meshStandardMaterial {...MAT.brass} /></mesh>
      <mesh position-y={-1.0}><cylinderGeometry args={[0.3, 0.38, 0.08, 32]} /><meshStandardMaterial {...MAT.wood} /></mesh>
    </group>
  )
}

/* ── Призма және спектр ── */
export function Prism(props) {
  const rainbow = ['#ff3b3b', '#ff9a3b', '#ffe53b', '#3bff6b', '#3bb5ff', '#5b3bff', '#b03bff']
  return (
    <group {...props}>
      <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.4, 0.4, 0.5, 3]} /><meshStandardMaterial color="#e6f6ff" transparent opacity={0.4} roughness={0.02} metalness={0.1} /></mesh>
      <mesh position={[-0.85, -0.1, 0]} rotation-z={0.15}><boxGeometry args={[1.1, 0.025, 0.025]} /><meshBasicMaterial color="#ffffff" /></mesh>
      {rainbow.map((c, i) => (
        <mesh key={c} position={[0.75, -0.05 - i * 0.045, 0]} rotation-z={-0.12 - i * 0.05}><boxGeometry args={[1.0, 0.02, 0.02]} /><meshBasicMaterial color={c} /></mesh>
      ))}
    </group>
  )
}

/* ── Атом моделі ── */
export function Atom({ color = '#7dd3fc', ...props }) {
  const e = useRef([])
  useFrame(({ clock }) => {
    e.current.forEach((m, i) => { if (m) { const t = clock.elapsedTime * (1.6 + i * 0.4) + i; m.position.set(Math.cos(t) * 0.85, Math.sin(t) * 0.32, 0) } })
  })
  return (
    <group {...props}>
      {[[0, 0, 0], [0.09, 0.06, 0], [-0.07, 0.08, 0.05], [0.02, -0.08, 0.07], [-0.05, -0.04, -0.08], [0.07, -0.02, -0.07]].map((p, i) => (
        <mesh key={i} position={p}><sphereGeometry args={[0.09, 20, 20]} /><meshStandardMaterial color={i % 2 ? '#ff6b6b' : '#ffd166'} roughness={0.35} /></mesh>
      ))}
      {[0, Math.PI / 3, -Math.PI / 3].map((r, i) => (
        <group key={i} rotation-z={r}>
          <mesh scale={[1, 0.376, 1]}><torusGeometry args={[0.85, 0.008, 6, 90]} /><meshBasicMaterial color={color} transparent opacity={0.6} /></mesh>
          <mesh ref={(el) => (e.current[i] = el)}><sphereGeometry args={[0.05, 14, 14]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} /></mesh>
        </group>
      ))}
    </group>
  )
}

/* ── Периодтық жүйе блоктары ── */
export function PeriodicBlocks(props) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.children.forEach((c, i) => { c.position.z = Math.max(0, Math.sin(clock.elapsedTime * 1.4 + i * 0.6)) * 0.15 }) })
  const cells = []
  const cols = ['#e07a5f', '#f2cc8f', '#81b29a', '#3d5a80', '#98c1d9']
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) if (!(r === 0 && c > 0 && c < 7)) cells.push([c, r])
  return (
    <group {...props} ref={ref}>
      {cells.map(([c, r], i) => (
        <mesh key={i} position={[(c - 3.5) * 0.24, (1.5 - r) * 0.24, 0]}><boxGeometry args={[0.21, 0.21, 0.08]} /><meshStandardMaterial color={cols[(c + r) % 5]} roughness={0.5} /></mesh>
      ))}
    </group>
  )
}

/* ── Вольта бағанасы ── */
export function VoltaicPile(props) {
  return (
    <group {...props}>
      {Array.from({ length: 14 }).map((_, i) => <mesh key={i} position-y={-0.5 + i * 0.07}><cylinderGeometry args={[0.22, 0.22, 0.05, 32]} /><meshStandardMaterial color={['#b87333', '#9aa4ad', '#c9b48a'][i % 3]} metalness={0.8} roughness={0.35} /></mesh>)}
      {[0, 1, 2].map((i) => { const a = (i / 3) * TAU; return <mesh key={i} position={[Math.cos(a) * 0.28, -0.05, Math.sin(a) * 0.28]}><cylinderGeometry args={[0.015, 0.015, 1.1, 8]} /><meshStandardMaterial color="#e6f6ff" transparent opacity={0.6} /></mesh> })}
      <mesh position-y={-0.6}><cylinderGeometry args={[0.38, 0.38, 0.06, 32]} /><meshStandardMaterial {...MAT.wood} /></mesh>
    </group>
  )
}

/* ── Кубит (Блох сферасы) ── */
export function BlochSphere(props) {
  const v = useRef()
  useFrame(({ clock }) => { if (v.current) { v.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 1.2; v.current.rotation.y = clock.elapsedTime * 0.9 } })
  return (
    <group {...props}>
      <mesh><sphereGeometry args={[0.7, 32, 24]} /><meshStandardMaterial color="#4de3ff" transparent opacity={0.08} /></mesh>
      <mesh><sphereGeometry args={[0.7, 16, 12]} /><meshBasicMaterial color="#4de3ff" wireframe transparent opacity={0.25} /></mesh>
      {[[0, 0, 0], [0, 0, Math.PI / 2], [Math.PI / 2, 0, 0]].map((r, i) => <mesh key={i} rotation={r}><cylinderGeometry args={[0.006, 0.006, 1.6, 4]} /><meshBasicMaterial color="#9fb6d1" /></mesh>)}
      <group ref={v}>
        <mesh position-y={0.33}><cylinderGeometry args={[0.02, 0.02, 0.66, 8]} /><meshStandardMaterial color="#ff5d73" emissive="#ff5d73" emissiveIntensity={1} /></mesh>
        <mesh position-y={0.7}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color="#ff5d73" emissive="#ff5d73" emissiveIntensity={2} /></mesh>
      </group>
    </group>
  )
}

/* ── Тақта ── */
export function Chalkboard(props) {
  return (
    <group {...props}>
      <mesh><boxGeometry args={[3.2, 1.65, 0.06]} /><meshStandardMaterial {...MAT.wood} /></mesh>
      <mesh position-z={0.035}><planeGeometry args={[3.0, 1.5]} /><meshStandardMaterial map={boardTex()} roughness={0.95} /></mesh>
    </group>
  )
}

/* ── Ғылыми мақала ── */
export function Article(props) {
  return (
    <group {...props}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.03, i * 0.006, -i * 0.02]} rotation={[-Math.PI / 2, 0, i * 0.08]}>
          <planeGeometry args={[0.62, 0.85]} /><meshStandardMaterial map={i === 2 ? articleTex() : null} color={i === 2 ? '#ffffff' : '#ecebe4'} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}
