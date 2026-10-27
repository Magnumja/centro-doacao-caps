import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FaCheck,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaTimes,
  FaUserCircle,
  FaWhatsapp,
} from 'react-icons/fa'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import CapsCard from '../components/CapsCard'
import { donationCategories } from '../data/mockData'
import { useDonorSession } from '../hooks/useDonorSession'
import { useNeeds, useUnits } from '../hooks/usePublicData'
import { getErrorMessage } from '../lib/api'
import { getMapsUrl, getWhatsAppUrl } from '../lib/contact'
import { formatDate, formatLongDate, todayISODate } from '../lib/format'
import { getDonorAccessPath, getUnitPath } from '../lib/routes'
import { isOpen, isUrgent } from '../lib/stats'
import { isValidEmail, registerDonations, validateDonationInput } from '../services/donations-service'
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
// Horários agrupados por período para leitura rápida (um único seletor).
const donationTimeGroups = [
  { label: 'Manhã', times: donationTimeOptions.filter((time) => time < '12:00') },
  { label: 'Tarde', times: donationTimeOptions.filter((time) => time >= '12:00') },
]

// Rotas aceitas:
//   /caps                     -> lista de unidades
//   /caps/:unidade            -> unidade selecionada + formulário
//   /caps/:unidade?pedido=ID  -> idem, já com o item do pedido preenchido
//   /caps?unit=:unidade       -> formato antigo, redirecionado para /caps/:unidade
export default function CapsPage(): React.ReactElement {
  const [searchParams] = useSearchParams()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // A URL é a fonte única de verdade da unidade selecionada.
  const routeUnitId = params['*']?.split('/').filter(Boolean)[0] ?? null
  const legacyUnitParam = searchParams.get('unit')
  const requestedNeedId = searchParams.get('pedido')

  const { units: caps, isLoading: isLoadingUnits } = useUnits()
  const { needs: allNeeds } = useNeeds()
  const { donor, isDemo } = useDonorSession()

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
  // Erros por campo só aparecem depois da primeira tentativa de envio.
  const [showErrors, setShowErrors] = useState(false)
  // Incrementa a cada formulário limpo, para reaplicar os dados da conta do doador.
  const [formVersion, setFormVersion] = useState(0)

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
    setShowErrors(false)
    setFormVersion((version) => version + 1)
  }, [])

  // Doador logado: nome e e-mail já vêm preenchidos (continuam editáveis).
  useEffect(() => {
    if (!donor) return
    setDonorName(donor.name)
    setDonorEmail(donor.email)
  }, [donor, formVersion])

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
      setShowErrors(true)
      setFormMessage(validationError)
      // Leva a pessoa direto ao primeiro campo com problema (no mobile a mensagem fica longe).
      const form = event.currentTarget
      window.requestAnimationFrame(() => {
        const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"], .donation-step__error')
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if (firstInvalid instanceof HTMLInputElement) firstInvalid.focus({ preventScroll: true })
      })
      return
    }

    setIsSubmittingDonation(true)

    try {
      await registerDonations(input)

      // Com conta real, o histórico fica no servidor; sem conta (ou na demonstração),
      // guardamos neste aparelho.
      if (!donor || isDemo) saveDonorIntention({
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
    quantity: itemQuantities[item]?.trim() ?? '',
  }))
  const minDonationDate = todayISODate()

  // Cada passo mostra ✓ quando está completo, guiando o preenchimento.
  const itemsComplete = selectedItems.length > 0 && selectedItems.every((item) => itemQuantities[item]?.trim())
  const deliveryComplete = Boolean(donationDate && donationTime)
  const identityComplete = anonymousDonation === 'sim' || (Boolean(donorName.trim()) && isValidEmail(donorEmail))

  const donorIdentityLabel = anonymousDonation === 'sim'
    ? 'Doação anônima'
    : donorName.trim() || 'Falta seu nome'
  const deliverySummary = donationDate && donationTime
    ? `${formatLongDate(donationDate)}, às ${donationTime}`
    : donationDate
      ? `${formatLongDate(donationDate)}, falta o horário`
      : 'Falta escolher data e horário'

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
            {!donor ? (
              <p className="donation-success-account">
                Quer ver suas doações em qualquer aparelho?{' '}
                <Link to={getDonorAccessPath('/suas-doacoes', 'criar')}>Crie uma conta gratuita</Link>
              </p>
            ) : null}
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
        <div ref={donationFlowRef} className="donation-flow">
          <form className="page-card donation-form" onSubmit={handleRegisterDonation} noValidate aria-labelledby="donation-form-title">
            <header className="donation-form__header">
              <h2 id="donation-form-title">Registrar intenção de doação</h2>
              <p>Três passos rápidos. A unidade usa essas informações para se preparar para receber você.</p>
            </header>

            {/* Passo 1: itens. As categorias ficam sempre no lugar; clicar marca/desmarca. */}
            <fieldset className={`donation-step${itemsComplete ? ' is-complete' : ''}`}>
              <legend className="donation-step__title">
                <span className="donation-step__number" aria-hidden="true">{itemsComplete ? <FaCheck /> : '1'}</span>
                O que você vai doar?
              </legend>
              <p className="donation-step__hint">Escolha uma ou mais categorias e informe a quantidade de cada uma.</p>

              <div className="donation-choice-grid" role="group" aria-label="Categorias de doação">
                {donationCategories.map((item) => {
                  const isSelected = selectedItems.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`donation-choice${isSelected ? ' is-selected' : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => (isSelected ? removeSelectedItem(item) : toggleItem(item))}
                    >
                      <span className="donation-choice__check" aria-hidden="true">{isSelected ? <FaCheck /> : null}</span>
                      {item}
                    </button>
                  )
                })}
              </div>

              {selectedItems.length > 0 ? (
                <div className="donation-quantity-list">
                  {selectedItems.map((item) => {
                    const fieldId = `donation-qty-${item.replace(/\W+/g, '-')}`
                    const missing = showErrors && !itemQuantities[item]?.trim()
                    return (
                      <div className="donation-quantity-row" key={item}>
                        <label htmlFor={fieldId}>Quantidade de {item.toLocaleLowerCase('pt-BR')}</label>
                        <input
                          id={fieldId}
                          type="text"
                          autoComplete="off"
                          placeholder="Ex.: 10 unidades, 5 kg, 3 kits"
                          value={itemQuantities[item] ?? ''}
                          aria-invalid={missing}
                          onChange={(event) => handleQuantityChange(item, event.target.value)}
                        />
                        <button
                          type="button"
                          className="donation-quantity-row__remove"
                          onClick={() => removeSelectedItem(item)}
                          aria-label={`Remover ${item}`}
                        >
                          <FaTimes aria-hidden="true" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : showErrors ? (
                <p className="donation-step__error">Escolha ao menos uma categoria.</p>
              ) : null}
            </fieldset>

            {/* Passo 2: entrega. Um único seletor de horário (antes havia lista + atalhos). */}
            <fieldset className={`donation-step${deliveryComplete ? ' is-complete' : ''}`}>
              <legend className="donation-step__title">
                <span className="donation-step__number" aria-hidden="true">{deliveryComplete ? <FaCheck /> : '2'}</span>
                Quando você vai entregar?
              </legend>
              {selectedUnit.operatingHours ? (
                <p className="donation-step__hint"><FaInfoCircle aria-hidden="true" /> {selectedUnit.operatingHours}</p>
              ) : null}

              <div className="donation-field">
                <label htmlFor="donation-date">Data da entrega</label>
                <input
                  id="donation-date"
                  type="date"
                  min={minDonationDate}
                  value={donationDate}
                  aria-invalid={showErrors && !donationDate}
                  onChange={(event) => setDonationDate(event.target.value)}
                />
              </div>

              <div className="donation-field" role="radiogroup" aria-labelledby="donation-time-label">
                <span id="donation-time-label" className="donation-field__label">Horário</span>
                {donationTimeGroups.map((group) => (
                  <div className="donation-time-group" key={group.label}>
                    <span className="donation-time-group__label">{group.label}</span>
                    <div className="donation-time-chips">
                      {group.times.map((time) => (
                        <button
                          key={time}
                          type="button"
                          role="radio"
                          aria-checked={donationTime === time}
                          className={donationTime === time ? 'is-active' : ''}
                          onClick={() => setDonationTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {showErrors && !donationTime ? <p className="donation-step__error">Escolha um horário.</p> : null}
              </div>
            </fieldset>

            {/* Passo 3: identificação. Pergunta direta em vez de "Doador anônimo? Sim/Não". */}
            <fieldset className={`donation-step${identityComplete ? ' is-complete' : ''}`}>
              <legend className="donation-step__title">
                <span className="donation-step__number" aria-hidden="true">{identityComplete ? <FaCheck /> : '3'}</span>
                Como você quer se identificar?
              </legend>
              {donor ? (
                <p className="donation-step__hint donation-account-note">
                  <FaUserCircle aria-hidden="true" /> Conectado como <strong>{donor.name}</strong>. Esta doação vai para o seu histórico, mesmo se for anônima para a unidade.
                </p>
              ) : (
                <p className="donation-step__hint">
                  <Link to={getDonorAccessPath(location.pathname)}>Entre na sua conta</Link> para acompanhar esta doação depois. É opcional.
                </p>
              )}

              <div className="donation-identity-options">
                <label className={anonymousDonation === 'nao' ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="anonymousDonation"
                    value="nao"
                    checked={anonymousDonation === 'nao'}
                    onChange={() => setAnonymousDonation('nao')}
                  />
                  <span>
                    <strong>Com meu nome</strong>
                    <small>A unidade pode confirmar a entrega com você.</small>
                  </span>
                </label>
                <label className={anonymousDonation === 'sim' ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="anonymousDonation"
                    value="sim"
                    checked={anonymousDonation === 'sim'}
                    onChange={() => setAnonymousDonation('sim')}
                  />
                  <span>
                    <strong>Anônimo</strong>
                    <small>Sem nome nem contato no registro.</small>
                  </span>
                </label>
              </div>

              {anonymousDonation === 'nao' ? (
                <div className="donation-identity-fields">
                  <div className="donation-field">
                    <label htmlFor="donor-name">Seu nome</label>
                    <input
                      id="donor-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Nome completo"
                      value={donorName}
                      aria-invalid={showErrors && !donorName.trim()}
                      onChange={(event) => setDonorName(event.target.value)}
                    />
                  </div>
                  <div className="donation-field">
                    <label htmlFor="donor-email">Seu e-mail</label>
                    <input
                      id="donor-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="nome@exemplo.com"
                      value={donorEmail}
                      aria-invalid={showErrors && !isValidEmail(donorEmail)}
                      onChange={(event) => setDonorEmail(event.target.value)}
                    />
                  </div>
                </div>
              ) : null}
            </fieldset>

            <div className="donation-form__footer">
              {formMessage ? <p className="form-feedback" role="alert">{formMessage}</p> : null}
              <button type="submit" className="unit-donate-button donation-form__submit" disabled={isSubmittingDonation}>
                {isSubmittingDonation ? 'Registrando...' : 'Registrar intenção de doação'}
              </button>
              <button type="button" className="donation-form__reset" onClick={resetDonationForm}>
                Limpar e começar de novo
              </button>
            </div>
          </form>

          <aside className="page-card donation-summary-panel" aria-label="Resumo da intenção de doação">
            <h3>Resumo</h3>
            <dl>
              <div>
                <dt>Unidade</dt>
                <dd>{selectedUnit.title}</dd>
              </div>
              <div>
                <dt>Itens</dt>
                <dd>
                  {selectedDonationSummary.length > 0 ? (
                    <ul>
                      {selectedDonationSummary.map((item) => (
                        <li key={item.name}>
                          <span>{item.name}</span>
                          <b className={item.quantity ? '' : 'is-pending'}>{item.quantity || 'falta a quantidade'}</b>
                        </li>
                      ))}
                    </ul>
                  ) : <span className="is-pending">Nenhum item escolhido</span>}
                </dd>
              </div>
              <div>
                <dt>Entrega</dt>
                <dd className={donationDate && donationTime ? '' : 'is-pending'}>{deliverySummary}</dd>
              </div>
              <div>
                <dt>Identificação</dt>
                <dd className={identityComplete ? '' : 'is-pending'}>{donorIdentityLabel}</dd>
              </div>
            </dl>

            {whatsappUrl ? (
              <a className="unit-secondary-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp aria-hidden="true" />
                Combinar entrega pelo WhatsApp
              </a>
            ) : null}
            <p className="donation-summary-panel__note">Doações apenas em itens. O site não recebe dinheiro.</p>
          </aside>
        </div>
      ) : null}
    </section>
  )
}
