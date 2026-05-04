import React from 'react'
import { FaArrowRight, FaHandHoldingHeart } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { Need } from '../types'
import StatusBadge from './StatusBadge'
import UrgencyBadge from './UrgencyBadge'

type DonationRequestCardProps = {
  need: Need
  onDonate?: (need: Need) => void
  actionTo?: string
  actionLabel?: string
  compact?: boolean
}

export default function DonationRequestCard({
  need,
  onDonate,
  actionTo,
  actionLabel = 'Quero doar',
  compact = false,
}: DonationRequestCardProps): React.ReactElement {
  const donatedAmount = need.donatedAmount ?? 0
  const remaining = Math.max(need.amount - donatedAmount, 0)
  const progress = need.amount > 0 ? Math.min(100, Math.round((donatedAmount / need.amount) * 100)) : 0
  const urgency = need.urgency ?? (need.priority === 'alta'
    ? 'Urgente'
    : need.priority === 'baixa'
      ? 'Baixa prioridade'
      : 'Moderado')

  return (
    <article className={`donation-request-card${compact ? ' donation-request-card--compact' : ''}`}>
      <div className="donation-request-card__badges">
        <span className="donation-request-card__category">{need.category}</span>
        <UrgencyBadge urgency={urgency} />
        <StatusBadge status={need.status} />
      </div>

      <h3>{need.title}</h3>
      <p>{need.description}</p>

      <dl className="donation-request-card__meta">
        <div>
          <dt>Quantidade</dt>
          <dd>{need.amount}</dd>
        </div>
        <div>
          <dt>Restante</dt>
          <dd>{remaining}</dd>
        </div>
        <div>
          <dt>CAPS solicitante</dt>
          <dd>{need.unitName}</dd>
        </div>
      </dl>

      <div className="donation-request-card__progress" aria-label={`${progress}% atendido`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {onDonate ? (
        <button type="button" className="unit-donate-button" onClick={() => onDonate(need)}>
          <FaHandHoldingHeart aria-hidden="true" />
          {actionLabel}
        </button>
      ) : actionTo ? (
        <Link className="unit-donate-button" to={actionTo}>
          {actionLabel}
          <FaArrowRight aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  )
}
