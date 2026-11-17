import { NavLink, Outlet } from 'react-router-dom'

function classeDoLink({ isActive }) {
  return isActive
    ? 'navegacao__link navegacao__link--ativo'
    : 'navegacao__link'
}

function Layout() {
  return (
    <div className="app">
      <header className="cabecalho">
        <div className="cabecalho__conteudo">
          <NavLink
            to="/"
            className="marca"
            aria-label="Anime Lista — página inicial"
          >
            <span className="marca__icone" aria-hidden="true">
              ア
            </span>
            <span>Anime Lista</span>
          </NavLink>

          <nav className="navegacao" aria-label="Navegação principal">
            <NavLink to="/" end className={classeDoLink}>
              Início
            </NavLink>
            <NavLink to="/favoritos" className={classeDoLink}>
              Favoritos
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="conteudo" id="conteudo">
        <Outlet />
      </main>

      <footer className="rodape">
        <p>
          Projeto acadêmico — catálogo de animes com dados da Tenrai.
        </p>
      </footer>
    </div>
  )
}

export default Layout
