import React from 'react'
import { useTheme } from '../../theme/ThemeProvider'
import { trackEvent } from '../../services/telemetry-service'

export default function ThemeToggle(): React.ReactElement {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => {
        toggleTheme()
        void trackEvent({ eventName: 'theme_toggle', category: 'theme', metadata: { from: theme } })
      }}
      aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={theme === 'dark' ? 'Tema escuro ativo' : 'Tema claro ativo'}
    >
      <span aria-hidden="true">{theme === 'dark' ? '🌙' : '☀️'}</span>
      <span>{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
    </button>
  )
}
