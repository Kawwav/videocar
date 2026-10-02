import lemans from '/marcas/24hlemans.png'
import carrera from '/marcas/CarreraPanamericana.png'
import dakar from '/marcas/dakar.png'
import formulaDrift from '/marcas/FormulaDrift.png'
import rallye from '/marcas/RalideMonteCarlo.png'
import ultimateDrift from '/marcas/ultimatedrift.png'
import './granulado.css'
import './marcas.css'

const MARCAS = [
  { nome: '24h Le Mans', src: lemans, escala: 0.68, x: 0, y: 0 },
  { nome: 'La Carrera Panamericana', src: carrera, escala: 0.94, x: -1.2, y: 0 },
  { nome: 'Dakar', src: dakar, escala: 0.69, x: 0, y: 0 },
  { nome: 'Formula Drift', src: formulaDrift, escala: 0.56, x: -4.4, y: -2.5 },
  { nome: 'Rallye Monte-Carlo', src: rallye, escala: 0.76, x: -0.1, y: 0.5 },
  { nome: 'Ultimate Drift', src: ultimateDrift, escala: 0.98, x: -0.4, y: 3.9 },
]

function Marcas() {
  return (
    <section className="marcas-secao fundo-granulado" id="marcas">
      <h2 className="marcas-titulo">Marcas com quem trabalhamos</h2>

      <ul className="marcas-grade">
        {MARCAS.map((marca) => (
          <li key={marca.nome} className="marcas-celula">
            <img
              className="marcas-logo"
              src={marca.src}
              alt={marca.nome}
              loading="lazy"
              style={{
                transform: `scale(${marca.escala}) translate(${marca.x}%, ${marca.y}%)`,
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Marcas