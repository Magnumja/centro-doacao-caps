import React from 'react'
import Layout from '../components/Layout'
import NeedCard from '../components/NeedCard'
import { needs } from '../data/mock'

export default function Donate(): JSX.Element {
  return (
    <Layout>
      <div style={{ padding: 24 }}>
        <h1>Doar</h1>
        <div style={{ display: 'grid', gap: 12 }}>
          {needs.map((n) => (
            <NeedCard key={n.id} need={n} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
