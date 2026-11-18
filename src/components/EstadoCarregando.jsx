import './EstadoCarregando.css'

function EstadoCarregando({ mensagem = 'Carregando...' }) {
  return (
    <div className="estado-carregando" role="status" aria-live="polite">
      <div className="estado-carregando__skeleton"></div>
      <div className="estado-carregando__skeleton estado-carregando__skeleton--curto"></div>
      <div className="estado-carregando__skeleton estado-carregando__skeleton--curto"></div>
      <p className="estado-carregando__texto">{mensagem}</p>
    </div>
  )
}

export default EstadoCarregando
