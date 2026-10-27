import { Cap, Need, ProjectStats } from '../types'

function countBy(values: string[]): Array<{ category: string, total: number }> {
  const totals = values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1
    return accumulator
  }, {})

  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

export function isUrgent(need: Need): boolean {
  return need.priority === 'alta' || need.urgency === 'Urgente'
}

export function isOpen(need: Need): boolean {
  return need.status !== 'Concluido'
}

// Indicadores calculados a partir dos dados carregados (API ou fallback local),
// para que a home e o painel nunca mostrem números fixos desatualizados.
export function buildProjectStats(units: Cap[], needs: Need[], registeredDonations = 0): ProjectStats {
  const openNeeds = needs.filter(isOpen)

  return {
    capsCount: units.filter((unit) => unit.unitType === 'CAPS').length,
    activeRequests: openNeeds.length,
    completedRequests: needs.length - openNeeds.length,
    registeredDonations,
    urgentRequests: openNeeds.filter(isUrgent).length,
    topCategories: countBy(openNeeds.map((need) => String(need.category))),
    topCapsDemands: units
      .map((unit) => ({
        unitId: unit.id,
        unitName: unit.title,
        total: openNeeds.filter((need) => need.unitId === unit.id).length,
      }))
      .filter((unit) => unit.total > 0)
      .sort((a, b) => b.total - a.total),
  }
}
