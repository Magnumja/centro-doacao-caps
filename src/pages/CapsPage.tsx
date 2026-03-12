import React, { useMemo, useState } from 'react'

import CapsCard from '../components/CapsCard'
import { caps } from '../data/mock'
import { Cap } from '../types'

import '../Styles/CapsPage.css'

const donationOptions = ['Roupas', 'Comida', 'Utensilios']

export default function CapsPage(): React.ReactElement {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({})
  const [donationDate, setDonationDate] = useState('')
  const [donationTime, setDonationTime] = useState('')
  const [anonymousDonation, setAnonymousDonation] = useState<'sim' | 'nao'>('nao')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [formMessage, setFormMessage] = useState<string>('')

  const selectedUnit = useMemo(
    () => caps.find((unit) => unit.id === selectedUnitId) ?? null,
    [selectedUnitId]
  )

  const handleSelectDonation = (unit: Cap): void => {
    setSelectedUnitId(unit.id)
    setSelectedItems([])
    setItemQuantities({})
    setDonationDate('')
    setDonationTime('')
    setAnonymousDonation('nao')
    setDonorName('')
    setDonorEmail('')
    setFormMessage('')
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
      setFormMessage('Preencha dia, horario e selecione ao menos um tipo de doacao.')
      return
    }

    const missingQty = selectedItems.some((item) => !itemQuantities[item]?.trim())
    if (missingQty) {
      setFormMessage('Informe a quantidade para cada item selecionado.')
      return
    }

    if (anonymousDonation === 'nao' && (!donorName.trim() || !donorEmail.trim())) {
      setFormMessage('Preencha seu nome e e-mail para continuar.')
      return
    }

    const identidade =
      anonymousDonation === 'sim'
        ? 'Doador anonimo: Sim'
        : `Doador: ${donorName} (${donorEmail})`

    const itensList = selectedItems
      .map((item) => `${item}: ${itemQuantities[item]}`)
      .join(', ')

    setFormMessage(
      `Registro salvo para ${selectedUnit.title}. Dia: ${donationDate}, Horario: ${donationTime}. Itens: ${itensList}. ${identidade}.`
    )
  }

  return (
    <section className="page-block">
      <span className="page-kicker">Rede de saude mental</span>
      <h2>Rede de Saude Mental - Campo Grande (MS)</h2>
      <p>
        Clique em uma unidade para abrir os botoes de doacao, ver instrucoes e
        registrar dia, horario e preferencia de doador anonimo.
      </p>

      <div className="card-grid">
        {caps.map((c) => (
          <CapsCard
            key={c.id}
            cap={c}
            isSelected={selectedUnitId === c.id}
            onSelectDonation={handleSelectDonation}
          />
        ))}
      </div>

      {selectedUnit ? (
        <div className="donation-flow-grid">
          <article className="page-card donation-panel">
            <span className="unit-type-badge">Doacao para unidade selecionada</span>
            <h3>{selectedUnit.title}</h3>
            <p><strong>Endereco:</strong> {selectedUnit.address}</p>
            <p><strong>Contato:</strong> {selectedUnit.contact ?? 'Contato nao informado'}</p>

            <div className="donation-actions" role="group" aria-label="Botoes de doacao">
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
          </article>

          <article className="page-card donation-panel donation-guidelines">
            <h3>Instrucoes de doacao</h3>
            <p>Itens aceitos: roupas, comida e utensilios.</p>
            <p className="guideline-warning">Nao aceitamos dinheiro.</p>

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
                Horario da entrega
                <input
                  type="time"
                  value={donationTime}
                  onChange={(event) => setDonationTime(event.target.value)}
                />
              </label>

              <fieldset>
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

              <button type="submit" className="unit-donate-button">
                Registrar intencao de doacao
              </button>

              {formMessage ? <p className="form-feedback">{formMessage}</p> : null}
            </form>
          </article>
        </div>
      ) : null}
    </section>
  )
}
