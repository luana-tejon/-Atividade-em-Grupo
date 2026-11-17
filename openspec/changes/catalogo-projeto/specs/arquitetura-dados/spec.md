# Spec Delta

## Purpose

Define as fontes de dados, o contrato único do anime e a separação entre leitura do catálogo e escrita dos favoritos, para que todos os integrantes construam sobre o mesmo formato.

## ADDED Requirements

### Requirement: Fonte pública do catálogo

O app SHALL obter os dados do catálogo da Tenrai (`https://api.tenrai.org/v1`), compatível com o schema Jikan v4. A Jikan pública, descontinuada em 01/10/2026, não SHALL ser usada como fonte.

#### Scenario: Catálogo carregado pela Tenrai

- **WHEN** o app solicita listas, detalhes, equipe ou streaming de animes
- **THEN** os dados vêm da Tenrai e usam `mal_id` como identificador

#### Scenario: Nenhuma dependência ativa da Jikan

- **WHEN** o código do app é inspecionado ou executado
- **THEN** não existe chamada ativa ao domínio da Jikan pública

### Requirement: Contrato único do anime

Todo anime consumido pelas telas SHALL usar o contrato `{ id, titulo, capa, ano, diretor, sinopse, ondeAssistir }`, com `ondeAssistir` como lista de `{ nome, url }`. Nenhum componente SHALL depender de campos brutos da fonte pública.

#### Scenario: Objeto no contrato

- **WHEN** um anime é entregue a uma tela
- **THEN** ele contém exatamente as chaves `id`, `titulo`, `capa`, `ano`, `diretor`, `sinopse` e `ondeAssistir`

#### Scenario: Campos opcionais ausentes

- **GIVEN** que a fonte não informa ano, diretor ou streaming
- **WHEN** o anime é normalizado
- **THEN** `ano` e `diretor` ficam `null`, `ondeAssistir` fica `[]` e a tela continua funcional

#### Scenario: Itens de lista sem dados de detalhe

- **WHEN** uma tela recebe um anime vindo de uma listagem
- **THEN** ela aceita `diretor: null` e `ondeAssistir: []`, pois esses dados só existem nos detalhes

### Requirement: Separação entre leitura e escrita

O catálogo SHALL ser somente leitura na Tenrai. Favoritos e listas próprias SHALL ser gravados no JSON Server, que SHALL usar `db.json` com a coleção `favoritos` e responder na porta 3001.

#### Scenario: Favorito gravado

- **WHEN** o usuário favorita um anime
- **THEN** a gravação acontece no JSON Server, sem tentativa de escrita na Tenrai

#### Scenario: JSON Server indisponível

- **GIVEN** que o JSON Server não está em execução
- **WHEN** o app tenta listar ou gravar favoritos
- **THEN** o catálogo continua carregando e a tela de favoritos mostra uma mensagem de erro

### Requirement: Configuração da fonte

A URL da API do catálogo SHALL vir de `VITE_ANIME_API_URL`, com fallback para `https://api.tenrai.org/v1` quando a variável não estiver definida.

#### Scenario: Variável definida

- **GIVEN** que `VITE_ANIME_API_URL` está definida
- **WHEN** o app monta uma requisição de catálogo
- **THEN** ele usa a URL configurada

#### Scenario: Variável ausente

- **GIVEN** que `VITE_ANIME_API_URL` não está definida
- **WHEN** o app monta uma requisição de catálogo
- **THEN** ele usa a URL pública da Tenrai

### Requirement: Fixtures para desenvolvimento paralelo

O projeto SHALL disponibilizar fixtures no contrato do anime para que as telas possam ser desenvolvidas antes da API real estar pronta. As fixtures não SHALL ser usadas como fallback automático da API.

#### Scenario: Uso das fixtures

- **WHEN** um integrante precisa montar uma tela sem depender da API
- **THEN** ele encontra dados de exemplo no contrato, incluindo anime completo, sem diretor e sem streaming

#### Scenario: Falha real da API

- **GIVEN** que a API do catálogo falha
- **WHEN** uma tela solicita dados reais
- **THEN** a falha é exibida como erro e as fixtures não substituem a resposta silenciosamente
