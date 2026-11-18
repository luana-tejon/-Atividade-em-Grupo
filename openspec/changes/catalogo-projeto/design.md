# Design

## Context

Ver `proposal.md` — Why. O projeto tem duas changes ativas: `catalogo-de-animes` (API, tarefa 2) e esta, que cobre arquitetura compartilhada, telas, favoritos e efeito. O `package.json` já traz `react`, `react-dom`, `react-router-dom`, `json-server` e `oxlint`; não há biblioteca de estado, de dados ou de animação. Rotas, layout, Home, cards e Detalhes já estão implementados; `src/pages/Favoritos.jsx` ainda é um placeholder, `AnimeCard` é inteiramente um `<Link>` sem coração e não existem `src/api/favoritos.js` nem `src/context/`.

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

### Identificador no JSON Server

O `json-server@1.0.0-beta.15` sempre gera o `id` no `POST` (`{ ...data, id: randomId() }`) e não faz upsert por `PUT`/`PATCH`. Por isso o registro gravado é `{ id: <gerado pelo servidor>, animeId: <mal_id>, titulo, capa, ano, diretor, sinopse, ondeAssistir }`.

`src/api/favoritos.js` é a única camada que conhece esse formato:

- **Leitura:** converte cada registro para o contrato com `id = Number(animeId)`, descarta registros sem `animeId` válido e devolve também a relação `animeId → [ids de registro]`.
- **Adição:** envia o snapshot sem `id` e com `animeId`; devolve o contrato e o `id` de registro criado.
- **Remoção:** recebe os `ids` de registro do anime e faz `DELETE /favoritos/{idRegistro}` para cada um, limpando também duplicatas antigas. `404` em um registro já apagado é tratado como sucesso.

Fora dessa camada, o `id` é sempre o número do contrato. O Context guarda a relação `animeId → ids de registro` para remover.

As funções lançam o `ApiError` de `src/api/errors.js` com código próprio (`FAVORITOS_INDISPONIVEL` em falha de rede/servidor), para não reaproveitar mensagens do catálogo.

**Alternativa descartada:** gravar `id: String(mal_id)`. Não funciona na versão travada, porque o servidor sobrescreve o `id` enviado.

### Context com atualização otimista e rollback

`src/context/FavoritosContext.jsx` exporta `FavoritosProvider` e o hook `useFavoritos()`. O Provider carrega os favoritos uma vez ao montar e expõe:

| Campo | Uso |
|---|---|
| `favoritos` | lista no contrato, deduplicada por `id`, na ordem de inserção |
| `ehFavorito(id)` | consulta usada pelos corações |
| `alternar(anime)` | adiciona ou remove; é o que o coração chama |
| `adicionar(anime)` / `remover(id)` | operações explícitas |
| `recarregar()` | nova tentativa após falha de listagem |
| `pendentes` | `Set` de ids com gravação em andamento (bloqueia duplo clique) |
| `carregando` / `erro` | estado da listagem |
| `erroGravacao` / `limparErroGravacao()` | mensagem do último erro de POST/DELETE |
| `ultimoAdicionado` | `{ id, chave, origem }` da última adição, usado pelo efeito |

Adicionar/remover atualiza a lista imediatamente; se a chamada falhar, restaura o estado anterior e preenche `erroGravacao`. `ultimoAdicionado` é atualizado no clique (antes da resposta), por isso o efeito não confirma a gravação.

O Provider envolve `<App />` em `src/main.jsx`, dentro do `BrowserRouter`. É a única alteração de arquivo da tarefa 1 feita pela tarefa 5.

**Por quê:** o coração responde na hora e o erro não deixa a UI mentindo sobre o que foi persistido.

**Alternativa descartada:** esperar a resposta do JSON Server para atualizar. Deixaria o clique lento e sujeito a duplo clique.

### Botão de coração

`src/components/BotaoFavorito.jsx` recebe `anime` (contrato) e usa `useFavoritos()`. Renderiza `<button type="button" aria-pressed>` com ♥/♡ (`aria-hidden`) e `aria-label` "Adicionar/Remover {título} dos favoritos". Fica `disabled` quando `carregando`, `erro` ou o id está em `pendentes`; nesse caso o `title` explica o motivo. No clique, chama `alternar(anime)` e informa ao efeito a posição do botão (`getBoundingClientRect`) via `origem`.

No `AnimeCard`, o `<article>` passa a ter o `<Link>` e o `BotaoFavorito` como irmãos. O botão fica posicionado sobre o canto da capa com `position: absolute`. Assim não há `<button>` dentro de `<a>` e o clique não navega. Na página de detalhes, o botão fica no cabeçalho, ao lado do título.

### Lista e página de favoritos

- **Navegação:** `Layout` lê `favoritos.length` e mostra um selo no link "Favoritos" quando o valor é > 0; `aria-label` "Favoritos, N animes".
- **Página `/favoritos`:** `carregando` → `EstadoCarregando`; `erro` → `EstadoErro` com `mensagem` própria e `onRetry={recarregar}`; lista vazia → `EstadoVazio` com link para `/`; caso contrário, contador "N animes" e a mesma grade de `AnimeCard` da Home.
- **`EstadoErro`:** ganha prop opcional `mensagem`, que tem prioridade sobre o texto derivado de `codigo`. A mudança é retrocompatível com Home e Detalhes.
- **Erro de gravação:** `AvisoFavoritos`, montado no `Layout`, mostra `erroGravacao` em `role="alert"` com botão de fechar e some após ~4s.

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

`EfeitoFavorito` é montado uma única vez no `Layout`, observa `ultimoAdicionado` do Context e usa `chave` como `key` para reiniciar a animação a cada adição. O overlay é `position: fixed` com `pointer-events: none`, posicionado em `origem` (centro do coração acionado). O visual é composto por 5–6 corações/brilhos em `@keyframes` (escala + deslocamento + opacidade) e a onomatopeia "好き!", com duração total ≤ 1s. Ao fim (`animationend` ou timeout de 1s), o elemento é desmontado. `prefers-reduced-motion: reduce` remove a animação e mantém apenas a confirmação textual. O botão tem `aria-pressed`/nome acessível e a mudança é anunciada na região `aria-live="polite"` do próprio `EfeitoFavorito` ("{título} adicionado aos favoritos"). Remoções não alteram `ultimoAdicionado`, então não disparam o efeito.

**Alternativa descartada:** framer-motion. Adicionaria dependência para um efeito simples.

### JSON Server e `db.json`

`db.json` começa como `{ "favoritos": [] }` e é servido por `npm run api` na porta 3001. A URL dos favoritos é fixa em `http://localhost:3001` no desenvolvimento, isolada em `src/api/favoritos.js` para permitir troca futura por variável de ambiente.

### Validação e branches

Cada integrante trabalha na sua branch e abre PR para `main`; Luana revisa e faz o merge. A integração final roda `npm run lint`, `npm run build`, `npm run api` e o checklist de `docs/validacao.md`. O relatório registra data, fonte, cenários testados e limitações.

## Risks / Trade-offs

- **Tenrai em beta e limite de 4 req/s / 120 req/min** → cache e erros tipados na API; estados de erro nas telas.
- **JSON Server v1 beta pode mudar comportamento de POST/DELETE** → camada `favoritos.js` isola os endpoints; validar os três verbos manualmente.
- **Snapshot de favorito pode ficar defasado** → aceitável; a página de detalhes sempre busca o dado atual.
- **`id` gerado pelo JSON Server vs `mal_id` do contrato** → `animeId` no registro e conversão isolada em `favoritos.js`; validar com `curl` que o `DELETE` pelo `id` de registro remove o favorito gravado pelo app.
- **JSON Server adiciona `"$schema"` ao `db.json` na primeira escrita** → inofensivo; não commitar essa mudança se não for desejada.
- **Alteração em `AnimeCard` e `Layout`, que são de outras tarefas** → mudança mínima (inserir `BotaoFavorito`, selo e montar `AvisoFavoritos`/`EfeitoFavorito`), feita em PR próprio e revisada pelos donos.
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
