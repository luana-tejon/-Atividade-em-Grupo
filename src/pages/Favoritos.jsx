import { Link } from 'react-router-dom'
import { useFavoritos } from '../context/useFavoritos.js'
import AnimeCard from '../components/AnimeCard.jsx'
import EstadoCarregando from '../components/EstadoCarregando.jsx'
import EstadoErro from '../components/EstadoErro.jsx'
import EstadoVazio from '../components/EstadoVazio.jsx'
import './Favoritos.css'

const MENSAGEM_ERRO_LISTA = 'Não foi possível carregar seus favoritos.'

function Favoritos() {
  const { favoritos, carregando, erro, recarregar } = useFavoritos()
  const quantidade = favoritos.length

  let conteudo
  if (carregando) {
    conteudo = <EstadoCarregando mensagem="Carregando seus favoritos..." />
  } else if (erro) {
    conteudo = (
      <EstadoErro mensagem={MENSAGEM_ERRO_LISTA} onRetry={recarregar} />
    )
  } else if (quantidade === 0) {
    conteudo = (
      <div className="favoritos__vazio">
        <EstadoVazio
          titulo="Nenhum favorito ainda"
          descricao="Toque no coração de um anime para guardá-lo aqui."
        />
        <Link className="botao favoritos__link-catalogo" to="/">
          Explorar o catálogo
        </Link>
      </div>
    )
  } else {
    conteudo = (
      <>
        <p className="favoritos__contador" role="status">
          {quantidade} {quantidade === 1 ? 'anime' : 'animes'}
        </p>
        <div className="favoritos__grade">
          {favoritos.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </>
    )
  }

  return (
    <section className="favoritos" aria-labelledby="titulo-favoritos">
      <p className="pagina__etiqueta">Sua lista</p>
      <h1 id="titulo-favoritos" className="pagina__titulo">
        Meus favoritos
      </h1>
      <p className="pagina__descricao">
        Os animes que você favoritar aparecem aqui, na ordem em que foram
        adicionados.
      </p>

      <div className="favoritos__conteudo">{conteudo}</div>
    </section>
  )
}

export default Favoritos
