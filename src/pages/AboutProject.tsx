import React from 'react'
import { FaHandsHelping, FaHospital, FaLightbulb } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import '../Styles/AboutProject.css'

const projectPoints = [
  {
    title: 'O que e',
    description: 'Uma plataforma para reunir pedidos reais das unidades CAPS de Campo Grande/MS e facilitar doacoes em itens.',
    icon: FaHospital,
  },
  {
    title: 'Por que existe',
    description: 'Para dar mais clareza ao que cada unidade precisa e aproximar a comunidade da rede de cuidado em saude mental.',
    icon: FaHandsHelping,
  },
  {
    title: 'Como funciona',
    description: 'A pessoa escolhe uma unidade, confere os pedidos ativos e combina ou registra a intencao de doacao.',
    icon: FaLightbulb,
  },
]

export default function AboutProject(): React.ReactElement {
  return (
    <section className="about-project-page about-project-page--compact">
      <header className="page-block about-hero">
        <div className="about-hero__content">
          <span className="page-kicker">Centro de Doacao CAPS</span>
          <h2>Sobre o projeto</h2>
          <p>
            O Centro de Doacao CAPS organiza necessidades das unidades CAPS e ajuda doadores
            a encontrarem onde sua contribuicao pode fazer diferenca.
          </p>
        </div>

      </header>

      <section className="page-block about-story-grid">
        {projectPoints.map(({ title, description, icon: PointIcon }) => (
          <article className="about-info-card" key={title}>
            <span className="about-info-card__icon" aria-hidden="true"><PointIcon /></span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="page-block about-creator-section">
        <div className="section-heading">
          <span className="page-kicker">Autoria</span>
          <h2>Criador e idealizador</h2>
        </div>

        <article className="about-creator-card about-creator-card--with-photo">
          <img
            className="about-creator-card__photo"
            src="/magnum-johanson.png"
            alt="Magnum Johanson de Abreu"
            loading="lazy"
          />
          <div>
            <h3>Magnum Johanson de Abreu</h3>
            <strong>Criador e idealizador do Centro de Doacao CAPS</strong>
            <p>Desenvolveu o site a partir das demandas e aprendizados do PET-Saude Digital.</p>
          </div>
        </article>
      </section>

      <section className="page-block about-cocreators-section">
        <div className="section-heading">
          <span className="page-kicker">Co-criadores e apoio</span>
          <h2>Grupo PET-Saude Digital</h2>
        </div>

        <article className="about-cocreators-card">
          <img
            className="about-cocreators-card__photo"
            src="/pet-saude-digital-grupo.jpeg"
            alt="Grupo PET-Saude Digital que apoia o Centro de Doacao CAPS"
            loading="lazy"
          />
          <div>
            <h3>Apoio coletivo do PET-Saude Digital</h3>
            <p>
              O grupo contribui com informacoes, vivencias e orientacoes sobre a rede CAPS,
              ajudando o site a refletir necessidades reais do servico.
            </p>
          </div>
        </article>
      </section>

      <section className="page-block about-final-cta">
        <div>
          <span className="page-kicker">Participe</span>
          <h2>Quer contribuir com essa rede de cuidado?</h2>
          <p>Veja os pedidos ativos, escolha uma unidade CAPS e combine a entrega.</p>
        </div>

        <div className="about-final-cta__actions">
          <Link className="home-hero-button home-hero-button--primary" to="/donate">
            Ver necessidades
          </Link>
          <Link className="home-hero-button home-hero-button--secondary" to="/caps">
            Conhecer unidades CAPS
          </Link>
        </div>
      </section>
    </section>
  )
}
