# Spec Delta

## Purpose

Define a estrutura navegável do app, a página inicial com listas de animes, o card reutilizável e a página de detalhes, incluindo os estados de carregamento, vazio e erro que o usuário vê.

## ADDED Requirements

### Requirement: Rotas e layout base

O app SHALL oferecer as rotas `/` (início), `/anime/:id` (detalhes), `/favoritos` (meus favoritos) e uma rota de fallback para páginas não encontradas. Todas as rotas SHALL compartilhar um layout com cabeçalho e navegação para Início e Favoritos.

#### Scenario: Navegação entre páginas

- **WHEN** o usuário aciona um link de navegação
- **THEN** o conteúdo da rota correspondente é exibido dentro do layout, sem recarregar a página inteira

#### Scenario: Rota inexistente

- **WHEN** o usuário acessa uma URL que não corresponde a nenhuma rota
- **THEN** o app exibe a página de não encontrado com um link para voltar ao início

### Requirement: Página inicial com listas

A página inicial SHALL apresentar listas de animes em seções separadas: mais populares, temporada atual e por gênero. Cada seção SHALL carregar de forma independente das demais.

#### Scenario: Carregamento das listas

- **WHEN** o usuário abre a página inicial
- **THEN** as seções de populares, temporada e gênero exibem seus animes

#### Scenario: Falha em uma seção

- **GIVEN** que a consulta de uma das listas falha
- **WHEN** a página inicial termina de carregar
- **THEN** as outras listas continuam visíveis e apenas a seção com falha mostra erro

### Requirement: Card de anime

O card SHALL exibir a capa, o título e a avaliação do catálogo do anime e SHALL levar à página de detalhes daquele anime ao ser acionado. A avaliação SHALL aparecer logo abaixo do título, dentro do mesmo link, formatada em `pt-BR` com uma casa decimal e prefixada por uma estrela `★` informativa. Quando a nota estiver indisponível, o card SHALL mostrar “Sem avaliação”. O coração SHALL permanecer um controle separado do link.

#### Scenario: Abertura dos detalhes pelo card

- **WHEN** o usuário aciona um card
- **THEN** o app navega para `/anime/:id` com o identificador do anime escolhido

#### Scenario: Avaliação formatada

- **GIVEN** que o anime tem `avaliacao` 8.74
- **WHEN** o card é exibido
- **THEN** a linha de avaliação mostra `★ 8,7/10`

#### Scenario: Avaliação máxima

- **GIVEN** que o anime tem `avaliacao` 10
- **WHEN** o card é exibido
- **THEN** a linha de avaliação mostra `★ 10,0/10`

#### Scenario: Avaliação ausente

- **GIVEN** que o anime tem `avaliacao: null`, não possui o campo ou recebeu um valor inválido
- **WHEN** o card é exibido
- **THEN** a linha de avaliação mostra “Sem avaliação”, sem estrela

#### Scenario: Anime sem capa

- **GIVEN** que o anime não possui URL de capa
- **WHEN** o card é exibido
- **THEN** ele mostra um espaço reservado sem quebrar o layout e mantém o título e a avaliação legíveis

#### Scenario: Acessibilidade do card

- **WHEN** o card é lido por tecnologia assistiva
- **THEN** a imagem possui texto alternativo com o título, a estrela tem `aria-hidden="true"` e o nome acessível do link informa a avaliação, como “Ver detalhes de Cowboy Bebop. Avaliação do catálogo de 8,7 em 10” ou “Ver detalhes de Cowboy Bebop. Sem avaliação”

#### Scenario: Coração separado do link

- **WHEN** o usuário navega por teclado até o card
- **THEN** o link abre os detalhes e o coração, como irmão do link, alterna o favorito sem navegar

#### Scenario: Responsividade da avaliação

- **WHEN** o card é exibido em 360 px ou em 1280 px
- **THEN** a avaliação permanece legível sob o título, sem quebrar o layout

### Requirement: Estados de carregamento, vazio e erro

Cada lista da página inicial SHALL exibir um estado de carregamento enquanto consulta, um estado vazio quando não há animes e um estado de erro com opção de tentar novamente quando a consulta falha.

#### Scenario: Lista vazia

- **GIVEN** que a consulta retorna uma lista vazia
- **WHEN** a seção é exibida
- **THEN** ela mostra uma mensagem de vazio, sem lançar erro

#### Scenario: Erro com nova tentativa

- **GIVEN** que a consulta falha
- **WHEN** o usuário aciona “Tentar novamente”
- **THEN** a seção volta ao estado de carregamento e refaz a consulta

#### Scenario: Limite de requisições

- **GIVEN** que a API responde com limite de requisições excedido
- **WHEN** a seção exibe o erro
- **THEN** a mensagem informa que é preciso aguardar, sem derrubar as outras listas

### Requirement: Página de detalhes

A página de detalhes SHALL exibir capa, título, ano, diretor, sinopse e a seção “Onde assistir” do anime selecionado. Quando um campo não existir, a página SHALL exibir “Não informado” sem quebrar.

#### Scenario: Detalhes completos

- **WHEN** o usuário abre a página de um anime existente
- **THEN** ele vê capa, título, ano, diretor, sinopse e as plataformas de streaming disponíveis

#### Scenario: Campos ausentes

- **GIVEN** que o anime não possui diretor, ano ou sinopse
- **WHEN** a página é exibida
- **THEN** os campos ausentes mostram “Não informado” e o restante continua visível

#### Scenario: Anime sem streaming

- **GIVEN** que o anime não possui plataformas de streaming
- **WHEN** a seção “Onde assistir” é exibida
- **THEN** ela mostra uma mensagem de indisponibilidade, sem lista vazia sem explicação

#### Scenario: Links de streaming

- **WHEN** o usuário aciona uma plataforma em “Onde assistir”
- **THEN** o link abre em nova aba com proteção contra acesso à página de origem

### Requirement: Anime não encontrado

Quando o identificador da rota não existir no catálogo, a página de detalhes SHALL exibir uma mensagem de anime não encontrado com caminho de volta ao início, sem apresentar erro genérico.

#### Scenario: Identificador inexistente

- **WHEN** o usuário acessa `/anime/999999999`
- **THEN** a página mostra “Anime não encontrado” e um link para voltar ao início

#### Scenario: Identificador inválido na URL

- **WHEN** o usuário acessa uma rota de detalhes com identificador não numérico
- **THEN** a página trata o caso como anime não encontrado, sem chamar a API

### Requirement: Erros de catálogo na interface

A interface SHALL diferenciar falha de rede, falha do servidor e limite de requisições, exibindo uma mensagem compreensível e uma ação de nova tentativa quando fizer sentido.

#### Scenario: Falha de rede

- **GIVEN** que o app está sem conexão com a API
- **WHEN** uma tela do catálogo tenta carregar
- **THEN** ela informa que não há conexão com o catálogo e oferece nova tentativa

#### Scenario: Falha do servidor

- **GIVEN** que a API responde com erro de servidor
- **WHEN** uma tela do catálogo tenta carregar
- **THEN** ela informa que o catálogo está indisponível e oferece nova tentativa
