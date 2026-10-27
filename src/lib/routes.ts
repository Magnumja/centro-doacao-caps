import { Need } from '../types'

// Caminhos centralizados: se uma rota mudar, muda só aqui.
export function getUnitPath(unitId: string): string {
  return `/caps/${encodeURIComponent(unitId)}`
}

// Abre a unidade do pedido já com o item preenchido no formulário de doação.
export function getNeedDonationPath(need: Pick<Need, 'id' | 'unitId'>): string {
  return `${getUnitPath(need.unitId)}?pedido=${encodeURIComponent(need.id)}`
}
