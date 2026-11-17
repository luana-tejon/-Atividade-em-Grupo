# Spec Delta

## Purpose

Define como o usuário favorita animes, como os favoritos são persistidos e compartilhados entre as telas e como o app se comporta em caso de duplicidade ou falha de gravação.

## ADDED Requirements

### Requirement: Persistência de favoritos

O app SHALL listar, adicionar e remover favoritos no JSON Server, na coleção `favoritos` de `db.json`. Cada favorito SHALL ser gravado como um objeto no contrato do anime, identificado por `id`.

#### Scenario: Favorito adicionado

- **WHEN** o usuário favorita um anime
- **THEN** o anime é gravado na coleção `favoritos` e continua disponível após recarregar a página

#### Scenario: Favorito removido

- **WHEN** o usuário remove um anime dos favoritos
- **THEN** o registro correspondente é apagado do JSON Server e deixa de aparecer na página de favoritos

#### Scenario: Listagem de favoritos

- **WHEN** o app inicia ou a página de favoritos é aberta
- **THEN** os favoritos são carregados do JSON Server e exibidos no contrato do anime

### Requirement: Estado global de favoritos

Os favoritos SHALL ficar disponíveis globalmente para todas as telas, incluindo a lista de favoritos, a consulta se um anime é favorito e as ações de adicionar e remover.

#### Scenario: Coração reflete o estado

- **WHEN** um card ou a página de detalhes exibe um anime favoritado
- **THEN** o coração aparece preenchido e indica que o anime já está nos favoritos

#### Scenario: Estado compartilhado

- **WHEN** o usuário favorita um anime em uma tela
- **THEN** as demais telas passam a refletir o novo estado sem recarregar o app

### Requirement: Regra de duplicado

O app não SHALL permitir dois registros do mesmo anime nos favoritos. Favoritar um anime já favoritado SHALL ser uma operação idempotente, sem criar duplicata.

#### Scenario: Favoritar duas vezes

- **GIVEN** que o anime já está nos favoritos
- **WHEN** o usuário aciona o coração novamente
- **THEN** o app remove o favorito, em vez de criar um segundo registro

#### Scenario: Duplicata vinda do servidor

- **GIVEN** que o JSON Server retorna registros repetidos para o mesmo `id`
- **WHEN** os favoritos são carregados
- **THEN** o app exibe cada anime uma única vez

### Requirement: Página Meus favoritos

A página `/favoritos` SHALL listar os animes favoritados com capa e título, permitir abrir os detalhes e remover um favorito. Quando não houver favoritos, ela SHALL exibir um estado vazio com caminho para o catálogo.

#### Scenario: Favoritos existentes

- **WHEN** o usuário abre a página de favoritos com registros salvos
- **THEN** ela lista os animes favoritados e cada item leva à página de detalhes

#### Scenario: Nenhum favorito

- **GIVEN** que não há favoritos salvos
- **WHEN** o usuário abre a página de favoritos
- **THEN** ela mostra uma mensagem de lista vazia e um link para o catálogo

#### Scenario: Remoção pela página de favoritos

- **WHEN** o usuário remove um favorito na própria página
- **THEN** o item desaparece da lista e o coração correspondente volta ao estado não favoritado

### Requirement: Erro de gravação

Quando a gravação ou a remoção de um favorito falhar, o app SHALL informar o erro e SHALL restaurar o estado visual anterior, sem confirmar uma operação que não foi persistida.

#### Scenario: Falha ao adicionar

- **GIVEN** que o JSON Server está indisponível
- **WHEN** o usuário tenta favoritar um anime
- **THEN** o app mostra uma mensagem de erro e o coração continua vazio

#### Scenario: Falha ao remover

- **GIVEN** que o JSON Server está indisponível
- **WHEN** o usuário tenta remover um favorito
- **THEN** o app mostra uma mensagem de erro e o anime continua na lista de favoritos

### Requirement: Falha ao carregar favoritos

Quando a listagem de favoritos falhar, o app SHALL exibir uma mensagem de erro com opção de tentar novamente, sem impedir o carregamento do catálogo.

#### Scenario: JSON Server fora do ar

- **GIVEN** que o JSON Server não está em execução
- **WHEN** o app inicia
- **THEN** o catálogo continua disponível e a página de favoritos mostra erro com nova tentativa
