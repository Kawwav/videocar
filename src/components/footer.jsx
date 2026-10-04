import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SiInstagram, SiTiktok, SiYoutube, SiBehance } from 'react-icons/si'
import fotografoImg from '/footer/fotografo.png'
import '../paginas/granulado.css'
import './footer.css'

gsap.registerPlugin(ScrollTrigger)

const redes = [
  { nome: 'Instagram', url: 'https://www.instagram.com/_k.aww.a_/?theme=dark', Icone: SiInstagram },
  { nome: 'TikTok', url: 'https://www.tiktok.com/@k_awwa_', Icone: SiTiktok },
  { nome: 'YouTube', url: 'https://www.youtube.com/', Icone: SiYoutube },
  { nome: 'Behance', url: 'https://www.behance.net/viniciuskawwa', Icone: SiBehance },
]

function Footer() {
  const revelarRef = useRef(null)
  const secaoRef = useRef(null)
  const fotoRef = useRef(null)
  const esqRef = useRef(null)
  const dirRef = useRef(null)
  const assinaturaRef = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          normal: '(prefers-reduced-motion: no-preference)',
          larga: '(min-width: 901px)',
        },
        (ctx) => {
        if (!ctx.conditions.normal) return

        gsap.fromTo(
          assinaturaRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: revelarRef.current,
              start: 'top 40%',
              end: 'top -10%',
              scrub: 1,
            },
          },
        )

        gsap.fromTo(
          fotoRef.current,
          { yPercent: -14 },
          {
            yPercent: 14,
            ease: 'none',
            scrollTrigger: {
              trigger: revelarRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        )

        gsap.fromTo(
          '.footer-icone',
          { y: 80, rotation: 28, opacity: 0 },
          {
            y: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'back.out(1.8)',
            stagger: 0.12,
            scrollTrigger: {
              trigger: revelarRef.current,
              start: 'top 35%',
              toggleActions: 'play none none reverse',
            },
          },
        )

        const entrada = {
          trigger: revelarRef.current,
          start: 'top 100%',
          end: 'top 3%',
          scrub: 1.5,
          invalidateOnRefresh: true,
        }
        const EASE_ANOS = 'power1.inOut'
        const vao = (el, lado) => parseFloat(getComputedStyle(el)[lado]) || 0

        if (ctx.conditions.larga) {
          gsap.fromTo(
            esqRef.current,
            { x: () => esqRef.current.offsetWidth + vao(esqRef.current, 'marginRight') + 4 },
            { x: 0, ease: EASE_ANOS, scrollTrigger: entrada },
          )
          gsap.fromTo(
            dirRef.current,
            { x: () => -(dirRef.current.offsetWidth + vao(dirRef.current, 'marginLeft') + 4) },
            { x: 0, ease: EASE_ANOS, scrollTrigger: entrada },
          )
        } else {
          gsap.fromTo(
            esqRef.current,
            { y: () => esqRef.current.offsetHeight + vao(esqRef.current, 'marginBottom') + 4 },
            { y: 0, ease: EASE_ANOS, scrollTrigger: entrada },
          )
          gsap.fromTo(
            dirRef.current,
            { y: () => -(dirRef.current.offsetHeight + vao(dirRef.current, 'marginTop') + 4) },
            { y: 0, ease: EASE_ANOS, scrollTrigger: entrada },
          )
        }
        },
      )

      return () => mm.revert()
    },
    { scope: revelarRef },
  )

  return (
    <div className="footer-revelar" ref={revelarRef}>
      <footer className="footer fundo-granulado" ref={secaoRef}>
        <div className="footer-palco">
          <span className="footer-ano footer-ano--esq" ref={esqRef} aria-hidden="true">
            <span>2004 <span className="footer-traco">–</span></span>
          </span>
          <span className="footer-ano footer-ano--dir" ref={dirRef} aria-hidden="true">
            <span><span className="footer-traco">–</span> 2026</span>
          </span>

          <div className="footer-quadrado">
            <img
              ref={fotoRef}
              className="footer-foto"
              src={fotografoImg}
              alt="Fotógrafo 2004 – 2026"
              loading="lazy"
              draggable="false"
            />
          </div>

          <p className="footer-assinatura" ref={assinaturaRef}>Kawwa</p>
        </div>

        <nav className="footer-icones" aria-label="Redes sociais">
          {redes.map((rede) => (
            <a
              key={rede.nome}
              className="footer-icone"
              href={rede.url}
              target="_blank"
              rel="noreferrer"
              aria-label={rede.nome}
            >
              <rede.Icone aria-hidden="true" />
            </a>
          ))}
        </nav>
      </footer>
    </div>
  )
}

export default Footer