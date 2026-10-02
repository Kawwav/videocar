import mclarenImg from '/faco/mclaren.jpg'
import './faco.css'

function Faco() {
  return (
    <section className="faco-secao">
      <div className="faco-conteudo">
        <h2 className="faco-titulo">O QUE FAZEMOS</h2>
      </div>

      <img className="faco-mclaren" src={mclarenImg} alt="McLaren" />
    </section>
  )
}

export default Faco