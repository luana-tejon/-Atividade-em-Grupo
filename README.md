# Anime Lista

## Projeto e integrantes

**Tema:** catálogo de animes.

**Problema que resolve:** quem gosta de anime costuma ter dificuldade para descobrir o que assistir e para saber onde assistir. Este projeto reúne listas de animes com capa, ano, diretor e introdução, mostra em quais plataformas cada anime está disponível e permite favoritar os preferidos.

**Funcionalidades:**
- Várias listas de animes, cada uma com capas e informações básicas.
- Página de detalhes com ano, diretor, introdução e onde assistir.
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

O grupo escolheu o OpenSpec porque ele é leve: cada mudança vira uma proposta com specs, design e tarefas, tudo em arquivos versionados no repositório. [Ajustem este parágrafo com o motivo real do grupo.]

## Como rodar

Pré-requisito: Node.js instalado.

```bash
# 1. Clonar o repositório
git clone <https://github.com/luana-tejon/-Atividade-em-Grupo.git>
cd anime-lista

# 2. Instalar as dependências
npm install

# 3. Subir a API de dados (JSON Server, porta 3001)
npm run api

# 4. Em outro terminal, subir o front-end
npm run dev
```

O front-end abre em `http://localhost:5173` (porta padrão do Vite).

**APIs utilizadas:**
- **Jikan API** (API pública do MyAnimeList): catálogo, capas, detalhes e onde assistir.
- **JSON Server** (`db.json`): favoritos do usuário.

## Onde estão os artefatos

Os artefatos gerados pelo OpenSpec estão na pasta `openspec/`.

| Artefato | Caminho |
|---|---|
| Spec | `openspec/<caminho-da-spec>` |
| Proposta | `openspec/<caminho-da-proposta>` |
| Design / plano | `openspec/<caminho-do-design>` |
| Tarefas | `openspec/<caminho-das-tarefas>` |

**Quem fez cada tarefa:**

| Integrante | Tarefas |
|---|---|
| Luana Tejon | Base e integração: repositório, rotas, layout, README |
| Lucas Peres | API do catálogo (Jikan) em `src/api` |
| Wagner Reis | Listas e cards na página inicial |
| João Gomes | Página de detalhes do anime |
| Gustavo Rucaglia | Favoritos (coração, API e página) |
| Vitória Ferreira | Efeito ao favoritar e validação |

## Reflexão

**Que decisão o agente teria tomado sozinho e a spec evitou?**
[A preencher no final.]

**Que inconsistência a validação encontrou? Estava na spec ou no código?**
[A preencher no final.]

**Como o framework ajudou (ou atrapalhou) a coordenação do grupo?**
[A preencher no final.]

**O que fariam diferente com outro framework?**
[A preencher no final.]