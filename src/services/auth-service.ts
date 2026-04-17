import api from '../lib/api'
import { DashboardHost } from '../types/dashboard'

export type AuthHost = DashboardHost

const LOCAL_DEMO_HOST: AuthHost = {
  id: 'local-dev-admin',
  name: 'Administrador local',
  email: 'local@localhost',
  password: '',
  capId: 'c1',
  contact: '',
  role: 'admin',
  unitId: 'local-unit-c1',
}

export function getLocalDemoHost(): AuthHost {
  return { ...LOCAL_DEMO_HOST }
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  await api.post('/api/auth/login', { email, password })
}

export async function fetchCurrentHost(): Promise<AuthHost> {
  return api.get<AuthHost>('/api/auth/me')
}

export async function logoutHost(): Promise<void> {
  await api.post('/api/auth/logout', {})
}
