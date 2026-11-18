import { ApiError } from './errors.js'

// JSON Server de desenvolvimento (`npm run api`). Isolado aqui para permitir
// trocar por variável de ambiente no futuro.
const URL_FAVORITOS = 'http://localhost:3001/favoritos'

export const CODIGO_FAVORITOS_INDISPONIVEL = 'FAVORITOS_INDISPONIVEL'

const MENSAGEM_INDISPONIVEL = 'Não foi possível acessar os favoritos.'

// O json-server v1 sempre gera o `id` do registro no POST. Por isso cada
// registro guarda o `mal_id` em `animeId`, e só esta camada conhece esse
// formato. As telas recebem o contrato do anime, com `id` numérico.
//
// Registro no db.json:
// { id: "<gerado>", animeId: 1, titulo, capa, ano, diretor, sinopse, ondeAssistir }

function idValido(valor) {
  const id = Number(valor)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function paraContrato(dados, id) {
  return {
    id,
    titulo: dados.titulo ?? null,
    capa: dados.capa ?? null,
    ano: dados.ano ?? null,
    diretor: dados.diretor ?? null,
    sinopse: dados.sinopse ?? null,
    ondeAssistir: Array.isArray(dados.ondeAssistir) ? dados.ondeAssistir : [],
  }
}

function indisponivel(status = null) {
  return new ApiError(MENSAGEM_INDISPONIVEL, {
    codigo: CODIGO_FAVORITOS_INDISPONIVEL,
    status,
  })
}

async function requisitar(url, opcoes = {}) {
  let resposta
  try {
    resposta = await fetch(url, opcoes)
  } catch (erro) {
    if (erro?.name === 'AbortError') throw erro
    throw indisponivel()
  }
  return resposta
}

async function lerJson(resposta) {
  try {
    return await resposta.json()
  } catch {
    throw indisponivel(resposta.status)
  }
}

/**
 * Lista os favoritos sem duplicatas, na ordem de inserção.
 * @returns {Promise<Array<{ anime: object, registros: string[] }>>}
 *   `registros` são os ids do JSON Server que pertencem ao anime.
 */
export async function listarFavoritos({ signal } = {}) {
  const resposta = await requisitar(URL_FAVORITOS, { signal })
  if (!resposta.ok) throw indisponivel(resposta.status)

  const dados = await lerJson(resposta)
  if (!Array.isArray(dados)) return []

  const porAnime = new Map()
  for (const registro of dados) {
    if (!registro || typeof registro !== 'object') continue

    const id = idValido(registro.animeId)
    if (id === null || registro.id == null) continue

    const existente = porAnime.get(id)
    if (existente) {
      existente.registros.push(String(registro.id))
    } else {
      porAnime.set(id, {
        anime: paraContrato(registro, id),
        registros: [String(registro.id)],
      })
    }
  }
  return [...porAnime.values()]
}

/**
 * Grava um snapshot do anime (contrato) nos favoritos.
 * @returns {Promise<{ anime: object, registros: string[] }>}
 */
export async function adicionarFavorito(anime) {
  const id = idValido(anime?.id)
  if (id === null) {
    throw new ApiError('Anime inválido para favoritar.', {
      codigo: 'ID_INVALIDO',
    })
  }

  const contrato = paraContrato(anime, id)
  const { id: _ignorado, ...semId } = contrato
  const resposta = await requisitar(URL_FAVORITOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ animeId: id, ...semId }),
  })
  if (!resposta.ok) throw indisponivel(resposta.status)

  const criado = await lerJson(resposta)
  if (criado?.id == null) throw indisponivel(resposta.status)

  return { anime: contrato, registros: [String(criado.id)] }
}

/**
 * Remove todos os registros de um anime (inclui duplicatas antigas).
 * Um registro que já não existe (404) conta como removido.
 */
export async function removerFavorito(registros) {
  const ids = Array.isArray(registros) ? registros : [registros]

  const respostas = await Promise.all(
    ids.map((idRegistro) =>
      requisitar(`${URL_FAVORITOS}/${encodeURIComponent(idRegistro)}`, {
        method: 'DELETE',
      }),
    ),
  )

  const falha = respostas.find((r) => !r.ok && r.status !== 404)
  if (falha) throw indisponivel(falha.status)
}
