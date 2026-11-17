const SECOES = [
  {
    titulo: 'Mais populares',
    descricao: 'Os animes mais bem avaliados do catálogo.',
  },
  {
    titulo: 'Temporada atual',
    descricao: 'O que está sendo exibido agora.',
  },
  {
    titulo: 'Por gênero',
    descricao: 'Ação, comédia, romance e outros gêneros.',
  },
]

function Home() {
  return (
    <section className="pagina" aria-labelledby="titulo-inicio">
      <p className="pagina__etiqueta">Catálogo</p>
      <h1 id="titulo-inicio" className="pagina__titulo">
        Descubra seu próximo anime
      </h1>
      <p className="pagina__descricao">
        Listas com capa, ano, diretor e onde assistir. A integração com a API
        do catálogo entra na próxima etapa.
      </p>

      <div className="aviso" role="status">
        <strong>Base pronta.</strong> As rotas, o layout e o JSON Server já
        estão configurados.
      </div>

      {SECOES.map((secao) => (
        <section className="secao" key={secao.titulo}>
          <h2>{secao.titulo}</h2>
          <p>{secao.descricao}</p>
          <div className="secao__placeholder">
            Em construção — os cards chegam com a integração da API.
          </div>
        </section>
      ))}
    </section>
  )
}

export default Home
