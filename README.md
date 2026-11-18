# Anime Lista

## Projeto e integrantes

**Tema:** catálogo de animes.

**Problema que resolve:** quem gosta de anime costuma ter dificuldade para descobrir o que assistir e para saber onde assistir. Este projeto reúne listas de animes com capa, ano, diretor e sinopse, mostra em quais plataformas cada anime está disponível e permite favoritar os preferidos.

**Funcionalidades:**

- Várias listas de animes, cada uma com capas e informações básicas.
- Página de detalhes com ano, diretor, sinopse e onde assistir.
- Favoritar um anime com um coração, com um efeito na tela inspirado em anime.
- Página com os animes favoritos.
- Tratamento de erros (API fora do ar, busca sem resultado, falha ao favoritar).

**Integrantes:**

- Luana Tejon Aranega - RA:01252085
- Wagner Reis - RA:01252090
- Lucas Peres - RA:01252009
- Vitória Ferreira - RA:01252130
- João Vitor - RA:01252032
- Gustavo Rucaglia - RA:01252040

## Framework utilizado

**OpenSpec.**

O grupo escolheu o OpenSpec porque cada mudança vira uma proposta com especificação, design e tarefas, tudo em arquivos versionados no repositório. As specs ficam em `openspec/changes/<change>/specs/` enquanto a mudança está em andamento; ao arquivar, o OpenSpec consolida o resultado em `openspec/specs/`.

## Arquitetura

O projeto separa leitura e escrita de dados:

| Uso | Fonte | Observação |
|---|---|---|
| Catálogo: listas, detalhes, diretor e streaming | Tenrai | API pública, somente leitura |
| Favoritos e listas próprias | JSON Server | grava em `db.json`, porta 3001 |

> A Jikan pública foi descontinuada em 01/10/2026. A Tenrai (`https://api.tenrai.org/v1`) é compatível com o schema Jikan v4 e usa `mal_id` como identificador. A troca está registrada nas specs do projeto.

### Contrato do anime

Todos os integrantes usam o mesmo objeto:

```js
{
  id: 1,
  titulo: 'Nome do anime',
  capa: 'https://exemplo.com/capa.jpg',
  ano: 2024,
  diretor: 'Nome do diretor',
  sinopse: 'Texto da sinopse.',
  ondeAssistir: [
    { nome: 'Crunchyroll', url: 'https://www.crunchyroll.com/' }
  ]
}
```

`ondeAssistir` é uma lista de `{ nome, url }`. Campos sem dado viram `null`; a ausência de plataformas vira `[]`. As listas podem trazer `diretor: null` e `ondeAssistir: []`, porque esses dados só existem nos detalhes.

### Estrutura de pastas

```text
src/
├── api/          # cliente Tenrai, listas, detalhes, erros e cache
├── components/   # layout, cards, estados e efeito
├── pages/        # Home, Detalhes, Favoritos e 404
├── App.jsx
└── main.jsx
openspec/         # proposta, specs, design e tarefas
docs/             # checklists de validação
db.json           # favoritos do JSON Server
```

## Como rodar

Pré-requisito: Node.js instalado.

```bash
# 1. Clonar o repositório
git clone https://github.com/luana-tejon/-Atividade-em-Grupo.git
cd -Atividade-em-Grupo

# No Git Bash, o nome da pasta começa com hífen. Se o cd falhar, use:
# cd -- -Atividade-em-Grupo

# 2. Instalar as dependências
npm install

# 3. Subir a API de dados (JSON Server, porta 3001)
npm run api

# 4. Em outro terminal, subir o front-end
npm run dev
```

O front-end abre em `http://localhost:5173` (porta padrão do Vite). O JSON Server responde em `http://localhost:3001`.

### Variáveis de ambiente

A URL do catálogo vem de `VITE_ANIME_API_URL` e tem fallback para `https://api.tenrai.org/v1`. Para trocar a URL, copie `.env.example` para `.env.local` e ajuste o valor:

```bash
cp .env.example .env.local
```

No Windows, use `copy .env.example .env.local`.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o front-end com Vite |
| `npm run api` | Sobe o JSON Server com `db.json` na porta 3001 |
| `npm run lint` | Roda o oxlint |
| `npm run build` | Gera a versão de produção |
| `npm run preview` | Pré-visualiza o build |

## API do catálogo

A camada `src/api` concentra o acesso à Tenrai e expõe:

```js
import {
  listarTopAnimes,
  listarTemporadaAtual,
  listarPorGenero,
  listarGeneros,
  obterDetalhes,
} from './api'
```

- listas de mais populares, temporada atual e por gênero;
- lista de gêneros disponíveis;
- detalhes do anime, com diretor e onde assistir;
- mapeamento para o contrato único;
- erros tipados, limite de requisições e cache simples.

As listas retornam `diretor: null` e `ondeAssistir: []`, porque a Tenrai só envia esses dados nos detalhes. A página de detalhes busca `/full` e `/staff` em paralelo; se `/staff` falhar, o anime ainda é exibido com `diretor: null`.

### Erros da API

| Código | Quando acontece |
|---|---|
| `NAO_ENCONTRADO` | Anime inexistente (404) |
| `LIMITE_REQUISICOES` | Limite da Tenrai excedido (429) |
| `ERRO_REDE` | Falha de conexão ou timeout |
| `ERRO_SERVIDOR` | Erro 5xx da Tenrai |
| `ERRO_API` | Outro status HTTP de erro |
| `RESPOSTA_INVALIDA` | JSON inválido ou formato inesperado |
| `ID_INVALIDO` | Identificador de anime ou gênero inválido |
| `ABORTADO` | Requisição cancelada pela tela |

As fixtures de `src/api/fixtures` permitem que as telas sejam desenvolvidas antes da API real. Elas não são fallback automático: se a API falhar, a tela mostra erro.

### Página de detalhes

A rota `/anime/:id` busca o anime pelo identificador da URL com `obterDetalhes(id, { signal })`, inclusive quando o usuário chega pela Home ou recarrega a página. A tela mostra capa, título, ano, diretor, sinopse e a seção “Onde assistir”, com link para voltar ao início. Enquanto consulta, exibe “Carregando detalhes do anime...”.

- Campos ausentes de ano, diretor ou sinopse aparecem como “Não informado”; título vazio vira “Título não informado”; capa ausente ou quebrada vira o espaço reservado “Capa não disponível”.
- Sem plataformas, a seção mostra “Nenhuma plataforma de streaming informada para este anime.”. Os links usam as URLs retornadas pela API e abrem em nova aba com `rel="noopener noreferrer"`.
- Identificadores inválidos (`/anime/abc`, `/anime/0`, `/anime/-1`, `/anime/1.5`) mostram “Anime não encontrado” sem chamar a API. Um ID válido e inexistente (`/anime/999999999`) recebe o mesmo estado a partir de `NAO_ENCONTRADO`.
- Falhas de rede, servidor, limite de requisições e resposta inválida exibem a mensagem do código correspondente com “Tentar novamente”, que refaz a consulta do ID atual. Cancelamentos por navegação são ignorados.
- Se a consulta de equipe falhar, os demais detalhes continuam visíveis com diretor “Não informado”.

## Onde estão os artefatos

| Artefato | Caminho |
|---|---|
| Proposta do projeto | `openspec/changes/catalogo-projeto/proposal.md` |
| Specs do projeto | `openspec/changes/catalogo-projeto/specs/` |
| Design do projeto | `openspec/changes/catalogo-projeto/design.md` |
| Tarefas do projeto | `openspec/changes/catalogo-projeto/tasks.md` |
| Proposta da API | `openspec/changes/catalogo-de-animes/proposal.md` |
| Spec da API | `openspec/changes/catalogo-de-animes/specs/catalogo-animes/spec.md` |
| Design da API | `openspec/changes/catalogo-de-animes/design.md` |
| Tarefas da API | `openspec/changes/catalogo-de-animes/tasks.md` |
| Checklist da API | `docs/validacao-api.md` |
| Checklist do projeto | `docs/validacao.md` (criado na validação final) |

## Quem faz o quê

| # | Integrante | Papel | Tarefas | Pasta |
|---|---|---|---|---|
| 1 | Luana Tejon | Base e integração | Repositório, Vite, OpenSpec, rotas, layout, JSON Server, regras de branch/PR, revisão dos merges, README | raiz, `src/pages` (estrutura) |
| 2 | Lucas Peres | API do catálogo | Cliente Tenrai, listas, detalhes, diretor, streaming, contrato, erros, limite e cache | `src/api` |
| 3 | Wagner Reis | Listas e cards | Página inicial com listas, `AnimeCard`, estados de carregando, vazio e erro | `src/pages/Home`, `src/components` |
| 4 | João Vitor | Detalhes do anime | Página com capa, ano, diretor, sinopse, “onde assistir” e anime não encontrado | `src/pages/Detalhes` |
| 5 | Gustavo Rucaglia | Favoritos | Coração, API de favoritos no JSON Server, Context, página “Meus favoritos”, duplicado e erro de gravação | `src/api/favoritos.js`, `src/pages/Favoritos` |
| 6 | Vitória Ferreira | Efeito e validação | Efeito ao favoritar, critérios de aceitação, checklist/relatório e seção “Reflexão” | `src/components/EfeitoFavorito` |

## Regras de branch e PR

- Uma branch por tarefa, com prefixo `feat/`, `fix/` ou `docs/`.
- Todo trabalho entra por PR para a `main`.
- A Luana revisa e faz o merge.
- Preservar os commits: usar merge commit ou rebase, sem squash.
- Não commitar `node_modules`, `dist`, `.env` ou `.env.local`.
- Cada PR descreve o que mudou, como testar e as limitações conhecidas.

## Estado atual

- [x] Base do projeto, rotas, layout e JSON Server
- [x] API do catálogo em `src/api` (Tenrai)
- [ ] Página inicial e cards
- [x] Página de detalhes
- [ ] Favoritos
- [ ] Efeito ao favoritar e validação final

## Validação

Antes de abrir um PR, rode:

```bash
npm run lint
npm run build
```

A validação da API está em `docs/validacao-api.md` e a validação final do projeto em `docs/validacao.md`.

## Reflexão

**Que decisão o agente teria tomado sozinho e a spec evitou?**
[A preencher no final.]

**Que inconsistência a validação encontrou? Estava na spec ou no código?**
[A preencher no final.]

**Como o framework ajudou (ou atrapalhou) a coordenação do grupo?**
[A preencher no final.]

**O que fariam diferente com outro framework?**
[A preencher no final.]
