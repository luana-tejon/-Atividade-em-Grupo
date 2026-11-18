import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obterDetalhes, CODIGOS } from '../api'
import EstadoCarregando from '../components/EstadoCarregando.jsx'
import EstadoErro from '../components/EstadoErro.jsx'
import './Detalhes.css'

const TEXTO_NAO_INFORMADO = 'Não informado'
const MENSAGEM_SEM_STREAMING =
  'Nenhuma plataforma de streaming informada para este anime.'
const ESTADO_INICIAL = {
  id: null,
  status: 'carregando',
  anime: null,
  codigo: null,
}

function textoLimpo(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

function normalizarId(valor) {
  if (typeof valor !== 'string' || !/^\d+$/.test(valor)) return null

  const numero = Number(valor)
  return Number.isSafeInteger(numero) && numero > 0 ? numero : null
}

function CapaAnime({ anime }) {
  const [falhou, setFalhou] = useState(false)
  const titulo = textoLimpo(anime.titulo)
  const mostrarImagem = Boolean(anime.capa) && !falhou

  return (
    <div className="detalhes__capa">
      {mostrarImagem ? (
        <img
          className="detalhes__imagem"
          src={anime.capa}
          alt={titulo ? `Capa de ${titulo}` : 'Capa do anime'}
          onError={() => setFalhou(true)}
        />
      ) : (
        <div
          className="detalhes__capa-indisponivel"
          role="img"
          aria-label="Capa não disponível"
        >
          <span className="detalhes__capa-icone" aria-hidden="true">
            &#x1F39E;
          </span>
          <span className="detalhes__capa-texto">Capa não disponível</span>
        </div>
      )}
    </div>
  )
}

function Detalhes() {
  const { id } = useParams()
  const idNumerico = normalizarId(id)
  const [resultado, setResultado] = useState(ESTADO_INICIAL)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    if (idNumerico === null) return undefined

    const controlador = new AbortController()
    let ativo = true

    obterDetalhes(idNumerico, { signal: controlador.signal })
      .then((anime) => {
        if (!ativo) return
        setResultado({ id, status: 'sucesso', anime, codigo: null })
      })
      .catch((erro) => {
        if (!ativo) return

        const codigo =
          erro instanceof Error && erro.codigo ? erro.codigo : CODIGOS.ERRO_API

        if (codigo === CODIGOS.ABORTADO) return

        if (
          codigo === CODIGOS.NAO_ENCONTRADO ||
          codigo === CODIGOS.ID_INVALIDO
        ) {
          setResultado({ id, status: 'naoEncontrado', anime: null, codigo })
          return
        }

        setResultado({ id, status: 'erro', anime: null, codigo })
      })

    return () => {
      ativo = false
      controlador.abort()
    }
  }, [id, idNumerico, tentativa])

  function tentarNovamente() {
    setResultado((atual) => ({
      ...atual,
      status: 'carregando',
      anime: null,
      codigo: null,
    }))
    setTentativa((valor) => valor + 1)
  }

  // Enquanto o efeito do novo ID não roda, a tela não mostra dados antigos.
  const visivel =
    idNumerico === null
      ? { status: 'naoEncontrado', anime: null, codigo: CODIGOS.ID_INVALIDO }
      : resultado.id === id
        ? resultado
        : { status: 'carregando', anime: null, codigo: null }

  const anime = visivel.anime
  const titulo = textoLimpo(anime?.titulo)
  const plataformas = Array.isArray(anime?.ondeAssistir)
    ? anime.ondeAssistir.filter(
        (plataforma) =>
          textoLimpo(plataforma?.nome) && textoLimpo(plataforma?.url),
      )
    : []

  return (
    <section className="detalhes" aria-labelledby="titulo-detalhes">
      <Link className="detalhes__voltar" to="/">
        <span aria-hidden="true">&#x2190;</span> Voltar para o início
      </Link>

      <header className="detalhes__cabecalho">
        <p className="detalhes__etiqueta">Detalhes</p>
        <h1 id="titulo-detalhes" className="detalhes__titulo">
          {visivel.status === 'naoEncontrado'
            ? 'Anime não encontrado'
            : visivel.status === 'sucesso'
              ? titulo || 'Título não informado'
              : 'Detalhes do anime'}
        </h1>
      </header>

      {visivel.status === 'naoEncontrado' && (
        <div className="detalhes__nao-encontrado">
          <p className="detalhes__descricao">
            Não encontramos um anime com este identificador no catálogo.
          </p>
          <Link className="botao detalhes__botao" to="/">
            Voltar para o início
          </Link>
        </div>
      )}

      {visivel.status === 'carregando' && (
        <EstadoCarregando mensagem="Carregando detalhes do anime..." />
      )}

      {visivel.status === 'erro' && (
        <EstadoErro codigo={visivel.codigo} onRetry={tentarNovamente} />
      )}

      {visivel.status === 'sucesso' && anime && (
        <div className="detalhes__conteudo">
          <CapaAnime key={anime.id} anime={anime} />

          <div className="detalhes__info">
            <dl className="detalhes__ficha">
              <div className="detalhes__campo">
                <dt className="detalhes__campo-rotulo">Ano</dt>
                <dd className="detalhes__campo-valor">
                  {anime.ano ?? TEXTO_NAO_INFORMADO}
                </dd>
              </div>
              <div className="detalhes__campo">
                <dt className="detalhes__campo-rotulo">Diretor</dt>
                <dd className="detalhes__campo-valor">
                  {textoLimpo(anime.diretor) || TEXTO_NAO_INFORMADO}
                </dd>
              </div>
            </dl>

            <section className="detalhes__secao" aria-labelledby="titulo-sinopse">
              <h2 id="titulo-sinopse" className="detalhes__subtitulo">
                Sinopse
              </h2>
              <p className="detalhes__sinopse">
                {textoLimpo(anime.sinopse) || TEXTO_NAO_INFORMADO}
              </p>
            </section>

            <section
              className="detalhes__secao"
              aria-labelledby="titulo-onde-assistir"
            >
              <h2 id="titulo-onde-assistir" className="detalhes__subtitulo">
                Onde assistir
              </h2>

              {plataformas.length > 0 ? (
                <ul className="detalhes__plataformas">
                  {plataformas.map((plataforma) => (
                    <li
                      className="detalhes__plataforma"
                      key={`${plataforma.nome}-${plataforma.url}`}
                    >
                      <a
                        className="detalhes__link-streaming"
                        href={plataforma.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {plataforma.nome}
                        <span className="detalhes__texto-oculto">
                          {' '}
                          (abre em nova aba)
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="detalhes__sem-streaming">
                  {MENSAGEM_SEM_STREAMING}
                </p>
              )}
            </section>

            <Link className="botao detalhes__botao" to="/">
              Voltar para o início
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

export default Detalhes
