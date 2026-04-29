/**
 * Calcula o número de cards a exibir por view baseado na largura da janela
 * @returns Número de cards por view (1, 2 ou 3)
 */
export function getCardsPerView(): number {
  if (typeof window === 'undefined') return 1
  if (window.innerWidth >= 1180) return 3
  if (window.innerWidth >= 820) return 2
  return 1
}
