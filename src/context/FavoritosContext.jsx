import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito,
} from '../api/favoritos.js'
import { FavoritosContexto } from './useFavoritos.js'

const MENSAGEM_ERRO_ADICIONAR =
  'Não foi possível salvar o favorito. Tente novamente.'
const MENSAGEM_ERRO_REMOVER =
  'Não foi possível remover o favorito. Tente novamente.'

/**
 * Estado global dos favoritos.
 *
 * Cada entrada é `{ anime, registros }`: `anime` no contrato e `registros`
 * com os ids do JSON Server desse anime (usados para remover).
 * Adicionar/remover é otimista; em falha o estado anterior é restaurado.
 */
export function FavoritosProvider({ children }) {
  const [entradas, setEntradas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [pendentes, setPendentes] = useState(() => new Set())
  const [erroGravacao, setErroGravacao] = useState(null)
  const [ultimoAdicionado, setUltimoAdicionado] = useState(null)

  // Espelhos síncronos: dois cliques seguidos chegam antes do re-render.
  const entradasRef = useRef(entradas)
  const pendentesRef = useRef(pendentes)
  const contadorEfeito = useRef(0)

  const definirEntradas = useCallback((calcular) => {
    const proximas = calcular(entradasRef.current)
    entradasRef.current = proximas
    setEntradas(proximas)
  }, [])

  const marcarPendente = useCallback((id, ativo) => {
    const proximos = new Set(pendentesRef.current)
    if (ativo) proximos.add(id)
    else proximos.delete(id)
    pendentesRef.current = proximos
    setPendentes(proximos)
  }, [])

  useEffect(() => {
    const controlador = new AbortController()
    let ativo = true

    listarFavoritos({ signal: controlador.signal })
      .then((lista) => {
        if (!ativo) return
        entradasRef.current = lista
        setEntradas(lista)
        setCarregando(false)
      })
      .catch((falha) => {
        if (!ativo || falha?.name === 'AbortError') return
        setErro(falha)
        setCarregando(false)
      })

    return () => {
      ativo = false
      controlador.abort()
    }
  }, [tentativa])

  const recarregar = useCallback(() => {
    setCarregando(true)
    setErro(null)
    setTentativa((valor) => valor + 1)
  }, [])

  const indisponivel = carregando || erro !== null

  const adicionar = useCallback(
    async (anime, origem = null) => {
      const id = Number(anime?.id)
      if (indisponivel || !Number.isSafeInteger(id)) return
      if (pendentesRef.current.has(id)) return
      if (entradasRef.current.some((e) => e.anime.id === id)) return

      marcarPendente(id, true)
      definirEntradas((atuais) => [...atuais, { anime, registros: [] }])

      // O efeito dispara no clique; ele não confirma a gravação.
      contadorEfeito.current += 1
      setUltimoAdicionado({
        id,
        titulo: anime.titulo ?? '',
        chave: contadorEfeito.current,
        origem,
      })

      try {
        const salvo = await adicionarFavorito(anime)
        definirEntradas((atuais) =>
          atuais.map((e) => (e.anime.id === id ? salvo : e)),
        )
      } catch {
        definirEntradas((atuais) => atuais.filter((e) => e.anime.id !== id))
        setErroGravacao(MENSAGEM_ERRO_ADICIONAR)
      } finally {
        marcarPendente(id, false)
      }
    },
    [indisponivel, definirEntradas, marcarPendente],
  )

  const remover = useCallback(
    async (idAnime) => {
      const id = Number(idAnime)
      if (indisponivel || pendentesRef.current.has(id)) return

      const indice = entradasRef.current.findIndex((e) => e.anime.id === id)
      if (indice === -1) return
      const entrada = entradasRef.current[indice]

      marcarPendente(id, true)
      definirEntradas((atuais) => atuais.filter((e) => e.anime.id !== id))

      try {
        await removerFavorito(entrada.registros)
      } catch {
        definirEntradas((atuais) => {
          const restaurada = [...atuais]
          restaurada.splice(Math.min(indice, restaurada.length), 0, entrada)
          return restaurada
        })
        setErroGravacao(MENSAGEM_ERRO_REMOVER)
      } finally {
        marcarPendente(id, false)
      }
    },
    [indisponivel, definirEntradas, marcarPendente],
  )

  const favoritos = useMemo(() => entradas.map((e) => e.anime), [entradas])
  const idsFavoritos = useMemo(
    () => new Set(favoritos.map((anime) => anime.id)),
    [favoritos],
  )

  const ehFavorito = useCallback(
    (id) => idsFavoritos.has(Number(id)),
    [idsFavoritos],
  )

  const alternar = useCallback(
    (anime, origem = null) =>
      ehFavorito(anime?.id) ? remover(anime.id) : adicionar(anime, origem),
    [ehFavorito, adicionar, remover],
  )

  const limparErroGravacao = useCallback(() => setErroGravacao(null), [])

  const valor = useMemo(
    () => ({
      favoritos,
      ehFavorito,
      alternar,
      adicionar,
      remover,
      recarregar,
      pendentes,
      carregando,
      erro,
      erroGravacao,
      limparErroGravacao,
      ultimoAdicionado,
    }),
    [
      favoritos,
      ehFavorito,
      alternar,
      adicionar,
      remover,
      recarregar,
      pendentes,
      carregando,
      erro,
      erroGravacao,
      limparErroGravacao,
      ultimoAdicionado,
    ],
  )

  return (
    <FavoritosContexto.Provider value={valor}>
      {children}
    </FavoritosContexto.Provider>
  )
}
