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

function Midia({
  numero,
  tipo,
  src,
  alt,
  legenda,
  selecionado,
  escondido,
  vars,
  onSelecionar,
}) {
  const videoRef = useRef(null)
  const quadradoRef = useRef(null)
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

  useEffect(() => {
    if (selecionado) {
      const t = setTimeout(() => {
        setAtiva(true)
        embaralhar()
      }, 1400)
      return () => clearTimeout(t)
    }
    if (!automatico.current) setAtiva(false)
  }, [selecionado])

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

  const abrir = () => {
    const q = quadradoRef.current
    if (!q) return
    const r = q.getBoundingClientRect()
    const alvo = Math.min(window.innerHeight * 0.6, window.innerWidth * 0.82)
    const escala = alvo / r.width
    const dx = window.innerWidth / 2 - (r.left + r.width / 2)
    const dy = window.innerHeight / 2 - (r.top + r.height / 2) - 16

    onSelecionar(numero, {
      '--tx': `${dx}px`,
      '--ty': `${dy}px`,
      '--s': escala,
      '--ox': `${q.offsetLeft + q.offsetWidth / 2}px`,
      '--oy': `${q.offsetTop + q.offsetHeight / 2}px`,
    })
  }

  const aoClicar = () => {
    if (!selecionado) {
      abrir()
      if (tipo === 'video') videoRef.current?.play().catch(() => {})
      return
    }
    if (tipo === 'video') alternar()
  }

  return (
    <figure
      ref={figuraRef}
      className={
        `faco-item faco-item--${numero}` +
        (selecionado ? ' faco-item--foco' : '') +
        (escondido ? ' faco-item--fora' : '')
      }
      style={selecionado ? vars : undefined}
    >
      <div className="faco-camada">
        <div className="faco-numero">
          {String(numero).padStart(2, '0')}_
        </div>

        <div
          ref={quadradoRef}
          className="faco-quadrado"
          onClick={aoClicar}
          {...(tipo === 'imagem'
            ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': `Ampliar ${alt}`,
                onKeyDown: (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    aoClicar()
                  }
                },
              }
            : {})}
          onMouseEnter={() => {
            if (automatico.current || selecionado) return
            setAtiva(true)
            embaralhar()
          }}
          onMouseLeave={() => {
            if (automatico.current || selecionado) return
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
  const [foco, setFoco] = useState(null)

  const fechar = () => {
    document.querySelectorAll('.faco-item video').forEach((v) => v.pause())
    setFoco(null)
  }

  useEffect(() => {
    if (!foco) return
    const aoTecla = (e) => {
      if (e.key === 'Escape') fechar()
    }
    window.addEventListener('keydown', aoTecla)
    window.addEventListener('resize', fechar)
    window.addEventListener('wheel', fechar, { passive: true })
    window.addEventListener('touchmove', fechar, { passive: true })
    return () => {
      window.removeEventListener('keydown', aoTecla)
      window.removeEventListener('resize', fechar)
      window.removeEventListener('wheel', fechar)
      window.removeEventListener('touchmove', fechar)
    }
  }, [foco])

  return (
    <section
      className={`faco-secao fundo-granulado ${foco ? 'faco-secao--foco' : ''}`}
    >
      <div className="faco-conteudo">
        <h2 className="faco-titulo">O QUE FAZEMOS</h2>
      </div>

      <div className="faco-fundo" onClick={fechar} aria-hidden="true" />

      {ITENS.map((item, i) => {
        const numero = i + 1
        const selecionado = foco?.numero === numero
        return (
          <Midia
            key={item.src}
            numero={numero}
            {...item}
            selecionado={selecionado}
            escondido={!!foco && !selecionado}
            vars={selecionado ? foco.vars : undefined}
            onSelecionar={(n, vars) => setFoco({ numero: n, vars })}
          />
        )
      })}
    </section>
  )
}

export default Faco