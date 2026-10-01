import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Spiral3DSlider } from '../components/ui/spiral-3d-slider'
import redbullVideo from '/sobre/redbull.mp4'
import './sobre.css'

gsap.registerPlugin(ScrollTrigger)


const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    alt: 'Carro esportivo velocidade',
  },
  {
    src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    alt: 'Supercarro em pista',
  },
  {
    src: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    alt: 'Linhas aerodinâmicas',
  },
  {
    src: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    alt: 'Drift no asfalto',
  },
]


function Sobre() {
  const containerRef = useRef(null)
  const pinRef = useRef(null)
  const conteudoRef = useRef(null)
  const fadeOverlayRef = useRef(null)
  const sliderRef = useRef(null)

  useGSAP(
    () => {
      ScrollTrigger.refresh()

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%',
          pin: pinRef.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // 1. Momento estável com o vídeo e título nítidos
      tl.to({}, { duration: 0.35 })

      // 2. Fundo recuando em blur até o preto
      tl.to(
        conteudoRef.current,
        {
          scale: 0.52,
          y: -30,
          filter: 'blur(26px)',
          opacity: 0,
          duration: 1.6,
          ease: 'power2.inOut',
        },
        'sinking',
      )

      tl.to(
        fadeOverlayRef.current,
        { opacity: 1, duration: 1.5, ease: 'power1.inOut' },
        'sinking',
      )

      // 3. A espiral 3D assume o palco
      tl.fromTo(
        sliderRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
        'sinking+=0.7',
      )
    },
    { scope: containerRef },
  )

  return (
    <div className="sobre-scroll-track" ref={containerRef}>
      <div className="sobre-pin-wrap" ref={pinRef}>
        <div className="sobre-conteudo-principal" ref={conteudoRef}>
          <video
            className="sobre-video"
            src={redbullVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />

          <h2 className="sobre-titulo">
            <span>A GENTE</span>
            <span>CONGELA</span>
            <span>CARROS EM</span>
            <span>VELOCIDADE</span>
          </h2>
        </div>

        <div className="sobre-fade-overlay" ref={fadeOverlayRef} />

        <div className="sobre-slider-wrap" ref={sliderRef}>
          <Spiral3DSlider
            items={SLIDES}
            ariaLabel="Galeria espiral de fotos"
            className="bg-transparent dark:bg-transparent"
          />
        </div>
      </div>
    </div>
  )
}

export default Sobre
