import React from 'react'

import CapsMap from '../components/CapsMap'
import '../Styles/Home.css'

export default function Home(): React.ReactElement {
  return (
    <section className="page-block home-instructions">
      <span className="page-kicker">Saude mental em rede</span>
        <h2>Um unico menu para acompanhar cuidado, doacoes e impacto social.</h2>
        <p>
          Este espaco organiza a jornada da equipe e da comunidade com acesso rapido a
          unidades CAPS, necessidades de doacao e painel administrativo.
        </p>

        <div className="home-cards">
          <article className="home-card">
            <h3>Necessidades priorizadas</h3>
            <p>Visualize os itens urgentes para manter atendimentos e oficinas ativas.</p>
          </article>
          <article className="home-card">
            <h3>Rede CAPS integrada</h3>
            <p>Centralize informacoes de unidades e facilite o encaminhamento solidario.</p>
          </article>
          <article className="home-card">
            <h3>Transparencia de apoio</h3>
            <p>Registre cada contribuicao e mantenha o acompanhamento acessivel.</p>
          </article>
        </div>

        <CapsMap />
      </section>
  )
}
