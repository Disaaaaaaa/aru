import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp, TOTAL } from '../store.jsx'
import { SECTIONS, STATIONS } from '../data/content.js'
import IMAGES from '../data/images.json'
import { setSound, sfx } from '../sound.js'

/* ───────── иконкалар ───────── */
const I = {
  map: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg>,
  progress: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 9 9h-9Z" fill="currentColor" stroke="none" /></svg>,
  soundOn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 9h4l5-4v14l-5-4H4Z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></svg>,
  soundOff: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 9h4l5-4v14l-5-4H4Z" /><path d="m17 9 5 6M22 9l-5 6" /></svg>,
  full: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>,
  exit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>,
}

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="17" fill="none" stroke="var(--accent)" strokeWidth="3" />
      <ellipse cx="32" cy="32" rx="27" ry="9" fill="none" stroke="var(--accent-2)" strokeWidth="2.5" transform="rotate(-25 32 32)" />
      <circle cx="32" cy="32" r="5" fill="var(--accent)" />
    </svg>
  )
}

/* ───────── жоғарғы панель: Карта | Прогресс | Дыбыс | Толық экран ───────── */
export function TopBar() {
  const { setMapOpen, percent, go } = useApp()
  const [sound, setS] = useState(false)
  const [fs, setFs] = useState(false)
  const [showProg, setShowProg] = useState(false)

  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const toggleFs = () => {
    sfx('click')
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.()
  }
  const toggleSound = () => { const n = !sound; setS(n); setSound(n); if (n) setTimeout(() => sfx('done'), 60) }

  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={() => go('intro')} aria-label="Басты бет">
          <BrandMark />
          <span>ҒЫЛЫМ ТАРИХЫ<small>3D ВИРТУАЛДЫ МУЗЕЙ</small></span>
        </button>
        <nav className="tools" aria-label="Құралдар">
          <button className="tool" onClick={() => { sfx('click'); setMapOpen(true) }}>{I.map}<span className="tlabel">Карта</span></button>
          <button className="tool" aria-pressed={showProg} onClick={() => { sfx('click'); setShowProg((v) => !v) }}>{I.progress}<span className="tlabel">Прогресс</span><span className="pct">{percent}%</span></button>
          <button className="tool" aria-pressed={sound} onClick={toggleSound}>{sound ? I.soundOn : I.soundOff}<span className="tlabel">Дыбыс</span></button>
          <button className="tool" aria-pressed={fs} onClick={toggleFs}>{fs ? I.exit : I.full}<span className="tlabel">Толық экран</span></button>
        </nav>
      </header>
      <AnimatePresence>{showProg && <ProgressPanel onClose={() => setShowProg(false)} />}</AnimatePresence>
    </>
  )
}

export function Ring({ value, size = 76, stroke = 6, label = true }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.2, ease: 'easeOut' }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      {label && <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="var(--ink)" fontFamily="var(--mono)" fontSize={size * 0.22} fontWeight="600">{value}%</text>}
    </svg>
  )
}

function ProgressPanel({ onClose }) {
  const { percent, sectionStats, go, done } = useApp()
  return (
    <motion.div className="card progress-pop" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="ring-wrap">
        <Ring value={percent} />
        <div>
          <div className="eyebrow">Тур прогресі</div>
          <div className="muted" style={{ fontSize: 14 }}>{done.size} / {TOTAL} интерактив зерттелді</div>
        </div>
      </div>
      <ul className="prog-list">
        {SECTIONS.map((s) => {
          const st = sectionStats(s.id)
          return (
            <li key={s.id}>
              <button style={{ background: 'none', border: 0, padding: 0, width: '100%', textAlign: 'left' }} onClick={() => { go(s.id); onClose() }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{s.title}</span><span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-faint)' }}>{st.n}/{st.total}</span></div>
                <div className="bar"><i style={{ width: `${(st.n / st.total) * 100}%` }} /></div>
              </button>
            </li>
          )
        })}
      </ul>
    </motion.div>
  )
}

/* ───────── сол жақтағы прогресс навигациясы ───────── */
export function ProgressNav() {
  const { section, go, visited, sectionStats } = useApp()
  return (
    <nav className="pnav" aria-label="Тур бөлімдері">
      {SECTIONS.map((s) => {
        const st = sectionStats(s.id)
        const cls = ['pnav-item', section === s.id && 'current', (visited.has(s.id) || st.n > 0) && 'visited', st.complete && 'done'].filter(Boolean).join(' ')
        return (
          <button key={s.id} className={cls} onClick={() => go(s.id)} aria-current={section === s.id ? 'step' : undefined}>
            <span className="pnav-dot" />
            <span className="pnav-label">{s.short}</span>
            <span className="pnav-count">{st.n}/{st.total}</span>
          </button>
        )
      })}
    </nav>
  )
}

/* ───────── интерактивті музей картасы ───────── */
export function MuseumMap() {
  const { mapOpen, setMapOpen, go, section, sectionStats } = useApp()
  const node = (id, x, y, w, h, title, sub) => {
    const st = sectionStats(id)
    const cur = section === id
    return (
      <g className="map-node" onClick={() => go(id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && go(id)} aria-label={`${title} ${sub || ''}`}>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="12" fill={cur ? 'color-mix(in srgb, var(--accent) 22%, var(--panel-solid))' : 'var(--panel-solid)'} stroke={st.complete ? 'var(--good)' : 'var(--line)'} strokeWidth="1.5" />
        <text x={x} y={sub ? y - (Array.isArray(sub) ? 14 : 7) : y + 1} textAnchor="middle" dominantBaseline="central" fill="var(--ink)" fontFamily="var(--serif)" fontSize={sub ? 20 : 19} fontWeight="700">{title}</text>
        {sub && [].concat(sub).map((line, i, all) => (
          <text key={i} x={x} y={y + (all.length > 1 ? 8 + i * 14 : 15)} textAnchor="middle" dominantBaseline="central" fill="var(--ink-dim)" fontFamily="var(--sans)" fontSize="11.5">{line}</text>
        ))}
        <text x={x + w / 2 - 12} y={y - h / 2 + 13} textAnchor="end" fill={st.complete ? 'var(--good)' : 'var(--ink-faint)'} fontFamily="var(--mono)" fontSize="10">{st.n}/{st.total}</text>
        {cur && <circle cx={x - w / 2 + 12} cy={y - h / 2 + 12} r="4" fill="var(--accent)"><animate attributeName="r" values="3;6;3" dur="1.6s" repeatCount="indefinite" /></circle>}
      </g>
    )
  }
  const line = (d) => <path d={d} fill="none" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="5 5"><animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.2s" repeatCount="indefinite" /></path>
  return (
    <AnimatePresence>
      {mapOpen && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMapOpen(false)}>
          <motion.div className="modal map-modal" initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }} onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setMapOpen(false)} aria-label="Жабу">✕</button>
            <div className="eyebrow">Виртуалды музей картасы</div>
            <h2 style={{ fontSize: 36, margin: '6px 0 4px' }}>Қай залға барамыз?</h2>
            <p className="muted" style={{ marginBottom: 14 }}>Кез келген залды басып, бірден сол бөлімге өтіңіз.</p>
            <svg className="map-svg" viewBox="0 0 760 470">
              {line('M380 62 V118')}{line('M380 162 V205 H130 V240')}{line('M380 205 V240')}{line('M380 205 H630 V240')}
              {line('M130 320 V360 H380')}{line('M630 320 V360 H380')}{line('M380 320 V392')}
              {node('intro', 380, 40, 240, 44, 'ҒЫЛЫМ ТАРИХЫ')}
              {node('corridor', 380, 140, 260, 44, 'УАҚЫТ ДӘЛІЗІ')}
              {node('hall61', 130, 280, 220, 78, '6.1', 'Ғылым тарихының маңызы')}
              {node('hall62', 380, 280, 220, 78, '6.2', ['Ғылым тарихының ғалымдар', 'үшін өзектілігі'])}
              {node('hall63', 630, 280, 220, 78, '6.3', 'Қазіргі мәселелер')}
              {node('final', 380, 425, 280, 56, 'БОЛАШАҚ ҒЫЛЫМ', 'Қорытынды зал')}
            </svg>
            <div className="map-actions">
              <button className="btn" onClick={() => go('corridor')}>Маршрут бойынша бастау: Уақыт дәлізі →</button>
              <span className="muted" style={{ fontSize: 13 }}>Кіреберіс → Уақыт дәлізі → 6.1 → 6.2 → 6.3 → Болашақ ғылым</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ───────── суреттер ───────── */
export function imgSrc(k, big) {
  const v = IMAGES[k]
  return v ? (big ? v.big : v.src) : null
}

export function Pic({ k, title, type, text, style, className = '', caption = true, onOpen }) {
  const { setLightbox } = useApp()
  const [err, setErr] = useState(false)
  const src = imgSrc(k)
  return (
    <button className={`pic ${className}`} style={style} onClick={() => { sfx('click'); setLightbox({ k, title, type, text }); onOpen?.() }} aria-label={`${title} — үлкейту`}>
      {src && !err ? <img src={src} alt={title} loading="lazy" referrerPolicy="no-referrer" onError={() => setErr(true)} /> : <div className="pic-fallback">{title?.[0] || '◆'}</div>}
      {caption && <div className="pic-cap">{type && <b>{type}</b>}{title}</div>}
    </button>
  )
}

export function Lightbox() {
  const { lightbox, setLightbox } = useApp()
  const [err, setErr] = useState(false)
  useEffect(() => setErr(false), [lightbox])
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && setLightbox(null)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [setLightbox])
  const page = lightbox && IMAGES[lightbox.k]?.page
  return (
    <AnimatePresence>
      {lightbox && (
        <motion.div className="overlay" style={{ zIndex: 120 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}>
          <motion.div className="modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setLightbox(null)} aria-label="Жабу">✕</button>
            <div className="lightbox">
              {imgSrc(lightbox.k, true) && !err
                ? <img src={imgSrc(lightbox.k, true)} alt={lightbox.title} referrerPolicy="no-referrer" onError={() => setErr(true)} />
                : <div className="pic-fallback" style={{ aspectRatio: '4/3', borderRadius: 12 }}>{lightbox.title?.[0]}</div>}
              <div>
                {lightbox.type && <div className="eyebrow">{lightbox.type}</div>}
                <h3>{lightbox.title}</h3>
                <p className="muted" style={{ fontSize: 17 }}>{lightbox.text}</p>
                {page && <p className="credit">Сурет: Wikimedia Commons · <a href={page} target="_blank" rel="noreferrer">дереккөз және лицензия</a></p>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ───────── станция тақырыбы ───────── */
export function StationHead({ sec, id, num, eyebrow, title, children }) {
  const { isDone } = useApp()
  return (
    <motion.div className="station-head" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7 }}>
      <div className="eyebrow station-num">
        {num && <b>{num}</b>}{eyebrow}
        {sec && id && isDone(sec, id) && <span className="done-chip">✓ ЗЕРТТЕЛДІ</span>}
      </div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </motion.div>
  )
}

export function Station({ id, children, style }) {
  return <section className="station" data-station={id} id={`st-${id}`} style={style}>{children}</section>
}

export function NextDoor({ to, title, sub }) {
  const { go } = useApp()
  return (
    <div className="next-door">
      <motion.button className="door" onClick={() => go(to)} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <span className="eyebrow">Келесі зал</span>
        <h3>{title}</h3>
        {sub && <p className="muted">{sub}</p>}
        <span className="btn sm">Кіру →</span>
      </motion.button>
    </div>
  )
}

/* ───────── көрінгенде ғана Canvas-ты орнату ───────── */
export function Lazy({ children, height, className = '', style, margin = '300px' }) {
  const ref = useRef()
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return <div ref={ref} className={className} style={{ height, ...style }}>{on ? children : null}</div>
}

export function useStationsList(sec) {
  return STATIONS[sec]
}

/* ───────── порталдағы модаль (кез келген залдан) ───────── */
import { createPortal } from 'react-dom'
export function Modal({ open, onClose, children, width }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="modal" style={width ? { width: `min(${width}px, 100%)` } : undefined} initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }} onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={onClose} aria-label="Жабу">✕</button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
