import { useFavoritos } from '../context/useFavoritos.js'
import './BotaoFavorito.css'

function centroDoBotao(elemento) {
  const caixa = elemento.getBoundingClientRect()
  return {
    x: caixa.left + caixa.width / 2,
    y: caixa.top + caixa.height / 2,
  }
}

/**
 * Coração de favoritar (♡ vazio / ♥ preenchido).
 * `variante`: "card" (sobre a capa) ou "detalhes" (com texto).
 */
function BotaoFavorito({ anime, variante = 'card' }) {
  const { ehFavorito, alternar, pendentes, carregando, erro } = useFavoritos()

  if (!anime || anime.id == null) return null

  const titulo = anime.titulo || 'este anime'
  const favorito = ehFavorito(anime.id)
  const pendente = pendentes.has(Number(anime.id))
  const indisponivel = carregando || erro !== null

  const acao = favorito
    ? `Remover ${titulo} dos favoritos`
    : `Adicionar ${titulo} aos favoritos`

  let motivo = ''
  if (carregando) motivo = 'Carregando favoritos…'
  else if (erro) motivo = 'Favoritos indisponíveis no momento'
  else if (pendente) motivo = 'Salvando…'

  const classes = [
    'botao-favorito',
    `botao-favorito--${variante}`,
    favorito && 'botao-favorito--ativo',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={favorito}
      aria-label={indisponivel ? `${acao} (${motivo})` : acao}
      title={motivo || acao}
      disabled={indisponivel || pendente}
      aria-busy={pendente || undefined}
      onClick={(evento) => {
        evento.preventDefault()
        evento.stopPropagation()
        alternar(anime, centroDoBotao(evento.currentTarget))
      }}
    >
      <span className="botao-favorito__icone" aria-hidden="true">
        {favorito ? '♥' : '♡'}
      </span>
      {variante === 'detalhes' && (
        <span className="botao-favorito__texto" aria-hidden="true">
          {favorito ? 'Favoritado' : 'Favoritar'}
        </span>
      )}
    </button>
  )
}

export default BotaoFavorito
