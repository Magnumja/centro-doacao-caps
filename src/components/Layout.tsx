import React, { useEffect, useState } from 'react'
import { FaBars, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaTimes } from 'react-icons/fa'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { isLocalAuthBypassEnabled } from '../lib/auth'
import '../Styles/Layout.css'
import ThemeToggle from './ui/ThemeToggle'
import logo from '../public/logosesau.png'

export default function Layout(): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const hasAdminSession = typeof window !== 'undefined' && !!localStorage.getItem('loggedHost')
  const canOpenAdminDirectly = hasAdminSession || isLocalAuthBypassEnabled()

  const navigationItems = [
    { to: '/', label: 'Inicio' },
    { to: '/caps', label: 'CAPS' },
    { to: '/donate', label: 'Necessidades' },
    { to: '/sobre-o-projeto', label: 'Sobre' },
    { to: '/suas-doacoes', label: 'Minhas doacoes' },
    { to: canOpenAdminDirectly ? '/admin/dashboard' : '/admin/login', label: 'Dashboard' },
  ]

  useEffect(() => {
    setIsMobileMenuOpen(false)
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

  return (
    <>
      <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
      <a className="skip-link" href="#primary-navigation">Pular para navegação</a>

      <div className="site-banner">
        <div className="site-banner__content">
          <img className="site-banner__logo" src={logo} alt="Logo SESAU" />
          <div className="site-banner__text">
            <h1 className="site-banner__title">Centro de Doação CAPS</h1>
            <p className="site-banner__desc">Rede de Atenção Psicossocial - Campo Grande (MS)</p>
            <span className="site-banner__kicker">Secretaria Municipal de Saúde</span>
          </div>
          <div className="site-banner__meta" aria-label="Resumo institucional">
            <span>Campo Grande/MS</span>
            <strong>Doacoes organizadas para a rede CAPS</strong>
          </div>
        </div>
      </div>

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

            {navigationItems.map((item) => (
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
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer" aria-labelledby="site-footer-title">
        <div className="site-footer__inner">
          <section className="site-footer__brand">
            <img className="site-footer__logo" src={logo} alt="Logo SESAU" />
            <div>
              <span className="page-kicker">Centro de Doacao CAPS</span>
              <h2 id="site-footer-title">Conectando solidariedade e cuidado em saude mental.</h2>
              <p>
                Plataforma institucional para divulgar necessidades das unidades CAPS de Campo Grande/MS
                e orientar doadores com clareza.
              </p>
            </div>
          </section>

          <section className="site-footer__column" aria-label="Links rapidos">
            <h3>Navegacao</h3>
            <Link to="/donate">Ver necessidades</Link>
            <Link to="/caps">Unidades CAPS</Link>
            <Link to="/sobre-o-projeto">Sobre o projeto</Link>
            <Link to="/suas-doacoes">Minhas doacoes</Link>
          </section>

          <section className="site-footer__column site-footer__contact" aria-label="Fale conosco">
            <h3>Fale conosco</h3>
            <p><FaMapMarkerAlt aria-hidden="true" /> Campo Grande/MS</p>
            <p><FaPhoneAlt aria-hidden="true" /> Combine entregas diretamente com a unidade CAPS</p>
            <p><FaEnvelope aria-hidden="true" /> Use a pagina da unidade para contato e orientacoes</p>
          </section>
        </div>

        <div className="site-footer__bottom">
          <span>Secretaria Municipal de Saude de Campo Grande/MS</span>
          <span>Doacoes em itens. O site nao recebe dinheiro.</span>
        </div>
      </footer>
    </>
  )
}
