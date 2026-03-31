import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import CapsCard from '../components/CapsCard'
import * as api from '../lib/api'
import { Cap } from '../types'
import { caps as mockCaps } from '../data/mock'

import '../Styles/CapsPage.css'

// Tipos de itens aceitos no formulário de intenção de doação.
const donationOptions = ['Roupas', 'Comida', 'Utensílios']

// Duração da animação de seleção para sincronizar estado e UI.
const selectionAnimationDurationMs = 260

export default function CapsPage(): React.ReactElement {
  // searchParams lê/escreve parâmetros de URL (ex: /caps?unit=c1).
  const [searchParams, setSearchParams] = useSearchParams()

  // selectedUnitId: unidade escolhida para doação.
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)

  // Lista de unidades carregadas do backend. Mantemos a forma localmente
  // compatível com o restante da UI (id = slug) para evitar grandes mudanças.
  const [caps, setCaps] = useState<Cap[]>([])

  // selectionPreviewId: unidade em animação de seleção antes de confirmar.
  const [selectionPreviewId, setSelectionPreviewId] = useState<string | null>(null)

  // showUnitChooser: alterna entre lista de unidades e painel detalhado da escolhida.
  const [showUnitChooser, setShowUnitChooser] = useState(true)

  // selectedItems: categorias de itens marcadas no formulário.
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // itemQuantities: quantidade digitada para cada item selecionado.
  const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({})

  // Data e horário de entrega informados pelo doador.
  const [donationDate, setDonationDate] = useState('')
  const [donationTime, setDonationTime] = useState('')

  // Controle de identificação do doador.
  const [anonymousDonation, setAnonymousDonation] = useState<'sim' | 'não'>('não')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')

  // Mensagens de validação e feedback visual do envio.
  const [formMessage, setFormMessage] = useState<string>('')
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')

  // Referência para limpar timer de animação quando necessário.
  const selectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Referência da seção de formulário para rolagem automática.
  const donationFlowRef = useRef<HTMLDivElement | null>(null)

  // Flag para rolar apenas quando a seleção veio por query string.
  const shouldScrollToDonationRef = useRef(false)

  // Parâmetro unit recebido da URL para seleção direta de unidade.
  const selectedUnitParam = searchParams.get('unit')

  // Carrega unidades do backend ao montar a página.
  useEffect(() => {
    let mounted = true

    async function loadUnits() {
      try {
        const units = await api.get('/api/units')
        // O backend retorna { id, slug, title, ... } — aqui mapeamos para a
        // forma que a UI espera: usamos `slug` como `id` para manter compat.
        const mapped: Cap[] = (units || []).map((u: any) => ({
          id: u.slug ?? u.id,
          title: u.title,
          unitType: u.unitType === 'RESIDENCIA_TERAPEUTICA' ? 'Residência Terapêutica' : u.unitType,
          address: u.address,
          contact: u.contact,
          description: u.description,
          capacity: u.capacity,
          privacyNote: u.privacyNote,
          lat: u.lat,
          lng: u.lng,
          photo: u.photo,
        }))

        if (mounted) {
          // If backend returned an empty list, fall back to local mock data to
          // keep the UI usable during development when the API is offline.
          if (!mapped || mapped.length === 0) {
            setCaps(mockCaps as Cap[])
          } else {
            setCaps(mapped)
          }
        }
      } catch (err: any) {
        // Se a chamada falhar (backend offline), usa os dados mock locais.
        if (mounted) setCaps(mockCaps as Cap[])
      }
    }

    loadUnits()

    return () => {
      mounted = false
    }
  }, [])

  // Resolve os dados completos da unidade a partir do ID selecionado.
  const selectedUnit = useMemo(
    () => caps.find((unit) => unit.id === selectedUnitId) ?? null,
    [selectedUnitId, caps]
  )

  useEffect(() => {
    // Cleanup para evitar timer pendente ao desmontar o componente.
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Se não veio unidade pela URL, não altera o estado atual.
    if (!selectedUnitParam) {
      return
    }

    // Valida se o ID da URL corresponde a alguma unidade conhecida.
    const matchedUnit = caps.find((unit) => unit.id === selectedUnitParam)

    if (!matchedUnit) {
      return
    }

    // Abre direto o fluxo da unidade selecionada via query string.
    setSelectedUnitId(matchedUnit.id)
    setSelectionPreviewId(null)
    resetDonationForm()
    setShowUnitChooser(false)
    shouldScrollToDonationRef.current = true
  }, [selectedUnitParam, caps])

  useEffect(() => {
    // Só executa rolagem quando explicitamente sinalizado.
    if (!shouldScrollToDonationRef.current || !selectedUnit || showUnitChooser) {
      return
    }

    // Pequeno delay para garantir que o painel já foi renderizado no DOM.
    const timeoutId = window.setTimeout(() => {
      donationFlowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      shouldScrollToDonationRef.current = false
    }, 120)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [selectedUnit, showUnitChooser])

  // Reinicia todo o formulário quando troca de unidade ou volta para seleção.
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

  // Seleciona a unidade para doação, com animação visual antes da confirmação.
  const handleSelectDonation = (unit: Cap): void => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
    }

    // Clique repetido na mesma unidade já selecionada fecha a lista e abre o detalhe.
    if (selectedUnitId === unit.id && showUnitChooser) {
      setSelectionPreviewId(null)
      setShowUnitChooser(false)
      return
    }

    setSelectionPreviewId(unit.id)

    selectionTimeoutRef.current = setTimeout(() => {
      // Confirma seleção após animação.
      setSelectedUnitId(unit.id)
      resetDonationForm()
      setSelectionPreviewId(null)
      setShowUnitChooser(false)
      selectionTimeoutRef.current = null
    }, selectionAnimationDurationMs)
  }

  // Retorna para a grade de unidades e limpa contexto anterior.
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

  // Fecha o overlay de sucesso e reinicia o fluxo para nova escolha de unidade.
  const handleCloseDonationSuccess = (): void => {
    setShowSuccessOverlay(false)
    setSelectedUnitId(null)
    setShowUnitChooser(true)
    resetDonationForm()
  }

  // Marca/desmarca um item de doação e mantém quantities sincronizadas.
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

  // Atualiza o valor digitado para um item específico.
  const handleQuantityChange = (item: string, value: string): void => {
    setItemQuantities((prev) => ({ ...prev, [item]: value }))
  }

  // Valida e registra a intenção de doação (atualmente só no estado local).
  const handleRegisterDonation = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    // Campos mínimos obrigatórios do formulário.
    if (!selectedUnit || selectedItems.length === 0 || !donationDate || !donationTime) {
      setFormMessage('Preencha dia, horário e selecione ao menos um tipo de doação.')
      return
    }

    // Exige quantidade para todos os itens selecionados.
    const missingQty = selectedItems.some((item) => !itemQuantities[item]?.trim())
    if (missingQty) {
      setFormMessage('Informe a quantidade para cada item selecionado.')
      return
    }

    // Se não for anônimo, nome e e-mail são obrigatórios.
    if (anonymousDonation === 'não' && (!donorName.trim() || !donorEmail.trim())) {
      setFormMessage('Preencha seu nome e e-mail para continuar.')
      return
    }

    // Mapeia rótulos da UI para os valores esperados pela API.
    const categoryMap: Record<string, 'roupa' | 'comida' | 'utensilios'> = {
      Roupas: 'roupa',
      Comida: 'comida',
      Utensílios: 'utensilios',
    }

    // Faz uma requisição por item selecionado (cada categoria vira um registro).
    ;(async () => {
      try {
        const payloads = selectedItems.map((item) => ({
          unitSlug: selectedUnit.id,
          category: categoryMap[item],
          quantity: itemQuantities[item],
          isAnonymous: anonymousDonation === 'sim',
          donorName: anonymousDonation === 'sim' ? undefined : donorName,
          donorEmail: anonymousDonation === 'sim' ? undefined : donorEmail,
          date: donationDate,
          time: donationTime,
        }))

        await Promise.all(payloads.map((p) => api.post('/api/donations', p)))

        const itensList = selectedItems
          .map((it) => `${it}: ${itemQuantities[it]}`)
          .join(', ')

        const identidade = anonymousDonation === 'sim' ? 'Doador anônimo' : `Doador: ${donorName} (${donorEmail})`

        const successMsg = `Registro salvo para ${selectedUnit.title}. Dia: ${donationDate}, Horário: ${donationTime}. Itens: ${itensList}. ${identidade}.`

        setSuccessMessage(successMsg)
        setShowSuccessOverlay(true)
        setFormMessage('')
      } catch (err: any) {
        // Exibe mensagem genérica ou específica vinda da API.
        const msg = err?.message ? String(err.message) : 'Erro ao registrar doação.'
        setFormMessage(msg)
      }
    })()
  }

  return (
    <section className="page-block caps-page">
      {/* Overlay exibido após o usuário concluir o formulário com sucesso. */}
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
              {/* Botões tipo toggle para escolher os itens a doar. */}
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

              <fieldset className="donation-form__anonymity">
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
