import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import fotografoImg from '/footer/fotografo.png'
import '../paginas/granulado.css'
import './footer.css'

gsap.registerPlugin(ScrollTrigger)

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

        // assinatura: aparece suavemente depois dos anos
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

        // a foto (mais alta que o quadrado) desliza dentro da moldura
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

        // anos: saem de tras da foto conforme o footer chega
        const entrada = {
          trigger: revelarRef.current,
          start: 'top 75%',
          end: 'top 10%',
          scrub: 1,
          invalidateOnRefresh: true,
        }
        const vao = (el, lado) => parseFloat(getComputedStyle(el)[lado]) || 0

        // telas largas: um de cada lado da foto
        if (ctx.conditions.larga) {
          gsap.fromTo(
            esqRef.current,
            { x: () => esqRef.current.offsetWidth + vao(esqRef.current, 'marginRight') + 4 },
            { x: 0, ease: 'power2.out', scrollTrigger: entrada },
          )
          gsap.fromTo(
            dirRef.current,
            { x: () => -(dirRef.current.offsetWidth + vao(dirRef.current, 'marginLeft') + 4) },
            { x: 0, ease: 'power2.out', scrollTrigger: entrada },
          )
        } else {
          // telas estreitas: um em cima e outro embaixo da foto
          gsap.fromTo(
            esqRef.current,
            { y: () => esqRef.current.offsetHeight + vao(esqRef.current, 'marginBottom') + 4 },
            { y: 0, ease: 'power2.out', scrollTrigger: entrada },
          )
          gsap.fromTo(
            dirRef.current,
            { y: () => -(dirRef.current.offsetHeight + vao(dirRef.current, 'marginTop') + 4) },
            { y: 0, ease: 'power2.out', scrollTrigger: entrada },
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
            <span>2004 –</span>
          </span>
          <span className="footer-ano footer-ano--dir" ref={dirRef} aria-hidden="true">
            <span>– 2026</span>
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
      </footer>
    </div>
  )
}

export default Footer