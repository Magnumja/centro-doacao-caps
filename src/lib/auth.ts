function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function isLocalAuthBypassEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const env = (import.meta as any).env
  return env?.VITE_ENABLE_LOCAL_AUTH_BYPASS === 'true' && isLocalHostname(window.location.hostname)
}
