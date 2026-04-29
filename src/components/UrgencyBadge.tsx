import React from 'react'
import { DonationUrgency } from '../types'

type UrgencyBadgeProps = {
  urgency?: DonationUrgency
}

export default function UrgencyBadge({ urgency = 'Moderado' }: UrgencyBadgeProps): React.ReactElement {
  const className = urgency === 'Urgente'
    ? 'urgency-badge urgency-badge--high'
    : urgency === 'Baixa prioridade'
      ? 'urgency-badge urgency-badge--low'
      : 'urgency-badge urgency-badge--medium'

  return <span className={className}>{urgency}</span>
}
