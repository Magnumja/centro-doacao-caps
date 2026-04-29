import React from 'react'
import { FaBoxes, FaChartLine, FaCheckCircle, FaHospital } from 'react-icons/fa'

import { ProjectStats } from '../types'

type ImpactCardsProps = {
  stats: ProjectStats
}

export default function ImpactCards({ stats }: ImpactCardsProps): React.ReactElement {
  const items = [
    {
      label: 'CAPS cadastrados',
      value: stats.capsCount,
      helper: 'unidades CAPS de Campo Grande',
      icon: FaHospital,
    },
    {
      label: 'Pedidos ativos',
      value: stats.activeRequests,
      helper: `${stats.urgentRequests} com urgencia alta`,
      icon: FaBoxes,
    },
    {
      label: 'Doacoes registradas',
      value: stats.registeredDonations,
      helper: 'historico inicial para acompanhamento',
      icon: FaCheckCircle,
    },
    {
      label: 'Itens mais necessarios',
      value: stats.topCategories[0]?.total ?? 0,
      helper: stats.topCategories[0]?.category ?? 'Sem categoria dominante',
      icon: FaChartLine,
    },
  ]

  return (
    <section className="page-block impact-section">
      <div className="section-heading">
        <span className="page-kicker">Impacto em tempo real</span>
        <h2>Indicadores para orientar doadores e gestores da rede.</h2>
      </div>

      <div className="impact-grid">
        {items.map(({ label, value, helper, icon: ItemIcon }) => (
          <article className="impact-card" key={label}>
            <span className="impact-card__icon" aria-hidden="true">
              <ItemIcon />
            </span>
            <strong>{value}</strong>
            <span>{label}</span>
            <p>{helper}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
