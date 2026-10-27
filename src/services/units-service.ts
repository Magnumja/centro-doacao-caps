import api from '../lib/api'
import { caps as localUnits } from '../data/mockData'
import { Cap } from '../types'

export type ApiUnit = {
  id: string
  slug: string
  title: string
  unitType: 'CAPS' | 'RESIDENCIA_TERAPEUTICA'
  address?: string
  contact?: string
  description?: string
  capacity?: string
  privacyNote?: string
  lat?: number
  lng?: number
  photo?: string
}

// A API ainda não guarda WhatsApp, horário e resumo de necessidades: completamos com o
// catálogo local (src/data/mockData.ts) usando o slug como chave.
export function mapApiUnitToCap(unit: ApiUnit): Cap {
  const id = unit.slug ?? unit.id
  const local = localUnits.find((candidate) => candidate.id === id)

  return {
    ...local,
    id,
    title: unit.title,
    unitType: unit.unitType === 'RESIDENCIA_TERAPEUTICA' ? 'Residência Terapêutica' : 'CAPS',
    address: unit.address ?? local?.address ?? 'Endereço não informado',
    contact: unit.contact ?? local?.contact,
    description: unit.description ?? local?.description,
    capacity: unit.capacity,
    privacyNote: unit.privacyNote,
    lat: unit.lat ?? local?.lat,
    lng: unit.lng ?? local?.lng,
    photo: local?.photo ?? unit.photo,
  }
}

export async function fetchUnits(): Promise<Cap[]> {
  const units = await api.get<ApiUnit[]>('/api/units')
  return Array.isArray(units) ? units.map(mapApiUnitToCap) : []
}

// Lista pública: usa a API e cai para o catálogo local se ela estiver vazia ou fora do ar.
export async function fetchPublicUnits(): Promise<Cap[]> {
  try {
    const units = await fetchUnits()
    return units.length > 0 ? units : localUnits
  } catch {
    return localUnits
  }
}
