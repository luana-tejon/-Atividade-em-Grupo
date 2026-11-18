import { Link } from 'react-router-dom'
import './AnimeCard.css'

function AnimeCard({ anime }) {
  const { id, titulo, capa, ano } = anime

  return (
    <article className="anime-card">
      <Link
        className="anime-card__link"
        to={`/anime/${id}`}
        aria-label={`Ver detalhes de ${titulo}`}
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
        <h3 className="anime-card__titulo">{titulo || 'Sem título'}</h3>
      </Link>
    </article>
  )
}

export default AnimeCard
