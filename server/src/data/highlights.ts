export type HighlightItem = {
  id: string
  title: string
  description: string
  image: string
  ctaLabel: string
  ctaLink: string
}

export const highlights: HighlightItem[] = [
  {
    id: 'h1',
    title: 'Mutirão Solidário da Rede CAPS',
    description: 'Participe da campanha de arrecadação de roupas e itens de higiene para unidades com demanda crítica nesta semana.',
    image: '/logosesau.png',
    ctaLabel: 'Quero ajudar',
    ctaLink: '/caps',
  },
  {
    id: 'h2',
    title: 'Oficinas Terapêuticas em Expansão',
    description: 'Novos grupos de artes e culinária social precisam de utensílios para ampliar o atendimento humanizado.',
    image: '/logosesau.png',
    ctaLabel: 'Ver necessidades',
    ctaLink: '/donate',
  },
  {
    id: 'h3',
    title: 'Rede Territorial Integrada',
    description: 'Mapeie unidades próximas, contatos e horários para direcionar doações com maior efetividade.',
    image: '/logosesau.png',
    ctaLabel: 'Explorar mapa',
    ctaLink: '/caps',
  },
]
