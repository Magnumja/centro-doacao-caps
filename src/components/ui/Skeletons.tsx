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

