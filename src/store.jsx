import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SECTIONS, STATIONS } from './data/content.js'
import { sfx } from './sound.js'

const Ctx = createContext(null)
const KEY = 'gylym-tarihy-progress-v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const j = JSON.parse(raw)
      return { done: new Set(j.done || []), visited: new Set(j.visited || []), finished: !!j.finished }
    }
  } catch { /* жеке режимде localStorage болмауы мүмкін */ }
  return { done: new Set(), visited: new Set(), finished: false }
}

export const TOTAL = Object.values(STATIONS).reduce((n, l) => n + l.length, 0)

export function AppProvider({ children }) {
  const initial = useMemo(load, [])
  const [done, setDone] = useState(initial.done)
  const [visited, setVisited] = useState(initial.visited)
  const [finished, setFinished] = useState(initial.finished)
  const [section, setSection] = useState('intro')
  const [mapOpen, setMapOpen] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [pending, setPending] = useState(null) // залға кірген соң қай станцияға айналдыру

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ done: [...done], visited: [...visited], finished })) } catch { /* елемеу */ }
  }, [done, visited, finished])

  const markDone = useCallback((sec, id) => {
    const key = `${sec}:${id}`
    setDone((prev) => {
      if (prev.has(key)) return prev
      sfx('done')
      const n = new Set(prev); n.add(key); return n
    })
  }, [])

  const go = useCallback((id, stationId) => {
    sfx('whoosh')
    setMapOpen(false)
    setPending(stationId || null)
    setSection(id)
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])

  const reset = useCallback(() => {
    setDone(new Set()); setVisited(new Set()); setFinished(false); setSection('intro')
  }, [])

  const isDone = useCallback((sec, id) => done.has(`${sec}:${id}`), [done])
  const sectionStats = useCallback((sec) => {
    const list = STATIONS[sec] || []
    const n = list.filter((s) => done.has(`${sec}:${s.id}`)).length
    return { n, total: list.length, complete: n === list.length }
  }, [done])

  const percent = finished ? 100 : Math.round((done.size / TOTAL) * 100)

  const value = {
    section, go, mapOpen, setMapOpen, lightbox, setLightbox,
    done, visited, markDone, isDone, sectionStats, percent, finished, setFinished, reset, pending, setPending,
    sections: SECTIONS,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
