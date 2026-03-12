import React from 'react'
import NeedCard from '../components/NeedCard'
import { needs } from '../data/mock'

export default function Donate(): JSX.Element {
  return (
    <section className="page-block">
      <span className="page-kicker">Doacao solidaria</span>
      <h2>Itens mais necessarios para os CAPS</h2>
      <p>Escolha um item e fortaleça o acolhimento em saude mental no territorio.</p>

      <div className="card-grid">
        {needs.map((n) => (
          <NeedCard key={n.id} need={n} />
        ))}
      </div>
    </section>
  )
}
