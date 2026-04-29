import React from 'react'
import { DonationCategoryName } from '../types'

type CategoryFilterProps = {
  categories: DonationCategoryName[]
  activeCategory: DonationCategoryName | 'Todas'
  onChange: (category: DonationCategoryName | 'Todas') => void
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onChange,
}: CategoryFilterProps): React.ReactElement {
  return (
    <div className="category-filter" role="tablist" aria-label="Filtrar pedidos por categoria">
      {(['Todas', ...categories] as Array<DonationCategoryName | 'Todas'>).map((category) => (
        <button
          key={category}
          type="button"
          role="tab"
          aria-selected={activeCategory === category}
          className={`category-filter__button${activeCategory === category ? ' category-filter__button--active' : ''}`}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
