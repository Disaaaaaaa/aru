// 3D нүктелерге байланған DOM жазбалар.
// Canvas ішінде <Anchor> (бос group) және <Projector>, сыртында <LabelLayer> + <Label>.
// drei <Html>-ден айырмашылығы: бөлек React root жасамайды, оқиғалар қалыпты жұмыс істейді.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function useLabelStore() {
  const [store] = useState(() => ({ objs: new Map(), els: new Map(), back: new Map() }))
  return store
}

export function Anchor({ store, id, backface, ...props }) {
  const ref = useRef()
  useEffect(() => {
    store.objs.set(id, ref.current)
    if (backface) store.back.set(id, backface)
    return () => { if (store.objs.get(id) === ref.current) store.objs.delete(id); store.back.delete(id) }
  }, [store, id, backface])
  return <group ref={ref} {...props} />
}

const v = new THREE.Vector3()
const c = new THREE.Vector3()
const n = new THREE.Vector3()
export function Projector({ store }) {
  const { camera, size } = useThree()
  useFrame(() => {
    store.els.forEach((el, id) => {
      const o = store.objs.get(id)
      if (!o || !el) { if (el) el.style.visibility = 'hidden'; return }
      o.getWorldPosition(v)
      let hidden = false
      const center = store.back.get(id)
      if (center) {
        // шардың арт жағындағы жазбаларды жасыру
        c.set(...center)
        n.copy(v).sub(c)
        hidden = n.dot(camera.position.clone().sub(c)) < 0
      }
      v.project(camera)
      if (v.z > 1) hidden = true
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.style.visibility = hidden ? 'hidden' : 'visible'
    })
  })
  return null
}

export function LabelLayer({ children }) {
  return <div className="label-layer">{children}</div>
}

export function Label({ store, id, children, className = '', anchor = 'center' }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const el = ref.current
    store.els.set(id, el)
    return () => { if (store.els.get(id) === el) store.els.delete(id) }
  }, [store, id])
  return (
    <div ref={ref} className="label3d" style={{ visibility: 'hidden' }}>
      <div className={`label3d-in ${anchor} ${className}`}>{children}</div>
    </div>
  )
}
