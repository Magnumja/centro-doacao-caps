// Pequeno helper para chamadas à API do backend.
const BASE = (import.meta as any).env?.VITE_API_URL ?? ''

async function handleRes(res: Response) {
  const text = await res.text()

  let parsed: any = null
  try {
    parsed = JSON.parse(text || '{}')
  } catch {
    parsed = null
  }

  if (!res.ok) {
    const message =
      (parsed && typeof parsed.error === 'string' && parsed.error) ||
      text ||
      res.statusText
    throw new Error(message)
  }

  return parsed ?? text
}

export async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include' })
  return handleRes(res)
}

export async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleRes(res)
}

export async function del(path: string) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', credentials: 'include' })
  return handleRes(res)
}

export default { get, post, del }
