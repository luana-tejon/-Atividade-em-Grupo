# Spec Delta

## Purpose

Define como o app obtém, normaliza e entrega os dados de animes vindos da Tenrai, incluindo listas, detalhes, diretor, streaming, cache e erros tipados, para que as telas consumam sempre o contrato do projeto.

## ADDED Requirements

### Requirement: Contrato normalizado do anime

A API do catálogo SHALL entregar todo anime no contrato `{ id, titulo, capa, ano, avaliacao, diretor, sinopse, ondeAssistir }`, sem expor campos brutos da Tenrai. `avaliacao` SHALL ser a média `score` da Tenrai como número finito de 1 a 10, preservando a precisão recebida, ou `null` quando ausente ou inválida. `ondeAssistir` SHALL ser uma lista de objetos `{ nome, url }`.

#### Scenario: Mapeamento de um anime completo

- **GIVEN** que a Tenrai retorna um anime com `mal_id`, título, imagens, ano, `score`, sinopse e streaming
- **WHEN** a API do catálogo normaliza o anime
- **THEN** o resultado contém `id` numérico, `titulo` em inglês com fallback para o original, `capa` com fallback entre imagens, `ano` numérico ou `null`, `avaliacao` igual ao `score`, `sinopse` sem HTML ou `null` e `ondeAssistir` como lista de `{ nome, url }`

#### Scenario: Precisão da avaliação

- **GIVEN** que a Tenrai retorna `score` 8.74
- **WHEN** a API do catálogo normaliza o anime
- **THEN** `avaliacao` é 8.74, sem arredondamento

#### Scenario: Avaliação ausente ou inválida

- **GIVEN** que o `score` está ausente, é `null`, é menor que 1 ou é maior que 10
- **WHEN** a API do catálogo normaliza o anime
- **THEN** `avaliacao` é `null`, sem lançar erro

#### Scenario: Anime sem metadados opcionais

- **GIVEN** que a Tenrai retorna um anime sem ano, sem sinopse ou sem streaming
- **WHEN** a API do catálogo normaliza o anime
- **THEN** os campos ausentes viram `ano: null`, `sinopse: null` e `ondeAssistir: []`, sem lançar erro

#### Scenario: Item inválido em uma lista

- **GIVEN** que a Tenrai retorna um item sem `mal_id` numérico
- **WHEN** a API do catálogo normaliza a lista
- **THEN** o item inválido é descartado e os demais continuam disponíveis

### Requirement: Listas de animes

A API do catálogo SHALL oferecer listas de animes mais populares, da temporada atual e por gênero, aceitando um limite opcional de itens e um sinal de cancelamento.

#### Scenario: Lista de mais populares

- **WHEN** a listagem de mais populares é solicitada
- **THEN** a API retorna animes normalizados vindos do topo da Tenrai

#### Scenario: Lista da temporada atual

- **WHEN** a listagem da temporada atual é solicitada
- **THEN** a API retorna animes normalizados da temporada vigente

#### Scenario: Lista por gênero

- **WHEN** a listagem por gênero é solicitada com um identificador válido
- **THEN** a API retorna animes normalizados daquele gênero, ordenados por popularidade

#### Scenario: Nota vinda da listagem

- **GIVEN** que cada item da resposta da Tenrai traz `score`
- **WHEN** qualquer listagem é solicitada
- **THEN** os animes normalizados trazem `avaliacao` preenchida a partir do próprio item, sem requisição extra

#### Scenario: Lista sem resultados

- **GIVEN** que a Tenrai retorna uma lista vazia
- **WHEN** qualquer listagem é solicitada
- **THEN** a API retorna uma lista vazia, sem lançar erro

### Requirement: Lista de gêneros

A API do catálogo SHALL oferecer a lista de gêneros disponíveis, com identificador e nome, para alimentar filtros das telas.

#### Scenario: Gêneros disponíveis

- **WHEN** a lista de gêneros é solicitada
- **THEN** a API retorna pares `{ id, nome }` normalizados a partir da Tenrai

### Requirement: Detalhes do anime

A API do catálogo SHALL oferecer os detalhes de um anime por identificador, incluindo diretor e onde assistir, e SHALL aceitar um sinal de cancelamento.

#### Scenario: Detalhes de um anime existente

- **WHEN** os detalhes de um identificador existente são solicitados
- **THEN** a API retorna o anime no contrato com `avaliacao` preenchida quando houver `score` válido, `diretor` preenchido quando houver um responsável com posição exata de direção e `ondeAssistir` preenchido quando houver streaming

#### Scenario: Diretor ausente ou indisponível

- **GIVEN** que a consulta de equipe falha ou não possui pessoa com posição exata de direção
- **WHEN** os detalhes são solicitados
- **THEN** a API retorna o anime normalmente, com `diretor: null`, sem derrubar a consulta principal

#### Scenario: Anime inexistente

- **GIVEN** que a Tenrai responde que o anime não existe
- **WHEN** os detalhes são solicitados
- **THEN** a API lança um erro tipado de não encontrado

#### Scenario: Identificador inválido

- **WHEN** os detalhes são solicitados com um identificador que não é um número positivo
- **THEN** a API lança um erro tipado de identificador inválido, sem chamar a Tenrai

### Requirement: Cache de respostas

A API do catálogo SHALL manter cache em memória das respostas bem-sucedidas, com validade maior para detalhes do que para listas, e SHALL reutilizar requisições simultâneas idênticas.

#### Scenario: Reutilização dentro da validade

- **GIVEN** que uma consulta foi feita com sucesso há menos tempo que a validade do cache
- **WHEN** a mesma consulta é repetida
- **THEN** a API responde do cache sem nova chamada à Tenrai

#### Scenario: Expiração do cache

- **GIVEN** que uma consulta em cache passou da validade
- **WHEN** a mesma consulta é repetida
- **THEN** a API consulta a Tenrai novamente

#### Scenario: Requisições simultâneas iguais

- **GIVEN** que duas chamadas idênticas são feitas ao mesmo tempo
- **WHEN** a primeira ainda está em andamento
- **THEN** a segunda aguarda a mesma requisição em vez de disparar outra chamada à Tenrai

### Requirement: Limite de requisições

A API do catálogo SHALL respeitar o limite público da Tenrai e tratar respostas de limite excedido sem repetir indefinidamente.

#### Scenario: Limite excedido com espera curta

- **GIVEN** que a Tenrai responde com limite excedido e informa uma espera curta
- **WHEN** a API faz a nova tentativa dentro do limite permitido
- **THEN** ela repete a consulta no máximo uma vez e retorna o resultado se for bem-sucedida

#### Scenario: Limite excedido persistente

- **GIVEN** que a Tenrai continua respondendo com limite excedido
- **WHEN** a API esgota a tentativa permitida
- **THEN** ela lança um erro tipado de limite, informando o tempo de espera quando disponível

### Requirement: Erros tipados

A API do catálogo SHALL distinguir falhas de não encontrado, limite de requisições, rede, servidor, resposta inválida e cancelamento, para que as telas possam mostrar mensagens específicas.

#### Scenario: Falha de rede

- **WHEN** a conexão com a Tenrai falha
- **THEN** a API lança um erro tipado de rede

#### Scenario: Erro do servidor

- **WHEN** a Tenrai responde com erro de servidor
- **THEN** a API lança um erro tipado de servidor

#### Scenario: Resposta inválida

- **WHEN** a Tenrai responde com um corpo que não é JSON válido
- **THEN** a API lança um erro tipado de resposta inválida

#### Scenario: Requisição cancelada

- **WHEN** a requisição é cancelada pela tela
- **THEN** a API lança um erro tipado de cancelamento, que a tela deve ignorar

### Requirement: Configuração da fonte

A API do catálogo SHALL usar a URL configurada em `VITE_ANIME_API_URL` e SHALL recorrer à URL pública da Tenrai quando a variável não estiver definida.

#### Scenario: Variável definida

- **GIVEN** que `VITE_ANIME_API_URL` está definida
- **WHEN** a API monta uma requisição
- **THEN** ela usa a URL configurada como base

#### Scenario: Variável ausente

- **GIVEN** que `VITE_ANIME_API_URL` não está definida
- **WHEN** a API monta uma requisição
- **THEN** ela usa `https://api.tenrai.org/v1` como base
