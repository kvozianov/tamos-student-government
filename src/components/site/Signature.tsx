'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import { svgPathLength, type SignatureShape } from '@/lib/signature'
import { DEFAULT_SIGNATURE } from '@/lib/signature-default'

type Props = {
  shape?: SignatureShape | null
  className?: string
  delay?: number
  duration?: number
  /** Толщина линии в единицах viewBox, если в самом SVG она не указана. */
  strokeWidth?: number
  label?: string
  /** mount — рисуется сразу при загрузке страницы, view — когда подпись появляется в окне. */
  trigger?: 'mount' | 'view'
  /** Если подписи нет в CMS: true — показать подпись президента по умолчанию, false — ничего не показывать. */
  fallback?: boolean
}

/**
 * Анимированная подпись на SVG. Отрисовка сделана на CSS (stroke-dashoffset по реальной длине каждого штриха), поэтому подпись
 * видна и анимируется даже до загрузки JavaScript; JS нужен только чтобы дождаться прокрутки.
 */
export function Signature({ shape, className, delay = 0.5, duration = 2.6, strokeWidth, label = 'Подпись президента', trigger = 'mount', fallback = true }: Props) {
  const sig = shape ?? (fallback ? DEFAULT_SIGNATURE : null)
  const vbWidth = Number(sig?.viewBox.split(/[\s,]+/)[2]) || 560
  // толщина по умолчанию — 0,45% ширины подписи, если в SVG она не задана
  const fallbackWidth = strokeWidth ?? vbWidth * 0.0045
  const ref = useRef<SVGSVGElement>(null)
  const [waiting, setWaiting] = useState(trigger === 'view')

  useEffect(() => {
    if (trigger !== 'view' || !ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setWaiting(false)
          io.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [trigger])

  // Скорость пера постоянная: время на штрих пропорционально его реальной длине.
  if (!sig) return null
  const lengths = sig.paths.map((p) => Math.max(1, svgPathLength(p.d)))
  const weights = lengths.map((l) => Math.max(l, vbWidth * 0.02))
  const total = weights.reduce((a, b) => a + b, 0)
  const durations = weights.map((w) => (w / total) * duration)
  // Следующий штрих начинается чуть раньше конца предыдущего, как при живом росчерке.
  const starts = durations.map((_, i) => durations.slice(0, i).reduce((acc, d) => acc + d * 0.92, delay))

  return (
    <svg ref={ref} viewBox={sig.viewBox} className={clsx(className, waiting && 'sig-wait')} role="img" aria-label={label} fill="none">
      {sig.paths.map((p, i) => {
        const d = durations[i]
        // запас 2% и 2 единицы, чтобы округления браузера не обрезали конец штриха
        const dash = (lengths[i] * 1.02 + 2).toFixed(1)
        const style = { '--sig-d': `${d.toFixed(2)}s`, '--sig-delay': `${starts[i].toFixed(2)}s`, '--sig-dash': dash } as React.CSSProperties
        return p.filled ? (
          <path key={i} d={p.d} className="sig-path" data-filled="" style={style} fill="currentColor" stroke="currentColor" strokeWidth={0.6} />
        ) : (
          <path key={i} d={p.d} className="sig-path" style={style} stroke="currentColor" strokeWidth={p.strokeWidth ?? fallbackWidth} strokeLinecap="round" strokeLinejoin="round" />
        )
      })}
    </svg>
  )
}
