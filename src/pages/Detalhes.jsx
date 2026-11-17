import { Link, useParams } from 'react-router-dom'

function Detalhes() {
  const { id } = useParams()

  return (
    <section className="pagina" aria-labelledby="titulo-detalhes">
      <p className="pagina__etiqueta">Detalhes</p>
      <h1 id="titulo-detalhes" className="pagina__titulo">
        Anime #{id}
      </h1>
      <p className="pagina__descricao">
        Capa, ano, diretor, sinopse e a seção “Onde assistir” serão exibidos
        aqui.
      </p>

      <div className="aviso" role="status">
        <strong>Em construção.</strong> Esta página será integrada à API do
        catálogo na próxima etapa.
      </div>

      <Link className="botao" to="/">
        Voltar para o início
      </Link>
    </section>
  )
}

export default Detalhes
