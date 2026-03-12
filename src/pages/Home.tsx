import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import CapsMap from '../components/CapsMap'
import { needs } from '../data/mock'
import '../Styles/Home.css'

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

export default function Home(): React.ReactElement {
  const urgentNeeds = needs.filter((need) => need.priority === 'alta')
  const [cardsPerView, setCardsPerView] = useState<number>(getCardsPerView)
  const [activeIndex, setActiveIndex] = useState(0)

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
    const nextMaxIndex = Math.max(0, urgentNeeds.length - cardsPerView)
    setActiveIndex((currentIndex) => Math.min(currentIndex, nextMaxIndex))
  }, [cardsPerView, urgentNeeds.length])

  const maxIndex = Math.max(0, urgentNeeds.length - cardsPerView)
  const carouselStyle = {
    ['--cards-per-view' as string]: cardsPerView,
    ['--active-index' as string]: activeIndex,
  } as React.CSSProperties

  return (
    <>
      <section className="page-block home-hero">
        <div className="home-hero-layout">
          <article className="home-guidance-card">
            <span className="page-kicker">Jornada de cuidado</span>
            <h2>Um roteiro inicial para ler prioridades, localizar a rede CAPS e acompanhar cada apoio.</h2>
            <p>
              A pagina inicial organiza a leitura da rede e orienta o proximo passo de quem acolhe,
              doa ou acompanha a gestao, com foco no que precisa de resposta agora.
            </p>

            <span className="home-card-tag">Fluxo recomendado</span>
            <h3>Comece pelas prioridades e avance ate o registro do apoio em tres movimentos.</h3>

            <ol className="home-step-list">
              <li>
                <span className="home-step-number">1</span>
                <div>
                  <strong>Observe o que pede resposta imediata</strong>
                  <p>
                    Consulte as necessidades abertas para entender quais itens sustentam
                    acolhimentos, oficinas e atendimentos em andamento.
                  </p>
                </div>
              </li>
              <li>
                <span className="home-step-number">2</span>
                <div>
                  <strong>Encontre a unidade ou o territorio certo</strong>
                  <p>
                    Use a rede CAPS para localizar contatos, comparar pontos de apoio e facilitar
                    encaminhamentos solidarios.
                  </p>
                </div>
              </li>
              <li>
                <span className="home-step-number">3</span>
                <div>
                  <strong>Registre a contribuicao com clareza</strong>
                  <p>
                    Formalize o apoio para que a equipe acompanhe entradas, prioridades atendidas
                    e visibilidade para a gestao.
                  </p>
                </div>
              </li>
            </ol>

            <div className="home-guidance-notes">
              <article className="home-guidance-note">
                <strong>Necessidades priorizadas</strong>
                <p>Leia primeiro o que sustenta atendimentos, oficinas e acolhimentos ativos.</p>
              </article>
              <article className="home-guidance-note">
                <strong>Rede CAPS integrada</strong>
                <p>Consulte contatos e territorio para direcionar melhor o apoio da comunidade.</p>
              </article>
              <article className="home-guidance-note">
                <strong>Transparencia de apoio</strong>
                <p>O registro de cada contribuicao fortalece acompanhamento e visibilidade da gestao.</p>
              </article>
            </div>
          </article>

          <article className="home-map-card">
            <span className="home-card-tag">Rede territorial</span>
            <p className="home-map-card__intro">
              O mapa fica ao lado do roteiro principal para facilitar a consulta da unidade certa
              antes do encaminhamento ou da doacao.
            </p>
            <CapsMap />
          </article>
        </div>
      </section>

      <section className="page-block home-urgent-section">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Prioridades imediatas</span>
            <h2>Doacoes pedidas com urgencia</h2>
            <p>
              Acompanhe os pedidos mais sensiveis da rede e avance pelo carrossel para ver onde o
              apoio precisa chegar primeiro.
            </p>
          </div>

          {urgentNeeds.length > cardsPerView ? (
            <div className="home-carousel-controls" aria-label="Navegacao do carrossel de urgencias">
              <button
                type="button"
                onClick={() => setActiveIndex((currentIndex) => Math.max(0, currentIndex - 1))}
                disabled={activeIndex === 0}
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((currentIndex) => Math.min(maxIndex, currentIndex + 1))}
                disabled={activeIndex >= maxIndex}
              >
                Proximo
              </button>
            </div>
          ) : null}
        </div>

        {urgentNeeds.length > 0 ? (
          <div className="home-carousel" style={carouselStyle}>
            <div className="home-carousel-viewport">
              <div className="home-carousel-track">
                {urgentNeeds.map((need) => (
                  <article key={need.id} className="home-carousel-slide">
                    <div className="home-urgent-card">
                      <div className="home-urgent-card__top">
                        <span className="home-urgent-badge">Urgente</span>
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
                          Ir para doacao desta unidade
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="home-urgent-empty">Nao ha pedidos urgentes registrados no momento.</p>
        )}
      </section>
    </>
  )
}
