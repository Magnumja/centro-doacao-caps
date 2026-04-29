import React from 'react'
import { FaHandHoldingHeart } from 'react-icons/fa'

import { Need } from '../types'
import StatusBadge from './StatusBadge'
import UrgencyBadge from './UrgencyBadge'

type DonationRequestCardProps = {
  need: Need
  onDonate?: (need: Need) => void
  compact?: boolean
}

export default function DonationRequestCard({
  need,
  onDonate,
  compact = false,
}: DonationRequestCardProps): React.ReactElement {
  const donatedAmount = need.donatedAmount ?? 0
  const remaining = Math.max(need.amount - donatedAmount, 0)

  return (
    <article className={`donation-request-card${compact ? ' donation-request-card--compact' : ''}`}>
      <div className="donation-request-card__badges">
        <span className="donation-request-card__category">{need.category}</span>
        <UrgencyBadge urgency={need.urgency} />
        <StatusBadge status={need.status} />
      </div>

      <h3>{need.title}</h3>
      <p>{need.description}</p>

      <dl className="donation-request-card__meta">
        <div>
          <dt>Quantidade necessaria</dt>
          <dd>{need.amount}</dd>
        </div>
        <div>
          <dt>Restante estimado</dt>
          <dd>{remaining}</dd>
        </div>
      </dl>

      {onDonate ? (
        <button type="button" className="unit-donate-button" onClick={() => onDonate(need)}>
          <FaHandHoldingHeart aria-hidden="true" />
          Demonstrar interesse em doar
        </button>
      ) : null}
    </article>
  )
}
