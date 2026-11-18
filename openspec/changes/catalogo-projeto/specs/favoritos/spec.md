# Spec Delta

## Purpose

Define como o usuário favorita animes pelo símbolo de coração, como os favoritos são persistidos e compartilhados entre as telas, como a lista e a página de favoritos se apresentam e como o app se comporta em caso de duplicidade ou falha de gravação.

## ADDED Requirements

### Requirement: Persistência de favoritos

O app SHALL listar, adicionar e remover favoritos no JSON Server, na coleção `favoritos` de `db.json`. Cada favorito SHALL ser gravado como um objeto no contrato do anime `{ id, titulo, capa, ano, diretor, sinopse, ondeAssistir[] }`, identificado por `id`. Ao ser lido, o favorito SHALL ser entregue às telas no mesmo contrato, com `id` numérico igual ao `mal_id` do catálogo.

#### Scenario: Favorito adicionado

- **WHEN** o usuário favorita um anime
- **THEN** o anime é gravado na coleção `favoritos` e continua disponível após recarregar a página

#### Scenario: Favorito removido

- **WHEN** o usuário remove um anime dos favoritos
- **THEN** o registro correspondente é apagado do JSON Server e deixa de aparecer na página de favoritos

#### Scenario: Listagem de favoritos

- **WHEN** o app inicia ou a página de favoritos é aberta
- **THEN** os favoritos são carregados do JSON Server e exibidos no contrato do anime

#### Scenario: Identificador consistente

- **GIVEN** que o anime com `id` 1 foi favoritado
- **WHEN** o app recarrega e consulta se o anime 1 é favorito
- **THEN** o anime é reconhecido como favorito e pode ser removido pelo mesmo `id`

### Requirement: Estado global de favoritos

Os favoritos SHALL ficar disponíveis globalmente para todas as telas, incluindo a lista de favoritos, a consulta se um anime é favorito e as ações de adicionar e remover.

#### Scenario: Coração reflete o estado

- **WHEN** um card ou a página de detalhes exibe um anime favoritado
- **THEN** o coração aparece preenchido e indica que o anime já está nos favoritos

#### Scenario: Estado compartilhado

- **WHEN** o usuário favorita um anime em uma tela
- **THEN** as demais telas passam a refletir o novo estado sem recarregar o app

### Requirement: Botão de coração

Todo card de anime (Home e página de favoritos) e a página de detalhes SHALL exibir um botão de coração. O coração SHALL aparecer vazio (♡) quando o anime não é favorito e preenchido (♥) quando é. O botão SHALL ser um controle independente do link do card: acioná-lo não SHALL abrir a página de detalhes.

#### Scenario: Clique no coração do card

- **WHEN** o usuário clica no coração de um card na Home
- **THEN** o anime é favoritado, o coração fica preenchido e a página continua na Home

#### Scenario: Coração na página de detalhes

- **WHEN** o usuário abre os detalhes de um anime e aciona o coração
- **THEN** o anime é favoritado com os dados exibidos na página

#### Scenario: Gravação em andamento

- **GIVEN** que a gravação de um favorito ainda não terminou
- **WHEN** o usuário aciona o mesmo coração novamente
- **THEN** o segundo clique é ignorado até a gravação terminar

#### Scenario: Favoritos ainda não carregados ou indisponíveis

- **GIVEN** que os favoritos ainda estão carregando ou o carregamento falhou
- **WHEN** um card ou a página de detalhes é exibido
- **THEN** o coração aparece desabilitado e informa que os favoritos estão indisponíveis, sem impedir o uso do catálogo

### Requirement: Acessibilidade do coração

O botão de coração SHALL ser operável por teclado, ter foco visível, informar o estado alternado (pressionado/não pressionado) e ter nome acessível "Adicionar {título} aos favoritos" ou "Remover {título} dos favoritos".

#### Scenario: Teclado

- **WHEN** o usuário navega com Tab até o coração e pressiona Enter ou Espaço
- **THEN** o favorito é alternado e o foco permanece no botão

#### Scenario: Nome acessível

- **WHEN** um leitor de tela foca o coração de um anime não favoritado
- **THEN** ele anuncia "Adicionar {título} aos favoritos" e o estado não pressionado

### Requirement: Contador de favoritos na navegação

O link "Favoritos" da navegação principal SHALL exibir a quantidade atual de favoritos quando ela for maior que zero, e o nome acessível do link SHALL incluir essa quantidade.

#### Scenario: Contador atualizado

- **GIVEN** que há 2 favoritos
- **WHEN** o usuário favorita mais um anime
- **THEN** o contador do link passa para 3 sem recarregar o app

#### Scenario: Sem favoritos

- **GIVEN** que não há favoritos
- **WHEN** o cabeçalho é exibido
- **THEN** o link "Favoritos" aparece sem contador

### Requirement: Regra de duplicado

O app não SHALL permitir dois registros do mesmo anime nos favoritos. Acionar o coração de um anime já favoritado SHALL remover o favorito, em vez de criar duplicata.

#### Scenario: Favoritar duas vezes

- **GIVEN** que o anime já está nos favoritos
- **WHEN** o usuário aciona o coração novamente
- **THEN** o app remove o favorito, em vez de criar um segundo registro

#### Scenario: Duplicata vinda do servidor

- **GIVEN** que o JSON Server retorna registros repetidos para o mesmo `id`
- **WHEN** os favoritos são carregados
- **THEN** o app exibe cada anime uma única vez

### Requirement: Página Meus favoritos

A página `/favoritos` SHALL listar os animes favoritados em grade, usando o mesmo card do catálogo (capa, título, ano e coração), na ordem em que foram adicionados. A página SHALL exibir a quantidade de favoritos, permitir abrir os detalhes pelo card e remover um favorito pelo coração. Enquanto os favoritos carregam, SHALL exibir um estado de carregamento. Quando não houver favoritos, SHALL exibir um estado vazio com link para o catálogo.

#### Scenario: Favoritos existentes

- **WHEN** o usuário abre a página de favoritos com registros salvos
- **THEN** ela lista os animes favoritados com a quantidade total e cada card leva à página de detalhes

#### Scenario: Carregando

- **GIVEN** que os favoritos ainda estão sendo carregados
- **WHEN** o usuário abre a página de favoritos
- **THEN** ela mostra um indicador de carregamento em vez da lista vazia

#### Scenario: Nenhum favorito

- **GIVEN** que não há favoritos salvos
- **WHEN** o usuário abre a página de favoritos
- **THEN** ela mostra uma mensagem de lista vazia e um link para o catálogo

#### Scenario: Remoção pela página de favoritos

- **WHEN** o usuário remove um favorito pelo coração na própria página
- **THEN** o item desaparece da lista, a quantidade é atualizada e o coração correspondente nas outras telas volta ao estado não favoritado

#### Scenario: Remoção do último favorito

- **GIVEN** que há um único favorito
- **WHEN** o usuário o remove na página de favoritos
- **THEN** a página passa a exibir o estado vazio

### Requirement: Erro de gravação

Quando a gravação ou a remoção de um favorito falhar, o app SHALL informar o erro com uma mensagem específica de favoritos, anunciada para tecnologias assistivas, e SHALL restaurar o estado visual anterior, sem confirmar uma operação que não foi persistida. A mensagem SHALL poder ser fechada e SHALL desaparecer sozinha após alguns segundos.

#### Scenario: Falha ao adicionar

- **GIVEN** que o JSON Server está indisponível
- **WHEN** o usuário tenta favoritar um anime
- **THEN** o app mostra "Não foi possível salvar o favorito. Tente novamente." e o coração volta a ficar vazio

#### Scenario: Falha ao remover

- **GIVEN** que o JSON Server está indisponível
- **WHEN** o usuário tenta remover um favorito
- **THEN** o app mostra "Não foi possível remover o favorito. Tente novamente." e o anime continua na lista de favoritos

### Requirement: Falha ao carregar favoritos

Quando a listagem de favoritos falhar, o app SHALL exibir na página de favoritos uma mensagem de erro específica ("Não foi possível carregar seus favoritos.") com botão de tentar novamente, sem impedir o carregamento do catálogo. A nova tentativa SHALL buscar os favoritos de novo sem recarregar a página.

#### Scenario: JSON Server fora do ar

- **GIVEN** que o JSON Server não está em execução
- **WHEN** o app inicia
- **THEN** o catálogo continua disponível e a página de favoritos mostra erro com nova tentativa

#### Scenario: Nova tentativa com sucesso

- **GIVEN** que o carregamento falhou e o JSON Server voltou a responder
- **WHEN** o usuário aciona "Tentar novamente"
- **THEN** os favoritos são exibidos e os corações voltam a ficar habilitados
