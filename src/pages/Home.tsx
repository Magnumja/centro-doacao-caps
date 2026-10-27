import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import CapsMapSection from '../components/CapsMapSection'
import DonationRequestCard from '../components/DonationRequestCard'
import HeroSection from '../components/HeroSection'
import HowItWorks from '../components/HowItWorks'
import NewsCarousel from '../components/ui/NewsCarousel'
import { UrgentCarouselSkeleton } from '../components/ui/Skeletons'
import { HighlightItem } from '../data/highlights'
import { useNeeds, useUnits } from '../hooks/usePublicData'
import { buildProjectStats, isOpen, isUrgent } from '../lib/stats'
import { getNeedDonationPath } from '../lib/routes'
import { fetchHighlights } from '../services/highlights-service'
import { trackEvent } from '../services/telemetry-service'

export default function Home(): React.ReactElement {
  const [highlights, setHighlights] = useState<HighlightItem[]>([])
  const { units } = useUnits()
  const { needs, isLoading: isLoadingUrgent } = useNeeds()
  const milestonesRef = useRef(new Set<number>())

  const stats = useMemo(() => buildProjectStats(units, needs), [units, needs])
  const urgentNeeds = useMemo(() => needs.filter((need) => isOpen(need) && isUrgent(need)).slice(0, 6), [needs])

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

  return (
    <>
      <HeroSection stats={stats} />

      <section className="page-block home-highlights-section home-highlights-section--featured">
        <div className="home-urgent-header">
          <div>
            <h2>Campanhas e informações da rede CAPS</h2>
            <p>Atualizações importantes aparecem primeiro para orientar quem deseja participar.</p>
          </div>
        </div>
        <NewsCarousel items={highlights} />
      </section>

      <HowItWorks />

      <section className="page-block home-location-section">
        <div className="home-location-header">
          <div>
            <h2>Encontre uma unidade CAPS em Campo Grande</h2>
            <p>Use o mapa para conhecer a localização das unidades antes de escolher onde doar.</p>
          </div>
          <Link className="home-urgent-link" to="/caps">Ver unidades</Link>
        </div>

        <div className="home-location-map">
          <CapsMapSection />
        </div>
      </section>

      <section className="page-block home-urgent-section">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Prioridades da rede</span>
            <h2>Pedidos urgentes em destaque</h2>
            <p>Uma seleção curta dos itens com maior prioridade no momento.</p>
          </div>

          <Link className="home-urgent-link" to="/donate">Ver todos</Link>
        </div>

        {isLoadingUrgent ? (
          <UrgentCarouselSkeleton />
        ) : urgentNeeds.length > 0 ? (
          <div className="donate-requests-grid">
            {urgentNeeds.map((need) => (
              <DonationRequestCard
                key={need.id}
                need={need}
                compact
                actionTo={getNeedDonationPath(need)}
                actionLabel="Quero doar"
              />
            ))}
          </div>
        ) : (
          <p className="home-urgent-empty">Não há pedidos urgentes registrados no momento.</p>
        )}
      </section>

      <section className="page-block home-final-cta">
        <div>
          <h2>Veja todos os pedidos ou escolha uma unidade CAPS.</h2>
          <p>A home mostra o essencial. As páginas internas trazem os detalhes para doar com segurança.</p>
        </div>
        <div className="home-final-cta__actions">
          <Link className="home-hero-button home-hero-button--primary" to="/donate">Ver necessidades</Link>
          <Link className="home-hero-button home-hero-button--secondary" to="/caps">Escolher unidade</Link>
        </div>
      </section>
    </>
  )
}
