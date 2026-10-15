import { lazy, Suspense, useEffect } from 'react'
import { AppProvider, useApp } from './store.jsx'
import { TopBar, ProgressNav, MuseumMap, Lightbox } from './components/ui.jsx'
import Intro from './scenes/Intro.jsx'

const Corridor = lazy(() => import('./scenes/Corridor.jsx'))
const Hall61 = lazy(() => import('./scenes/Hall61.jsx'))
const Hall62 = lazy(() => import('./scenes/Hall62.jsx'))
const Hall63 = lazy(() => import('./scenes/Hall63.jsx'))
const Final = lazy(() => import('./scenes/Final.jsx'))

const THEMES = { intro: 'museum', corridor: 'museum', hall61: 'museum', hall62: 'lab', hall63: 'future', final: 'light' }
const VIEWS = { intro: Intro, corridor: Corridor, hall61: Hall61, hall62: Hall62, hall63: Hall63, final: Final }

function Loader() {
  return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="eyebrow">Зал ашылуда…</div>
    </div>
  )
}

function Shell() {
  const { section, pending, setPending } = useApp()
  const View = VIEWS[section]

  useEffect(() => { document.body.dataset.theme = THEMES[section] }, [section])

  // Залға кірген соң: басына немесе картада таңдалған станцияға апару
  useEffect(() => {
    window.scrollTo(0, 0)
    if (!pending) return
    const t = setTimeout(() => {
      document.getElementById(`st-${pending}`)?.scrollIntoView({ behavior: 'smooth' })
      setPending(null)
    }, 700)
    return () => clearTimeout(t)
  }, [section, pending, setPending])

  return (
    <>
      <TopBar />
      {section !== 'intro' && <ProgressNav />}
      <main key={section} className="hall-enter">
        <Suspense fallback={<Loader />}>
          <View />
        </Suspense>
      </main>
      <MuseumMap />
      <Lightbox />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
