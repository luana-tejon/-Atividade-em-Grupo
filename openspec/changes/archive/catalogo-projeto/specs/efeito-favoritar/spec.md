# Spec Delta

## Purpose

Define o efeito visual exibido quando o usuário favorita um anime, garantindo que ele seja perceptível, curto, acessível e que nunca substitua a confirmação real da gravação.

## ADDED Requirements

### Requirement: Efeito visual ao favoritar

Ao adicionar um anime aos favoritos, o app SHALL exibir um efeito visual breve inspirado em anime: pequenos corações e brilhos saindo da posição do coração acionado, acompanhados de uma onomatopeia curta em japonês (por exemplo, "好き!" ou "ドキッ"). O efeito SHALL ter duração máxima de um segundo e não SHALL cobrir o conteúdo principal da tela. O efeito SHALL funcionar da mesma forma em qualquer tela que tenha o coração (Home, Detalhes e Favoritos).

#### Scenario: Anime favoritado

- **WHEN** o usuário aciona o coração para adicionar um anime aos favoritos
- **THEN** o efeito visual é exibido uma vez, a partir do coração acionado, e desaparece sozinho em até um segundo

#### Scenario: Favoritos seguidos

- **WHEN** o usuário favorita dois animes diferentes em sequência rápida
- **THEN** cada adição dispara o seu próprio efeito, sem acumular elementos na tela após o término

#### Scenario: Anime removido dos favoritos

- **WHEN** o usuário aciona o coração para remover um anime dos favoritos
- **THEN** o efeito de comemoração não é exibido

### Requirement: Efeito não bloqueante

O efeito SHALL ser apenas visual e não SHALL bloquear cliques, navegação ou a gravação do favorito. Ele não SHALL deslocar o layout da página.

#### Scenario: Interação durante o efeito

- **WHEN** o efeito está em execução
- **THEN** o usuário continua conseguindo clicar em links e botões normalmente

#### Scenario: Layout estável

- **WHEN** o efeito aparece e desaparece
- **THEN** os elementos ao redor permanecem na mesma posição

### Requirement: Acessibilidade do efeito

O efeito SHALL respeitar a preferência de redução de movimento. O botão de favoritar SHALL ter nome acessível, e a mudança de estado SHALL ser anunciada para tecnologias assistivas.

#### Scenario: Redução de movimento ativada

- **GIVEN** que o sistema operacional está configurado para reduzir movimento
- **WHEN** o usuário favorita um anime
- **THEN** o app confirma a ação sem animação ampla ou movimento intenso

#### Scenario: Leitor de tela

- **WHEN** o usuário favorita um anime com leitor de tela ativo
- **THEN** o botão informa o estado atual e o app anuncia que o anime foi adicionado aos favoritos

### Requirement: Efeito não confirma gravação

O efeito SHALL ser independente do resultado da gravação. Se a gravação falhar, o app SHALL mostrar o erro e reverter o estado do coração, mesmo que o efeito já tenha sido exibido.

#### Scenario: Falha após o efeito

- **GIVEN** que o efeito foi exibido e a gravação no JSON Server falha
- **WHEN** a falha é recebida
- **THEN** o app mostra a mensagem de erro e o coração volta ao estado anterior
