# Validação da API do catálogo

**Data:** 17/11/2026
**Fonte:** Tenrai (`https://api.tenrai.org/v1`)
**Ambiente:** Node.js 24.19, Vite 8.3.8, oxlint 1.90
**Contrato verificado:** `{ id, titulo, capa, ano, diretor, sinopse, ondeAssistir }`

A validação foi executada com um script Node local, fora do repositório, usando chamadas reais à Tenrai e `fetch` mockado apenas nos cenários que não devem atingir a API (429, falha de rede, JSON inválido e falha de `/staff`).

## Checklist

| # | Cenário | Resultado |
|---|---|---|
| 1 | `BASE_URL` sem `VITE_ANIME_API_URL` | Passou — usou `https://api.tenrai.org/v1` |
| 2 | `listarTopAnimes({ limit: 5 })` | Passou — 5 animes no contrato |
| 3 | `listarTemporadaAtual({ limit: 5 })` | Passou — 5 animes no contrato |
| 4 | `listarPorGenero(1, { limit: 5 })` | Passou — 5 animes no contrato |
| 5 | `listarGeneros()` | Passou — 18 gêneros `{ id, nome }` |
| 6 | `obterDetalhes(1)` | Passou — diretor `Watanabe, Shinichirou`, 10 plataformas e sinopse |
| 7 | Normalização e fallbacks | Passou — título, capa webp, ano por `aired`, HTML removido e item sem `mal_id` descartado |
| 8 | `/staff` indisponível | Passou — detalhes retornaram com `diretor: null` |
| 9 | `obterDetalhes(999999999)` | Passou — `NAO_ENCONTRADO`, status 404 |
| 10 | `obterDetalhes('abc')` | Passou — `ID_INVALIDO`, sem chamada à API |
| 11 | `AbortController` já abortado | Passou — `ABORTADO` |
| 12 | Cache de listas | Passou — segunda chamada não gerou novo `fetch` |
| 13 | Requisições simultâneas iguais | Passou — apenas 1 `fetch` para duas chamadas |
| 14 | Falha de rede | Passou — `ERRO_REDE` |
| 15 | `429` com `Retry-After: 60` | Passou — `LIMITE_REQUISICOES` com `retryAfter: 60000` |
| 16 | `429` com espera curta | Passou — repetiu uma vez e retornou o resultado |
| 17 | JSON inválido | Passou — `RESPOSTA_INVALIDA` |
| 18 | Erro de servidor | Passou — `ERRO_SERVIDOR` |
| 19 | Fixtures | Passou — 4 fixtures no contrato, com e sem diretor/streaming |
| 20 | `jikan.js` | Passou — reexporta as cinco funções de `animes.js` |

## Contrato

As listas retornam `diretor: null` e `ondeAssistir: []`, porque a Tenrai só envia esses dados nos detalhes. A página de detalhes busca `/anime/{id}/full` e `/anime/{id}/staff` em paralelo e:

- usa `mal_id` como `id`;
- prefere `title_english` e usa `title` como fallback;
- usa `images.jpg.large_image_url`, com fallback para `webp`;
- usa `year`, com fallback para `aired.prop.from.year`;
- remove tags HTML da sinopse;
- extrai o diretor apenas de posições exatamente iguais a `Director`;
- converte `streaming` em `{ nome, url }[]`, sem duplicatas e apenas com URLs HTTP/HTTPS.

## Erros

| Código | Quando acontece |
|---|---|
| `NAO_ENCONTRADO` | A Tenrai responde 404 |
| `LIMITE_REQUISICOES` | A Tenrai responde 429 e a espera passa de 2s ou a retentativa falha |
| `ERRO_REDE` | Falha de conexão ou timeout de 12s |
| `ERRO_SERVIDOR` | A Tenrai responde 5xx |
| `ERRO_API` | Outro status HTTP de erro |
| `RESPOSTA_INVALIDA` | JSON inválido ou formato inesperado |
| `ID_INVALIDO` | Identificador de anime ou gênero inválido |
| `ABORTADO` | Requisição cancelada pela tela |

## Comandos executados

```bash
npm run lint
npm run build
```

Ambos passaram sem erros.

## Limitações conhecidas

- A Tenrai está em beta e pode mudar o formato ou ficar indisponível.
- O limite público é de 4 req/s e 120 req/min; o cache e a deduplicação reduzem o consumo, mas não eliminam a possibilidade de `429`.
- Os links de streaming variam por região e podem deixar de funcionar.
- O cache é apenas em memória: recarregar a página limpa o cache.
- Os cenários de `429`, rede e JSON inválido foram testados com `fetch` mockado para não sobrecarregar a API pública.
- Não há suíte de testes automatizados commitada; a validação é manual/scriptada e deve ser repetida ao alterar o mapeamento.
