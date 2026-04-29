import React from 'react'
import { Cap } from '../types'

type CapsCardProps = {
  cap: Cap
  isSelected: boolean
  isAnimatingSelection?: boolean
  onSelectDonation: (cap: Cap) => void
}

function CapsCard({
  cap,
  isSelected,
  isAnimatingSelection = false,
  onSelectDonation,
}: CapsCardProps): React.ReactElement {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectDonation(cap)
    }
  }

  const resolvedPhoto = (() => {
    if (typeof cap.photo !== 'string' || cap.photo.length === 0) return undefined
    if (cap.photo.startsWith('/')) return cap.photo
    try {
      return new URL(cap.photo, import.meta.url).href
    } catch {
      return cap.photo
    }
  })()

  const bundledFallback = (typeof cap.photo === 'string' && cap.photo.startsWith('/'))
    ? (() => {
      try {
        return new URL(`../public${cap.photo}`, import.meta.url).href
      } catch {
        return undefined
      }
    })()
    : undefined

  return (
    <div
      className={`page-card donation-unit-card${isSelected || isAnimatingSelection ? ' donation-unit-card--selected' : ''}${isAnimatingSelection ? ' donation-unit-card--selecting' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelectDonation(cap)}
      onKeyDown={handleKeyDown}
    >
      {resolvedPhoto && (
        <img
          className="caps-card__photo"
          src={resolvedPhoto}
          alt={`Foto da unidade ${cap.title}`}
          onError={(event) => {
            if (bundledFallback && event.currentTarget.src !== bundledFallback) {
              event.currentTarget.src = bundledFallback
            }
          }}
        />
      )}
      <span className="unit-type-badge">{cap.unitType}</span>
      <h3>{cap.title}</h3>
      <p><strong>Endereço:</strong> {cap.address}</p>
      <p><strong>Contato:</strong> {cap.contact ?? 'Contato não informado'}</p>
      {cap.description && <p>{cap.description}</p>}
      {cap.capacity && <p>{cap.capacity}</p>}
      {cap.privacyNote && <p>{cap.privacyNote}</p>}
      <button
        type="button"
        className="unit-donate-button"
        onClick={(event) => {
          event.stopPropagation()
          onSelectDonation(cap)
        }}
      >
        {isSelected ? 'Alterar doação desta unidade' : 'Doar para esta unidade'}
      </button>
    </div>
  )
}

export default React.memo(CapsCard, (prev, next) => {
  return (
    prev.cap.id === next.cap.id
    && prev.isSelected === next.isSelected
    && prev.isAnimatingSelection === next.isAnimatingSelection
  )
})
