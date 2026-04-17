import React from 'react'

export function UrgentCarouselSkeleton(): React.ReactElement {
  return (
    <div className="home-carousel home-carousel--skeleton" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <article key={index} className="home-urgent-card skeleton-card">
          <div className="skeleton-line w-40" />
          <div className="skeleton-line w-80" />
          <div className="skeleton-line w-100" />
          <div className="skeleton-line w-60" />
        </article>
      ))}
    </div>
  )
}

export function NeedListSkeleton(): React.ReactElement {
  return (
    <div className="home-needs-grid" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <article key={index} className="home-need-feed-card skeleton-card">
          <div className="skeleton-line w-30" />
          <div className="skeleton-line w-70" />
          <div className="skeleton-line w-100" />
          <div className="skeleton-line w-50" />
        </article>
      ))}
    </div>
  )
}
