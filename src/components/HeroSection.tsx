import React from 'react'
import { FaArrowRight, FaHandsHelping } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { ProjectStats } from '../types'

type HeroSectionProps = {
  stats: ProjectStats
}

export default function HeroSection({ stats }: HeroSectionProps): React.ReactElement {
  return (
    <section className="page-block home-institutional-hero" aria-labelledby="home-hero-title">
      <div className="home-institutional-hero__content">
        <span className="page-kicker">Rede solidaria de cuidado</span>
        <h2 id="home-hero-title">Doe para quem precisa. Ajude um CAPS de Campo Grande.</h2>
        <p>
          O Centro de Doacao CAPS conecta pessoas dispostas a ajudar as unidades que mais precisam de apoio.
          Consulte as necessidades cadastradas, escolha uma unidade e contribua com itens essenciais para
          fortalecer o cuidado em saude mental.
        </p>

        <div className="home-hero-actions">
          <Link className="home-hero-button home-hero-button--primary" to="/donate">
            Ver necessidades
            <FaArrowRight aria-hidden="true" />
          </Link>
          <a className="home-hero-button home-hero-button--secondary" href="#como-funciona">
            Conhecer o projeto
          </a>
        </div>
      </div>

      <aside className="home-institutional-hero__panel" aria-label="Resumo atual do projeto">
        <span className="home-hero-panel-icon" aria-hidden="true">
          <FaHandsHelping />
        </span>
        <strong>{stats.activeRequests} pedidos ativos</strong>
        <p>
          {stats.urgentRequests} demandas urgentes aguardam apoio da comunidade. Cada doacao registrada
          melhora a visibilidade da rede e ajuda a priorizar o cuidado.
        </p>
      </aside>
    </section>
  )
}
