import React from 'react'

type Props = {
  children?: React.ReactNode
}

export default function Layout({ children }: Props): JSX.Element {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      <header style={{ padding: 16, background: '#f5f5f5' }}>
        <strong>Centro Doação</strong>
      </header>
      <main>{children}</main>
      <footer style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#666' }}>
        © Centro Doação
      </footer>
    </div>
  )
}
