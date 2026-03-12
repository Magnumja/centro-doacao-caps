export type Cap = {
  id: string
  title: string
  unitType: 'CAPS' | 'Residência Terapêutica'
  address: string
  contact?: string
  description?: string
  capacity?: string
  privacyNote?: string
  lat?: number
  lng?: number
}

export type Need = {
  id: string
  title: string
  amount: number
}

export type User = {
  id: string
  name: string
  email?: string
}

// Nota: este arquivo contém apenas tipos compartilhados.
