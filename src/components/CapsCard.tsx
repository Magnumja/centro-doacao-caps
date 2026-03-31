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

  // Resolve photo path when project keeps images under `src/public`.
  // Vite serves files placed in `public/` at the root path (e.g. `/caps.jpg`).
  // If `cap.photo` is an absolute path starting with '/', use it directly so
  // the browser requests `/capsmargarida.jpg`. For other strings (for
  // example relative imports or module-resolved assets), build a URL using
  // `import.meta.url` so bundlers can process them.
  const resolvedPhoto = (() => {
    if (typeof cap.photo !== 'string' || cap.photo.length === 0) return undefined
    // For absolute paths (starting with '/'), prefer the root path first.
    // Many entries use '/capsmargarida.jpg' while the repo currently stores
    // images under `src/public/`. We'll set the img src to the root path
    // and use an onError fallback to the bundled file below.
    if (cap.photo.startsWith('/')) return cap.photo
    try {
      return new URL(cap.photo, import.meta.url).href
    } catch (err) {
      return cap.photo
    }
  })()

  // If `cap.photo` starts with '/', prepare a fallback URL that points to
  // the asset placed in `src/public` relative to this module. This is used
  // only as a fallback when the root-path `/...` 404s in the browser.
  const bundledFallback = (typeof cap.photo === 'string' && cap.photo.startsWith('/'))
    ? (() => {
      try {
        return new URL(`../public${cap.photo}`, import.meta.url).href
      } catch (err) {
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
      {/* Foto opcional da unidade */}
      {resolvedPhoto ? (
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
