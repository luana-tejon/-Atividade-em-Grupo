import './EstadoVazio.css'

function EstadoVazio({ titulo, descricao }) {
  return (
    <div className="estado-vazio" role="status" aria-live="polite">
      <div className="estado-vazio__icone" aria-hidden="true">
        &#x1F3AB;
      </div>
      <h2 className="estado-vazio__titulo">{titulo}</h2>
      <p className="estado-vazio__descricao">{descricao}</p>
    </div>
  )
}

export default EstadoVazio
