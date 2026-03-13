import React from 'react'
import { Link } from 'react-router-dom'

export default function Thanks(): React.ReactElement {
  return (
    <section className="page-block">
      <span className="page-kicker">Contribuição registrada</span>
      <h2>Obrigado por apoiar o cuidado em saúde mental.</h2>
      <p>
        Sua doação foi registrada e ajudará na continuidade das atividades dos CAPS.
      </p>
      <Link className="inline-link" to="/donate">
        Fazer nova doação
      </Link>
    </section>
  )
}
