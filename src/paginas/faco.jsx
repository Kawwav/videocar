import { useEffect, useRef, useState } from 'react'
import lamboVideo from '/faco/lambo.mp4'
import corridaVideo from '/faco/corrida.mp4'
import vlogVideo from '/faco/vlog.mp4'
import mclarenImg from '/faco/mclaren.jpg'
import './granulado.css'
import './faco.css'

const ITENS = [
  { tipo: 'video', src: lamboVideo, alt: 'Lamborghini', legenda: 'VÍDEOS EM RUAS' },
  { tipo: 'imagem', src: mclarenImg, alt: 'McLaren', legenda: 'FOTOS PROFISSIONAIS' },
  { tipo: 'video', src: corridaVideo, alt: 'Corrida', legenda: 'FOTOS E VÍDEOS EM EVENTOS' },
  { tipo: 'video', src: vlogVideo, alt: 'Vlog', legenda: 'VLOGS' },
]

const SIMBOLOS = '!<>-_/[]{}—=+*^?#%&@$'
const MS_POR_LETRA = 45
const MS_TROCA = 40

function useEmbaralhar(final) {
  const [texto, setTexto] = useState(final)
  const timer = useRef(0)

  const parar = () => {
    clearInterval(timer.current)
    timer.current = 0
  }

  useEffect(() => parar, [])

  const iniciar = () => {
    parar()
    const inicio = performance.now()
    const revela = Array.from(
      final,
      (_, i) => 120 + i * MS_POR_LETRA + Math.random() * 120,
    )

    const passo = () => {
      const t = performance.now() - inicio
      let pronto = true
      const saida = Array.from(final, (letra, i) => {
        if (letra === ' ') return ' '
        if (t >= revela[i]) return letra
        pronto = false
        return SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)]
      }).join('')
      setTexto(saida)
      if (pronto) parar()
    }

    passo()
    timer.current = setInterval(passo, MS_TROCA)
  }

  return [texto, iniciar]
}

function Midia({ numero, tipo, src, alt, legenda }) {
  const videoRef = useRef(null)
  const [tocando, setTocando] = useState(false)
  const [ativa, setAtiva] = useState(false)
  const [textoLegenda, embaralhar] = useEmbaralhar(legenda)
  const figuraRef = useRef(null)
  const automatico = useRef(false)

  useEffect(() => {
    const consulta = window.matchMedia('(hover: none), (max-width: 640px)')
    const sincronizar = () => {
      automatico.current = consulta.matches
    }
    sincronizar()
    consulta.addEventListener('change', sincronizar)

    const figura = figuraRef.current
    const aoChegar = () => {
      if (!automatico.current) return
      setAtiva(true)
      embaralhar()
    }
    const aoSair = () => {
      if (!automatico.current) return
      setAtiva(false)
    }
    figura?.addEventListener('faco:chegou', aoChegar)
    figura?.addEventListener('faco:saiu', aoSair)

    return () => {
      consulta.removeEventListener('change', sincronizar)
      figura?.removeEventListener('faco:chegou', aoChegar)
      figura?.removeEventListener('faco:saiu', aoSair)
    }

  }, [])

  const alternar = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }

  const aoTocar = () => {
    setTocando(true)
    document.querySelectorAll('.faco-item video').forEach((v) => {
      if (v !== videoRef.current) v.pause()
    })
  }

  return (
    <figure
      ref={figuraRef}
      className={`faco-item faco-item--${numero}`}
    >
      <div className="faco-camada">
        <div className="faco-numero">
          {String(numero).padStart(2, '0')}_
        </div>

        <div
          className="faco-quadrado"
          onMouseEnter={() => {
            if (automatico.current) return
            setAtiva(true)
            embaralhar()
          }}
          onMouseLeave={() => {
            if (automatico.current) return
            setAtiva(false)
          }}
        >
          {tipo === 'video' ? (
            <>
              <video
                ref={videoRef}
                className="faco-midia"
                src={`${src}#t=0.1`}
                preload="metadata"
                playsInline
                onPlay={aoTocar}
                onPause={() => setTocando(false)}
                onEnded={() => setTocando(false)}
              />
              <button
                type="button"
                className={`faco-play ${tocando ? 'tocando' : ''}`}
                onClick={alternar}
                aria-label={tocando ? `Pausar ${alt}` : `Reproduzir ${alt}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M10 8.2v7.6l6-3.8z" fill="currentColor" />
                </svg>
              </button>
            </>
          ) : (
            <img className="faco-midia" src={src} alt={alt} />
          )}
        </div>

        <p
          className={`faco-legenda ${ativa ? 'ativa' : ''}`}
          aria-label={legenda}
        >
          <span aria-hidden="true">{textoLegenda}</span>
        </p>
      </div>
    </figure>
  )
}

function Faco() {
  return (
    <section className="faco-secao fundo-granulado">
      <div className="faco-conteudo">
        <h2 className="faco-titulo">O QUE FAZEMOS</h2>
      </div>

      {ITENS.map((item, i) => (
        <Midia key={item.src} numero={i + 1} {...item} />
      ))}
    </section>
  )
}

export default Faco