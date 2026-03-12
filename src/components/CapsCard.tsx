import React from 'react'
import { Cap } from '../types'

type Props = {
  cap: Cap
  isSelected: boolean
  isAnimatingSelection?: boolean
  onSelectDonation: (cap: Cap) => void
}

export default function CapsCard({
  cap,
  isSelected,
  isAnimatingSelection = false,
  onSelectDonation,
}: Props): React.ReactElement {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectDonation(cap)
    }
  }

  return (
    <div
      className={`page-card donation-unit-card${isSelected || isAnimatingSelection ? ' donation-unit-card--selected' : ''}${isAnimatingSelection ? ' donation-unit-card--selecting' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelectDonation(cap)}
      onKeyDown={handleKeyDown}
    >
      {cap.photo ? (
        <img
          className="caps-card__photo"
          src={cap.photo}
          alt={`Foto da unidade ${cap.title}`}
        />
      ) : null}
      <span className="unit-type-badge">{cap.unitType}</span>
      <h3>{cap.title}</h3>
      <p><strong>Endereco:</strong> {cap.address}</p>
      <p><strong>Contato:</strong> {cap.contact ?? 'Contato nao informado'}</p>
      {cap.description ? <p>{cap.description}</p> : null}
      {cap.capacity ? <p>{cap.capacity}</p> : null}
      {cap.privacyNote ? <p>{cap.privacyNote}</p> : null}

      <button
        type="button"
        className="unit-donate-button"
        onClick={(event) => {
          event.stopPropagation()
          onSelectDonation(cap)
        }}
      >
        {isSelected ? 'Alterar doacao desta unidade' : 'Doar para esta unidade'}
      </button>
    </div>
  )
}
