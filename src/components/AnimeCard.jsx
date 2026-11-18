import { Link } from 'react-router-dom'
import BotaoFavorito from './BotaoFavorito.jsx'
import './AnimeCard.css'

const FORMATADOR_AVALIACAO = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function formatarAvaliacao(valor) {
  if (typeof valor !== 'number') return null
  if (!Number.isFinite(valor) || valor < 1 || valor > 10) return null
  return FORMATADOR_AVALIACAO.format(valor)
}

function AnimeCard({ anime }) {
  const { id, titulo, capa, ano, avaliacao } = anime
  const nota = formatarAvaliacao(avaliacao)
  const rotuloAvaliacao = nota
    ? `Avaliação do catálogo de ${nota} em 10`
    : 'Sem avaliação'

  return (
    <article className="anime-card">
      <Link
        className="anime-card__link"
        to={`/anime/${id}`}
        aria-label={`Ver detalhes de ${titulo || 'anime sem título'}. ${rotuloAvaliacao}`}
      >
        <div className="anime-card__capa">
          <img
            className="anime-card__imagem"
            src={capa || '/favicon.svg'}
            alt={titulo || 'Capa do anime'}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = '/favicon.svg'
            }}
          />
          {ano && (
            <span className="anime-card__ano">{ano}</span>
          )}
        </div>
        <div className="anime-card__info">
          <h3 className="anime-card__titulo">{titulo || 'Sem título'}</h3>
          <p className="anime-card__avaliacao">
            {nota ? (
              <>
                <span className="anime-card__estrela" aria-hidden="true">
                  ★
                </span>
                <span>{nota}/10</span>
              </>
            ) : (
              'Sem avaliação'
            )}
          </p>
        </div>
      </Link>
      {/* Irmão do link: evita <button> dentro de <a> e não navega ao clicar. */}
      <BotaoFavorito anime={anime} />
    </article>
  )
}

export default AnimeCard
