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
          end: '+=800%',
          pin: pinRef.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.to({}, { duration: 0.35 })

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

      tl.fromTo(
        sliderRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
        'sinking+=0.7',
      )

      tl.to({}, { duration: 0.6 })

      tl.addLabel('faco')

      tl.fromTo(
        facoRef.current,
        { xPercent: 100 },
        { xPercent: 0, duration: 1.8, ease: 'power2.inOut' },
        'faco',
      )

      const q = gsap.utils.selector(containerRef)
      const itens = q('.faco-item')

      if (itens.length) {
        const ESCALA = 0.16
        const MARGEM = 28

        const entradaMidia = (el, lado, atraso) => {
          const esq = lado === 'esq'
          const medir = () => {
            const caixa = el.offsetParent
            return {
              baixo: caixa.clientHeight - (el.offsetTop + el.offsetHeight),
              lado: esq
                ? el.offsetLeft
                : caixa.clientWidth - (el.offsetLeft + el.offsetWidth),
            }
          }

          // sobe de baixo, pequena, no canto
          tl.fromTo(
            el,
            {
              autoAlpha: 0,
              scale: ESCALA,
              transformOrigin: esq ? '0% 100%' : '100% 100%',
              x: () => (esq ? -1 : 1) * Math.max(medir().lado - MARGEM, 0),
              y: () => medir().baixo + el.offsetHeight * ESCALA + 40,
            },
            {
              autoAlpha: 1,
              y: () => medir().baixo - MARGEM,
              duration: 1.6,
              ease: 'power2.inOut',
            },
            `faco+=${1.1 + atraso}`,
          )

          // vai para a posição final
          tl.to(
            el,
            {
              scale: 1,
              x: 0,
              y: 0,
              duration: 0.6,
              ease: 'power3.inOut',
              onComplete: () => el.dispatchEvent(new CustomEvent('faco:chegou')),
              onReverseComplete: () => el.dispatchEvent(new CustomEvent('faco:saiu')),
            },
            `faco+=${1.1 + atraso + 1.7}`,
          )
        }

        itens.forEach((el, i) => {
          entradaMidia(el, i < 2 ? 'esq' : 'dir', 0.3 + i * 0.2)
        })
      }

      // segura um pouco com tudo na tela antes de soltar o pin
      tl.to({}, { duration: 0.8 })

      const camadas = q('.faco-camada')
      const midias = q('.faco-midia')
      const VELOCIDADES = [-0.15, 0.06, -0.25, 0.1]
      const inicioParalaxe = () => tl.scrollTrigger.end
      const fimParalaxe = () => tl.scrollTrigger.end + window.innerHeight

      camadas.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: () => VELOCIDADES[i % VELOCIDADES.length] * window.innerHeight,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: inicioParalaxe,
              end: fimParalaxe,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        )
      })

      midias.forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -8, scale: 1.18 },
          {
            yPercent: 8,
            scale: 1.18,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: () => tl.scrollTrigger.start,
              end: fimParalaxe,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        )
      })
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

        <div className="sobre-faco-cortina" ref={facoRef}>
          <Faco />
        </div>
      </div>
    </div>
  )
}

export default Sobre

//clicamos no video ou imagem todo vao para baixo e o que climmaos 
// surge de baixo para cma ocupando emtade da tela e na dierita tem um tiutlo e descrição do video