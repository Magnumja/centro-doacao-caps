const BASE = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const MUTATION_HEADERS = {
  'Content-Type': 'application/json',
  'X-CSRF-Protection': '1',
}

// Mensagem exibida quando o navegador nem consegue falar com a API (offline, CORS, servidor fora do ar).
export const NETWORK_ERROR_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Extrai uma mensagem amigável de qualquer erro lançado (ApiError, Error ou valor desconhecido).
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { credentials: 'include', ...init })
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0)
  }

  const text = await res.text()
  let parsed: unknown = null
  try {
    parsed = JSON.parse(text || '{}')
  } catch {
    parsed = null
  }

  if (!res.ok) {
    const body = (parsed ?? {}) as { error?: unknown, details?: unknown }
    // Respostas de proxy (502/504) chegam como HTML: não mostramos isso ao usuário.
    const message = typeof body.error === 'string' && body.error
      ? body.error
      : res.status >= 500 ? NETWORK_ERROR_MESSAGE : res.statusText || 'Erro inesperado.'
    throw new ApiError(message, res.status, body.details)
  }

  return (parsed ?? text) as T
}

export function get<T = unknown>(path: string): Promise<T> {
  return request<T>(path)
}

export function post<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', headers: MUTATION_HEADERS, body: JSON.stringify(body) })
}

export function del<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE', headers: { 'X-CSRF-Protection': '1' } })
}

export default { get, post, del }
