import React from 'react'
import { Need } from '../types'

type Props = { need: Need }

export default function NeedCard({ need }: Props): JSX.Element {
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <h3>{need.title}</h3>
      <p>{need.amount} necessários</p>
    </div>
  )
}
