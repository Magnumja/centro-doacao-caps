import React from 'react'
import { FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { getMapsUrl, getWhatsAppUrl } from '../lib/contact'
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

  const whatsappUrl = getWhatsAppUrl(cap)
  const mapsUrl = getMapsUrl(cap.address)

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
      <div className="caps-card__status-row">
        <span className="status-request-badge status-request-badge--partial">Recebendo doacoes</span>
        {cap.needsSummary ? <span className="status-request-badge status-request-badge--pending">Pedidos abertos</span> : null}
      </div>

      <div className="caps-card__details">
        <p><strong>Endereco:</strong> {cap.address}</p>
        <p><strong>Contato:</strong> {cap.contact ?? 'Contato nao informado'}</p>
        {cap.operatingHours ? <p><strong>Horario:</strong> {cap.operatingHours}</p> : null}
        {cap.needsSummary ? <p><strong>Necessidades:</strong> {cap.needsSummary}</p> : null}
      </div>

      {cap.description ? <p>{cap.description}</p> : null}
      {cap.capacity ? <p>{cap.capacity}</p> : null}
      {cap.privacyNote ? <p>{cap.privacyNote}</p> : null}

      <div className="caps-card__actions">
        <Link
          className="unit-secondary-button"
          to={`/caps/${cap.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          Ver necessidades
        </Link>
        <button
          type="button"
          className="unit-donate-button"
          onClick={(event) => {
            event.stopPropagation()
            onSelectDonation(cap)
          }}
        >
          {isSelected ? 'Alterar doacao' : 'Quero doar'}
        </button>
        {whatsappUrl ? (
          <a
            className="unit-icon-link"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Falar pelo WhatsApp com ${cap.title}`}
            title="Falar pelo WhatsApp"
          >
            <FaWhatsapp aria-hidden="true" />
          </a>
        ) : null}
        {mapsUrl ? (
          <a
            className="unit-icon-link"
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Ver ${cap.title} no mapa`}
            title="Ver no mapa"
          >
            <FaMapMarkerAlt aria-hidden="true" />
          </a>
        ) : null}
      </div>
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
