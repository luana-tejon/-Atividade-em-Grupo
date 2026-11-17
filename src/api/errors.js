export const CODIGOS = Object.freeze({
  NAO_ENCONTRADO: 'NAO_ENCONTRADO',
  LIMITE_REQUISICOES: 'LIMITE_REQUISICOES',
  ERRO_REDE: 'ERRO_REDE',
  ERRO_SERVIDOR: 'ERRO_SERVIDOR',
  ERRO_API: 'ERRO_API',
  RESPOSTA_INVALIDA: 'RESPOSTA_INVALIDA',
  ID_INVALIDO: 'ID_INVALIDO',
  ABORTADO: 'ABORTADO',
})

export const MENSAGENS = Object.freeze({
  [CODIGOS.NAO_ENCONTRADO]: 'Anime não encontrado.',
  [CODIGOS.LIMITE_REQUISICOES]:
    'Muitas requisições. Tente novamente em instantes.',
  [CODIGOS.ERRO_REDE]: 'Sem conexão com o catálogo.',
  [CODIGOS.ERRO_SERVIDOR]: 'Catálogo indisponível. Tente novamente.',
  [CODIGOS.ERRO_API]: 'Não foi possível carregar o catálogo.',
  [CODIGOS.RESPOSTA_INVALIDA]: 'Resposta inválida do catálogo.',
  [CODIGOS.ID_INVALIDO]: 'Anime inválido.',
  [CODIGOS.ABORTADO]: 'Requisição cancelada.',
})

export class ApiError extends Error {
  constructor(mensagem, opcoes = {}) {
    const {
      codigo = CODIGOS.ERRO_API,
      status = null,
      retryAfter = null,
    } = opcoes

    super(mensagem || MENSAGENS[codigo] || 'Erro no catálogo.')
    this.name = 'ApiError'
    this.codigo = codigo
    this.status = status
    this.retryAfter = retryAfter
  }
}
