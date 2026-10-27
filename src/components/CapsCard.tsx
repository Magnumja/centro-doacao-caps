import React from 'react'
import { FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { getMapsUrl, getWhatsAppUrl } from '../lib/contact'
import { getUnitPath } from '../lib/routes'
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
  const resolvedPhoto = (typeof cap.photo === 'string' && cap.photo.length > 0)
    ? cap.photo
    : undefined

  const whatsappUrl = getWhatsAppUrl(cap)
  const mapsUrl = getMapsUrl(cap.address)

  return (
    // O card inteiro é clicável com o mouse; no teclado/leitor de tela a ação fica no
    // botão "Quero doar" (um card com role="button" não pode conter outros links).
    <article
      className={`page-card donation-unit-card${isSelected || isAnimatingSelection ? ' donation-unit-card--selected' : ''}${isAnimatingSelection ? ' donation-unit-card--selecting' : ''}`}
      onClick={() => onSelectDonation(cap)}
    >
      {resolvedPhoto && (
        <img
          className="caps-card__photo"
          src={resolvedPhoto}
          alt={`Foto da unidade ${cap.title}`}
          loading="lazy"
          decoding="async"
          onError={(event) => { event.currentTarget.style.display = 'none' }}
        />
      )}

      <span className="unit-type-badge">{cap.unitType}</span>
      <h3>{cap.title}</h3>
      <div className="caps-card__details">
        <p><strong>Endereço:</strong> {cap.address}</p>
        <p><strong>Contato:</strong> {cap.contact ?? 'Contato não informado'}</p>
        {cap.needsSummary ? <p><strong>Necessidades:</strong> {cap.needsSummary}</p> : null}
      </div>

      <div className="caps-card__actions">
        <Link
          className="unit-secondary-button"
          to={getUnitPath(cap.id)}
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
          Quero doar
        </button>
        {whatsappUrl ? (
          <a
            className="unit-icon-link"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
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
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Ver ${cap.title} no mapa`}
            title="Ver no mapa"
          >
            <FaMapMarkerAlt aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </article>
  )
}

export default React.memo(CapsCard)
