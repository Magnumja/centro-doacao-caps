import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarCheck, FaClock, FaGift, FaTrash } from 'react-icons/fa'

import { listDonorIntentions, removeDonorIntention, DonorIntention } from '../services/donor-intentions-service'
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

  const handleRemove = (id: string) => {
    removeDonorIntention(id)
    setIntentions(listDonorIntentions())
  }

  return (
    <section className="page-block your-donations-page">
      <div className="your-donations-header">
        <div>
          <span className="page-kicker">Suas doacoes</span>
          <h2>Registros salvos neste aparelho</h2>
          <p>
            Consulte ou remova as intencoes enviadas por este navegador.
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

      <section className="your-donations-next-steps" aria-label="Proximas acoes">
        <Link to="/donate">Ver necessidades abertas</Link>
        <Link to="/caps">Escolher outra unidade</Link>
      </section>
    </section>
  )
}
