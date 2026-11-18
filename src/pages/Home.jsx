import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  listarTopAnimes,
  listarTemporadaAtual,
  listarGeneros,
  listarPorGenero,
  CODIGOS,
} from '../api'
import AnimeCard from '../components/AnimeCard.jsx'
import EstadoCarregando from '../components/EstadoCarregando.jsx'
import EstadoVazio from '../components/EstadoVazio.jsx'
import EstadoErro from '../components/EstadoErro.jsx'
import './Home.css'

const LIMITE_POPULARES = 12
const LIMITE_TEMPORADA = 12
const LIMITE_POR_GENERO = 8
const MAX_GENEROS_EXIBIDOS = 6

function Home() {
  const [banner, setBanner] = useState(null)
  const [bannerErro, setBannerErro] = useState(null)
  const [bannerCarregando, setBannerCarregando] = useState(true)

  const [populares, setPopulares] = useState([])
  const [popularesErro, setPopularesErro] = useState(null)
  const [popularesCarregando, setPopularesCarregando] = useState(true)

  const [temporada, setTemporada] = useState([])
  const [temporadaErro, setTemporadaErro] = useState(null)
  const [temporadaCarregando, setTemporadaCarregando] = useState(true)

  const [generos, setGeneros] = useState([])
  const [generosCarregando, setGenerosCarregando] = useState(true)

  const [generosSelecionados, setGenerosSelecionados] = useState({})
  const generosIniciadosRef = useRef(new Set())

  const carregarBanner = useCallback(async () => {
    try {
      setBannerCarregando(true)
      setBannerErro(null)
      const lista = await listarTopAnimes({ limit: 1 })
      const primeiro = lista[0] ?? null
      setBanner(primeiro)
    } catch (erro) {
      setBanner(null)
      setBannerErro(
        erro instanceof Error && erro.codigo ? erro.codigo : CODIGOS.ERRO_API
      )
    } finally {
      setBannerCarregando(false)
    }
  }, [])

  const carregarPopulares = useCallback(async () => {
    try {
      setPopularesCarregando(true)
      setPopularesErro(null)
      const lista = await listarTopAnimes({ limit: LIMITE_POPULARES })
      setPopulares(lista)
    } catch (erro) {
      setPopulares([])
      setPopularesErro(
        erro instanceof Error && erro.codigo ? erro.codigo : CODIGOS.ERRO_API
      )
    } finally {
      setPopularesCarregando(false)
    }
  }, [])

  const carregarTemporada = useCallback(async () => {
    try {
      setTemporadaCarregando(true)
      setTemporadaErro(null)
      const lista = await listarTemporadaAtual({ limit: LIMITE_TEMPORADA })
      setTemporada(lista)
    } catch (erro) {
      setTemporada([])
      setTemporadaErro(
        erro instanceof Error && erro.codigo ? erro.codigo : CODIGOS.ERRO_API
      )
    } finally {
      setTemporadaCarregando(false)
    }
  }, [])

  const carregarGeneros = useCallback(async () => {
    try {
      setGenerosCarregando(true)
      const lista = await listarGeneros()
      const generosSlice = lista.slice(0, MAX_GENEROS_EXIBIDOS)
      setGeneros(generosSlice)

      const inicial = {}
      generosSlice.forEach((genero) => {
        inicial[genero.id] = {
          carregando: true,
          erro: null,
          animes: [],
        }
      })
      setGenerosSelecionados(inicial)
    } catch {
      setGeneros([])
      setGenerosSelecionados({})
    } finally {
      setGenerosCarregando(false)
    }
  }, [])

  const carregarPorGenero = useCallback(
    async (generoId, chave) => {
      setGenerosSelecionados((prev) => ({
        ...prev,
        [chave]: { carregando: true, erro: null, animes: [] },
      }))
      try {
        const lista = await listarPorGenero(generoId, {
          limit: LIMITE_POR_GENERO,
        })
        setGenerosSelecionados((prev) => ({
          ...prev,
          [chave]: { carregando: false, erro: null, animes: lista },
        }))
      } catch (erro) {
        setGenerosSelecionados((prev) => ({
          ...prev,
          [chave]: {
            carregando: false,
            erro:
              erro instanceof Error && erro.codigo
                ? erro.codigo
                : CODIGOS.ERRO_API,
            animes: [],
          },
        }))
      }
    },
    []
  )

  useEffect(() => {
    const controle = setTimeout(() => {
      carregarBanner()
      carregarPopulares()
      carregarTemporada()
      carregarGeneros()
    }, 0)
    return () => clearTimeout(controle)
  }, [carregarBanner, carregarPopulares, carregarTemporada, carregarGeneros])

  useEffect(() => {
    generos.forEach((genero) => {
      if (!generosIniciadosRef.current.has(genero.id)) {
        generosIniciadosRef.current.add(genero.id)
        setTimeout(() => {
          carregarPorGenero(genero.id, genero.id)
        }, 0)
      }
    })
  }, [generos, carregarPorGenero])

  const tentativasNovamente = {
    banner: carregarBanner,
    populares: carregarPopulares,
    temporada: carregarTemporada,
  }

  return (
    <section className="home" aria-labelledby="titulo-inicio">
      <p className="home__etiqueta">Catálogo</p>
      <h1 id="titulo-inicio" className="home__titulo">
        Descubra seu próximo anime
      </h1>
      <p className="home__descricao">
        Listas com capa, ano e onde assistir. Explore os mais populares, a
        temporada atual e os animes por gênero.
      </p>

      {/* Banner de destaque */}
      <section className="home__banner">
        {bannerCarregando ? (
          <EstadoCarregando mensagem="Carregando destaque..." />
        ) : bannerErro ? (
          <EstadoErro
            codigo={bannerErro}
            onRetry={tentativasNovamente.banner}
          />
        ) : banner ? (
          <article className="banner-destaque">
            <div className="banner-destaque__conteudo">
              <p className="banner-destaque__etiqueta">Destaque</p>
              <h2 className="banner-destaque__titulo">{banner.titulo}</h2>
              <p className="banner-destaque__descricao">
                {banner.sinopse ||
                  'Descubra mais sobre este anime na página de detalhes.'}
              </p>
              <Link
                className="botao"
                to={`/anime/${banner.id}`}
                aria-label={`Ver detalhes de ${banner.titulo}`}
              >
                Ver detalhes
              </Link>
            </div>
            <div className="banner-destaque__imagem">
              <img
                src={banner.capa || '/favicon.svg'}
                alt={banner.titulo}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.src = '/favicon.svg'
                }}
              />
            </div>
          </article>
        ) : (
          <EstadoVazio
            titulo="Nenhum destaque disponível"
            descricao="Não foi possível encontrar um anime para destacar no momento."
          />
        )}
      </section>

      {/* Seção: Animes populares */}
      <section className="home__secao" id="populares">
        <div className="home__cabecalho-secao">
          <h2 className="home__titulo-secao">Animes populares</h2>
          <p className="home__descricao-secao">
            Os animes mais bem avaliados do catálogo.
          </p>
        </div>
        {popularesCarregando ? (
          <EstadoCarregando mensagem="Carregando animes populares..." />
        ) : popularesErro ? (
          <EstadoErro
            codigo={popularesErro}
            onRetry={tentativasNovamente.populares}
          />
        ) : populares.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum anime popular encontrado"
            descricao="Tente novamente mais tarde ou explore outras seções."
          />
        ) : (
          <div className="home__grade">
            {populares.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </section>

      {/* Seção: Temporada atual */}
      <section className="home__secao" id="temporada">
        <div className="home__cabecalho-secao">
          <h2 className="home__titulo-secao">Temporada atual</h2>
          <p className="home__descricao-secao">
            O que está sendo exibido agora.
          </p>
        </div>
        {temporadaCarregando ? (
          <EstadoCarregando mensagem="Carregando temporada atual..." />
        ) : temporadaErro ? (
          <EstadoErro
            codigo={temporadaErro}
            onRetry={tentativasNovamente.temporada}
          />
        ) : temporada.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum anime na temporada atual"
            descricao="Não há animes em exibição no momento."
          />
        ) : (
          <div className="home__grade">
            {temporada.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </section>

      {/* Seção: Por gênero */}
      {!generosCarregando && generos.length > 0 && (
        <section className="home__secao" id="generos">
          <div className="home__cabecalho-secao">
            <h2 className="home__titulo-secao">Por gênero</h2>
            <p className="home__descricao-secao">
              Explore animes separados por gênero.
            </p>
          </div>
          <div className="home__generos">
            {generos.map((genero) => {
              const estado = generosSelecionados[genero.id]
              if (!estado) return null

              return (
                <section
                  key={genero.id}
                  className="home__genero-secao"
                  aria-labelledby={`genero-${genero.id}`}
                >
                  <h3 id={`genero-${genero.id}`} className="home__titulo-genero">
                    {genero.nome}
                  </h3>
                  {estado.carregando ? (
                    <EstadoCarregando mensagem="Carregando..." />
                  ) : estado.erro ? (
                    <EstadoErro codigo={estado.erro} />
                  ) : estado.animes.length === 0 ? (
                    <EstadoVazio
                      titulo="Nenhum resultado"
                      descricao="Não há animes para este gênero no momento."
                    />
                  ) : (
                    <div className="home__grade">
                      {estado.animes.map((anime) => (
                        <AnimeCard key={anime.id} anime={anime} />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </section>
      )}

      {generosCarregando && generos.length === 0 && (
        <section className="home__secao" id="generos">
          <div className="home__cabecalho-secao">
            <h2 className="home__titulo-secao">Por gênero</h2>
            <p className="home__descricao-secao">
              Explore animes separados por gênero.
            </p>
          </div>
          <EstadoCarregando mensagem="Carregando gêneros..." />
        </section>
      )}
    </section>
  )
}

export default Home
