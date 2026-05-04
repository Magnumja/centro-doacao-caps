import { Host, Need } from './index'

export type NeedCardItem = {
  id: string
  title: string
  amount: number
  description: string
  priority: Need['priority']
  category: string
  unitId: string
}

export type DashboardDonation = {
  id: string
  category: 'roupa' | 'comida' | 'utensilios'
  quantity: string
  donorName?: string | null
  donorEmail?: string | null
  isAnonymous: boolean
  date: string
  time: string
  registeredAt: string
}

export type DashboardResident = {
  id: string
  name: string
  emergencyContact?: string | null
  entryDate: string
  status: 'ativo' | 'inativo' | 'transferido'
}

export type DashboardHost = Host & { unitId: string }
