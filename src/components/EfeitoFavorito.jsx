import { useEffect, useRef, useState } from 'react'
import { useFavoritos } from '../context/useFavoritos.js'
import './EfeitoFavorito.css'

const DURACAO_MS = 1000
const ONOMATOPEIA = '好き!'

// Direção de cada partícula, em graus (0 = direita, -90 = para cima).
const PARTICULAS = [
  { angulo: -90, simbolo: '♥' },
  { angulo: -150, simbolo: '✦' },
  { angulo: -30, simbolo: '♥' },
  { angulo: -120, simbolo: '♥' },
  { angulo: -60, simbolo: '✧' },
  { angulo: 180, simbolo: '♥' },
]

function deslocamento(angulo, raio = 46) {
  const radianos = (angulo * Math.PI) / 180
  return {
    '--dx': `${Math.round(Math.cos(radianos) * raio)}px`,
    '--dy': `${Math.round(Math.sin(radianos) * raio)}px`,
  }
}

function posicaoDe(ultimo) {
  return (
    ultimo.origem ?? {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }
  )
}

/**
 * Efeito de comemoração ao favoritar. Montado uma vez no Layout e disparado
 * por `ultimoAdicionado`. Só visual: não bloqueia cliques nem confirma a gravação.
 */
function EfeitoFavorito() {
  const { ultimoAdicionado } = useFavoritos()
  const [ativos, setAtivos] = useState([])
  const [chaveVista, setChaveVista] = useState(null)
  const timers = useRef(new Map())

  // Cada nova adição entra na lista durante o render (sem efeito em cascata);
  // assim adições seguidas geram efeitos independentes.
  if (ultimoAdicionado && ultimoAdicionado.chave !== chaveVista) {
    setChaveVista(ultimoAdicionado.chave)
    setAtivos((atuais) => [
      ...atuais,
      { chave: ultimoAdicionado.chave, ...posicaoDe(ultimoAdicionado) },
    ])
  }

  // Remove cada efeito após o tempo máximo, mesmo que a animação não rode.
  useEffect(() => {
    for (const { chave } of ativos) {
      if (timers.current.has(chave)) continue
      const timer = setTimeout(() => {
        timers.current.delete(chave)
        setAtivos((atuais) => atuais.filter((e) => e.chave !== chave))
      }, DURACAO_MS)
      timers.current.set(chave, timer)
    }
  }, [ativos])

  useEffect(() => {
    const pendentes = timers.current
    return () => {
      pendentes.forEach(clearTimeout)
      pendentes.clear()
    }
  }, [])

  const anuncio = ultimoAdicionado
    ? `${ultimoAdicionado.titulo || 'Anime'} adicionado aos favoritos`
    : ''

  return (
    <>
      <div className="efeito-favorito__camada" aria-hidden="true">
        {ativos.map((efeito) => (
          <div
            key={efeito.chave}
            className="efeito-favorito"
            style={{ left: `${efeito.x}px`, top: `${efeito.y}px` }}
          >
            {PARTICULAS.map((particula, indice) => (
              <span
                key={indice}
                className="efeito-favorito__particula"
                style={{
                  ...deslocamento(particula.angulo),
                  animationDelay: `${indice * 30}ms`,
                }}
              >
                {particula.simbolo}
              </span>
            ))}
            <span className="efeito-favorito__texto">{ONOMATOPEIA}</span>
          </div>
        ))}
      </div>

      <p className="efeito-favorito__anuncio" aria-live="polite">
        {anuncio}
      </p>
    </>
  )
}

export default EfeitoFavorito
