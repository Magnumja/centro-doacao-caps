export type DonorIntention = {
  id: string
  unitSlug: string
  unitName: string
  items: Array<{
    name: string
    quantity: string
  }>
  donationDate: string
  donationTime: string
  isAnonymous: boolean
  donorName?: string
  donorEmail?: string
  createdAt: string
}

const STORAGE_KEY = 'donorIntentions'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function listDonorIntentions(): DonorIntention[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDonorIntention(input: Omit<DonorIntention, 'id' | 'createdAt'>): DonorIntention {
  const intention: DonorIntention = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
  }

  if (typeof window === 'undefined') {
    return intention
  }

  const current = listDonorIntentions()
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([intention, ...current]))

  return intention
}

export function removeDonorIntention(id: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const next = listDonorIntentions().filter((intention) => intention.id !== id)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
