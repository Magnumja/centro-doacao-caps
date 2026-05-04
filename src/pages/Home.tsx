import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import CapsMap from '../components/CapsMap'
import DonationRequestCard from '../components/DonationRequestCard'
import HowItWorks from '../components/HowItWorks'
import NewsCarousel from '../components/ui/NewsCarousel'
import { UrgentCarouselSkeleton } from '../components/ui/Skeletons'
import { HighlightItem } from '../data/highlights'
import { fetchPublicNeeds } from '../lib/needs'
import { getCardsPerView } from '../lib/ui-utils'
import { fetchHighlights } from '../services/highlights-service'
import { fetchNeedsPage, normalizeNeed } from '../services/needs-service'
import { trackEvent } from '../services/telemetry-service'
import { Need } from '../types'
import '../Styles/Home.css'

export default function Home(): React.ReactElement {
  const [urgentNeeds, setUrgentNeeds] = useState<Need[]>([])
  const [highlights, setHighlights] = useState<HighlightItem[]>([])
  const [isLoadingUrgent, setIsLoadingUrgent] = useState(true)
  const [cardsPerView, setCardsPerView] = useState<number>(() => getCardsPerView())
  const [activeIndex, setActiveIndex] = useState(0)
  const milestonesRef = useRef(new Set<number>())

  useEffect(() => {
    const handleResize = (): void => setCardsPerView(getCardsPerView())
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const loadedHighlights = await fetchHighlights()
      if (mounted) setHighlights(loadedHighlights)
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      setIsLoadingUrgent(true)

      try {
        const urgentResponse = await fetchNeedsPage({ page: 1, limit: 9, priority: 'alta' })
        if (!mounted) return

        setUrgentNeeds((urgentResponse.data || []).map(normalizeNeed))
      } catch {
        const fallback = await fetchPublicNeeds()
        if (!mounted) return
        setUrgentNeeds(fallback.filter((need) => need.priority === 'alta').slice(0, 9))
      } finally {
        if (mounted) setIsLoadingUrgent(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const fullHeight = document.documentElement.scrollHeight - window.innerHeight
      if (fullHeight <= 0) return

      const percentage = Math.round((scrollTop / fullHeight) * 100)
      const checkpoints = [25, 50, 75, 100]

      checkpoints.forEach((checkpoint) => {
        if (percentage >= checkpoint && !milestonesRef.current.has(checkpoint)) {
          milestonesRef.current.add(checkpoint)
          void trackEvent({
            eventName: 'scroll_depth',
            category: 'scroll',
            value: checkpoint,
            metadata: { page: 'home' },
          })
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const nextMaxIndex = Math.max(0, urgentNeeds.length - cardsPerView)
    setActiveIndex((currentIndex) => Math.min(currentIndex, nextMaxIndex))
  }, [cardsPerView, urgentNeeds.length])

  const maxIndex = Math.max(0, urgentNeeds.length - cardsPerView)

  const carouselStyle = useMemo(() => ({
    ['--cards-per-view' as string]: cardsPerView,
    ['--active-index' as string]: activeIndex,
  } as React.CSSProperties), [cardsPerView, activeIndex])

  return (
    <>
      <section className="page-block home-highlights-section home-highlights-section--featured">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Noticias e destaques</span>
            <h2>Campanhas e informacoes da rede CAPS</h2>
            <p>Atualizacoes importantes aparecem primeiro para orientar quem deseja participar.</p>
          </div>
        </div>
        <NewsCarousel items={highlights} />
      </section>

      <HowItWorks />

      <section className="page-block home-location-section">
        <div className="home-location-header">
          <div>
            <span className="page-kicker">Mapa das unidades</span>
            <h2>Encontre uma unidade CAPS em Campo Grande</h2>
            <p>Use o mapa para conhecer a localizacao das unidades antes de escolher onde doar.</p>
          </div>
          <Link className="home-urgent-link" to="/caps">Ver unidades</Link>
        </div>

        <div className="home-location-map">
          <CapsMap />
        </div>
      </section>

      <section className="page-block home-urgent-section">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Prioridades da rede</span>
            <h2>Pedidos urgentes em destaque</h2>
            <p>Uma selecao curta dos itens com maior prioridade no momento.</p>
          </div>

          {urgentNeeds.length > cardsPerView ? (
            <div className="home-carousel-controls" aria-label="Navegacao do carrossel de urgencias">
              <button
                type="button"
                onClick={() => setActiveIndex((currentIndex) => Math.max(0, currentIndex - 1))}
                disabled={activeIndex === 0}
                aria-label="Mostrar doacoes urgentes anteriores"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((currentIndex) => Math.min(maxIndex, currentIndex + 1))}
                disabled={activeIndex >= maxIndex}
                aria-label="Mostrar proximas doacoes urgentes"
              >
                Proximo
              </button>
            </div>
          ) : null}
        </div>

        {isLoadingUrgent ? (
          <UrgentCarouselSkeleton />
        ) : urgentNeeds.length > 0 ? (
          <div className="home-carousel" style={carouselStyle}>
            <div className="home-carousel-viewport">
              <div className="home-carousel-track">
                {urgentNeeds.map((need) => (
                  <article key={need.id} className="home-carousel-slide">
                    <DonationRequestCard
                      need={need}
                      compact
                      actionTo={`/caps?unit=${need.unitId}`}
                      actionLabel="Quero doar"
                    />
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="home-urgent-empty">Nao ha pedidos urgentes registrados no momento.</p>
        )}
      </section>

      <section className="page-block home-final-cta">
        <div>
          <span className="page-kicker">Escolha seu caminho</span>
          <h2>Veja todos os pedidos ou escolha uma unidade CAPS.</h2>
          <p>A home mostra o essencial. As paginas internas trazem os detalhes para doar com seguranca.</p>
        </div>
        <div className="home-final-cta__actions">
          <Link className="home-hero-button home-hero-button--primary" to="/donate">Ver necessidades</Link>
          <Link className="home-hero-button home-hero-button--secondary" to="/caps">Escolher unidade</Link>
        </div>
      </section>
    </>
  )
}
