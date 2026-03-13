import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import CapsCard from '../components/CapsCard'
import { caps } from '../data/mock'
import { Cap } from '../types'

import '../Styles/CapsPage.css'

const donationOptions = ['Roupas', 'Comida', 'Utensílios']
const selectionAnimationDurationMs = 260

export default function CapsPage(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [selectionPreviewId, setSelectionPreviewId] = useState<string | null>(null)
  const [showUnitChooser, setShowUnitChooser] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({})
  const [donationDate, setDonationDate] = useState('')
  const [donationTime, setDonationTime] = useState('')
  const [anonymousDonation, setAnonymousDonation] = useState<'sim' | 'não'>('não')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [formMessage, setFormMessage] = useState<string>('')
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const selectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const donationFlowRef = useRef<HTMLDivElement | null>(null)
  const shouldScrollToDonationRef = useRef(false)

  const selectedUnitParam = searchParams.get('unit')

  const selectedUnit = useMemo(
    () => caps.find((unit) => unit.id === selectedUnitId) ?? null,
    [selectedUnitId]
  )

  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
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
    shouldScrollToDonationRef.current = true
  }, [selectedUnitParam])

  useEffect(() => {
    if (!shouldScrollToDonationRef.current || !selectedUnit || showUnitChooser) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      donationFlowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      shouldScrollToDonationRef.current = false
    }, 120)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [selectedUnit, showUnitChooser])

  const resetDonationForm = (): void => {
    setSelectedItems([])
    setItemQuantities({})
    setDonationDate('')
    setDonationTime('')
    setAnonymousDonation('não')
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
      return
    }

    setSelectionPreviewId(unit.id)

    selectionTimeoutRef.current = setTimeout(() => {
      setSelectedUnitId(unit.id)
      resetDonationForm()
      setSelectionPreviewId(null)
      setShowUnitChooser(false)
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
    setSearchParams({})
  }

  const handleCloseDonationSuccess = (): void => {
    setShowSuccessOverlay(false)
    setSelectedUnitId(null)
    setShowUnitChooser(true)
    resetDonationForm()
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

  const handleRegisterDonation = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (!selectedUnit || selectedItems.length === 0 || !donationDate || !donationTime) {
      setFormMessage('Preencha dia, horário e selecione ao menos um tipo de doação.')
      return
    }

    const missingQty = selectedItems.some((item) => !itemQuantities[item]?.trim())
    if (missingQty) {
      setFormMessage('Informe a quantidade para cada item selecionado.')
      return
    }

    if (anonymousDonation === 'não' && (!donorName.trim() || !donorEmail.trim())) {
      setFormMessage('Preencha seu nome e e-mail para continuar.')
      return
    }

    const itensList = selectedItems
      .map((item) => `${item}: ${itemQuantities[item]}`)
      .join(', ')

    const identidade = anonymousDonation === 'sim' ? 'Doador anônimo' : `Doador: ${donorName} (${donorEmail})`

    const successMsg = `Registro salvo para ${selectedUnit.title}. Dia: ${donationDate}, Horário: ${donationTime}. Itens: ${itensList}. ${identidade}.`
    setSuccessMessage(successMsg)
    setShowSuccessOverlay(true)
  }

  return (
    <section className="page-block caps-page">
      {showSuccessOverlay ? (
        <div className="donation-success-overlay">
          <article className="donation-success-card">
            <span className="page-kicker">Contribuição registrada</span>
            <h2>Obrigado por apoiar o cuidado em saúde mental.</h2>
            <p>
              Sua doação foi registrada e ajudará na continuidade das atividades
              dos CAPS.
            </p>
            <p className="donation-success-details">{successMessage}</p>

            <div className="donation-success-actions">
              <button
                type="button"
                className="unit-donate-button"
                onClick={() => setShowSuccessOverlay(false)}
              >
                Fazer nova doação
              </button>
              <button
                type="button"
                className="donation-success-close"
                onClick={handleCloseDonationSuccess}
              >
                Voltar à seleção de unidades
              </button>
            </div>
          </article>
        </div>
      ) : null}

      <span className="page-kicker">Rede de saúde mental</span>
      <h2>Rede de Saúde Mental - Campo Grande (MS)</h2>
      <p>
        Clique em uma unidade para abrir os botões de doação, ver instruções e
        registrar dia, horário e preferência de doador anônimo.
      </p>

      {selectedUnit && !showUnitChooser ? (
        <article className={`page-card selected-unit-spotlight selected-unit-spotlight--enter${selectedUnit.photo ? '' : ' selected-unit-spotlight--no-photo'}`}>
          {selectedUnit.photo ? (
            <div className="selected-unit-spotlight__media">
              <img
                className="selected-unit-spotlight__photo"
                src={selectedUnit.photo}
                alt={`Foto da unidade ${selectedUnit.title}`}
              />
            </div>
          ) : null}

          <div className="selected-unit-spotlight__content">
            <span className="unit-type-badge">Unidade selecionada</span>
            <h3>{selectedUnit.title}</h3>
            <p><strong>Tipo:</strong> {selectedUnit.unitType}</p>
            <p><strong>Endereço:</strong> {selectedUnit.address}</p>
            <p><strong>Contato:</strong> {selectedUnit.contact ?? 'Contato não informado'}</p>
            {selectedUnit.capacity ? <p>{selectedUnit.capacity}</p> : null}
            {selectedUnit.description ? <p>{selectedUnit.description}</p> : null}
            {selectedUnit.privacyNote ? <p>{selectedUnit.privacyNote}</p> : null}

            <button
              type="button"
              className="unit-donate-button"
              onClick={handleShowUnitChooser}
            >
              Alterar doação desta unidade
            </button>
          </div>
        </article>
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
            <h3>Instruções de doação</h3>
            <p className="donation-guidelines__unit">
              <strong>Unidade:</strong> {selectedUnit.title}
            </p>
            <p>Itens aceitos: roupas, comida e utensílios.</p>
            <p className="guideline-warning">Não aceitamos dinheiro.</p>

            <div className="donation-actions" role="group" aria-label="Botões de doação">
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
                <fieldset>
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
                <input
                  type="date"
                  value={donationDate}
                  onChange={(event) => setDonationDate(event.target.value)}
                />
              </label>

              <label>
                Horário da entrega
                <input
                  type="time"
                  value={donationTime}
                  onChange={(event) => setDonationTime(event.target.value)}
                />
              </label>

              <fieldset>
                <legend>Doador anônimo?</legend>
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
                    value="não"
                    checked={anonymousDonation === 'não'}
                    onChange={() => setAnonymousDonation('não')}
                  />
                  Não
                </label>
              </fieldset>

              {anonymousDonation === 'não' ? (
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

              <button type="submit" className="unit-donate-button">
                Registrar intenção de doação
              </button>

              {formMessage ? <p className="form-feedback">{formMessage}</p> : null}
            </form>
          </article>
        </div>
      ) : null}
    </section>
  )
}
