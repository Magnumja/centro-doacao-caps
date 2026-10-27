import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FaCalendarCheck,
  FaClock,
  FaGift,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaTimes,
  FaUser,
  FaWhatsapp,
} from 'react-icons/fa'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import CapsCard from '../components/CapsCard'
import { donationCategories } from '../data/mockData'
import { useNeeds, useUnits } from '../hooks/usePublicData'
import { getErrorMessage } from '../lib/api'
import { getMapsUrl, getWhatsAppUrl } from '../lib/contact'
import { formatDate, todayISODate } from '../lib/format'
import { getUnitPath } from '../lib/routes'
import { isOpen, isUrgent } from '../lib/stats'
import { registerDonations, validateDonationInput } from '../services/donations-service'
import { saveDonorIntention } from '../services/donor-intentions-service'
import { Cap, Need } from '../types'

const selectionAnimationDurationMs = 260
const donationTimeOptions = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
]
const suggestedDonationTimes = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00']

// Rotas aceitas:
//   /caps                     -> lista de unidades
//   /caps/:unidade            -> unidade selecionada + formulário
//   /caps/:unidade?pedido=ID  -> idem, já com o item do pedido preenchido
//   /caps?unit=:unidade       -> formato antigo, redirecionado para /caps/:unidade
export default function CapsPage(): React.ReactElement {
  const [searchParams] = useSearchParams()
  const params = useParams()
  const navigate = useNavigate()

  // A URL é a fonte única de verdade da unidade selecionada.
  const routeUnitId = params['*']?.split('/').filter(Boolean)[0] ?? null
  const legacyUnitParam = searchParams.get('unit')
  const requestedNeedId = searchParams.get('pedido')

  const { units: caps, isLoading: isLoadingUnits } = useUnits()
  const { needs: allNeeds } = useNeeds()

  const [selectionPreviewId, setSelectionPreviewId] = useState<string | null>(null)
  const [isEnteringUnit, setIsEnteringUnit] = useState(false)

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({})
  const [donationDate, setDonationDate] = useState('')
  const [donationTime, setDonationTime] = useState('')
  const [anonymousDonation, setAnonymousDonation] = useState<'sim' | 'nao'>('nao')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [formMessage, setFormMessage] = useState<string>('')
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')

  const selectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const donationFlowRef = useRef<HTMLDivElement | null>(null)
  const shouldScrollToDonationRef = useRef(false)

  const selectedUnit = useMemo(
    () => (routeUnitId ? caps.find((unit) => unit.id === routeUnitId) : undefined),
    [caps, routeUnitId],
  )
  const unitNotFound = Boolean(routeUnitId) && !isLoadingUnits && !selectedUnit

  const selectedUnitNeeds = useMemo(
    () => (selectedUnit ? allNeeds.filter((need) => need.unitId === selectedUnit.id) : []),
    [allNeeds, selectedUnit],
  )

  const resetDonationForm = useCallback((): void => {
    setSelectedItems([])
    setItemQuantities({})
    setDonationDate('')
    setDonationTime('')
    setAnonymousDonation('nao')
    setDonorName('')
    setDonorEmail('')
    setFormMessage('')
  }, [])

  // Links antigos (/caps?unit=c1) continuam funcionando.
  useEffect(() => {
    if (!legacyUnitParam) return
    const query = requestedNeedId ? `?pedido=${encodeURIComponent(requestedNeedId)}` : ''
    navigate(`${getUnitPath(legacyUnitParam)}${query}`, { replace: true })
  }, [legacyUnitParam, navigate, requestedNeedId])

  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current)
    }
  }, [])

  // Ao trocar de unidade: formulário limpo e animação de entrada.
  useEffect(() => {
    setSelectionPreviewId(null)
    setShowSuccessOverlay(false)
    resetDonationForm()
    if (routeUnitId) setIsEnteringUnit(true)
  }, [routeUnitId, resetDonationForm])

  const handleDonateFromRequest = useCallback((need: Need): void => {
    const category = String(need.category)
    const remaining = Math.max(need.amount - (need.donatedAmount ?? 0), 1)

    setSelectedItems((current) => (current.includes(category) ? current : [...current, category]))
    setItemQuantities((current) => ({ ...current, [category]: String(remaining) }))
    setFormMessage('')
    shouldScrollToDonationRef.current = true
  }, [])

  // Chegou por "Doar este pedido" (?pedido=ID): preenche o item e leva ao formulário.
  useEffect(() => {
    if (!requestedNeedId || !selectedUnit) return
    const need = selectedUnitNeeds.find((candidate) => candidate.id === requestedNeedId)
    if (!need) return

    handleDonateFromRequest(need)
    navigate(getUnitPath(selectedUnit.id), { replace: true })
  }, [handleDonateFromRequest, navigate, requestedNeedId, selectedUnit, selectedUnitNeeds])

  useEffect(() => {
    if (!shouldScrollToDonationRef.current || !selectedUnit) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      donationFlowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      shouldScrollToDonationRef.current = false
    }, 120)

    return () => window.clearTimeout(timeoutId)
  }, [selectedUnit, selectedItems])

  // Esc fecha a confirmação de doação (padrão de diálogo acessível).
  useEffect(() => {
    if (!showSuccessOverlay) return undefined

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setShowSuccessOverlay(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSuccessOverlay])

  const handleSelectDonation = useCallback((unit: Cap): void => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
    }

    // Pequeno destaque visual no card antes de abrir a unidade.
    setSelectionPreviewId(unit.id)
    selectionTimeoutRef.current = setTimeout(() => {
      selectionTimeoutRef.current = null
      navigate(getUnitPath(unit.id))
    }, selectionAnimationDurationMs)
  }, [navigate])

  const handleShowUnitChooser = (): void => {
    navigate('/caps')
  }

  const handleRegisterAnotherDonation = (): void => {
    setShowSuccessOverlay(false)
    resetDonationForm()
  }

  const toggleItem = (item: string): void => {
    setFormMessage('')
    setSelectedItems((prevItems) => (prevItems.includes(item) ? prevItems : [...prevItems, item]))
  }

  const removeSelectedItem = (item: string): void => {
    setSelectedItems((current) => current.filter((selectedItem) => selectedItem !== item))
    setItemQuantities((current) => {
      const next = { ...current }
      delete next[item]
      return next
    })
    setFormMessage('')
  }

  const handleQuantityChange = (item: string, value: string): void => {
    setItemQuantities((prev) => ({ ...prev, [item]: value }))
  }

  const handleRegisterDonation = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (isSubmittingDonation) return

    const unit = selectedUnit
    if (!unit) {
      setFormMessage('Selecione uma unidade para continuar.')
      return
    }

    const input = {
      unitSlug: unit.id,
      selectedItems,
      itemQuantities,
      donationDate,
      donationTime,
      anonymousDonation,
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim(),
    }

    const validationError = validateDonationInput(input)
    if (validationError) {
      setFormMessage(validationError)
      return
    }

    setIsSubmittingDonation(true)

    try {
      await registerDonations(input)

      saveDonorIntention({
        unitSlug: unit.id,
        unitName: unit.title,
        items: selectedItems.map((item) => ({
          name: item,
          quantity: itemQuantities[item],
        })),
        donationDate,
        donationTime,
        isAnonymous: anonymousDonation === 'sim',
        donorName: anonymousDonation === 'sim' ? undefined : input.donorName,
        donorEmail: anonymousDonation === 'sim' ? undefined : input.donorEmail,
      })

      const itemsList = selectedItems.map((item) => `${item}: ${itemQuantities[item]}`).join(', ')
      const identity = anonymousDonation === 'sim' ? 'Doador anônimo' : `Doador: ${input.donorName} (${input.donorEmail})`
      setSuccessMessage(`Registro salvo para ${unit.title}. Dia: ${formatDate(donationDate)}, horário: ${donationTime}. Itens: ${itemsList}. ${identity}.`)
      setShowSuccessOverlay(true)
      setFormMessage('')
    } catch (error) {
      setFormMessage(getErrorMessage(error, 'Não foi possível registrar a doação agora. Tente novamente em instantes.'))
    } finally {
      setIsSubmittingDonation(false)
    }
  }

  const whatsappUrl = selectedUnit ? getWhatsAppUrl(selectedUnit) : undefined
  const mapsUrl = selectedUnit ? getMapsUrl(selectedUnit.address) : undefined
  const selectedUnitOpenNeeds = selectedUnitNeeds.filter(isOpen).length
  const selectedUnitUrgentNeeds = selectedUnitNeeds.filter(isUrgent).length
  const selectedDonationSummary = selectedItems.map((item) => ({
    name: item,
    quantity: itemQuantities[item]?.trim() || 'Quantidade pendente',
  }))
  const availableDonationOptions = donationCategories.filter((item) => !selectedItems.includes(item))
  const minDonationDate = todayISODate()
  const donorIdentityLabel = anonymousDonation === 'sim'
    ? 'Doação anônima'
    : donorName.trim() || 'Nome pendente'

  return (
    <section className="page-block caps-page">
      {showSuccessOverlay ? (
        <div className="donation-success-overlay">
          <article
            className="donation-success-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-success-title"
          >
            <span className="page-kicker">Contribuição registrada</span>
            <h2 id="donation-success-title">Obrigado por apoiar o cuidado em saúde mental.</h2>
            <p>Sua doação foi registrada e ajudará a rede CAPS a acompanhar os apoios recebidos.</p>
            <p className="donation-success-details">{successMessage}</p>

            <div className="donation-success-actions">
              <button type="button" className="unit-donate-button" onClick={handleRegisterAnotherDonation} autoFocus>
                Fazer nova doação
              </button>
              <button type="button" className="donation-success-close" onClick={handleShowUnitChooser}>
                Voltar à seleção de unidades
              </button>
              <Link className="donation-success-link" to="/suas-doacoes">
                Ver suas doações
              </Link>
            </div>
          </article>
        </div>
      ) : null}

      <div className="caps-page__intro">
        <span className="page-kicker">Rede de saúde mental</span>
        <h1>{selectedUnit ? selectedUnit.title : 'Unidades CAPS de Campo Grande'}</h1>
        <p>
          {selectedUnit
            ? 'Contato, pedidos e registro de doação em uma visão compacta.'
            : 'Consulte dados de contato, pedidos abertos e prioridades de cada unidade. Ao encontrar um item que você pode doar, combine a entrega com o CAPS e registre sua intenção para facilitar o acompanhamento.'}
        </p>
      </div>

      {selectedUnit ? (
        <>
          <section
            className={`selected-unit-overview${isEnteringUnit ? ' selected-unit-spotlight--enter' : ''}${selectedUnit.photo ? '' : ' selected-unit-overview--no-photo'}`}
            onAnimationEnd={() => setIsEnteringUnit(false)}
            aria-labelledby="selected-unit-section-title"
          >
            <h2 id="selected-unit-section-title" className="sr-only">Informações da unidade</h2>
            {selectedUnit.photo ? (
              <article className="selected-unit-photo-card">
                <img
                  className="selected-unit-spotlight__photo"
                  src={selectedUnit.photo}
                  alt={`Foto da unidade ${selectedUnit.title}`}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              </article>
            ) : null}

            <article className="selected-unit-info-card selected-unit-info-card--identity">
              <span className="unit-type-badge">Unidade selecionada</span>
              <h3>{selectedUnit.title}</h3>
              <p>{selectedUnit.description ?? 'Unidade da Rede de Atenção Psicossocial de Campo Grande/MS.'}</p>
              {selectedUnit.capacity ? <p>{selectedUnit.capacity}</p> : null}
              {selectedUnit.privacyNote ? <p>{selectedUnit.privacyNote}</p> : null}
            </article>

            <article className="selected-unit-info-card selected-unit-contact-card">
              <span className="info-card-label">Endereço e contato</span>
              <p><strong>Endereço</strong>{selectedUnit.address}</p>
              <p><strong>Contato</strong>{selectedUnit.contact ?? 'Contato não informado'}</p>
              {selectedUnit.operatingHours ? <p><strong>Horário</strong>{selectedUnit.operatingHours}</p> : null}

              <div className="selected-unit-actions">
                {whatsappUrl ? (
                  <a className="unit-donate-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp aria-hidden="true" />
                    Falar pelo WhatsApp
                  </a>
                ) : (
                  <span className="unit-disabled-action">WhatsApp não informado</span>
                )}
                {mapsUrl ? (
                  <a className="unit-secondary-button" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    <FaMapMarkerAlt aria-hidden="true" />
                    Ver no mapa
                  </a>
                ) : null}
                <button type="button" className="unit-secondary-button" onClick={handleShowUnitChooser}>
                  Ver outras unidades
                </button>
              </div>
            </article>

            <article className="selected-unit-info-card selected-unit-info-card--needs">
              <span className="info-card-label">Resumo dos pedidos</span>
              <div className="selected-unit-metrics">
                <span><strong>{selectedUnitOpenNeeds}</strong> abertos</span>
                <span><strong>{selectedUnitUrgentNeeds}</strong> urgentes</span>
              </div>
              <p>{selectedUnit.needsSummary ?? 'Confira os pedidos prioritários da unidade e escolha um item para doar.'}</p>

              {selectedUnitNeeds.length > 0 ? (
                <div className="selected-unit-compact-needs" aria-label="Pedidos resumidos da unidade">
                  {selectedUnitNeeds.slice(0, 3).map((need) => {
                    const donatedAmount = need.donatedAmount ?? 0
                    const remaining = Math.max(need.amount - donatedAmount, 0)

                    return (
                      <button
                        key={need.id}
                        type="button"
                        className={`selected-unit-compact-need selected-unit-compact-need--${need.priority ?? 'media'}`}
                        onClick={() => handleDonateFromRequest(need)}
                      >
                        <span>
                          <strong>{need.title}</strong>
                          <small>{need.category} - restante {remaining}</small>
                        </span>
                        <b>Doar</b>
                      </button>
                    )
                  })}

                  {selectedUnitNeeds.length > 3 ? (
                    <span className="selected-unit-compact-needs__more">
                      +{selectedUnitNeeds.length - 3} pedidos adicionais
                    </span>
                  ) : null}
                </div>
              ) : null}
            </article>
          </section>

        </>
      ) : (
        <>
          {unitNotFound ? (
            <p className="form-feedback" role="status">
              Não encontramos essa unidade. Escolha uma das unidades CAPS abaixo.
            </p>
          ) : null}

          {isLoadingUnits ? (
            <p className="home-urgent-empty" role="status">Carregando unidades...</p>
          ) : (
            <div className="card-grid caps-card-grid">
              <h2 className="sr-only">Unidades disponíveis para doação</h2>
              {caps.map((c) => (
                <CapsCard
                  key={c.id}
                  cap={c}
                  isSelected={false}
                  isAnimatingSelection={selectionPreviewId === c.id}
                  onSelectDonation={handleSelectDonation}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedUnit ? (
        <div ref={donationFlowRef} className="donation-flow-grid">
          <article className={`page-card donation-panel donation-guidelines${availableDonationOptions.length === 0 ? ' donation-guidelines--full-form' : ''}`}>
            <h3>Registrar interesse em doar</h3>
            <p className="donation-guidelines__unit"><strong>Unidade:</strong> {selectedUnit.title}</p>
            <div className="donation-flow-steps" aria-label="Etapas do registro">
              <span className={selectedItems.length > 0 ? 'is-complete' : ''}><FaGift aria-hidden="true" /> Itens</span>
              <span className={donationDate && donationTime ? 'is-complete' : ''}><FaCalendarCheck aria-hidden="true" /> Entrega</span>
              <span className={anonymousDonation === 'sim' || (donorName && donorEmail) ? 'is-complete' : ''}><FaUser aria-hidden="true" /> Dados</span>
            </div>
            <p className="guideline-warning">Não aceitamos dinheiro pelo site.</p>

            {availableDonationOptions.length > 0 ? (
              <div className="donation-actions" role="group" aria-label="Categorias de doação">
                {availableDonationOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="donation-action-button"
                    onClick={() => toggleItem(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}

            <form className="donation-form" onSubmit={handleRegisterDonation} noValidate>
              {selectedItems.length > 0 ? (
                <fieldset className="donation-form__quantities">
                  <legend>Quantidade por item</legend>
                  {selectedItems.map((item) => (
                    <label key={item}>
                      <span className="donation-quantity-label">
                        {item}
                        <button
                          type="button"
                          className="donation-remove-item"
                          onClick={() => removeSelectedItem(item)}
                          aria-label={`Remover ${item}`}
                        >
                          <FaTimes aria-hidden="true" />
                        </button>
                      </span>
                      <input
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        placeholder="Ex.: 10 unidades, 5 kg, 3 kits"
                        value={itemQuantities[item] ?? ''}
                        onChange={(event) => handleQuantityChange(item, event.target.value)}
                      />
                    </label>
                  ))}
                </fieldset>
              ) : null}

              <fieldset className="donation-schedule-card">
                <legend>Entrega</legend>
                <div className="donation-schedule-grid">
              <label>
                Data
                <input
                  type="date"
                  min={minDonationDate}
                  value={donationDate}
                  onChange={(event) => setDonationDate(event.target.value)}
                />
              </label>

              <label>
                Horário da entrega
                <select value={donationTime} onChange={(event) => setDonationTime(event.target.value)}>
                  <option value="">Selecione um horário</option>
                  {donationTimeOptions.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </label>

              <div className="donation-time-chips" role="group" aria-label="Horários sugeridos">
                {suggestedDonationTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={donationTime === time ? 'is-active' : ''}
                    onClick={() => setDonationTime(time)}
                  >
                    <FaClock aria-hidden="true" />
                    {time}
                  </button>
                ))}
              </div>

                </div>
              </fieldset>

              <fieldset className="donation-form__anonymity">
                <legend>Doador anônimo?</legend>
                <label className={anonymousDonation === 'sim' ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="anonymousDonation"
                    value="sim"
                    checked={anonymousDonation === 'sim'}
                    onChange={() => setAnonymousDonation('sim')}
                  />
                  <FaInfoCircle aria-hidden="true" />
                  Sim
                </label>
                <label className={anonymousDonation === 'nao' ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="anonymousDonation"
                    value="nao"
                    checked={anonymousDonation === 'nao'}
                    onChange={() => setAnonymousDonation('nao')}
                  />
                  <FaUser aria-hidden="true" />
                  Não
                </label>
              </fieldset>

              {anonymousDonation === 'nao' ? (
                <>
                  <label>
                    Seu nome
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Nome completo"
                      value={donorName}
                      onChange={(event) => setDonorName(event.target.value)}
                    />
                  </label>
                  <label>
                    Seu e-mail
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="email@exemplo.com"
                      value={donorEmail}
                      onChange={(event) => setDonorEmail(event.target.value)}
                    />
                  </label>
                </>
              ) : null}

              <button type="submit" className="unit-donate-button" disabled={isSubmittingDonation}>
                {isSubmittingDonation ? 'Registrando...' : 'Registrar intenção de doação'}
              </button>
              <button type="button" className="unit-secondary-button donation-reset-button" onClick={resetDonationForm}>
                Limpar formulário
              </button>

              {formMessage ? <p className="form-feedback" role="status" aria-live="polite">{formMessage}</p> : null}
            </form>
          </article>

          <aside className="page-card donation-summary-panel" aria-label="Resumo da intenção de doação">
            <span className="page-kicker">Resumo</span>
            <h3>Antes de registrar</h3>

            <div className="donation-summary-panel__section">
              <strong>Itens selecionados</strong>
              {selectedDonationSummary.length > 0 ? (
                <ul>
                  {selectedDonationSummary.map((item) => (
                    <li key={item.name}>
                      <span>{item.name}</span>
                      <b>{item.quantity}</b>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Escolha ao menos uma categoria para continuar.</p>
              )}
            </div>

            <div className="donation-summary-panel__section">
              <strong>Entrega</strong>
              <p>{donationDate ? formatDate(donationDate) : 'Data pendente'} às {donationTime || 'horário pendente'}</p>
            </div>

            <div className="donation-summary-panel__section">
              <strong>Identificação</strong>
              <p>{donorIdentityLabel}</p>
            </div>

            {whatsappUrl ? (
              <a className="unit-secondary-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp aria-hidden="true" />
                Combinar entrega
              </a>
            ) : null}
          </aside>
        </div>
      ) : null}
    </section>
  )
}
