import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import lamboVideo from '/faco/lambo.mp4'
import lambo2Video from '/faco/lambo2.mp4'
import lambo3Video from '/faco/lambo3.mp4'
import corridaVideo from '/faco/corrida.mp4'
import vlogVideo from '/faco/vlog.mp4'
import mclarenImg from '/faco/mclaren.jpg'
import mclaren2Img from '/faco/mclaren2.jpg'
import mclaren3Img from '/faco/mclaren3.jpg'
import './granulado.css'
import './faco.css'

const ITENS = [
  {
    tipo: 'video',
    src: lamboVideo,
    alt: 'Lamborghini',
    legenda: 'VÍDEOS EM RUAS',
    extras: [
      { tipo: 'video', src: lambo2Video },
      { tipo: 'video', src: lambo3Video },
    ],
  },
  {
    tipo: 'imagem',
    src: mclarenImg,
    alt: 'McLaren',
    legenda: 'FOTOS PROFISSIONAIS',
    extras: [
      { tipo: 'imagem', src: mclaren2Img },
      { tipo: 'imagem', src: mclaren3Img },
    ],
  },
  {
    tipo: 'video',
    src: corridaVideo,
    alt: 'Corrida',
    legenda: 'FOTOS E VÍDEOS EM EVENTOS',
    extras: [
      { tipo: 'video', src: vlogVideo },
      { tipo: 'video', src: lamboVideo },
    ],
  },
  {
    tipo: 'video',
    src: vlogVideo,
    alt: 'Vlog',
    legenda: 'VLOGS',
    extras: [
      { tipo: 'video', src: lamboVideo },
      { tipo: 'video', src: corridaVideo },
    ],
  },
]

function formatar(s) {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const seg = Math.floor(s % 60)
  return `${m}:${String(seg).padStart(2, '0')}`
}

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

function pausarOutros(atual) {
  document.querySelectorAll('.faco-item video').forEach((v) => {
    if (v !== atual) v.pause()
  })
}

function Controles({ videoRef, alt }) {
  const [tocando, setTocando] = useState(false)
  const [atual, setAtual] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [mudo, setMudo] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const sincronizar = () => {
      setTocando(!v.paused && !v.ended)
      setAtual(v.currentTime)
      setDuracao(Number.isFinite(v.duration) ? v.duration : 0)
      setMudo(v.muted)
    }
    const eventos = [
      'play',
      'pause',
      'ended',
      'timeupdate',
      'durationchange',
      'loadedmetadata',
      'volumechange',
    ]
    sincronizar()
    eventos.forEach((e) => v.addEventListener(e, sincronizar))
    return () => eventos.forEach((e) => v.removeEventListener(e, sincronizar))
  }, [videoRef])

  const alternar = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  const buscar = (e) => {
    const v = videoRef.current
    if (v) v.currentTime = Number(e.target.value)
  }

  const alternarMudo = () => {
    const v = videoRef.current
    if (v) v.muted = !v.muted
  }

  return (
    <div
      className="faco-controles"
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label={`Controles de ${alt}`}
    >
      <button
        type="button"
        className="faco-ctl"
        onClick={alternar}
        aria-label={tocando ? 'Pausar' : 'Reproduzir'}
      >
        {tocando ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
          </svg>
        )}
      </button>

      <span className="faco-tempo">{formatar(atual)}</span>

      <input
        className="faco-barra"
        type="range"
        min="0"
        max={duracao || 0}
        step="0.01"
        value={atual}
        onChange={buscar}
        aria-label="Progresso do vídeo"
        style={{ '--pct': `${duracao ? (atual / duracao) * 100 : 0}%` }}
      />

      <span className="faco-tempo">{formatar(duracao)}</span>

      <button
        type="button"
        className="faco-ctl"
        onClick={alternarMudo}
        aria-label={mudo ? 'Ativar som' : 'Silenciar'}
      >
        {mudo ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
            <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
            <path d="M15 9a4.5 4.5 0 0 1 0 6M17.5 6.5a8 8 0 0 1 0 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </button>
    </div>
  )
}

function SlotVideo({ src, ativa, alt }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ativa) ref.current?.pause()
  }, [ativa])

  const alternar = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  return (
    <>
      <video
        ref={ref}
        src={`${src}#t=0.1`}
        playsInline
        preload="metadata"
        onClick={ativa ? alternar : undefined}
        onPlay={() => pausarOutros(ref.current)}
      />
      {ativa && <Controles videoRef={ref} alt={alt} />}
    </>
  )
}

function Midia({
  numero,
  tipo,
  src,
  alt,
  legenda,
  selecionado,
  escondido,
  extras,
  onSelecionar,
}) {
  const videoRef = useRef(null)
  const quadradoRef = useRef(null)
  const [tocando, setTocando] = useState(false)
  const [indice, setIndice] = useState(0)
  const galeria = [{ tipo, src }, ...(extras ?? [{ tipo, src }, { tipo, src }])]
  const extra = galeria[indice]
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
    const total = (extras?.length ?? 2) + 1
    const aoNavegar = (e) =>
      setIndice((i) => Math.min(Math.max(i + e.detail, 0), total - 1))
    figura?.addEventListener('faco:navegar', aoNavegar)
    figura?.addEventListener('faco:chegou', aoChegar)
    figura?.addEventListener('faco:saiu', aoSair)

    return () => {
      consulta.removeEventListener('change', sincronizar)
      figura?.removeEventListener('faco:navegar', aoNavegar)
      figura?.removeEventListener('faco:chegou', aoChegar)
      figura?.removeEventListener('faco:saiu', aoSair)
    }
  }, [])

  useEffect(() => {
    if (selecionado) {
      const t = setTimeout(() => {
        setAtiva(true)
        embaralhar()
      }, 1100)
      return () => clearTimeout(t)
    }
    if (!automatico.current) setAtiva(false)
    setIndice(0)
  }, [selecionado])

  useEffect(() => {
    if (indice !== 0) videoRef.current?.pause()
    figuraRef.current?.querySelectorAll('.faco-slot video').forEach((v, n) => {
      if (n + 1 !== indice) v.pause()
    })
  }, [indice])

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
    setAtiva(false)
    onSelecionar(numero)
  }

  const parar = (e) => e.stopPropagation()

  const irPara = (k) => {
    if (k !== 0) videoRef.current?.pause()
    setIndice(k)
  }

  const aoClicar = () => {
    if (!selecionado) {
      abrir()
      if (tipo === 'video') videoRef.current?.play().catch(() => {})
      return
    }
    if (indice !== 0) {
      irPara(0)
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
    >
      <div className="faco-camada">
        <div className="faco-numero">
          {String(numero).padStart(2, '0')}_
        </div>

        <div className="faco-palco">
        <div className="faco-trilho" style={{ '--k': indice }}>
        <div
          ref={quadradoRef}
          className={`faco-quadrado${selecionado && indice !== 0 ? ' apagado' : ''}`}
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

              {selecionado && indice === 0 && (
                <Controles videoRef={videoRef} alt={alt} />
              )}
            </>
          ) : (
            <img className="faco-midia" src={src} alt={alt} />
          )}

        </div>

        {selecionado &&
          galeria.slice(1).map((g, n) => {
            const k = n + 1
            return (
              <div
                key={k}
                className={`faco-slot ${k === indice ? 'ativa' : ''}`}
                style={{ '--n': k }}
                onClick={() => k !== indice && irPara(k)}
              >
                {g.tipo === 'video' ? (
                  <SlotVideo src={g.src} ativa={k === indice} alt={alt} />
                ) : (
                  <img src={g.src} alt={alt} />
                )}
              </div>
            )
          })}
        </div>

        {selecionado && (
          <>
            <div className="faco-indice" onClick={parar} role="group" aria-label="Galeria">
              {galeria.map((g, k) => (
                <button
                  key={k}
                  type="button"
                  className={`faco-mini ${k === indice ? 'ativa' : ''}`}
                  onClick={() => irPara(k)}
                  aria-label={`Ver ${k + 1} de ${galeria.length}`}
                  aria-current={k === indice}
                >
                  {g.tipo === 'video' ? (
                    <video src={`${g.src}#t=0.1`} muted playsInline preload="metadata" />
                  ) : (
                    <img src={g.src} alt="" />
                  )}
                </button>
              ))}
            </div>
          </>
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

const SUAVE = 'power3.inOut'
const reduzido = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Faco() {
  const [foco, setFoco] = useState(null)
  const secaoRef = useRef(null)
  const ativos = useRef([])
  const reposo = useRef(null)

  const fechar = () => {
    document.querySelectorAll('.faco-item video').forEach((v) => v.pause())
    setFoco(null)
  }
  useEffect(() => {
    if (!foco) return
    const secao = secaoRef.current
    const figs = [...secao.querySelectorAll('.faco-item')]
    const lento = reduzido() ? 0.01 : 1
    ativos.current.forEach((t) => t.kill())
    ativos.current = []
    if (!reposo.current) {
      reposo.current = figs.map((f) => ({
        x: gsap.getProperty(f, 'x'),
        y: gsap.getProperty(f, 'y'),
        scale: gsap.getProperty(f, 'scale'),
        alpha: gsap.getProperty(f, 'opacity'),
      }))
    }
    const base = reposo.current

    const idx = foco.numero - 1
    const fig = figs[idx]
    const quad = fig.querySelector('.faco-palco')
    const midiaBase = fig.querySelector('.faco-midia')

    const alvoLado = Math.min(window.innerHeight * 0.6, window.innerWidth * 0.82)
    const s = alvoLado / quad.offsetWidth
    const centro = () => {
      const r = quad.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }
    const c0 = centro()
    const alvo = { x: window.innerWidth / 2, y: window.innerHeight / 2 - 16 }

    const scroll0 = window.scrollY
    const ajusteScroll = secao.getBoundingClientRect().top

    const P = { v: 0 } 
    const off = { x: 0, y: 0 }
    const aplicar = () => {
      if (Math.abs(ajusteScroll) > 1) {
        window.scrollTo(0, scroll0 + ajusteScroll * P.v)
      }
      const escalaAtual = 1 + (s - 1) * P.v
      gsap.set(fig, { scale: escalaAtual })
      fig.style.setProperty('--zoom', escalaAtual)
      const c = centro()
      const dx = c0.x + (alvo.x - c0.x) * P.v + off.x - c.x
      const dy = c0.y + (alvo.y - c0.y) * P.v + off.y - c.y
      gsap.set(fig, {
        x: gsap.getProperty(fig, 'x') + dx,
        y: gsap.getProperty(fig, 'y') + dy,
      })
    }
    gsap.ticker.add(aplicar)

    figs.forEach((outra, i) => {
      if (i === idx) return
      ativos.current.push(
        gsap.to(outra, {
          y: base[i].y + window.innerHeight * 0.45,
          scale: 0.3,
          autoAlpha: 0,
          duration: 0.9 * lento,
          ease: 'power2.in',
        }),
      )
    })

    let aoMover = null
    gsap.to(P, {
      v: 1,
      duration: 1.5 * lento,
      ease: SUAVE,
      overwrite: true,
      onComplete: () => {
        if (reduzido() || window.matchMedia('(hover: none)').matches) return
        const AMP = 26 / s 
        const mx = gsap.quickTo(midiaBase, 'x', { duration: 1.6, ease: 'power3.out' })
        const my = gsap.quickTo(midiaBase, 'y', { duration: 1.6, ease: 'power3.out' })
        aoMover = (e) => {
          const px = e.clientX / window.innerWidth - 0.5
          const py = e.clientY / window.innerHeight - 0.5
          mx(-px * 2 * AMP)
          my(-py * 2 * AMP)
        }
        window.addEventListener('mousemove', aoMover)
      },
    })
    const navegar = (dir) =>
      fig.dispatchEvent(new CustomEvent('faco:navegar', { detail: dir }))

    let ultimoPasso = 0
    const aoRolar = (e) => {
      e.preventDefault()
      const agora = performance.now()
      if (Math.abs(e.deltaY) < 8 || agora - ultimoPasso < 900) return
      ultimoPasso = agora
      navegar(e.deltaY > 0 ? 1 : -1)
    }

    let toqueY = null
    const aoTocarTela = (e) => {
      toqueY = e.touches[0].clientY
    }
    const aoMoverToque = (e) => {
      e.preventDefault()
      if (toqueY === null) return
      const dy = toqueY - e.touches[0].clientY
      if (Math.abs(dy) > 40) {
        toqueY = null
        navegar(dy > 0 ? 1 : -1)
      }
    }

    const aoTeclaScroll = (e) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        navegar(1)
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        navegar(-1)
      } else if (['Home', 'End'].includes(e.key)) {
        e.preventDefault()
      }
    }
    window.addEventListener('wheel', aoRolar, { passive: false })
    window.addEventListener('touchstart', aoTocarTela, { passive: true })
    window.addEventListener('touchmove', aoMoverToque, { passive: false })
    window.addEventListener('keydown', aoTeclaScroll)

    return () => {
      gsap.ticker.remove(aplicar)
      gsap.killTweensOf(P)
      gsap.killTweensOf(off)
      window.removeEventListener('wheel', aoRolar)
      window.removeEventListener('touchstart', aoTocarTela)
      window.removeEventListener('touchmove', aoMoverToque)
      window.removeEventListener('keydown', aoTeclaScroll)
      if (aoMover) window.removeEventListener('mousemove', aoMover)

      gsap.to(midiaBase, { x: 0, y: 0, duration: 0.8 })
      ativos.current.forEach((t) => t.kill())
      ativos.current = figs.map((f, i) =>
        gsap.to(f, {
          x: base[i].x,
          y: base[i].y,
          scale: base[i].scale,
          autoAlpha: base[i].alpha,
          duration: 2.2 * lento,
          ease: SUAVE,
          onUpdate:
            i === idx
              ? () => fig.style.setProperty('--zoom', gsap.getProperty(fig, 'scale'))
              : undefined,
          onComplete: () => {
            if (i === idx) fig.style.removeProperty('--zoom')
            if (i === figs.length - 1) reposo.current = null
          },
        }),
      )
    }
  }, [foco?.numero])

  useEffect(() => {
    if (!foco) return
    const aoTecla = (e) => {
      if (e.key === 'Escape') fechar()
    }
    window.addEventListener('keydown', aoTecla)
    window.addEventListener('resize', fechar)
    return () => {
      window.removeEventListener('keydown', aoTecla)
      window.removeEventListener('resize', fechar)
    }
  }, [foco])

  return (
    <section
      ref={secaoRef}
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
            onSelecionar={(n) => setFoco({ numero: n })}
          />
        )
      })}
    </section>
  )
}

export default Faco