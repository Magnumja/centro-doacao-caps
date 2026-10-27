import api from '../lib/api'

export type DonorAccount = {
  id: string
  name: string
  email: string
}

export type DonorDonation = {
  id: string
  unit: { slug: string, title: string }
  date: string
  time: string
  isAnonymous: boolean
  registeredAt: string
  items: Array<{ label: string, quantity: string }>
}

export function registerDonor(input: { name: string, email: string, password: string }): Promise<DonorAccount> {
  return api.post<DonorAccount>('/api/donors/register', input)
}

export function loginDonor(input: { email: string, password: string }): Promise<DonorAccount> {
  return api.post<DonorAccount>('/api/donors/login', input)
}

export async function logoutDonor(): Promise<void> {
  await api.post('/api/donors/logout', {})
}

export function fetchDonorAccount(): Promise<DonorAccount> {
  return api.get<DonorAccount>('/api/donors/me')
}

export function fetchDonorDonations(): Promise<DonorDonation[]> {
  return api.get<DonorDonation[]>('/api/donors/me/donations')
}
