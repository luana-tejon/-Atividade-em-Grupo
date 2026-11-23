# Proposal

## Why

A disciplina pede uma API de catálogo de animes, mas a Jikan, indicada no enunciado, foi descontinuada em 01/10/2026 e não é mais uma fonte confiável. A Tenrai oferece os mesmos dados no schema Jikan v4, então precisamos de uma camada em `src/api` que isole o resto do app dessa dependência e entregue os animes já no contrato do projeto.

## What Changes

- Substituir a Jikan pela Tenrai (`https://api.tenrai.org/v1`) como fonte pública do catálogo. **BREAKING** para quem esperava um `jikan.js`.
- Criar um cliente HTTP com URL configurável por `VITE_ANIME_API_URL`, timeout, cache em memória, deduplicação de requisições e tratamento tipado de erros.
- Expor listas de animes: top, temporada atual e por gênero, além da lista de gêneros disponíveis.
- Expor detalhes de um anime, incluindo diretor (via equipe) e onde assistir (via streaming).
- Transformar todas as respostas da Tenrai no contrato do anime, sem vazar campos brutos da API para as páginas.
- Documentar o contrato, os erros e a validação manual da API.
- Adicionar fixtures no contrato para os outros integrantes trabalharem em paralelo.

**Fora do escopo:** telas completas de Home, Detalhes e Favoritos, favoritos funcionais no JSON Server, efeito de favoritar e layout final. Isso pertence às tarefas 3, 4 e 5.

## Capabilities

### New Capabilities

- `catalogo-animes`: obtenção e normalização dos dados de animes (listas, detalhes, diretor, streaming), com cache, limite de requisições e erros tipados, consumidos pelas telas do app.

### Modified Capabilities

Nenhuma. O projeto ainda não tem specs em `openspec/specs`.

## Impact

- **Código novo:** `src/api/errors.js`, `src/api/tenrai.js`, `src/api/animes.js`, `src/api/index.js`, `src/api/fixtures/animes.js` e `src/api/jikan.js` (re-exportação, caso o enunciado exija o nome antigo).
- **Configuração:** `.env.example` com `VITE_ANIME_API_URL`; `.gitignore` passa a ignorar `.env` e `.env.local` preservando o exemplo.
- **Documentação:** README atualizado de Jikan para Tenrai e `docs/validacao-api.md` com o checklist.
- **Dependências:** nenhuma nova; usa `fetch` nativo e `Map` para cache.
- **Risco:** a Tenrai está em beta e limita 4 req/s e 120 req/min. O código precisa lidar com `429` sem derrubar as telas.
