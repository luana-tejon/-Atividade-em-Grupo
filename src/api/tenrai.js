import { ApiError, CODIGOS, MENSAGENS } from './errors.js'

const URL_PADRAO = 'https://api.tenrai.org/v1'
const TEMPO_LIMITE_MS = 12_000
const ESPERA_MAXIMA_RETENTATIVA_MS = 2_000
const TENTATIVAS_MAXIMAS = 2

export const TTL_LISTAS = 5 * 60 * 1000
export const TTL_DETALHES = 15 * 60 * 1000

const env = import.meta.env || {}
export const BASE_URL = String(
  env.VITE_ANIME_API_URL || URL_PADRAO,
).replace(/\/+$/, '')

const cache = new Map()
const emAndamento = new Map()

export function limparCache() {
  cache.clear()
  emAndamento.clear()
}

export function montarUrl(caminho, params = {}) {
  const caminhoNormalizado = caminho.startsWith('/') ? caminho : `/${caminho}`
  const url = new URL(`${BASE_URL}${caminhoNormalizado}`)

  for (const [chave, valor] of Object.entries(params)) {
    if (valor === undefined || valor === null || valor === '') continue

    if (Array.isArray(valor)) {
      for (const item of valor) {
        if (item !== undefined && item !== null && item !== '') {
          url.searchParams.append(chave, String(item))
        }
      }
      continue
    }

    url.searchParams.set(chave, String(valor))
  }

  return url.toString()
}

function clonar(valor) {
  if (typeof structuredClone === 'function') {
    return structuredClone(valor)
  }
  return JSON.parse(JSON.stringify(valor))
}

function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function lerRetryAfter(valor) {
  if (!valor) return null

  const segundos = Number(valor)
  if (Number.isFinite(segundos)) {
    return Math.max(0, Math.round(segundos * 1000))
  }

  const data = Date.parse(valor)
  if (Number.isNaN(data)) return null
  return Math.max(0, data - Date.now())
}

function erroAbortado() {
  return new ApiError(MENSAGENS[CODIGOS.ABORTADO], {
    codigo: CODIGOS.ABORTADO,
  })
}

function aguardarComSinal(promessa, signal) {
  if (!signal) return promessa
  if (signal.aborted) return Promise.reject(erroAbortado())

  return new Promise((resolve, reject) => {
    const aoAbortar = () => reject(erroAbortado())

    signal.addEventListener('abort', aoAbortar, { once: true })

    promessa.then(
      (valor) => {
        signal.removeEventListener('abort', aoAbortar)
        resolve(valor)
      },
      (erro) => {
        signal.removeEventListener('abort', aoAbortar)
        reject(erro)
      },
    )
  })
}

async function executarRequisicao(url, tentativa = 1) {
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS)

  let resposta

  try {
    resposta = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controlador.signal,
    })
  } catch (erro) {
    if (erro?.name === 'AbortError') {
      throw new ApiError('Tempo de resposta esgotado.', {
        codigo: CODIGOS.ERRO_REDE,
      })
    }
    throw new ApiError(MENSAGENS[CODIGOS.ERRO_REDE], {
      codigo: CODIGOS.ERRO_REDE,
    })
  } finally {
    clearTimeout(temporizador)
  }

  if (resposta.status === 429) {
    const retryAfter = lerRetryAfter(resposta.headers.get('retry-after'))
    const podeTentar =
      tentativa < TENTATIVAS_MAXIMAS &&
      retryAfter !== null &&
      retryAfter <= ESPERA_MAXIMA_RETENTATIVA_MS

    if (podeTentar) {
      if (retryAfter > 0) await esperar(retryAfter)
      return executarRequisicao(url, tentativa + 1)
    }

    throw new ApiError(MENSAGENS[CODIGOS.LIMITE_REQUISICOES], {
      codigo: CODIGOS.LIMITE_REQUISICOES,
      status: 429,
      retryAfter,
    })
  }

  if (resposta.status === 404) {
    throw new ApiError(MENSAGENS[CODIGOS.NAO_ENCONTRADO], {
      codigo: CODIGOS.NAO_ENCONTRADO,
      status: 404,
    })
  }

  if (resposta.status >= 500) {
    throw new ApiError(MENSAGENS[CODIGOS.ERRO_SERVIDOR], {
      codigo: CODIGOS.ERRO_SERVIDOR,
      status: resposta.status,
    })
  }

  if (!resposta.ok) {
    throw new ApiError(MENSAGENS[CODIGOS.ERRO_API], {
      codigo: CODIGOS.ERRO_API,
      status: resposta.status,
    })
  }

  try {
    return await resposta.json()
  } catch {
    throw new ApiError(MENSAGENS[CODIGOS.RESPOSTA_INVALIDA], {
      codigo: CODIGOS.RESPOSTA_INVALIDA,
      status: resposta.status,
    })
  }
}

export async function requisitar(
  caminho,
  { params, signal, ttl = TTL_LISTAS } = {},
) {
  if (signal?.aborted) throw erroAbortado()

  const url = montarUrl(caminho, params)
  const agora = Date.now()
  const itemEmCache = cache.get(url)

  if (itemEmCache && itemEmCache.expiraEm > agora) {
    return clonar(itemEmCache.valor)
  }

  if (itemEmCache) cache.delete(url)

  let promessa = emAndamento.get(url)

  if (!promessa) {
    promessa = executarRequisicao(url)
      .then((valor) => {
        cache.set(url, { valor, expiraEm: Date.now() + ttl })
        return valor
      })
      .finally(() => {
        emAndamento.delete(url)
      })

    emAndamento.set(url, promessa)
  }

  const valor = await aguardarComSinal(promessa, signal)
  return clonar(valor)
}
