import React from 'react'
import { Need } from '../types'

type Props = { need: Need }

export default function NeedCard({ need }: Props): JSX.Element {
  return (
    <div className="page-card">
      <h3>{need.title}</h3>
      <p>{need.amount} necessários</p>
    </div>
  )
}
