import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Heroe from './paginas/heroe.jsx'
import Sobre from './paginas/sobre.jsx'
import Marcas from './paginas/marcas.jsx'
import Footer from './components/footer.jsx'
import './scroll.css'

gsap.registerPlugin(ScrollTrigger)

const SUAVIDADE_SCROLL = 0.07

function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: SUAVIDADE_SCROLL,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: true,
      autoRaf: false,
    })
    window.__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const passo = (tempo) => lenis.raf(tempo * 1000)
    gsap.ticker.add(passo)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(passo)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])

  return (
    <>
      <Heroe />
      <Sobre />
      <Marcas />
      <Footer />
    </>
  )
}

export default App