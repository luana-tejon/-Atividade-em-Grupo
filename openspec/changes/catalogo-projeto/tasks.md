# Tasks

## 1. Base e integração (Luana)

- [x] 1.1 Criar `db.json` com `{ "favoritos": [] }` e subir com `npm run api`; verificar que `curl http://localhost:3001/favoritos` responde `[]`.
- [x] 1.2 Configurar as rotas `/`, `/anime/:id`, `/favoritos` e fallback 404 com `react-router-dom`; verificar que cada URL renderiza a página correta sem recarregar o app.
- [x] 1.3 Criar o layout base com cabeçalho, navegação para Início e Favoritos e `<Outlet />`; verificar que a navegação funciona em todas as rotas e que a rota ativa é indicada.
- [x] 1.4 Criar as páginas placeholder de Home, Detalhes, Favoritos e Não encontrado; verificar que `npm run build` passa antes de qualquer integração real.
- [x] 1.5 Atualizar o README com arquitetura, fontes de dados, contrato, como rodar, divisão de tarefas e regras de branch/PR; verificar que os comandos documentados executam como escrito.
- [x] 1.6 Definir no README o fluxo de branches e PRs (uma branch por tarefa, PR para `main`, revisão da Luana, sem squash); verificar que a seção cita os seis papéis e os caminhos de cada pasta.

## 2. Página inicial e cards (Wagner)

- [ ] 2.1 Criar `src/components/AnimeCard.jsx` com capa, título, fallback de imagem e link para `/anime/:id`, usando o contrato e as fixtures; verificar que o card abre os detalhes e que um anime sem capa não quebra o layout.
- [ ] 2.2 Garantir acessibilidade do card: `alt` com o título, link com nome acessível e foco visível; verificar com navegação por teclado e leitor de tela.
- [ ] 2.3 Criar os componentes de estado `EstadoCarregando`, `EstadoVazio` e `EstadoErro` com ação de nova tentativa; verificar cada estado forçando lista vazia, erro e carregamento.
- [ ] 2.4 Montar a Home com as seções “Mais populares”, “Temporada atual” e “Por gênero”, cada uma com consulta independente; verificar que uma seção com erro não apaga as outras.
- [ ] 2.5 Ajustar a grade de cards para telas pequenas e grandes; verificar em 360px e 1280px que capas, títulos e links continuam utilizáveis.
- [ ] 2.6 Registrar no README ou em comentário da Home quais listas e gêneros foram usados; verificar que os identificadores documentados existem na API.

## 3. Página de detalhes (João Vitor)

- [x] 3.1 Criar `src/pages/Detalhes.jsx` consumindo `obterDetalhes(id)` e exibindo capa, título, ano, diretor e sinopse; verificar com o anime 1 que os campos aparecem no contrato.
- [x] 3.2 Exibir “Não informado” para diretor, ano ou sinopse ausentes; verificar com fixture sem diretor que a página não quebra.
- [x] 3.3 Implementar a seção “Onde assistir” com links `target="_blank"` e `rel="noreferrer"`; verificar que os links abrem em nova aba e que a ausência de streaming mostra mensagem explicativa.
- [x] 3.4 Tratar `NAO_ENCONTRADO` com a mensagem “Anime não encontrado” e link para o início; verificar com `/anime/999999999` e com `/anime/abc`.
- [x] 3.5 Tratar erro de rede, erro de servidor e limite de requisições com mensagem específica e nova tentativa; verificar desligando a rede e simulando erro no console.
- [x] 3.6 Documentar no README o comportamento da página de detalhes para campos ausentes e anime inexistente; verificar que a documentação bate com a tela.

## 4. Favoritos (Gustavo)

- [x] 4.1 Criar `src/api/favoritos.js` com `listarFavoritos`, `adicionarFavorito` e `removerFavorito` no JSON Server (`http://localhost:3001`), gravando `animeId` (mal_id) com o `id` gerado pelo servidor, devolvendo o contrato com `id` numérico e a relação `animeId → ids de registro`, e lançando `ApiError` com código `FAVORITOS_INDISPONIVEL`; verificar os três verbos com `curl` (incluindo `DELETE /favoritos/{idRegistro}`) e conferir o conteúdo de `db.json`.
- [ ] 4.2 Criar `src/context/FavoritosContext.jsx` com `FavoritosProvider` e `useFavoritos()`, expondo `favoritos`, `ehFavorito`, `alternar`, `adicionar`, `remover`, `recarregar`, `pendentes`, `carregando`, `erro`, `erroGravacao`, `limparErroGravacao` e `ultimoAdicionado`; envolver `<App />` em `src/main.jsx` dentro do `BrowserRouter`; verificar que duas telas refletem a mesma mudança.
- [ ] 4.3 Implementar favorito como snapshot do contrato, com deduplicação por `id` na leitura, atualização otimista e rollback em falha; verificar que uma falha simulada restaura o coração e preenche `erroGravacao`.
- [ ] 4.4 Criar `src/components/BotaoFavorito.jsx` (♡/♥, `aria-pressed`, `aria-label` "Adicionar/Remover {título} dos favoritos", foco visível, desabilitado em `carregando`/`erro`/`pendentes`), chamando `alternar(anime)` e enviando a posição do botão em `origem`; verificar com mouse e teclado que dois cliques rápidos não criam duplicata e que o estado persiste após recarregar.
- [ ] 4.5 Inserir o `BotaoFavorito` no `AnimeCard` como irmão do `<Link>` (sobre o canto da capa) e no cabeçalho de `Detalhes.jsx`; verificar que clicar no coração do card não navega e que o HTML não tem `<button>` dentro de `<a>`.
- [ ] 4.6 Adicionar o selo com a quantidade de favoritos no link "Favoritos" do `Layout`, com `aria-label` "Favoritos, N animes" e sem selo quando zero; verificar que o número muda ao favoritar/remover sem recarregar.
- [ ] 4.7 Implementar a página `/favoritos` com carregando, erro (prop nova `mensagem` no `EstadoErro` + `onRetry={recarregar}`), estado vazio com link para `/`, contador "N animes" e grade de `AnimeCard` na ordem de inserção; verificar que um favorito removido desaparece da página, do contador e dos outros corações, e que remover o último mostra o estado vazio.
- [ ] 4.8 Criar `AvisoFavoritos` no `Layout` mostrando `erroGravacao` em `role="alert"`, com botão de fechar e sumindo após ~4s; tratar JSON Server fora do ar sem derrubar o catálogo; verificar parando o `npm run api`, tentando favoritar/remover e navegando entre Home e Favoritos, e depois religando e usando "Tentar novamente".
- [ ] 4.9 Documentar no README os endpoints de favoritos, a regra de `id` do servidor + `animeId` e a regra de duplicado; verificar que os exemplos de `curl` funcionam como escrito.

## 5. Efeito e validação (Vitória)

- [ ] 5.1 Criar `src/components/EfeitoFavorito.jsx` (e CSS), montado uma vez no `Layout`, observando `ultimoAdicionado` do `useFavoritos()` e usando `chave` como `key`; overlay `position: fixed` em `origem`, `pointer-events: none`, corações/brilhos e onomatopeia "好き!" em `@keyframes` de até 1 segundo, desmontado ao terminar; verificar que o efeito sai do coração acionado na Home, em Detalhes e em Favoritos e não bloqueia cliques.
- [ ] 5.2 Respeitar `prefers-reduced-motion` e anunciar "{título} adicionado aos favoritos" em região `aria-live="polite"`; verificar com a preferência ativada no sistema e com leitor de tela.
- [ ] 5.3 Garantir que o efeito dispara apenas ao adicionar (não ao remover), que duas adições seguidas geram dois efeitos sem sobras no DOM e que falha de gravação mostre o `AvisoFavoritos` e reverta o coração; verificar com o JSON Server parado.
- [ ] 5.4 Criar `docs/validacao.md` com critérios de aceitação e checklist de todas as tarefas; verificar que cada item tem resultado registrado e data.
- [ ] 5.5 Preencher a seção “Reflexão” do README com as respostas do grupo; verificar que não restou nenhum `[A preencher]`.

## 6. Integração final (grupo)

- [ ] 6.1 Rodar `npm run lint` e `npm run build` na branch de integração; verificar que ambos terminam com código 0.
- [ ] 6.2 Percorrer o fluxo completo no navegador: Home → card → detalhes → favoritar → Favoritos → remover; verificar que o contrato se mantém em todas as telas.
- [ ] 6.3 Recarregar a página e reiniciar o JSON Server; verificar que os favoritos persistem e que a lista não duplica.
- [ ] 6.4 Testar os cenários de erro: API do catálogo fora do ar, ID inexistente, JSON Server fora do ar e lista vazia; verificar que cada tela mostra a mensagem prevista na spec.
- [ ] 6.5 Revisar o diff final e confirmar que não entraram `node_modules`, `dist` ou `.env`; verificar com `git status --short`.

## Workflow follow-up

- O grupo revisa e aprova as duas specs (`catalogo-de-animes` e `catalogo-projeto`) antes da implementação.
- Cada integrante trabalha na sua branch e abre PR para `main`; a Luana revisa e faz o merge.
- Arquivar as changes somente depois da implementação e da validação aprovadas.
- O usuário cria os commits manualmente; o agente não executa `git commit`.
