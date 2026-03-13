import React from 'react'
import { Need } from '../types'

// Recebe um item de necessidade para exibição resumida.
type Props = { need: Need }

export default function NeedCard({ need }: Props): JSX.Element {
  return (
    // Card simples usado para mostrar título e quantidade necessária.
    <div className="page-card">
      <h3>{need.title}</h3>
      <p>{need.amount} necessários</p>
    </div>
  )
}
