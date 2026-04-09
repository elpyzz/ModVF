import { useEffect, useMemo, useRef, useState } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

function useCountUp(target: number, isActive: boolean, durationMs = 900) {
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!isActive || startedRef.current) return
    startedRef.current = true

    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [isActive, target, durationMs])

  return value
}

export default function LiveCounterSection() {
  const sectionRef = useScrollReveal()
  const counterRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = counterRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true)
      },
      { threshold: 0.25 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const translations = useCountUp(500, active, 900)

  const stats = useMemo(
    () => [
      { value: `${translations}+`, label: 'traductions réalisées' },
      { value: '300 000+', label: 'lignes en cache' },
      { value: '6', label: 'modpacks majeurs testés' },
    ],
    [translations],
  )

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 bg-gradient-to-b from-dark/30 to-dark py-16 sm:py-20">
      <div ref={counterRef} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-surface/70 p-6 backdrop-blur sm:grid-cols-3 sm:p-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-secondary sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

