import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import CapsMap from '../components/CapsMap'
import NewsCarousel from '../components/ui/NewsCarousel'
import { NeedListSkeleton, UrgentCarouselSkeleton } from '../components/ui/Skeletons'
import { HighlightItem } from '../data/highlights'
import { fetchPublicNeeds } from '../lib/needs'
import { fetchHighlights } from '../services/highlights-service'
import { fetchNeedsPage, normalizeNeed } from '../services/needs-service'
import { Need } from '../types'
import { trackEvent } from '../services/telemetry-service'
import '../Styles/Home.css'

function getCardsPerView(): number {
  if (typeof window === 'undefined') return 1
  if (window.innerWidth >= 1180) return 3
  if (window.innerWidth >= 820) return 2
  return 1
}

const FEED_PAGE_SIZE = 6

export default function Home(): React.ReactElement {
  const [urgentNeeds, setUrgentNeeds] = useState<Need[]>([])
  const [nonUrgentNeeds, setNonUrgentNeeds] = useState<Need[]>([])
  const [highlights, setHighlights] = useState<HighlightItem[]>([])
  const [isLoadingUrgent, setIsLoadingUrgent] = useState(true)
  const [isLoadingFeed, setIsLoadingFeed] = useState(true)
  const [cardsPerView, setCardsPerView] = useState<number>(getCardsPerView)
  const [activeIndex, setActiveIndex] = useState(0)
  const [feedPage, setFeedPage] = useState(1)
  const [feedHasMore, setFeedHasMore] = useState(true)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

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
        const urgentResponse = await fetchNeedsPage({ page: 1, limit: 18, priority: 'alta' })
        if (!mounted) return

        setUrgentNeeds((urgentResponse.data || []).map(normalizeNeed))
      } catch {
        const fallback = await fetchPublicNeeds()
        if (!mounted) return
        setUrgentNeeds(fallback.filter((need) => need.priority === 'alta'))
      } finally {
        if (mounted) setIsLoadingUrgent(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      setIsLoadingFeed(true)

      try {
        const response = await fetchNeedsPage({ page: 1, limit: FEED_PAGE_SIZE, priority: 'media' })
        if (!mounted) return

        setNonUrgentNeeds((response.data || []).map(normalizeNeed))
        setFeedHasMore(response.hasMore)
        setFeedPage(1)
      } catch {
        const fallback = await fetchPublicNeeds()
        if (!mounted) return

        const normalized = fallback.filter((need) => need.priority !== 'alta')
        setNonUrgentNeeds(normalized.slice(0, FEED_PAGE_SIZE))
        setFeedHasMore(normalized.length > FEED_PAGE_SIZE)
        setFeedPage(1)
      } finally {
        if (mounted) setIsLoadingFeed(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!loadMoreRef.current || !feedHasMore || isLoadingFeed) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (!entry.isIntersecting) {
        return
      }

      setFeedPage((current) => current + 1)
    }, { threshold: 0.2, rootMargin: '120px' })

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [feedHasMore, isLoadingFeed])

  useEffect(() => {
    if (feedPage <= 1 || isLoadingFeed) {
      return
    }

    let mounted = true

    ;(async () => {
      setIsLoadingFeed(true)
      try {
        const response = await fetchNeedsPage({ page: feedPage, limit: FEED_PAGE_SIZE, priority: 'media' })
        if (!mounted) return

        setNonUrgentNeeds((current) => [...current, ...(response.data || []).map(normalizeNeed)])
        setFeedHasMore(response.hasMore)
      } catch {
        if (mounted) {
          setFeedHasMore(false)
        }
      } finally {
        if (mounted) setIsLoadingFeed(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [feedPage])


  useEffect(() => {
    const milestones = new Set<number>()

    const onScroll = () => {
      const scrollTop = window.scrollY
      const fullHeight = document.documentElement.scrollHeight - window.innerHeight
      if (fullHeight <= 0) {
        return
      }

      const percentage = Math.round((scrollTop / fullHeight) * 100)
      const checkpoints = [25, 50, 75, 100]

      checkpoints.forEach((checkpoint) => {
        if (percentage >= checkpoint && !milestones.has(checkpoint)) {
          milestones.add(checkpoint)
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
  const carouselStyle = {
    ['--cards-per-view' as string]: cardsPerView,
    ['--active-index' as string]: activeIndex,
  } as React.CSSProperties

  const isFeedEmpty = !isLoadingFeed && nonUrgentNeeds.length === 0

  return (
    <>
      <section className="page-block home-highlights-section">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Notícias e destaques</span>
            <h2>Novidades da rede e campanhas ativas</h2>
          </div>
        </div>
        <NewsCarousel items={highlights} />
      </section>

      <section className="page-block home-hero">
        <div className="home-hero-layout">
          <article className="home-guidance-card">
            <span className="page-kicker">Jornada de cuidado</span>
            <h2>Um roteiro inicial para ler prioridades, localizar a rede CAPS e acompanhar cada apoio.</h2>
            <p>
              A página inicial organiza a leitura da rede e orienta o próximo passo de quem acolhe,
              doa ou acompanha a gestão, com foco no que precisa de resposta agora.
            </p>

            <span className="home-card-tag">Fluxo recomendado</span>
            <h3>Comece pelas prioridades e avance até o registro do apoio em três movimentos.</h3>

            <ol className="home-step-list">
              <li><span className="home-step-number">1</span><div><strong>Observe o que pede resposta imediata</strong><p>Consulte necessidades abertas para identificar os itens mais críticos.</p></div></li>
              <li><span className="home-step-number">2</span><div><strong>Encontre a unidade certa</strong><p>Use a rede CAPS para localizar contatos e direcionar melhor o apoio.</p></div></li>
              <li><span className="home-step-number">3</span><div><strong>Registre a contribuição</strong><p>Formalize a doação para visibilidade e acompanhamento da gestão.</p></div></li>
            </ol>
          </article>

          <article className="home-map-card">
            <span className="home-card-tag">Rede territorial</span>
            <p className="home-map-card__intro">O mapa facilita a identificação da unidade antes do encaminhamento.</p>
            <CapsMap />
          </article>
        </div>
      </section>

      <section className="page-block home-urgent-section">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Prioridades imediatas</span>
            <h2>Doações pedidas com urgência</h2>
          </div>

          {urgentNeeds.length > cardsPerView ? (
            <div className="home-carousel-controls" aria-label="Navegação do carrossel de urgências">
              <button type="button" onClick={() => setActiveIndex((currentIndex) => Math.max(0, currentIndex - 1))} disabled={activeIndex === 0}>Anterior</button>
              <button type="button" onClick={() => setActiveIndex((currentIndex) => Math.min(maxIndex, currentIndex + 1))} disabled={activeIndex >= maxIndex}>Próximo</button>
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
                    <div className="home-urgent-card">
                      <div className="home-urgent-card__top">
                        <span className="home-urgent-badge">Urgente</span>
                        <span className="home-urgent-amount">{need.amount} unidades</span>
                      </div>
                      <h3>{need.title}</h3>
                      <p>{need.description}</p>
                      <div className="home-urgent-footer">
                        <div className="home-urgent-meta"><strong>{need.unitName}</strong><span>{need.category}</span></div>
                        <Link className="home-urgent-link" to={`/caps?unit=${need.unitId}`}>DOAR AGORA</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="home-urgent-empty">Não há pedidos urgentes registrados no momento.</p>
        )}
      </section>

      <section className="page-block home-needs-section">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Apoio contínuo</span>
            <h2>Outras necessidades da rede</h2>
            <p>Agora com paginação otimizada no backend + scroll progressivo no frontend.</p>
          </div>
        </div>

        {isLoadingFeed && nonUrgentNeeds.length === 0 ? (
          <NeedListSkeleton />
        ) : isFeedEmpty ? (
          <p className="home-urgent-empty">Não há necessidades adicionais no momento.</p>
        ) : (
          <>
            <div className="home-needs-grid">
              {nonUrgentNeeds.map((need) => (
                <article key={need.id} className="home-need-feed-card">
                  <span className="home-card-tag">{need.category}</span>
                  <h3>{need.title}</h3>
                  <p>{need.description}</p>
                  <div className="home-urgent-footer">
                    <strong>{need.unitName}</strong>
                    <Link className="home-urgent-link" to={`/caps?unit=${need.unitId}`}>Contribuir</Link>
                  </div>
                </article>
              ))}
            </div>

            {feedHasMore ? (
              <div ref={loadMoreRef} className="home-infinite-trigger" aria-label="Carregando mais necessidades" />
            ) : null}
          </>
        )}
      </section>
    </>
  )
}
