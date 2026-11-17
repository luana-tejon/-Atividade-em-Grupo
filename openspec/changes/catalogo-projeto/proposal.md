# Proposal

## Why

O grupo precisa de uma spec única para o produto inteiro antes de dividir a implementação. Hoje só a API do catálogo está especificada, e as telas, os favoritos e o efeito de favoritar ficariam sem contrato comum. Uma spec de projeto evita que cada integrante invente um formato de dados, uma fonte ou uma regra de favorito diferente.

## What Changes

- Registrar a arquitetura de dados do projeto: Tenrai para leitura do catálogo, JSON Server para escrita dos favoritos e contrato único do anime.
- **BREAKING** em relação ao enunciado original: a Jikan pública foi descontinuada em 01/10/2026 e é substituída pela Tenrai (`https://api.tenrai.org/v1`), compatível com o schema Jikan v4.
- Especificar a navegação e o layout base: rotas `/`, `/anime/:id`, `/favoritos` e página de não encontrado.
- Especificar a página inicial com listas de animes (top, temporada e gênero), o componente de card e os estados de carregando, vazio e erro.
- Especificar a página de detalhes com capa, ano, diretor, sinopse, onde assistir e tratamento de anime não encontrado.
- Especificar os favoritos: coração, estado global, API no JSON Server, página “Meus favoritos”, regra de duplicado e erro de gravação.
- Especificar o efeito visual ao favoritar e sua acessibilidade.
- Documentar a divisão de responsabilidades por integrante e os critérios de aceitação de cada tarefa.

**Fora do escopo:** implementação nesta change. A execução continua separada por integrante e por branch. A API do catálogo já tem spec própria em `catalogo-de-animes`; esta change cobre a arquitetura compartilhada, as telas, os favoritos e o efeito.

## Capabilities

### New Capabilities

- `arquitetura-dados`: fontes de dados, contrato único do anime, configuração de ambiente e separação entre leitura do catálogo e escrita de favoritos.
- `interface-catalogo`: layout, rotas, página inicial com listas e cards, estados de carregamento/vazio/erro e página de detalhes com “onde assistir”.
- `favoritos`: persistência no JSON Server, estado global, adicionar/remover/listar, regra de duplicado, página de favoritos e erros de gravação.
- `efeito-favoritar`: efeito visual disparado ao favoritar, sem bloquear a gravação e respeitando redução de movimento.

### Modified Capabilities

Nenhuma. A capability `catalogo-animes` está sendo introduzida pela change `catalogo-de-animes` e não existe em `openspec/specs`.

## Impact

- **Rotas e layout:** `src/main.jsx`, `src/App.jsx`, `src/components/Layout.jsx`, `src/pages/*`.
- **Catálogo:** `src/pages/Home.jsx`, `src/components/AnimeCard.jsx` e componentes de estado; consome `src/api` (change `catalogo-de-animes`).
- **Detalhes:** `src/pages/Detalhes.jsx`; consome `src/api`.
- **Favoritos:** `src/api/favoritos.js`, `src/context/FavoritosContext.jsx`, `src/pages/Favoritos.jsx`, `db.json`.
- **Efeito:** `src/components/EfeitoFavorito.jsx` e CSS correspondente.
- **Documentação:** README (arquitetura, como rodar, divisão de tarefas, reflexão) e checklist de validação.
- **Dependências:** nenhuma nova além do que já está no `package.json` (`react-router-dom` e `json-server`).

## Equipe e responsabilidades

| # | Papel | Tarefas | Pasta |
|---|---|---|---|
| 1 | Base e integração | Repositório, Vite, OpenSpec, rotas, layout base, JSON Server, regras de branch/PR, revisão de merges, README | raiz, `src/pages` (estrutura) |
| 2 | API do catálogo | Cliente Tenrai, listas, detalhes, diretor, streaming, contrato, erros, limite e cache | `src/api` |
| 3 | Listas e cards | Página inicial com listas, `AnimeCard`, estados de carregando, vazio e erro | `src/pages/Home`, `src/components` |
| 4 | Detalhes do anime | Página com capa, ano, diretor, sinopse, “onde assistir” e anime não encontrado | `src/pages/Detalhes` |
| 5 | Favoritos | Coração, API de favoritos no JSON Server, Context, página “Meus favoritos”, duplicado e erro de gravação | `src/api/favoritos.js`, `src/pages/Favoritos` |
| 6 | Efeito e validação | Efeito ao favoritar, critérios de aceitação, checklist/relatório, seção “Reflexão” | `src/components/EfeitoFavorito` |

O contrato único é o ponto de integração: `{ id, titulo, capa, ano, diretor, sinopse, ondeAssistir[] }`, com `ondeAssistir` como lista de `{ nome, url }`. Enquanto a API real não estiver pronta, os integrantes usam as fixtures de `src/api/fixtures`.
