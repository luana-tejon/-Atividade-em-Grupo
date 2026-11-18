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

- [ ] 4.1 Criar `src/api/favoritos.js` com `listarFavoritos`, `adicionarFavorito` e `removerFavorito` no JSON Server; verificar os três verbos com `curl` e conferir o conteúdo de `db.json`.
- [ ] 4.2 Criar `FavoritosContext` com `favoritos`, `ehFavorito(id)`, `adicionar`, `remover`, `carregando` e `erro`, carregando no início do app; verificar que duas telas refletem a mesma mudança.
- [ ] 4.3 Implementar favorito como snapshot do contrato, com atualização otimista e rollback em falha; verificar que uma falha simulada restaura o coração e mostra erro.
- [ ] 4.4 Implementar o botão de coração com nome acessível e regra de alternância (favoritar/desfavoritar); verificar que dois cliques não criam duplicata e que o estado persiste após recarregar.
- [ ] 4.5 Criar a página `/favoritos` com lista, remoção, estado vazio e link para o catálogo; verificar que um favorito removido desaparece da página e do coração.
- [ ] 4.6 Tratar JSON Server fora do ar sem derrubar o catálogo; verificar parando o `npm run api` e navegando entre Home e Favoritos.
- [ ] 4.7 Documentar no README os endpoints de favoritos e a regra de duplicado; verificar que os exemplos de `curl` funcionam como escrito.

## 5. Efeito e validação (Vitória)

- [ ] 5.1 Criar `src/components/EfeitoFavorito.jsx` com overlay `position: fixed`, `pointer-events: none` e animação CSS de até 1 segundo; verificar que o efeito aparece ao favoritar e não bloqueia cliques.
- [ ] 5.2 Respeitar `prefers-reduced-motion` e anunciar a mudança em região `aria-live`; verificar com a preferência ativada no sistema e com leitor de tela.
- [ ] 5.3 Disparar o efeito apenas ao adicionar, não ao remover, e garantir que falha de gravação mostre erro e reverta o coração; verificar com o JSON Server parado.
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
