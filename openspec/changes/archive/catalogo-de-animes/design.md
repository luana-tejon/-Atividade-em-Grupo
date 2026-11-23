# Design

## Context

Ver `proposal.md` — Why. O projeto é um app React + Vite sem camada de dados: `src/api` está vazio e ainda não há spec em `openspec/specs`. A Tenrai responde no schema Jikan v4 (`data`, `pagination`, `mal_id`), tem limite público de 4 req/s e 120 req/min, e pode devolver `Retry-After` em `429`. O enunciado original citava `jikan.js`, mas a Jikan pública foi descontinuada em 01/10/2026.

## Goals / Non-Goals

**Goals:**

- Uma única porta de entrada (`src/api/index.js`) para as telas, independente do provedor.
- Normalização completa na fronteira: nenhum campo bruto da Tenrai chega às páginas.
- Falhas previsíveis e diagnosticáveis, com cache e deduplicação suficientes para o uso de um catálogo.
- Fixtures no contrato para os outros integrantes trabalharem em paralelo.

**Non-Goals:**

- Telas, rotas, layout e favoritos funcionais.
- Persistência de cache entre sessões ou entre abas.
- Paginação infinita, busca textual completa e filtros avançados.
- Testes automatizados com frameworks novos; a validação é manual e por script.

## Decisions

### Estrutura de arquivos

```text
src/api/
├── errors.js            # ApiError + códigos
├── tenrai.js            # transporte: URL, timeout, cache, retry, erros
├── animes.js            # endpoints + mapeamento para o contrato
├── index.js             # fachada pública
├── jikan.js             # reexporta animes.js (compatibilidade com o enunciado)
└── fixtures/
    └── animes.js        # dados de desenvolvimento no contrato
```

**Por quê:** separa transporte (Tenrai) de domínio (animes). Trocar de provedor exige mudar `tenrai.js`, não as telas. `jikan.js` existe apenas para atender ao nome pedido no enunciado, sem manter duas implementações.

**Alternativa descartada:** um único `jikan.js` com tudo. Ficaria correto para a entrega, mas acoplaria o domínio ao provedor e dificultaria a leitura.

### `fetch` nativo + `Map` em vez de bibliotecas

**Decisão:** usar `fetch`, `AbortController` e `Map`. Sem axios, React Query ou SWR.

**Por quê:** zero dependências novas, funciona no Vite e cobre o escopo. React Query seria melhor para cache de UI, mas isso é responsabilidade das telas.

### Cache em memória com TTL por tipo

| Consulta | TTL |
|---|---|
| Listas e gêneros | 5 minutos |
| Detalhes | 15 minutos |

A chave do cache é a URL completa. Cada entrada guarda valor e expiração. O cache é limpo por `limparCache()` para testes. Entradas expiradas são removidas na leitura.

**Por quê:** detalhes mudam pouco; listas de temporada e topo mudam com mais frequência. Cinco minutos reduzem o consumo do limite sem deixar o catálogo visivelmente velho.

**Alternativa descartada:** sem cache. O limite de 120 req/min e o desenvolvimento com recarregamentos constantes tornariam a experiência frágil.

### Deduplicação de requisições em andamento

Um `Map` de promessas por chave evita chamadas concorrentes idênticas (por exemplo, Home montando duas vezes). A promessa é removida ao terminar, com sucesso ou erro.

### Timeout e cancelamento

Timeout de 12 segundos via `AbortController`, combinado com o `signal` opcional da tela. Cancelamento do chamador vira `ABORTADO`; timeout vira `ERRO_REDE`. A distinção importa porque a tela ignora `ABORTADO`, mas mostra erro em timeout.

### Modelo de erros

`ApiError` carrega `codigo`, `status` e `retryAfter`. Os códigos são constantes exportadas:

`NAO_ENCONTRADO`, `LIMITE_REQUISICOES`, `ERRO_REDE`, `ERRO_SERVIDOR`, `ERRO_API`, `RESPOSTA_INVALIDA`, `ID_INVALIDO`, `ABORTADO`.

O mapeamento de status HTTP fica no transporte:

| Situação | Código |
|---|---|
| 404 | `NAO_ENCONTRADO` |
| 429 | `LIMITE_REQUISICOES` |
| 5xx | `ERRO_SERVIDOR` |
| Outros não-2xx | `ERRO_API` |
| JSON inválido | `RESPOSTA_INVALIDA` |

**Por quê:** a tela decide entre “não encontrado”, “muitas requisições” e “catálogo fora do ar” sem inspecionar status HTTP.

### Política de `429`

Ler `Retry-After` (segundos ou data HTTP). Se a espera for de até 2 segundos, repetir uma única vez; caso contrário, lançar `LIMITE_REQUISICOES` com `retryAfter`. Nunca repetir em loop.

### Mapeamento do contrato

| Campo | Origem | Regra |
|---|---|---|
| `id` | `mal_id` | inteiro positivo; item inválido é descartado |
| `titulo` | `title_english` → `title` | usa inglês se não vazio; senão original; senão `''` |
| `capa` | `images.jpg.large_image_url` → `webp.large_image_url` → `jpg.image_url` | primeira URL não vazia; senão `''` |
| `ano` | `year` → `aired.prop.from.year` | número ou `null` |
| `avaliacao` | `score` | número finito de 1 a 10, preservando a precisão; ausente ou inválido vira `null` |
| `diretor` | equipe (`/staff`) | nome da pessoa com posição exata `Director`; senão `null` |
| `sinopse` | `synopsis` | remove tags HTML, normaliza espaços; vazio vira `null` |
| `ondeAssistir` | `streaming` | `{ nome, url }`, descarta duplicados por nome e entradas sem URL |

**Diretor:** comparar a posição normalizada com `Director` (case-insensitive, trim), não `includes`. Assim `ADR Director` e `Animation Director` não são confundidos com o diretor principal.

**Listas:** retornam `diretor: null` e `ondeAssistir: []` porque a Tenrai não envia esses dados nas listagens. A `avaliacao`, porém, vem do `score` de cada item da própria listagem, sem requisição extra. Isso é esperado e documentado para as telas.

### Detalhes em duas chamadas

`obterDetalhes(id)` valida o ID e busca em paralelo `/anime/{id}/full` e `/anime/{id}/staff`. O `/full` já inclui `streaming`. Se `/staff` falhar (qualquer erro), a consulta segue com `diretor: null`; se `/full` falhar com 404, propaga `NAO_ENCONTRADO`.

**Por quê:** paralelizar reduz a latência; tolerar falha da equipe evita que um problema secundário derrube a página.

### Fixtures sem fallback automático

`src/api/fixtures/animes.js` exporta `ANIMES_FIXTOS` e `obterAnimeFixo(id)`. As páginas podem importar em desenvolvimento, mas a API real nunca cai para fixture silenciosamente.

**Por quê:** um fallback automático esconderia falhas de integração durante a validação.

## Risks / Trade-offs

- **Tenrai em beta e instável** → cache curto, erros tipados e validação manual documentada; a UI sempre tem estado de erro.
- **Limite de 4 req/s / 120 req/min** → cache + deduplicação + uma única retentativa em `429`.
- **Streaming varia por região e pode mudar** → links são externos e a UI deve tratar lista vazia.
- **Cache em memória não sobrevive a recarregar a página** → aceitável para o escopo; evita complexidade de persistência.
- **`title_english` ausente em muitos animes** → fallback para o título original mantém a lista utilizável.
- **Duas chamadas nos detalhes** → uma falha de equipe não bloqueia a página; custo aceitável dentro do limite.

## Migration Plan

1. Criar `.env.example` e ajustar `.gitignore` (commit 1).
2. Implementar `errors.js`, `tenrai.js`, `animes.js`, `index.js`, `jikan.js` e fixtures (commit 2).
3. Validar com scripts Node e `npm run lint` / `npm run build`.
4. Atualizar README e `docs/validacao-api.md`; sem migração de dados, pois não há dados persistidos.

**Rollback:** remover `src/api` e reverter `.env.example`/README; como as telas ainda não consomem a API, não há impacto em produção.
