import React from 'react'
import { FaArrowRight, FaHandsHelping } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { ProjectStats } from '../types'
import CountUpStat from './CountUpStat'

type HeroSectionProps = {
  stats: ProjectStats
}

export default function HeroSection({ stats }: HeroSectionProps): React.ReactElement {
  return (
    <section className="page-block home-institutional-hero" aria-labelledby="home-hero-title">
      <div className="home-institutional-hero__content">
        <span className="page-kicker">Rede solidaria de cuidado</span>
        <h2 id="home-hero-title">Conecte sua doacao a uma necessidade real dos CAPS.</h2>
        <p>
          Veja pedidos atualizados das unidades de Campo Grande/MS, escolha onde contribuir
          e combine a entrega com clareza, seguranca e responsabilidade.
        </p>

        <div className="home-hero-actions">
          <Link className="home-hero-button home-hero-button--primary" to="/donate">
            Ver necessidades
            <FaArrowRight aria-hidden="true" />
          </Link>
          <Link className="home-hero-button home-hero-button--secondary" to="/sobre-o-projeto">
            Conhecer o projeto
          </Link>
        </div>
      </div>

      <aside className="home-institutional-hero__panel" aria-label="Resumo atual do projeto">
        <span className="home-hero-panel-icon" aria-hidden="true">
          <FaHandsHelping />
        </span>
        <strong>Impacto organizado em rede</strong>
        <div className="home-hero-panel-stats">
          <span><strong><CountUpStat value={stats.capsCount} /></strong><small>CAPS</small></span>
          <span><strong><CountUpStat value={stats.activeRequests} /></strong><small>pedidos ativos</small></span>
          <span><strong><CountUpStat value={stats.urgentRequests} /></strong><small>urgentes</small></span>
        </div>
        <p>Informacoes separadas por unidade, prioridade e status para facilitar uma decisao rapida.</p>
      </aside>
    </section>
  )
}
