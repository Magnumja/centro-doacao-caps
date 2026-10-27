import React, { useEffect, useLayoutEffect, useState } from 'react'
import { FaBars, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaTimes } from 'react-icons/fa'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { hasStoredHostSession } from '../lib/session'

// Imagens servidas da pasta /public (mesmo caminho em dev e produção).
const logo = '/logosesau.png'
const navbarLogoWhite = '/sesau-navbar-white.png'

export default function Layout(): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const canOpenAdminDirectly = hasStoredHostSession()
  // A animação de entrada roda só ao trocar de seção (ex.: /caps -> /donate). Dentro da
  // mesma seção (/caps -> /caps/c1) a página continua montada e mantém seus dados.
  const sectionKey = location.pathname.split('/')[1] || 'home'

  const navigationItems = [
    { to: '/', label: 'Início' },
    { to: '/caps', label: 'CAPS' },
    { to: '/donate', label: 'Necessidades' },
    { to: '/sobre-o-projeto', label: 'Sobre' },
    { to: '/suas-doacoes', label: 'Minhas doações' },
    { to: canOpenAdminDirectly ? '/admin/dashboard' : '/admin/login', label: 'Dashboard' },
  ]
  const leftNavigationItems = navigationItems.slice(0, 3)
  const rightNavigationItems = navigationItems.slice(3)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Nova página começa no topo, de imediato. 'instant' é necessário: com 'auto' o navegador
  // herda o scroll-behavior: smooth do CSS e a página nova aparecia rolando ~600ms desde o
  // fim. Só reage à troca de caminho; mudar só a query (abas, filtros) não mexe na rolagem.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  const renderNavLink = (item: { to: string; label: string }): React.ReactElement => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      onClick={() => setIsMobileMenuOpen(false)}
      className={({ isActive }) =>
        `health-nav__link${isActive ? ' health-nav__link--active' : ''}`
      }
    >
      {item.label}
    </NavLink>
  )

  return (
    <>
      <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
      <a className="skip-link" href="#primary-navigation">Pular para navegação</a>

      <header className="health-header">
        <div className="health-header__inner">
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-controls="primary-navigation"
            aria-label={isMobileMenuOpen ? 'Fechar menu principal' : 'Abrir menu principal'}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
            <span>Menu</span>
          </button>

          <Link className="mobile-header-brand" to="/" aria-label="Página inicial - SESAU">
            <img src={navbarLogoWhite} alt="SESAU Secretaria Municipal de Saúde" />
          </Link>

          <button
            type="button"
            className={`mobile-nav-backdrop${isMobileMenuOpen ? ' mobile-nav-backdrop--visible' : ''}`}
            aria-label="Fechar menu principal"
            aria-hidden={!isMobileMenuOpen}
            tabIndex={isMobileMenuOpen ? 0 : -1}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <nav
            id="primary-navigation"
            className={`health-nav${isMobileMenuOpen ? ' health-nav--open' : ''}`}
            aria-label="Menu principal"
          >
            <div className="health-nav__mobile-header">
              <strong>Menu</strong>
              <button
                type="button"
                aria-label="Fechar menu principal"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>

            <div className="health-nav__group">
              {leftNavigationItems.map(renderNavLink)}
            </div>

            <Link className="health-brand" to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={navbarLogoWhite} alt="SESAU Secretaria Municipal de Saúde" />
            </Link>

            <div className="health-nav__group">
              {rightNavigationItems.map(renderNavLink)}
            </div>
          </nav>

        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <div key={sectionKey} className="page-transition">
          <Outlet />
        </div>
      </main>

      <footer className="site-footer" aria-labelledby="site-footer-title">
        <div className="site-footer__inner">
          <section className="site-footer__brand">
            <img className="site-footer__logo" src={logo} alt="Logo SESAU" />
            <div>
              <span className="page-kicker">Centro de Doação CAPS</span>
              <h2 id="site-footer-title">Doações em itens para a rede CAPS.</h2>
              <p>
                Consulte necessidades, escolha uma unidade e combine a entrega diretamente com o serviço.
              </p>
            </div>
          </section>

          <section className="site-footer__column" aria-label="Links rápidos">
            <h3>Navegação</h3>
            <Link to="/donate">Ver necessidades</Link>
            <Link to="/caps">Unidades CAPS</Link>
            <Link to="/sobre-o-projeto">Sobre o projeto</Link>
            <Link to="/suas-doacoes">Minhas doações</Link>
          </section>

          <section className="site-footer__column site-footer__contact" aria-label="Fale conosco">
            <h3>Fale conosco</h3>
            <p><FaMapMarkerAlt aria-hidden="true" /> Campo Grande/MS</p>
            <p><FaPhoneAlt aria-hidden="true" /> Combine entregas diretamente com a unidade CAPS</p>
            <p><FaEnvelope aria-hidden="true" /> Use a página da unidade para contato e orientações</p>
          </section>
        </div>

        <div className="site-footer__bottom">
          <span>Secretaria Municipal de Saúde de Campo Grande/MS</span>
          <span>Doações em itens. O site não recebe dinheiro.</span>
        </div>
      </footer>
    </>
  )
}
