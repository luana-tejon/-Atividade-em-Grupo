import { useEffect } from 'react'
import { useFavoritos } from '../context/useFavoritos.js'
import './AvisoFavoritos.css'

const DURACAO_MS = 4000

/** Mostra o último erro de gravação/remoção de favorito. */
function AvisoFavoritos() {
  const { erroGravacao, limparErroGravacao } = useFavoritos()

  useEffect(() => {
    if (!erroGravacao) return undefined
    const timer = setTimeout(limparErroGravacao, DURACAO_MS)
    return () => clearTimeout(timer)
  }, [erroGravacao, limparErroGravacao])

  if (!erroGravacao) return null

  return (
    <div className="aviso-favoritos" role="alert">
      <span className="aviso-favoritos__icone" aria-hidden="true">
        &#x26A0;
      </span>
      <p className="aviso-favoritos__mensagem">{erroGravacao}</p>
      <button
        type="button"
        className="aviso-favoritos__fechar"
        onClick={limparErroGravacao}
        aria-label="Fechar aviso"
      >
        &times;
      </button>
    </div>
  )
}

export default AvisoFavoritos
