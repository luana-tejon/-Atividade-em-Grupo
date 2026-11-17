function Favoritos() {
  return (
    <section className="pagina" aria-labelledby="titulo-favoritos">
      <p className="pagina__etiqueta">Sua lista</p>
      <h1 id="titulo-favoritos" className="pagina__titulo">
        Meus favoritos
      </h1>
      <p className="pagina__descricao">
        Os animes que você favoritar vão aparecer aqui.
      </p>

      <div className="aviso" role="status">
        <strong>Em construção.</strong> Os favoritos serão salvos no JSON
        Server e compartilhados entre as telas.
      </div>
    </section>
  )
}

export default Favoritos
