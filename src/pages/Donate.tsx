import React, { useEffect, useMemo, useState } from 'react'
import { FaBoxes, FaFilter, FaHospital, FaRegClock } from 'react-icons/fa'

import CategoryFilter from '../components/CategoryFilter'
import DonationRequestCard from '../components/DonationRequestCard'
import NewsCarousel from '../components/ui/NewsCarousel'
import { HighlightItem } from '../data/highlights'
import { donationCategories } from '../data/mockData'
import { fetchPublicNeeds } from '../lib/needs'
import { fetchHighlights } from '../services/highlights-service'
import { DonationCategoryName, Need } from '../types'
import '../Styles/Home.css'

export default function Donate(): React.ReactElement {
  const [needs, setNeeds] = useState<Need[]>([])
  const [highlights, setHighlights] = useState<HighlightItem[]>([])
  const [activeCategory, setActiveCategory] = useState<DonationCategoryName | 'Todas'>('Todas')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      setIsLoading(true)
      const [loadedNeeds, loadedHighlights] = await Promise.all([
        fetchPublicNeeds(),
        fetchHighlights(),
      ])

      if (mounted) {
        setNeeds(loadedNeeds)
        setHighlights(loadedHighlights)
        setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const visibleNeeds = useMemo(
    () => activeCategory === 'Todas'
      ? needs
      : needs.filter((need) => need.category === activeCategory),
    [activeCategory, needs],
  )

  const urgentNeeds = visibleNeeds.filter((need) => need.priority === 'alta')
  const otherNeeds = visibleNeeds.filter((need) => need.priority !== 'alta')
  const unitsCount = new Set(visibleNeeds.map((need) => need.unitId)).size

  return (
    <section className="page-block home-urgent-section donate-page">
      <header className="donate-page__header">
        <div>
          <span className="page-kicker">Necessidades da rede</span>
          <h2>Pedidos abertos para doacao</h2>
          <p>
            Filtre por categoria, confira prioridade e status, e escolha a unidade para combinar a entrega.
          </p>
        </div>
      </header>

      <div className="donate-summary-strip" aria-label="Resumo das necessidades filtradas">
        <article>
          <FaBoxes aria-hidden="true" />
          <strong>{visibleNeeds.length}</strong>
          <span>pedidos filtrados</span>
        </article>
        <article>
          <FaRegClock aria-hidden="true" />
          <strong>{urgentNeeds.length}</strong>
          <span>urgentes</span>
        </article>
        <article>
          <FaHospital aria-hidden="true" />
          <strong>{unitsCount}</strong>
          <span>unidades solicitantes</span>
        </article>
      </div>

      <section className="donate-filter-panel" aria-label="Filtros de necessidades">
        <div className="donate-filter-panel__title">
          <FaFilter aria-hidden="true" />
          <strong>Filtrar por categoria</strong>
        </div>
        <CategoryFilter
          categories={donationCategories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      </section>

      <section className="donate-requests-section" aria-labelledby="urgent-needs-title">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Alta prioridade</span>
            <h2 id="urgent-needs-title">Pedidos urgentes</h2>
          </div>
        </div>

        {isLoading ? (
          <p className="home-urgent-empty">Carregando necessidades...</p>
        ) : urgentNeeds.length > 0 ? (
          <div className="donate-requests-grid">
            {urgentNeeds.map((need) => (
              <DonationRequestCard
                key={need.id}
                need={need}
                actionTo={`/caps?unit=${need.unitId}`}
                actionLabel="Quero doar"
              />
            ))}
          </div>
        ) : (
          <p className="home-urgent-empty">Nao ha pedidos urgentes nesta categoria.</p>
        )}
      </section>

      <section className="donate-requests-section" aria-labelledby="other-needs-title">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Apoio continuo</span>
            <h2 id="other-needs-title">Pedidos moderados e de baixa prioridade</h2>
          </div>
        </div>

        {isLoading ? (
          <p className="home-urgent-empty">Carregando necessidades...</p>
        ) : otherNeeds.length > 0 ? (
          <div className="donate-requests-grid">
            {otherNeeds.map((need) => (
              <DonationRequestCard
                key={need.id}
                need={need}
                actionTo={`/caps?unit=${need.unitId}`}
                actionLabel="Ver detalhes"
              />
            ))}
          </div>
        ) : (
          <p className="home-urgent-empty">Nao ha pedidos adicionais nesta categoria.</p>
        )}
      </section>

      <section className="home-highlights-section donate-news-section" aria-label="Noticias da rede psicossocial">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Campo Grande/MS</span>
            <h2>Noticias da rede psicossocial</h2>
          </div>
        </div>
        <NewsCarousel items={highlights} />
      </section>
    </section>
  )
}
