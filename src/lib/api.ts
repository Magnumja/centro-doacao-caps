// Pequeno helper para chamadas à API do backend.
const BASE = (import.meta as any).env?.VITE_API_URL ?? ''

async function handleRes(res: Response) {
  const text = await res.text()
  try {
    const json = JSON.parse(text || '{}')
    if (!res.ok) throw new Error(json.error || text || res.statusText)
    return json
  } catch {
    if (!res.ok) throw new Error(text || res.statusText)
    return text
  }
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
