import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Spiral3DSlider } from '../components/ui/spiral-3d-slider'
import Faco from './faco.jsx'
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
  const facoRef = useRef(null)

  useGSAP(
    () => {
      ScrollTrigger.refresh()

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=450%', // Aumentamos para dar tempo de ver a espiral antes da cortina entrar
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

      // 3. A espiral 3D entra e se fixa
      tl.fromTo(
        sliderRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
        'sinking+=0.7',
      )

      // Pequena pausa com a espiral totalmente visível
      tl.to({}, { duration: 0.6 })

      // 4. Efeito cortina: o faco.jsx entra da direita (100%) para a esquerda (0%)
      tl.fromTo(
        facoRef.current,
        { xPercent: 100 },
        { xPercent: 0, duration: 1.8, ease: 'power2.inOut' },
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

          <a className="sobre-ver-portfolio" href="#portfolio">
            <span>VER PORTFÓLIO</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Cortina do Faco que cobre a tela */}
        <div className="sobre-faco-cortina" ref={facoRef}>
          <Faco />
        </div>
      </div>
    </div>
  )
}

export default Sobre
