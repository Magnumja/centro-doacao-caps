import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarCheck, FaClock, FaGift, FaTrash } from 'react-icons/fa'

import { formatDate } from '../lib/format'
import { getUnitPath } from '../lib/routes'
import { listDonorIntentions, removeDonorIntention, DonorIntention } from '../services/donor-intentions-service'

export default function YourDonations(): React.ReactElement {
  const [intentions, setIntentions] = useState<DonorIntention[]>(() => listDonorIntentions())

  const handleRemove = (id: string) => {
    removeDonorIntention(id)
    setIntentions(listDonorIntentions())
  }

  return (
    <section className="page-block your-donations-page">
      <div className="your-donations-header">
        <div>
          <span className="page-kicker">Suas doações</span>
          <h2>Registros salvos neste aparelho</h2>
          <p>
            Consulte ou remova as intenções enviadas por este navegador.
          </p>
        </div>
        <Link className="your-donations-primary" to="/caps">
          Fazer nova doação
        </Link>
      </div>

      <section className="your-donations-section" aria-label="Intenções registradas">
        <div className="your-donations-section__title">
          <FaGift aria-hidden="true" />
          <h3>Minhas intenções</h3>
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
                    aria-label={`Remover intenção para ${intention.unitName}`}
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
                  <span>{intention.isAnonymous ? 'Doação anônima' : intention.donorName}</span>
                  <Link to={getUnitPath(intention.unitSlug)}>Doar novamente nesta unidade</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <article className="your-donations-empty">
            <h4>Nenhuma intenção registrada ainda</h4>
            <p>
              Quando você preencher o formulário de doação, seus registros aparecerão aqui neste aparelho.
            </p>
            <Link className="your-donations-primary" to="/caps">Escolher uma unidade para doar</Link>
          </article>
        )}
      </section>

      <section className="your-donations-next-steps" aria-label="Próximas ações">
        <Link to="/donate">Ver necessidades abertas</Link>
        <Link to="/caps">Escolher outra unidade</Link>
      </section>
    </section>
  )
}
