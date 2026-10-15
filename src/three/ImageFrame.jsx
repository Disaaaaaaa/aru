import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { imgSrc } from '../components/ui.jsx'
import { MAT } from './models.jsx'
import { useCursor } from './common.jsx'

const cache = new Map()
const loader = new THREE.TextureLoader()
loader.setCrossOrigin('anonymous')

export function useImageTexture(key) {
  const url = key ? imgSrc(key) : null
  const [tex, setTex] = useState(() => (url && cache.get(url)) || null)
  useEffect(() => {
    if (!url) return
    if (cache.has(url)) { setTex(cache.get(url)); return }
    let alive = true
    loader.load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
      cache.set(url, t)
      if (alive) setTex(t)
    }, undefined, () => {})
    return () => { alive = false }
  }, [url])
  return tex
}

// Алтын жалатылған рамадағы сурет; басқанда lightbox ашылады
export function ImageFrame({ k, height = 1.4, maxWidth = 2.2, onClick, frameColor, ...props }) {
  const tex = useImageTexture(k)
  const [hover, setHover] = useState(false)
  const g = useRef()
  const aspect = tex?.image ? tex.image.width / tex.image.height : 0.8
  const w = Math.min(maxWidth, height * aspect)
  const h = w / aspect
  useFrame((_, d) => {
    if (!g.current) return
    const s = hover ? 1.06 : 1
    g.current.scale.x += (s - g.current.scale.x) * (1 - Math.exp(-d * 10))
    g.current.scale.y = g.current.scale.x
  })
  return (
    <group {...props}>
      <group ref={g}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); useCursor(true) }}
        onPointerOut={() => { setHover(false); useCursor(false) }}
        onClick={(e) => { e.stopPropagation(); onClick?.() }}>
        <mesh position-z={-0.03}><boxGeometry args={[w + 0.2, h + 0.2, 0.06]} /><meshStandardMaterial {...(frameColor ? { color: frameColor, metalness: 0.6, roughness: 0.3 } : MAT.brass)} emissive={hover ? '#e0b25e' : '#000'} emissiveIntensity={hover ? 0.4 : 0} /></mesh>
        <mesh position-z={0.005}><planeGeometry args={[w + 0.06, h + 0.06]} /><meshStandardMaterial color="#1a1209" /></mesh>
        <mesh position-z={0.012}>
          <planeGeometry args={[w, h]} />
          {tex ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshStandardMaterial color="#3a2c1a" />}
        </mesh>
      </group>
    </group>
  )
}
