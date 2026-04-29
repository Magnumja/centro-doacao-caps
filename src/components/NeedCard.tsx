import React from 'react'
import { Need } from '../types'

type NeedCardProps = { need: Need }

export default function NeedCard({ need }: NeedCardProps): React.ReactElement {
  return (
    <div className="page-card">
      <h3>{need.title}</h3>
      <p>{need.amount} necessários</p>
    </div>
  )
}
