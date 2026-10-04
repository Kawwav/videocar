import { useEffect, useRef, useState } from 'react'
import { SiInstagram, SiTiktok, SiYoutube, SiBehance } from 'react-icons/si'
import fotografoImg from '/heroe/fotografo.png'
import './heroe.css'

const fontes = [
  'Six Hands Black',
  'Better Faster',
  'Whortie',
  'Portobesto Caps',
  'Artificial Intelligence',
  'Brosign Brush',
  'WC Mano Negra', 
]

const VOLTAS = 2
const sequencia = Array.from({ length: VOLTAS }, () => fontes).flat()

const INTERVALO = 180

const FORCA = 450

const SUAVIDADE = 0.04

const redes = [
  { nome: 'Instagram', url: 'https://www.instagram.com/_k.aww.a_/?theme=dark', Icone: SiInstagram },
  { nome: 'TikTok', url: 'https://www.tiktok.com/@k_awwa_', Icone: SiTiktok },
  { nome: 'YouTube', url: 'https://www.youtube.com/', Icone: SiYoutube },
  { nome: 'Behance', url: 'https://www.behance.net/viniciuskawwa', Icone: SiBehance },
]

function Heroe() {
  const [pronto, setPronto] = useState(false)
  const [indice, setIndice] = useState(0)
  const [subiu, setSubiu] = useState(false)
  const heroRef = useRef(null)
  const fotoRef = useRef(null)
  useEffect(() => {
    Promise.all(fontes.map((f) => document.fonts.load(`12rem '${f}'`)))
      .catch(() => {})
      .finally(() => setPronto(true))
  }, [])

  useEffect(() => {
    if (!pronto || indice >= sequencia.length - 1) return

    const timer = setTimeout(() => setIndice((i) => i + 1), INTERVALO)
    return () => clearTimeout(timer)
  }, [pronto, indice])

  const chegou = subiu && indice >= sequencia.length - 1

  useEffect(() => {
    let frame = 0
    let alvo = 0 
    let atual = 0 
    let ultimo = 0

    const calcularAlvo = () => {
      if (!heroRef.current) return
      const topo = heroRef.current.getBoundingClientRect().top
      const progresso = Math.min(Math.max(-topo / window.innerHeight, 0), 1)

      alvo = progresso * Math.min(FORCA, window.innerHeight * 0.45)
    }

    const animar = (agora) => {

      const dt = ultimo ? Math.min(agora - ultimo, 50) : 16.67
      ultimo = agora
      const fator = 1 - Math.pow(1 - SUAVIDADE, dt / 16.67)

      atual += (alvo - atual) * fator
      if (Math.abs(alvo - atual) < 0.05) atual = alvo

      if (fotoRef.current) {
        fotoRef.current.style.transform = `translateY(${atual}px)`
      }

      if (atual !== alvo) {
        frame = requestAnimationFrame(animar)
      } else {
        frame = 0
        ultimo = 0
      }
    }

    const aoRolar = () => {
      calcularAlvo()
      if (!frame) frame = requestAnimationFrame(animar)
    }

    calcularAlvo()
    atual = alvo
    if (fotoRef.current) {
      fotoRef.current.style.transform = `translateY(${atual}px)`
    }

    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)

    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section className="heroe" ref={heroRef}>
      <div className={`heroe-fundo ${chegou ? 'aberto' : ''}`} />
      <img
        ref={fotoRef}
        className={`heroe-fotografo ${chegou ? 'aberto' : ''}`}
        src={fotografoImg}
        alt="Fotógrafo"
      />
      {chegou && (
        <nav className="heroe-redes" aria-label="Redes sociais">
          {redes.map((rede, i) => (
            <a
              key={rede.nome}
              className="heroe-rede"
              style={{ animationDelay: `${i * 0.15}s` }}
              href={rede.url}
              target="_blank"
              rel="noreferrer"
              aria-label={rede.nome}
            >
              <rede.Icone aria-hidden="true" />
            </a>
          ))}
        </nav>
      )}
      {pronto && (
        <h1
          style={{ fontFamily: `'${sequencia[indice]}', sans-serif` }}
          onAnimationEnd={() => setSubiu(true)}
        >
          KAWWA
        </h1>
      )}
    </section>
  )
}

export default Heroe