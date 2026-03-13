import React, { useEffect, useState } from 'react'
import { IconType } from 'react-icons'
import { FaBroom, FaBoxOpen, FaSoap, FaTools, FaTshirt, FaUtensils } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { needs } from '../data/mock'
import { Need } from '../types'
import '../Styles/Home.css'

type NeedIconConfig = {
  icon: IconType
  label: string
}

function getCardsPerView(): number {
  if (typeof window === 'undefined') {
    return 1
  }

  if (window.innerWidth >= 1180) {
    return 3
  }

  if (window.innerWidth >= 820) {
    return 2
  }

  return 1
}

function getNeedIconConfig(need: Need): NeedIconConfig {
  const normalizedText = `${need.title} ${need.category}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (
    normalizedText.includes('higiene')
    || normalizedText.includes('banho')
    || normalizedText.includes('toalha')
  ) {
    return { icon: FaSoap, label: 'Higiene' }
  }

  if (
    normalizedText.includes('alimento')
    || normalizedText.includes('comida')
    || normalizedText.includes('lanch')
    || normalizedText.includes('refeicao')
    || normalizedText.includes('alimentar')
  ) {
    return { icon: FaUtensils, label: 'Alimentação' }
  }

  if (normalizedText.includes('limpeza')) {
    return { icon: FaBroom, label: 'Limpeza' }
  }

  if (normalizedText.includes('oficina') || normalizedText.includes('material')) {
    return { icon: FaTools, label: 'Materiais' }
  }

  if (normalizedText.includes('utensilio')) {
    return { icon: FaTools, label: 'Utensílios' }
  }

  if (
    normalizedText.includes('cobertor')
    || normalizedText.includes('roupa')
    || normalizedText.includes('tecido')
  ) {
    return { icon: FaTshirt, label: 'Roupas e tecidos' }
  }

  return { icon: FaBoxOpen, label: 'Doações gerais' }
}

export default function Donate(): React.ReactElement {
  const urgentNeeds = needs.filter((need) => need.priority === 'alta')
  const normalNeeds = needs.filter((need) => need.priority === 'media')

  const [cardsPerView, setCardsPerView] = useState<number>(getCardsPerView)
  const [urgentActiveIndex, setUrgentActiveIndex] = useState(0)
  const [normalActiveIndex, setNormalActiveIndex] = useState(0)

  useEffect(() => {
    const handleResize = (): void => {
      setCardsPerView(getCardsPerView())
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const urgentMaxIndex = Math.max(0, urgentNeeds.length - cardsPerView)
    const normalMaxIndex = Math.max(0, normalNeeds.length - cardsPerView)

    setUrgentActiveIndex((currentIndex) => Math.min(currentIndex, urgentMaxIndex))
    setNormalActiveIndex((currentIndex) => Math.min(currentIndex, normalMaxIndex))
  }, [cardsPerView, normalNeeds.length, urgentNeeds.length])

  const urgentMaxIndex = Math.max(0, urgentNeeds.length - cardsPerView)
  const normalMaxIndex = Math.max(0, normalNeeds.length - cardsPerView)

  const urgentCarouselStyle = {
    ['--cards-per-view' as string]: cardsPerView,
    ['--active-index' as string]: urgentActiveIndex,
  } as React.CSSProperties

  const normalCarouselStyle = {
    ['--cards-per-view' as string]: cardsPerView,
    ['--active-index' as string]: normalActiveIndex,
  } as React.CSSProperties

  const renderNeedSlide = (
    need: Need,
    priorityLabel: 'Urgente' | 'Não urgente',
    badgeClassName?: string,
  ): React.ReactElement => {
    const { icon: NeedIcon, label } = getNeedIconConfig(need)

    return (
      <article key={need.id} className="home-carousel-slide">
        <div className="home-urgent-card donate-need-card">
          <span className="donate-need-icon" aria-label={label} title={label}>
            <NeedIcon aria-hidden="true" focusable="false" />
          </span>

          <div className="home-urgent-card__top">
            <span className={badgeClassName ?? 'home-urgent-badge'}>{priorityLabel}</span>
            <span className="home-urgent-amount">{need.amount} unidades</span>
          </div>

          <h3>{need.title}</h3>
          <p>{need.description}</p>

          <div className="home-urgent-footer">
            <div className="home-urgent-meta">
              <strong>{need.unitName}</strong>
              <span>{need.category}</span>
            </div>

            <Link className="home-urgent-link" to={`/caps?unit=${need.unitId}`}>
              Ir para doação desta unidade
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <section className="page-block home-urgent-section donate-page">
      <div>
        <span className="page-kicker">Doação solidária</span>
        <h2>Itens mais necessários para os CAPS</h2>
        <p>
          As solicitações seguem dois níveis de prioridade no painel admin:
          urgente e não urgente.
        </p>
      </div>

      <article className="donate-carousel-group">
        {urgentNeeds.length > cardsPerView ? (
          <div className="home-carousel-controls donate-carousel-controls" aria-label="Navegação do carrossel de doações urgentes">
            <button
              type="button"
              onClick={() => setUrgentActiveIndex((currentIndex) => Math.max(0, currentIndex - 1))}
              disabled={urgentActiveIndex === 0}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setUrgentActiveIndex((currentIndex) => Math.min(urgentMaxIndex, currentIndex + 1))}
              disabled={urgentActiveIndex >= urgentMaxIndex}
            >
              Próximo
            </button>
          </div>
        ) : null}

        {urgentNeeds.length > 0 ? (
          <div className="home-carousel" style={urgentCarouselStyle}>
            <div className="home-carousel-viewport">
              <div className="home-carousel-track">
                {urgentNeeds.map((need) => renderNeedSlide(need, 'Urgente'))}
              </div>
            </div>
          </div>
        ) : (
          <p className="home-urgent-empty">Não há pedidos urgentes registrados no momento.</p>
        )}
      </article>

      <article className="donate-carousel-group">
        {normalNeeds.length > cardsPerView ? (
          <div className="home-carousel-controls donate-carousel-controls" aria-label="Navegação do carrossel de doações não urgentes">
            <button
              type="button"
              onClick={() => setNormalActiveIndex((currentIndex) => Math.max(0, currentIndex - 1))}
              disabled={normalActiveIndex === 0}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setNormalActiveIndex((currentIndex) => Math.min(normalMaxIndex, currentIndex + 1))}
              disabled={normalActiveIndex >= normalMaxIndex}
            >
              Próximo
            </button>
          </div>
        ) : null}

        {normalNeeds.length > 0 ? (
          <div className="home-carousel" style={normalCarouselStyle}>
            <div className="home-carousel-viewport">
              <div className="home-carousel-track">
                {normalNeeds.map((need) =>
                  renderNeedSlide(need, 'Não urgente', 'home-urgent-badge is-normal'),
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="home-urgent-empty">Não há pedidos não urgentes registrados no momento.</p>
        )}
      </article>
    </section>
  )
}
