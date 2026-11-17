import { Link } from 'react-router-dom'

function NaoEncontrado() {
  return (
    <section
      className="pagina pagina--centralizada"
      aria-labelledby="titulo-404"
    >
      <p className="pagina__etiqueta">Erro 404</p>
      <h1 id="titulo-404" className="pagina__titulo">
        Página não encontrada
      </h1>
      <p className="pagina__descricao">
        O endereço que você tentou abrir não existe neste catálogo.
      </p>

      <Link className="botao" to="/">
        Voltar para o início
      </Link>
    </section>
  )
}

export default NaoEncontrado
