import React, { useEffect, useMemo, useState } from 'react'
import { FaBoxes, FaFilter, FaHospital, FaRegClock, FaSearch } from 'react-icons/fa'

import CategoryFilter from '../components/CategoryFilter'
import DonationRequestCard from '../components/DonationRequestCard'
import { donationCategories } from '../data/mockData'
import { fetchPublicNeeds } from '../lib/needs'
import { DonationCategoryName, Need } from '../types'
import '../Styles/Home.css'

export default function Donate(): React.ReactElement {
  const [needs, setNeeds] = useState<Need[]>([])
  const [activeCategory, setActiveCategory] = useState<DonationCategoryName | 'Todas'>('Todas')
  const [activePriority, setActivePriority] = useState<'Todas' | Need['priority']>('Todas')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      setIsLoading(true)
      const loadedNeeds = await fetchPublicNeeds()

      if (mounted) {
        setNeeds(loadedNeeds)
        setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const visibleNeeds = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR')

    return needs.filter((need) => {
      const matchesCategory = activeCategory === 'Todas' || need.category === activeCategory
      const matchesPriority = activePriority === 'Todas' || need.priority === activePriority
      const matchesSearch = !normalizedSearch
        || `${need.title} ${need.description} ${need.unitName} ${need.category}`
          .toLocaleLowerCase('pt-BR')
          .includes(normalizedSearch)

      return matchesCategory && matchesPriority && matchesSearch
    })
  }, [activeCategory, activePriority, needs, searchTerm])

  const urgentNeeds = visibleNeeds.filter((need) => need.priority === 'alta')
  const otherNeeds = visibleNeeds.filter((need) => need.priority !== 'alta')
  const unitsCount = new Set(visibleNeeds.map((need) => need.unitId)).size
  const hasActiveFilters = activeCategory !== 'Todas' || activePriority !== 'Todas' || searchTerm.trim().length > 0

  const resetFilters = (): void => {
    setActiveCategory('Todas')
    setActivePriority('Todas')
    setSearchTerm('')
  }

  return (
    <section className="page-block home-urgent-section donate-page">
      <header className="donate-page__header">
        <div>
          <span className="page-kicker">Necessidades da rede</span>
          <h2>Pedidos abertos para doação</h2>
          <p>
            Filtre por categoria, prioridade ou unidade, confira o andamento de cada pedido e escolha onde doar.
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
          <strong>Encontrar pedidos</strong>
        </div>

        <label className="donate-search-field">
          <FaSearch aria-hidden="true" />
          <span className="sr-only">Buscar pedido</span>
          <input
            type="search"
            placeholder="Buscar por item, descrição ou CAPS"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <CategoryFilter
          categories={donationCategories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        <div className="donate-priority-filter" role="group" aria-label="Filtrar por prioridade">
          {[
            { value: 'Todas', label: 'Todas' },
            { value: 'alta', label: 'Urgentes' },
            { value: 'media', label: 'Moderadas' },
            { value: 'baixa', label: 'Baixa prioridade' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`category-filter__button${activePriority === option.value ? ' category-filter__button--active' : ''}`}
              onClick={() => setActivePriority(option.value as 'Todas' | Need['priority'])}
            >
              {option.label}
            </button>
          ))}

          {hasActiveFilters ? (
            <button type="button" className="donate-filter-clear" onClick={resetFilters}>
              Limpar filtros
            </button>
          ) : null}
        </div>
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
                actionLabel="Doar este pedido"
              />
            ))}
          </div>
        ) : (
          <p className="home-urgent-empty">Não há pedidos urgentes com os filtros atuais.</p>
        )}
      </section>

      <section className="donate-requests-section" aria-labelledby="other-needs-title">
        <div className="home-urgent-header">
          <div>
            <span className="page-kicker">Apoio contínuo</span>
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
                actionLabel="Ver e doar"
              />
            ))}
          </div>
        ) : (
          <p className="home-urgent-empty">Não há pedidos adicionais com os filtros atuais.</p>
        )}
      </section>
    </section>
  )
}
