import './EstadoErro.css'

// `mensagem` (opcional) tem prioridade sobre o texto derivado de `codigo`.
function EstadoErro({ codigo, onRetry, mensagem: mensagemPersonalizada }) {
  let mensagem = 'Não foi possível carregar os dados. Tente novamente.'

  if (codigo === 'NAO_ENCONTRADO') {
    mensagem = 'Não encontramos resultados.'
  } else if (codigo === 'LIMITE_REQUISICOES') {
    mensagem = 'Muitas requisições. Aguarde instantes e tente novamente.'
  } else if (codigo === 'ERRO_REDE') {
    mensagem = 'Sem conexão com o catálogo. Verifique sua internet.'
  } else if (codigo === 'ERRO_SERVIDOR' || codigo === 'ERRO_API') {
    mensagem = 'O catálogo está indisponível. Tente novamente em instantes.'
  } else if (codigo === 'RESPOSTA_INVALIDA') {
    mensagem = 'Resposta inválida do catálogo.'
  } else if (codigo === 'ID_INVALIDO') {
    mensagem = 'Identificador inválido.'
  } else if (codigo === 'ABORTADO') {
    mensagem = 'Requisição cancelada.'
  }

  return (
    <div className="estado-erro" role="alert" aria-live="polite">
      <div className="estado-erro__icone" aria-hidden="true">
        &#x26A0;
      </div>
      <h2 className="estado-erro__titulo">Erro ao carregar</h2>
      <p className="estado-erro__mensagem">
        {mensagemPersonalizada || mensagem}
      </p>
      {onRetry && (
        <button
          className="estado-erro__botao"
          onClick={onRetry}
          aria-label="Tentar novamente"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export default EstadoErro
