import { Need } from '../types'

// Caminhos centralizados: se uma rota mudar, muda só aqui.
export function getUnitPath(unitId: string): string {
  return `/caps/${encodeURIComponent(unitId)}`
}

// Abre a unidade do pedido já com o item preenchido no formulário de doação.
export function getNeedDonationPath(need: Pick<Need, 'id' | 'unitId'>): string {
  return `${getUnitPath(need.unitId)}?pedido=${encodeURIComponent(need.id)}`
}

// Tela de entrada/cadastro do doador; `voltar` leva a pessoa de volta ao que estava fazendo.
export function getDonorAccessPath(returnTo?: string, mode: 'entrar' | 'criar' = 'entrar'): string {
  const params = new URLSearchParams({ modo: mode })
  if (returnTo) params.set('voltar', returnTo)
  return `/entrar?${params.toString()}`
}
