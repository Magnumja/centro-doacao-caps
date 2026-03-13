import React from 'react'
import { Cap } from '../types'

// Propriedades esperadas para renderizar e controlar o card da unidade.
type Props = {
  // Dados completos da unidade (nome, endereço, foto, etc.).
  cap: Cap
  // Indica se esta unidade está selecionada no fluxo de doação.
  isSelected: boolean
  // Indica se o card está no estado visual de animação de seleção.
  isAnimatingSelection?: boolean
  // Callback para notificar a página pai que a unidade foi escolhida.
  onSelectDonation: (cap: Cap) => void
}

export default function CapsCard({
  cap,
  isSelected,
  isAnimatingSelection = false,
  onSelectDonation,
}: Props): React.ReactElement {
  // Suporte a teclado (Enter/Espaço) para manter acessibilidade.
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
      {/* Foto opcional da unidade */}
      {cap.photo ? (
        <img
          className="caps-card__photo"
          src={cap.photo}
          alt={`Foto da unidade ${cap.title}`}
        />
      ) : null}
      <span className="unit-type-badge">{cap.unitType}</span>
      <h3>{cap.title}</h3>
      <p><strong>Endereço:</strong> {cap.address}</p>
      <p><strong>Contato:</strong> {cap.contact ?? 'Contato não informado'}</p>
      {cap.description ? <p>{cap.description}</p> : null}
      {cap.capacity ? <p>{cap.capacity}</p> : null}
      {cap.privacyNote ? <p>{cap.privacyNote}</p> : null}

      <button
        type="button"
        className="unit-donate-button"
        onClick={(event) => {
          // Evita disparar também o onClick do card pai.
          event.stopPropagation()
          onSelectDonation(cap)
        }}
      >
        {isSelected ? 'Alterar doação desta unidade' : 'Doar para esta unidade'}
      </button>
    </div>
  )
}
