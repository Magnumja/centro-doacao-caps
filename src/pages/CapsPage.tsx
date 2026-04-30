import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import CapsCard from '../components/CapsCard'
import CategoryFilter from '../components/CategoryFilter'
import DonationRequestCard from '../components/DonationRequestCard'
import { getMapsUrl, getWhatsAppUrl } from '../lib/contact'
import { fetchPublicNeeds } from '../lib/needs'
import { Cap, DonationCategoryName, Need } from '../types'
import { registerDonations, validateDonationInput } from '../services/donations-service'
import { saveDonorIntention } from '../services/donor-intentions-service'
import { fetchUnits } from '../services/units-service'
import { caps as mockCaps, donationCategories, needs as mockNeeds } from '../data/mockData'

import '../Styles/CapsPage.css'

const donationOptions = donationCategories
const selectionAnimationDurationMs = 260

function resolveUnitPhotoPath(photo?: string): string | undefined {
  if (!photo) return undefined
  if (photo.startsWith('/')) {
    try {
      return new URL(`../public${photo}`, import.meta.url).href
    } catch {
      return photo
    }
  }
  return photo
}

export default function CapsPage(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useParams()
  const navigate = useNavigate()

  const routeUnitId = params['*']?.split('/').filter(Boolean)[0]
  const selectedUnitParam = searchParams.get('unit') ?? routeUnitId ?? null

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [caps, setCaps] = useState<Cap[]>([])
  const [allNeeds, setAllNeeds] = useState<Need[]>(mockNeeds)
  const [activeCategory, setActiveCategory] = useState<DonationCategoryName | 'Todas'>('Todas')
  const [selectionPreviewId, setSelectionPreviewId] = useState<string | null>(null)
  const [showUnitChooser, setShowUnitChooser] = useState(true)

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

  useEffect(() => {
    let mounted = true

    async function loadUnits() {
      try {
        const mapped = await fetchUnits(resolveUnitPhotoPath)
        if (mounted) setCaps(mapped && mapped.length > 0 ? mapped : mockCaps)
      } catch {
        if (mounted) setCaps(mockCaps)
      }
    }

    async function loadNeeds() {
      try {
        const loadedNeeds = await fetchPublicNeeds()
        if (mounted) setAllNeeds(loadedNeeds.length > 0 ? loadedNeeds : mockNeeds)
      } catch {
        if (mounted) setAllNeeds(mockNeeds)
      }
    }

    void loadUnits()
    void loadNeeds()

    return () => {
      mounted = false
    }
  }, [])

  const selectedUnit = useMemo(
    () => caps.find((unit) => unit.id === selectedUnitId),
    [caps, selectedUnitId],
  )

  const selectedUnitNeeds = useMemo(
    () => allNeeds.filter((need) => need.unitId === selectedUnit?.id),
    [allNeeds, selectedUnit?.id],
  )

  const filteredUnitNeeds = useMemo(
    () => activeCategory === 'Todas'
      ? selectedUnitNeeds
      : selectedUnitNeeds.filter((need) => need.category === activeCategory),
    [activeCategory, selectedUnitNeeds],
  )

  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!selectedUnitParam) {
      return
    }

    const matchedUnit = caps.find((unit) => unit.id === selectedUnitParam)
    if (!matchedUnit) {
      return
    }

    setSelectedUnitId(matchedUnit.id)
    setSelectionPreviewId(null)
    resetDonationForm()
    setShowUnitChooser(false)
    setActiveCategory('Todas')
  }, [selectedUnitParam, caps])

  useEffect(() => {
    if (!shouldScrollToDonationRef.current || !selectedUnit || showUnitChooser) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      donationFlowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      shouldScrollToDonationRef.current = false
    }, 120)

    return () => window.clearTimeout(timeoutId)
  }, [selectedUnit, showUnitChooser, selectedItems])

  const resetDonationForm = (): void => {
    setSelectedItems([])
    setItemQuantities({})
    setDonationDate('')
    setDonationTime('')
    setAnonymousDonation('nao')
    setDonorName('')
    setDonorEmail('')
    setFormMessage('')
  }

  const handleSelectDonation = (unit: Cap): void => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
    }

    if (selectedUnitId === unit.id && showUnitChooser) {
      setSelectionPreviewId(null)
      setShowUnitChooser(false)
      navigate(`/caps/${unit.id}`)
      return
    }

    setSelectionPreviewId(unit.id)

    selectionTimeoutRef.current = setTimeout(() => {
      setSelectedUnitId(unit.id)
      resetDonationForm()
      setSelectionPreviewId(null)
      setShowUnitChooser(false)
      setActiveCategory('Todas')
      navigate(`/caps/${unit.id}`)
      selectionTimeoutRef.current = null
    }, selectionAnimationDurationMs)
  }

  const handleShowUnitChooser = (): void => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
      selectionTimeoutRef.current = null
    }

    setSelectionPreviewId(null)
    resetDonationForm()
    setShowUnitChooser(true)
    setShowSuccessOverlay(false)
    setSelectedUnitId(null)
    setSearchParams({})
    navigate('/caps')
  }

  const handleCloseDonationSuccess = (): void => {
    setShowSuccessOverlay(false)
    setSelectedUnitId(null)
    setShowUnitChooser(true)
    resetDonationForm()
    navigate('/caps')
  }

  const toggleItem = (item: string): void => {
    setFormMessage('')
    setSelectedItems((prevItems) => {
      if (prevItems.includes(item)) {
        setItemQuantities((prev) => {
          const next = { ...prev }
          delete next[item]
          return next
        })
        return prevItems.filter((existingItem) => existingItem !== item)
      }

      return [...prevItems, item]
    })
  }

  const handleQuantityChange = (item: string, value: string): void => {
    setItemQuantities((prev) => ({ ...prev, [item]: value }))
  }

  const handleDonateFromRequest = (need: Need): void => {
    const category = String(need.category)
    const remaining = Math.max(need.amount - (need.donatedAmount ?? 0), 1)

    setSelectedItems((current) => current.includes(category) ? current : [...current, category])
    setItemQuantities((current) => ({ ...current, [category]: String(remaining) }))
    setFormMessage('')
    shouldScrollToDonationRef.current = true
  }

  const handleRegisterDonation = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isSubmittingDonation) return

    const validationError = validateDonationInput({
      unitSlug: selectedUnit?.id ?? '',
      selectedItems,
      itemQuantities,
      donationDate,
      donationTime,
      anonymousDonation,
      donorName,
      donorEmail,
    })

    if (validationError) {
      setFormMessage(validationError)
      return
    }

    const unit = selectedUnit
    if (!unit) {
      setFormMessage('Selecione uma unidade para continuar.')
      return
    }

    setIsSubmittingDonation(true)

    ;(async () => {
      try {
        await registerDonations({
          unitSlug: unit.id,
          selectedItems,
          itemQuantities,
          donationDate,
          donationTime,
          anonymousDonation,
          donorName,
          donorEmail,
        })

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
          donorName: anonymousDonation === 'sim' ? undefined : donorName,
        })

        const itensList = selectedItems.map((it) => `${it}: ${itemQuantities[it]}`).join(', ')
        const identidade = anonymousDonation === 'sim' ? 'Doador anonimo' : `Doador: ${donorName} (${donorEmail})`
        const successMsg = `Registro salvo para ${unit.title}. Dia: ${donationDate}, horario: ${donationTime}. Itens: ${itensList}. ${identidade}.`

        setSuccessMessage(successMsg)
        setShowSuccessOverlay(true)
        setFormMessage('')
      } catch (err: any) {
        setFormMessage(err?.message || 'Nao foi possivel registrar a doacao agora. Tente novamente em instantes.')
      } finally {
        setIsSubmittingDonation(false)
      }
    })()
  }

  const whatsappUrl = selectedUnit ? getWhatsAppUrl(selectedUnit) : undefined
  const mapsUrl = selectedUnit ? getMapsUrl(selectedUnit.address) : undefined

  return (
    <section className="page-block caps-page">
      {showSuccessOverlay ? (
        <div className="donation-success-overlay">
          <article className="donation-success-card">
            <span className="page-kicker">Contribuicao registrada</span>
            <h2>Obrigado por apoiar o cuidado em saude mental.</h2>
            <p>Sua doacao foi registrada e ajudara a rede CAPS a acompanhar os apoios recebidos.</p>
            <p className="donation-success-details">{successMessage}</p>

            <div className="donation-success-actions">
              <button type="button" className="unit-donate-button" onClick={() => setShowSuccessOverlay(false)}>
                Fazer nova doacao
              </button>
              <button type="button" className="donation-success-close" onClick={handleCloseDonationSuccess}>
                Voltar a selecao de unidades
              </button>
              <Link className="donation-success-link" to="/suas-doacoes">
                Ver suas doacoes
              </Link>
            </div>
          </article>
        </div>
      ) : null}

      <div className="caps-page__intro">
        <span className="page-kicker">Rede de saude mental</span>
        <h2>{selectedUnit && !showUnitChooser ? selectedUnit.title : 'Unidades CAPS de Campo Grande'}</h2>
        <p>
          Consulte dados de contato, pedidos abertos e prioridades de cada unidade. Ao encontrar um item que
          voce pode doar, combine a entrega com o CAPS e registre sua intencao para facilitar o acompanhamento.
        </p>
      </div>

      {selectedUnit && !showUnitChooser ? (
        <>
          <article className={`page-card selected-unit-spotlight selected-unit-spotlight--enter${selectedUnit.photo ? '' : ' selected-unit-spotlight--no-photo'}`}>
            {selectedUnit.photo ? (
              <div className="selected-unit-spotlight__media">
                <img
                  className="selected-unit-spotlight__photo"
                  src={selectedUnit.photo}
                  alt={`Foto da unidade ${selectedUnit.title}`}
                  onError={(event) => {
                    if (event.currentTarget.dataset.errorHandled === 'true') return
                    event.currentTarget.dataset.errorHandled = 'true'
                    const fallback = selectedUnit.photo?.startsWith('/') ? resolveUnitPhotoPath(selectedUnit.photo) : undefined
                    if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback
                  }}
                />
              </div>
            ) : null}

            <div className="selected-unit-spotlight__content">
              <span className="unit-type-badge">Unidade selecionada</span>
              <h3>{selectedUnit.title}</h3>
              <p><strong>Tipo:</strong> {selectedUnit.unitType}</p>
              <p><strong>Endereco:</strong> {selectedUnit.address}</p>
              <p><strong>Contato:</strong> {selectedUnit.contact ?? 'Contato nao informado'}</p>
              {selectedUnit.operatingHours ? <p><strong>Horario:</strong> {selectedUnit.operatingHours}</p> : null}
              {selectedUnit.needsSummary ? <p><strong>Resumo das necessidades:</strong> {selectedUnit.needsSummary}</p> : null}
              {selectedUnit.description ? <p>{selectedUnit.description}</p> : null}
              {selectedUnit.capacity ? <p>{selectedUnit.capacity}</p> : null}
              {selectedUnit.privacyNote ? <p>{selectedUnit.privacyNote}</p> : null}

              <div className="selected-unit-actions">
                {whatsappUrl ? (
                  <a className="unit-donate-button" href={whatsappUrl} target="_blank" rel="noreferrer">
                    <FaWhatsapp aria-hidden="true" />
                    Falar pelo WhatsApp
                  </a>
                ) : (
                  <span className="unit-disabled-action">WhatsApp nao informado</span>
                )}
                {mapsUrl ? (
                  <a className="unit-secondary-button" href={mapsUrl} target="_blank" rel="noreferrer">
                    <FaMapMarkerAlt aria-hidden="true" />
                    Ver no mapa
                  </a>
                ) : null}
                <button type="button" className="unit-secondary-button" onClick={handleShowUnitChooser}>
                  Ver outras unidades
                </button>
              </div>
            </div>
          </article>

          <section className="unit-needs-section">
            <div className="section-heading">
              <span className="page-kicker">Necessidades da unidade</span>
              <h2>Pedidos cadastrados para {selectedUnit.title}</h2>
            </div>

            <CategoryFilter
              categories={donationCategories}
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />

            {filteredUnitNeeds.length > 0 ? (
              <div className="unit-needs-grid">
                {filteredUnitNeeds.map((need) => (
                  <DonationRequestCard key={need.id} need={need} onDonate={handleDonateFromRequest} />
                ))}
              </div>
            ) : (
              <p className="home-urgent-empty">Nao ha pedidos nesta categoria para a unidade selecionada.</p>
            )}
          </section>
        </>
      ) : (
        <div className="card-grid caps-card-grid">
          {caps.map((c) => (
            <CapsCard
              key={c.id}
              cap={c}
              isSelected={selectedUnitId === c.id}
              isAnimatingSelection={selectionPreviewId === c.id}
              onSelectDonation={handleSelectDonation}
            />
          ))}
        </div>
      )}

      {selectedUnit && !showUnitChooser ? (
        <div ref={donationFlowRef} className="donation-flow-grid">
          <article className="page-card donation-panel donation-guidelines">
            <h3>Registrar interesse em doar</h3>
            <p className="donation-guidelines__unit"><strong>Unidade:</strong> {selectedUnit.title}</p>
            <p>Selecione uma ou mais categorias, informe quantidade e combine a entrega com a unidade.</p>
            <p className="guideline-warning">Nao aceitamos dinheiro pelo site.</p>

            <div className="donation-actions" role="group" aria-label="Categorias de doacao">
              {donationOptions.map((item) => {
                const active = selectedItems.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    className={`donation-action-button${active ? ' donation-action-button--active' : ''}`}
                    onClick={() => toggleItem(item)}
                  >
                    {item}
                  </button>
                )
              })}
            </div>

            <form className="donation-form" onSubmit={handleRegisterDonation}>
              {selectedItems.length > 0 ? (
                <fieldset className="donation-form__quantities">
                  <legend>Quantidade por item</legend>
                  {selectedItems.map((item) => (
                    <label key={item}>
                      {item}
                      <input
                        type="text"
                        placeholder={`Quantidade de ${item.toLowerCase()}`}
                        value={itemQuantities[item] ?? ''}
                        onChange={(event) => handleQuantityChange(item, event.target.value)}
                      />
                    </label>
                  ))}
                </fieldset>
              ) : null}

              <label>
                Dia da entrega
                <input type="date" value={donationDate} onChange={(event) => setDonationDate(event.target.value)} />
              </label>

              <label>
                Horario da entrega
                <input type="time" value={donationTime} onChange={(event) => setDonationTime(event.target.value)} />
              </label>

              <fieldset className="donation-form__anonymity">
                <legend>Doador anonimo?</legend>
                <label>
                  <input
                    type="radio"
                    name="anonymousDonation"
                    value="sim"
                    checked={anonymousDonation === 'sim'}
                    onChange={() => setAnonymousDonation('sim')}
                  />
                  Sim
                </label>
                <label>
                  <input
                    type="radio"
                    name="anonymousDonation"
                    value="nao"
                    checked={anonymousDonation === 'nao'}
                    onChange={() => setAnonymousDonation('nao')}
                  />
                  Nao
                </label>
              </fieldset>

              {anonymousDonation === 'nao' ? (
                <>
                  <label>
                    Seu nome
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={donorName}
                      onChange={(event) => setDonorName(event.target.value)}
                    />
                  </label>
                  <label>
                    Seu e-mail
                    <input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={donorEmail}
                      onChange={(event) => setDonorEmail(event.target.value)}
                    />
                  </label>
                </>
              ) : null}

              <button type="submit" className="unit-donate-button" disabled={isSubmittingDonation}>
                {isSubmittingDonation ? 'Registrando...' : 'Registrar intencao de doacao'}
              </button>

              {formMessage ? <p className="form-feedback" role="status" aria-live="polite">{formMessage}</p> : null}
            </form>
          </article>
        </div>
      ) : null}
    </section>
  )
}
