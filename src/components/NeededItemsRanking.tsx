import React from 'react'

type RankingItem = {
  item: string
  total: number
  category: string
  unitName: string
}

type NeededItemsRankingProps = {
  items: RankingItem[]
}

export default function NeededItemsRanking({ items }: NeededItemsRankingProps): React.ReactElement {
  return (
    <section className="page-block needed-ranking-section">
      <div className="section-heading">
        <span className="page-kicker">Itens mais necessarios</span>
        <h2>Ranking simples dos pedidos com maior volume no momento.</h2>
      </div>

      <ol className="needed-ranking-list">
        {items.map((item, index) => (
          <li key={`${item.item}-${item.unitName}`}>
            <span className="needed-ranking-list__position">{index + 1}</span>
            <div>
              <strong>{item.item}</strong>
              <p>{item.category} - {item.unitName}</p>
            </div>
            <span className="needed-ranking-list__amount">{item.total}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
