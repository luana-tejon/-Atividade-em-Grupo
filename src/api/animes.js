import { ApiError, CODIGOS } from './errors.js'
import { requisitar, TTL_DETALHES, TTL_LISTAS } from './tenrai.js'

const LIMITE_PADRAO = 12

function textoLimpo(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

function limparHtml(valor) {
  if (typeof valor !== 'string') return null

  const semTags = valor.replace(/<[^>]*>/g, ' ')
  const semEntidades = semTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")

  const limpo = semEntidades.replace(/\s+/g, ' ').trim()
  return limpo || null
}

function inteiroPositivo(valor) {
  const numero = Number(valor)
  return Number.isInteger(numero) && numero > 0 ? numero : null
}

function normalizarId(valor, mensagem = 'Anime inválido.') {
  const id = inteiroPositivo(valor)

  if (id === null) {
    throw new ApiError(mensagem, { codigo: CODIGOS.ID_INVALIDO })
  }

  return id
}

function normalizarLimite(valor) {
  return inteiroPositivo(valor) ?? LIMITE_PADRAO
}

function normalizarCapa(images) {
  const candidatos = [
    images?.jpg?.large_image_url,
    images?.webp?.large_image_url,
    images?.jpg?.image_url,
    images?.webp?.image_url,
  ]

  for (const candidato of candidatos) {
    const url = textoLimpo(candidato)
    if (url) return url
  }

  return ''
}

function normalizarAno(bruto) {
  return (
    inteiroPositivo(bruto?.year) ??
    inteiroPositivo(bruto?.aired?.prop?.from?.year)
  )
}

function urlHttp(valor) {
  const texto = textoLimpo(valor)
  if (!texto) return null

  try {
    const url = new URL(texto)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

function normalizarStreaming(streaming) {
  if (!Array.isArray(streaming)) return []

  const vistos = new Set()
  const resultado = []

  for (const item of streaming) {
    const nome = textoLimpo(item?.name)
    const url = urlHttp(item?.url)
    const chave = nome.toLowerCase()

    if (!nome || !url || vistos.has(chave)) continue

    vistos.add(chave)
    resultado.push({ nome, url })
  }

  return resultado
}

export function normalizarAnime(bruto, { diretor = null } = {}) {
  const id = inteiroPositivo(bruto?.mal_id)
  if (id === null) return null

  return {
    id,
    titulo: textoLimpo(bruto?.title_english) || textoLimpo(bruto?.title),
    capa: normalizarCapa(bruto?.images),
    ano: normalizarAno(bruto),
    diretor: textoLimpo(diretor) || null,
    sinopse: limparHtml(bruto?.synopsis),
    ondeAssistir: normalizarStreaming(bruto?.streaming),
  }
}

function normalizarLista(resposta) {
  if (!Array.isArray(resposta?.data)) {
    throw new ApiError('Resposta inválida do catálogo.', {
      codigo: CODIGOS.RESPOSTA_INVALIDA,
    })
  }

  return resposta.data
    .map((item) => normalizarAnime(item))
    .filter((item) => item !== null)
}

function extrairDiretor(respostaStaff) {
  const pessoas = Array.isArray(respostaStaff?.data) ? respostaStaff.data : []

  for (const pessoa of pessoas) {
    const posicoes = Array.isArray(pessoa?.positions) ? pessoa.positions : []
    const ehDiretor = posicoes.some(
      (posicao) => textoLimpo(posicao).toLowerCase() === 'director',
    )

    if (ehDiretor) {
      const nome = textoLimpo(pessoa?.person?.name)
      if (nome) return nome
    }
  }

  return null
}

export async function listarTopAnimes({ limit = LIMITE_PADRAO, signal } = {}) {
  const resposta = await requisitar('/top/anime', {
    params: {
      limit: normalizarLimite(limit),
      sfw: 'true',
    },
    ttl: TTL_LISTAS,
    signal,
  })

  return normalizarLista(resposta)
}

export async function listarTemporadaAtual({
  limit = LIMITE_PADRAO,
  signal,
} = {}) {
  const resposta = await requisitar('/seasons/now', {
    params: {
      limit: normalizarLimite(limit),
      sfw: 'true',
    },
    ttl: TTL_LISTAS,
    signal,
  })

  return normalizarLista(resposta)
}

export async function listarPorGenero(
  generoId,
  { limit = LIMITE_PADRAO, signal } = {},
) {
  const id = normalizarId(generoId, 'Gênero inválido.')

  const resposta = await requisitar('/anime', {
    params: {
      genres: id,
      order_by: 'score',
      sort: 'desc',
      limit: normalizarLimite(limit),
      sfw: 'true',
    },
    ttl: TTL_LISTAS,
    signal,
  })

  return normalizarLista(resposta)
}

export async function listarGeneros({ signal } = {}) {
  const resposta = await requisitar('/genres/anime', {
    params: { filter: 'genres' },
    ttl: TTL_LISTAS,
    signal,
  })

  if (!Array.isArray(resposta?.data)) {
    throw new ApiError('Resposta inválida do catálogo.', {
      codigo: CODIGOS.RESPOSTA_INVALIDA,
    })
  }

  return resposta.data
    .map((genero) => {
      const id = inteiroPositivo(genero?.mal_id)
      const nome = textoLimpo(genero?.name)
      return id !== null && nome ? { id, nome } : null
    })
    .filter((genero) => genero !== null)
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

export async function obterDetalhes(id, { signal } = {}) {
  const idNormalizado = normalizarId(id)

  const [respostaFull, respostaStaff] = await Promise.all([
    requisitar(`/anime/${idNormalizado}/full`, {
      ttl: TTL_DETALHES,
      signal,
    }),
    requisitar(`/anime/${idNormalizado}/staff`, {
      ttl: TTL_DETALHES,
      signal,
    }).catch((erro) => {
      if (erro instanceof ApiError && erro.codigo === CODIGOS.ABORTADO) {
        throw erro
      }
      return null
    }),
  ])

  const bruto = respostaFull?.data ?? respostaFull
  const anime = normalizarAnime(bruto, {
    diretor: extrairDiretor(respostaStaff),
  })

  if (!anime) {
    throw new ApiError('Resposta inválida do catálogo.', {
      codigo: CODIGOS.RESPOSTA_INVALIDA,
    })
  }

  return anime
}
