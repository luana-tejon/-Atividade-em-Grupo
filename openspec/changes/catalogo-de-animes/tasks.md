# Tasks

## 1. Configuração e documentação (commit 1 — `chore: configs`)

- [x] 1.1 Criar `.env.example` com `VITE_ANIME_API_URL=https://api.tenrai.org/v1` e conferir que o arquivo aparece em `git status --short` e não está ignorado.
- [x] 1.2 Ajustar `.gitignore` para ignorar `.env` e `.env.*`, preservando `!.env.example`; verificar com `git check-ignore -v .env` e `git check-ignore -v .env.example` (o segundo não deve retornar nada).
- [x] 1.3 Atualizar o README: trocar Jikan por Tenrai, registrar a descontinuação da Jikan em 01/10/2026, documentar `.env.example`, corrigir “João Gomes” para “João Vitor” e apontar os caminhos reais da proposta, spec, design e tarefas; conferir que todos os caminhos citados existem no repositório.
- [x] 1.4 Validar os artefatos OpenSpec com `openspec validate catalogo-de-animes --strict` e conferir que proposta, spec, design e tarefas aparecem em `openspec status --change catalogo-de-animes`.

## 2. Transporte HTTP e erros (commit 2 — `feat(api): ...`)

- [ ] 2.1 Criar `src/api/errors.js` com `ApiError` (`codigo`, `status`, `retryAfter`) e o objeto `CODIGOS` com `NAO_ENCONTRADO`, `LIMITE_REQUISICOES`, `ERRO_REDE`, `ERRO_SERVIDOR`, `ERRO_API`, `RESPOSTA_INVALIDA`, `ID_INVALIDO` e `ABORTADO`; verificar com um script Node que `new ApiError('x', { codigo: CODIGOS.ERRO_REDE }).codigo === 'ERRO_REDE'`.
- [ ] 2.2 Criar `src/api/tenrai.js` com leitura de `VITE_ANIME_API_URL` (fallback `https://api.tenrai.org/v1`), montagem de URL/query, `fetch` com `Accept: application/json`, timeout de 12s e `AbortController`; verificar com `node -e` que a URL base termina em `/v1` e que uma chamada real a `/top/anime?limit=1` retorna dados.
- [ ] 2.3 Implementar em `tenrai.js` o mapeamento de erros HTTP (404, 429, 5xx, outros), JSON inválido e falha de rede para os códigos definidos; verificar que `/anime/999999999` lança `ApiError` com `codigo === 'NAO_ENCONTRADO'` e `status === 404`.
- [ ] 2.4 Implementar cache em memória com TTL (listas 5 min, detalhes 15 min), chave por URL, remoção de expirados e `limparCache()`; verificar com script Node que duas chamadas seguidas a `/top/anime?limit=1` usam o cache e que `limparCache()` força nova chamada.
- [ ] 2.5 Implementar deduplicação de requisições em andamento e retentativa única em `429` quando `Retry-After` for de até 2s; verificar com `fetch` mockado em script Node que duas chamadas simultâneas geram uma única requisição e que `429` persistente lança `LIMITE_REQUISICOES` com `retryAfter`.

## 3. Listas, gêneros e mapeamento do contrato (commit 2 — `feat(api): ...`)

- [ ] 3.1 Implementar em `src/api/animes.js` a normalização do contrato (`id`, `titulo`, `capa`, `ano`, `sinopse`, `ondeAssistir`), com fallbacks definidos no design e descarte de itens sem `mal_id`; verificar com entradas fixas que cobrem título em inglês ausente, capa ausente, ano ausente e sinopse com HTML.
- [ ] 3.2 Implementar `listarTopAnimes`, `listarTemporadaAtual`, `listarPorGenero` e `listarGeneros`, aceitando `{ limit, signal }`; verificar com script Node que cada função retorna listas no contrato e que uma lista vazia retorna `[]`.
- [ ] 3.3 Criar `src/api/fixtures/animes.js` com `ANIMES_FIXTOS` e `obterAnimeFixo(id)` contendo um anime completo, um sem diretor, um sem streaming e um ID inexistente; verificar que cada objeto tem exatamente as chaves do contrato.
- [ ] 3.4 Criar `src/api/index.js` como fachada pública (funções, `ApiError`, `CODIGOS`) e `src/api/jikan.js` reexportando `./animes`; verificar com script Node que todos os imports resolvem e que `jikan.js` expõe as mesmas funções de `animes.js`.

## 4. Detalhes, diretor e streaming (commit 2 — `feat(api): ...`)

- [ ] 4.1 Implementar `obterDetalhes(id, { signal })` validando o ID antes de chamar a Tenrai e lançando `ID_INVALIDO` para valores não numéricos ou menores que 1; verificar que `obterDetalhes('abc')` lança `ID_INVALIDO` sem requisição.
- [ ] 4.2 Buscar `/anime/{id}/full` e `/anime/{id}/staff` em paralelo, mapear `streaming` para `{ nome, url }[]` sem duplicados e extrair o diretor pela posição exata `Director` (case-insensitive), ignorando `ADR Director` e `Animation Director`; verificar com `obterDetalhes(1)` que diretor e streaming vêm preenchidos quando existirem.
- [ ] 4.3 Tratar `/full` inexistente como `NAO_ENCONTRADO` e qualquer falha de `/staff` como `diretor: null` sem derrubar a consulta; verificar com `obterDetalhes(999999999)` e com `fetch` mockado que falha só de staff ainda retorna o anime.
- [ ] 4.4 Documentar em `src/api/index.js` ou no README da API que listas retornam `diretor: null` e `ondeAssistir: []` por limitação da Tenrai; conferir que a documentação cita o contrato e os códigos de erro.

## 5. Integração e validação (commit 2 — `feat(api): ...`)

- [ ] 5.1 Rodar `npm run lint` e `npm run build` e corrigir eventuais problemas; verificar que ambos terminam com código 0.
- [ ] 5.2 Preencher `docs/validacao-api.md` com data, fonte, resultados de top/temporada/gênero, detalhes do anime 1, ID `999999999`, teste offline simulado, teste de cache e limitações conhecidas; verificar que cada item do checklist tem resultado registrado.
- [ ] 5.3 Executar a validação real da API (listas, gêneros, detalhes, erros) e conferir que nenhum campo bruto da Tenrai aparece nos objetos retornados; verificar com `grep -R "jikan.moe" src` que não há chamadas ativas à Jikan.
- [ ] 5.4 Revisar `git status --short` e o diff final para garantir que apenas `src/api`, `.env.example`, `.gitignore`, README e `docs/validacao-api.md` entraram no commit 2, sem `node_modules`, `dist` ou `.env`.

## Workflow follow-up

- O usuário cria o commit 1 (`chore: configs`) e o commit 2 (`feat(api): ...`) manualmente; o agente não executa `git commit`.
- Após os commits, o usuário faz push e abre o PR para `main`.
