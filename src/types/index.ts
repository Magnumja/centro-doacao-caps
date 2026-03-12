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
  photo?: string
}

export type Need = {
  id: string
  title: string
  amount: number
  description: string
  unitId: string
  unitName: string
  category: string
  priority: 'alta' | 'media'
}

export type User = {
  id: string
  name: string
  email?: string
}

export type Host = {
  id: string
  name: string
  email: string
  password: string // Em produção, seria hashed
  capId: string // Qual CAPS ele gerencia
  contact: string
  role: 'host' | 'admin'
}

export type Donation = {
  id: string
  capId: string
  category: 'roupa' | 'comida' | 'utensilios'
  quantity: string
  donorName?: string
  donorEmail?: string
  isAnonymous: boolean
  date: string
  time: string
  registeredAt: string // timestamp
}

export type Resident = {
  id: string
  name: string
  capId: string // Qual CAPS ele reside
  capName: string
  emergencyContact: string
  entryDate: string
  status?: 'ativo' | 'egresso'
}

// Nota: este arquivo contém apenas tipos compartilhados.
