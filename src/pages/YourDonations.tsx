import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarCheck, FaClock, FaGift, FaSignOutAlt, FaTrash, FaUserCircle } from 'react-icons/fa'

import { useDonorSession } from '../hooks/useDonorSession'
import { getErrorMessage } from '../lib/api'
import { formatDate } from '../lib/format'
import { getDonorAccessPath, getUnitPath } from '../lib/routes'
import { DonorDonation, fetchDonorDonations } from '../services/donor-service'
import { listDonorIntentions, removeDonorIntention, DonorIntention } from '../services/donor-intentions-service'

// Formato comum para mostrar doações da conta (servidor) e do aparelho (localStorage).
type DonationCardData = {
  id: string
  unitSlug: string
  unitName: string
  date: string
  time: string
  identity: string
  items: Array<{ name: string, quantity: string }>
}

function fromAccount(donation: DonorDonation): DonationCardData {
  return {
    id: donation.id,
    unitSlug: donation.unit.slug,
    unitName: donation.unit.title,
    date: donation.date,
    time: donation.time,
    identity: donation.isAnonymous ? 'Anônima para a unidade' : 'Com seu nome',
    items: donation.items.map((item) => ({ name: item.label, quantity: item.quantity })),
  }
}

function fromDevice(intention: DonorIntention): DonationCardData {
  return {
    id: intention.id,
    unitSlug: intention.unitSlug,
    unitName: intention.unitName,
    date: intention.donationDate,
    time: intention.donationTime,
    identity: intention.isAnonymous ? 'Doação anônima' : intention.donorName ?? '',
    items: intention.items,
  }
}

function DonationCard({ donation, onRemove }: { donation: DonationCardData, onRemove?: () => void }): React.ReactElement {
  return (
    <article className="your-donation-card">
      <div className="your-donation-card__top">
        <div>
          <span className="your-donation-status">Registrada</span>
          <h4>{donation.unitName}</h4>
        </div>
        {onRemove ? (
          <button
            type="button"
            className="your-donation-remove"
            onClick={onRemove}
            aria-label={`Remover intenção para ${donation.unitName}`}
            title="Remover registro deste navegador"
          >
            <FaTrash aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="your-donation-meta">
        <span><FaCalendarCheck aria-hidden="true" /> {formatDate(donation.date)}</span>
        <span><FaClock aria-hidden="true" /> {donation.time}</span>
      </div>

      <ul className="your-donation-items">
        {donation.items.map((item) => (
          <li key={`${donation.id}-${item.name}`}>
            <strong>{item.name}</strong>
            <span>{item.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="your-donation-card__footer">
        <span>{donation.identity}</span>
        <Link to={getUnitPath(donation.unitSlug)}>Doar novamente nesta unidade</Link>
      </div>
    </article>
  )
}

export default function YourDonations(): React.ReactElement {
  const { donor, isChecking, isDemo, canUseDemo, loginDemo, logout } = useDonorSession()
  const [deviceIntentions, setDeviceIntentions] = useState<DonorIntention[]>(() => listDonorIntentions())
  const [accountDonations, setAccountDonations] = useState<DonorDonation[]>([])
  const [isLoadingAccount, setIsLoadingAccount] = useState(false)
  const [accountError, setAccountError] = useState('')

  useEffect(() => {
    // Demonstração não tem conta no servidor: o histórico vem deste aparelho.
    if (!donor || isDemo) {
      setAccountDonations([])
      return undefined
    }

    let mounted = true
    setIsLoadingAccount(true)
    setAccountError('')
    fetchDonorDonations()
      .then((donations) => { if (mounted) setAccountDonations(donations) })
      .catch((error) => { if (mounted) setAccountError(getErrorMessage(error, 'Não foi possível carregar seu histórico.')) })
      .finally(() => { if (mounted) setIsLoadingAccount(false) })
    return () => {
      mounted = false
    }
  }, [donor, isDemo])

  const handleRemove = (id: string) => {
    removeDonorIntention(id)
    setDeviceIntentions(listDonorIntentions())
  }

  const deviceCards = deviceIntentions.map((intention) => (
    <DonationCard key={intention.id} donation={fromDevice(intention)} onRemove={() => handleRemove(intention.id)} />
  ))

  return (
    <section className="page-block your-donations-page">
      <div className="your-donations-header">
        <div>
          <span className="page-kicker">Suas doações</span>
          <h1>{donor ? `Olá, ${donor.name.split(' ')[0]}` : 'Registros salvos neste aparelho'}</h1>
          <p>
            {donor
              ? 'Suas últimas doações registradas com a sua conta, em qualquer aparelho.'
              : 'Consulte ou remova as intenções enviadas por este navegador.'}
          </p>
        </div>
        <Link className="your-donations-primary" to="/caps">
          Fazer nova doação
        </Link>
      </div>

      {donor ? (
        <div className="your-donations-account">
          <FaUserCircle aria-hidden="true" />
          <span>
            <strong>{donor.name}</strong>
            <small>{isDemo ? 'Modo demonstração (localhost)' : donor.email}</small>
          </span>
          <button type="button" onClick={() => void logout()}>
            <FaSignOutAlt aria-hidden="true" /> Sair da conta
          </button>
        </div>
      ) : !isChecking ? (
        <aside className="your-donations-account-cta">
          <div>
            <strong>Acompanhe suas doações em qualquer aparelho</strong>
            <p>Com uma conta gratuita, seu histórico fica salvo e seus dados já vêm preenchidos ao doar.</p>
          </div>
          <div className="your-donations-account-cta__actions">
            <Link className="your-donations-primary" to={getDonorAccessPath('/suas-doacoes', 'criar')}>Criar conta</Link>
            <Link className="your-donations-secondary" to={getDonorAccessPath('/suas-doacoes')}>Já tenho conta</Link>
            {/* Atalho de apresentação: só em localhost, igual ao do painel do gestor. */}
            {canUseDemo ? (
              <button type="button" className="your-donations-secondary" onClick={loginDemo}>
                Entrar direto no localhost
              </button>
            ) : null}
          </div>
        </aside>
      ) : null}

      <section className="your-donations-section" aria-labelledby="your-intentions-title">
        <h2 id="your-intentions-title" className="sr-only">Intenções registradas</h2>
        <div className="your-donations-section__title">
          <FaGift aria-hidden="true" />
          <h3>{donor ? 'Últimas doações da sua conta' : 'Minhas intenções'}</h3>
        </div>

        {donor && isDemo ? (
          deviceCards.length > 0 ? (
            <div className="your-donations-list">{deviceCards}</div>
          ) : (
            <article className="your-donations-empty">
              <h4>Nenhuma doação registrada ainda</h4>
              <p>Registre uma doação em uma unidade CAPS e ela aparecerá aqui.</p>
              <Link className="your-donations-primary" to="/caps">Escolher uma unidade para doar</Link>
            </article>
          )
        ) : donor ? (
          isLoadingAccount ? (
            <p className="home-urgent-empty" role="status">Carregando seu histórico...</p>
          ) : accountError ? (
            <p className="form-feedback" role="alert">{accountError}</p>
          ) : accountDonations.length > 0 ? (
            <div className="your-donations-list">
              {accountDonations.map((donation) => <DonationCard key={donation.id} donation={fromAccount(donation)} />)}
            </div>
          ) : (
            <article className="your-donations-empty">
              <h4>Nenhuma doação na sua conta ainda</h4>
              <p>As doações que você registrar enquanto estiver conectado aparecerão aqui.</p>
              <Link className="your-donations-primary" to="/caps">Escolher uma unidade para doar</Link>
            </article>
          )
        ) : deviceCards.length > 0 ? (
          <div className="your-donations-list">{deviceCards}</div>
        ) : (
          <article className="your-donations-empty">
            <h4>Nenhuma intenção registrada ainda</h4>
            <p>
              Quando você preencher o formulário de doação, seus registros aparecerão aqui neste aparelho.
            </p>
            <Link className="your-donations-primary" to="/caps">Escolher uma unidade para doar</Link>
          </article>
        )}

        {/* Registros feitos antes de entrar continuam acessíveis, sem misturar com a conta. */}
        {donor && !isDemo && deviceCards.length > 0 ? (
          <details className="your-donations-device">
            <summary>{deviceCards.length} registro(s) feito(s) antes de entrar, salvos só neste aparelho</summary>
            <div className="your-donations-list">{deviceCards}</div>
          </details>
        ) : null}
      </section>

      <section className="your-donations-next-steps" aria-label="Próximas ações">
        <Link to="/donate">Ver necessidades abertas</Link>
        <Link to="/caps">Escolher outra unidade</Link>
      </section>
    </section>
  )
}
