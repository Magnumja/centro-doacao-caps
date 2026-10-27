// Chave única do perfil do gestor guardado no navegador (o token fica em cookie httpOnly).
const LOGGED_HOST_KEY = 'loggedHost'

export function hasStoredHostSession(): boolean {
  try {
    return Boolean(window.localStorage.getItem(LOGGED_HOST_KEY))
  } catch {
    return false
  }
}

export function storeHostSession(host: unknown): void {
  try {
    window.localStorage.setItem(LOGGED_HOST_KEY, JSON.stringify(host))
  } catch {
    // Navegação privada pode bloquear o storage; o login segue funcionando pelo cookie.
  }
}

export function clearHostSession(): void {
  try {
    window.localStorage.removeItem(LOGGED_HOST_KEY)
  } catch {
    // Sem storage disponível não há o que limpar.
  }
}
