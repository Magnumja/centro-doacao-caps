import api from '../lib/api'
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

export function mapApiUnitToCap(unit: ApiUnit, resolvePhoto?: (photo?: string) => string | undefined): Cap {
  return {
    id: unit.slug ?? unit.id,
    title: unit.title,
    unitType: unit.unitType === 'RESIDENCIA_TERAPEUTICA' ? 'Residência Terapêutica' : unit.unitType,
    address: unit.address,
    contact: unit.contact,
    description: unit.description,
    capacity: unit.capacity,
    privacyNote: unit.privacyNote,
    lat: unit.lat,
    lng: unit.lng,
    photo: resolvePhoto ? resolvePhoto(unit.photo) : unit.photo,
  }
}

export async function fetchUnits(resolvePhoto?: (photo?: string) => string | undefined): Promise<Cap[]> {
  const units = await api.get<ApiUnit[]>('/api/units')
  return Array.isArray(units) ? units.map((u) => mapApiUnitToCap(u, resolvePhoto)) : []
}
