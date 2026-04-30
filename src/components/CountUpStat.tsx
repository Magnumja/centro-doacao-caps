import React, { useEffect, useRef, useState } from 'react'

type CountUpStatProps = {
  value: number
  className?: string
  durationMs?: number
}

export default function CountUpStat({
  value,
  className,
  durationMs = 900,
}: CountUpStatProps): React.ReactElement {
  const [displayValue, setDisplayValue] = useState(0)
  const elementRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    let animationFrame = 0
    let startTime = 0
    let hasStarted = false

    const startAnimation = (): void => {
      if (hasStarted) return
      hasStarted = true

      const tick = (timestamp: number): void => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / durationMs, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.round(value * eased))

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick)
        }
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation()
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    } else {
      startAnimation()
    }

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(animationFrame)
    }
  }, [durationMs, value])

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  )
}
