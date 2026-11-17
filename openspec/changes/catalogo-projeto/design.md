# Design

## Context

Ver `proposal.md` — Why. O projeto tem duas changes ativas: `catalogo-de-animes` (API, tarefa 2) e esta, que cobre arquitetura compartilhada, telas, favoritos e efeito. O `package.json` já traz `react`, `react-dom`, `react-router-dom`, `json-server` e `oxlint`; não há biblioteca de estado, de dados ou de animação. O `db.json` ainda não existe, `src/pages` e `src/components` estão vazios e o `App.jsx` ainda é o template do Vite.

## Goals / Non-Goals

**Goals:**

- Um contrato único e um caminho claro de dados: Tenrai → `src/api` → telas.
- Favoritos persistentes no JSON Server, compartilhados por Context.
- Telas independentes entre si, para que uma falha de lista não derrube a página.
- Efeito de favoritar sem dependência nova e acessível.

**Non-Goals:**

- Autenticação, múltiplos usuários ou sincronização entre navegadores.
- Busca textual, paginação infinita, filtros combinados ou recomendações.
- Testes automatizados com Vitest/Testing Library; a validação é manual e por scripts.
- Backend próprio ou banco de dados real.

## Decisions

### Fluxo de dados em três camadas

```text
Tenrai (leitura)  →  src/api (normaliza + cache + erros)  →  páginas/componentes
JSON Server (escrita)  →  src/api/favoritos.js  →  FavoritosContext  →  páginas
```

As páginas nunca chamam `fetch` diretamente. A API do catálogo pertence à change `catalogo-de-animes`; esta change consome a fachada `src/api/index.js`.

**Alternativa descartada:** cada página buscar direto na Tenrai. Duplicaria tratamento de erro, cache e mapeamento.

### Contrato como fronteira

O contrato `{ id, titulo, capa, ano, diretor, sinopse, ondeAssistir }` é a única forma que as telas conhecem. `ondeAssistir` é `{ nome, url }[]`. Listas podem trazer `diretor: null` e `ondeAssistir: []`; a página de detalhes é a única que promete os dois preenchidos quando existirem.

**Alternativa descartada:** usar o objeto cru da Tenrai e adaptar em cada tela. geraria divergência entre Home, Detalhes e Favoritos.

### Favorito como snapshot do contrato

Cada favorito é gravado como um objeto completo no contrato, usando `id` como chave. Adicionar é `POST /favoritos`; remover é `DELETE /favoritos/{id}`; listar é `GET /favoritos`. A deduplicação é feita no cliente antes do POST e na leitura por `id`.

**Por quê:** a página de favoritos funciona offline do catálogo e sem uma segunda consulta por item. O custo é que título/capa podem ficar defasados; aceitável para o escopo.

**Alternativa descartada:** gravar só o `id` e buscar os detalhes na Tenrai ao abrir a página. Gastaria mais requisições e quebraria a página se o catálogo estivesse fora do ar.

### Context com atualização otimista e rollback

`FavoritosProvider` carrega os favoritos uma vez no início, mantém a lista e expõe `favoritos`, `ehFavorito(id)`, `adicionar(anime)`, `remover(id)`, `carregando` e `erro`. Adicionar/remover atualiza a lista imediatamente; se a chamada falhar, restaura o estado anterior e expõe a mensagem.

**Por quê:** o coração responde na hora e o erro não deixa a UI mentindo sobre o que foi persistido.

**Alternativa descartada:** esperar a resposta do JSON Server para atualizar. Deixaria o clique lento e sujeito a duplo clique.

### Rota e composição das telas

`react-router-dom` com `createBrowserRouter` ou `<BrowserRouter>` + `<Routes>`, usando um `Layout` com `<Outlet />`:

| Rota | Página | Dados |
|---|---|---|
| `/` | Home | listas top, temporada e gênero |
| `/anime/:id` | Detalhes | detalhes por id |
| `/favoritos` | Favoritos | Context de favoritos |
| `*` | Não encontrado | — |

A Home dispara as listas em paralelo e trata cada resultado separadamente (`Promise.allSettled` ou estados independentes), para que uma falha não apague as demais seções.

### Estados de UI reutilizáveis

Componentes `EstadoCarregando`, `EstadoVazio` e `EstadoErro` (com `onRetry`) padronizam as seções. A página de detalhes diferencia `NAO_ENCONTRADO` de erro de rede/servidor usando os códigos da API.

### Efeito sem biblioteca de animação

`EfeitoFavorito` é um overlay `position: fixed` com `pointer-events: none`, animação CSS curta (até 1s) disparada por uma chave/contador. `prefers-reduced-motion: reduce` remove a animação e mantém apenas a confirmação textual. O botão tem `aria-pressed`/nome acessível e a mudança é anunciada em uma região `aria-live`.

**Alternativa descartada:** framer-motion. Adicionaria dependência para um efeito simples.

### JSON Server e `db.json`

`db.json` começa como `{ "favoritos": [] }` e é servido por `npm run api` na porta 3001. A URL dos favoritos é fixa em `http://localhost:3001` no desenvolvimento, isolada em `src/api/favoritos.js` para permitir troca futura por variável de ambiente.

### Validação e branches

Cada integrante trabalha na sua branch e abre PR para `main`; Luana revisa e faz o merge. A integração final roda `npm run lint`, `npm run build`, `npm run api` e o checklist de `docs/validacao.md`. O relatório registra data, fonte, cenários testados e limitações.

## Risks / Trade-offs

- **Tenrai em beta e limite de 4 req/s / 120 req/min** → cache e erros tipados na API; estados de erro nas telas.
- **JSON Server v1 beta pode mudar comportamento de POST/DELETE** → camada `favoritos.js` isola os endpoints; validar os três verbos manualmente.
- **Snapshot de favorito pode ficar defasado** → aceitável; a página de detalhes sempre busca o dado atual.
- **Trabalho paralelo em arquivos compartilhados** → cada tarefa tem pasta/arquivo dono; `App.jsx` e `main.jsx` são da tarefa 1.
- **Efeito chamativo demais ou inacessível** → duração máxima de 1s, `pointer-events: none` e respeito a `prefers-reduced-motion`.
- **Jikan no enunciado vs Tenrai na prática** → decisão registrada na spec e no README; confirmar com o professor antes da entrega.

## Migration Plan

1. Grupo aprova esta spec e a spec da API.
2. Tarefa 1 entrega commit `chore: configs` com rotas, layout, `db.json`, README e `.env.example`.
3. Tarefa 2 entrega `src/api` e fixtures (change `catalogo-de-animes`).
4. Tarefas 3–6 implementam Home, Detalhes, Favoritos e Efeito em branches próprias.
5. Integração: validar contrato entre branches, rodar lint/build e preencher o checklist/Reflexão.

**Rollback:** cada tarefa é um PR independente; reverter um PR não afeta a API nem as demais telas. Como não há dados de produção, não há migração de dados.
