import React from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useTheme } from '../../theme/ThemeProvider'
import { trackEvent } from '../../services/telemetry-service'

export default function ThemeToggle(): React.ReactElement {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const Icon = isDark ? FaMoon : FaSun

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => {
        toggleTheme()
        void trackEvent({ eventName: 'theme_toggle', category: 'theme', metadata: { from: theme } })
      }}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema escuro ativo' : 'Tema claro ativo'}
    >
      <Icon aria-hidden="true" focusable="false" />
      <span>{isDark ? 'Escuro' : 'Claro'}</span>
    </button>
  )
}
