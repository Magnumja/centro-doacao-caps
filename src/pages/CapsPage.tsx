import React from 'react'
import Layout from '../components/Layout'
import CapsCard from '../components/CapsCard'
import { caps } from '../data/mock'

export default function CapsPage(): JSX.Element {
  return (
    <Layout>
      <div style={{ padding: 24 }}>
        <h1>CAPS</h1>
        <div style={{ display: 'grid', gap: 12 }}>
          {caps.map((c) => (
            <CapsCard key={c.id} cap={c} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
