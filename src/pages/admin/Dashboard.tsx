import React, { useState } from 'react'
import { IconType } from 'react-icons'
import { FaBoxOpen, FaChartLine, FaChartPie, FaGift, FaHospital, FaPlus, FaSignOutAlt, FaTrash, FaUser, FaUsers } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import AdminDashboardSummary from '../../components/AdminDashboard'
import { Cap, Donation } from '../../types'
import { caps, donationCategories, needs as mockNeeds, projectStats } from '../../data/mock'
import { useDashboardData } from '../../hooks/useDashboardData'
import { logoutHost } from '../../services/auth-service'
import { createNeed, deleteNeed } from '../../services/needs-service'

import '../../Styles/Dashboard.css'

// Abas disponíveis na área administrativa.
type TabType = 'overview' | 'donations' | 'analytics' | 'profile' | 'residents'

const dashboardTabs: Array<{ key: TabType, label: string, icon: IconType }> = [
  { key: 'overview', label: 'Visão geral', icon: FaChartLine },
  { key: 'donations', label: 'Solicitações', icon: FaGift },
  { key: 'analytics', label: 'Analytics', icon: FaChartPie },
  { key: 'profile', label: 'Perfil', icon: FaUser },
  { key: 'residents', label: 'Residentes', icon: FaUsers },
]

// Configuração de categorias usada no resumo e gráfico de analytics.
const analyticsCategories: Array<{
  key: Donation['category']
  label: string
  color: string
}> = [
  { key: 'roupa', label: 'Roupa', color: '#884d99' },
  { key: 'comida', label: 'Comida', color: '#cc9900' },
  { key: 'utensilios', label: 'Utensílios', color: '#2c6a8f' },
]

const requestPriorityOptions: Array<{
  value: 'media' | 'alta'
  label: string
  description: string
}> = [
  { value: 'media', label: 'Não urgente', description: 'Pedido importante, sem necessidade imediata.' },
  { value: 'alta', label: 'Urgente', description: 'Prioridade alta para exibição pública.' },
]

export default function Dashboard(): React.ReactElement {
  // activeTab controla qual seção da interface será exibida.
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const [requestCategory, setRequestCategory] = useState('Roupas')
  const [requestDescription, setRequestDescription] = useState('')
  const [requestAmount, setRequestAmount] = useState('')
  const [requestPriority, setRequestPriority] = useState<'media' | 'alta'>('media')
  const [requestFeedback, setRequestFeedback] = useState('')
  const [isPublishingRequest, setIsPublishingRequest] = useState(false)
  const [deletingNeedIds, setDeletingNeedIds] = useState<Set<string>>(new Set())
  const [residentSearch, setResidentSearch] = useState('')

  const { loggedHost, publishedNeeds, hostDonations, residents, setPublishedNeeds } = useDashboardData()
  const navigate = useNavigate()
  // Encerra sessão local e redireciona para o login.
  const handleLogout = async () => {
    try {
      await logoutHost()
    } catch {
      // Mesmo se o backend já tiver perdido a sessão, limpamos o estado local.
    } finally {
      localStorage.removeItem('loggedHost')
      navigate('/admin/login')
    }
  }

  const handleNeedPublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRequestFeedback('')

    const amount = Number(requestAmount)
    if (!Number.isInteger(amount) || amount <= 0) {
      setRequestFeedback('Informe uma quantidade válida para publicar a solicitação.')
      return
    }

    setIsPublishingRequest(true)
    try {
      const createdNeed = await createNeed({
        title: requestCategory,
        amount,
        description: requestDescription,
        category: requestCategory,
        priority: requestPriority,
      })

      setPublishedNeeds((current) => [
        {
          id: createdNeed.id,
          title: createdNeed.title,
          amount: createdNeed.amount,
          description: createdNeed.description,
          priority: createdNeed.priority,
          category: createdNeed.category,
          unitId: createdNeed.unit?.slug ?? createdNeed.unitId ?? createdNeed.unit?.id ?? '',
        },
        ...current,
      ])

      setRequestDescription('')
      setRequestAmount('')
      setRequestPriority('media')
      setRequestFeedback('Solicitação publicada com sucesso.')
    } catch (error: any) {
      setRequestFeedback(error?.message || 'Não foi possível publicar a solicitação.')
    } finally {
      setIsPublishingRequest(false)
    }
  }

  const handleNeedDelete = async (needId: string) => {
    const shouldDelete = window.confirm('Apagar esta solicitação ativa? Esta ação remove o pedido da página pública.')
    if (!shouldDelete) {
      return
    }

    setRequestFeedback('')
    setDeletingNeedIds((current) => new Set(current).add(needId))

    try {
      await deleteNeed(needId)
      setPublishedNeeds((current) => current.filter((need) => need.id !== needId))
      setRequestFeedback('Solicitação apagada com sucesso.')
    } catch (error: any) {
      setRequestFeedback(error?.message || 'Não foi possível apagar a solicitação.')
    } finally {
      setDeletingNeedIds((current) => {
        const next = new Set(current)
        next.delete(needId)
        return next
      })
    }
  }

  // Enquanto o host não foi carregado do storage, mantém estado de espera.
  if (!loggedHost) {
    return <div>Carregando...</div>
  }

  // Dados derivados para o host logado (unidade, doações e agregações).
  const hostCaps: Cap | undefined = caps.find(c => c.id === loggedHost.capId)
  const normalizedResidentSearch = residentSearch.trim().toLowerCase()
  const filteredResidents = residents.filter((resident) => {
    if (!normalizedResidentSearch) {
      return true
    }

    return resident.name.toLowerCase().includes(normalizedResidentSearch)
  })

  // Conta quantas doações existem em cada categoria.
  const donationCategoryCounts = hostDonations.reduce<Record<Donation['category'], number>>(
    (accumulator, donation) => {
      accumulator[donation.category] += 1
      return accumulator
    },
    { roupa: 0, comida: 0, utensilios: 0 }
  )

  const totalDonations = hostDonations.length

  // Estrutura pronta para cards e legenda do gráfico.
  const chartData = analyticsCategories.map(category => {
    const value = donationCategoryCounts[category.key]
    const percentage = totalDonations === 0 ? 0 : Math.round((value / totalDonations) * 100)

    return {
      ...category,
      value,
      percentage,
    }
  })

  // Acumulador usado para montar segmentos do conic-gradient (pizza).
  let accumulatedValue = 0
  const pieChartSegments = chartData
    .filter(category => category.value > 0)
    .map(category => {
      const start = (accumulatedValue / totalDonations) * 100
      accumulatedValue += category.value
      const end = (accumulatedValue / totalDonations) * 100

      return `${category.color} ${start}% ${end}%`
    })

  // Fundo dinâmico do gráfico de pizza (ou estado vazio sem dados).
  const pieChartBackground =
    totalDonations > 0
      ? `conic-gradient(${pieChartSegments.join(', ')})`
      : 'conic-gradient(#dce8e5 0% 100%)'

  // Texto de acessibilidade para leitores de tela.
  const pieChartAriaLabel =
    totalDonations > 0
      ? `Distribuição de doações por categoria: ${chartData
          .map(category => `${category.label} ${category.value} doações (${category.percentage}%)`)
          .join(', ')}.`
      : 'Nenhuma doação registrada para exibir no gráfico de pizza.'
  const selectedPriorityOption = requestPriorityOptions.find((option) => option.value === requestPriority)
  const requestFeedbackType = requestFeedback.includes('sucesso') ? 'success' : 'error'
  const requestDescriptionLength = requestDescription.trim().length

  return (
    <section className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header__content">
          <div>
            <span className="page-kicker">Painel administrativo</span>
            <h1>Bem-vindo, {loggedHost.name}</h1>
            <p className="dashboard-subtitle">{hostCaps?.title}</p>
          </div>
          <button className="dashboard-logout" onClick={handleLogout}>
            <FaSignOutAlt aria-hidden="true" />
            Sair
          </button>
        </div>
      </header>

      {/* Navegacao por abas (sem trocar rota, apenas estado interno). */}
      <nav className="dashboard-nav" aria-label="Navegação do dashboard">
        {dashboardTabs.map(({ key, label, icon: TabIcon }) => (
          <button
            key={key}
            className={`dashboard-nav__item ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
            type="button"
          >
            <TabIcon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="dashboard-main">
        {/* TAB: OVERVIEW - visão rápida de indicadores e atalhos */}
        {activeTab === 'overview' && (
          <section className="dashboard-tab">
            <h2>Visão Geral</h2>
            <p>Bem-vindo ao painel de gestão. Você gerencia <strong>{hostCaps?.title}</strong>.</p>

            <AdminDashboardSummary stats={projectStats} needs={mockNeeds} />

            <div className="dashboard-cards">
              <article className="dashboard-card">
                <h3>Total de Doações</h3>
                <p className="dashboard-card__value">{hostDonations.length}</p>
                <p className="dashboard-card__label">doações registradas</p>
              </article>

              <article className="dashboard-card">
                <h3>Doações por Categoria</h3>
                <p className="dashboard-card__value">
                  {hostDonations.filter(d => d.category === 'roupa').length}
                </p>
                <p className="dashboard-card__label">roupas</p>
              </article>

              <article className="dashboard-card">
                <h3>Última Doação</h3>
                <p className="dashboard-card__value">
                  {hostDonations.length > 0
                    ? new Date(hostDonations[0].registeredAt).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </p>
                <p className="dashboard-card__label">registrada</p>
              </article>
            </div>

            <div className="dashboard-section">
              <h3>Ações Rápidas</h3>
              <div className="dashboard-actions">
                <button className="dashboard-action-btn" onClick={() => setActiveTab('donations')}>
                  <FaPlus aria-hidden="true" />
                  Nova solicitação
                </button>
                <button className="dashboard-action-btn" onClick={() => navigate('/caps')}>
                  <FaHospital aria-hidden="true" />
                  Ver página pública
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB: DONATIONS - formulário de solicitação de necessidades */}
        {activeTab === 'donations' && (
          <section className="dashboard-tab">
            <div className="dashboard-tab__intro">
              <div>
                <span className="page-kicker">Solicitações públicas</span>
                <h2>Solicitar doações</h2>
                <p>Monte um pedido claro para a comunidade, com categoria, quantidade, prioridade e contexto.</p>
              </div>
              <span className="dashboard-tab__unit">{hostCaps?.title ?? 'Unidade CAPS'}</span>
            </div>

            <form className="donation-request-form" onSubmit={handleNeedPublish}>
              <div className="donation-request-form__main">
                <fieldset className="donation-request-block donation-request-block--category">
                  <legend>
                    <span>1</span>
                    Categoria
                  </legend>
                  <div className="request-category-grid" role="group" aria-label="Categoria da solicitação">
                    {donationCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`request-category-chip${requestCategory === category ? ' is-selected' : ''}`}
                        onClick={() => setRequestCategory(category)}
                        disabled={isPublishingRequest}
                        aria-pressed={requestCategory === category}
                      >
                        <FaBoxOpen aria-hidden="true" />
                        {category}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="donation-request-block donation-request-block--details">
                  <legend>
                    <span>2</span>
                    Detalhes do pedido
                  </legend>

                  <div className="request-field-grid">
                    <div className="form-group">
                      <label htmlFor="request-amount">Quantidade necessária</label>
                      <input
                        id="request-amount"
                        type="number"
                        min={1}
                        placeholder="Ex.: 50"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(e.target.value)}
                        required
                        disabled={isPublishingRequest}
                      />
                    </div>

                    <div className="form-group">
                      <span className="request-field-label">Prioridade</span>
                      <div className="request-priority-grid" role="group" aria-label="Prioridade da solicitação">
                        {requestPriorityOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`request-priority-card${requestPriority === option.value ? ' is-selected' : ''}`}
                            onClick={() => setRequestPriority(option.value)}
                            disabled={isPublishingRequest}
                            aria-pressed={requestPriority === option.value}
                          >
                            <strong>{option.label}</strong>
                            <small>{option.description}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group form-group--full">
                    <label htmlFor="request-description">Descrição da necessidade</label>
                    <textarea
                      id="request-description"
                      placeholder="Ex.: Precisamos de kits de higiene para acolhimentos desta semana."
                      rows={5}
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      required
                      disabled={isPublishingRequest}
                    ></textarea>
                    <span className="request-field-hint">
                      Seja específico sobre o item, perfil de uso e urgência. {requestDescriptionLength} caracteres.
                    </span>
                  </div>
                </fieldset>
              </div>

              <aside className="donation-request-preview" aria-label="Resumo da solicitação">
                <span className="page-kicker">Prévia</span>
                <h3>{requestCategory}</h3>
                <div className="request-preview-stats">
                  <span>
                    <strong>{requestAmount || '0'}</strong>
                    quantidade
                  </span>
                  <span className={`request-preview-priority request-preview-priority--${requestPriority}`}>
                    {selectedPriorityOption?.label}
                  </span>
                </div>
                <p>{requestDescription.trim() || 'A descrição aparecerá aqui conforme você preencher o pedido.'}</p>

                {requestFeedback && (
                  <p className={`request-feedback request-feedback--${requestFeedbackType}`} role="status">
                    {requestFeedback}
                  </p>
                )}

                <button type="submit" className="btn-primary" disabled={isPublishingRequest}>
                  {isPublishingRequest ? 'Publicando...' : 'Publicar solicitação'}
                </button>
              </aside>
            </form>

            <div className="dashboard-section">
              <div className="dashboard-section__heading">
                <div>
                  <h3>Solicitações ativas</h3>
                  <p>{hostCaps?.title}</p>
                </div>
                <span>{publishedNeeds.length} em aberto</span>
              </div>
              {publishedNeeds.length === 0 ? (
                <p className="dashboard-empty-state">Neste momento, não há solicitações de doação. Crie uma acima.</p>
              ) : (
                <div className="dashboard-cards">
                  {publishedNeeds.map((need) => (
                    <article className="dashboard-card dashboard-card--request" key={need.id}>
                      <h3>{need.title}</h3>
                      <p className="dashboard-card__value">{need.amount}</p>
                      <p className="dashboard-card__label">{need.priority === 'alta' ? 'Urgente' : 'Não urgente'}</p>
                      <p className="dashboard-card__description">{need.description}</p>
                      <button
                        type="button"
                        className="dashboard-card__delete"
                        onClick={() => handleNeedDelete(need.id)}
                        disabled={deletingNeedIds.has(need.id)}
                      >
                        <FaTrash aria-hidden="true" />
                        {deletingNeedIds.has(need.id) ? 'Apagando...' : 'Apagar pedido'}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB: ANALYTICS - distribuição e histórico das doações */}
        {activeTab === 'analytics' && (
          <section className="dashboard-tab">
            <h2>Analytics - Histórico de Doações</h2>
            <p>Visualize dados e gráficos das doações recebidas por {hostCaps?.title}.</p>

            <div className="analytics-summary">
              {chartData.map(category => (
                <div className="analytics-card" key={category.key}>
                  <h3>{category.label}</h3>
                  <p className="analytics-value">{category.value}</p>
                  <p className="analytics-label">doações</p>
                </div>
              ))}
            </div>

            <div className="analytics-chart-card">
              <div className="analytics-chart-card__header">
                <div>
                  <span className="analytics-chart-card__eyebrow">BI do CAPS</span>
                  <h3>Gráfico de pizza por categoria</h3>
                  <p>Leitura rápida da composição das {totalDonations} doações recebidas.</p>
                </div>
              </div>

              <div className="analytics-chart-layout">
                <div
                  className={`analytics-pie-chart ${totalDonations === 0 ? 'is-empty' : ''}`}
                  style={{ background: pieChartBackground }}
                  role="img"
                  aria-label={pieChartAriaLabel}
                />

                <div className="analytics-legend" aria-label="Legenda do gráfico de pizza">
                  {chartData.map(category => (
                    <article className="analytics-legend__item" key={category.key}>
                      <span
                        className="analytics-legend__swatch"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <div>
                        <strong>{category.label}</strong>
                        <span>{category.value} doações registradas</span>
                      </div>
                      <span className="analytics-legend__percentage">{category.percentage}%</span>
                    </article>
                  ))}
                </div>
              </div>

              {totalDonations === 0 && (
                <p className="analytics-chart-card__empty">
                  Assim que as primeiras doações forem registradas, o gráfico exibirá a
                  distribuição automaticamente.
                </p>
              )}
            </div>

            <div className="analytics-section">
              <h3>Timeline de Doações (Últimas 10)</h3>
              <div className="table-scroll" aria-label="Tabela de doações com rolagem horizontal">
                <table className="donations-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Hora</th>
                      <th>Categoria</th>
                      <th>Quantidade</th>
                      <th>Doador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostDonations.slice(0, 10).map(donation => (
                      <tr key={donation.id}>
                        <td>{new Date(donation.date).toLocaleDateString('pt-BR')}</td>
                        <td>{donation.time}</td>
                        <td className={`category-badge category-${donation.category}`}>
                          {donation.category}
                        </td>
                        <td>{donation.quantity}</td>
                        <td>
                          {donation.isAnonymous ? (
                            <em>Anônimo</em>
                          ) : (
                            donation.donorName || 'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB: PROFILE - dados cadastrais do gestor e da unidade */}
        {activeTab === 'profile' && (
          <section className="dashboard-tab">
            <h2>Perfil do Gestor</h2>
            <p>Informações e dados de contato de {loggedHost.name}</p>

            <div className="profile-card">
              <h3>Dados Pessoais</h3>
              <div className="profile-field">
                <label>Nome Completo</label>
                <p className="profile-value">{loggedHost.name}</p>
              </div>

              <div className="profile-field">
                <label>E-mail</label>
                <p className="profile-value">{loggedHost.email}</p>
              </div>

              <div className="profile-field">
                <label>Contato</label>
                <p className="profile-value">{loggedHost.contact}</p>
              </div>

              <div className="profile-field">
                <label>CAPS Gerenciado</label>
                <p className="profile-value">
                  {hostCaps?.title} ({hostCaps?.unitType})
                </p>
              </div>

              <div className="profile-field">
                <label>Endereço do CAPS</label>
                <p className="profile-value">{hostCaps?.address}</p>
              </div>

              <div className="profile-field">
                <label>Contato CAPS</label>
                <p className="profile-value">{hostCaps?.contact}</p>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn-secondary">Editar perfil</button>
              <button className="btn-secondary">Alterar senha</button>
            </div>
          </section>
        )}

        {/* TAB: RESIDENTS - lista de residentes de outras unidades */}
        {activeTab === 'residents' && (
          <section className="dashboard-tab">
            <h2>Residentes da Unidade</h2>
            <p>Visualize os residentes cadastrados na sua unidade para acompanhamento interno.</p>

            <div className="residents-filter">
              <input
                type="text"
                placeholder="Buscar por nome..."
                className="residents-search"
                value={residentSearch}
                onChange={(event) => setResidentSearch(event.target.value)}
              />
            </div>

            <div className="table-scroll" aria-label="Tabela de residentes com rolagem horizontal">
              <table className="residents-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Contato de Emergência</th>
                    <th>Data de Entrada</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResidents.map(resident => (
                      <tr key={resident.id}>
                        <td>{resident.name}</td>
                        <td>{resident.emergencyContact || 'Não informado'}</td>
                        <td>{new Date(resident.entryDate).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <span className={`status-badge status-${resident.status}`}>
                            {resident.status === 'ativo'
                              ? 'Ativo'
                              : resident.status === 'transferido'
                                ? 'Transferido'
                                : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {filteredResidents.length === 0 && (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Nenhum residente encontrado para o filtro informado.
              </p>
            )}
          </section>
        )}
      </main>
    </section>
  )
}
