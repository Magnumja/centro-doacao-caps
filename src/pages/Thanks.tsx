import React from 'react'
import { Link } from 'react-router-dom'

export default function Thanks(): React.ReactElement {
  return (
    <section className="page-block">
      <span className="page-kicker">Contribuicao registrada</span>
      <h2>Obrigado por apoiar o cuidado em saude mental.</h2>
      <p>
        Sua doacao foi registrada e ajudara na continuidade das atividades dos CAPS.
      </p>
      <Link className="inline-link" to="/donate">
        Fazer nova doacao
      </Link>
    </section>
  )
}
