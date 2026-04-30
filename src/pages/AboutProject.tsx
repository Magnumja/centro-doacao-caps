import React from 'react'
import {
  FaBullseye,
  FaClipboardList,
  FaHandsHelping,
  FaHeart,
  FaHospital,
  FaLightbulb,
  FaNetworkWired,
  FaUsers,
} from 'react-icons/fa'
import { Link } from 'react-router-dom'

import '../Styles/AboutProject.css'

const workflowSteps = [
  'A unidade CAPS cadastra uma necessidade.',
  'A comunidade visualiza os pedidos ativos.',
  'O doador escolhe uma unidade e registra sua intenção de doação.',
  'A doação fortalece o cuidado e melhora a visibilidade das demandas.',
]

const impactItems = [
  'Maior organização das demandas',
  'Mais visibilidade para as unidades CAPS',
  'Facilidade para quem deseja doar',
  'Incentivo à participação social',
  'Apoio ao cuidado em saúde mental',
  'Uso da tecnologia para impacto social',
  'Fortalecimento de soluções digitais aplicadas à saúde pública',
]

export default function AboutProject(): React.ReactElement {
  return (
    <section className="about-project-page">
      <header className="page-block about-hero">
        <div className="about-hero__content">
          <span className="page-kicker">Centro de Doação CAPS</span>
          <h2>Sobre o Projeto</h2>
          <p>
            Uma iniciativa para aproximar solidariedade, tecnologia, saúde pública e cuidado
            em saúde mental.
          </p>
        </div>

        <aside className="about-hero__card" aria-label="Propósito do projeto">
          <span aria-hidden="true"><FaHandsHelping /></span>
          <strong>Doar com clareza, acolhimento e responsabilidade pública.</strong>
          <p>
            A plataforma organiza necessidades reais das unidades CAPS de Campo Grande/MS
            para tornar a participação da comunidade mais simples e confiável.
          </p>
        </aside>
      </header>

      <section className="page-block about-story-grid">
        <article className="about-info-card">
          <span className="about-info-card__icon" aria-hidden="true"><FaHospital /></span>
          <h3>O que é o projeto</h3>
          <p>
            O Centro de Doação CAPS é uma plataforma digital desenvolvida para organizar,
            divulgar e facilitar doações destinadas às unidades CAPS de Campo Grande/MS.
            O sistema permite que as unidades cadastrem suas necessidades, enquanto a
            comunidade visualiza pedidos ativos e escolhe como contribuir.
          </p>
        </article>

        <article className="about-info-card">
          <span className="about-info-card__icon" aria-hidden="true"><FaLightbulb /></span>
          <h3>Origem da idealização</h3>
          <p>
            O projeto foi idealizado por Magnum Johanson de Abreu a partir das experiências
            e aprendizados proporcionados pelo PET-Saúde Digital, juntamente com a SESAU —
            Secretaria Municipal de Saúde de Campo Grande/MS.
          </p>
          <p>
            Essas vivências permitiram observar como a tecnologia pode fortalecer políticas
            públicas, ampliar a organização das demandas e aproximar a população da rede de cuidado.
          </p>
        </article>
      </section>

      <section className="page-block about-purpose-section">
        <div className="section-heading">
          <span className="page-kicker">Por que existe</span>
          <h2>Transparência para necessidades concretas da rede de cuidado.</h2>
        </div>
        <p>
          Muitas unidades de cuidado em saúde mental precisam de itens básicos para melhorar
          o acolhimento, as oficinas terapêuticas e o atendimento aos usuários. O projeto nasce
          para tornar esse processo mais transparente, simples e acessível, fortalecendo a
          participação da comunidade.
        </p>
      </section>

      <section className="page-block about-workflow-section">
        <div className="section-heading">
          <span className="page-kicker">Como funciona</span>
          <h2>Da necessidade cadastrada à doação registrada.</h2>
        </div>

        <div className="about-workflow-grid">
          {workflowSteps.map((step, index) => (
            <article className="about-step-card" key={step}>
              <span className="about-step-card__number">{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-block about-impact-section">
        <div className="section-heading">
          <span className="page-kicker">Impacto esperado</span>
          <h2>Tecnologia aplicada para apoiar pessoas, equipes e políticas públicas.</h2>
        </div>

        <div className="about-impact-grid">
          {impactItems.map((item, index) => {
            const icons = [FaClipboardList, FaHospital, FaHandsHelping, FaUsers, FaHeart, FaNetworkWired, FaBullseye]
            const ImpactIcon = icons[index]

            return (
              <article className="about-impact-card" key={item}>
                <span aria-hidden="true"><ImpactIcon /></span>
                <strong>{item}</strong>
              </article>
            )
          })}
        </div>
      </section>

      <section className="page-block about-creator-section">
        <div className="section-heading">
          <span className="page-kicker">Autoria</span>
          <h2>Criador e idealizador</h2>
        </div>

        <div className="about-creator-layout">
          <p>
            Este projeto foi criado e idealizado por Magnum Johanson de Abreu, a partir das
            vivências proporcionadas pelo PET-Saúde Digital em conjunto com a SESAU —
            Secretaria Municipal de Saúde de Campo Grande/MS, com o propósito de unir
            tecnologia, solidariedade, inovação social e responsabilidade pública em uma
            solução prática para apoiar os CAPS.
          </p>

          <article className="about-creator-card">
            <span className="about-creator-card__avatar">MJ</span>
            <div>
              <h3>Magnum Johanson de Abreu</h3>
              <strong>Criador e idealizador do Centro de Doação CAPS</strong>
              <p>
                Estudante e desenvolvedor, com interesse em tecnologia aplicada à saúde,
                inovação social e soluções digitais voltadas ao fortalecimento de políticas públicas.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="page-block about-final-cta">
        <div>
          <span className="page-kicker">Participe</span>
          <h2>Quer contribuir com essa rede de cuidado?</h2>
          <p>
            Veja os pedidos ativos, escolha uma unidade CAPS e ajude a transformar
            necessidades em apoio concreto.
          </p>
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
