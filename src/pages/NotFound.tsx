import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound(): React.ReactElement {
  return (
    <section className="page-block home-final-cta" aria-labelledby="not-found-title">
      <div>
        <span className="page-kicker">Página não encontrada</span>
        <h2 id="not-found-title">Este endereço não existe ou mudou de lugar.</h2>
        <p>Volte ao início ou veja diretamente os pedidos abertos das unidades CAPS.</p>
      </div>
      <div className="home-final-cta__actions">
        <Link className="home-hero-button home-hero-button--primary" to="/">Ir para o início</Link>
        <Link className="home-hero-button home-hero-button--secondary" to="/donate">Ver necessidades</Link>
      </div>
    </section>
  )
}
