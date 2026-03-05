import React from 'react'
import { Cap } from '../types'

type Props = { cap: Cap }

export default function CapsCard({ cap }: Props): JSX.Element {
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <h3>{cap.title}</h3>
      <p>{cap.description}</p>
    </div>
  )
}
