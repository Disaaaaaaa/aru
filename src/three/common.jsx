import { Environment, Lightformer } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

// Сыртқы HDR файлсыз жергілікті жарық ортасы (металдар үшін шағылыс)
export function StudioEnv({ warm = true, intensity = 1 }) {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={2.2 * intensity} color={warm ? '#ffe2b0' : '#cfe8ff'} position={[0, 4, 2]} scale={[8, 2, 1]} />
      <Lightformer form="rect" intensity={1.2 * intensity} color={warm ? '#ffb66b' : '#7aa2ff'} position={[-5, 1, -2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
      <Lightformer form="rect" intensity={1.0 * intensity} color="#ffffff" position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[4, 4, 1]} />
      <Lightformer form="ring" intensity={1.5 * intensity} color={warm ? '#e0b25e' : '#4de3ff'} position={[0, -3, 3]} scale={3} />
    </Environment>
  )
}

// Тышқан арқылы камераның жұмсақ параллаксы
export function Parallax({ strength = 0.6, base = [0, 0, 10], target = [0, 0, 0] }) {
  const { camera } = useThree()
  const tgt = useRef(new THREE.Vector3(...target))
  useFrame(({ pointer }, d) => {
    const k = 1 - Math.exp(-d * 3)
    camera.position.x += (base[0] + pointer.x * strength - camera.position.x) * k
    camera.position.y += (base[1] + pointer.y * strength * 0.6 - camera.position.y) * k
    camera.position.z += (base[2] - camera.position.z) * k
    camera.lookAt(tgt.current)
  })
  return null
}

export function useCursor(on) {
  if (typeof document !== 'undefined') document.body.style.cursor = on ? 'pointer' : ''
}
