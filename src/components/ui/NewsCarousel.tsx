import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HighlightItem } from '../../data/highlights'
import { trackEvent } from '../../services/telemetry-service'

type Props = {
  items: HighlightItem[]
  autoPlayMs?: number
}

export default function NewsCarousel({ items, autoPlayMs = 5500 }: Props): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const total = items.length

  useEffect(() => {
    if (total <= 1 || isPaused || document.hidden) {
      return
    }

    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const ratio = Math.min(1, elapsed / autoPlayMs)
      setProgress(ratio)

      if (ratio >= 1) {
        setActiveIndex((current) => (current + 1) % total)
        setProgress(0)
      }
    }, 80)

    return () => {
      window.clearInterval(timer)
    }
  }, [activeIndex, autoPlayMs, isPaused, total])

  const activeItem = useMemo(() => items[activeIndex], [activeIndex, items])

  useEffect(() => {
    if (!activeItem) return

    void trackEvent({
      eventName: 'carousel_slide_view',
      category: 'carousel',
      value: activeIndex + 1,
      metadata: { highlightId: activeItem.id, title: activeItem.title },
    })
  }, [activeIndex, activeItem])

  const goTo = (index: number) => {
    setActiveIndex(index)
    setProgress(0)
  }

  const goPrev = () => goTo((activeIndex - 1 + total) % total)
  const goNext = () => goTo((activeIndex + 1) % total)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrev()
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    }
  }

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current == null) {
      return
    }

    const deltaX = event.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) < 45) {
      return
    }

    if (deltaX > 0) {
      goPrev()
    } else {
      goNext()
    }

    touchStartX.current = null
  }

  if (items.length === 0) {
    return <p className="home-urgent-empty">Nenhum destaque disponível no momento.</p>
  }

  return (
    <section
      className="news-carousel"
      aria-roledescription="carousel"
      aria-label="Notícias e destaques"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <p className="sr-only" aria-live="polite">
        Slide {activeIndex + 1} de {total}: {activeItem.title}
      </p>

      <div className="news-carousel__progress-track" aria-hidden="true">
        <span className="news-carousel__progress-value" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <article className="news-carousel__slide">
        <img
          src={activeItem.image}
          alt={activeItem.title}
          className="news-carousel__image"
          loading="lazy"
          decoding="async"
        />

        <div className="news-carousel__content">
          <span className="home-card-tag">Destaque</span>
          <h3>{activeItem.title}</h3>
          <p>{activeItem.description}</p>
          <Link className="home-urgent-link" to={activeItem.ctaLink}>{activeItem.ctaLabel}</Link>
        </div>
      </article>

      <div className="news-carousel__controls">
        <button type="button" onClick={goPrev} aria-label="Ver destaque anterior">◀</button>
        <div className="news-carousel__dots" role="tablist" aria-label="Selecionar destaque">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`Ir para destaque ${index + 1}`}
              className={`news-carousel__dot${activeIndex === index ? ' is-active' : ''}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        <button type="button" onClick={goNext} aria-label="Ver próximo destaque">▶</button>
      </div>
    </section>
  )
}
