import { useMemo, useState } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

function CompareSlider({
  beforeSrc,
  afterSrc,
  alt,
}: {
  beforeSrc: string
  afterSrc: string
  alt: string
}) {
  const [value, setValue] = useState(50)
  const pct = Math.min(95, Math.max(5, value))

  const clip = useMemo(() => `inset(0 ${100 - pct}% 0 0)`, [pct])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-dark/40">
      <img
        src={afterSrc}
        alt={alt}
        className="block aspect-[16/9] w-full object-cover"
        loading="lazy"
      />
      <img
        src={beforeSrc}
        alt={alt}
        className="absolute inset-0 block h-full w-full object-cover"
        style={{ clipPath: clip }}
        loading="lazy"
      />

      <div
        className="pointer-events-none absolute inset-y-0"
        style={{ left: `${pct}%`, transform: 'translateX(-1px)' }}
        aria-hidden
      >
        <div className="h-full w-[2px] bg-white/70 shadow-[0_0_20px_rgba(255,255,255,0.25)]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-dark/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
          ◀▶
        </div>
      </div>

      <div className="absolute left-4 top-4 flex gap-2">
        <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
          Avant (EN)
        </span>
        <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          Après (FR)
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="absolute inset-x-0 bottom-3 mx-auto w-[92%] accent-secondary"
        aria-label="Comparer avant/après"
      />
    </div>
  )
}

export default function BeforeAfterSection() {
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 bg-dark/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Voyez la différence</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
            Vos mods, enfin en français
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <CompareSlider
            beforeSrc="/screenshots/before-1.png"
            afterSrc="/screenshots/after-1.png"
            alt="Comparaison avant après (1)"
          />
          <CompareSlider
            beforeSrc="/screenshots/before-2.png"
            afterSrc="/screenshots/after-2.png"
            alt="Comparaison avant après (2)"
          />
        </div>
      </div>
    </section>
  )
}

