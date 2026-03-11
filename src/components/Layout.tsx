import React from 'react'

type Props = {
  children?: React.ReactNode
}

export default function Layout(): React.ReactElement  {
  return (


    <div className="Menu-geral" style={{ padding: 24 }}>
      <div className='titulo'>
        <h1>Bem-vindo ao Sistema de Doação CAPS</h1>
      </div>
       <p>Este é o sistema de doação para o Centro de Atenção Psicossocial (CAPS). Aqui você pode fazer doações, acompanhar suas doações e muito mais.</p>

    </div>
  )
}

export function Navbar(): React.ReactElement {
  return (







    <div className="navbar" style={{ padding: 24 }}>
      <nav>
          <li><a href="/">Home</a></li>
          <li><a href="/doacoes">Doações</a></li>
          <li><a href="/sobre">Sobre</a></li>
          <li><a href="/contato">Contato</a></li>
      </nav>
    </div>
  )
}



/*


<div className = 'Menu-geral' style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      <header style={{ padding: 16, background: '#f5f5f5' }}>
        <strong>Centro Doação</strong>
      </header>
      <main>{children}</main>
      <footer style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#666' }}>
        © Centro Doação
      </footer>
    </div>
    
    
    */