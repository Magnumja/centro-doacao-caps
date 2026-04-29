import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarCheck, FaClock, FaGift, FaMapMarkerAlt, FaTrash } from 'react-icons/fa'

import { caps as mockCaps } from '../data/mock'
import { fetchPublicNeeds } from '../lib/needs'
import { listDonorIntentions, removeDonorIntention, DonorIntention } from '../services/donor-intentions-service'
import { fetchUnits } from '../services/units-service'
import { Cap, Need } from '../types'
import '../Styles/YourDonations.css'

function formatDate(date: string): string {
  if (!date) return 'Data nao informada'

  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return parsed.toLocaleDateString('pt-BR')
}

export default function YourDonations(): React.ReactElement {
  const [intentions, setIntentions] = useState<DonorIntention[]>(() => listDonorIntentions())
  const [units, setUnits] = useState<Cap[]>([])
  const [needs, setNeeds] = useState<Need[]>([])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const [loadedUnits, loadedNeeds] = await Promise.all([
        fetchUnits().catch(() => mockCaps as Cap[]),
        fetchPublicNeeds(),
      ])

      if (!mounted) return

      setUnits(loadedUnits.length > 0 ? loadedUnits : mockCaps as Cap[])
      setNeeds(loadedNeeds)
    })()

    return () => {
      mounted = false
    }
  }, [])

  const urgentNeeds = useMemo(
    () => needs.filter((need) => need.priority === 'alta').slice(0, 6),
    [needs],
  )

  const handleRemove = (id: string) => {
    removeDonorIntention(id)
    setIntentions(listDonorIntentions())
  }

  return (
    <section className="page-block your-donations-page">
      <div className="your-donations-header">
        <div>
          <span className="page-kicker">Suas doacoes</span>
          <h2>Intencoes de doacao registradas neste aparelho</h2>
          <p>
            Acompanhe os registros que voce enviou por este navegador e encontre rapidamente
            onde pode doar novamente.
          </p>
        </div>
        <Link className="your-donations-primary" to="/caps">
          Fazer nova doacao
        </Link>
      </div>

      <section className="your-donations-section" aria-label="Intencoes registradas">
        <div className="your-donations-section__title">
          <FaGift aria-hidden="true" />
          <h3>Minhas intencoes</h3>
        </div>

        {intentions.length > 0 ? (
          <div className="your-donations-list">
            {intentions.map((intention) => (
              <article className="your-donation-card" key={intention.id}>
                <div className="your-donation-card__top">
                  <div>
                    <span className="your-donation-status">Registrada</span>
                    <h4>{intention.unitName}</h4>
                  </div>
                  <button
                    type="button"
                    className="your-donation-remove"
                    onClick={() => handleRemove(intention.id)}
                    aria-label={`Remover intencao para ${intention.unitName}`}
                    title="Remover registro deste navegador"
                  >
                    <FaTrash aria-hidden="true" />
                  </button>
                </div>

                <div className="your-donation-meta">
                  <span><FaCalendarCheck aria-hidden="true" /> {formatDate(intention.donationDate)}</span>
                  <span><FaClock aria-hidden="true" /> {intention.donationTime}</span>
                </div>

                <ul className="your-donation-items">
                  {intention.items.map((item) => (
                    <li key={`${intention.id}-${item.name}`}>
                      <strong>{item.name}</strong>
                      <span>{item.quantity}</span>
                    </li>
                  ))}
                </ul>

                <div className="your-donation-card__footer">
                  <span>{intention.isAnonymous ? 'Doacao anonima' : intention.donorName}</span>
                  <Link to={`/caps?unit=${intention.unitSlug}`}>Doar novamente nesta unidade</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <article className="your-donations-empty">
            <h4>Nenhuma intencao registrada ainda</h4>
            <p>
              Quando voce preencher o formulario de doacao, seus registros aparecerao aqui neste aparelho.
            </p>
            <Link className="your-donations-primary" to="/caps">Escolher uma unidade para doar</Link>
          </article>
        )}
      </section>

      <section className="your-donations-section" aria-label="Onde doar">
        <div className="your-donations-section__title">
          <FaMapMarkerAlt aria-hidden="true" />
          <h3>Onde voce pode doar</h3>
        </div>

        <div className="donation-places-grid">
          {units.map((unit) => (
            <article className="donation-place-card" key={unit.id}>
              <span className="unit-type-badge">{unit.unitType}</span>
              <h4>{unit.title}</h4>
              <p>{unit.address}</p>
              <p>{unit.contact ?? 'Contato nao informado'}</p>
              <Link to={`/caps?unit=${unit.id}`}>Doar para esta unidade</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="your-donations-section" aria-label="Necessidades urgentes">
        <div className="your-donations-section__title">
          <FaGift aria-hidden="true" />
          <h3>Pedidos urgentes</h3>
        </div>

        {urgentNeeds.length > 0 ? (
          <div className="urgent-needs-grid">
            {urgentNeeds.map((need) => (
              <article className="urgent-need-mini-card" key={need.id}>
                <span>Urgente</span>
                <h4>{need.title}</h4>
                <p>{need.description}</p>
                <strong>{need.amount} unidades</strong>
                <Link to={`/caps?unit=${need.unitId}`}>Ajudar esta unidade</Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="your-donations-muted">Nao ha pedidos urgentes registrados no momento.</p>
        )}
      </section>
    </section>
  )
}
