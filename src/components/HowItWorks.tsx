import React from 'react'
import { FaClipboardList, FaHandHoldingHeart, FaHospital } from 'react-icons/fa'
import { IconType } from 'react-icons'

type Step = {
  title: string
  description: string
  icon: IconType
}

const steps: Step[] = [
  {
    title: 'Escolha um CAPS',
    description: 'Veja as unidades da rede, seus contatos e a localização mais conveniente para sua doação.',
    icon: FaHospital,
  },
  {
    title: 'Veja os itens necessários',
    description: 'Filtre pedidos por categoria, urgência e status para entender onde sua ajuda faz diferença agora.',
    icon: FaClipboardList,
  },
  {
    title: 'Combine ou registre sua doação',
    description: 'Fale com a unidade, confirme os detalhes e registre sua intenção para facilitar o acompanhamento.',
    icon: FaHandHoldingHeart,
  },
]

export default function HowItWorks(): React.ReactElement {
  return (
    <section id="como-funciona" className="page-block how-it-works-section">
      <div className="section-heading">
        <span className="page-kicker">Como funciona</span>
        <h2>Um caminho simples para transformar vontade de ajudar em apoio concreto.</h2>
      </div>

      <div className="how-it-works-grid">
        {steps.map(({ title, description, icon: StepIcon }, index) => (
          <article className="how-it-works-card" key={title}>
            <span className="how-it-works-card__icon" aria-hidden="true">
              <StepIcon />
            </span>
            <span className="how-it-works-card__step">{index + 1}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
