import React from 'react'

import { Need, ProjectStats } from '../types'
import UrgencyBadge from './UrgencyBadge'
import StatusBadge from './StatusBadge'
import CountUpStat from './CountUpStat'

type AdminDashboardProps = {
  stats: ProjectStats
  needs: Need[]
}

export default function AdminDashboard({ stats, needs }: AdminDashboardProps): React.ReactElement {
  const latestUrgentNeeds = needs.filter((need) => need.urgency === 'Urgente').slice(0, 4)

  return (
    <section className="admin-summary-panel" aria-label="Resumo administrativo da rede">
      <div className="admin-summary-grid">
        <article>
          <span>Total de CAPS cadastrados</span>
          <strong><CountUpStat value={stats.capsCount} /></strong>
        </article>
        <article>
          <span>Pedidos ativos</span>
          <strong><CountUpStat value={stats.activeRequests} /></strong>
        </article>
        <article>
          <span>Pedidos concluidos</span>
          <strong><CountUpStat value={stats.completedRequests} /></strong>
        </article>
        <article>
          <span>Pedidos urgentes</span>
          <strong><CountUpStat value={stats.urgentRequests} /></strong>
        </article>
      </div>

      <div className="admin-summary-columns">
        <article className="admin-summary-card">
          <h3>Categorias mais solicitadas</h3>
          <ul>
            {stats.topCategories.slice(0, 5).map((item) => (
              <li key={item.category}>
                <span>{item.category}</span>
                <strong>{item.total}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-summary-card">
          <h3>CAPS com maior demanda</h3>
          <ul>
            {stats.topCapsDemands.slice(0, 5).map((item) => (
              <li key={item.unitId}>
                <span>{item.unitName}</span>
                <strong>{item.total}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-summary-card">
          <h3>Pedidos urgentes recentes</h3>
          <div className="admin-urgent-list">
            {latestUrgentNeeds.map((need) => (
              <div key={need.id}>
                <strong>{need.title}</strong>
                <span>{need.unitName}</span>
                <div>
                  <UrgencyBadge urgency={need.urgency} />
                  <StatusBadge status={need.status} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
