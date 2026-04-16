const BASE = (import.meta as any).env?.VITE_API_URL ?? ''

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

async function handleRes<T>(res: Response): Promise<T> {
  const text = await res.text()

  let parsed: any = null
  try {
    parsed = JSON.parse(text || '{}')
  } catch {
    parsed = null
  }

  if (!res.ok) {
    const message = (parsed && typeof parsed.error === 'string' && parsed.error) || text || res.statusText
    throw new ApiError(message, res.status, parsed?.details)
  }

  return (parsed ?? text) as T
}

export async function get<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include' })
  return handleRes<T>(res)
}

export async function post<T = any>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleRes<T>(res)
}

export async function del<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', credentials: 'include' })
  return handleRes<T>(res)
}

export default { get, post, del }
