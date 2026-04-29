import React from 'react'
import { DonationStatus } from '../types'

type StatusBadgeProps = {
  status?: DonationStatus
}

export default function StatusBadge({ status = 'Pendente' }: StatusBadgeProps): React.ReactElement {
  const className = status === 'Concluido'
    ? 'status-request-badge status-request-badge--done'
    : status === 'Parcialmente atendido'
      ? 'status-request-badge status-request-badge--partial'
      : 'status-request-badge status-request-badge--pending'

  return <span className={className}>{status}</span>
}
